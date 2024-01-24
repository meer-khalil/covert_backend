const State = require("../models/Data/stateModel");
const getState = require("./getState");

async function addStateToList(zipcode) {
  if (zipcode) {
    try {
      let state = getState(zipcode.toString())?.long
      let st = await State.findOne({ name: state })
      if (!st) {
        await State.create({ name: state })
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = addStateToList;