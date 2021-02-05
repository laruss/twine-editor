const { getHTMLelement, getInnerText, generateHTML, getHTMLelements } = require('./htmlActions')
const HTMLParser = require('node-html-parser')

//TODO: make html passage to object
const htmlPassageToObject = (passageAsString) => {
    const attributes = ['pid', 'name', 'tags', 'position', 'size']
    const element = getHTMLelement(passageAsString, 'tw-passagedata')
    const passageObject = {}
    for (i in attributes) {
        passageObject[attributes[i]] = element.getAttribute(attributes[i])
    }
    passageObject.text = element.text

    return passageObject
}

//TODO: make object passage to html
const objectPassageToHTML = (passageAsObject) => {
    const passageTag = "tw-passagedata"
    var text = passageAsObject.text
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    var root = HTMLParser.parse(`<${passageTag}>${text}</${passageTag}>`)
    var passageAsHTML = root.querySelector(passageTag)
    const keys = Object.keys(passageAsObject)
    for (i in keys) {
        if (keys[i] !== 'text') {
            passageAsHTML.setAttribute(keys[i], passageAsObject[keys[i]])
        }
    }

    return root.toString()
}

module.exports = {
    htmlPassageToObject,
    objectPassageToHTML
}