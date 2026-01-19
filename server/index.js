require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const shiftRoutes = require('./routes/shifts');
const employeeRoutes = require('./routes/employees');
const scheduleRoutes = require('./routes/schedules');
const reportRoutes = require('./routes/reports');

app.use('/auth', authRoutes);
app.use('/shifts', shiftRoutes);
app.use('/employees', employeeRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/reports', reportRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.send('InSync API is running');
});

// Organization Status Endpoint (Live Board) - Placeholder
app.get('/org/status', async (req, res) => {
  // TODO: Implement actual logic
  res.json({ message: "Organization Status Endpoint" });
});


const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
