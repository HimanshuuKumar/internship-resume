import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    // authorization header
    const authHeader = req.headers.authorization;

    // check token exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // format:
    // Bearer TOKEN

    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // save user data in request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default auth;
