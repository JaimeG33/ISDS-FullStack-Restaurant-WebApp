import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { allowedOrigins, createApi } from './api.js'
import { readConnectionTest } from './database.js'

const api = createApi(readConnectionTest, allowedOrigins())

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  return api({
    method: event.requestContext.http.method,
    path: event.rawPath,
    origin: event.headers.origin,
    requestId: context.awsRequestId,
  })
}
