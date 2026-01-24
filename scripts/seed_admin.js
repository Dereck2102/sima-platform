const { Client } = require('pg');
const bcrypt = require('bcrypt');

const {
  PG_HOST,
  PG_PASSWORD,
  ADMIN_PASSWORD
} = process.env;

(async () => {

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const client = new Client({
    host: PG_HOST,
    user: 'sima_admin',
    password: PG_PASSWORD,
    database: 'simadb'
  });

  await client.connect();

  await client.query(`
    INSERT INTO users(email,password,role)
    VALUES('admin@uce.edu.ec',$1,'SUPER_ADMIN')
    ON CONFLICT(email)
    DO UPDATE SET role='SUPER_ADMIN'
  `,[hash]);

  console.log('Admin OK');
  await client.end();
})();
