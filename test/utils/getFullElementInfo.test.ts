import { expect } from 'chai'
import { describe } from 'mocha'
import {
  getElementAttributes,
  getElementIdentifier,
  getElementFullInfo,
  getElementsFullInfo,
} from '../../src/utils'
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
    expect(getElementFullInfo(element)).eq('@' + htmlTag + ';')
  })

  it('identifier and attributes without spaces', () => {
    element.setAttribute('prop', 'value.1')
    element.setAttribute('prop-2', 'value.2')
    element.setAttribute('class', 'style-1 style-2')
    element.id = 'element-id'
    expect(getElementFullInfo(element)).eq(
      `@${htmlTag};#element-id;.style-1;.style-2;[prop=value.1];[prop-2=value.2];`,
    )
  })

  describe('getElementsFullInfo', () => {
    it('body > element', () => {
      element.setAttribute('prop', 'value.1')
      element.setAttribute('prop-2', 'value.2')
      element.setAttribute('class', 'style-1 style-2')
      element.id = 'element-id'

      dom.window.document.body.appendChild(element)

      expect(getElementsFullInfo(element)).eq(
        `@body; @${htmlTag};#element-id;.style-1;.style-2;[prop=value.1];[prop-2=value.2];`,
      )
    })

    it('body > div with class > element', () => {
      element.setAttribute('prop', 'value.1')
      element.setAttribute('prop-2', 'value.2')
      element.setAttribute('class', 'style-1 style-2')
      element.id = 'element-id'

      const parent = dom.window.document.createElement('div')
      parent.setAttribute('class', 'parent-style-1')

      dom.window.document.body.appendChild(parent)
      parent.appendChild(element)

      expect(getElementsFullInfo(element)).eq(
        `@body; @div;.parent-style-1; @${htmlTag};#element-id;.style-1;.style-2;[prop=value.1];[prop-2=value.2];`,
      )
    })
  })

  describe('getElementAttributes', () => {
    it('element without any attributes', () => {
      expect(getElementAttributes(element)).eq('')
    })

    it('element with attribute', () => {
      element.setAttribute('prop', 'my-value')
      expect(getElementAttributes(element)).eq('[prop=my-value];')
    })

    it('element with attributes exludes id', () => {
      element.setAttribute('prop', 'my-value')
      element.id = 'element-id'
      expect(getElementAttributes(element)).eq('[prop=my-value];')
    })

    it('element with multiple attributes', () => {
      element.setAttribute('prop', 'value.1')
      element.setAttribute('prop-2', 'value.2')
      element.id = 'element-id'
      expect(getElementAttributes(element)).eq('[prop=value.1];[prop-2=value.2];')
    })

    it('ignores class', () => {
      element.setAttribute('prop', 'value.1')
      element.setAttribute('prop-2', 'value.2')
      element.id = 'element-id'
      expect(getElementAttributes(element)).eq('[prop=value.1];[prop-2=value.2];')
    })
  })

  describe('getElementIdentifier', () => {
    it('returns just tag', () => {
      expect(getElementIdentifier(element)).eq(htmlTag + ';')
    })

    it('does not involve attribute', () => {
      element.setAttribute('prop', 'my-value')
      expect(getElementIdentifier(element)).eq(htmlTag + ';')
    })

    it('adds id', () => {
      element.id = 'element-id'
      expect(getElementIdentifier(element)).eq(`${htmlTag};#element-id;`)
    })

    it('adds classname', () => {
      element.classList.add('my-style')
      expect(getElementIdentifier(element)).eq(`${htmlTag};.my-style;`)
    })

    it('adds id and 2 different classnames', () => {
      element.id = 'element-id'
      element.classList.add('my-style')
      element.classList.add('my-second-style')
      expect(getElementIdentifier(element)).eq(`${htmlTag};#element-id;.my-style;.my-second-style;`)
    })
  })
})
