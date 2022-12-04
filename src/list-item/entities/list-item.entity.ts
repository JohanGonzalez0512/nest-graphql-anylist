import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';

@Entity({ name: 'listItems' })
@Unique('listItem-item', ['list','item'])

@ObjectType()
export class ListItem {
  
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  quantity: number;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  completed: boolean;


  // //Relations
  @ManyToOne(() => List, (list) => list.listItem, {lazy: true})
  list: List;

  @ManyToOne(() => Item, (item) => item.listItem, {lazy: true})
  @Field(() => Item)
  item: Item;
}
