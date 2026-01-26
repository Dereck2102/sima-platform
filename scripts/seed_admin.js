const { Client } = require('pg');
const bcrypt = require('bcrypt');

const {
  DATABASE_HOST = 'localhost',
  DATABASE_PORT = '5432',
  DATABASE_USER = 'sima_user',
  DATABASE_PASSWORD = 'postgres123',
  DATABASE_NAME = 'sima_db',
  ADMIN_PASSWORD = 'Admin123!'
} = process.env;

(async () => {

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const client = new Client({
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME
  });

  await client.connect();

  await client.query(`
    INSERT INTO users(email,name,password,role)
    VALUES('DSAMACORIA@UCE.EDU.EC','Dereck Amacoria',$1,'SUPER_ADMIN')
    ON CONFLICT(email)
    DO UPDATE SET role='SUPER_ADMIN'
  `,[hash]);

  console.log('✅ Admin user created: DSAMACORIA@UCE.EDU.EC');
  await client.end();
})();
