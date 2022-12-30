// Put required .env here to pass the test
process.env.DB_USER = 'foo';
process.env.DB_PASSWORD = 'foo';

process.env.BCRYPT_SALT_ROUNDS = '8';

process.env.JWT_SECRET = 'topsecret';
process.env.JWT_EXPIRES_IN = '86400';

process.env.ENGINE_LOOP_MS = '50';

process.env.ASTRA_TOKEN = 'token';
process.env.ASTRA_DB_KEYSPACE = 'lamest';
process.env.ASTRA_DB_ID = 'id';
process.env.ASTRA_DB_REGION = 'zone1';
