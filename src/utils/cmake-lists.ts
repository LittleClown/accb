import * as fs from 'fs-extra'
import * as path from 'path'


export interface CMakeLists {
  includeDirectories: string[]
  addExecutables: Map<string, string>
}


const includeDirectoriesRegex = /^\s*include_directories\((\s*\S+?\s*)\)\s*$/
const addExecutableRegex = /^\s*add_executable\((\S+?)(\s+[\s\S]+?)\)\s*$/


/**
 * parse CmakeLists.txt
 * @param {string} cmakeLists
 * @return {Promise<CMakeLists>}
 */
export async function parseCmakeLists(cmakeLists: string): Promise<CMakeLists> {
  let content = await fs.readFile(cmakeLists, 'utf-8')
  let items = content.split(/\n+g/)

  // parse include_directories
  let includeDirectories: string[] = []
  for(let item of items) {
    let result = includeDirectoriesRegex.exec(item)
    if( result ) {
      let [, includeDirectory] = result
      includeDirectories.push(includeDirectory)
    }
  }

  // parse add_executable
  let addExecutables = new Map<string, string>()
  for(let item of items) {
    let result = addExecutableRegex.exec(item)
    if( result ) {
      let [, target, sources] = result
      addExecutables.set(target, sources)
    }
  }

  return { includeDirectories, addExecutables } as CMakeLists
}


/**
 * generate a unique executable target name.
 * @param {Map<string, string>} addExecutables
 * @param {string} source
 * @return {string}
 */
export function generateExecutableTargetName(addExecutables: Map<string, string>,
                                             source: string): string {
  let { dir: dirname, name: filename } = path.parse(source)
  let name = dirname.split(/[\\/]/g).map(m=> m[0].toUpperCase()).join('')
  name = 'P' + name + filename
  return name
}
