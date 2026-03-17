import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
connectDB();
connectRedis();

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => {
    console.log(`server is listening on port ${PORT}`);
});