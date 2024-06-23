const { useState, useEffect, useRef } = React
const { useSearchParams } = ReactRouterDOM

import { utilService } from '../services/util.service.js'
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilterAndSort } from '../cmps/BugFilterAndSort.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {

    const [searchParams] = useSearchParams()
    const [bugs, setBugs] = useState()
    const [queryParams, setQueryParams] = useState()
    const [pageCount, setPageCount] = useState()
    const allLabels = useRef()

    const debouncedQueryParams = useRef(utilService.debounce(onSetQueryParams, 500))

    useEffect(() => {
        loadQueryParams()
        loadLabels()
        loadPageCount()
    }, [])

    useEffect(() => {
        loadBugs()
    }, [queryParams])

    function loadQueryParams() {
        bugService.getQueryParams(searchParams)
            .then(setQueryParams)
            .catch(err => {
                console.error('Error:', err)
                showErrorMsg('Cannot load query params')
            })
    }

    function loadLabels() {
        bugService.getLabels()
            .then(labels => allLabels.current = labels)
            .catch(err => {
                console.error('Error:', err)
                showErrorMsg('Cannot load labels')
            })
    }

    function loadPageCount() {
        bugService.getPageCount()
            .then(count => setPageCount(count))
            .catch(err => {
                console.error('Error:', err)
                showErrorMsg('Cannot load page count')
            })
    }

    function loadBugs() {
        if (!queryParams) return

        bugService.query(queryParams)
            .then(setBugs)
            .catch(err => {
                console.error('Error:', err)
                showErrorMsg('Cannot load bugs')
            })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Successfully!')
                setBugs(prevBugs => prevBugs.filter((bug) => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            description: prompt('Description?'),
            severity: +prompt('Bug severity?'),
        }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs(prevBugs => [...prevBugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                setBugs(prevBugs => prevBugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug
                ))
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    function onSetQueryParams(queryParams) {
        setQueryParams(queryParams)
    }

    return (
        <main>
            <h3>Bugs App</h3>
            <main>
                {queryParams && allLabels.current && <BugFilterAndSort
                    queryParams={queryParams}
                    onSetQueryParams={debouncedQueryParams.current}
                    allLabels={allLabels.current}
                    pageCount={pageCount}
                />}
                <button onClick={onAddBug}>Add Bug ⛐</button>
                {bugs && <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />}
            </main>
        </main>
    )
}
