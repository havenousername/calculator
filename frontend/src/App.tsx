import AppCalculator from "./components/AppCalculator.tsx";

function App() {
  return (
    <div className='w-full h-screen max-w-screen-md m-auto py-14 flex flex-col items-center gap-10'>
      <h1 className='text-4xl font-bold'>Calculator</h1>
      <AppCalculator />
    </div>
  )
}

export default App
