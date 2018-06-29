import { generateQuotedRegexpSource, SourceItems } from '@utils/compress/split-sources'


/**
 * escape special character in RegExp.
 * @param {string} s
 * @return {string}
 */
function escape(s: string): string {
  return s.replace(/([.?*+\\()\[\]{}|$])/g, (text, meta)=> `\\${meta}`)
}


/**
 * according block-comment-symbol and line-comment-symbol to generate
 * comment-regex which matched comment text.
 *
 * @param {[string]} bcSymbol   block-comment-symbol
 * @param {string} lcSymbol     line-comment-symbol
 * @return {RegExp}
 */
export function generateCommentRegex(bcSymbol: [string, string],
                                     lcSymbol: string): RegExp {
  let [ leftBlockCommentMark, rightBlockCommentMark ] = bcSymbol
  leftBlockCommentMark = escape(leftBlockCommentMark)
  rightBlockCommentMark = escape(rightBlockCommentMark)
  lcSymbol = escape(lcSymbol)
  let reg_source = `${leftBlockCommentMark}[\\s\\S]*?${rightBlockCommentMark}|${lcSymbol}[^\n]*`
  return new RegExp(reg_source)
}


/**
 * split content to two array: commentItems and nonCommentItems
 * commentItems is text which wrapped with block-comment marks or prefixed with line-comment marks.
 * nonCommentItems is text which not wrapped with comment marks.
 *
 * @param {string} content
 * @param {[string]} blockComment
 * @param {string} lineComment
 * @return {SourceItems}
 */
function splitContentToCommentsItems(content: string,
                                     blockComment: [string, string],
                                     lineComment: string,): SourceItems {
  const quotedRegex:RegExp = new RegExp(generateQuotedRegexpSource(`'`, `"`))
  const commentRegex:RegExp = generateCommentRegex(blockComment, lineComment)
  let commentItems:string[] = []
  let nonCommentItems:string[] = []

  let lastId = 0
  for(let i=0; i < content.length;) {
    if( content[i] == `'` || content[i] == `"` ) {
      let matched = quotedRegex.exec(content.slice(i))
      if( matched ) {
        let [ quoteContent ] = matched
        i += quoteContent.length
      } else throw new Error(`invalid quoted.`)
    } else if( isPrefixOf(content, i, blockComment[0]) || isPrefixOf(content, i, lineComment) ) {
      nonCommentItems.push(content.slice(lastId, i))
      let matched = commentRegex.exec(content.slice(i))
      if( matched ) {
        let [ commentContent ] = matched
        lastId = i + commentContent.length
        commentItems.push(content.slice(i, lastId))
        i = lastId
      } else throw new Error(`invalid comments.`)
    } else ++i
  }
  nonCommentItems.push(content.slice(lastId))

  return {
    validItems: commentItems,
    invalidItems: nonCommentItems,
  }
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
