import { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  return { body: JSON.stringify({ message: 'Hello F1' }), statusCode: 200 };
};