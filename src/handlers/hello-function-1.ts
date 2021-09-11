import { APIGatewayProxyResult } from 'aws-lambda';
import { greeter } from '../greeter';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  console.log(greeter());
  return { body: JSON.stringify({ message: 'Hello F1' }), statusCode: 200 };
};