const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002

//CORS tillåtna origins
const allowedLocal = new Set([
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://localhost:8080',
])

function isAllowedOrigin(origin) {
  if (!origin) return true
  try {
    const host = new URL(origin).hostname
    if (host === 'people.arcada.fi' || host.endsWith('.arcada.fi')) return true
    if (allowedLocal.has(origin)) return true
    return false
  } catch { return false }
}

app.use(cors({
  origin: (o, cb) => cb(null, isAllowedOrigin(o)),
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false
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