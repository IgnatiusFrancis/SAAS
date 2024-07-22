import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/utils/prisma';

describe('Authentication System', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let logger: Logger | undefined;
  let authToken: string;
  let createdUserId: string | null = null;
  const email = 'jeff@gmail.com';
  const password = 'password';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    logger = new Logger('TestLogger');
    moduleFixture.useLogger(logger);

    await app.init();
  });

  // Cleanup: delete the user created in the tests
  afterAll(async () => {
    if (createdUserId) {
      await prismaService.user.delete({ where: { id: createdUserId } });
    }
    logger.debug('After all hook called');
    await app.close();
  });

  /******************** SIGNUP USER *******************/
  it('handles a signup request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password })
      .expect(201)
      .then((res) => {
        const { id, email, subscriptionActive } = res.body.result;
        createdUserId = id;

        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(subscriptionActive).toBeDefined();
      });
  }, 1000);

  /******************** SIGNIN USER *******************/
  it('handles a signin request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body.result;
        const { token } = res.body.result;
        authToken = token;

        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(token).toBeDefined();
      });
  }, 1000);

  /******************** FETCH ALL SUBSCRIPTIONS *******************/
  it('It should fetch all subscriptions', async () => {
    const result = await request(app.getHttpServer())
      .get(`/subscription`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  }, 10000);

  /******************** CREATE SUBSCRIPTION PLAN *******************/
  it('should create a Subscription plan', async () => {
    const plan = 'PLN_5uh3lzzvs2h01va';
    const amount = 5000;

    const { body } = await request(app.getHttpServer())
      .post('/subscription')
      .send({ plan, amount })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(body.status).toBe(true);
    expect(body.message).toEqual('Authorization URL created');
    expect(body.data).toBeDefined();
    expect(body.data.authorization_url).toBeTruthy();
    expect(body.data.access_code).toBeTruthy();
    expect(body.data.reference).toBeTruthy();
  });

  /******************** RETURN UPLOAD ERROR *******************/
  it('should return 403 when subscription is not active', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/image/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403);

    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(403);
    expect(body.message).toEqual('Forbidden');
    expect(body.errorResponse.message).toEqual(
      'You must have an active subscription to access this resource.',
    );
    expect(body.errorResponse.error).toEqual('Forbidden');
    expect(body.errorResponse.statusCode).toEqual(403);
  });
});
