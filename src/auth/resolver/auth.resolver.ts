import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { RegisterInput } from '../inputs/register.input';
import { LoginInput } from '../inputs/login.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String, { name: 'health' })
  healthCheck(): string {
    return 'OK';
  }

  @Mutation(() => String, { name: 'register' })
  async register(@Args('input') input: RegisterInput) {
    const res = await this.authService.register(input);
    return res.access_token;
  }

  @Mutation(() => String, { name: 'login' })
  async login(@Args('input') input: LoginInput) {
    const res = await this.authService.login(input);
    return res.access_token;
  }
}
