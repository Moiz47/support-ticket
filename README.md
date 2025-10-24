# JIRA Service Request API

A TypeScript Node.js backend API deployed on AWS Lambda with API Gateway for creating JIRA Service Management requests. This project includes automated CI/CD with GitHub Actions.

## 🚀 Features

- **TypeScript**: Fully typed with strict TypeScript configuration
- **AWS Lambda**: Serverless deployment with automatic scaling
- **API Gateway**: RESTful API with CORS support
- **JIRA Integration**: Direct integration with JIRA Service Management API
- **CI/CD**: Automated deployment with GitHub Actions
- **Testing**: Comprehensive test suite with Jest
- **Validation**: Request validation with detailed error messages
- **Health Check**: Built-in health check endpoint

## 📋 Prerequisites

- Node.js 18.x or later
- npm or yarn
- AWS CLI configured with appropriate credentials
- JIRA Service Management instance with API access
- GitHub repository with Actions enabled

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd support-ticket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your JIRA credentials:
   ```env
   JIRA_BASE_URL=https://your-company.atlassian.net
   JIRA_SERVICE_DESK_ID=1
   JIRA_API_TOKEN=your-jira-api-token-here
   JIRA_USER_EMAIL=your-email@company.com
   ```

## 🔧 Development

### Local Development

```bash
# Start local development server
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Testing the API Locally

The API will be available at `http://localhost:3000` when running `npm run dev`.

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Create Service Request:**
```bash
curl -X POST http://localhost:3000/service-request \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test service request",
    "description": "This is a test service request from the API",
    "requestTypeId": "your-request-type-id",
    "priority": "Medium",
    "reporterEmail": "reporter@example.com"
  }'
```

## 🚀 Deployment

### Manual Deployment

```bash
# Deploy to dev environment
npm run deploy

# Deploy to production
npm run deploy:prod
```

### CI/CD with GitHub Actions

The project includes automated CI/CD workflows:

1. **On Pull Request**: Deploys to dev environment
2. **On Push to Main**: Deploys to production environment

#### Required GitHub Secrets

Set up the following secrets in your GitHub repository:

**AWS Credentials:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

**JIRA Credentials (Dev Environment):**
- `DEV_JIRA_BASE_URL`
- `DEV_JIRA_SERVICE_DESK_ID`
- `DEV_JIRA_API_TOKEN`
- `DEV_JIRA_USER_EMAIL`

**JIRA Credentials (Production Environment):**
- `PROD_JIRA_BASE_URL`
- `PROD_JIRA_SERVICE_DESK_ID`
- `PROD_JIRA_API_TOKEN`
- `PROD_JIRA_USER_EMAIL`

## 📖 API Documentation

### Endpoints

#### `GET /health`
Health check endpoint to verify API and JIRA connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "environment": "dev",
    "checks": {
      "environment": true,
      "jiraConnection": true
    }
  }
}
```

#### `POST /service-request`
Create a new JIRA Service Management request.

**Request Body:**
```json
{
  "summary": "Brief summary of the request",
  "description": "Detailed description of the request",
  "requestTypeId": "JIRA request type ID",
  "priority": "Low|Medium|High|Highest",
  "reporterEmail": "reporter@example.com",
  "customFields": {
    "customfield_10001": "Custom value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Service request created successfully",
    "serviceRequest": {
      "id": "12345",
      "issueKey": "IT-123",
      "issueId": "10001",
      "portalUrl": "https://your-company.atlassian.net/servicedesk/customer/portal/1/IT-123",
      "webUrl": "https://your-company.atlassian.net/browse/IT-123"
    }
  }
}
```

### Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## 🔐 Security

- API tokens are stored as environment variables
- CORS is configured for cross-origin requests
- Input validation prevents malicious payloads
- No sensitive data is logged

## 🏗️ Architecture

```
src/
├── handlers/           # Lambda function handlers
│   ├── serviceRequest.ts
│   └── health.ts
├── services/          # Business logic services
│   └── jiraService.ts
├── utils/             # Utility functions
│   ├── response.ts
│   └── validation.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── schemas/           # JSON schemas for validation
│   └── serviceRequest.json
└── __tests__/         # Test files
    └── utils/
```

## 🧪 Testing

The project includes comprehensive tests for:
- Input validation
- Response formatting
- JIRA service integration
- Error handling

Run tests with:
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

## 🔍 Troubleshooting

### Common Issues

1. **JIRA Connection Errors**
   - Verify JIRA_BASE_URL is correct
   - Check API token permissions
   - Ensure service desk ID exists

2. **Deployment Failures**
   - Verify AWS credentials are correct
   - Check IAM permissions for Lambda and API Gateway
   - Ensure region is correctly set

3. **Request Type ID Issues**
   - Use JIRA REST API to get valid request type IDs:
     ```
     GET /rest/servicedeskapi/servicedesk/{serviceDeskId}/requesttype
     ```

### Getting JIRA Request Type IDs

1. Navigate to your JIRA Service Management project
2. Go to Project Settings > Request types
3. Use the REST API to get request type IDs:
   ```bash
   curl -X GET \
     https://your-company.atlassian.net/rest/servicedeskapi/servicedesk/1/requesttype \
     -H "Authorization: Basic <base64-encoded-email:token>"
   ```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review JIRA Service Management API documentation