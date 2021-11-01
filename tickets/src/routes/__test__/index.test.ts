import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    });
}

it('can fetch a list of tickets', async () => {
  await Promise.all([
    createTicket('asdasd1', 10),
    createTicket('asdasd2', 40),
    createTicket('asdasd3', 106),
  ]);

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);  
})