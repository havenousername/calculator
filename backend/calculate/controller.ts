import {  Request } from "express";
import state from "./db";
import calculateService from "./service";
import {SpecialStates} from "../../types/types";

const appFxStates = calculateService();
state.fx = appFxStates.initState;
state.prevFx = appFxStates.initState;

export const postCalculation = (req: Request) => {
  const { nextCharacter, prevCharacter } = req.body;
  if (prevCharacter) {
    appFxStates.goBack(state, prevCharacter);
  } else if (nextCharacter === SpecialStates.ZERO) {
    state.fx = appFxStates.initState;
    state.prevFx = appFxStates.initState;
  } else if (!state.error) {
    state.incomingInput = nextCharacter;
    state.fx(state);
  }

  return state;
};