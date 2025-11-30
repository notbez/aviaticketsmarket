import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import {
  SupportMessage,
  SupportMessageSchema,
} from '../schemas/support-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportMessage.name, schema: SupportMessageSchema },
    ]),
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}

