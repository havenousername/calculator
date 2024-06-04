import {State} from "../../types/types";

/**
 * State is the source of truth for the application.
 * Public interface for now
 */
const state: State = {
  /**
   * points to last input from client
   */
  incomingInput: '',
  /**
   * calc operation
   */
  operation: undefined,
  /**
   * two numbers for the binary operation
   */
  numbers: ['' ,''],
  /**
   * precalculated result
   */
  result: 0,
  error: false,
  /**
   *  current state (node) of the program which
   *  handles state transitions
   */
  fx: () => {},
  prevFx: () => {}
};

export default state;