import * as fs from 'fs-extra'
import * as path from 'path'
import _, { logger } from '@utils'


export class Cpp {
  static includeRegex = /^#include\s*<(\S+)>\s*?/

  private rootDir: string
  private execPath: string
  private includeDirectories: string[]
  private content: string
  private includes: Set<string>
  private stdIncludes: Set<string>


  constructor(rootDir:string,
              execPath:string,
              includeDirectories:string[]) {
    this.rootDir = rootDir
    this.execPath = execPath
    this.includeDirectories = includeDirectories
    this.content = ''
    this.includes = new Set<string>()
    this.stdIncludes = new Set<string>()
  }


  /**
   * build cpp source file, replace all #include with source codes.
   * @param {string} sourceFile
   * @return {Promise<string>}
   */
  async buildCpp(sourceFile:string):Promise<string> {
    this.content = ''
    this.includes.clear()
    this.stdIncludes.clear()
    sourceFile = path.resolve(this.execPath, sourceFile)

    await this.parseSourceFiles(sourceFile)

    let stdIncludes = [...this.stdIncludes].map(item=> `#include<${item}>`).join('\n')
    let content = stdIncludes + '\n' + this.content
    return content
  }


  /**
   * parse source file, and replace #incldue with source codes (recursive).
   * @param {string} sourceFile
   * @return {Promise<void>}
   */
  private async parseSourceFiles(sourceFile:string):Promise<void> {
    logger.debug('load source:', sourceFile)
    sourceFile = path.resolve(this.rootDir, sourceFile)
    if( !await _.isFile(sourceFile) ) return

    let content = await fs.readFile(sourceFile, 'utf-8')
    let items = content.split(/\n+/g)
    let cc = ''

    for(let item of items) {
      let result = Cpp.includeRegex.exec(item)
      if( result ) {
        let [, includeItem ] = result
        if( this.includes.has(includeItem) ) continue
        this.includes.add(includeItem)

        let target = await this.generateRealReferPath(includeItem)
        if( target ) await this.parseSourceFiles(target)
        else this.stdIncludes.add(includeItem)
      } else cc += item + '\n'
    }
    this.content += '\n' + cc
  }


  /**
   * according CMakeLists.txt include_directories item to generate real refer path.
   * @param {string} includeItem
   * @return {Promise<string>}
   */
  private async generateRealReferPath(includeItem:string):Promise<string> {
    for(let dir of this.includeDirectories) {
      let p = path.resolve(this.rootDir, dir, includeItem)
      if( await _.isFile(p) ) return p
    }
    return null
  }
}