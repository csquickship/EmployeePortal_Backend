import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // ---------------- REGISTER ----------------
  async register(email: string, password: string) {
    if (await this.userModel.findOne({ email })) {
      throw new BadRequestException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      email,
      password: hashed,
    });

    return {
      message: 'Registration successful',
      userId: newUser._id,
    };
  }

  // --------------- VALIDATION ---------------
  // async validateUser(email: string, password: string) {
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) throw new UnauthorizedException('User not found');

  //   const match = await bcrypt.compare(password, user.password);
  //   if (!match) throw new UnauthorizedException('Invalid credentials');

  //   return user;
  // }

  async validateUser(email: string, password: string) {
    const isLocal = process.env.IS_LOCAL === 'true';

    // ---------------- LOCAL LOGIN MODE ----------------
    if (isLocal) {
      const localEmail = process.env.LOCAL_EMAIL;
      const localPassword = process.env.LOCAL_PASSWORD;

      if (!localEmail || !localPassword) {
        throw new Error('Local credentials missing in environment variables.');
      }

      if (email !== localEmail || password !== localPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Fake user object return karo — DB hit na ho
      return {
        _id: 'local-user',
        email: localEmail,
        role: 'admin',
        name: 'Local Developer',
      };
    }

    // ---------------- NORMAL DB VALIDATION ----------------
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  // ------------------ LOGIN -----------------
  async login(email: string, password: string) {
    const isLocal = process.env.IS_LOCAL === 'true';
    const normalizedEmail = email.trim().toLowerCase();
    // Always validate using normalized email
    const user = await this.validateUser(normalizedEmail, password);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    if (!isLocal) {
      await this.userModel.findByIdAndUpdate(user._id, {
        refreshToken: this.hash(refreshToken),
      });
    }

    return { accessToken, refreshToken };
  }

  // ------------- TOKEN GENERATORS -------------
  generateAccessToken(user: any) {
    return this.jwtService.sign(
      { id: user._id, email: user.email },
      { expiresIn: '1m' },
    );
  }

  generateRefreshToken(user: any) {
    return this.jwtService.sign({ id: user._id }, { expiresIn: '7d' });
  }

  hash(token: string) {
    return bcrypt.hashSync(token, 10);
  }

  compareHash(token: string, hash: string) {
    return bcrypt.compareSync(token, hash);
  }

  // ---------------- LOGOUT -------------------
  async logout(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
  }

  // --------------- REFRESH TOKEN --------------
  async refreshTokens(refreshToken: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.userModel.findById(payload.id);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const valid = this.compareHash(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException();

    return this.generateAccessToken(user); // new access token only
  }
}
