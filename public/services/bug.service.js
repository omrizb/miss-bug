const BASE_URL = '/api/bug'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getQueryParams,
    getLabels,
    getPageCount
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
        .then(queryParams => {

            if (searchParams.get('txt')) queryParams.filterBy.txt = searchParams.get('txt')
            if (searchParams.get('minSeverity')) queryParams.filterBy.minSeverity = +searchParams.get('minSeverity')
            if (searchParams.get('labels')) queryParams.filterBy.labels = searchParams.get('labels').split(',')
            if (searchParams.get('sortBy')) queryParams.sortBy = searchParams.get('sortBy')
            if (searchParams.get('sortDir')) queryParams.sortDir = +searchParams.get('sortDir')
            if (searchParams.get('pageIdx')) queryParams.pageIdx = searchParams.get('pageIdx')

            return queryParams
        })
}

function getLabels() {
    return axios.get(`${BASE_URL}/labels`)
        .then(res => res.data)
}

function getPageCount() {
    return axios.get(`${BASE_URL}/page-count`)
        .then(res => +res.data)
}