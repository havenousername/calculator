import {State} from "../../../types/types.ts";


export const postCalculation = async (character: string, prevCharacter?: string): Promise<
  Omit<State, 'fx' | 'prevFx'> &
  {stateName: string, operation: string}
> => {
  console.log(character, prevCharacter);
  const current = await fetch('http://localhost:3333/api/calculation', {
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