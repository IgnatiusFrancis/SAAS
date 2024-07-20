import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtAuthService } from '../utils/token.generators';
import { PrismaService } from '../utils/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async signin(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.verifyUser(
        createAuthDto.email,
        createAuthDto.password,
      );

      const token = this.jwtAuthService.generateAuthToken(user.id);
      return this.formatLoginResponse(user, token);
    } catch (error) {
      throw error;
    }
  }

  async signup(createAuthDto: CreateAuthDto) {
    try {
      await this.checkUserExists(createAuthDto.email);

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      const newUser = await this.createUser(
        createAuthDto.email,
        hashedPassword,
      );

      return this.formatSignupResponse(newUser);
    } catch (error) {
      throw error;
    }
  }

  private async verifyUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);

    this.checkUserExistence(user);

    await this.checkPasswordMatch(password, user.password);

    return user;
  }

  private async checkUserExists(email: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }
  }

  private async createUser(email: string, password: string) {
    return this.prismaService.user.create({
      data: {
        email,
        password,
      },
    });
  }

  private async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  private checkUserExistence(user: any) {
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  private async checkPasswordMatch(password: string, hashedPassword: string) {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private formatLoginResponse(user: any, token: string) {
    return {
      success: true,
      message: 'Login successful',
      result: {
        user,
        token,
      },
    };
  }

  private formatSignupResponse(newUser: any) {
    return {
      success: true,
      message: 'Signup successful',
      result: {
        user: newUser,
      },
    };
  }
}
