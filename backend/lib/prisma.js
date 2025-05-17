import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Add connection retry logic
  __internal: {
    engine: {
      connectTimeout: 10000, // 10 seconds
      retryAttempts: 3
    }
  }
});

// Test database connection with retry logic
const connectWithRetry = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error('❌ All database connection attempts failed');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initial connection
connectWithRetry();

// Handle process termination
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error('Error disconnecting from database:', disconnectError);
  }
  process.exit(1);
});

export default prisma;
