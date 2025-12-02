import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { FaqSeedService } from './faq-seed.service';
import { Faq, FaqSchema } from '../schemas/faq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }]),
  ],
  controllers: [FaqController],
  providers: [FaqService, FaqSeedService],
  exports: [FaqService],
})
export class FaqModule {}

