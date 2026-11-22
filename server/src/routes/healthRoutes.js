import { Router } from 'express';
import { isPostgresConnected } from '../db/prisma.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'NEXORA E-Commerce API',
    tagline: 'Discover More. Shop Smarter.',
    version: '1.0.0',
    developer: {
      name: 'Alok Kumar Vishwas',
      role: 'Full-Stack Developer',
      institution: 'GL Bajaj Institute of Technology & Management, Greater Noida',
      email: 'alokvishwas786@gmail.com',
      github: 'https://github.com/alok0204',
      internship: 'Thiranex Task 3'
    },
    database: {
      provider: 'PostgreSQL (Prisma ORM)',
      connected: isPostgresConnected,
      storageMode: isPostgresConnected ? 'Hosted PostgreSQL' : 'Local Persistent Storage'
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

export default router;
