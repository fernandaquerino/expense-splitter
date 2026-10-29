import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end tests. These exercise the real HTTP + Prisma stack and therefore
 * require a running PostgreSQL database with migrations applied:
 *
 *   npm run db:up && npm run db:migrate   (from the repo root)
 *   npm run test:e2e --workspace apps/api
 *
 * They are intentionally kept out of the default `npm test` run (which is
 * database-free) and live behind the `test:e2e` script.
 */
describe('Expense Splitter API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('creates a group, adds an expense, and derives zero-sum balances', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/groups')
      .send({
        name: 'E2E Trip',
        description: 'test',
        currencyCode: 'USD',
        members: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }],
      })
      .expect(201);

    const groupId: string = createRes.body.id;
    const [a, b] = createRes.body.members.map((m: { id: string }) => m.id);

    await request(app.getHttpServer())
      .post(`/api/groups/${groupId}/expenses`)
      .send({
        description: 'Dinner',
        amount: '100.00',
        date: '2024-01-02T19:00:00Z',
        category: 'Food & Drink',
        payerId: a,
        participantIds: createRes.body.members.map((m: { id: string }) => m.id),
      })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/api/groups/${groupId}`)
      .expect(200);

    const sum = detail.body.balances.reduce(
      (acc: number, bal: { netMinor: number }) => acc + bal.netMinor,
      0,
    );
    expect(sum).toBe(0);
    const payer = detail.body.balances.find(
      (bal: { memberId: string }) => bal.memberId === a,
    );
    expect(payer.netMinor).toBe(6666); // paid 10000, owes 3334

    // Rejects a bad amount
    await request(app.getHttpServer())
      .post(`/api/groups/${groupId}/expenses`)
      .send({
        description: 'Bad',
        amount: '10.999',
        date: '2024-01-02T19:00:00Z',
        category: 'Food & Drink',
        payerId: a,
        participantIds: [a, b],
      })
      .expect(400);
  });
});
