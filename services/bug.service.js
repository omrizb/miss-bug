import { utilService } from './util.service.js'

const DATA_PATH = './data/bug.json'

export const bugService = {
    query,
    get,
    remove,
    save,
    getEmptyBug,
    getDefaultQueryParams,
    getLabels,
    getPageCount
}

const PAGE_SIZE = 4
const bugs = utilService.readJsonFile(DATA_PATH)

function query(queryParams = _getDefaultQueryParams()) {
    let filteredBugs = bugs
    const { filterBy, sortBy, sortDir, pageIdx } = queryParams

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
    if (filterBy.labels.length > 0) {
        filteredBugs = filteredBugs.filter(bug => filterBy.labels.every(label => bug.labels.includes(label)))
    }

    if (sortBy === 'title') {
        filteredBugs = filteredBugs.sort((bug1, bug2) => bug1.title.localeCompare(bug2.title) * sortDir)
    } else if (sortBy === 'severity') {
        filteredBugs = filteredBugs.sort((bug1, bug2) => (bug1.severity - bug2.severity) * sortDir)
    } else if (sortBy === 'createdAt') {
        filteredBugs = filteredBugs.sort((bug1, bug2) => (bug1.createdAt - bug2.createdAt) * sortDir)
    }

    const startIdx = pageIdx * PAGE_SIZE
    filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)

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

function getDefaultQueryParams() {
    return Promise.resolve(_getDefaultQueryParams())
}

function getLabels() {
    return query().then(bugs => {
        const bugLabels = bugs.reduce((acc, bug) => {
            return acc = [...acc, ...bug.labels]
        }, [])
        return [...new Set(bugLabels)]
    })
}

function getPageCount() {
    return Promise.resolve(Math.ceil(bugs.length / PAGE_SIZE))
}

function _getDefaultQueryParams() {
    return {
        filterBy: {
            txt: '',
            minSeverity: '',
            labels: []
        },
        sortBy: '',
        sortDir: '',
        pageIdx: 0
    }
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