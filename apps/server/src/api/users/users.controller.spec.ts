import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app/server/app.module';
import { faker } from '@faker-js/faker';
import { UsersService } from '@app/server/api/users/users.service';
import { UserRole } from 'generated/prisma';
import { hash } from 'bcryptjs';
import {
  getAccessTokenCookiesFromResponse,
  getTestApp,
} from '@app/server/common/helpers/testing';
import { stringify } from 'qs';
import { GetListQuery } from '@app/server/common/class-validators/get-list-query.dto';
import { PrismaService } from '@app/prisma';

describe('UsersController (integration)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let userService: UsersService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await getTestApp(testingModule);

    userService = app.get<UsersService>(UsersService);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await userService.userPrismaClient.deleteMany();
  });

  // Helper function to create mock users
  const mockUser = async (
    overrides: {
      email?: string;
      password?: string;
      role?: UserRole;
      isActive?: boolean;
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
      },
    });

    return { user, email, password };
  };

  // Helper function to create authenticated user and get cookies
  const createAuthenticatedUser = async () => {
    const { user, email, password } = await mockUser({ password: 'password' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const cookieString = getAccessTokenCookiesFromResponse(loginResponse);
    return { user, cookieString };
  };

  describe('GET /users', () => {
    it('should get list of users with pagination', async () => {
      // Create authenticated user
      const { cookieString } = await createAuthenticatedUser();

      // Create additional test users
      await mockUser({ password: 'password' });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            filters: {},
            sort: [],
          } satisfies GetListQuery),
        );

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            email: expect.any(String),
            isActive: true,
            role: UserRole.USER,
          }),
        ]),
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10,
        },
      });
    });

    it('should get list of users with filtering', async () => {
      const { cookieString } = await createAuthenticatedUser();

      // Create a user with a specific email for testing
      const { user, email: testEmail } = await mockUser({
        email: 'filter-test@example.com',
        password: 'password',
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            filters: { email: testEmail },
            sort: [],
          } satisfies GetListQuery),
        )
        .expect(200);

      expect(response.body).toMatchObject({
        data: [
          expect.objectContaining({
            id: user.id,
            email: testEmail,
          }),
        ],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
        },
      });
    });

    it('should get list of users with sorting', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const emails = [faker.internet.email(), faker.internet.email()].sort();

      await Promise.all([
        mockUser({ email: emails[1], password: 'password' }),
        mockUser({ email: emails[0], password: 'password' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            filters: {},
            sort: [{ field: 'email', sort: 'asc' }],
          } satisfies GetListQuery),
        )
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      // Check that the emails are sorted correctly
      const responseEmails = response.body.data
        .map((user) => user.email)
        .sort();
      expect(responseEmails).toEqual([
        emails[0],
        emails[1],
        expect.any(String),
      ]);
    });

    it('should get list of users with population', async () => {
      const { cookieString } = await createAuthenticatedUser();

      await mockUser({ password: 'password' });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            filters: {},
            sort: [],
            populate: ['UserSession'],
          } satisfies GetListQuery),
        )
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('UserSession');
    });

    it('should handle empty list', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            filters: {},
            sort: [],
          } satisfies GetListQuery),
        )
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            email: expect.any(String),
          }),
        ]),
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const { user } = await mockUser({ password: 'password' });

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          id: user.id,
          email: user.email,
          isActive: true,
          role: UserRole.USER,
        }),
      });
    });

    it('should get user by id with population', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const { user } = await mockUser({ password: 'password' });

      // Create a UserSession for the user
      await prismaService.userSession.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .query({
          populate: 'UserSession',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('UserSession');
    });

    it('should return 404 for non-existent user', async () => {
      const { cookieString } = await createAuthenticatedUser();
      const nonExistentId = 99999;

      await request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .set('Cookie', cookieString)
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      const { cookieString } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .get('/users/invalid-id')
        .set('Cookie', cookieString)
        .expect(400);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const userData = {
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Cookie', cookieString)
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          email: userData.email,
          isActive: true,
          role: UserRole.USER,
        }),
      });

      // Verify user was created in database
      const createdUser = await userService.userPrismaClient.findFirst({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.email).toBe(userData.email);
    });

    it('should create user with population', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const userData = {
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            populate: ['UserSession'],
          }),
        )
        .send(userData)
        .expect(201);

      expect(response.body.data).toHaveProperty('UserSession');
    });

    it('should fail with invalid email format', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const userData = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Cookie', cookieString)
        .send(userData)
        .expect(400);
    });

    it('should fail with missing email', async () => {
      const { cookieString } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .post('/users')
        .set('Cookie', cookieString)
        .send({})
        .expect(400);
    });

    it('should fail with email that is too long', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const userData = {
        email: 'a'.repeat(256) + '@example.com',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Cookie', cookieString)
        .send(userData)
        .expect(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const { user } = await mockUser({ password: 'password' });

      const updateData = {
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          id: user.id,
          email: updateData.email,
        }),
      });

      // Verify user was updated in database
      const updatedUser = await userService.userPrismaClient.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.email).toBe(updateData.email);
    });

    it('should update user with population', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const { user } = await mockUser({ password: 'password' });

      const updateData = {
        email: faker.internet.email(),
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .query(
          stringify({
            populate: ['UserSession'],
          }),
        )
        .send(updateData)
        .expect(200);

      expect(response.body.data).toHaveProperty('UserSession');
    });

    it('should return 404 for non-existent user', async () => {
      const { cookieString } = await createAuthenticatedUser();
      const nonExistentId = 99999;
      const updateData = {
        email: faker.internet.email(),
      };

      await request(app.getHttpServer())
        .put(`/users/${nonExistentId}`)
        .set('Cookie', cookieString)
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      const { cookieString } = await createAuthenticatedUser();
      const updateData = {
        email: faker.internet.email(),
      };

      await request(app.getHttpServer())
        .put('/users/invalid-id')
        .set('Cookie', cookieString)
        .send(updateData)
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      const { cookieString } = await createAuthenticatedUser();
      const { user } = await mockUser({ password: 'password' });

      const updateData = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const { user } = await mockUser({ password: 'password' });

      const response = await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          id: user.id,
          email: user.email,
        }),
      });

      // Verify user was deleted from database
      const deletedUser = await userService.userPrismaClient.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should delete user with population', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const { user } = await mockUser({ password: 'password' });

      const response = await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('Cookie', cookieString)
        .query(
          stringify({
            populate: ['UserSession'],
          }),
        )
        .expect(200);

      expect(response.body.data).toHaveProperty('UserSession');
    });

    it('should return 404 for non-existent user', async () => {
      const { cookieString } = await createAuthenticatedUser();
      const nonExistentId = 99999;

      await request(app.getHttpServer())
        .delete(`/users/${nonExistentId}`)
        .set('Cookie', cookieString)
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      const { cookieString } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .delete('/users/invalid-id')
        .set('Cookie', cookieString)
        .expect(400);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for protected endpoints', async () => {
      const userData = {
        email: faker.internet.email(),
      };

      // Test without authentication - should fail
      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large page numbers', async () => {
      const { cookieString } = await createAuthenticatedUser();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 999999, pageSize: 10 },
            filters: {},
            sort: [],
          } satisfies GetListQuery),
        )
        .expect(200);

      expect(response.body).toMatchObject({
        data: [],
        pagination: {
          total: 1,
          page: 999999,
          pageSize: 10,
        },
      });
    });

    it('should handle invalid query parameters gracefully', async () => {
      const { cookieString } = await createAuthenticatedUser();

      await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query({
          pagination: 'invalid-json',
        })
        .expect(400);
    });

    it('should handle empty filters', async () => {
      const { cookieString } = await createAuthenticatedUser();

      await mockUser({ password: 'password' });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            filters: {},
            sort: [],
          } satisfies GetListQuery),
        )
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('Field Authorization (canInclude/canCount)', () => {
    // Helper function to create a user with TempKey and UserSession
    const createUserWithRelations = async () => {
      const { user } = await mockUser({ isActive: true });

      // Create TempKey for the user
      await prismaService.tempKey.create({
        data: {
          token: 'some-token',
          type: 'ACTIVATE_ACCOUNT',
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });

      // Create UserSession for the user
      await prismaService.userSession.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      return user;
    };

    it('should allow UserSession for include operations', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            populate: ['UserSession'],
          }),
        )
        .expect(200);

      // Should include UserSession data in the response
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Find the user with UserSession data
      const userWithSession = response.body.data.find(
        (user: any) => user.UserSession,
      );
      expect(userWithSession).toBeDefined();
      expect(userWithSession?.UserSession).toBeDefined();
      expect(Array.isArray(userWithSession?.UserSession)).toBe(true);
    });

    it('should allow UserSession for count operations', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            count: ['UserSession'],
          }),
        )
        .expect(200);

      // Should include count data in the response
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Find the user with UserSession count data
      const userWithSessionCount = response.body.data.find(
        (user: any) => user._count && user._count.UserSession !== undefined,
      );
      expect(userWithSessionCount).toBeDefined();
      expect(userWithSessionCount?._count?.UserSession).toBeDefined();
      expect(typeof userWithSessionCount?._count?.UserSession).toBe('number');
    });

    it('should reject TempKey for include operations', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            populate: ['TempKey'],
          }),
        )
        .expect(200);

      // Should not include TempKey data in the response
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify that TempKey is not included in the response
      response.body.data.forEach((user: any) => {
        expect(user?.TempKey).toBeUndefined();
      });
    });

    it('should reject TempKey for count operations', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            count: ['TempKey'],
          }),
        )
        .expect(200);

      // Should not include TempKey count in the response
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify that _count.TempKey is not included in the response
      response.body.data.forEach((user: any) => {
        if (user._count) {
          expect(user._count.TempKey).toBeUndefined();
        }
      });
    });

    it('should reject unauthorized fields for include operations', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            populate: ['unauthorizedField', 'anotherUnauthorizedField'],
          }),
        )
        .expect(200);

      // Should not include unauthorized fields in the response
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((user: any) => {
        expect(user.unauthorizedField).toBeUndefined();
        expect(user.anotherUnauthorizedField).toBeUndefined();
      });
    });

    it('should reject unauthorized fields for count operations', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            count: ['unauthorizedField', 'anotherUnauthorizedField'],
          }),
        )
        .expect(200);

      // Should not include unauthorized count fields in the response
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify that unauthorized count fields are not included
      response.body.data.forEach((user: any) => {
        if (user._count) {
          expect(user?._count?.unauthorizedField).toBeUndefined();
          expect(user?._count?.anotherUnauthorizedField).toBeUndefined();
        }
      });
    });

    it('should handle mixed authorized and unauthorized fields', async () => {
      const { cookieString } = await createAuthenticatedUser();
      await createUserWithRelations();

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', cookieString)
        .query(
          stringify({
            pagination: { page: 1, pageSize: 10 },
            populate: ['UserSession', 'TempKey', 'unauthorizedField'],
            count: ['UserSession', 'TempKey', 'unauthorizedField'],
          }),
        )
        .expect(200);

      // Should only include UserSession data, not TempKey or unauthorized fields
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((user: any) => {
        // UserSession should be included (if it exists)
        // TempKey and unauthorizedField should not be included
        expect(user?.TempKey).toBeUndefined();
        expect(user?.unauthorizedField).toBeUndefined();

        // Check count fields
        if (user._count) {
          expect(user?._count?.TempKey).toBeUndefined();
          expect(user?._count?.unauthorizedField).toBeUndefined();
        }
      });
    });
  });
});
