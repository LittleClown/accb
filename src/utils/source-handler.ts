import { WSTS } from '@types'


// export const quot_regex = /(['"])(?:\\\1|[\s\S][^\1])*?(?:|[^\\])\1/g
export const quot_regex = /'(?:\\'|[\s\S][^'])*?(?:|[^\\])'|"(?:\\"|[\s\S][^"])*?(?:|[^\\])"/g

/**
 * split content to two array: quotItems and nonQuotItems
 * quotItems is text which wrapped with single(or double) quotation marks.
 * nonQuotItems is text which not wrapped with single(or double) quotation marks.
 *
 * @param {string} content
 * @return {WSTS.SourceItems}
 */
export function splitContentToSourceItems(content:string):WSTS.SourceItems {
  let quotItems:string[] = []
  for(let p:any; p=quot_regex.exec(content);) {
    let [ target ] = p
    quotItems.push(target)
  }
  let nonQuotItems = content.split(quot_regex)

  return {
    quotItems,
    nonQuotItems,
  }
}


/**
 * merge quotItems,nonQuoteItems to content.
 *
 * @param {WSTS.SourceItems} sourceItems
 * @return {string}
 */
export function mergeSourceItemsToContent(sourceItems:WSTS.SourceItems):string {
  let { quotItems, nonQuotItems } = sourceItems
  let content = ''
  for(let i=0; i < quotItems.length; ++i) {
    content += nonQuotItems[i]
    content += quotItems[i]
  }
  content += nonQuotItems[quotItems.length]
  return content
}


/**
 * according block-comment-mark and line-comment-mark to generate comment-regex which matched comment text.
 * @param {[string , string]} blockComment
 * @param {string} lineComment
 * @return {RegExp}
 */
export function generateCommentRegex(blockComment:[string,string], lineComment:string):RegExp {
  let [ leftBlockCommentMark, rightBlockCommentMark ] = blockComment
  leftBlockCommentMark = toRegexPlainString(leftBlockCommentMark)
  rightBlockCommentMark = toRegexPlainString(rightBlockCommentMark)
  lineComment = toRegexPlainString(lineComment)
  let reg_source = `${leftBlockCommentMark}[\\s\\S]*?${rightBlockCommentMark}|${lineComment}[^\n]*`
  return new RegExp(reg_source, 'g')
}


/**
 * transferred meaning of regular expression meta-characters.
 * @param {string} s
 * @return {string}
 */
export function toRegexPlainString(s:string):string {
  return s.replace(/([.?*+\\()\[\]{}|$])/g, (text, meta)=> `\\${meta}`)
}
