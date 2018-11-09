import {DynamoDBStreamEvent, Callback, Context} from 'aws-lambda'

export const awsLambdaDynamoDbStream = async (handler, records) => {
  const event: DynamoDBStreamEvent = {
    Records: records
  }
  const context: Context = {} as any
  const callback: Callback = () => {
  }
  handler(event, context, callback)
}
