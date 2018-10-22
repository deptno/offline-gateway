import {APIGatewayProxyEvent, APIGatewayProxyHandler, Callback, Context} from 'aws-lambda'

export const awsLambdaProxy = async (handler, req, res) => {
  const event = {
    headers: req.headers,
    body   : req.body
  } as APIGatewayProxyEvent
  const context: Context = {} as any
  const callback: Callback = () => {
  }
  return await handler(event, context, callback)
}
