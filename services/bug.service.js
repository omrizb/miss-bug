import { utilService } from './util.service.js'

const DATA_PATH = './data/bug.json'

export const bugService = {
    query,
    get,
    remove,
    save,
    getEmptyBug
}

const bugs = utilService.readJsonFile(DATA_PATH)

function query() {
    return Promise.resolve(bugs)
}

function get(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    bugToSave.updatedAt = Date.now()

    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs.splice(idx, 1, bugToSave)
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugs.push(bugToSave)
    }

    return _saveBugsToFile()
        .then(() => bugToSave)
}

function getEmptyBug() {
    return {
        title: 'New bug',
        description: '',
        severity: 1,
    }
}

function _saveBugsToFile() {
    return utilService.writeJsonFile(DATA_PATH, bugs)
}