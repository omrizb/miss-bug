import { utilService } from './util.service.js'

const DATA_PATH = './data/bug.json'

export const bugService = {
    query,
    get,
    remove,
    save,
    getEmptyBug,
    getDefaultFilter
}

const bugs = utilService.readJsonFile(DATA_PATH)

function query(filterBy = {}) {
    let filteredBugs = bugs

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredBugs = filteredBugs.filter(bug => (
            regExp.test(bug.title) ||
            regExp.test(bug.description)
        ))
    }
    if (filterBy.minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    return Promise.resolve(filteredBugs)
}

function get(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)

    if (idx === -1) {
        return Promise.reject(`Bug with id '${bugId}' does not exist.`)
    }

    const bugToRemove = bugs[idx]
    bugs.splice(idx, 1)
    return _saveBugsToFile()
        .then(() => bugToRemove)
}

function save(bugToSave) {
    bugToSave.updatedAt = Date.now()
    bugToSave = _removeUndefinedProps(bugToSave)

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
    return Promise.resolve({
        title: 'New bug',
        description: '',
        severity: 1,
        labels: []
    })
}

function getDefaultFilter() {
    return Promise.resolve({
        txt: '',
        minSeverity: '',
        labels: [],
        sortBy: '',
        sortDir: 1
    })
}

function _saveBugsToFile() {
    return utilService.writeJsonFile(DATA_PATH, bugs)
}

function _removeUndefinedProps(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        if (obj[key] !== undefined) {
            acc[key] = obj[key]
        }
        return acc
    }, {})
}