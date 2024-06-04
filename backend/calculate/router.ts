import { Router } from "express";
import {
  BinaryOperatorFx,
  Operator,
  SpecialStates,
  State,
  UnaryOperatorFx
} from "../../types/types";

const router = Router();

const binaryOperations: BinaryOperatorFx  = {
  '+': (val1: number, val2: number) => val1 + val2,
  '-': (val1: number, val2: number) => val1 - val2,
  '/': (val1: number, val2: number) => val1 / val2,
  '*': (val1: number, val2: number) => val1 * val2,
};

const inverseBinaryOperations: BinaryOperatorFx  = {
  '+': (val1: number, val2: number) => val1 - val2,
  '-': (val1: number, val2: number) => val1 + val2,
  '/': (val1: number, val2: number) => val1 * val2,
  '*': (val1: number, val2: number) => val1 / val2,
};


const unaryOperations: UnaryOperatorFx = {
  '+': (val1: number) => +val1,
  '-': (val1: number) => -val1,
};

const state: State = {
  incomingInput: '',
  operation: undefined,
  numbers: ['' ,''],
  result: 0,
  error: false,
  fx: () => {},
  prevFx: () => {}
};

const isDigit = (str: string) => {
  return str.match(/[0-9]/)?.length === 1;
}

const isBinary = (str: string): str is '+' | '-' => {
  return !!str.match(/^[\/*]$/)
}

const isUnary = (str: string): str is '/' | '*' => {
  return !!str.match(/^[+-]$/)
}

const isOperator = (str: string): str is Operator => {
  return isBinary(str) || isUnary(str)
}

const stateFx = () => {
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
  function pushOpUnary(state: State) {
    if (isDigit(state.incomingInput)) {
      state.numbers[0] = String(state.operation!(+state.incomingInput, +state.incomingInput))
      state.fx = pushAfterFirstNumber;
    } else {
      state.error = true;
    }
    state.prevFx = pushOpUnary;
  }
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
}

const appFxStates = stateFx();
state.fx = appFxStates.initState;
state.prevFx = appFxStates.initState;

router.post('/calculation', (req, res) => {
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
  res.send({ ...state, stateName: state.fx.name, operation: state.operation?.name });
});


export default router;