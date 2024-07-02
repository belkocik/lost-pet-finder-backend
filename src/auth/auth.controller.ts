import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { AuthenticatedRequest, AuthenticatedRequestRt, Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { AtGuard, RtGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.logout(user.sub);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: AuthenticatedRequestRt) {
    const user = req.user;
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
