import * as _ from 'lodash'
import * as fs from 'fs-extra'
import * as cp from 'copy-paste'
import * as path from 'path'
import { logger } from '@utils/logger'
import { parseCmakeLists } from '@utils/cmake-lists'
import { BaseArguments, BaseOptions } from '../index'
import { CodeBuilder } from './code-builder'
import { isDirectory, isFile } from '@utils/fs-helper'


interface Options extends BaseOptions {
  target: string
  uglify?: boolean
  removeSpaces?: boolean
  removeComments?: boolean
  outputPath?: string
  outputFilename?: string
  outputDirectory?: string
}


interface Arguments extends BaseArguments {
  flags: {
    removeSpaces: boolean
    removeComments: boolean
  }
  outputPath: string
  target: string
}


export class Handler {
  private readonly defaultOptions: Options
  private arguments: Arguments

  constructor(defaultOptions: Options) {
    this.defaultOptions = defaultOptions
  }

  public async handle(options: Options): Promise<void> {
    try {
      this.arguments = await this.preProcess(options)
    } catch( error ) {
      logger.fatal('preprocess options failed.')
      logger.error(error.stack)
      process.exit(-1)
    }

    const { rootDir, execPath, cmakeLists, target, outputPath } = this.arguments
    let { includeDirectories } = await parseCmakeLists(cmakeLists)

    logger.debug('include_directories:', includeDirectories)

    let builder = new CodeBuilder(rootDir, execPath, includeDirectories)
    let content = await builder.build(target)

    content = await this.furtherProcess(content)

    if( !_.isNil(outputPath) ) {
      // output
      logger.info(`write \`${outputPath}\``)
      await fs.writeFile(outputPath, content, 'utf-8')
    } else {
      // copy output in system clip.
      logger.info(`copying to system-clip.`)
      await new Promise((resolve) => {
        cp.copy(content, resolve)
      })
    }
  }

  /**
   * preprocess, according rawOptions and defaultOptions to generate arguments.
   * @param {Options} rawOptions
   * @return {Promise<Arguments>}
   */
  private async preProcess(rawOptions: Options): Promise<Arguments> {
    let options: Options = { ...this.defaultOptions }
    for(let key of Object.getOwnPropertyNames(rawOptions) ) {
      if( rawOptions[key] == null ) continue
      options[key] = rawOptions[key]
    }

    let pathValid = false
    let { execPath, target, outputDirectory, outputFilename, outputPath } = options
    if( outputPath != null ) {
      outputPath = path.resolve(execPath, outputPath)
      logger.debug(`specified --path \`${outputPath}\`.`)
      if( !await isFile(outputPath) )
        throw new Error(`'${outputPath}' isn't a valid file path.`)
      outputFilename = path.basename(outputPath)
      outputDirectory = path.dirname(outputPath)
      pathValid = true
    } else {
      if( !_.isNil(outputFilename) ) {
        if( _.isNil(outputDirectory) ) outputDirectory = execPath
        outputDirectory = path.resolve(execPath, outputDirectory)
        if( !await isDirectory(outputDirectory) )
          throw new Error(`'${outputDirectory}' isn't a valid directory`)

        if( !_.isString(outputFilename) ) {
          let { name, ext } = path.parse(target)
          outputFilename = `${name}.out.${ext}`
        }
        pathValid = true
      }
    }

    return {
      flags: {
        removeSpaces: options.uglify || options.removeSpaces,
        removeComments: options.uglify || options.removeComments,
      },
      target: path.resolve(execPath, target),
      outputPath: pathValid? path.resolve(outputDirectory, outputFilename): undefined,
    } as Arguments
  }

  /**
   * further process, uglify...
   * @param {string} content
   * @return {Promise<string>}
   */
  private async furtherProcess(content: string): Promise<string> {
    const { flags } = this.arguments

    // remove comments.
    if( flags.removeComments ) {
      logger.info('removing comment')

    }

    // remove spaces.
    if( flags.removeSpaces ) {
      logger.info('removing spaces.')

    }

    return content
  }
}
