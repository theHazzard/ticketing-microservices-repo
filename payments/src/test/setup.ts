import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../app';

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const userId = id || mongoose.Types.ObjectId().toHexString();
  // build a JWt Payload
  const payload = {
    id: userId,
    email: 'test@test.com'
  }
  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Turn that session into JSON
  const session = {
    jwt: token,
  }
  const sessionJSON = JSON.stringify(session);

  // encode json on base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // return a string with the cookie
  return [`express:sess=${base64}`];
};
