export interface SourceItems {
  validItems: string[]
  invalidItems: string[]
}


/**
 * the global flag of RegExp has states, so recreate each time use it.
 * @return {RegExp}
 */
// /(['"])(?:\1|(?:\\[\s\S]|[\s\S](?![\1\\]))*?[^\\]\1)/g
export function generateQuotedRegexpSource(...quotes: string[]): string {
   return `([${quotes.join('')}])(?:\\1|(?:\\\\[\\s\\S]|[\\s\\S](?![\\1\\\\]))*?[^\\\\]\\1)`
}


/**
 * split content to two array: quotedItems and nonQuotedItems
 * quotedItems is text which wrapped with single(or double) quotation marks.
 * nonQuotedItems is text which not wrapped with single(or double) quotation marks.
 *
 * @param {string} content
 * @return {SourceItems}
 */
export function splitContentToQuotedItems(content: string): SourceItems {
  let quotedRegex: RegExp = new RegExp(generateQuotedRegexpSource(`'`, `"`), 'g')
  let quotedItems: string[] = []
  for(let p:any; (p=quotedRegex.exec(content)) != null;) {
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
 * merge validItems,invalidItems to content.
 *
 * @param {SourceItems} sourceItems
 * @return {string}
 */
export function mergeSourceItemsToContent(sourceItems: SourceItems):string {
  let { validItems, invalidItems } = sourceItems
  let content = ''
  for(let i=0; i < validItems.length; ++i) {
    content += invalidItems[i]
    content += validItems[i]
  }
  content += invalidItems[validItems.length]
  return content
}
