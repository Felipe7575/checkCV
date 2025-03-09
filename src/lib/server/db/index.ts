import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

const connection = neon(DATABASE_URL);

// Define a logger object with a logQuery method
const logger = {
  logQuery: (msg) => {
    console.log(msg)
  }
};

export const db = drizzle(connection, {
  schema,
  //logger
});


