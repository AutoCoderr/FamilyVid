module.exports = {
  DB_PREFIX: "zefjlh_", // Prefix of tables in database
  DB_PASSWORD: "pwd", // Password of database
  DB_USER: "user", // Username of database
  DB_NAME: "db", // Name of database
  DB_HOST: "database", // Host to connect to database
  DB_PORT: 5432, // Port of database
  DB_DRIVER: "postgres", // Driver of database
  UPLOAD_DIR: "Medias", // Folder to store medias

  SALT_NB: 50, // Nb salts for hash
  SALT: "abcd", // Salt for hash

  // Mailer part

  SMTP_HOST: "smtp.gmail.com", // Host of SMTP server
  SMTP_PORT: 465, // Port of SMTP server
  SMTP_SECURE: true, // Is SMTP secure
  SMTP_USER: "user@gmail.com", // Username for SMTP server
  SMTP_PASSWORD: "password", // Password for SMTP server
  MAIL_NAME: "A name",


  UPLOAD_SIZE_LIMIT: 500 * 1024 * 1024, // File upload limited to 500 mo

  // Https part
  SSL_CERTIFICATE: 'crt.crt',
  SSL_PRIVATE_KEY: 'key.key',
  SSL_ENABLED: false,
  SSL_REDIRECT_HTTP_TO_HTTPS: false
};
