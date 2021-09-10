import { APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  return { body: JSON.stringify({ message: 'Hello F2?' }), statusCode: 200 };
};