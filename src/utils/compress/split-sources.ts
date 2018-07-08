export interface SourcePiece {
  content: string
  idx: number
}


export interface SourceItems {
  validItems: SourcePiece[]
  invalidItems: SourcePiece[]
}


/**
 * the global flag of RegExp has states, so recreate each time use it.
 * @param {string} quotes
 * @return {string}
 *  such as: /(['"])(?:\1|(?:\\[\s\S]|[\s\S](?![\1\\]))*?[^\\]\1)/.source
 */
export function generateQuotedRegexpSource(...quotes: string[]): string {
   return `([${quotes.join('')}])(?:\\1|(?:\\\\[\\s\\S]|[\\s\\S](?![\\1\\\\]))*?[^\\\\]\\1)`
}


/**
 * according block-comment-symbol and line-comment-symbol to generate
 * comment-regex-source which matched comment text.
 *
 * @param {[string]} bcSymbol   block-comment-symbol
 * @param {string} lcSymbol     line-comment-symbol
 * @return {string}
 */
export function generateCommentRegexSource(bcSymbol: [string, string],
                                           lcSymbol: string): string {
  let [ leftBlockCommentMark, rightBlockCommentMark ] = bcSymbol
  leftBlockCommentMark = escape(leftBlockCommentMark)
  rightBlockCommentMark = escape(rightBlockCommentMark)
  lcSymbol = escape(lcSymbol)
  return `${leftBlockCommentMark}[\\s\\S]*?${rightBlockCommentMark}|${lcSymbol}[^\n]*`
}


/**
 * split content to two array: commentItems and nonCommentItems
 * commentItems is text which wrapped with block-comment marks or prefixed with line-comment marks.
 * nonCommentItems is text which not wrapped with comment marks.
 *
 * @param {string} content
 * @param {string[]} quotes
 * @param {[string]} bcSymbol
 * @param {string} lcSymbol
 * @return {SourceItems}
 */
export function splitContentToCommentsItems(content: string,
                                            quotes: string[],
                                            bcSymbol: [string, string],
                                            lcSymbol: string): SourceItems {
  const quotedRegex: RegExp = new RegExp(generateQuotedRegexpSource(...quotes))
  const commentRegex: RegExp = new RegExp(generateCommentRegexSource(bcSymbol, lcSymbol))
  const commentItems: SourcePiece[] = []
  const nonCommentItems: SourcePiece[] = []

  let lastId = 0
  let pieceId = 0
  for(let i=0; i < content.length;) {
    if( quotes.some(q=> isPrefixOf(content, i, q)) ) {
      let matched = quotedRegex.exec(content.slice(i))
      if( matched ) {
        let [ quoteContent ] = matched
        i += quoteContent.length
      } else throw new Error(`invalid quoted.`)
    } else if( isPrefixOf(content, i, bcSymbol[0]) || isPrefixOf(content, i, lcSymbol) ) {
      nonCommentItems.push({ content: content.slice(lastId, i), idx: pieceId++ })
      let matched = commentRegex.exec(content.slice(i))
      if( matched ) {
        let [ commentContent ] = matched
        lastId = i + commentContent.length
        commentItems.push({ content: content.slice(i, lastId), idx: pieceId++ })
        i = lastId
      } else throw new Error(`invalid comments.`)
    } else ++i
  }
  nonCommentItems.push({ content: content.slice(lastId), idx: pieceId++ })

  return {
    validItems: commentItems,
    invalidItems: nonCommentItems,
  }
}


/**
 * split content to two array: quotedItems and nonQuotedItems
 * quotedItems is text which wrapped with single(or double) quotation marks.
 * nonQuotedItems is text which not wrapped with single(or double) quotation marks.
 *
 * @param {string} content
 * @param quotes
 * @param bcSymbol
 * @param lcSymbol
 * @return {SourceItems}
 */
export function splitContentToQuotedItems(content: string,
                                          quotes: string[],
                                          bcSymbol: [string, string],
                                          lcSymbol: string): SourceItems {
  let { validItems, invalidItems } = splitContentToCommentsItems(content, quotes, bcSymbol, lcSymbol)
  let quotedItems: SourcePiece[] = []
  let nonQuotedItems: SourcePiece[] = []




  return {
    validItems: quotedItems,
    invalidItems: nonQuotedItems,
  }
}


/**
 * merge SourceItems to a string with the order of 'idx'.
 * @param {SourceItems} sourceItems
 * @return {string}
 */
function mergeSourcePieces(sourceItems: SourceItems): string {
  const { validItems, invalidItems } = sourceItems
  let content = '', i = 0, j = 0
  while( i < validItems.length && j < invalidItems.length ) {
    if( validItems[i].idx < invalidItems[j].idx ) content += validItems[i++].content
    else content += invalidItems[j++].content
  }
  while( i < validItems.length ) content += validItems[i++].content
  while( j < invalidItems.length ) content += invalidItems[j++].content
  return content
}


/**
 * escape special character in RegExp.
 * @param {string} s
 * @return {string}
 */
function escape(s: string): string {
  return s.replace(/([.?*+\\()\[\]{}|$])/g, (text, meta)=> `\\${meta}`)
}


/**
 * check whether if `content[pos:-1]` is startsWith `prefix`.
 * @param {string} content
 * @param {number} pos          start position.
 * @param {string} prefix
 * @return {boolean}
 */
function isPrefixOf(content:string, pos:number, prefix:string):boolean {
  if( content.length - pos < prefix.length ) return false
  for(let i=0; i < prefix.length; ++i)
    if( content[pos+i] !== prefix[i] ) return false;
  return true;
}
