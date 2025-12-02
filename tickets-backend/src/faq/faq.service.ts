import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from '../schemas/faq.schema';

@Injectable()
export class FaqService {
  constructor(@InjectModel(Faq.name) private faqModel: Model<FaqDocument>) {}

  async getFaq(category?: string) {
    const query: any = { isActive: true };
    if (category) {
      query.category = category;
    }
    return this.faqModel.find(query).sort({ order: 1, createdAt: 1 }).exec();
  }

  async createFaq(faqData: Partial<Faq>): Promise<FaqDocument> {
    const faq = new this.faqModel(faqData);
    return faq.save();
  }
}

