import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtPayload } from '../types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'rt-secret',
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: JwtPayload) {
    const refreshToken = req.headers.authorization.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
