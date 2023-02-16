export const getElementFullInfo = (element: Element): string => {
  const attributes = getElementAttributes(element)
  const identifier = getElementIdentifier(element)

  return identifier + attributes
}

export const getElementIdentifier = (clickedElement: Element): string => {
  let identifier = clickedElement.tagName.toLowerCase()
  if (clickedElement.id) {
    identifier = `${identifier}#${clickedElement.id}`
  }

  if (clickedElement.classList.length > 0) {
    identifier = `${identifier}.${clickedElement.classList.value.replace(/ /g, '.')}`
  }
  return identifier
}

export const getElementAttributes = (element: Element): string => {
  const elementAttributes: string[] = []
  for (let length = element.attributes.length, i = 0; i < length; i++) {
    const { nodeName, nodeValue } = element.attributes[i]
    if (nodeName === 'id' || nodeName === 'class') continue
    elementAttributes.push(`[${nodeName}=${nodeValue}]`)
  }
  return elementAttributes.join('')
}
