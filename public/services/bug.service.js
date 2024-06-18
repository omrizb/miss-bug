
import { utilService } from './util.service.js'

const BASE_URL = '/api/bug'

export const bugService = {
    query,
    getById,
    save,
    remove,
}

function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(`${BASE_URL}/${bugId}`)
        .then(res => res.data)
}
function remove(bugId) {
    return axios.get(`${BASE_URL}/${bugId}/remove`)
        .then(res => res.data)
}
function save(bug) {
    const queryStr = `title=${bug.title}&description=${bug.description}&severity=${bug.severity}&_id=${bug._id || ''}`
    return axios.get(`${BASE_URL}/save?${queryStr}`)
        .then(res => res.data)
}