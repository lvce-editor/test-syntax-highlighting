import * as ErrorCodes from '../ErrorCodes/ErrorCodes.js'

export const isModuleNotFoundError = (error) => {
  return error && error.code === ErrorCodes.ERR_MODULE_NOT_FOUND
}
