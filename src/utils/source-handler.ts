import { WSTS } from '@types'


// export const quotedRegex = /(['"])(?:\\\1|[\s\S][^\1])*?(?:|[^\\])\1/g


/**
 * split content to two array: quotedItems and nonQuotedItems
 * quotedItems is text which wrapped with single(or double) quotation marks.
 * nonQuotedItems is text which not wrapped with single(or double) quotation marks.
 *
 * @param {string} content
 * @return {WSTS.SourceItems}
 */
export function splitContentToQuotedItems(content:string):WSTS.SourceItems {
  const quotedRegex = new RegExp(generateQuotedRegexSource([`'`, `"`]), 'g')

  let quotedItems:string[] = []
  for(let p:any; p=quotedRegex.exec(content);) {
    let [ target ] = p
    quotedItems.push(target)
  }
  let nonQuotedItems = content.split(quotedRegex)

  return {
    validItems: quotedItems,
    invalidItems: nonQuotedItems,
  }
}


/**
 * split content to two array: commentItems and nonCommentItems
 * commentItems is text which wrapped with block-comment marks or prefixed with line-comment marks.
 * nonCommentItems is text which not wrapped with comment marks.
 *
 * @param {string} content
 * @param {[string , string]} blockComment
 * @param {string} lineComment
 * @return {WSTS.SourceItems}
 */
export function splitContentToCommentItems(content:string,
                                           blockComment:[string,string],
                                           lineComment:string):WSTS.SourceItems {
  const quotedRegex = new RegExp(`^${generateQuotedRegexSource([`'`, `"`])}`)
  const commentRegex = new RegExp(`^${generateCommentRegexSource(blockComment, lineComment)}`)
  let commentItems:string[] = []
  let nonCommentItems:string[] = []

  let lastId = 0
  for(let i=0; i < content.length;) {
    if( content[i] === `'` || content[i] === `"` ) {
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
export function isPrefixOf(content:string, pos:number, prefix:string):boolean {
  if( content.length - pos < prefix.length ) return false
  for(let i=0; i < prefix.length; ++i)
    if( content[pos+i] !== prefix[i] ) return false;
  return true;
}


/**
 * merge validItems,invalidItems to content.
 *
 * @param {WSTS.SourceItems} sourceItems
 * @return {string}
 */
export function mergeSourceItemsToContent(sourceItems:WSTS.SourceItems):string {
  let { validItems, invalidItems } = sourceItems
  let content = ''
  for(let i=0; i < validItems.length; ++i) {
    content += invalidItems[i]
    content += validItems[i]
  }
  content += invalidItems[validItems.length]
  return content
}


/**
 *
 * @param {[string]} quotes
 * @return {string}
 */
export function generateQuotedRegexSource(quotes:[string]):string {
  let reg_source = ''
  for(let quote of quotes) {
    if( quote.length !== 1 )
      throw new Error(`quotes must be an array of character.`)
    reg_source += `${quote}(?:\\\\${quote}|[\\s\\S][^${quote}])*?(?:|[^\\\\])${quote}|`
  }
  reg_source = reg_source.slice(0, -1)
  return reg_source
}

/**
 * according block-comment-mark and line-comment-mark to generate comment-regex which matched comment text.
 * @param {[string , string]} blockComment
 * @param {string} lineComment
 * @return {string}
 */
export function generateCommentRegexSource(blockComment:[string,string], lineComment:string):string {
  let [ leftBlockCommentMark, rightBlockCommentMark ] = blockComment
  leftBlockCommentMark = toRegexPlainString(leftBlockCommentMark)
  rightBlockCommentMark = toRegexPlainString(rightBlockCommentMark)
  lineComment = toRegexPlainString(lineComment)
  let reg_source = `${leftBlockCommentMark}[\\s\\S]*?${rightBlockCommentMark}|${lineComment}[^\n]*`
  return reg_source
}


/**
 * transferred meaning of regular expression meta-characters.
 * @param {string} s
 * @return {string}
 */
export function toRegexPlainString(s:string):string {
  return s.replace(/([.?*+\\()\[\]{}|$])/g, (text, meta)=> `\\${meta}`)
}
