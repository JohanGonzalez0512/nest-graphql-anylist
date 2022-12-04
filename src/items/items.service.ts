import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { SearchArgs, PaginationArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) { }

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemRepository.create({
      ...createItemInput,
      user
    });
    return await this.itemRepository.save(newItem);
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.itemRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', { name: `%${search.toLowerCase()}%` });
    }


    return await queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Item> {

    const item = await this.itemRepository.findOneBy({
      id,
      user: {
        id: user.id
      }
    });

    if (!item) throw new NotFoundException(`Item #${id} not found`);

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {


    await this.findOne(id, user);

    const item = await this.itemRepository.preload(updateItemInput);

    if (!item) throw new NotFoundException(`Item #${id} not found`);

    return await this.itemRepository.save(item);

  }

  async remove(id: string, user: User): Promise<Item> {

    // TODO: Soft delete

    const item = await this.findOne(id, user);

    await this.itemRepository.remove(item);

    return { ...item, id };

  }



  async itemCountByUser(user: User): Promise<number> {
    return await this.itemRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    });
  }
}
