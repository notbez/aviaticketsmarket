import { Controller, Get, Query } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async getFaq(@Query('category') category?: string) {
    return this.faqService.getFaq(category);
  }
}

