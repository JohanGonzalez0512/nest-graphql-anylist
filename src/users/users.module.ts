import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from '../items/items.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ItemsModule,
    ListsModule
  ],
  providers: [UsersResolver, UsersService],
  exports: [
    UsersService,
    TypeOrmModule
  ]

})
export class UsersModule { }
