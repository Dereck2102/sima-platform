import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SUPER_SECRET_KEY_CHANGE_IN_PROD', // Debe coincidir con Auth Service
    });
  }

  async validate(payload: any) {
    // Esto inyecta el objeto "user" en el Request
    return { 
      userId: payload.sub, 
      username: payload.username, 
      tenantId: payload.tenantId, 
      role: payload.role 
    };
  }
}