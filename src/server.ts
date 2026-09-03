 
import app from "./app";
import { env } from "./config/env";
 

const startServer = async (): Promise<void> => {
  try {
    app.listen(env.port, () => {
      console.log(
        `🚀 Mini Kanban server running on http://localhost:${env.port}`,
      );

      console.log(`🌍 Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();