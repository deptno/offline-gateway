import {awsLambdaProxy} from '../interface/aws-lambda-proxy'
import {watch} from '../watcher'

export const registerMethods = (app, methods) => {
  watch(
    methods,
    (method, path, handler) => {
      app[method](path, async (req, res) => {
        const {statusCode, body} = await awsLambdaProxy(handler, req, res)
        return res
          .status(statusCode)
          .send(body)
      })
      console.log(`< ${method.toUpperCase()}\t${path}`)
    },
    app
  )
}
