import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './../users/users.service';
import { SignupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-reponse.type';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    private getJwtToken(userId: string) {
        return this.jwtService.sign({ id: userId })
    }
    

    async signup(signupInput: SignupInput): Promise<AuthResponse> {

        const user = await this.usersService.create(signupInput);


        return {
            user,
            token: this.getJwtToken(user.id)
        }


    }


    async login(loginInput: LoginInput): Promise<AuthResponse> {

        const { email, password } = loginInput;
        const user = await this.usersService.findOneByEmail(email);

        if (!bcrypt.compareSync(password, user.password)) {
            throw new BadRequestException('Invalid credentials');
        }

        return {
            user,
            token: this.getJwtToken(user.id)
        }
    }


    async validateUser(userId: string): Promise<User> {

        const user = await this.usersService.findOneById(userId);

        if (!user.isActive)
            throw new UnauthorizedException('User is not active');

        delete user.password;
        return user;
    }

    revalidateToken(user: User): AuthResponse {
        return {
            user,
            token: this.getJwtToken(user.id)
        }
    }

}
