const express = require('express')
//const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002


// ---- CORS: tillåt allt, hantera preflight TIDIGT ----
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin'); // korrekt caching per origin
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
  );
  // Om du använder cookies: avkommentera raden nedan OCH använd fetch(...,{credentials:'include'})
  // res.setHeader('Access-Control-Allow-Credentials','true');

  if (req.method === 'OPTIONS') return res.sendStatus(204); // preflight-svar direkt
  next();
});
// ---- /CORS ----


//app.use(cors())
//app.options('*', cors()) // preflight

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
