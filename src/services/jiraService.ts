import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import {
  CreateServiceRequestRequest,
  JiraServiceRequestPayload,
  JiraServiceRequestResponse,
  EnvironmentVariables,
} from "../types";

interface MiddyFile {
  filename: string;
  mimetype: string;
  content: Buffer;
}

export class JiraService {
  private readonly baseUrl: string;
  private readonly serviceDeskId: string;
  private readonly apiToken: string;
  private readonly userEmail: string;
  private readonly requestTypeId: string;

  constructor() {
    const env = process.env as unknown as EnvironmentVariables;
    this.baseUrl = env.JIRA_BASE_URL;
    this.serviceDeskId = env.JIRA_SERVICE_DESK_ID;
    this.requestTypeId = env.JIRA_REQUEST_TYPE_ID;
    this.apiToken = env.JIRA_API_TOKEN;
    this.userEmail = env.JIRA_USER_EMAIL;
  }

  private getAuthHeaders(): Record<string, string> {
    const auth = Buffer.from(`${this.userEmail}:${this.apiToken}`).toString(
      "base64"
    );
    return {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private getAuthHeadersForAttachment(): Record<string, string> {
    const auth = Buffer.from(`${this.userEmail}:${this.apiToken}`).toString(
      "base64"
    );
    return {
      Authorization: `Basic ${auth}`,
      "X-Atlassian-Token": "no-check", // Required for file uploads
    };
  }

  async createServiceRequest(
    request: CreateServiceRequestRequest
  ): Promise<JiraServiceRequestResponse> {
    const payload: JiraServiceRequestPayload = {
      serviceDeskId: this.serviceDeskId,
      requestTypeId: this.requestTypeId,
      raiseOnBehalfOf: request.email,
      requestFieldValues: {
        summary: request.summary,
        description: request.description,
      },
    };

    try {
      const response: AxiosResponse<JiraServiceRequestResponse> =
        await axios.post(
          `${this.baseUrl}/rest/servicedeskapi/request`,
          payload,
          {
            headers: this.getAuthHeaders(),
            timeout: 30000,
          }
        );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        const errorCode = error.response?.status?.toString() || "UNKNOWN";

        throw new Error(`JIRA API Error (${errorCode}): ${errorMessage}`);
      }

      throw new Error(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async addAttachments(
    issueIdOrKey: string,
    attachments: MiddyFile[]
  ): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    const formData = new FormData();
    
    // Add each file to the form data
    for (const file of attachments) {
      formData.append('file', file.content, {
        filename: file.filename,
        contentType: file.mimetype,
      });
    }

    try {
      await axios.post(
        `${this.baseUrl}/rest/api/2/issue/${issueIdOrKey}/attachments`,
        formData,
        {
          headers: {
            ...this.getAuthHeadersForAttachment(),
            ...formData.getHeaders(),
          },
          timeout: 60000, // Longer timeout for file uploads
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        const errorCode = error.response?.status?.toString() || "UNKNOWN";

        throw new Error(`JIRA Attachment Error (${errorCode}): ${errorMessage}`);
      }

      throw new Error(
        `Unexpected attachment error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
