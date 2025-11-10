import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export interface JwtPayloadUser {
  id: string;
  email: string;
  role: string;
}
