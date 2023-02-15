import { expect } from 'chai'
import { describe } from 'mocha'
import { getElementAttributes, getElementIdentifier, getElementFullInfo } from '../../src/utils'
import { JSDOM } from 'jsdom'

const htmlTag = 'div'

describe('(unit) getElementFullInfo', () => {
  let dom: JSDOM

  let element: Element

  before(() => {
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>')
  })

  beforeEach(() => {
    element = dom.window.document.createElement(htmlTag)
  })

  afterEach(() => {
    element.remove()
  })

  it('returns tag', () => {
    expect(getElementFullInfo(element)).eq(htmlTag)
  })

  describe('getElementAttributes', () => {
    it('element without any attributes', () => {
      expect(getElementAttributes(element)).eq('')
    })

    it('element with attribute', () => {
      element.setAttribute('prop', 'my-value')
      expect(getElementAttributes(element)).eq('[prop=my-value]')
    })

    it('element with attributes exludes id', () => {
      element.setAttribute('prop', 'my-value')
      element.id = 'element-id'
      expect(getElementAttributes(element)).eq('[prop=my-value]')
    })
  })

  describe('getElementIdentifier', () => {
    it('returns just tag', () => {
      expect(getElementIdentifier(element)).eq(htmlTag)
    })

    it('does not involve attribute', () => {
      element.setAttribute('prop', 'my-value')
      expect(getElementIdentifier(element)).eq(htmlTag)
    })

    it('adds id', () => {
      element.id = 'element-id'
      expect(getElementIdentifier(element)).eq(`${htmlTag}#${'element-id'}`)
    })

    it('adds classname', () => {
      element.classList.add('my-style')
      expect(getElementIdentifier(element)).eq(`${htmlTag}.${'my-style'}`)
    })

    it('adds id and 2 different classnames', () => {
      element.id = 'element-id'
      element.classList.add('my-style')
      element.classList.add('my-second-style')
      expect(getElementIdentifier(element)).eq(
        `${htmlTag}#${'element-id'}.${'my-style'}.${'my-second-style'}`,
      )
    })
  })
})
