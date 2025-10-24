// Common types for the application

export interface JiraServiceRequestPayload {
  serviceDeskId: string;
  requestTypeId: string;
  raiseOnBehalfOf: string;
  requestFieldValues: {
    summary: string;
    description: string;
    platform?: string;
    attachments?: string[];
  };
}

export interface JiraServiceRequestResponse {
  issueId: string;
  issueKey: string;
  requestId: string;
  portalUrl: string;
  _links: {
    jiraRest: string;
    web: string;
    self: string;
    agent: string;
  };
}

export interface CreateServiceRequestRequest {
  email: string;
  summary: string;
  description: string;
  platform?: string;
  attachments?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface EnvironmentVariables {
  JIRA_BASE_URL: string;
  JIRA_SERVICE_DESK_ID: string;
  JIRA_API_TOKEN: string;
  JIRA_USER_EMAIL: string;
  JIRA_REQUEST_TYPE_ID: string;
  NODE_ENV: string;
}
