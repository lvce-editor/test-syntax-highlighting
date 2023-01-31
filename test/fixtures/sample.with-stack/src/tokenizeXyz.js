export const State = {
  TopLevelContent: 1,
}

export const TokenType = {
  Zero: 0,
  One: 1,
  Two: 2,
  Three: 3,
}

export const TokenMap = {
  [TokenType.Zero]: 'Zero',
  [TokenType.One]: 'One',
  [TokenType.Two]: 'Two',
  [TokenType.Three]: 'Three',
}

export const initialLineState = {
  state: State.TopLevelContent,
  stack: [],
}

export const hasArrayReturn = true

export const tokenizeLine = (line, lineState) => {
  const stack = [...lineState.stack]
  if (line.includes('(')) {
    stack.push(stack.length)
    return {
      state: 1,
      stack,
      tokens: [stack.length, line.length],
    }
  }
  if (line.includes(')')) {
    return {
      state: stack.pop(),
      stack,
      tokens: [stack.length, line.length],
    }
  }
  return {
    state: 1,
    stack,
    tokens: [stack.length, line.length],
  }
}
