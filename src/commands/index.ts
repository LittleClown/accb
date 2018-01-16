import * as path from 'path'
import * as program from 'commander'
import _, { logger } from '@utils'
import { WSTS } from '@types'


/**
 * initialize commands.
 * @param {string} version
 * @param args
 * @return {Promise<void>}
 */
export default async (version:string, args:any):Promise<void>=> {
  // global options.
  program
    .version(version)
    .option('--log-level')
    .option('--log-option')
    .option('--cl, --cmake-lists <cmakeLists-name>', 'index cmakeLists name.')


  // sub-command `build`.


  // done.
  program
    .parse(args)


  /**
   * generate global options.
   * @return {WSTS.CmdArguments}
   */
  async function generateGlobalOptions():Promise<WSTS.CmdArguments> {
    let execPath = path.resolve()
    let cmakeLists = program.cmakeLists || 'CMakeLists.txt'

    cmakeLists = await _.findNearestTarget(execPath, cmakeLists)
    if( !await _.isFile(cmakeLists) ) {
      logger.fatal(`\`${cmakeLists}\` is not exists.`)
      process.exit(-1)
    }

    let rootDir = path.dirname(cmakeLists)

    logger.debug('rootDir:', rootDir)
    logger.debug('execPath:', execPath)
    logger.debug('cmakeLists:', cmakeLists)

    return {
      rootDir,
      execPath,
      cmakeLists,
    }
  }
}


