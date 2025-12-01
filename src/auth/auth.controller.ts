import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtCookieGuard } from './guards/jwt-cookie.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );

    // ACCESS TOKEN COOKIE
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 1000, // 1 minute
      path: '/',
    });

    // REFRESH TOKEN COOKIE
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { message: 'Login successful' };
  }

  @Get('me')
  @UseGuards(JwtCookieGuard)
  me(@Req() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      // Add only if your user schema has name
      name: req.user.name ?? null,
    };
  }

  @Post('logout')
  @UseGuards(JwtCookieGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException();

    const newAccess = await this.authService.refreshTokens(refreshToken);

    // Only update access token
    res.cookie('access_token', newAccess, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 1000,
      path: '/',
    });

    return { message: 'Token refreshed' };
  }
}
