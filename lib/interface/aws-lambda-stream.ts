import {DynamoDBStreamEvent, Callback, Context} from 'aws-lambda'

export const awsLambdaDynamoDbStream = async (handler, records) => {
  const event: DynamoDBStreamEvent = {
    Records: records
  }
//  {
//    awsRegion?: string;
//    dynamodb?: StreamRecord;
//    eventID?: string;
//    eventName?: 'INSERT' | 'MODIFY' | 'REMOVE';
//    eventSource?: string;
//    eventSourceARN?: string;
//    eventVersion?: string;
//    userIdentity?: any;
//}
  const context: Context = {} as any
  const callback: Callback = () => {
  }
  handler(event, context, callback)
}
