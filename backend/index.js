require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./models');
const authRoutes = require('./routes/auth');
const resultRoutes = require('./routes/result');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/results', resultRoutes);

sequelize.sync().then(async () => {
  const createDefaultAdmin = require('./createDefaultAdmin');
  await createDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MySQL connection error:', err);
});
