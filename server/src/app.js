import express from "express";
import cors from "cors";
import jobRoutes from "./routes/job.routes.js";
import authRoutes from "./routes/auth.routes.js";




const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/health", (req, res) => {
    res.json({ message: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

export default app;