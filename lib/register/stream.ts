import {getRecords, searchStreams} from '../connect-dynamodb-stream'
import {awsLambdaDynamoDbStream} from '../interface/aws-lambda-stream'
import {watch} from '../watcher'
import DynamoDBStreams = require('aws-sdk/clients/dynamodbstreams')

export const registerStreams = (interval, streams) => {
  console.log(':: Listeners')
  const listeners: Map<string, StreamTuple> = new Map()
  const run = () => {
    for (const [key, {region, port, streams, handler}] of listeners) {
      streams.map(stream => {
        stream.Shards
      })
      getRecords(region, port, streams)
        .then(response => {
          console.log('response', response)
          if (response) {
            if (response.Records) {
              if (response.Records.length > 0) {
                awsLambdaDynamoDbStream(handler, response)
              }
            }
          }
        })
    }
  }

  watch(streams, async (method, path, handler) => {
    const [region, port, tableName] = path
      .slice(1)
      .split('/')
    if (!(region && port && tableName)) {
      console.log(`⛑ ️${method.toUpperCase()}\t${path}, filename requires \`ddb.region.port.tablename.js\` format`)
      return
    }
    if (typeof handler !== 'function') {
      console.log(`⛑ ️${method.toUpperCase()}\t${path}, invalid function`)
    }
    const key = [method, path].join('#')
    const streams = await searchStreams(region, port)
    listeners.set(key, {
      region,
      port,
      streams,
      handler
    })
    console.log(`< ⛵️${method.toUpperCase()}\t${path}`)
  })

  setInterval(run, interval)
}

interface StreamTuple {
  region: string
  port: string
  streams: DynamoDBStreams.Types.StreamDescription[]
  handler(): void
}