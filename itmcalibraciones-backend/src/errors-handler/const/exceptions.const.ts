import { HttpStatus } from '@nestjs/common';
import { StatusEnum } from '../enums/status.enum';
import { IException } from '../interfaces/exceptions.interface';

export const EXCEPTIONS: IException = {
  '200': {
    status: HttpStatus.OK,
    message: 'Ok',
  },
  '400': {
    status: HttpStatus.BAD_REQUEST,
    message: 'Bad Request',
  },
  '401': {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Unauthorized',
  },
  '403': {
    status: HttpStatus.FORBIDDEN,
    message: 'Forbidden',
  },
  '404': {
    status: HttpStatus.NOT_FOUND,
    message: 'Not found',
  },
  '500': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
  },
  '1000': {
    status: HttpStatus.CONFLICT,
    message: 'The user already exists',
    errorCode: StatusEnum.USER_ALREADY_EXISTS,
  },
  '1001': {
    status: HttpStatus.NOT_FOUND,
    message: "The user doesn't exists",
    errorCode: StatusEnum.USER_NOT_FOUND,
  },
  '1002': {
    status: HttpStatus.NOT_FOUND,
    message: "Instrument dose not belong to the user",
    errorCode: StatusEnum.INSTRUMENT_NOT_BELONG_TO_USER,
  },
  '1003': {
    status: HttpStatus.NOT_FOUND,
    message: "The employee doesn't exists",
    errorCode: StatusEnum.EMPLOYEE_NOT_FOUND,
  },
  '1004': {
    status: HttpStatus.NOT_FOUND,
    message: "The company doesn't exists",
    errorCode: StatusEnum.COMPANY_NOT_FOUND,
  },
  '1005': {
    status: HttpStatus.NOT_FOUND,
    message: 'La cuenta de correo no se encuentra registada. Debe solicitar una cuenta.',
    errorCode: StatusEnum.LOGIN_USER_NOT_FOUND,
  },
  '1006': {
    status: HttpStatus.NOT_FOUND,
    message: 'La combinacion de usuario y contraseña es incorrecta. ',
    errorCode: StatusEnum.LOGIN_USER_FAIL,
  },
  '1007': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The password is incorrect',
    errorCode: StatusEnum.PASSWORD_INCORRECT,
  },
  '1008': {
    status: HttpStatus.NOT_FOUND,
    message: 'The field dose not exist',
    errorCode: StatusEnum.FIELD_NOT_EXIST,
  },
  '1009': {
    status: HttpStatus.NOT_FOUND,
    message: 'The client dose not exist',
    errorCode: StatusEnum.CLIENT_NOT_EXIST,
  },
  '1010': {
    status: HttpStatus.NOT_FOUND,
    message: 'The city dose not exist',
    errorCode: StatusEnum.CITY_NOT_FOUND,
  },
  '1011': {
    status: HttpStatus.NOT_FOUND,
    message: 'The office does not exist',
    errorCode: StatusEnum.OFFICE_NOT_FOUND,
  },
  '1012': {
    status: HttpStatus.NOT_FOUND,
    message: 'The event is no related to the user',
    errorCode: StatusEnum.  EVENT_NOT_RELATED_TO_USER
  },
  '1013': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The event is OPEN, can not be process',
    errorCode: StatusEnum.  EVENT_SCORE_NOT_PROCESS_IS_OPEN
  },
  '1014': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The event is CLOSE, the bet can not be added',
    errorCode: StatusEnum.  EVENT_IS_CLOSE
  },
  '1015': {
    status: HttpStatus.NOT_FOUND,
    message: 'Cross not found',
    errorCode: StatusEnum.  CROSS_NOT_FOUND
  },
  '1016': {
    status: HttpStatus.NOT_FOUND,
    message: 'The Options selected is not belong to the field options',
    errorCode: StatusEnum.  OPTION_NOT_RELATED_TO_FIELD
  },
  '1017': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The Cross is close, is not posible to update it',
    errorCode: StatusEnum.  CROSS_IS_CLOSE
  },
  '1018': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The event already exist in the user events',
    errorCode: StatusEnum.  EVENT_ALREADY_ADDED
  },
  '1019': {
    status: HttpStatus.FORBIDDEN,
    message: 'The token has been used',
    errorCode: StatusEnum.TOKEN_USED
  },
  '1020': {
    status: HttpStatus.FORBIDDEN,
    message: 'La cuenta de correo no se encuentra verificada.',
    errorCode: StatusEnum.USER_NOT_VERIFY
  },
  '1021': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The system try to send an email to real user on DEV enviroment.',
    errorCode: StatusEnum.AVOID_SEND_EMAIL_TO_REAL_USER_ON_DEV
  },
  '1022': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'The reCAPTCHA is not valid.',
    errorCode: StatusEnum.ERROR_RECAPTCHA_NOT_VALID
  },
  '1023': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Error verifying reCAPTCHA.',
    errorCode: StatusEnum.ERROR_VERYFING_RECAPTCHA
  },
  '1024': {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Error can´t delete the certificate becouse is under use.',
    errorCode: StatusEnum.ERROR_DELETE_CERTIFICATE_UNDER_USING
  }
  
};
