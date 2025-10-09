const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002

// Enable CORS for all routes
app.use(cors())
app.options('*', cors()) // Enable preflight for all routes

app.use(express.json())
app.use(morgan('dev'))

//Endast lappar/boards
const notesRouter = require('./routes/notes')
app.use('/notes', notesRouter)

//Hälsa
app.get('/healthz', (req, res) => res.json({ ok: true, service: 'board-api' }))

//404-fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`Board API listening on ${PORT}`)
})
