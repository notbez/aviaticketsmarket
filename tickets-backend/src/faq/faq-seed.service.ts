import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../schemas/faq.schema';
import { faqSeedData } from './seed-faq';

@Injectable()
export class FaqSeedService implements OnModuleInit {
  constructor(@InjectModel(Faq.name) private faqModel: Model<FaqDocument>) {}

  async onModuleInit() {
    // Seed FAQ only if collection is empty
    const count = await this.faqModel.countDocuments();
    if (count === 0) {
      await this.faqModel.insertMany(faqSeedData);
      console.log('✅ FAQ data seeded successfully');
    }
  }
}

