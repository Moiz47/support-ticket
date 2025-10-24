import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { JiraService } from '../services/jiraService';
import { successResponse, errorResponse } from '../utils/response';
import { CreateServiceRequestRequest } from '../types';

export const createServiceRequest = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {

    // Parse and validate request body
    let requestBody: CreateServiceRequestRequest;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return errorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
    
    const jiraService = new JiraService();
    const jiraResponse = await jiraService.createServiceRequest(requestBody!);
        
    return successResponse({
      message: 'Service request created successfully',
      serviceRequest: {
        id: jiraResponse.requestId,
        issueKey: jiraResponse.issueKey,
        issueId: jiraResponse.issueId,
        portalUrl: jiraResponse.portalUrl,
        webUrl: jiraResponse._links.web,
      },
    }, 201);

  } catch (error) {
    console.error('Error creating service request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isJiraError = errorMessage.includes('JIRA API Error');
    
    return errorResponse(
      isJiraError ? errorMessage : 'Failed to create service request',
      isJiraError ? 502 : 500,
      isJiraError ? 'JIRA_API_ERROR' : 'INTERNAL_ERROR',
      { originalError: errorMessage }
    );
  }
};
