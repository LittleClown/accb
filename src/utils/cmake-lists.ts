import * as fs from 'fs-extra'
import { WSTS } from '@types'


export const include_directories_regex = /include_directories\((\s*\S+?\s*)\)/g
export const add_executable_regex = /add_executable\((\S+?)([\s\S]+?)\)/g


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
