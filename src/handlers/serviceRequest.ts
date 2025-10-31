import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import multipartBodyParser from '@middy/http-multipart-body-parser';
import { JiraService } from '../services/jiraService';
import { successResponse, errorResponse } from '../utils/response';
import { CreateServiceRequestRequest } from '../types';

interface MiddyEvent extends APIGatewayProxyEvent {
  body: any;
}

const createServiceRequestHandler = async (
  event: MiddyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const contentType = event.headers['Content-Type'] || event.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return errorResponse(
        'Request must be multipart/form-data', 
        400, 
        'INVALID_CONTENT_TYPE'
      );
    }
            
    let requestBody: CreateServiceRequestRequest;
    let attachments: any[] = [];

    if (event.body && typeof event.body === 'object' && !Buffer.isBuffer(event.body)) {
      const { summary, description, email, attachments: files = [] } = event.body;
      let platform = event.body.platform;
  
      if (platform) {
        try {
          platform = JSON.parse(platform);
        } catch {
          return errorResponse(
            'Incorrect form data', 
            400, 
          );
        }
      }
      requestBody = { summary, description, email, platform };
      
      const normalizedFiles = Array.isArray(files) ? files : [files];
      attachments = normalizedFiles.filter((value: any) => 
        value && typeof value === 'object' && value.content
      );
      
      if (!requestBody.summary || !requestBody.description || !requestBody.email) {
        return errorResponse('Missing required fields: summary, description, email', 400, 'MISSING_FIELDS');
      }
    } else {
      return errorResponse(
        'Failed to parse multipart form data', 
        400, 
        'MULTIPART_PARSE_ERROR'
      );
    }

    const jiraService = new JiraService();
    // Create the service request first
    const jiraResponse = await jiraService.createServiceRequest(requestBody);
    
    if (attachments.length > 0) {
      try {
        await jiraService.addAttachments(jiraResponse.issueKey, attachments);
      } catch (attachmentError) {
        console.error('Attachment upload error:', attachmentError);
      }
    }
        
    return successResponse({
      message: 'Service request created successfully',
      serviceRequest: {
        id: jiraResponse.requestId,
        issueKey: jiraResponse.issueKey,
        issueId: jiraResponse.issueId,
        portalUrl: jiraResponse.portalUrl,
        webUrl: jiraResponse._links.web,
      },
      attachmentsUploaded: attachments.length,
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

export const createServiceRequest = middy(createServiceRequestHandler)
  .use(multipartBodyParser());
