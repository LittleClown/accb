import { expect } from 'chai'
import { quot_regex, generateCommentRegex } from '@utils/source-handler'


describe('test quot-regex', ()=> {
  let regex:RegExp
  before(()=> {
    regex = new RegExp(`^${quot_regex.source}$`)
  })

  it(`expect true cases.`, ()=> {
    expect(regex.test(String.raw`'\\'`)).to.be.true
    expect(regex.test(String.raw`'\'\\'`)).to.be.true
    expect(regex.test(String.raw`'abc"\\'`)).to.be.true
  })

  it(`expect false cases.`, ()=> {
    expect(regex.test(String.raw`'\'`)).to.be.false
    expect(regex.test(String.raw`'\\\'`)).to.be.false
  })
})


describe('test comment-regex', ()=> {
  let regex:RegExp
  before(()=> {
    regex = generateCommentRegex(['/*', '*/'], '//')
    regex = new RegExp(`^${regex.source}$`)
  })

  it(`expect true cases.`, ()=> {
    expect(regex.test(String.raw`/**here*/`)).to.be.true
    expect(regex.test(String.raw`// there`)).to.be.true
    expect(regex.test(String.raw`/*/*here*/`)).to.be.true
  })

  it(`expect false cases.`, ()=> {
    expect(regex.test(String.raw`/**out*`)).to.be.false
    expect(regex.test(String.raw`/out*/`)).to.be.false
  })
})
