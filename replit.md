# Shopee Delivery Partners

## Overview

This is a full-stack web application for recruiting delivery partners for Shopee, optimized for the Brazilian market. The platform provides a digital onboarding process specifically designed for mobile users, with desktop access protection to ensure the proper user experience.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom Shopee branding
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context API with custom AppContext
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API requests
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with CORS configuration
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Simple username/password system
- **Payment Processing**: For4Payments API integration for PIX payments
- **Email Service**: External email API integration
- **Device Protection**: Custom middleware for desktop blocking

## Key Components

### 1. Database Schema
- **candidates**: Store delivery partner applications
- **states**: Brazilian states with vacancy information
- **users**: Basic authentication system
- **bannedIps**: IP-based access control
- **allowedDomains**: Domain whitelist for development
- **bannedDevices**: Device-specific blocking

### 2. Payment System
- **For4Payments Integration**: PIX payment processing for delivery kit purchases
- **Transaction Monitoring**: Real-time payment status tracking
- **Facebook Pixel Integration**: E-commerce tracking and analytics

### 3. Security Features
- **Desktop Protection**: Multi-layered protection against desktop access
- **IP Blocking**: Server-side IP banning system
- **Device Fingerprinting**: Browser-based device identification
- **CORS Configuration**: Comprehensive cross-origin request handling

### 4. Email System
- **Automated Notifications**: Confirmation emails for successful registrations
- **HTML Templates**: Rich email templates with Shopee branding
- **External API Integration**: Reliable email delivery service

## Data Flow

1. **User Registration**: Mobile users access the application and complete registration
2. **Validation**: Form data is validated on both client and server sides
3. **Vehicle Verification**: Optional vehicle plate verification through external API
4. **Payment Processing**: PIX payment generation and monitoring for delivery kits
5. **Email Confirmation**: Automated email notifications upon successful completion
6. **Data Storage**: Persistent storage of candidate information and application status

## External Dependencies

### Payment Processing
- **For4Payments API**: Brazilian payment processor for PIX transactions
- **Facebook Pixel**: E-commerce analytics and conversion tracking

### Email Services
- **External Email API**: Reliable email delivery with HTML template support

### Vehicle Verification
- **WDAPI2**: Brazilian vehicle information lookup service

### Development Tools
- **Neon Database**: PostgreSQL hosting for development
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

The application supports multiple deployment configurations:

### Option 1: Unified Deployment (Recommended)
- **Platform**: Heroku with Node.js buildpack
- **Configuration**: Vite development server with Express backend
- **Benefits**: Single deployment, consistent with Replit preview

### Option 2: Separated Deployment
- **Frontend**: Netlify/Vercel for static hosting
- **Backend**: Heroku for API services
- **Benefits**: Optimized for scale, CDN distribution

### Build Configuration
- **Frontend Build**: Vite builds to `dist/public` directory
- **Backend Build**: ESBuild compiles TypeScript to `dist` directory
- **Static Assets**: Proper CORS headers and caching strategies

## Changelog
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.