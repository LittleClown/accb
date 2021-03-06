import * as fs from 'fs-extra'
import * as path from 'path'


/**
 * determine whether p is is a file-path or not.
 * 判读路径 p 是否为文件夹
 * @param {string} p
 * @return {Promise<boolean>}
 */
export async function isFile(p: string): Promise<boolean> {
  if( fs.existsSync(p) ) {
    let stat = await fs.stat(p)
    return stat.isFile()
  }
  return false
}


/**
 * determine whether p is is a directory-path or not.
 * @param {string} p
 * @return {Promise<boolean>}
 */
export async function isDirectory(p: string): Promise<boolean> {
  if( fs.existsSync(p) ) {
    let stat = await fs.stat(p)
    return stat.isDirectory()
  }
  return false
}


/**
 * find the nearest ancestor directory which contains the `target`.
 * @param {string} p
 * @param {string} target
 * @return {Promise<string>}
 */
export async function findNearestTarget(p: string, target:string): Promise<string> {
  if( !await isDirectory(p) )
    throw new Error(`\`${p}\` isn't a valid directory.`)
  let absolute_target = path.resolve(p, target)
  if( fs.existsSync(absolute_target) )
    return absolute_target

  let parentDir = path.dirname(p)
  if( parentDir != p )
    return await findNearestTarget(parentDir, target)
  return null
}
