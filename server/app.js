import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { config } from 'dotenv'

// Import .env file
config()

const app = express()

app.use(morgan('common'))
app.use(helmet())
app.use(
  cors({
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(compression())
app.use(express.static('build'))

if (process.env.FABRIC.toLowerCase() === 'true') {
  require('./fabric/init')
  const { length, blocks, channel } = require('./routes')

  app.get('/api/channel', (req, res) => channel(res))

  app.get('/api/length', (req, res) => length(res))

  app.get('/api/blocks', (req, res) => blocks(res))

  app.get('/api/filtered/blocks', (req, res) => blocks(res, { filtered: true }))

  app.get('/api/blocks/:id', ({ params }, res) => {
    const blockId = parseInt(params.id)
    return blocks(res, { blockId })
  })

  app.get('/api/filtered/blocks/:id', ({ params }, res) => {
    const blockId = parseInt(params.id)
    return blocks(res, { blockId, filtered: true })
  })
}

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
})
