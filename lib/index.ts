import express from 'express'
import R from 'ramda'
import {awsLambdaProxy} from './interface/aws-lambda-proxy'
import {registerMethods} from './register/method'
import {registerStreams} from './register/stream'
import {toUpperDupe} from './to-upper-dupe'
import {watch} from './watcher'

const app = express()
const port = process.env.PORT || 3000

async function main() {
  const methods = ['post', 'get', 'put', 'patch', 'delete']
  const streams = ['ddb']

  registerMethods(app, methods)
  registerStreams(1000, streams)
  console.log(':: Listeners')
//    matches.forEach(async route => {
//      const [method, region, port, tableName] = route.split('.')
//
//      const streams = await searchStream(region, port)
//
//      console.log('streams', streams)
//      const path = '/' + [region, port, tableName].join('/')
//      const handler = require(resolve(route))
//
//      listeners.push(`⛵️ ${method.toUpperCase()}\t ${path}`)
//      awsLambdaDynamoDbStream(handler, region, port, tableName)
//    })
//  }

  app.listen(port, () => console.log(`:mushroom: offline-gateway Ready to work ${port}`))
}

const createPattern = R.compose(
  R.append('!node_modules'),
  R.chain(R.concat(R.__, `.*.js`)),
  toUpperDupe)

main()
