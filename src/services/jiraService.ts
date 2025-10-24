import axios, { AxiosResponse } from "axios";
import {
  CreateServiceRequestRequest,
  JiraServiceRequestPayload,
  JiraServiceRequestResponse,
  EnvironmentVariables,
} from "../types";

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
}
