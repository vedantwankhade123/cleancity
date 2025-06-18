# CleanCity - Waste Management App

A full-stack web application for citizens to report waste management issues and for city administrators to manage and track these reports.

## Features

- **User Management**: Registration and authentication for citizens and administrators
- **Waste Reporting**: Citizens can report waste issues with photos and location data
- **Admin Dashboard**: City administrators can view, process, and manage reports
- **Reward System**: Points-based reward system for active citizens
- **Real-time Updates**: WebSocket support for real-time notifications
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **UI Components**: Radix UI + Shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Quick Deploy to Railway

### Prerequisites
- GitHub account
- Railway account (free tier available)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all files are committed including the deployment configs

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your CleanCity repository
4. Railway will automatically detect it's a Node.js app

### Step 3: Set Up Database
1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically add the `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables
In your Railway project settings, add these environment variables:

```
DATABASE_URL=postgresql://... (automatically set by Railway)
SESSION_SECRET=your-super-secret-session-key-here
NODE_ENV=production
```

### Step 5: Deploy
1. Railway will automatically build and deploy your app
2. Your app will be available at the provided Railway URL

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `env.example` to `.env` and configure your database
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema
- `npm run db:init` - Initialize database

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret key for session encryption | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Database Schema

The app uses PostgreSQL with the following main tables:
- `users` - User accounts (citizens and admins)
- `reports` - Waste management reports
- `admin_secret_codes` - Admin registration codes

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - Get reports (filtered by user role)
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id/status` - Update report status (admin only)

### Users
- `GET /api/users` - Get users (admin only)
- `PUT /api/users/:id` - Update user (admin only)

## Deployment Options

### Railway (Recommended)
- Free tier available
- Built-in PostgreSQL support
- Automatic deployments from GitHub
- Easy environment variable management

### Render
- Free tier available
- PostgreSQL add-on support
- Automatic deployments

### Vercel + Railway
- Deploy frontend on Vercel
- Deploy backend on Railway
- Good for high-traffic applications

### Heroku
- Traditional option
- Requires credit card for PostgreSQL
- Good for established applications

## Support

For deployment issues or questions, please check the Railway documentation or create an issue in the repository. 