const settingsJSON = require('./settings.json')
const HTMLParser = require('node-html-parser')

// returns one html el
const getHTMLelement = (HTMLasString, selector) => {
    var root = HTMLParser.parse(HTMLasString)
    return root.querySelector(selector)
}

// returns many html els
const getHTMLelements = (HTMLasString, selector) => {
    var root = HTMLParser.parse(HTMLasString)
    return root.querySelectorAll(selector)
}

const getInnerText = (HTMLasString, selector) => {
    const el = getHTMLelement(HTMLasString, selector)
    return el.text
}

const generateHTML = (body_init, attributes, sampleHTML, css, js, storyItems) => {

    const cssInTags = `<style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css">${css}</style>`
    const jsInTags = `<script role="script" id="twine-user-script" type="text/twine-javascript">${js}</script>`

    var innerRoot = HTMLParser.parse(`${body_init}<${settingsJSON.STORY_SELECTOR}></${settingsJSON.STORY_SELECTOR}>`)
    var storyElement = innerRoot.querySelector(settingsJSON.STORY_SELECTOR)

    for (att in attributes) {
        storyElement.setAttribute(att, attributes[att])
    }

    storyElement.insertAdjacentHTML('beforeend', cssInTags)

    storyElement.insertAdjacentHTML('beforeend', jsInTags)

    storyItems.forEach((storyItem) => {
        storyElement.insertAdjacentHTML('beforeend', storyItem)
    })

    var root = HTMLParser.parse(sampleHTML)
    root.querySelector('body').insertAdjacentHTML('afterbegin', innerRoot.toString())

    return root.toString()
}

module.exports = {
    getHTMLelement,
    getInnerText,
    generateHTML,
    getHTMLelements
}