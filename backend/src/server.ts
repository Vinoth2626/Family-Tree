import app from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { seedData } from './seeds/seed';

async function bootstrap(): Promise<void> {
  try {
    await connectDb();
    await seedData();
    app.listen(env.port, () => {
      console.log(`Family Tree API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Boot failed:', error);
    process.exit(1);
  }
}

bootstrap();
