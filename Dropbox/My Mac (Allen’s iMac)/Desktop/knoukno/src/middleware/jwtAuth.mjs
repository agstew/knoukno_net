import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function jwtAuth(req, _res, next) {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length === 2 && auth[0] === 'Bearer') {
    const token = auth[1];
    try {
      const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
      const payload = jwt.verify(token, secret);
      if (payload && payload.userId) {
        // load full user from DB (omit password)
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (user) {
          const { password, ...publicUser } = user;
          req.user = publicUser; // includes id, email, name, role, createdAt
        } else {
          req.user = null;
        }
      } else {
        req.user = null;
      }
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  return next();
}
