import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types';

export function createResponse<T>(
  statusCode: number,
  body: ApiResponse<T>,
  headers: Record<string, string> = {}
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function successResponse<T>(data: T, statusCode = 200): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: true,
    data,
  });
}

export function errorResponse(
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    success: false,
    error: {
      message,
      code,
      details,
    },
  });
}
