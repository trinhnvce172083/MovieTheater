# MovieTheater

A modern cinema management system built with Next.js, TypeScript, and Ant Design.

## Features

- **Admin Dashboard**: Comprehensive management interface for cinema operations
- **Room Management**: Manage cinema rooms, seats, and configurations
- **Movie Management**: Handle movie listings and details
- **User Management**: Manage customer accounts and admin users
- **Booking System**: Handle seat reservations and ticketing
- **Modern UI**: Responsive design with glassmorphism effects

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: Ant Design (antd)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication**: JWT-based authentication
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running on `http://localhost:8080`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/trinhnvce172083/MovieTheater.git
cd MovieTheater
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

### Backend Requirements

This frontend application requires a backend API server to be running on `http://localhost:8080/cinema/api`. 

**Expected API endpoints include:**
- `GET /admin/cinema-rooms` - Get cinema rooms with pagination
- `POST /admin/cinema-rooms` - Create new cinema room
- `PUT /admin/cinema-rooms/:id` - Update cinema room
- `DELETE /admin/cinema-rooms/:id` - Delete cinema room
- `GET /admin/cinema-rooms/search` - Search cinema rooms

If the backend is not available, the application will automatically switch to **Demo Mode** with sample data.

### Demo Mode

When the backend server is not available, the application will:
- Display a warning banner indicating "Demo Mode Active"
- Show sample data for demonstration purposes
- Disable create, edit, and delete operations
- Provide a "Retry Connection" button to attempt reconnecting

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/           # API client and endpoints
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
├── store/         # Redux store and slices
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global styles and animations
```

## Authentication

The application uses JWT-based authentication with the following storage locations:
- LocalStorage (`accessToken`, `userInfo`)

## Development Notes

- The application uses **Turbopack** for faster development builds
- **TypeScript** is configured with strict mode
- **ESLint** is configured for code quality
- All admin operations require proper authentication
- The UI features modern glassmorphism design elements

## Contributing
Contributions are welcome. Please open an issue or submit a pull request on GitHub.
