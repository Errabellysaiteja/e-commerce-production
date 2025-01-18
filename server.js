import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Configuring environment variables
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
connectDB();

// Initialize Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
);
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "./client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "./client/build/index.html"));
    });
}

// Default API route
app.get("/", (req, res) => {
    res.send("<h1>Welcome to e-commerce</h1>");
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        success: false,
        message: "Something went wrong!",
    });
});

// Port and Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
            .bgCyan.white
    );
});
