import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../utils/prisma';
import { mockAuthDto } from '../utils/mockData/mockAuthData/mock';
import { JwtAuthService } from '../utils/token.generators';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let callCounter = 0;

  beforeEach(async () => {
    // Mock bcrypt.compare to always return true during the test
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtAuthService,
        ConfigService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockReturnValue(mockAuthDto),
              findUnique: jest.fn().mockImplementation(() => {
                if (callCounter == 0) {
                  callCounter++;
                  return null;
                } else {
                  return mockAuthDto;
                }
              }),
              // .mockReturnValueOnce(null) // For signup
              // .mockReturnValueOnce(mockAuthDto), // For signin
              // findUnique: jest.fn().mockReturnValueOnce(null),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should sign up successfully', async () => {
    callCounter = 0;
    // Mock the prismaService.user.findUnique method
    const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');

    // Call the service method
    const result = await service.signup(mockAuthDto);

    // Assertions
    expect(result).toEqual({
      success: true,
      message: 'Signup successful',
      result: {
        user: {
          email: mockAuthDto.email,
          password: mockAuthDto.password,
        },
      },
    });

    // Verify findUniqueSpy calls
    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { email: mockAuthDto.email },
    });
    expect(findUniqueSpy).toHaveBeenCalledTimes(1);
  });

  it('should sign in successfully', async () => {
    // Mock the prismaService.user.findUnique method
    const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');

    // Call the service method
    const result = await service.signin(mockAuthDto);

    // Assertions
    expect(result.success).toBe(true);
    expect(result.message).toBe('Login successful');

    // Verify findUniqueSpy calls
    expect(findUniqueSpy).toHaveBeenCalledWith({
      where: { email: mockAuthDto.email },
    });
    expect(findUniqueSpy).toHaveBeenCalledTimes(1);
  });
});
