export const State = {
  TopLevelContent: 1,
}

export const TokenType = {}

export const TokenMap = {}

export const initialLineState = {
  state: State.TopLevelContent,
}

export const tokenizeLine = (line, lineState) => {
  return {
    state: 1,
    tokens: [],
  }
}
