# Amazon OAuth Setup

This document explains how to set up Amazon OAuth authentication in your NestJS application.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Amazon OAuth Configuration
AMAZON_CLIENT_ID=your_amazon_client_id
AMAZON_CLIENT_SECRET=your_amazon_client_secret
AMAZON_CALLBACK_URL=http://localhost:3000/api/auth/amazon/callback
```

## Amazon Developer Console Setup

1. Go to [Amazon Developer Console](https://developer.amazon.com/)
2. Sign in with your Amazon account
3. Navigate to "Login with Amazon" section
4. Create a new security profile
5. Configure the following settings:
   - **Allowed Origins**: `http://localhost:3000` (for development)
   - **Allowed Return URLs**: `http://localhost:3000/api/auth/amazon/callback`
6. Copy the Client ID and Client Secret to your environment variables

## API Endpoints

The following endpoints are available for Amazon OAuth:

### 1. Initiate Amazon OAuth

```
GET /api/auth/amazon
```

This endpoint redirects users to Amazon's OAuth authorization page.

### 2. Amazon OAuth Callback

```
GET /api/auth/amazon/callback
```

This endpoint handles the callback from Amazon after user authorization.

## Database Schema

The following fields have been added to the User model:

- `firstName: String?` - User's first name from Amazon profile
- `lastName: String?` - User's last name from Amazon profile
- `amazonId: String? @unique` - Amazon user ID (unique)

## How It Works

1. User visits `/api/auth/amazon`
2. User is redirected to Amazon's authorization page
3. User authorizes the application
4. Amazon redirects back to `/api/auth/amazon/callback` with authorization code
5. The application exchanges the code for an access token
6. The application fetches user profile from Amazon
7. User is created or logged in, and JWT tokens are generated
8. User is redirected back to the frontend with authentication cookies

## User Creation Logic

- If a user with the Amazon ID exists, they are logged in
- If a user with the same email exists but no Amazon ID, the Amazon ID is linked to the existing account
- If no user exists, a new user is created with the Amazon profile information

## Security Notes

- Amazon OAuth tokens are not stored in the database
- Users created via Amazon OAuth have empty `passwordHash` fields
- The `amazonId` field is unique to prevent duplicate accounts
