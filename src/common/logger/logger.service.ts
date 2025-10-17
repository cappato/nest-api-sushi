import { Injectable, LoggerService, Logger } from '@nestjs/common';
import * as util from 'util';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = new Logger('App');

  log(message: any, context?: string) {
    this.logger.log(this.stringify(message), context);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.stringify(message), trace, context);
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.stringify(message), context);
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.stringify(message), context);
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(this.stringify(message), context);
  }

  private stringify(msg: any) {
    return typeof msg === 'string' ? msg : util.inspect(msg, { depth: 2, colors: false });
  }
}

