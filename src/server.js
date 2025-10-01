const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002

//CORS tillåtna origins
const cors = require('cors')

const ALLOW = new Set([
  'https://people.arcada.fi',   //live-frontend
  'http://127.0.0.1:5501',      //lokalt 
  'http://localhost:5501',
  'http://localhost:8080'
])

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOW.has(origin)),
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))
app.options('*', cors())

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
