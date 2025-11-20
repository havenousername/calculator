 export const operators = ['*', '/', '+', '-'] as const;
export type Operator = typeof operators[number];

type ValueOf<T> = T[keyof T];
type StateFx = (state: State) => void;

export enum SpecialStates {
  RESULT = '=',
  BACK = '<',
  ZERO = 'z'
}

export type BinaryOperatorFx = Record<Operator, (val1: number, val2: number) => number>;
export type UnaryOperatorFx = Partial<Record<Operator, (val: number) => number>>;
export type State = {
  incomingInput: string;
  operation?: ValueOf<BinaryOperatorFx>,
  numbers: [string, string] ,
  result: number,
  error: boolean,
  fx: StateFx;
  prevFx: StateFx;
}


