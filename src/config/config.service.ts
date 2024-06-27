import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyConfigService {
  static config: MyConfigService;

  constructor(private configService: ConfigService) {
    MyConfigService.config = this;
  }

  get isDevelopment(): boolean {
    return this.configService.get('NODE_ENV') === 'development';
  }
}
