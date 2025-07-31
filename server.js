const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(express.json());

// Allow CORS
const allowedOrigins = ['http://localhost:3000', 'http://192.168.29.122:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(morgan('combined'));

// ✅ Proper Mongoose connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected with Mongoose');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
