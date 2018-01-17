import {
  splitContentToCommentItems,
  splitContentToQuotedItems,
  generateCommentRegexSource,
  mergeSourceItemsToContent,
} from '@utils'


// export const commentRegex = /\s*\/\*[\s\S]*?\*\/|\s*\/\/[^\n]*/g
const blockCommentMark:[string, string] = [ `/*`, `*/` ]
const lineCommentMark = `//`
export const commentRegex = new RegExp(generateCommentRegexSource(blockCommentMark, lineCommentMark), 'g')
export const blankLineRegex = /\s*\n+\s*/g
export const spacesRegex = /[ \t]+/g
export const leftSpacesRegex = /\s(?![\w_#])/g
export const rightSpacesRegex = /(?<![\w_])\s/g
export const includeRegex = /(#include\s*<\S+?>\s*)/g


/**
 * remove content's comments.
 *
 * @param {string} content
 * @return {string}
 */
export function removeComments(content:string):string {
  let { invalidItems } = splitContentToCommentItems(content, blockCommentMark, lineCommentMark)
  return invalidItems.join('')
}


/**
 * remove needless spaces.
 *
 * @param {string} content
 * @return {string}
 */
export function removeSpaces(content:string): string {
  let { validItems, invalidItems } = splitContentToQuotedItems(content)

  invalidItems = invalidItems
    .map(item=> item.replace(blankLineRegex, '\n'))
    .map(item=> item.replace(spacesRegex, ' '))
    .map(item=> item.replace(leftSpacesRegex, ''))
    .map(item=> item.replace(rightSpacesRegex, ''))
    .map(item=> item.replace(includeRegex, target=> `${target}\n`))

  return mergeSourceItemsToContent({ validItems, invalidItems })
}