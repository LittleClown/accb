import * as fs from 'fs-extra'
import * as path from 'path'
import { EmmLogger } from 'emm-logger'
import _ from '@utils'
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
  let { include_directories } = await parseCmakeLists(cmakeLists)

  logger.debug('include_directories:', include_directories)

  let cpp = new Cpp(rootDir, execPath, include_directories)
  let content = await cpp.buildCpp(target)

  // remove comments.
  if( options.removeComments ) {
    logger.info('removing comment.')
    content = removeComments(content)
  }

  // remove spaces.
  if( options.removeSpaces ) {
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
  let { out, file, path:p, target } = options

  if( p ) {
    p = path.resolve(execPath, p)
    logger.debug(`indexed --path \`${p}\`.`)
    if( !await _.isFile(p) )
      throw new Error(`${p} isn't a valid file path.`)
    out = path.dirname(p)
    file = path.basename(p)
  } else {
    if( !out ) out = execPath
    out = path.resolve(execPath, out)
    if( !file ) {
      let ext_name = path.extname(target)
      file = target.slice(0, target.length-ext_name.length) + '.out' + ext_name
    }
    if( !await _.isDirectory(out) )
      throw new Error(`${out} isn't a valid directory.`)
  }

  let { removeComments, removeSpaces } = options
  cmdArgs.options = {
    target,
    removeComments,
    removeSpaces,
    outputPath: path.resolve(out, file),
  }
}


/**
 * parse CMakeLists.txt, get { include_directories }
 * @param {string} cmakeLists
 * @return {Promise<any>}
 */
async function parseCmakeLists(cmakeLists:string):Promise<any> {
  let content = await fs.readFile(cmakeLists, 'utf-8')
  let items = content.split(/\n+/g)

  // parse include_directories
  const include_directories_regex = /include_directories\((\s*\S+?\s*)\)/g
  let include_directories:string[] = []
  for(let item of items) {
    let result = include_directories_regex.exec(item)
    if( result ) {
      let [, include_directory ] = result
      include_directories.push(include_directory)
    }
  }


  return {
    include_directories,
  }
}