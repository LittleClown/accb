import * as path from 'path'
import * as program from 'commander'


export interface BaseOptions {
  rootDir: string
  execPath: string
  cmakeLists: string
}


export interface BaseArguments extends BaseOptions {

}



