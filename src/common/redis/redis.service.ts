import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async get(key: string) {
    const value = await this.client.get(key);
    this.logger.debug(`GET ${key} - ${value ? 'found' : 'not found'}`);
    return value;
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      this.logger.log(`SET ${key} with TTL ${ttlSeconds}s`);
    } else {
      await this.client.set(key, value);
      this.logger.log(`SET ${key} without TTL`);
    }
  }

  async del(key: string) {
    const result = await this.client.del(key);
    this.logger.log(`DEL ${key} - ${result > 0 ? 'deleted' : 'not found'}`);
    return result;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
