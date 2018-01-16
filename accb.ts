#! /usr/bin/env node


import * as fs from 'fs-extra'
import { findNearestTarget, logger } from '@utils'
import loadCommands from '@commands'


(async()=> {
  let package_json = await findNearestTarget(__dirname, 'package.json')
  let version = '0.0.0'
  if( package_json ) {
    logger.debug('package.json\'s path:', package_json)
    let package_obj = await fs.readJSON(package_json)
    version = package_obj.version || version
  } else {
    logger.debug(`can't find package.json`)
  }

  logger.debug('version:', version)

  await loadCommands(version, process.argv)
})()