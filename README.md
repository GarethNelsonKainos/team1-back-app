# team1-back-app 
Team 1 Backend Application Feb/March 2026

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Server runs on http://localhost:${PORT} (default is http://localhost:3001 when `PORT` is not set or is 3001 in `.env`)
Health check: http://localhost:${PORT}/health (for the default port this is http://localhost:3001/health)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Testing

Tests are located in the `/test/` directory and mirror the `/src/` structure:
- Unit tests use Jest + Supertest
- Run `npm test` for single test run
- Run `npm run test:watch` for development
- Coverage reports generated in `/coverage/`

### Environment Variables

Required environment variables:
- `PORT` - Server port (default: 3001)

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

## Production Deployment

### Docker

Build and run with Docker:
```bash
# Build the image
docker build -t team1-back-app .

# Run the container
docker run -p 3001:3001 team1-back-app
```

### AWS Deployment

The application is configured for AWS ECS deployment:

1. **ECR Repository**: Stores Docker images
2. **ECS Fargate**: Runs containers without managing servers
3. **GitHub Actions**: Automated CI/CD pipeline

#### Prerequisites
- AWS Account with appropriate permissions
- ECR repository created
- ECS cluster and service configured
- GitHub secrets configured

#### Required GitHub Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

#### Deployment Process
1. Push to `main` branch triggers GitHub Actions
2. Tests run automatically
3. Docker image builds and pushes to ECR
4. ECS task definition updates
5. New version deploys to production

#### Manual Deployment
```bash
# Build and push to ECR manually
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com
docker build -t team1-back-app .
docker tag team1-back-app:latest YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/team1-back-app:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/team1-back-app:latest
```

## API Documentation

### Endpoints

#### Health Check
- **GET** `/health`
- Returns: `{ "status": "OK" }`
- Use for monitoring and load balancer health checks

## Project Structure

```
src/
├── index.ts          # Main application entry point
test/
├── index.test.ts     # API endpoint tests
.github/
└── workflows/
    └── deploy.yml    # CI/CD pipeline
Dockerfile            # Container configuration
task-definition.json  # ECS deployment configuration
```
