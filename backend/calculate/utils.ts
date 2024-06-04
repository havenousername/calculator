import {BinaryOperatorFx, Operator, UnaryOperatorFx} from "../../types/types";

export const binaryOperations: BinaryOperatorFx  = {
  '+': (val1: number, val2: number) => val1 + val2,
  '-': (val1: number, val2: number) => val1 - val2,
  '/': (val1: number, val2: number) => val1 / val2,
  '*': (val1: number, val2: number) => val1 * val2,
};

export const unaryOperations: UnaryOperatorFx = {
  '+': (val1: number) => +val1,
  '-': (val1: number) => -val1,
};


export const isDigit = (str: string) => {
  return str.match(/[0-9]/)?.length === 1;
}

export const isBinary = (str: string): str is '+' | '-' => {
  return !!str.match(/^[\/*]$/)
}

export const isUnary = (str: string): str is '/' | '*' => {
  return !!str.match(/^[+-]$/)
}

export const isOperator = (str: string): str is Operator => {
  return isBinary(str) || isUnary(str)
}