import app from "./app";
import { env } from "./config/env";
import prisma from "./lib/prisma";
 

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL database connected");

    app.listen(env.port, () => {
      console.log(
        `🚀 Mini Kanban server running on http://localhost:${env.port}`,
      );

      console.log(`🌍 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

startServer();