import express from 'express'
import cookieParser from 'cookie-parser'
import qs from 'qs'

import { utilService } from './services/util.service.js'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'

const PORT = 3030
const COOKIE_MAXAGE = 1 * 10 * 1000

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    bugService.getDefaultQueryParams()
        .then(defaultQueryParams => {
            const reqQueryParams = (req.query) ? qs.parse(req.query[0]) : {}
            const queryParams = utilService.deepMergeObjectsSourceKeysOnly(defaultQueryParams, reqQueryParams)
            return queryParams
        })
        .then(queryParams => {
            bugService.query(queryParams)
                .then(bugs => res.send(bugs))
                .catch(err => {
                    loggerService.error(`Couldn't get bugs: ${err}`)
                    res.status(500).send(`Couldn't get bugs: ${err}`)
                })
        })
})

app.get('/api/bug/default-query-params', (req, res) => {
    bugService.getDefaultQueryParams()
        .then(queryParams => res.send(queryParams))
        .catch(err => {
            loggerService.error(`Couldn't get default query params: ${err}`)
            res.status(500).send(`Couldn't get default query params: ${err}`)
        })
})

app.get('/api/bug/labels', (req, res) => {
    bugService.getLabels()
        .then(labels => res.send(labels))
        .catch(err => {
            loggerService.error(`Couldn't get labels: ${err}`)
            res.status(500).send(`Couldn't get labels: ${err}`)
        })
})

app.get('/api/bug/:id', (req, res) => {
    const { id } = req.params
    const visitedBugs = req.cookies.visitedBugs || []

    if (!visitedBugs.find(cookieBugId => cookieBugId === id)) {
        if (visitedBugs.length >= 3) {
            return res.status(401).send('Wait for a bit')
        }
        visitedBugs.push(id)
    }

    bugService.get(id)
        .then(bug => {
            res.cookie('visitedBugs', visitedBugs, { maxAge: COOKIE_MAXAGE })
            return res.send(bug)
        })
        .catch(err => {
            loggerService.error(`Couldn't get bug ${id}: ${err}`)
            res.status(500).send(`Couldn't get bug ${id}: ${err}`)
        })
})

app.post('/api/bug', (req, res) => {
    const bugToSave = _bugFromJSON(req.body)

    bugService.save(bugToSave)
        .then(bugToSave => {
            loggerService.info(`Bug ${bugToSave._id} saved successfully`)
            res.send(bugToSave)
        })
        .catch(err => {
            loggerService.error(`Couldn't add bug: ${err}`)
            res.status(500).send(`Couldn't add bug: ${err}`)
        })

})

app.put('/api/bug/:id', (req, res) => {
    const bugToSave = _bugFromJSON(req.body)
    bugToSave._id = req.body._id

    bugService.save(bugToSave)
        .then(bugToSave => {
            loggerService.info(`Bug ${bugToSave._id} saved successfully`)
            res.send(bugToSave)
        })
        .catch(err => {
            loggerService.error(`Couldn't update bug: ${err}`)
            res.status(500).send(`Couldn't update bug: ${err}`)
        })
})

app.delete('/api/bug/:id', (req, res) => {
    const { id } = req.params
    bugService.remove(id)
        .then(bug => {
            loggerService.info(`Bug ${bug._id} removed successfully`)
            res.send(bug)
        })
        .catch(err => {
            loggerService.error(`Couldn't remove bug: ${err}`)
            res.status(500).send(`Couldn't remove bug: ${err}`)
        })
})

app.listen(PORT, () => console.log(`Server is up. Listening port ${PORT}.`))

function _bugFromJSON(bugJSON) {
    const { title, description, severity, labels } = bugJSON
    const bug = {
        title: title || '',
        description: description || '',
        severity: +severity || 0,
        labels: labels || []
    }
    return bug
}