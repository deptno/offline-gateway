import express from 'express'
import {registerMethods} from './register/method'
import {registerStreams} from './register/stream'

const app = express()
const port = process.env.PORT || 3000

!async function main() {
  const methods = ['post', 'get', 'put', 'patch', 'delete']
  const streams = ['ddb']

  registerMethods(app, methods)
  registerStreams(5000, streams)

  app.listen(port, () => console.log(`:mushroom: offline-gateway Ready to work ${port}`))
}()
