/* Each template must keep producing genuinely different questions.
 *
 * The recurring fault in this bank is INDEX COUPLING: several parameters look
 * independent but are all functions of the same thing, so they turn over
 * together and a template that should give fifty different questions gives
 * eight. geoNetOppositeFace shipped at 24 of 50 because its letter set, both
 * attachment points and the asked face were written as i % 4, (i * 3) % 4 and
 * (i * 5 + 2) % 4 - three separate-looking expressions that move in lockstep.
 *
 * Nothing here says the bank is as varied as it could be. Sixteen templates sit
 * below twelve distinct questions today, and that is a known state rather than a
 * regression, so it is REPORTED and not failed. What is failed is a template
 * that was specifically fixed slipping back.
 */
const { loadApp, createReport, questionKey } = require("./lib/harness");

const app = loadApp();
const report = createReport("VARIETY");

const distinctBy = new Map();
const generatedBy = new Map();
app.maths.forEach(q => {
  if (!distinctBy.has(q.template)) distinctBy.set(q.template, new Set());
  distinctBy.get(q.template).add(questionKey(q));
  generatedBy.set(q.template, (generatedBy.get(q.template) || 0) + 1);
});
const distinct = name => (distinctBy.get(name) || new Set()).size;

/* Floors for templates whose coupling was found and fixed, set just below what
   each actually produces. A drop past one of these means the parameters have
   been tied together again. */
const FLOORS = {
  geoCompassTurnSequence: 18, numSupplyDuration: 21, numExtremeDivisible: 14,
  pctDecreaseToTarget: 42, statMeanOfRemaining: 45, statAboveMean: 30,
  ratRelativeValueChain: 32, statPieDifference: 41, statPieTotalFromPart: 39,
  meaEstimateSize: 14, geoNetOppositeFace: 45, geoNetOppositeSum: 135,
  geoPaintedCube: 27, geoJoinedCubesSurface: 45, geoCircleArea: 43,
  geoCircleCircumference: 39, geoCircleAreaFromCircumference: 45,
  geoCircleInSquare: 21, meaTrapeziumArea: 45, meaAreaFindMissingSide: 45,
  meaImperialConvert: 36, numRoundDecimalPlaces: 45, numRoundSigFigs: 45,
  numEstimateOneSigFig: 45, numFractionToPercent: 36, numLCMShare: 45,
  geoReflectPoint: 37, geoBearing: 28, algExpandBrackets: 45,
  algFactoriseSimple: 31, statCompareDistributions: 119, geoParallelLineAngles: 39,
  statScatterCorrelation: 45, geoTriangleUnique: 43, decMultiStepBill: 45,
  probAtLeastOneOfColour: 43, seqTwoSequencesMeet: 45, countTwoRestrictions: 43,
  pctSuccessiveReverse: 42, decBounceHeight: 40, decDivideGivenFact: 45,
  decReverseMultiply: 45, decPlaceValueChain: 45, probSumToOneUnknown: 43,
  probExpectedReverse: 30, probCompareChances: 44, probThreeIndependent: 31,
  algAgeProblem: 45, algTwoItemElimination: 45, algBalanceWeights: 45,
  bidMissingNumberInChain: 39, bidPowersRootsChain: 38, decBestOfThreePacks: 31,
  decCurrencyCompare: 45, fracThreeMixedChain: 40, fracRecipeScale: 27,
  seqWhichTermEquals: 45, seqGeometricExceeds: 37, numSmallestEvenFromDigits: 21,
  /* Built from questions Milan got wrong, August 2026. */
  numParityResult: 32, geoIsoscelesAngleType: 45, ratCoinValueSplit: 45,
  geoBackElevation: 21,
  /* question-bank/20260824-Onwards: Mock Papers 8 and 10. */
  numDigitCardsDivisible: 20, numEvenFactorCount: 45, decToImproperFraction: 14,
  pctToFraction: 14, pctCompoundGrowth: 44, statSetFromSummary: 45,
  spdDurationRounded: 45,
  /* question-bank/20260831-Onwards: Mock Paper 11 and the September screenshots.
     geoDecisionTreeQuestion shipped at 7 of 50 first time - it picked a pair of
     shapes by index and threw the seed away unless exactly one question
     happened to separate them. Searching for the usable pairs first fixed it. */
  geoRotatePolygon: 32, statModeFromTable: 42, meaSquareAreaToPerimeter: 43,
  geoDecisionTreeQuestion: 45, numFactorsFromList: 36, meaMinimumBlocks: 45,
  numCoinExchange: 45,
  /* The four that lean on a figure. */
  meaReadScale: 34, statTwoSeriesGap: 24, geoLineAt45: 39, meaTriangleSplit: 35
};

report.check("every pinned template still meets its distinct-question floor", () => {
  const missing = Object.keys(FLOORS).filter(name => !generatedBy.has(name));
  if (missing.length) return `these templates no longer generate anything: ${missing.join(", ")}`;
  const slipped = Object.entries(FLOORS)
    .filter(([name, floor]) => distinct(name) < floor)
    .map(([name, floor]) => `${name} ${distinct(name)} < ${floor}`);
  return slipped.length === 0 || slipped.join("; ");
});

report.check("no template collapses to fewer than four distinct questions", () => {
  const collapsed = [...distinctBy.keys()]
    .filter(name => distinct(name) < 4)
    .map(name => `${name} (${distinct(name)})`);
  return collapsed.length === 0 || collapsed.join(", ");
});

report.check("every topic offers at least three Super Hard templates", () => {
  /* At 60% Super Hard a paper wants about 2.4 from each topic. Two templates
     means the same shape three times over with only the numbers changed, which
     is what prompted building the thin topics up. */
  const perTopic = {};
  app.maths.filter(q => q.difficulty === 4).forEach(q => {
    (perTopic[q.topic] = perTopic[q.topic] || new Set()).add(q.template);
  });
  const thin = [...new Set(app.maths.map(q => q.topic))]
    .filter(topic => (perTopic[topic] || new Set()).size < 3)
    .map(topic => `${topic} (${(perTopic[topic] || new Set()).size})`);
  return thin.length === 0 || `too few Super Hard templates: ${thin.join(", ")}`;
});

/* Visible, not fatal: where variety runs out first. */
const thinnest = [...distinctBy.entries()]
  .map(([name, set]) => ({ name, distinct: set.size, generated: generatedBy.get(name) }))
  .sort((a, b) => a.distinct - b.distinct)
  .slice(0, 8);
report.note("thinnest templates (not a failure, just where to look next):");
thinnest.forEach(t => report.note(`   ${t.name.padEnd(28)} ${t.distinct} distinct of ${t.generated}`));

process.exit(report.finish() ? 0 : 1);
