import { InputType, Field, Float } from '@nestjs/graphql';
import { IsOptional, IsString, IsNotEmpty, IsPositive } from 'class-validator';

@InputType()
export class CreateItemInput {

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;


  @Field(() => String , { nullable: true })
  @IsString()
  @IsOptional()
  quantityUnits?: string;

}
