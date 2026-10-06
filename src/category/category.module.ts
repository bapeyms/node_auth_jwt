import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { RedisModule } from '../redis/redis.modules.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), RedisModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [],
})
export class CategoryModule {}
