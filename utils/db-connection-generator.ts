function buildConnectionStringFromEnv(): string {
  const user = process.env.DB_USER || '';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || '';
  const port = process.env.DB_PORT || '';
  const dbName = process.env.DB_NAME || '';
  const schema = process.env.DB_SCHEMA || '';

  let auth = '';
  if (user && password) {
    auth = `${user}:${password}@`;
  } else if (user) {
    auth = `${user}@`;
  }

  let hostPort = host;
  if (port) {
    hostPort += `:${port}`;
  }

  const dbPath = dbName ? `/${dbName}` : '';
  const search = schema ? `?schema=${encodeURIComponent(schema)}` : '';

  return `postgresql://${auth}${hostPort}${dbPath}${search}`;
}
const connectionString = buildConnectionStringFromEnv();

export { buildConnectionStringFromEnv };
