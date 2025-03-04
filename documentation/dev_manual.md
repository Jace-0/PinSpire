# Development Manual

## Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose
- npm or yarn package manager

## Development Environment Setup

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm start

```

The frontend webpack development server will:

- Run on port 3001 by default
- Hot reload for real-time development
- Serve webpack-bundled assets

### Backend Development

1. Start Required Services:

```bash
# Start PostgreSQL and Redis containers
docker-compose -f docker-compose.test.yml up -d
```

2. Start Backend Server:

```bash
# Install dependencies
npm install

# Start development server with nodemon
npm run dev
```

The backend server will:

- Run on port 3000 by default
- Auto-reload using nodemon when files change
- Connect to PostgreSQL and Redis containers

## Testing

### Running Tests

#### Backend integration test

```bash
#  run docker containers
docker-compose -f docker-compose.test.yml up -d
```

Use development setup, as the backend is running with the same container container,

To load files see test.router on routes

## Building for Production

### Frontend Build

```bash
# Create production build
npm run build:ui
```

This will:

- Optimize assets for production
- Generate static files in the `build` directory

### Backend Production Build

1. Build Docker Image:

```bash
docker build -t pinspire-backend-app .
```

2. Run Production Container:

```bash
# Run container with port mapping
docker run -p 3000:3000 pinspire-backend-app
```

## Docker Commands Reference

```bash
# List running containers
docker ps

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# View container logs
docker logs <container_id>
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3001
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000 and 3001 are not in use
2. **Database Connection**: Verify PostgreSQL container is running
3. **Redis Connection**: Check Redis container status

### Debug Commands

```bash
# Check Docker container status
docker-compose ps

# View backend logs
docker logs pinspire-backend-app

# Check database connection
docker exec -it postgres psql -U your_user -d your_database
```
