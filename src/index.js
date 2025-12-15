import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import nftRoutes from "./routes/nft.routes.js";
import memeRoutes from "./routes/meme.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();

/* =====================================================
   APP INIT (TEM QUE VIR ANTES DE QUALQUER app.use)
===================================================== */
const app = express();
// 🔥 OBRIGATÓRIO NO RAILWAY
app.set("trust proxy", 1);
/* =====================================================
   MIDDLEWARES GLOBAIS
===================================================== */
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "https://huehuebr.io",
    "https://www.huehuebr.io"
  ],
  credentials: true
}));

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/", (req, res) => {
  res.json({ status: "HueHueBR SocialFi API online" });
});

/* =====================================================
   ROTAS
===================================================== */
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/feed", feedRoutes);
app.use("/nft", nftRoutes);
app.use("/memes", memeRoutes);
app.use("/notifications", notificationRoutes);

/* =====================================================
   STATIC FILES
===================================================== */
app.use("/uploads", express.static("uploads"));

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 HueHueBR API rodando na porta", PORT);
});
