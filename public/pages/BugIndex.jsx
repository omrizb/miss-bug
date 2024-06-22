const { useState, useEffect, useRef } = React
const { useSearchParams } = ReactRouterDOM

import { utilService } from '../services/util.service.js'
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {

    const [bugs, setBugs] = useState()
    const [filterBy, setFilterBy] = useState()

    const debouncedOnSetFilterBy = useRef(utilService.debounce(onSetFilterBy, 500))

    useEffect(() => {
        loadFilter()
    }, [])

    useEffect(() => {
        loadBugs()
    }, [filterBy])

    function loadFilter() {
        bugService.getFilter()
            .then(setFilterBy)
    }

    function loadBugs() {
        bugService.query(filterBy)
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

    function onSetFilterBy(filterBy) {
        setFilterBy(filterBy)
    }

    return (
        <main>
            <h3>Bugs App</h3>
            <main>
                {filterBy && <BugFilter filterBy={filterBy} onSetFilterBy={debouncedOnSetFilterBy.current} />}
                <button onClick={onAddBug}>Add Bug ⛐</button>
                {bugs && <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />}
            </main>
        </main>
    )
}
