import * as fs from 'fs-extra'
import * as path from 'path'
import { EmmLogger } from 'emm-logger'
import { WSTS } from '@types'
import _, { generateExecutableTargetName, parseCMakeLists } from '@utils'


const logger = new EmmLogger('new', {
  show_date: false,
})


/**
 *
 * @param {WSTS.CmdArguments} cmdArgs
 * @return {Promise<void>}
 */
export default async (cmdArgs:WSTS.CmdArguments):Promise<void>=> {
  let { rootDir, execPath, cmakeLists, options } = cmdArgs
  let { targets, template } = options
  let { add_executables } = await parseCMakeLists(cmakeLists)

  if( template ) template = path.resolve(execPath, template)
  else {
    template = path.resolve(rootDir, 'template.cpp')
    logger.info(`set template-path as \`${template}\` to default.`)
  }

  for(let target of targets) {
    if( !path.extname(target) ) target += '.cpp'
    await addTarget(target)
  }


  async function addTarget(target: string) {
    target = path.resolve(execPath, target)
    let targetName = path.relative(rootDir, target).replace(/\\/g, '/')
    let name = generateExecutableTargetName(add_executables, targetName)

    if( !add_executables.has(name) ) {
      let add_executable = `add_executable(${name} ${targetName})`
      logger.info('add executable:', add_executable)
      await fs.appendFile(cmakeLists, add_executable + '\n')
    } else {
      logger.warn(`there has exists \`add_executable(${name} ${add_executables.get(name)})\`.`)
    }


    // write template content into target.
    if( !await _.isFile(target) ) {
      logger.info(`creating file \`${target}\`.`)
      await fs.writeFile(target, '', 'utf-8')
      if( template && await _.isFile(template) ) {
        let content = await fs.readFile(template, 'utf-8')
        logger.info(`write template into \`${target}\`.`)
        await fs.writeFile(target, content, 'utf-8')
      }
    } else {
      logger.warn(`\`${target}\` has existed.`)
    }
  }
}