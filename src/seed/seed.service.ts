import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,

        private readonly usersService: UsersService,

        private readonly itemsService: ItemsService,

        private readonly listsService: ListsService,

        private readonly listItemsService: ListItemService,

    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }
    async executeSeed() {

        if (this.isProd)
            throw new UnauthorizedException('We are in production, you cannot seed the database');

        await this.deleteDatabse();

        const user = await this.loadUsers();

        await this.loadItems(user);

        // Create lists
        const list = await this.loadLists(user);

        const items = await this.itemsService.findAll(user, { limit: 15, offset: 0 }, {})
        await this.loadListItems(list, items);


        return true
    }

    async deleteDatabse() {
        // ListItems
        await this.listItemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Lists

        await this.listsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Delete all items
        await this.itemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Delete all users
        await this.usersRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUsers(): Promise<User> {
        const users = [];

        for (const user of SEED_USERS) {
            users.push(this.usersService.create(user));
        }

        return users[0];
    }

    async loadItems(user: User): Promise<void> {
        const items: Promise<Item>[] = [];

        for (const item of SEED_ITEMS) {
            items.push(this.itemsService.create(item, user));
        }

        await Promise.all(items);

    }

    async loadLists(user: User): Promise<List> {
        const lists = [];

        for (const list of SEED_LISTS) {
            lists.push(this.listsService.create(list, user));
        }

        return lists[0];
    }

    async loadListItems(list: List, items: Item[]) {
        for (const item of items) {
            this.listItemsService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            });
        }

    }
}
