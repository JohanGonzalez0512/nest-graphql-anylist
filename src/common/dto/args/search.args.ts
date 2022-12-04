import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@ArgsType()
export class SearchArgs {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
}
