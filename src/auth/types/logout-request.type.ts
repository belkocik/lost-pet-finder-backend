import { FastifyRequest } from 'fastify';

export type JwtPayload = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
};

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}
