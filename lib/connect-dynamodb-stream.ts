import AWS from 'aws-sdk'
import debug from 'debug'

const log = debug('ogw:ddb')

const ddbStreams = {}
const getDdbStream = (region, port): AWS.DynamoDBStreams => {
  const key = region + port

  if (ddbStreams[key]) {
    return ddbStreams[key]
  }
  const params = {
    region,
    endpoint: `http://localhost:${port}`,
  }
  log('ddb params', params)
  return ddbStreams[key] = new AWS.DynamoDBStreams(params)
}

export const getRecordBox = async (region, port, tableName): Promise<(() => Promise<any[]>) | undefined> => {
  log('Searching Table Streams')
  const ddbStreams = getDdbStream(region, port)
  const streams = await ddbStreams
    .listStreams()
    .promise()

  if (!streams.Streams) {
    return
  }

  const tableStreams = streams.Streams.filter(stream => stream.StreamArn && stream.TableName === tableName)
  const stream = tableStreams[0]
  log('tableStreams', tableStreams)
  log('stream', stream)

  if (!stream || !stream.StreamArn) {
    return
  }

  const description = await ddbStreams
    .describeStream({StreamArn: stream.StreamArn})
    .promise()

  if (!description) {
    return
  }
  log('description', description)

  if (!description.StreamDescription) {
    return
  }

  const {Shards, StreamArn} = description.StreamDescription

  if (!Shards) {
    return
  }
  if (Shards.length === 0) {
    return
  }
  if (!StreamArn) {
    return
  }
  const [shard] = Shards.filter(shard => {
    if (!shard) {
      return false
    }
    if (!shard.SequenceNumberRange) {
      return false
    }
    return !shard.SequenceNumberRange.EndingSequenceNumber
  })

  const {ShardId, ParentShardId, SequenceNumberRange} = shard

  if (!ShardId) {
    return
  }

  const {ShardIterator} = await ddbStreams
    .getShardIterator({
      StreamArn,
      ShardId          : ShardId,
      ShardIteratorType: 'LATEST'
    })
    .promise()

  if (!ShardIterator) {
    return
  }

  return createRecordsGetter(ddbStreams, ShardIterator)
}

const createRecordsGetter = (ddbStreams, firstIter) => {
  let iter = firstIter
  return async () => {
    if (!iter) {
      log('ShardIterator', iter)
      return []
    }
    const {Records, NextShardIterator} = await ddbStreams
      .getRecords({
        ShardIterator: iter
      })
      .promise()
    iter = NextShardIterator
    log('ShardIterator', iter)
    return Records
  }
}
