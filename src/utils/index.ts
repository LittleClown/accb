import * as lodash from 'lodash'
import { INFO, EmmLogger } from 'emm-logger'
import * as localUtils from '@utils'


export {
  isFile,
  isDirectory,
  findNearestTarget,
} from './fs-helper'


export {
  splitContentToSourceItems,
  mergeSourceItemsToContent,
} from './source-handler'


export const logger = new EmmLogger('ws-ts', {
  level: INFO,
})


// `as any` can skip typescript's type checking.
export default new Proxy({}, {
  get: function(target, property, receiver) {
    if( property in localUtils ) return localUtils[property]
    if( property in lodash ) return lodash[property]
    throw new ReferenceError(`Property "${property}" does not exist.`)
  }
}) as any
