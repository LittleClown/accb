import { splitContentToCommentsItems } from './rc'
import { splitContentToQuotedItems } from '@utils/compress/split-sources'


interface UglifyFlags {
  removeSpaces: boolean
  removeComments: boolean
}


export class Uglifier {
  private readonly defaultFlags: UglifyFlags
  private _flags: UglifyFlags

  public set flags(rawFlags: UglifyFlags) {
    let flags: UglifyFlags = { ...this.defaultFlags }
    for(let key of Object.getOwnPropertyNames(rawFlags) ) {
      if( rawFlags[key] == null ) continue
      flags[key] = rawFlags[key]
    }
    this._flags = flags
  }

  constructor(defaultFlags: UglifyFlags) {
    this.defaultFlags = defaultFlags
  }

  public uglify(content: string) {
    let flags = this.flags || this.defaultFlags

  }

  /**
   * remove content's comments.
   *
   * @param {string} content
   * @param {[string]} bcSymbol
   * @param {string} lcSymbol
   * @return {string}
   */
  private static removeComments(content: string,
                                bcSymbol: [string, string] = [`/*`, `*/`],
                                lcSymbol: string = '//'): string {
    let { invalidItems } = splitContentToCommentsItems(content, bcSymbol, lcSymbol)
    return invalidItems.join('')
  }

  private static removeSpaces(content: string): string {
    let { } = splitContentToQuotedItems(content)
  }
}
