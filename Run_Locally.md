# Running the Kids Church Check-in System Locally

This guide will help you set up and run the Kids Church Check-in system on your local computer.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

- **Node.js** (version 20 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/pretoriusxander42-creator/kids-church.git
cd kids-church
```

## Step 2: Install Dependencies

Install all the required npm packages:

```bash
npm ci
```

This will install all dependencies listed in `package.json` including Express, TypeScript, ESLint, and testing tools.

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor and set your values:
   ```
   PORT=4000
   SESSION_SECRET=your-secret-here-change-this
   JWT_SECRET=your-jwt-secret-here-change-this
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kids_church
   ```

   **Note**: For local development, you can use any random string for the secrets. For production, use strong, randomly generated secrets.

## Step 4: Start the Development Server

Start the server with hot-reload enabled:

```bash
npm run dev
```

You should see output like:
```
Server listening on port 4000
```

## Step 5: Test the Application

### Test the Health Endpoint

Open your browser or use curl to test the health endpoint:

**Browser**: Navigate to `http://localhost:4000/health`

**curl**:
```bash
curl http://localhost:4000/health
```

You should see a response like:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T13:56:47.857Z"
}
```

### Test the Protected Endpoint

The `/app` endpoint requires a JWT token. Here's how to test it:

#### Option 1: Using curl

First, create a JWT token using your JWT_SECRET. You can use an online JWT generator like [jwt.io](https://jwt.io/) or create one programmatically.

Example payload:
```json
{
  "sub": "dev-user",
  "role": "ADMIN"
}
```

Then make a request:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:4000/app
```

#### Option 2: Using a REST Client

Use tools like:
- **Postman** - [Download here](https://www.postman.com/downloads/)
- **Insomnia** - [Download here](https://insomnia.rest/download)
- **VS Code REST Client** extension

Create a request:
```
GET http://localhost:4000/app
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected response:
```json
{
  "message": "Hello Dashboard",
  "user": {
    "sub": "dev-user",
    "role": "ADMIN"
  }
}
```

## Development Commands

Here are all the available npm scripts:

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build TypeScript to JavaScript (output in `dist/` folder)
- **`npm start`** - Start production server (must run `npm run build` first)
- **`npm run lint`** - Run ESLint to check code quality
- **`npm test`** - Run tests with Vitest

## Building for Production

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### Port Already in Use

If you see an error that port 4000 is already in use, either:
- Stop the application using that port
- Change the `PORT` in your `.env` file to a different number (e.g., 4001)

### Module Not Found Errors

If you see module import errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Build Errors

If the build fails, check:
- You have TypeScript installed: `npm list typescript`
- Your Node.js version is 20 or higher: `node --version`
- Try cleaning the build: `rm -rf dist && npm run build`

## Project Structure

```
kids-church/
├── src/                    # Source TypeScript files
│   ├── server.ts          # Main Express server
│   ├── middleware/        # Express middleware
│   │   └── auth.ts        # JWT authentication
│   └── routes/            # API route handlers
│       ├── health.ts      # Health check endpoint
│       └── app.ts         # Protected app endpoint
├── tests/                 # Test files
├── dist/                  # Compiled JavaScript (after build)
├── .env                   # Environment variables (create from .env.example)
├── package.json           # Node.js dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Next Steps

After you have the server running locally, you can:

1. Explore the API endpoints in `src/routes/`
2. Modify the server configuration in `src/server.ts`
3. Add new endpoints or middleware
4. Run tests with `npm test`
5. Check code quality with `npm run lint`

## Getting Help

If you encounter any issues:

1. Check the [README.md](README.md) for additional information
2. Review the error messages carefully
3. Ensure all prerequisites are installed correctly
4. Open an issue on GitHub if you need further assistance
