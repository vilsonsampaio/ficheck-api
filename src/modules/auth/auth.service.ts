import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersRepository } from 'src/shared/database/repositories/users.repositories';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.usersRepository.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password } = signUpDto;

    const isEmailAlreadyExists = await this.usersRepository.findUnique({
      where: { email },
      select: { id: true },
    });

    if (isEmailAlreadyExists) {
      throw new ConflictException('This email is already in use');
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.usersRepository.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          createMany: {
            data: [
              // Income
              { name: 'Salário', icon: 'salary', type: 'INCOME' },
              { name: 'Freelance', icon: 'freelance', type: 'INCOME' },
              { name: 'Outro', icon: 'other', type: 'INCOME' },

              // Outcome
              { name: 'Casa', icon: 'home', type: 'OUTCOME' },
              { name: 'Alimentação', icon: 'food', type: 'OUTCOME' },
              { name: 'Educação', icon: 'education', type: 'OUTCOME' },
              { name: 'Lazer', icon: 'fun', type: 'OUTCOME' },
              { name: 'Mercado', icon: 'grocery', type: 'OUTCOME' },
              { name: 'Roupas', icon: 'clothes', type: 'OUTCOME' },
              { name: 'Transporte', icon: 'transport', type: 'OUTCOME' },
              { name: 'Viagem', icon: 'travel', type: 'OUTCOME' },
              { name: 'Outro', icon: 'other', type: 'OUTCOME' },
            ],
          },
        },
      },
    });

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  private async generateAccessToken(userId: string) {
    return await this.jwtService.signAsync({ sub: userId });
  }
}
