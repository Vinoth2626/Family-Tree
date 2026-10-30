import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectDb } from '../src/config/db';
import { seedData } from '../src/seeds/seed';

let server: ReturnType<typeof app.listen> | undefined;
let port = 0;

test.before(async () => {
  await connectDb();
  await seedData();
  server = app.listen(0);
  await new Promise<void>((resolve) => {
    server!.once('listening', () => resolve());
  });
  port = (server.address() as { port: number }).port;
});

test.after(async () => {
  await new Promise<void>((resolve, reject) => {
    if (!server) return resolve();
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await mongoose.disconnect();
});

test('public person profile and timeline filter endpoints return the expected data', async () => {
  const searchResponse = await fetch(`http://127.0.0.1:${port}/api/families/smith-family/search?q=john`);
  assert.equal(searchResponse.status, 200);

  const searchJson = await searchResponse.json();
  assert.ok(searchJson.success);
  assert.ok(Array.isArray(searchJson.data));
  assert.ok(searchJson.data.length > 0);

  const personId = searchJson.data[0]._id;

  const profileResponse = await fetch(`http://127.0.0.1:${port}/api/families/smith-family/person/${personId}`);
  assert.equal(profileResponse.status, 200);

  const profileJson = await profileResponse.json();
  assert.equal(profileJson.success, true);
  assert.ok(profileJson.data.person);
  assert.ok(profileJson.data.parents || profileJson.data.spouses || profileJson.data.children || profileJson.data.siblings);

  const timelineResponse = await fetch(`http://127.0.0.1:${port}/api/families/smith-family/timeline?type=BIRTH`);
  assert.equal(timelineResponse.status, 200);

  const timelineJson = await timelineResponse.json();
  assert.equal(timelineJson.success, true);
  assert.ok(Array.isArray(timelineJson.data));
});
