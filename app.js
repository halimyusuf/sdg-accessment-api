const express = require("express");
const fs = require("fs");
const createError = require("http-errors");
const app = express();
const morgan = require("morgan");
const path = require("path");
const covid19ImpactEstimator = require("./estimator");

const covidData = [];

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, "logs.txt"), {
  flags: "a",
});

// setup the logger
app.use(
  morgan(":method     :url    :status     :response-time ms", {
    stream: accessLogStream,
  })
);

app.use(express.json());

app.post("/api/v1/on-covid-19", (req, res) => {
  let data = covid19ImpactEstimator(req.body);
  covidData.push(data);
  res.json(data);
});

app.get("/api/v1/on-covid-19/json", function (req, res, next) {
  if (covidData.length > 0) {
    res.json(covidData[0]);
  } else {
    res.json({});
  }
});

app.get("/api/v1/on-covid-19/xml", function (req, res, next) {
  if (covidData.length > 0) {
    res.type("application/xml").send(covidData[0]);
  } else {
    res.type("application/xml").send({});
  }
});

app.get("/api/v1/on-covid-19/logs", function (req, res, next) {
  fs.readFile("logs.txt", "utf8", (err, data) => {
    res.send(data);
  });
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  return next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: "error",
    message: err.message,
  });
});

const port = 3000;
app.listen(port);
