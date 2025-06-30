# Lumiere Cinema Management System

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
git clone http://git.fa.edu.vn/hcm25_cpl_react_06/fe_team_1.git
cd fe_team_1
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

## Suggestions for a good README
Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
