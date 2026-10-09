module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'clinic_daily_secret_key',
  tokenExpiresIn: '8h'
};
