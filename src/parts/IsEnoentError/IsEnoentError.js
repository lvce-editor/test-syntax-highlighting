import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'

export const isEnoentError = (error) => {
  return (
    error &&
    error instanceof Error &&
    'code' in error &&
    error.code === ErrorCodes.ENOENT
  )
}
