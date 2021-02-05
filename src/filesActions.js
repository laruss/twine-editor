const fs = require('fs')
const settingsJSON = require('./settings.json')

const createProjectFiles = async (projectDir, projectName) => {
    // create folder
    await fs.promises.mkdir(projectDir+projectName, { recursive: true })
    // create there css file
    await saveFile(projectDir + projectName + '/' + settingsJSON.PROJECT_CSS, "")
    // create there js file
    await saveFile(projectDir + projectName + '/' + settingsJSON.PROJECT_JS, "")
}

const getFileAsString = async (path) => {
    try {
        const file = await fs.promises.readFile(path, 'utf8')
        return file
    } catch (e) {
        return undefined
    }
}

const saveFile = async (path, data) => {
    await fs.promises.writeFile(path, data, 'utf8')
    console.log("File ", path, "is saved!");
}

module.exports = {
    createProjectFiles,
    getFileAsString,
    saveFile
}