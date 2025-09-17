const pg = require("../utils/lib/pg");

const addMotorRuntimeHour = async (
  motorId,
  totalHour,
  hour,
  day,
  collectedAt
) => {
  if (!motorId) {
    throw new Error(
      "motorId id is required for creating new motor runtime hour"
    );
  }
  return pg.addMotorRuntimeHour(motorId, totalHour, hour, day, collectedAt);
};

const addMotorRuntimeDay = async (motorId, totalDay, day, collectedAt) => {
  if (!motorId) {
    throw new Error(
      "motorId id is required for creating new motor runtime day"
    );
  }
  return pg.addMotorRuntimeDay(motorId, totalDay, day, collectedAt);
};

module.exports = {
  addMotorRuntimeHour,
  addMotorRuntimeDay
};
