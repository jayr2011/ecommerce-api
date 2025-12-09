import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { ConfigService, ConfigModule } from '@nestjs/config';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    return new Redis(
      configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
    );
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [redisProvider, RedisService],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
