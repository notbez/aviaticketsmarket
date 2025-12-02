// onelya.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OnelyaController } from './onelya.controller';
import { OnelyaService } from './onelya.service';
import { OnelyaHealthController } from './onelya.health.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120000,
      maxRedirects: 5,
    }),
  ],
  controllers: [OnelyaController, OnelyaHealthController],
  providers: [OnelyaService],
  exports: [OnelyaService],
})
export class OnelyaModule {}