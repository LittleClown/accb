import * as fs from 'fs-extra'
import * as path from 'path'
import { WSTS } from '@types'


export const include_directories_regex = /^\s*include_directories\((\s*\S+?\s*)\)\s*$/
export const add_executable_regex = /^\s*add_executable\((\S+?)(\s+[\s\S]+?)\)\s*$/


/**
 * parse CMakeLists.txt
 * @param {string} cmakeLists
 * @return {Promise<WSTS.CMakeLists>}
 */
export async function parseCMakeLists(cmakeLists:string):Promise<WSTS.CMakeLists> {
  let content = await fs.readFile(cmakeLists, 'utf-8')
  let items = content.split(/\n+/g)

  // parse include_directories
  let include_directories:string[] = []
  for(let item of items) {
    let result = include_directories_regex.exec(item)
    if( result ) {
      let [, include_directory ] = result
      include_directories.push(include_directory)
    }
  }

  // parse add_executable
  let add_executables = new Map<string, string>()
  for(let item of items) {
    let result = add_executable_regex.exec(item)
    if( result ) {
      let [, target, sources] = result
      add_executables.set(target, sources)
    }
  }


  return {
    include_directories,
    add_executables,
  }
}


/**
 * generate a unique executable target name.
 * @param {Map<string, string>} add_executable
 * @param {string} source
 * @return {string}
 */
export function generateExecutableTargetName(add_executable:Map<string, string>,
                                         source:string):string {
  let { dir:dirname, name:filename } = path.parse(source)
  let name = dirname.split(/[\\/]/g).map(m=> m[0].toUpperCase()).join('')
  name = 'P' + name + filename
  return name
}
