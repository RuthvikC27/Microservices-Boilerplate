const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app } = require('../app');
const jwt = require("jsonwebtoken");


// ADD below package to package.json FOR TESTING 
// "mongodb-memory-server": "^6.9.2",

let mongo;

// declare global{
//   namespace NodeJS{
//     interface Global{
//       signin(): string[]
//     }
//   }
// }

beforeAll(async () => {
  mongo = new MongoMemoryServer();
  const mongoURI = await mongo.getUri();

  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
})

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
})

global.signin = () => {
  // Build a JWT payload. { id, email }

  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  }
  // Create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY);

  // Build a session object. { jwt: MY_JWT}
  const session = { jwt: token }

  // turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
}