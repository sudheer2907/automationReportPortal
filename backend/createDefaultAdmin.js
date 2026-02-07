const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createDefaultAdmin() {
  const admin = await User.findOne({ where: { username: 'admin' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('gcsecret', 10);
    await User.create({ username: 'gcadmin', password: hashedPassword, role: 'admin' });
    console.log('Default admin user created.');
  } else {
    console.log('Default admin user already exists.');
  }
}

module.exports = createDefaultAdmin;
