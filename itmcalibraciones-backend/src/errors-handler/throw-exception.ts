import { HttpException } from '@nestjs/common';
import { EXCEPTIONS } from './const/exceptions.const';
import { StatusEnum } from './enums/status.enum';

export const throwException = (statusEnum: StatusEnum) => {
  const { status, message, errorCode } = EXCEPTIONS[statusEnum];

  throw new HttpException(
    {
      status,
      error: {
        errorCode,
        message,
      },
    },
    status,
  );
};
