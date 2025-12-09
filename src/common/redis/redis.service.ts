import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async get(key: string) {
    try {
      const value = await this.client.get(key);
      this.logger.debug(`GET ${key} - ${value ? 'found' : 'not found'}`);
      this.logger.log(
        `Retrieved key '${key}' from Redis${value ? '' : ' (no value)'}`,
      );
      return value;
    } catch (error) {
      this.logger.error(
        `Error getting key '${key}' from Redis`,
        error as Error,
      );
      throw error;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
        this.logger.log(`Set key '${key}' with TTL ${ttlSeconds}s in Redis`);
      } else {
        await this.client.set(key, value);
        this.logger.log(`Set key '${key}' without TTL in Redis`);
      }
    } catch (error) {
      this.logger.error(`Error setting key '${key}' in Redis`, error as Error);
      throw error;
    }
  }

  async del(key: string) {
    try {
      const result = await this.client.del(key);
      this.logger.log(
        `Deleted key '${key}' from Redis - ${result > 0 ? 'deleted' : 'not found'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error deleting key '${key}' from Redis`,
        error as Error,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('Redis client connection closed');
    } catch (error) {
      this.logger.error(
        'Error closing Redis client connection',
        error as Error,
      );
    }
  }
}
