# Deployment Guide

This guide walks you through deploying the JIRA Service Request API to AWS Lambda with automated CI/CD.

## 🔧 Initial Setup

### 1. AWS Prerequisites

1. **AWS Account**: Ensure you have an AWS account with appropriate permissions
2. **IAM User**: Create an IAM user with the following policies:
   - `AWSLambdaFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `IAMFullAccess` (for Serverless Framework to create roles)
   - `AWSCloudFormationFullAccess`
   - `AmazonS3FullAccess`

3. **AWS CLI**: Install and configure AWS CLI
   ```bash
   aws configure
   ```

### 2. JIRA Prerequisites

1. **API Token**: Generate a JIRA API token from your Atlassian account
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Copy the token (you won't be able to see it again)

2. **Service Desk ID**: Find your service desk ID
   - Navigate to your JIRA Service Management project
   - The ID is visible in the project URL or use the API:
     ```bash
     curl -X GET \
       https://your-company.atlassian.net/rest/servicedeskapi/servicedesk \
       -H "Authorization: Basic <base64-encoded-email:token>"
     ```

3. **Request Type IDs**: Get valid request type IDs for your service desk
   ```bash
   curl -X GET \
     https://your-company.atlassian.net/rest/servicedeskapi/servicedesk/{serviceDeskId}/requesttype \
     -H "Authorization: Basic <base64-encoded-email:token>"
   ```

## 🚀 Manual Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with your configuration:
```env
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_SERVICE_DESK_ID=1
JIRA_API_TOKEN=your-jira-api-token-here
JIRA_USER_EMAIL=your-email@company.com
```

### 3. Test Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start local development server
npm run dev
```

Test the endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Create service request
curl -X POST http://localhost:3000/service-request \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test service request",
    "description": "This is a test",
    "requestTypeId": "your-request-type-id"
  }'
```

### 4. Deploy to AWS

```bash
# Deploy to dev environment
npm run deploy

# Deploy to production
npm run deploy:prod
```

### 5. Test Deployed API

After deployment, Serverless Framework will output the API Gateway URLs:
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/service-request
  GET - https://abc123.execute-api.us-east-1.amazonaws.com/dev/health
```

Test the deployed endpoints:
```bash
# Health check
curl https://your-api-gateway-url/dev/health

# Create service request
curl -X POST https://your-api-gateway-url/dev/service-request \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test service request",
    "description": "This is a test",
    "requestTypeId": "your-request-type-id"
  }'
```

## 🔄 Automated CI/CD with GitHub Actions

### 1. Fork/Clone Repository

Ensure your code is in a GitHub repository with Actions enabled.

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### AWS Credentials
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key  
- `AWS_REGION`: Your preferred AWS region (e.g., `us-east-1`)

#### Development Environment
- `DEV_JIRA_BASE_URL`: https://your-dev-company.atlassian.net
- `DEV_JIRA_SERVICE_DESK_ID`: Your dev service desk ID
- `DEV_JIRA_API_TOKEN`: Your dev JIRA API token
- `DEV_JIRA_USER_EMAIL`: your-dev-email@company.com

#### Production Environment  
- `PROD_JIRA_BASE_URL`: https://your-company.atlassian.net
- `PROD_JIRA_SERVICE_DESK_ID`: Your production service desk ID
- `PROD_JIRA_API_TOKEN`: Your production JIRA API token
- `PROD_JIRA_USER_EMAIL`: your-email@company.com

### 3. Workflow Triggers

The GitHub Actions workflow is configured to:

1. **On Pull Request**: 
   - Run tests and linting
   - Deploy to dev environment
   - Useful for testing changes before merging

2. **On Push to Main Branch**:
   - Run tests and linting  
   - Deploy to production environment
   - Automatic production deployment on merge

### 4. Monitoring Deployments

Monitor deployments in the GitHub Actions tab:
- View logs for each deployment step
- Check for errors or failures
- See deployment URLs and endpoints

## 🔧 Environment Configuration

### Development vs Production

The project supports multiple environments with different configurations:

**Development (dev)**:
- Stage: `dev`
- Lower resource limits
- Separate JIRA instance/credentials
- Used for testing

**Production (prod)**:
- Stage: `prod`  
- Higher resource limits
- Production JIRA instance
- Used for live requests

### Custom Environments

To create additional environments (e.g., staging):

1. Update `serverless.yml` if needed
2. Add environment-specific secrets in GitHub
3. Modify the GitHub Actions workflow to include the new environment

## 🔍 Troubleshooting Deployment Issues

### Common Deployment Errors

1. **IAM Permissions Error**
   ```
   Error: The role defined for the function cannot be assumed by Lambda
   ```
   **Solution**: Ensure your AWS user has sufficient IAM permissions

2. **API Gateway Timeout**  
   ```
   Error: Request timed out
   ```
   **Solution**: Check Lambda function timeout settings in `serverless.yml`

3. **Environment Variable Missing**
   ```
   Error: JIRA_BASE_URL is required
   ```
   **Solution**: Verify all required environment variables are set

4. **JIRA API Authentication Error**
   ```
   Error: JIRA API Error (401): Unauthorized
   ```
   **Solution**: 
   - Verify API token is correct
   - Ensure email address matches the token owner
   - Check token permissions

### Debugging Deployed Functions

1. **View Logs**:
   ```bash
   # View logs for specific function
   serverless logs -f createServiceRequest -t
   
   # View logs in AWS Console
   # Go to CloudWatch → Log groups → /aws/lambda/your-function-name
   ```

2. **Test Function Directly**:
   ```bash
   # Invoke function directly (bypass API Gateway)
   serverless invoke -f createServiceRequest -d '{"body": "{\"summary\":\"test\"}"}'
   ```

3. **Check API Gateway**:
   - Go to AWS Console → API Gateway
   - Test endpoints directly
   - Check CORS configuration

### Rolling Back Deployments

If you need to rollback a deployment:

```bash
# Remove current deployment
npm run remove

# Deploy previous version
git checkout previous-commit
npm run deploy:prod
```

## 📊 Monitoring and Observability

### AWS CloudWatch

Monitor your Lambda functions:
- **Metrics**: Invocations, errors, duration
- **Logs**: Function execution logs
- **Alarms**: Set up alerts for errors or high latency

### Health Checks

Use the `/health` endpoint to monitor API status:
- Set up external monitoring (e.g., Pingdom, DataDog)
- Check JIRA connectivity
- Monitor response times

### Cost Monitoring

Monitor AWS costs:
- Lambda invocations and duration
- API Gateway requests
- CloudWatch logs storage

## 🔒 Security Best Practices

1. **API Tokens**: Never commit API tokens to version control
2. **Environment Variables**: Use GitHub Secrets for sensitive data
3. **IAM Policies**: Follow least privilege principle
4. **CORS**: Configure appropriate CORS settings
5. **Input Validation**: Always validate input data
6. **Logging**: Don't log sensitive information

## 📈 Scaling Considerations

### Lambda Scaling
- AWS Lambda automatically scales based on request volume
- Configure reserved concurrency if needed
- Monitor cold start times

### API Gateway Limits
- Default: 10,000 requests per second per region
- Request throttling and quotas can be configured
- Consider caching for frequently accessed data

### JIRA API Limits
- Be aware of JIRA API rate limits
- Implement retry logic with exponential backoff
- Consider request queuing for high-volume scenarios
