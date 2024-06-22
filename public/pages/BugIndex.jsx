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

    const debouncedQueryParams = useRef(utilService.debounce(onSetQueryParams, 500))

    useEffect(() => {
        loadQueryParams()
    }, [])

    useEffect(() => {
        loadBugs()
    }, [queryParams])

    function loadQueryParams() {
        bugService.getQueryParams(searchParams)
            .then(setQueryParams)
    }

    function loadBugs() {
        if (!queryParams) return

        bugService.query(queryParams)
            .then(setBugs)
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
                {queryParams && <BugFilterAndSort
                    queryParams={queryParams}
                    onSetQueryParams={debouncedQueryParams.current}
                />}
                <button onClick={onAddBug}>Add Bug ⛐</button>
                {bugs && <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />}
            </main>
        </main>
    )
}
