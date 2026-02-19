require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./models');
const authRoutes = require('./routes/auth');
const resultRoutes = require('./routes/result');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded screenshots
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/results', resultRoutes);

sequelize.sync({ alter: true }).then(async () => {
  const createDefaultAdmin = require('./createDefaultAdmin');
  await createDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MySQL connection error:', err);
});
