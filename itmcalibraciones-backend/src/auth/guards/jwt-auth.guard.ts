import { Injectable, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const IS_PUBLIC_KEY = 'isPublicLOL';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
