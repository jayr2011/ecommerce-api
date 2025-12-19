import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as dotenv from 'dotenv';
import { App } from 'supertest/types';

dotenv.config();

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let userId: string;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(adminUser)
      .expect(201);

    adminToken = (response.body as { access_token: string }).access_token;

    const user = await prisma.user.findUnique({
      where: { email: adminUser.email },
    });
    userId = user!.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /users/allUsers', () => {
    it('should return 401 if no token is provided', () => {
      return request(app.getHttpServer()).get('/users/allUsers').expect(401);
    });

    it('should return all users for ADMIN', () => {
      return request(app.getHttpServer())
        .get('/users/allUsers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          const body = response.body as Record<string, any>[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
          expect(body[0]).toHaveProperty('email', adminUser.email);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', adminUser.email);
    });

    it('should return 400 for invalid UUID', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 404 for non-existent user', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const updateData = { name: 'Updated Name' };
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect((response.body as Record<string, any>).name).toBe(updateData.name);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const tempUser = {
        name: 'Temp User',
        email: 'temp@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(tempUser)
        .expect(201);

      const tempUserDb = await prisma.user.findUnique({
        where: { email: tempUser.email },
      });

      await request(app.getHttpServer())
        .delete(`/users/${tempUserDb!.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedUser = await prisma.user.findUnique({
        where: { id: tempUserDb!.id },
      });
      expect(deletedUser).toBeNull();
    });
  });

  describe('GraphQL /graphql', () => {
    it('should get all users via GraphQL', async () => {
      const query = `
        query {
          allUsers {
            id
            email
            name
            role
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query })
        .expect(200);

      const body = response.body as {
        data: { allUsers: Record<string, any>[] };
      };
      expect(body.data.allUsers).toBeDefined();
      expect(Array.isArray(body.data.allUsers)).toBe(true);
      expect(body.data.allUsers[0]).toHaveProperty('email', adminUser.email);
    });

    it('should update a user via GraphQL', async () => {
      const mutation = `
        mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
          }
        }
      `;

      const variables = {
        id: userId,
        input: { name: 'GQL Updated Name' },
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation, variables })
        .expect(200);

      const body = response.body as {
        data: { updateUser: Record<string, any> };
      };
      expect(body.data.updateUser.name).toBe(variables.input.name);
    });
  });
});
