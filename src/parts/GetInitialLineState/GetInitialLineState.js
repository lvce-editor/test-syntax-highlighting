import * as DeepCopy from '../DeepCopy/DeepCopy.js'

export const getInitialLineState = (tokenizer) => {
  return DeepCopy.deepCopy(tokenizer.initialLineState)
}
