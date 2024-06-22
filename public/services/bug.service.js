const BASE_URL = '/api/bug'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getQueryParams
}

function query(queryParams) {
    const queryStr = Qs.stringify(queryParams, { encode: false })
    return axios.get(BASE_URL, { params: queryStr })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(`${BASE_URL}/${bugId}`)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(`${BASE_URL}/${bugId}`)
        .then(res => res.data)
}

function save(bug) {
    if (bug._id) {
        return axios.put(`${BASE_URL}/${bug._id}`, bug)
            .then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
    }
}

function getQueryParams(searchParams) {
    return axios.get(`${BASE_URL}/default-query-params`)
        .then(res => res.data)
        .then(displayOps => {

            if (searchParams.get('txt')) displayOps.filterBy.txt = searchParams.get('txt')
            if (searchParams.get('minSeverity')) displayOps.filterBy.minSeverity = +searchParams.get('minSeverity')
            if (searchParams.get('sortBy')) displayOps.sortBy = searchParams.get('sortBy')
            if (searchParams.get('sortDir')) displayOps.sortDir = +searchParams.get('sortDir')
            if (searchParams.get('pageIdx')) displayOps.pageIdx = searchParams.get('pageIdx')

            return displayOps
        })
}