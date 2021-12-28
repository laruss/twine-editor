const express = require('express')
const chromeLauncher = require('chrome-launcher')
const path = require('path');
const si = require('systeminformation');

const settingsJSON = require('./settings.json')

const { getInnerText, getHTMLelement, getHTMLelements, generateHTML } = require('./htmlActions');
const { createProjectFiles, getFileAsString, saveFile } = require('./filesActions')
const { htmlPassageToObject, objectPassageToHTML } = require('./passages')


const router = new express.Router()

var seperator = {
    val: "",
    get: function () {
        return this.val
    },
    set: function (val) {
        this.val = val
    }
}
si.osInfo().then((osInfo) => {
    if (osInfo.distro.includes('Windows')) seperator.set('\\')
    else seperator.set('/')
})

// from string HTML
const getAttributesObject = (doc) => {
    const storyElement = getHTMLelement(doc, settingsJSON.STORY_SELECTOR)
    const attObj = {}
    for (att of settingsJSON.STORY_ATTRIBUTES) {
        var attVal = storyElement.getAttribute(att)
        if (attVal !== undefined) attObj[att] = attVal
    }
    return attObj
}

const getAttributesFromHeaders = (headers) => {
    const atts = {}
    for (header in headers) {
        if (settingsJSON.STORY_ATTRIBUTES.indexOf(header) >= 0) atts[header] = headers[header]
    }
    return atts
}

// type = 'script' || 'style'
const getContentAsString = (doc, type) => {
    const innerHTMLAsString = getHTMLelement(doc, settingsJSON.STORY_SELECTOR).toString()
    return getInnerText(innerHTMLAsString, type)
}

router.get('/test', (req, res) => {
    const it = "Hello, motherfucker!"
    // const passageAsString = "<tw-passagedata pid=\"1\" name=\"Start\" tags=\"\" position=\"55,33\" size=\"100,100\">here will be cover and causion about the game</tw-passagedata>"
    // const it = htmlPassageToObject(passageAsString)
    // const ti = objectPassageToHTML(it)
    res.json(it);
    // res.send(it)
})

// body: {path: *pathToHTML*}
router.post('/init/project', async (req, res) => {
    try {
        const storyFileName = req.body.path.split(seperator.get()).slice(-1)[0]
        const projectDir = req.body.path.replace(storyFileName, '')
        if (!storyFileName || storyFileName.indexOf('.html') < 0) res.status(400).send({error: 'Wrong path to file'})

        const projectName = storyFileName.replace('.html', '')

        const file = await getFileAsString(req.body.path)
        if (!file) return res.status(400).send({error: 'Wrong path to file'})
        // creates project files
        await createProjectFiles(projectDir, projectName)
        const cssInnerCode = getContentAsString(file, 'style')
        await saveFile(projectDir + projectName + '/' + settingsJSON.PROJECT_CSS, cssInnerCode)
        const jsInnerCode = getContentAsString(file, 'script')
        await saveFile(projectDir + projectName + '/' + settingsJSON.PROJECT_JS, jsInnerCode)

        const attributes = getAttributesObject(file)
        const data = {attributes, projectDir, projectName, projectPath: req.body.path}

        res.send(data)
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

// TODO: method :)
// body: {path: *pathToFolder*, ..attributes..}
router.post('/init/project/new', async (req,res) => {

    try {
        // creates html file in pathToFolder
        // creates project files
        // gets attributes from body
        const data = {}

        res.send(data)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/passages', async (req, res) => {
    try {
        const file = await getFileAsString(req.headers.path)
        const elements = getHTMLelements(file, "tw-passagedata")
        for (i in elements) {
            const passageAsString = elements[i].toString()
            elements[i] = htmlPassageToObject(passageAsString)
        }
        res.send({ elements })
    } catch (e) {
        res.status(500).send(e)
    }
})

// generates HTML file and saves it
router.post('/passages', async (req, res) => {
    try {
        const projectFilesPath = req.headers.projectdir + req.headers.projectname + '/'
        const attributes = getAttributesFromHeaders(req.headers)
        const samplePath = path.join(__dirname, './game_data/sample.html')
        const body_initPath = path.join(__dirname, './game_data/body_init.html')
        const sampleString = await getFileAsString(samplePath)
        const body_init = await getFileAsString(body_initPath)
        const stylesString = await getFileAsString(projectFilesPath + settingsJSON.PROJECT_CSS)
        const scriptString = await getFileAsString(projectFilesPath + settingsJSON.PROJECT_JS)

        const storyItems = []
        for (i in req.body.elements) {
            storyItems.push(objectPassageToHTML(req.body.elements[i]))
        }
    
        const finalHTML = generateHTML(body_init, attributes, sampleString, stylesString, scriptString, storyItems)

        await saveFile(req.headers.projectdir + req.headers.projectname + '.html', finalHTML)
    
        res.send('ok')
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/runStory', async (req, res) => {
    res.send()
    chromeLauncher.launch({
        startingUrl: req.headers.path
      }).then(chrome => {
          console.log(`Chrome debugging port running on ${chrome.port}`);
      });
})

module.exports = router