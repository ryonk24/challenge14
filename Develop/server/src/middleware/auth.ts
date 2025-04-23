import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  username: string;
  id: string;
}

const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const generateToken = (user: { username: string; id: string }) => {
  jwt.sign(
    { username: user.username, id: user.id },
    secret,
    { expiresIn: '1h' },
    (err, token) => {
      if (err) {
        console.error('Error generating token:', err);
        throw new Error('Token generation failed');
      }
      return token;
    }
  );
};
export const verifyToken = (token: string) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return reject(new Error('Token verification failed'));
      }
      resolve(decoded as JwtPayload);
    });
  });
};
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }
  try {
    const decoded = await verifyToken(token);
    req.user = decoded; // Add user data to request object
    return next(); // Call the next middleware
  } catch (error) {
    console.error('Token verification error:', error);
    return res.sendStatus(403); // Forbidden
  }
};

// Removed duplicate declaration of authenticateToken
