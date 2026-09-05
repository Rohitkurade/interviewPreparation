# AI Interview Platform

An AI-powered interview practice platform with a React frontend, Express API, PostgreSQL database, Prisma ORM, and Groq-powered question generation and evaluation.

## Project Structure

- `client/` - React, TypeScript, and Vite frontend
- `server/` - Express, TypeScript, Prisma, and PostgreSQL backend
- `postman/` - API collections and supporting Postman files

## Prerequisites

- Node.js 20 or newer
- PostgreSQL
- A Groq API key

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/Rohitkurade/interviewPreparation.git
cd interviewPreparation

cd server
npm install

cd ../client
npm install
```

Create `server/.env` with your PostgreSQL connection string and Groq API key:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/interview_platform"
GROQ_API_KEY="your-groq-api-key"
```

Run the database migrations:

```bash
cd server
npx prisma migrate deploy
```

For local schema development, use:

```bash
npx prisma migrate dev
```

## Running Locally

Start the backend in one terminal:

```bash
cd server
npm run dev
```

The API runs at `http://localhost:5000`.

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

The Vite development server prints its local URL in the terminal.

## Useful Commands

### Client

```bash
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run build
npm run start
npm run contract:emit
```

## API Health Check

Once the server is running, visit or request:

```text
GET http://localhost:5000/api/health
```

A successful response confirms that the API and database are connected.

## Security

Do not commit `server/.env` or any API keys. Use environment variables for database credentials and external service credentials.
