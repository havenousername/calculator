import {Operator, SpecialStates, State} from "../../types/types";
import {binaryOperations, isBinary, isDigit, isOperator, isUnary, unaryOperations} from "./utils";

/**
 *
 * Service which internally implements state machine of the calculation
 */
const calculateService = () => {
  /**
   * Initial state which handles the entrance to the program
   * Gets and stores first character
   * @param state
   */
  function initState (state: State) {
    if (isDigit(state.incomingInput)) {
      state.fx = pushAfterFirstNumber;
      state.numbers[0] = state.incomingInput;
      state.result = +state.numbers[0];
      state.error = false;
    } else if (isBinary(state.incomingInput)) {
      state.error = true;
    } else if (isUnary(state.incomingInput)) {
      state.fx = pushOpUnary;
      state.operation = unaryOperations[state.incomingInput];
    }  else {
      state.error = true;
    }
    state.prevFx = initState;
  }

  /**
   * After user hits error state it can go back one step
   * to restore
   *
   * @param state
   * @param prevCharacter
   */
  function goBack(state: State, prevCharacter: string) {
    if (isOperator(prevCharacter) && !state.error) {
      state.operation = undefined;
      state.fx = pushAfterFirstNumber;
    } else if (isDigit(prevCharacter) && !state.error && state.numbers[1]) {
      state.numbers[1] = state.numbers[1].slice(0, -1);
      state.result = state.operation!(+state.numbers[0], +state.numbers[1]) ?? 0;
      if (state.numbers[1]) {
        state.fx = pushAfterBinaryOp;
      } else {
        state.fx = pushAfterFirstNumber
      }
    } else if (isDigit(prevCharacter) && !state.error) {
      state.numbers[0]= state.numbers[0].slice(0, -1);
      state.result = +state.numbers[0];

      if (state.numbers[0]) {
        state.fx = pushAfterFirstNumber;
      } else {
        state.fx = initState;
      }
    }
    state.error = false;
  }

  /**
   * If first character is operation, goes to this state and
   * handles it
   * @param state
   */
  function pushOpUnary(state: State) {
    if (isDigit(state.incomingInput)) {
      state.numbers[0] = String(state.operation!(+state.incomingInput, +state.incomingInput))
      state.fx = pushAfterFirstNumber;
    } else {
      state.error = true;
    }
    state.prevFx = pushOpUnary;
  }

  /**
   * After first character being a number is passed goes
   * to this state. Waits for binary operator, otherwise
   * continues concatenating the first number
   * @param state
   */
  function pushAfterFirstNumber(state: State) {
    if (isDigit(state.incomingInput)) {
      state.numbers[0] += state.incomingInput;
      state.result = +state.numbers[0];
    } else if (isOperator(state.incomingInput)) {
      state.fx = pushAfterBinaryOp;
      state.operation = binaryOperations[state.incomingInput];
    } else {
      state.error = true;
    }
    state.prevFx = pushAfterFirstNumber;
  }


  /**
   * After all digits for the first number are handled and operator is hit goes to
   * this state. Waits for next digit
   * @param state
   */
  function pushAfterBinaryOp(state: State) {
    if (isDigit(state.incomingInput)) {
      state.numbers[1] = state.incomingInput;
      state.result = state.operation!(+state.numbers[0], +state.numbers[1])
      state.fx = pushAfterBinaryOpNumber;
    } else {
      state.error = true;
    }
    state.prevFx = pushAfterBinaryOp;
  }

  /**
   * Continues pushing to the final second number
   * On result goes back to initial state
   * @param state
   */
  function pushAfterBinaryOpNumber(state: State) {
    if (isDigit(state.incomingInput)) {
      state.numbers[1] += state.incomingInput;
      state.result = state.operation!(+state.numbers[0], +state.numbers[1])
    } else if (isOperator(state.incomingInput) || state.incomingInput === SpecialStates.RESULT) {
      state.numbers[0] = String(state.result);
      state.numbers.pop();
      state.operation = binaryOperations[<Operator>state.incomingInput];

      if (state.incomingInput === SpecialStates.RESULT) {
        state.fx = initState;
      } else {
        state.fx = pushAfterBinaryOp;
      }
    } else {
      state.error = true;
    }

    state.prevFx = pushAfterBinaryOpNumber;
  }

  return {
    initState,
    goBack
  }
};

export default calculateService;