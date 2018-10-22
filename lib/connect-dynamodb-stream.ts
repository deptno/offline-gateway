import AWS from 'aws-sdk'
import R from 'ramda'
import DynamoDBStreams = require('aws-sdk/clients/dynamodbstreams')

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
  console.log('ddb params', params)
  return ddbStreams[key] = new AWS.DynamoDBStreams(params)
}

export const searchStreams = async (region, port): Promise<DynamoDBStreams.Types.StreamDescription[]> => {
  console.log('Searching Table Streams')
  const ddbStreams = getDdbStream(region, port)
  const streams = await ddbStreams
    .listStreams()
    .promise()

  if (!streams.Streams) {
    return []
  }

  const descStreams = await Promise.all(
    streams.Streams
      .filter(stream => stream.StreamArn)
      .map(stream => ddbStreams
        .describeStream({StreamArn: stream.StreamArn!})
        .promise()
        .then(stream => stream.StreamDescription)
        .catch(e => console.error(e))
      )
  )

  return descStreams.filter(Boolean) as unknown as Promise<DynamoDBStreams.StreamDescription[]>
}

/**
 * @todo support only one shard now
 */
export const getRecords = async (region, port, streams: DynamoDBStreams.StreamDescription[]) => {
  const ddbStreams = getDdbStream(region, port)
  const shards = streams[0].Shards
  const arn = streams[0].StreamArn!

  if (!shards || shards.length === 0) {
    return
  }

  const iter = await ddbStreams
    .getShardIterator({
      ShardId: shards[0].ShardId!,
      StreamArn: arn,
      ShardIteratorType: 'LATEST'
    })
    .promise()

  if (!iter || !iter.ShardIterator) {
    return
  }
  const {ShardIterator} = iter
  const records = await ddbStreams
    .getRecords({ShardIterator})
    .promise()

  return records
}
