# Guild Wars 2 Account Tracker

## Overview

A full-stack web application for tracking Guild Wars 2 account information and game data. The application allows users to input their GW2 API keys to retrieve and display comprehensive account details including characters, wallet information, bank items, materials, and activity tracking. Built with a modern tech stack featuring React frontend, Express.js backend, and PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern React features
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **shadcn/ui** component library providing consistent, accessible UI components
- **TanStack Query** for efficient server state management and caching
- **Wouter** as a lightweight client-side router
- **React Hook Form** with Zod validation for form handling
- Dark/light theme support with system preference detection

### Backend Architecture
- **Express.js** REST API server with TypeScript
- **Modular routing** structure separating API endpoints from server setup
- **Guild Wars 2 API integration** for fetching real-time game data
- **Session-based request logging** with performance monitoring
- **Error handling middleware** for consistent error responses
- **Development hot-reload** with Vite middleware integration

### Database Layer
- **PostgreSQL** as the primary database using Neon serverless hosting
- **Drizzle ORM** for type-safe database operations and schema management
- **Schema-first approach** with shared types between frontend and backend
- **Database migrations** managed through Drizzle Kit
- **In-memory storage fallback** for development and testing scenarios

### Data Models
- **API Keys**: Store and validate GW2 API keys with permission tracking
- **Accounts**: Core account information including world, access level, and progression
- **Characters**: Individual character data with profession, level, and statistics
- **Wallet**: Currency tracking for various in-game currencies
- **Bank Items**: Inventory management for account-wide storage
- **Materials**: Material storage tracking
- **Activities**: Activity logging for account changes and updates

### Authentication & Validation
- **GW2 API key validation** ensures keys are valid and have required permissions
- **Zod schemas** for runtime type validation on API boundaries
- **Permission checking** to verify API key capabilities before data requests

### State Management
- **TanStack Query** handles all server state with automatic caching and background updates
- **React Context** for theme management and global UI state
- **Local storage** for persisting user preferences like theme selection

### Development Workflow
- **TypeScript** across the entire stack for type safety
- **ESM modules** for modern JavaScript module handling
- **Path aliases** for clean import statements
- **Hot module replacement** in development for fast iteration

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools for PostgreSQL
- **express**: Web framework for the Node.js backend API
- **react & react-dom**: Core React library for building the user interface
- **@tanstack/react-query**: Data fetching and state management library

### UI Component Library
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library providing consistent iconography

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **typescript**: Static type checking for JavaScript

### Form Handling & Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema validation library

### Guild Wars 2 API
- **Official GW2 API v2**: RESTful API for accessing game data
- **Bearer token authentication**: Secure API key management
- **Rate limiting aware**: Respects API rate limits and handles errors gracefully

### Deployment & Hosting
- **Replit**: Development and hosting platform
- **Neon**: Serverless PostgreSQL hosting
- **Environment variables**: Secure configuration management for API keys and database URLs