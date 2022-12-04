import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { SearchArgs, PaginationArgs } from '../common/dto/args';
import { List } from '../lists/entities/list.entity';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class ListItemService {


  constructor(
    @InjectRepository(ListItem)
    private listItemsRepository: Repository<ListItem>,
  ) { }

  async create(createListItemInput: CreateListItemInput) {

    const { itemId, listId, ...rest } = createListItemInput;
    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    await this.listItemsRepository.save(newListItem);

    return this.findOne(newListItem.id);


  }

  async findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {
    const { offset, limit } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` });
    }

    return await queryBuilder.getMany();

  }

  async listItemsCount(list: List): Promise<number> {
    return await this.listItemsRepository.count({
      where: {
        list: {
          id: list.id
        }
      }
    });
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({ id });

    if (!listItem) throw new NotFoundException(`List item with id ${id} not found`);

    return listItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemsRepository.createQueryBuilder()
      .update()
      .set({
        ...rest,
        ...(listId && { list: { id: listId } }),
        ...(itemId && { item: { id: itemId } }),
      })
      .where('id = :id', { id })

    await queryBuilder.execute();

    return this.findOne(id);


  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
