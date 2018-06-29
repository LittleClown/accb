import * as fs from 'fs-extra'
import * as path from 'path'
import { isFile } from '@utils/fs-helper'
import { logger } from '@utils/logger'


export class CodeBuilder {
  private static includeRegex = /^#include\s*<\s*(\S+)\s*>\s*$/

  private readonly rootDir: string
  private readonly execPath: string
  private readonly encoding: string
  private readonly includeDirectories: string[]   // the 'include_directories' items in CMakeLists.txt
  private readonly includes: Set<string>          // local-utils dependencies
  private readonly stdIncludes: Set<string>       // standard-library dependencies
  private content: string

  constructor(rootDir: string,
              execPath: string,
              includeDirectories: string[],
              encoding?: string) {
    this.rootDir = rootDir
    this.execPath = execPath
    this.encoding = encoding || 'utf-8'
    this.includeDirectories = includeDirectories
    this.includes = new Set<string>()
    this.stdIncludes = new Set<string>()
  }

  /**
   * build source File, replace all '#include' items with source-codes
   * @param {string} sourceFile
   * @return {Promise<string>}
   */
  public async build(sourceFile: string): Promise<string> {
    // initialize containers.
    this.content = ''
    this.includes.clear()
    this.stdIncludes.clear()

    sourceFile = path.resolve(this.execPath, sourceFile)
    await this.parseSourceFiles(sourceFile)

    let stdIncludes = [...this.stdIncludes]
      .map(item=> `#include <${item}>`)
      .join('\n')
    return stdIncludes + '\n' + this.content
  }


  /**
   * replace '#include' items with source-codes (recursive)
   * @param {string} sourceFile
   * @return {Promise<void>}
   */
  private async parseSourceFiles(sourceFile: string): Promise<void> {
    logger.debug('loading source:', sourceFile)
    sourceFile = path.resolve(this.rootDir, sourceFile)
    if( !await isFile(sourceFile) ) return

    let content: string
    try {
      content = await fs.readFile(sourceFile, this.encoding)
    } catch( error ) {
      logger.fatal(`reading file ${sourceFile} with '${this.encoding}' failed.`)
      logger.error(error.stack)
      process.exit(-1)
    }

    let items = content.split(/\n+/g)
    let cc = ''

    for(let item of items) {
      let result = CodeBuilder.includeRegex.exec(item)
      if( result != null ) {
        let [, includeItem] = result
        if( this.includes.has(includeItem) ) continue
        this.includes.add(includeItem)

        let target = await this.generateRealReferPath(includeItem)
        if( target != null ) await this.parseSourceFiles(target)
        else this.stdIncludes.add(includeItem)
      } else cc += item + '\n'
    }

    this.content += '\n' + cc
  }

  /**
   * according include_directories item in CMakeLists.txt to generate real refer path.
   * @param {string} includeItem
   * @return {Promise<string | null>}
   */
  private async generateRealReferPath(includeItem: string): Promise<string|null> {
    for(let dir of this.includeDirectories) {
      let p = path.resolve(this.rootDir, dir, includeItem)
      if( await isFile(p) ) return p
    }
    return null
  }
}
