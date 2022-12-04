import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common/exceptions';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(signupInput: SignupInput): Promise<User> {

    try {

      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      });

      return await this.userRepository.save(newUser);

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {

    if (roles.length === 0)
      return this.userRepository.find();

    return this.userRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY(:...roles)')
      .setParameter('roles', roles)
      .getMany();


  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });

    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });

    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async update(id: string, updateUserInput: UpdateUserInput, lastUpdateBy: User): Promise<User> {

    try {
      const userToUpdate = await this.userRepository.preload({
        ...updateUserInput,
        id,
      });

      userToUpdate.lastUpdatedBy = lastUpdateBy;

      return await this.userRepository.save(userToUpdate);
    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async block(id: string, user: User): Promise<User> {

    const userToBlock = await this.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = user;

    return await this.userRepository.save(userToBlock);
  }

  

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('something went wrong');

  }
}
