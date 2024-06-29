import express from 'express'
import cookieParser from 'cookie-parser'
import qs from 'qs'

import { utilService } from './services/util.service.js'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'

const PORT = 3030
const COOKIE_MAXAGE = 1 * 10 * 1000

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Bug
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

app.get('/api/bug/page-count', (req, res) => {
    bugService.getPageCount()
        .then(count => res.send(count + ''))
        .catch(err => {
            loggerService.error(`Couldn't get page count: ${err}`)
            res.status(500).send(`Couldn't get page count: ${err}`)
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

// User
app.get('/api/user', (req, res) => {
    const { loginToken } = req.cookies

    const loggedInUser = userService.validateToken(loginToken)
    if (!loggedInUser || !loggedInUser.isAdmin) return res.status(401).send('Cannot get users')

    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error(`Cannot get users: ${err}`)
            res.status(500).send(`Cannot get users: ${err}`)
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error(`Cannot get user ${userId}: ${err}`)
            res.status(500).send(`Cannot get user ${userId}: ${err}`)
        })
})

app.delete('/api/user/:userId', (req, res) => {
    const { loginToken } = req.cookies

    const loggedInUser = userService.validateToken(loginToken)
    if (!loggedInUser?.isAdmin) return res.status(401).send('Not allowed')

    const { userId } = req.params
    bugService.hasBugs(userId)
        .then(hasBugs => {
            if (!hasBugs) {
                userService.remove(userId)
                    .then(() => res.send('Removed!'))
                    .catch(err => res.status(401).send(err))
            } else {
                res.status(401).send('Cannot delete user with bugs')
            }
        })
})

// Authentication
app.post('/api/login', (req, res) => {
    const credentials = {
        username: req.body.username,
        password: req.body.password
    }

    userService.login(credentials)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error(`Login failed: ${err}`)
            res.status(401).send(`Login failed: ${err}`)
        })
})

app.post('/api/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out')
})

app.post('/api/signup', (req, res) => {
    const userDetails = req.body

    userService.signup(userDetails)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => res.status(403).send('Signup failed'))
})

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// Start server
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