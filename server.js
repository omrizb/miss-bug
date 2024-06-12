import express from "express"

const PORT = 3030

const app = express()

app.get('/', (req, res) => res.send('Hello'))
app.listen(PORT, () => console.log(`Server is up. Listening port ${PORT}.`))