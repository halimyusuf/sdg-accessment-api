/* eslint-disable no-param-reassign */
// prettier-ignore

const timeInDays = (periodType, timeToElapse) => {
  if (periodType === 'months') {
    timeToElapse *= 30;
  } else if (periodType === 'weeks') {
    timeToElapse *= 7;
  }
  return timeToElapse;
};

const infectedAtTime = (currentlyInfected, timeToElapse) => {
  const factorDoubles = 2 ** Math.floor(timeToElapse / 3);
  return currentlyInfected * factorDoubles;
};

const estimatorHelper = (data, val) => {
  const timeToElapse = timeInDays(data.periodType, data.timeToElapse);
  const infected = data.reportedCases * val;
  const infectionsByRequestedTime = infectedAtTime(infected, timeToElapse);
  const severeCasesByRequestedTime = Math.floor(
    0.15 * infectionsByRequestedTime
  );
  const beds = data.totalHospitalBeds * 0.35 - severeCasesByRequestedTime;
  // prettier-ignore
  const hospitalBedsByRequestedTime = beds > 0 ? Math.floor(beds) : Math.ceil(beds);

  const casesForICUByRequestedTime = Math.floor(
    infectionsByRequestedTime * 0.05
  );

  const casesForVentilatorsByRequestedTime = Math.floor(
    infectionsByRequestedTime * 0.02
  );

  // prettier-ignore
  const dollarsInFlight = Math.floor((infectionsByRequestedTime
    * data.region.avgDailyIncomeInUSD
    * data.region.avgDailyIncomePopulation)
    / timeToElapse);
  return {
    currentlyInfected: infected,
    infectionsByRequestedTime,
    severeCasesByRequestedTime,
    hospitalBedsByRequestedTime,
    casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime,
    dollarsInFlight,
  };
};

const covid19ImpactEstimator = (data) => ({
  data,
  impact: estimatorHelper(data, 10),
  severeImpact: estimatorHelper(data, 50),
});

module.exports = covid19ImpactEstimator;
