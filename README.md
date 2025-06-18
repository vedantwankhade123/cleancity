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
- **Database**: PostgreSQL with Drizzle ORM (Neon)
- **Authentication**: Session-based with Passport.js
- **UI Components**: Radix UI + Shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## 🚀 Quick Deploy to Vercel + Neon (Free Forever)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Neon database (you already have this!)

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all files are committed including the deployment configs

### Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `vedantwankhade123/Cleancity`
4. Vercel will automatically detect it's a Node.js app

### Step 3: Configure Project Settings
1. **Framework Preset**: `Node.js`
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run vercel-build`
4. **Output Directory**: `dist/public`
5. **Install Command**: `npm ci`

### Step 4: Configure Environment Variables
In your Vercel project settings, add these environment variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_28VOqPHoywrb@ep-autumn-butterfly-a8n2dcbp-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
SESSION_SECRET=wastewise_secure_session_key_2024_xyz123
NODE_ENV=production
```

### Step 5: Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy your app
3. Your app will be available at the provided Vercel URL

### Step 6: Run Database Migration
1. Go to your Vercel project dashboard
2. Click "Functions" tab
3. Find your server function and click "View Function Logs"
4. The database migration will run automatically during build

## Local Development

### Prerequisites
- Node.js 20+
- Neon database (you already have this!)
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
- `npm run vercel-build` - Build for Vercel deployment
- `npm run db:push` - Push database schema
- `npm run db:init` - Initialize database

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) | Yes |
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

### Vercel + Neon (Recommended - Free Forever)
- ✅ Vercel: Free hosting with excellent performance
- ✅ Neon: Free PostgreSQL database (you already have this!)
- ✅ Automatic deployments from GitHub
- ✅ Custom domains with SSL
- ✅ Serverless functions
- ✅ Global CDN

### Render (Alternative)
- ✅ Free tier: 750 hours/month
- ✅ Built-in PostgreSQL support
- ✅ Automatic deployments from GitHub
- ✅ Custom domains with SSL

### Netlify + Supabase
- ✅ Netlify: Free hosting for frontend
- ✅ Supabase: Free PostgreSQL database
- ✅ Easy deployment from GitHub

### Fly.io
- ✅ Free tier: 3 shared-cpu VMs
- ✅ PostgreSQL: Free tier available
- ✅ Global deployment
- ✅ No time limits

## Support

For deployment issues or questions, please check the Vercel documentation or create an issue in the repository.
