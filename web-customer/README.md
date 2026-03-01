# TareeqK Web Frontend

A modern, responsive web application for TareeqK, featuring both a **Customer Portal** and an **Admin Dashboard**. Built with React 19, TypeScript, and Tailwind CSS v4.

## Portals Overview

### 👤 Customer Portal
The customer portal allows users to:
- **Create Towing Requests**: A multi-step form to request immediate or scheduled assistance.
- **Guest Tracking**: Track the real-time status and location of a tow truck without needing an account.
- **Dashboard**: View active requests and manage profile settings (for registered users).
- **Request History**: Access a comprehensive log of past towing services.

### 🔐 Admin Dashboard
The administrative interface provides:
- **Overview Statistics**: Real-time insights into active requests and system performance.
- **Request Management**: Monitor, assign, and manage all incoming towing requests.
- **User Management**: Oversee customer and driver accounts.

## Tech Stack

- **Core**: React 19, TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 (with PostCSS)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query) v5
- **Routing**: React Router 7
- **Maps**: Google Maps API (@vis.gl/react-google-maps)
- **Authentication**: Axios + Sanctum Token Interceptors
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### Installation

1. **Navigate to the directory**:
   ```bash
   cd web-customer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure you provide a valid `VITE_API_URL` (pointing to your backend) and a `VITE_GOOGLE_MAPS_API_KEY`.*

### Running Locally

To start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready bundle:
```bash
npm run build
```
The output will be in the `dist/` directory.

## Project Structure

```text
src/
├── components/ # Reusable UI components (Buttons, Inputs, Modals)
├── hooks/      # Custom React hooks
├── layouts/    # Page layouts (CustomerLayout, AdminLayout)
├── modules/    # Feature-based logic (Admin, Auth, Customer, Maps, Tracking)
├── routes/     # Route definitions for Public, Customer, and Admin
├── services/   # API communication logic (Axios instances)
├── store/      # Zustand state stores
├── types/      # TypeScript definitions
└── utils/      # Helper functions and constants
```

## Contributing

Please ensure you follow the established TypeScript patterns and use Tailwind CSS v4 utilities for styling.

## License

This project is proprietary and confidential.

