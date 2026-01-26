import { Injectable } from '@nestjs/common';
import { JwtAuthGuard as BaseJwtAuthGuard, RolesGuard as BaseRolesGuard, Roles } from '@sima/shared';

@Injectable()
export class JwtAuthGuard extends BaseJwtAuthGuard {}

@Injectable()
export class RolesGuard extends BaseRolesGuard {}

export { Roles };
