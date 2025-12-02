// onelya.health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('onelya')
export class OnelyaHealthController {
  private readonly logger = new Logger(OnelyaHealthController.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('ONELYA_BASE_URL') ||
      'https://api-test.onelya.ru/';
  }

  @Get('health')
  async checkHealth() {
    const checkUrl = this.baseUrl;
    
    this.logger.log(`[Health] Checking Onelya API at ${checkUrl}`);

    try {
      const response = await firstValueFrom(
        this.http.get(checkUrl, {
          timeout: 10000,
          validateStatus: () => true, // Принимаем любой статус
        }),
      );

      const statusCode = response.status;
      const bodyPreview = response.data
        ? String(response.data).substring(0, 200)
        : null;

      this.logger.log(`[Health] Onelya API response status: ${statusCode}`);

      return {
        apiReachable: true,
        statusCode,
        bodyPreview,
        baseUrl: this.baseUrl,
        checkedUrl: checkUrl,
      };
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      this.logger.error(`[Health] Onelya API check failed: ${errorMessage}`);

      return {
        apiReachable: false,
        error: errorMessage,
        baseUrl: this.baseUrl,
        checkedUrl: checkUrl,
      };
    }
  }
}

