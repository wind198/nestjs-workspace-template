# NestJS Workspace Template

A production-ready NestJS monorepo template with enterprise-grade features including authentication, logging, testing, email templates, and more.

## 🚀 Features

### Core Features

- **🔐 JWT Authentication** - Complete auth system with refresh tokens
- **📝 Winston Logging** - Structured logging with daily rotation
- **🧪 Comprehensive Testing** - 1700+ lines of integration tests
- **📧 Email Templates** - React Email components with Tailwind
- **🎯 Abstract Resource Controller** - Generic CRUD with field authorization
- **🔄 Auto Refresh Tokens** - Seamless token refresh system
- **🗄️ Database Integration** - Prisma ORM with PostgreSQL
- **📚 API Documentation** - Swagger/OpenAPI integration
- **🌐 Internationalization** - Multi-language support
- **🔒 Security** - Helmet, CORS, validation, and more

### Architecture

- **Monorepo Structure** - Apps and libraries in workspace
- **TypeScript** - Strict typing throughout
- **Modular Design** - Clean separation of concerns
- **Enterprise Patterns** - Guards, interceptors, pipes, decorators

## 📁 Project Structure

```
├── apps/
│   └── server/                 # Main NestJS application
│       ├── src/
│       │   ├── api/           # API modules (auth, users, etc.)
│       │   ├── common/        # Shared utilities and decorators
│       │   ├── mail-sender/   # Email service
│       │   └── i18n/          # Internationalization
│       └── test/              # E2E tests
├── libs/
│   ├── config/                # Configuration management
│   ├── emails/                # React Email templates
│   └── prisma/                # Database service
├── prisma/                    # Database schema and migrations
└── lang/                      # Translation files
```

## 🛠️ Tech Stack

### Backend

- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Winston** - Logging
- **Swagger** - API documentation

### Frontend (Email Templates)

- **React Email** - Email template components
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Development

- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## ⚙️ Configuration System

### Centralized Environment Management

The project uses a sophisticated configuration system (`libs/config`) that provides:

- **Type-safe Environment Variables** - All env vars are typed and validated
- **Default Values** - Sensible defaults for all configuration options
- **Environment-specific Loading** - Automatic `.env.test` loading for tests
- **Variable Parsing** - Automatic type conversion (string, number, boolean)
- **Configuration Validation** - Ensures all required variables are present

### Configuration Categories

#### **Application Settings** (`app.ts`)

```typescript
(NODE_ENV,
  SERVER_PORT,
  SERVER_LOG_LEVEL,
  HOST_NAME,
  FE_HOST_NAME,
  DEFAULT_PASSWORD_LENGTH,
  API_PREFIX,
  ROOT_ADMIN_EMAIL,
  ROOT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  APP_NAME,
  WHITE_LISTED_ORIGINS);
```

#### **Database Configuration** (`postgres.ts`)

```typescript
DATABASE_URL;
```

#### **JWT Configuration** (`jwt.ts`)

```typescript
(JWT_SECRET,
  JWT_EXPIRATION_TIME,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_ACTIVATE_ACCOUNT_EXPIRATION_TIME,
  JWT_RESET_PASSWORD_EXPIRATION_TIME);
```

#### **Email Configuration** (`mailer.ts`)

```typescript
(MAILER_HOST,
  MAILER_PORT,
  MAILER_USER,
  MAILER_PASSWORD,
  MAILER_FROM,
  MAILER_SECURE);
```

#### **Cookie Configuration** (`cookie.ts`)

```typescript
COOKIE_SECRET;
```

#### **Message Queue Configuration** (`rabbit.ts`)

```typescript
(RABBITMQ_HOST,
  RABBITMQ_PORT,
  RABBITMQ_USER,
  RABBITMQ_PASSWORD,
  X_MESSAGE_TTL,
  X_MAX_LENGTH);
```

### Usage Examples

```typescript
import { getEnv, isDev, isTest, getLogLevel } from '@app/config';

// Get environment variables with type safety
const port = getEnv('SERVER_PORT'); // number
const isDevelopment = isDev(); // boolean
const logLevel = getLogLevel(); // string

// Environment checks
if (isDev()) {
  console.log('Development mode');
}

if (isTest()) {
  console.log('Test mode');
}
```

### Configuration Features

- **Automatic Type Conversion** - Strings, numbers, booleans
- **Environment Detection** - Development, test, production
- **Log Level Management** - Dynamic log level based on environment
- **Default Fallbacks** - Graceful handling of missing variables
- **Startup Validation** - Console table showing all loaded variables

## 🚀 Quick Start

### Prerequisites

- Node.js (v22+)
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nestjs-workspace-template
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:

   ```env
   # Database
   DATABASE_URL="postgres://postgres:password@localhost:5432/your_db"

   # JWT Authentication
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_TOKEN_SECRET="your-super-secret-refresh-key"
   JWT_EXPIRATION_TIME="5m"
   JWT_REFRESH_TOKEN_EXPIRATION_TIME="7d"
   JWT_ACTIVATE_ACCOUNT_EXPIRATION_TIME="30m"
   JWT_RESET_PASSWORD_EXPIRATION_TIME="30m"

   # Email Configuration
   MAILER_HOST="smtp.gmail.com"
   MAILER_PORT=587
   MAILER_USER="your-email@gmail.com"
   MAILER_PASSWORD="your-app-password"
   MAILER_FROM="your-email@gmail.com"
   MAILER_SECURE=false

   # Application Settings
   APP_NAME="your-app-name"
   NODE_ENV="development"
   SERVER_PORT=8000
   SERVER_LOG_LEVEL="debug"
   HOST_NAME="localhost"
   FE_HOST_NAME="localhost:3000"
   API_PREFIX="/api/v1"
   WHITE_LISTED_ORIGINS="http://localhost:3000,http://localhost:5173"

   # Admin Configuration
   ROOT_ADMIN_EMAIL="admin@yourdomain.com"
   ROOT_ADMIN_PASSWORD="secure-password"
   DEFAULT_ADMIN_EMAIL="admin@yourdomain.com"
   DEFAULT_ADMIN_PASSWORD="secure-password"

   # Cookie Security
   COOKIE_SECRET="your-cookie-secret"

   # Message Queue (Optional)
   RABBITMQ_HOST="localhost"
   RABBITMQ_PORT=5672
   RABBITMQ_USER="guest"
   RABBITMQ_PASSWORD="guest"
   X_MESSAGE_TTL=86400000
   X_MAX_LENGTH=10000
   ```

   > **Note**: All environment variables have sensible defaults defined in the configuration system. Only override the ones you need to change.

4. **Set up the database**

   ```bash
   # Generate Prisma client
   pnpm prisma:generate

   # Run migrations
   pnpm prisma:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm start:dev
   ```

The API will be available at `http://localhost:8000`
Swagger documentation at `http://localhost:8000/api-docs`

## 📋 Available Scripts

### Development

```bash
pnpm start:dev          # Start development server
pnpm start:debug       # Start with debugging
pnpm build             # Build the application
```

### Testing

```bash
pnpm test              # Run all tests
```

### Database

```bash
pnpm prisma:generate   # Generate Prisma client
pnpm prisma:migrate    # Run database migrations
pnpm prisma:studio     # Open Prisma Studio
pnpm prisma:reset      # Reset database
```

### Code Quality

```bash
pnpm lint              # Run ESLint
pnpm format            # Format code with Prettier
pnpm type-check        # TypeScript type checking
```

### Email Development

```bash
pnpm email:dev         # Start email preview server
```

## 🔐 Authentication System

### Features

- **JWT Access Tokens** (5-minute expiry)
- **Refresh Tokens** (7-day expiry)
- **Automatic Token Refresh** - Seamless user experience
- **Role-based Access Control**
- **Password Reset Flow**
- **Account Activation**

### API Endpoints

```
POST /auth/login                    # User login
POST /auth/logout                   # User logout
GET  /auth/me                       # Get current user
PATCH /auth/me                      # Update profile
POST /auth/activate-account         # Activate account
POST /auth/request-reset-password    # Request password reset
POST /auth/reset-password           # Reset password
POST /auth/update-password           # Update password
```

## 📝 Logging System

### Winston Configuration

- **Daily Log Rotation** - Automatic file rotation
- **Multiple Log Levels** - Error and combined logs
- **JSON Format** - Structured logging
- **30-day Retention** - Automatic cleanup
- **Console Output** - Development-friendly formatting

### Log Files

```
logs/
├── your-app-name/
│   ├── 2024-01-20-error.log
│   └── 2024-01-20-combined.log
```

## 🧪 Testing

### Test Coverage

- **Integration Tests** - Full API testing
- **Authentication Flow** - Login, logout, token refresh
- **CRUD Operations** - Create, read, update, delete
- **Field Authorization** - Security testing
- **Edge Cases** - Error handling and validation

### Test Structure

```
apps/server/src/api/
├── auth/
│   └── auth.controller.spec.ts    # 880+ lines of auth tests
└── users/
    └── users.controller.spec.ts   # 850+ lines of user tests
```

## 📧 Email Templates

### Available Templates

- **Account Activation** - Welcome emails with activation links
- **Password Reset** - Secure password reset emails

### Features

- **React Email Components** - Modern email templates
- **Tailwind CSS** - Responsive styling
- **Brand Customization** - Easy color and styling updates
- **Mobile Responsive** - Works on all devices

### Development

```bash
pnpm email:dev  # Start email preview server
```

## 🎯 Abstract Resource Controller

### Features

- **Generic CRUD Operations** - Standardized API endpoints
- **Field Authorization** - `canInclude()` and `canCount()` methods
- **Prisma Integration** - Automatic query building
- **Validation** - Built-in request validation
- **Logging** - Automatic operation logging

### Usage Example

```typescript
export class UsersController extends ResourceController<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  // Implement abstract methods
  async getList(query: GetListQuery): Promise<IPaginatedData<User>> {
    // Your implementation
  }

  // Override authorization methods
  canInclude(field: string): boolean {
    return ['UserSession'].includes(field);
  }
}
```

## 🔄 Auto Refresh Token System

### How It Works

1. **JWT Guard** - Validates access tokens
2. **Token Expiry Detection** - Identifies expired tokens
3. **Refresh Token Validation** - Validates refresh token
4. **Automatic Refresh** - Generates new access token
5. **Seamless Experience** - No user interruption

### Implementation

- **RefreshTokenInterceptor** - Handles token refresh automatically
- **Cookie Management** - Secure token storage for access token and refresh token
- **Backend Managed refresh token** - Refresh token is managed by the backend and not by the client (UserSession table)
- **Error Handling** - Graceful failure handling

## 🗄️ Database Schema

### Core Models

- **User** - User accounts and profiles
- **UserSession** - Active user sessions
- **TempKey** - Temporary keys for activation/reset

## 🌐 Internationalization

### Supported Languages

- **English** (default)
- **Auto translation keys collection** - Use scripts/generate-lang-files.ts to generate translation keys from TypeScript files
- **Easy to extend** - Add new language files

### Usage

```typescript
// In your service
const message = this.i18n.t('auth.login.success');
```

## 🔒 Security Features

### Implemented Security

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Request validation
- **SQL Injection Protection** - Prisma ORM
- **XSS Protection** - Input sanitization

## 📚 API Documentation

### Swagger Integration

- **Auto-generated** - From decorators and DTOs
- **Interactive** - Test endpoints directly
- **Comprehensive** - All endpoints documented

Access at: `http://localhost:8000/api-docs`

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start:central-web-server:prod
```

### Environment Variables

Ensure all production environment variables are set according to the configuration system:

#### **Required for Production**

```env
# Database
DATABASE_URL="postgres://user:password@host:port/database"

# JWT Authentication (CRITICAL - Use strong secrets)
JWT_SECRET="your-production-jwt-secret"

# Email (Required for user activation/reset)
MAILER_HOST="smtp.your-provider.com"
MAILER_PORT=587
MAILER_USER="your-email@domain.com"
MAILER_PASSWORD="your-email-password"
MAILER_FROM="noreply@yourdomain.com"

# Application
APP_NAME="your-production-app"
NODE_ENV="production"
SERVER_PORT=8000
HOST_NAME="yourdomain.com"
FE_HOST_NAME="yourdomain.com"
WHITE_LISTED_ORIGINS="https://yourdomain.com"

# Security
COOKIE_SECRET="your-production-cookie-secret"
```

#### **Optional Configuration**

```env
# Logging
SERVER_LOG_LEVEL="info"

# Admin Users
ROOT_ADMIN_EMAIL="admin@yourdomain.com"
ROOT_ADMIN_PASSWORD="secure-admin-password"

# Message Queue (if using)
RABBITMQ_HOST="your-rabbitmq-host"
RABBITMQ_PORT=5672
RABBITMQ_USER="your-rabbitmq-user"
RABBITMQ_PASSWORD="your-rabbitmq-password"
```

#### **Environment-Specific Files**

- **Development**: `.env` (loaded automatically)
- **Testing**: `.env.test` (loaded automatically in test mode)
- **Production**: Set environment variables in your deployment platform

> **Security Note**: Never commit `.env` files to version control. Use your deployment platform's environment variable management for production secrets.

**Built with ❤️ using NestJS, TypeScript, and modern web technologies.**
