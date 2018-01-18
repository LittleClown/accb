import * as fs from 'fs-extra'
import * as path from 'path'
import { EmmLogger } from 'emm-logger'
import _, { parseCMakeLists } from '@utils'
import { WSTS } from '@types'
import { Cpp } from './cpp'
import { removeComments, removeSpaces } from './handlers'


const logger = new EmmLogger('build')


/**
 *
 * @param {WSTS.CmdArguments} cmdArgs
 * @return {Promise<void>}
 */
export default async (cmdArgs:WSTS.CmdArguments):Promise<void>=> {
  try {
    await preproccess(cmdArgs)
  } catch( error ) {
    logger.error('preproccess cmdArgs failed.')
    logger.error(error)
    process.exit(-1)
  }

  let {
    rootDir,
    execPath,
    cmakeLists,
    options,
  } = cmdArgs

  let { target, outputPath } = options
  let { include_directories } = await parseCMakeLists(cmakeLists)

  logger.debug('include_directories:', include_directories)

  let cpp = new Cpp(rootDir, execPath, include_directories)
  let content = await cpp.buildCpp(target)


  let { flags } = options

  // checkout uglify
  if( flags.uglify ) {
    flags.removeComments = true
    flags.removeSpaces = true
  }

  // remove comments.
  if( flags.removeComments ) {
    logger.info('removing comment.')
    content = removeComments(content)
  }

  // remove spaces.
  if( flags.removeSpaces ) {
    logger.info('removing spaces.')
    content = removeSpaces(content)
  }

  // output
  logger.info(`write \`${outputPath}\``)
  await fs.writeFile(outputPath, content, 'utf-8')
}


/**
 * preproccess cmdArgs, normalizing cmdArgs.options
 * @param {WSTS.CmdArguments} cmdArgs
 * @return {Promise<void>}
 */
async function preproccess(cmdArgs:WSTS.CmdArguments):Promise<void> {
  let { execPath, options } = cmdArgs
  let { out, dir, path:p, target } = options

  if( p ) {
    p = path.resolve(execPath, p)
    logger.debug(`indexed --path \`${p}\`.`)
    if( !await _.isFile(p) )
      throw new Error(`${p} isn't a valid file path.`)
    dir = path.dirname(p)
    out = path.basename(p)
  } else {
    if( !dir ) dir = execPath
    dir = path.resolve(execPath, dir)
    if( !out ) {
      let ext_name = path.extname(target)
      out = target.slice(0, target.length-ext_name.length) + '.out' + ext_name
    }
    if( !await _.isDirectory(dir) )
      throw new Error(`${dir} isn't a valid directory.`)
  }

  let { flags } = options
  cmdArgs.options = {
    flags,
    target,
    outputPath: path.resolve(dir, out),
  }
}
