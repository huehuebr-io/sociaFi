import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();

/**
 * GET /notifications
 */
router.get("/", authMiddleware, async (req, res) => {
  const { rows } = await db.query(
    `
    SELECT n.*, u.username, u.avatar_url
    FROM notifications n
    LEFT JOIN users u ON n.from_user_id = u.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 20
    `,
    [req.user.id]
  );

  res.json({ success: true, items: rows });
});

/**
 * POST /notifications/read
 */
router.post("/read", authMiddleware, async (req, res) => {
  await db.query(
    "UPDATE notifications SET read = true WHERE user_id = $1",
    [req.user.id]
  );

  res.json({ success: true });
});

export default router;
