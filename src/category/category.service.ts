import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { Repository } from 'typeorm';
import { CategoryCreateReqDto } from './dtos/category_create.req.dto.js';
import { CategoryGetResDto } from './dtos/category_get.res.dto.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly _repository: Repository<Category>,
    private readonly _redisService: RedisService,
  ) {}

  async create(dto: CategoryCreateReqDto): Promise<CategoryGetResDto> {
    const category = this._repository.create({
      title: dto.title,
      slug: dto.slug,
      image: dto.image,
      is_show: true,
      parent_id: dto.parent_id,
      description: dto.description,
    });
    const result = await this._repository.save(category);
    return {
      id: result.id,
      title: result.title,
      slug: result.slug,
      image: result.image ?? '',
      parent_id: result.parent_id,
    };
  }

  async findAll(): Promise<CategoryGetResDto[]> {
    const categories = await this._repository.find();
    const result: CategoryGetResDto[] = [];
    categories.forEach((c: Category) => {
      result.push({
        id: c.id,
        title: c.title,
        slug: c.slug,
        image: c.image ?? '',
        parent_id: c.parent_id,
      });
    });
    return result;
  }

  async findAllWithRedis(): Promise<CategoryGetResDto[]> {
    const cacheKey = 'categories:all';
    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const categories = await this._repository.find();
    const result: CategoryGetResDto[] = categories.map((c: Category) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      image: c.image ?? '',
      parent_id: c.parent_id,
    }));
    await this._redisService.set(cacheKey, JSON.stringify(result), 60);
    return result;
  }

  async findById(id: number): Promise<CategoryGetResDto | undefined> {
    const category = await this._repository.findOneBy({ id });
    if (category) {
      const result: CategoryGetResDto = {
        id: category.id,
        title: category.title,
        slug: category.slug,
        image: category.image ?? '',
        parent_id: category.parent_id,
      };
      return result;
    }
  }
}
