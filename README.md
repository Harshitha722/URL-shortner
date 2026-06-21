
# URL Shortener

A modern URL shortener built with React (frontend) and Node.js + Express + MongoDB (backend). It provides quick URL shortening, validation, and a clean interface for presenting on GitHub.

## Features

- Shorten long URLs with a clean professional UI
- Strict URL validation in both frontend and backend
- Prevents invalid or suspicious URL formats
- History saved locally in the browser
- Toast notifications for success and error states
- Security enhancements on backend using Helmet, CORS, and rate limiting

## Folder Structure

- `frontend/` - React app using Vite
- `backend/` - Express server with MongoDB storage
- `.gitignore` - Root ignore rules for project artifacts

## Prerequisites

- Node.js v18+ or later
- npm
- MongoDB connection URI

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd url-shortener
```

2. Create a `.env` file in the `backend/` folder with:

```env
MONGO_URI=your_mongodb_connection_string
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
PORT=5000
```

3. Install dependencies for frontend and backend:

```bash
cd frontend
npm install
cd ../backend
npm install
```

## Run the App

Open two terminals and start both apps:

```bash
# terminal 1
cd backend
npm run dev
```

```bash
# terminal 2
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `BASE_URL` - Backend base URL for generating shortened links
- `FRONTEND_URL` - Allowed frontend origin for CORS
- `PORT` - Backend server port

## Validation and Security

- URL format is validated before shortening
- Only `http://` and `https://` URLs are accepted
- Malicious schemes are blocked (`javascript:`, `data:`, `vbscript:`, `about:`)
- Backend uses `helmet` for secure headers
- Backend uses `express-rate-limit` to prevent abuse
- CORS is restricted to the frontend origin
- Request body size is limited for safety

## Notes

- The frontend automatically adds `https://` if missing
- URL history is stored locally in the browser
- Existing URLs are returned if already shortened

## License

This project is available under the MIT License.
