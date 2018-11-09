import {getRecordBox} from '../connect-dynamodb-stream'
import {awsLambdaDynamoDbStream} from '../interface/aws-lambda-stream'
import {watch} from '../watcher'

export const registerStreams = (interval, methods) => {
  const listeners: Map<string, StreamTuple> = new Map()
  const run = () => {
    for (const [key, {recordBox, handler}] of listeners) {
      recordBox()
        .then(records => {
          if (!records) {
            return
          }
          if (records.length === 0) {
            return
          }
          awsLambdaDynamoDbStream(handler, records)
        })
    }
  }

  watch(methods, async (method, path, handler) => {
    const [region, port, tableName] = path
      .slice(1)
      .split('/')
    if (!(region && port && tableName)) {
      console.log(`⛑ ️${method.toUpperCase()}\t${path}, Filename requires \`ddb.region.port.tablename.js\` format`)
      return
    }
    if (typeof handler !== 'function') {
      console.log(`⛑ ️${method.toUpperCase()}\t${path}, Invalid function`)
    }
    const key = [method, path].join('#')
    const recordBox = await getRecordBox(region, port, tableName)

    if (!recordBox) {
      console.log(`⛑ ️${method.toUpperCase()}\t${path}, Can't find shard, this stream will be ignored.`)
      return
    }

    listeners.set(key, {recordBox, handler})

    console.log('watch result', methods)
    console.log(`< ⛵️${method.toUpperCase()}\t${path}`)
  })

  setInterval(run, interval)
}

interface StreamTuple {
  recordBox: () => Promise<any[]>
  handler(): void
}