## Calculator test assignment solution

This is the documentation into the `Create your own calculator task`

Supported operations are 
### Binary operations
- `num_1 + num_2` - Add two numbers
- `num_1 - num_2` - Subtract two numbers
- `num_1 * num_2` - Multiply two numbers
- `num_1 / num_2` - Divide two numbers

Operations can be stacked on top of each other, however operators cannot (`++` is not allowed).

### Unary operations
- `+ num_2` - Number is unchanged
- `num_1 - num_2` - Number is negated

Unary operators are helpful to catch the first condition when user wants to have a negative number

### The algorithm for the task 

There are several approaches to solve this problem. They depend on the implementation of server-client interface logic. 
You can either do 
1. Sequence (chunks) calculation 
2. Per character calculation 

Having this in mind, we have three strategies
1. Use external library to handle the state logic on the backend 
2. Create a stack based implementation given task specification
3. Create a finite automata implementation with given restrictions

For this project I have chosen finite automata implementation for the following reasons
1. It is enough to use for given current specification
2. It provides enough of the challenge for the given time 
3. It is easily extendable with PDA solutions (stack based)


### The design 
Given perfect color combination of orange and dark blue, taking the inspiration from iPhone calculator, this is the link to view design made in Figma:
https://www.figma.com/design/5K6rzE1e0tKDiZkmG0anSP/Calculator?node-id=0-1&t=ZhYL6IyvHFVuV9Ig-1

### Project structure 
Project is monorepo with the following structure
1. `/backend` - Backend express server with typescript support. Runs using `nodemon` node.js application and its endpoint 
2. `/frontend` - Frontend react application using vite as a bundler
3. `/types` - common Typescript definitions which could be used both on frontend and backend

### Implementation 

Here I have described using state-transitions the way how logic part will work. Some things have changed (like the idea of the error, and introduction of one way down backward button), however the central idea is the same.
![states-for-calculator.svg](..%2F..%2F..%2FDownloads%2Fstates-for-calculator.svg)
#### State 
Our state is simple object 
```typescript
type State = {
  // current incomming message from the frontend 
  incomingInput: string;
  // current operator, or function which will run over the input 
  operation?: ValueOf<BinaryOperatorFx>,
  /** tuple of two latest numbers.
   * first is the concat result over last sequences of operations
   * second is the second arg. for the operation  
  */ 
  numbers: [string, string],
  // current result of the operation
  result: number,
  // represents error state, incicates for the app that something went wrong 
  error: boolean,
  // current state function which control behavior of the program
  fx: StateFx;
  // previous state function which control behavior of the program
  prevFx: StateFx;
}
```

#### State transitions
State transitions happen when you meet a certain condition on `state.fx` function. State transitions change the behavior of the program by moving its `state.fx` to the next step according to the FA. 


### How to run 
1. Open root directory from terminal
2. Go to the `/backend` and run `npm run dev`
3. Open another terminal and go to the `/frontend` directory and run `npm run dev`
4. Navigate to `https://localhost:5173/`