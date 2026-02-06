Uzimacare Convex Backend

This is the backend for the Uzimacare project, built using Convex
 for serverless data and authentication management.

The backend is connected to the Convex deployment fearless-kudu-656
.

Project Structure

Frontend: The frontend code is located in the app directory and is built with Vite
.

Backend: The backend code resides in the convex directory.

To start both frontend and backend servers locally:

npm run dev

App Authentication

The app uses Convex Auth
 for authentication. Currently, it is configured with Anonymous sign-in for development purposes. You may want to update this before deploying to production.

Developing and Deploying

For more information on developing with Convex:

Convex Overview
 – A good starting point if you're new to Convex.

Hosting and Deployment
 – Learn how to deploy your app to production.

Best Practices
 – Tips for improving your app’s performance, security, and maintainability.

HTTP API

User-defined HTTP routes are defined in convex/router.ts. These routes are separated from convex/http.ts to maintain control over authentication endpoints.