import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.cookies?.hbr_auth;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Não autenticado"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      wallet: decoded.wallet
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Sessão inválida ou expirada"
    });
  }
}
