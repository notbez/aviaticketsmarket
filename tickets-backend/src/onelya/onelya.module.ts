// onelya.module.ts
import { Module } from '@nestjs/common';
import { OnelyaHealthController } from './onelya.health.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [OnelyaHealthController],
})
export class OnelyaModule {}

