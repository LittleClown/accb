export declare namespace WSTS {
  export interface SourceItems {
    validItems: string[]      //
    invalidItems: string[]    //
  }


  export interface CmdArguments {
    rootDir: string           // the cpp project root directory.
    execPath: string          // the command executed path.
    cmakeLists: string        // the name of cmake config file such as `CMakeLists.txt`.
    options?: any             // sub-commands options.
  }


  export interface CMakeLists {
    include_directories: string[]
    add_executables: Map<string, string>
  }
}
