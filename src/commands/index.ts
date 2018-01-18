import * as path from 'path'
import * as program from 'commander'
import _, { logger } from '@utils'
import { WSTS } from '@types'
import build from './build'
import _new from './new'


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
  program
    .command(`build <target>`)
    .option('-o, --out <output-filename>', 'index output filename')
    .option('-d, --dir <output-directory>', 'index output directory')
    .option('-p, --path <output-path>', 'index output path. It\'s a shortcut of `-o` and `-f`')
    .option('--rc, --remove-comments', 'remove comments.')
    .option('--rs, --remove-spaces', 'remove spaces.')
    .option('-u, --uglify', 'shortcut of --rc --rs.')
    .action((target:string, options:any)=> {
      (async()=> {
        let cmdArgs = await generateGlobalOptions()
        cmdArgs.options = {
          target: target,
          out: options.out,
          dir: options.dir,
          path: options.path,
          flags: {
            uglify: options.uglify,
            removeComments: options.removeComments,
            removeSpaces: options.removeSpaces,
          }
        }

        logger.debug('cmdArgs:', cmdArgs)

        // exec sub-command `build`.
        await build(cmdArgs)
      })()
    })


  // sub-command `new`.
  program
    .command(`new <target>`)
    .action((target:string, options:any)=> {
      (async()=> {
        let cmdArgs = await generateGlobalOptions()
        cmdArgs.options = {
          target: target,
        }

        logger.debug('cmdArgs:', cmdArgs)

        // exec sub-command `new`.
        await _new(cmdArgs)
      })()
    })


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


