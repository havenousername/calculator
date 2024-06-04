import {operators, SpecialStates} from "../../../types/types.ts";
import {BackspaceIcon} from "@heroicons/react/24/outline";
import {useEffect, useState} from "react";
import {postCalculation} from "../api/postCalculation.ts";

const AppCalculator = () => {
  const [result, setResult] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);

  const onButtonClick = async (char: string) => {
    const calculation = await postCalculation(char, char === SpecialStates.BACK ? sequence.at(-1) ?? '0' : undefined);
    if (char === SpecialStates.BACK) {
      setSequence((seq) => seq.slice(0, -1));
    } else if (char == SpecialStates.RESULT) {
      setSequence([calculation.result.toString()]);
    } else if (char == SpecialStates.ZERO) {
      setSequence([]);
    } else {
      setSequence(seq => [...seq, calculation.incomingInput]);
    }
    console.log(calculation.result);
    setResult(calculation.result);
    setHasError(calculation.error);
  }

  useEffect(() => {
    postCalculation(SpecialStates.ZERO);
  }, []);

  const operatorsContent = operators.map(operator => (
    <button
      key={operator}
      className={'flex-1 bg-[#FF8660] rounded-2xl border border-solid border-[#62626D] flex justify-center items-center cursor-pointer'}
      onClick={() => onButtonClick(operator)}
      disabled={hasError}
    >
      <span className='text-4xl leading-3'>{ operator }</span>
    </button>
  ));

  const numbersContent = Array.from({ length: 9 })
    .fill(0)
    .map((_, idx) => idx + 1)
    .map((idx, _, arr) => arr.at(-idx))
    .map(number => (
      <button key={number}
          className={'bg-[#FFFFFF] rounded-full border border-solid border-[#62626D] w-[110px] h-[110px] flex justify-center items-center cursor-pointer'}
          onClick={() => onButtonClick(String(number))}
          disabled={hasError}
      >
        <span className='text-4xl leading-3 text-[#00080F]'>{number}</span>
      </button>
    ));

  const sequenceContent = sequence.map((element, key) => (
    <span key={key}>{element}</span>
  ));

  const backspaceContent = (
    <button
      className='col-span-2 bg-[#00111F] border border-solid border-[#ACA3A3] rounded-2xl
      flex justify-center items-center gap-2 cursor-pointer'
      disabled={!hasError}
      onClick={() => onButtonClick(SpecialStates.BACK)}
    >
      <BackspaceIcon className='w-[2.5rem]'/>
      <h3 className='text-3xl'>Backspace</h3>
    </button>
  );

  return (
    <div className='grid grid-cols-4 grid-rows-6 gap-6 w-full px-4'>
      <div
        className='h-[120px] col-span-4 bg-[#00080F] rounded-xl border border-solid border-[#62626D] flex flex-col justify-end items-end p-4'>
        <p className='text-xl opacity-80'>{ sequenceContent }</p>
        <h4 className='text-3xl font-medium'>Result: {result}</h4>
      </div>
      <div className='col-span-3 grid grid-cols-3'>
        {backspaceContent}
      </div>
      <div className={'col-span-1 row-span-4 flex flex-col gap-8'}>
        {operatorsContent}
      </div>
      <div className={'col-span-3 row-span-3 grid grid-cols-3 grid-rows-3 gap-2 justify-center items-center'}>
        {numbersContent}
      </div>
      <button
        className={'col-span-2 bg-[#FFF] rounded-[7.5rem] flex justify-center items-center cursor-pointer'}
        disabled={hasError}
        onClick={() => onButtonClick('0')}
      >
        <span className='text-4xl leading-3 text-[#00080F]'>0</span>
      </button>
      <button
        className={'col-span-2 bg-[#FF8660] rounded-3xl flex justify-center items-center cursor-pointer'}
        disabled={hasError}
        onClick={() => onButtonClick(SpecialStates.RESULT)}
      >
        <span className='text-6xl leading-3'>{'='}</span>
      </button>
    </div>
  )
};


export default AppCalculator;