import jwt from "jsonwebtoken";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const headerToken = req.headers?.["x-auth-token"] || req.headers?.["X-Auth-Token"];
  if (typeof headerToken === "string" && headerToken.trim()) {
    return headerToken.trim();
  }

  return req.cookies?.token || null;
};

const isAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        message: "user does not have a token"
      });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!verifyToken) {
      return res.status(401).json({
        message: "user does not have a valid token"
      });
    }

    req.userId = verifyToken.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "user does not have a valid token"
    });
  }
};

export default isAuth;