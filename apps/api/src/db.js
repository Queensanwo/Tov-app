import pg from 'pg';

const connectionString =
  process.env.DATABASE_URL || 'postgres://tov:tov_dev_password@localhost:5433/tov';

export const pool = new pg.Pool({ connectionString });

export async function query(text, params) {
  return pool.query(text, params);
}
