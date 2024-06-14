import express from 'express'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'

const PORT = 3030

const app = express()

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error(`Couldn't get bugs: ${err}`)
            res.status(500).send(`Couldn't get bugs: ${err}`)
        })
})

app.get('/api/bug/save', (req, res) => {
    const { _id, title, description, severity } = req.query
    const bugToSave = { _id, title, description, severity: +severity }
    bugService.save(bugToSave)
        .then(bugToSave => {
            loggerService.info(`Bug ${bugToSave._id} added successfully`)
            res.send(bugToSave)
        })
})

app.get('/api/bug/:bugId', (req, res) => {

})
app.get('/api/bug/:bugId/remove', (req, res) => { })

app.listen(PORT, () => console.log(`Server is up. Listening port ${PORT}.`))