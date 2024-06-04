import {State} from "../../../types/types.ts";

export type CalculationRes = Omit<State, 'fx' | 'prevFx'> &
  {stateName: string, operation: string};

export const postCalculation = async (character: string, prevCharacter?: string): Promise<CalculationRes> => {
  const current = await fetch(`${import.meta.env.BACKEND_URL}/api/calculation`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nextCharacter: character,
      prevCharacter,
    }),
  });

  return await current.json();
};