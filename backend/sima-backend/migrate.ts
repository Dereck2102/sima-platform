import { AppDataSource } from './typeorm.config';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');

    const migrations = await AppDataSource.runMigrations();
    migrations.forEach((m: any) => console.log(`✅ Migration applied: ${m.name}`));

    await AppDataSource.destroy();
    console.log('🏁 Migrations completed');
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

run();
