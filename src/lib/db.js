import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function getDB(uri) {
  if (db) return db;
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
  await client.connect();
  db = client.db();
  return db;
}
