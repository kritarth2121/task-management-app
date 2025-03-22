Postman Doc: https://documenter.getpostman.com/view/15901978/2sAYkHnxQQ

# AdonisJS Project Installation Guide

This guide will help you set up and run the AdonisJS project.

## Prerequisites
- Node.js (version 14 or later)
- npm (usually comes with Node.js)
- Git installed on your system

## Installation Steps

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-project-name.git
cd your-project-name
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the environment file
```bash
cp .env.example .env
```

### 4. Configure your environment variables
Open the `.env` file and update the following variables:
- Database connection details
- Application URL
- Any other required environment variables

### 5. Generate an application key
```bash
node ace generate:key
```
Add the generated key to your `.env` file as `APP_KEY`

### 6. Run migrations and seeders
```bash
node ace migration:run
node ace db:seed
```

### 7. Start the development server
```bash
node ace serve --watch
```

Your AdonisJS application should now be running at `http://localhost:3333`.

## API Documentation
For API documentation, please refer to the Postman collection:
[API Documentation](https://documenter.getpostman.com/view/15901978/2sAYkHnxQQ)

## Creating a new AdonisJS project (optional)
If you want to start a new AdonisJS project from scratch instead of using this one:

1. Install the AdonisJS CLI
```bash
npm i -g @adonisjs/cli
```

2. Create a new AdonisJS project
```bash
npm init adonis-ts-app my-project
```
You'll be prompted to choose a project structure:
- `web` (For full-stack web applications)
- `api` (For API servers)
- `slim` (Minimal setup)

## Common Commands
- `node ace serve --watch` - Start the development server with auto-restart
- `node ace make:controller User` - Generate a new controller
- `node ace make:model User` - Generate a new model
- `node ace make:migration users` - Generate a new migration
- `node ace list:routes` - List all registered routes