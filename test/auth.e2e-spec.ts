import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const email = 'man@gmail.com';

  it('handles a signup request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'me123' })
      .expect(201)
      .then((res) => {
        const { id, email, password } = res.body.result.user;

        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(password).toBeDefined();
      });
  }, 10000);

  it('handles a signin request', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: 'me123' })
      .expect(201)
      .then((res) => {
        const { id, email, password } = res.body.result.user;
        const { token } = res.body.result;
        authToken = token;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(password).toBeDefined();
        expect(token).toBeDefined();
      });
  }, 10000);

  it('It should create a wallet', async () => {
    const name = 'Franks';

    const { body } = await request(app.getHttpServer())
      .post('/wallet/create')
      .send({ currency: 'NGN', name })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(body.name).toEqual(name);
  }, 10000);

  it('It should create a wallet and transfer money to it', async () => {
    const name = 'Leko';

    const { body } = await request(app.getHttpServer())
      .post('/wallet/create')
      .send({ currency: 'NGN', name })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    const result = await request(app.getHttpServer())
      .post(`/transfer/${body.id}`)
      .send({ recieverWalletId: body.id, amount: 0 })
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);
  }, 10000);

  it('It should fetch all transactions', async () => {
    const result = await request(app.getHttpServer())
      .get(`/transfer/transactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  }, 10000);
});
