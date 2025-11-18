import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { RegisterInput } from '../inputs/register.input';
import { LoginInput } from '../inputs/login.input';
import { RefreshInput } from '../inputs/refresh.input';
import { TokenOutput } from '../outputs/token.output';
import { Public } from '../decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String, { name: 'health' })
  healthCheck(): string {
    return 'OK';
  }

  @Public()
  @Mutation(() => TokenOutput, { name: 'register' })
  async register(@Args('input') input: RegisterInput): Promise<TokenOutput> {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => TokenOutput, { name: 'login' })
  async login(@Args('input') input: LoginInput): Promise<TokenOutput> {
    return this.authService.login(input);
  }

  @Mutation(() => TokenOutput, { name: 'refresh' })
  async refresh(@Args('input') input: RefreshInput): Promise<TokenOutput> {
    return this.authService.refresh(input);
  }
}
