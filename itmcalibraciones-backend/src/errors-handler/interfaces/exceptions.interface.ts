import { HttpStatus } from '@nestjs/common';
import { StatusEnum } from '../enums/status.enum';

export type IException = {
  [key in StatusEnum]: {
    message: string;
    status: HttpStatus;
    errorCode?: StatusEnum;
  };
};
