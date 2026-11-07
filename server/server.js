import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.config.js";

const startServer = async () => {
  try {
    await connectDB();

    await new Promise((resolve, reject) => {
      const server = app.listen(env.port, () => {
        console.log("Server running on port:", env.port);
        console.log(`URL: http://localhost:${env.port}`);
        resolve(server);
      });
      server.once("error", reject);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

startServer();
