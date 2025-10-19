import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app/server/app.module';
import { faker } from '@faker-js/faker';
import { TempKeysService } from '@app/server/api/tempkeys/tempkeys.service';
import { UserRole, TempKeyType } from 'generated/prisma';
import { UsersService } from '@app/server/api/users/users.service';
import { hash } from 'bcryptjs';
import {
  getAccessTokenCookiesFromResponse,
  getTestApp,
  timeTravel,
} from '@app/server/common/helpers/testing';
import moment from 'moment';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/server/common/constants/keys';

describe('AuthController (integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let userService: UsersService;
  let tempKeyService: TempKeysService;
  // let userSessionsService: UserSessionsService;

  // Helper function to create mock users
  const mockUser = async (
    overrides: {
      email?: string;
      password?: string;
      role?: UserRole;
      isActive?: boolean;
      lastResetPasswordRequestAt?: Date;
    } = {},
  ) => {
    const email = overrides.email || faker.internet.email();
    const password = overrides.password || faker.internet.password();
    const passwordHash = await hash(password, 10);

    const user = await userService.userPrismaClient.create({
      data: {
        email,
        passwordHash,
        role: overrides.role || UserRole.USER,
        isActive: overrides.isActive !== undefined ? overrides.isActive : true,
        lastResetPasswordRequestAt: overrides.lastResetPasswordRequestAt,
      },
    });

    return { user, email, password };
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = await getTestApp(testingModule);

    userService = app.get<UsersService>(UsersService);
    tempKeyService = app.get<TempKeysService>(TempKeysService);
    // userSessionsService = app.get<UserSessionsService>(UserSessionsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await userService.userPrismaClient.deleteMany();
    await tempKeyService.tempKeyPrismaClient.deleteMany();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const {
        user: createdUser,
        email: testEmail,
        password: testPassword,
      } = await mockUser();

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          isActive: true,
          id: createdUser.id,
        }),
      });

      // Check that cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(401);
    });

    it('should fail with invalid password', async () => {
      const { email: testEmail } = await mockUser();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(400);
    });

    it('should fail with inactive account', async () => {
      const { email: testEmail, password: testPassword } = await mockUser({
        isActive: false,
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const { email: testEmail, password: testPassword } = await mockUser();

      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Logout
      const logoutResponse = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookieString)
        .expect(201);

      expect(logoutResponse.body).toMatchObject({ data: true });
    });
  });

  describe('GET /auth/me', () => {
    it('should get user profile when authenticated', async () => {
      const {
        user: createdUser,
        email: testEmail,
        password: testPassword,
      } = await mockUser();

      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Get profile
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookieString)
        .expect(200);

      expect(profileResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          id: createdUser.id,
        }),
      });
    });

    it('should fail when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
      expect(response.body).toMatchObject({
        statusCode: 401,
        message: 'unauthorized',
      });
    });
  });

  describe('PATCH /auth/me', () => {
    it('should update user profile when authenticated', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);
      const newEmail = faker.internet.email();

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Update profile
      const updateResponse = await request(app.getHttpServer())
        .patch('/auth/me')
        .set('Cookie', cookieString)
        .send({
          email: newEmail,
        })
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: newEmail,
        }),
      });
    });

    it('should fail when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/auth/me')
        .send({
          email: faker.internet.email(),
        })
        .expect(401);
    });
  });

  describe('POST /auth/activate-account', () => {
    it('should activate account with valid temp key', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      const createdUser = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: false,
        },
      });

      // Create temp key for activation using the proper method
      const tempKey = await userService.createTempkey(
        createdUser,
        TempKeyType.ACTIVATE_ACCOUNT,
      );

      // Get tokens from temp key
      const tokenResponse = await request(app.getHttpServer())
        .get(`/auth/retrieve-tokens-from-tempkey/${tempKey.id}`)
        .expect(200);

      const cookieString = getAccessTokenCookiesFromResponse(tokenResponse);

      // Activate account
      const activateResponse = await request(app.getHttpServer())
        .post('/auth/activate-account')
        .set('Cookie', cookieString)
        .send({
          password: 'NewPassword123!',
        })
        .expect(201);

      expect(activateResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          isActive: true,
        }),
      });
    });

    it('should fail when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/auth/activate-account')
        .send({
          password: 'NewPassword123!',
        })
        .expect(401);
    });
  });

  describe('GET /auth/retrieve-tokens-from-tempkey/:id', () => {
    it('should retrieve tokens with valid temp key', async () => {
      const testEmail = faker.internet.email();
      const passwordHash = await hash('password', 10);

      const createdUser = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: false,
        },
      });

      const tempKey = await userService.createTempkey(
        createdUser,
        TempKeyType.ACTIVATE_ACCOUNT,
      );

      const response = await request(app.getHttpServer())
        .get(`/auth/retrieve-tokens-from-tempkey/${tempKey.id}`)
        .expect(200);

      expect(response.body).toMatchObject({ data: true });
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with invalid temp key id', async () => {
      const invalidId = 'invalid-id';

      await request(app.getHttpServer())
        .get(`/auth/retrieve-tokens-from-tempkey/${invalidId}`)
        .expect(400);
    });

    it('should fail with not existing temp key id', async () => {
      const nonExistingId = 'e514e508-ea67-42b3-823f-d4b652c9df9b';

      await request(app.getHttpServer())
        .get(`/auth/retrieve-tokens-from-tempkey/${nonExistingId}`)
        .expect(404);
    });

    it('should fail with expired temp key', async () => {
      const testEmail = faker.internet.email();
      const passwordHash = await hash('password', 10);

      const createdUser = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: false,
        },
      });

      const tempKey = await userService.createTempkey(
        createdUser,
        TempKeyType.ACTIVATE_ACCOUNT,
      );
      // Manually set expired date
      await tempKeyService.tempKeyPrismaClient.update({
        where: { id: tempKey.id },
        data: { expiresAt: moment().subtract(1, 'hour').toDate() },
      });

      await request(app.getHttpServer())
        .get(`/auth/retrieve-tokens-from-tempkey/${tempKey.id}`)
        .expect(400);
    });
  });

  describe('POST /auth/request-reset-password', () => {
    it('should request password reset for existing user', async () => {
      const testEmail = faker.internet.email();
      const passwordHash = await hash('password', 10);

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/request-reset-password')
        .send({
          email: testEmail,
        })
        .expect(201);

      expect(response.body).toMatchObject({ data: true });
    });

    it('should fail for non-existent user', async () => {
      const testEmail = faker.internet.email();

      await request(app.getHttpServer())
        .post('/auth/request-reset-password')
        .send({
          email: testEmail,
        })
        .expect(404);
    });

    it('should fail for too frequent requests', async () => {
      const { email: testEmail } = await mockUser({
        password: 'password',
        lastResetPasswordRequestAt: moment().toDate(), // Recent request
      });

      await request(app.getHttpServer())
        .post('/auth/request-reset-password')
        .send({
          email: testEmail,
        })
        .expect(400);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password when authenticated with temp key', async () => {
      const { user: createdUser, email: testEmail } = await mockUser({
        password: 'password',
      });

      // Create temp key for password reset
      const tempKey = await userService.createTempkey(
        createdUser,
        TempKeyType.RESET_PASSWORD,
      );

      // Get tokens from temp key
      const tokenResponse = await request(app.getHttpServer())
        .get(`/auth/retrieve-tokens-from-tempkey/${tempKey.id}`)
        .expect(200);

      const cookieString = getAccessTokenCookiesFromResponse(tokenResponse);

      // Reset password
      const resetResponse = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .set('Cookie', cookieString)
        .send({
          password: 'NewPassword123!',
        })
        .expect(201);

      expect(resetResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
        }),
      });
    });

    it('should fail when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          password: 'NewPassword123!',
        })
        .expect(401);
    });
  });

  describe('POST /auth/update-password', () => {
    it('should update password with correct current password', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Update password
      const updateResponse = await request(app.getHttpServer())
        .post('/auth/update-password')
        .set('Cookie', cookieString)
        .send({
          currentPassword: testPassword,
          newPassword: 'NewPassword123!',
        })
        .expect(201);

      expect(updateResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
        }),
      });
    });

    it('should fail with incorrect current password', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Update password with wrong current password
      await request(app.getHttpServer())
        .post('/auth/update-password')
        .set('Cookie', cookieString)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should fail when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/auth/update-password')
        .send({
          currentPassword: 'password',
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });
  });

  describe('Refresh Token Flow', () => {
    it('should work with valid tokens initially', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      const user = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login to get initial tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const initialCookieString =
        getAccessTokenCookiesFromResponse(loginResponse);

      // Make a request to a protected endpoint - this should work with valid tokens
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', initialCookieString)
        .expect(200);

      expect(profileResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          id: user.id,
        }),
      });

      // Check if new access token was set in response (refresh token interceptor should handle this)
      // The refresh token interceptor will automatically refresh the access token if needed
      const cookieHeader = profileResponse.request.getHeader('cookie');
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toContain(ACCESS_TOKEN);
      expect(cookieHeader).toContain(REFRESH_TOKEN);
    });

    it('should fail with missing refresh token', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Create invalid cookies (missing refresh token)
      const invalidCookieString = `${ACCESS_TOKEN}=some-token;`;

      // Should fail with invalid refresh token
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', invalidCookieString)
        .expect(401);
    });

    it('should fail with expired refresh token', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      timeTravel(10 * 24 * 60 * 60 * 1000);

      // Should fail with expired refresh token
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookieString)
        .expect(401);

      // Restore real timers
      jest.useRealTimers();
    });

    it('should handle missing access token', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Create cookies with only refresh token (missing access token)
      const incompleteCookieString = 'timelapse_refresh_token=some-token';

      // Should fail with missing access token
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', incompleteCookieString)
        .expect(401);
    });

    it('should automatically refresh access token within same request when expired', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      const user = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Time travel: Advance time by 6 minutes to expire the access token (JWT expires after 5m)
      timeTravel(6 * 60 * 1000); // 6 minutes in milliseconds

      // Make a single request - the JWT guard detects expired access token,
      // validates refresh token, sets shouldRefreshToken=true,
      // and RefreshTokenInterceptor generates new access token in same response
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookieString)
        .expect(200);

      expect(profileResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          id: user.id,
        }),
      });

      // Check if new access token was set in response (RefreshTokenInterceptor handles this)
      expect(profileResponse.headers['set-cookie']).toBeDefined();

      // Restore real timers
      jest.useRealTimers();
    });

    it('should handle multiple requests with expired access tokens', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      const user = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Time travel: Advance time by 6 minutes to expire the access token
      timeTravel(6 * 60 * 1000); // 6 minutes in milliseconds

      // Each request will:
      // 1. JWT Guard detects expired access token
      // 2. Validates refresh token (still valid)
      // 3. Sets shouldRefreshToken=true
      // 4. RefreshTokenInterceptor generates new access token in same response
      const response1 = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookieString)
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookieString)
        .expect(200);

      expect(response1.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          id: user.id,
        }),
      });

      expect(response2.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          id: user.id,
        }),
      });

      // Check that new access tokens were set in responses (RefreshTokenInterceptor)
      expect(response1.headers['set-cookie']).toBeDefined();
      expect(response2.headers['set-cookie']).toBeDefined();

      // Restore real timers
      jest.useRealTimers();
    });

    it('should demonstrate RefreshTokenInterceptor behavior within same request', async () => {
      const testEmail = faker.internet.email();
      const testPassword = faker.internet.password();
      const passwordHash = await hash(testPassword, 10);

      const user = await userService.userPrismaClient.create({
        data: {
          email: testEmail,
          passwordHash,
          role: UserRole.USER,
          isActive: true,
        },
      });

      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      const cookieString = getAccessTokenCookiesFromResponse(loginResponse);

      // Time travel: Advance time by 6 minutes to expire the access token
      timeTravel(6 * 60 * 1000); // 6 minutes in milliseconds

      // This single request demonstrates the complete flow:
      // 1. JWT Guard: Access token expired → validate refresh token → set shouldRefreshToken=true
      // 2. Controller: Process request normally
      // 3. RefreshTokenInterceptor: Detect shouldRefreshToken=true → generate new access token → attach to response
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookieString)
        .expect(200);

      // Verify the request succeeded (user data returned)
      expect(profileResponse.body).toMatchObject({
        data: expect.objectContaining({
          email: testEmail,
          id: user.id,
        }),
      });

      // Verify RefreshTokenInterceptor attached new access token to response
      expect(profileResponse.headers['set-cookie']).toBeDefined();

      // The new access token should be in the set-cookie header
      const setCookieHeader = profileResponse.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader.toString()).toContain(`${ACCESS_TOKEN}=`);

      // Restore real timers
      jest.useRealTimers();
    });
  });
});
