import { expect } from 'chai'
import { generateQuotedRegexSource, generateCommentRegexSource } from '@utils/source-handler'


describe('test generateQuotedRegexSource', ()=> {
  let regex:RegExp
  before(()=> {
    regex = new RegExp(`^${generateQuotedRegexSource([`'`, `"`])}$`)
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


describe('test generateCommentRegexSource', ()=> {
  let regex:RegExp
  before(()=> {
    regex = new RegExp(`^${generateCommentRegexSource(['/*', '*/'], '//')}$`)
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
