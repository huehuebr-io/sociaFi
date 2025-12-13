import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import feedRoutes from "./routes/feed.routes.js";
app.use("/feed", feedRoutes);
import nftRoutes from "./routes/nft.routes.js";
app.use("/nft", nftRoutes);
import memeRoutes from "./routes/meme.routes.js";
app.use("/memes", memeRoutes);

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARES GLOBAIS
// =====================================================
app.use(express.json());
app.use(cookieParser());

// CORS CORRETO PARA SOCIALFI
app.use(cors({
  origin: [
    "https://huehuebr.io",
    "https://www.huehuebr.io"
  ],
  credentials: true
}));

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/", (req, res) => {
  res.json({ status: "HueHueBR SocialFi API online" });
});

// =====================================================
// ROTAS
// =====================================================
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// =====================================================
// START
// =====================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 HueHueBR API rodando na porta", PORT);
});
