import jwt from "jsonwebtoken";

export function authMiddlewareOptional(req, res, next) {
  const token = req.cookies?.hbr_auth;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      wallet: decoded.wallet
    };

  } catch (err) {
    req.user = null;
  }

  next();
}
