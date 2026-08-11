import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initGoogleSheets } from './db/sheets.js';
import authRoutes from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import { tenantMiddleware } from './middleware/tenant.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);

// Protected routes
app.use(authMiddleware);
app.use(tenantMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tenant: req.tenant?.id });
});

// Initialize and start
async function start() {
  try {
    console.log('📊 Initializing Google Sheets connection...');
    await initGoogleSheets();
    console.log('✅ Google Sheets ready');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
