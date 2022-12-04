import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) { }
  @Mutation(() => Boolean, { name: 'executeSeed', description: 'Seed the dabatase' })
  async executeSeed() {
    return await this.seedService.executeSeed();
  }
}
