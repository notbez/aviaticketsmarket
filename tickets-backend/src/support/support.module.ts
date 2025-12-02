import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportMessage, SupportMessageSchema } from '../schemas/support-message.schema';
import { AuthModule } from '../auth/auth.module';   // ❗ добавлено

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportMessage.name, schema: SupportMessageSchema },
    ]),

    AuthModule, // ❗ Добавлено — теперь JwtService доступен
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}