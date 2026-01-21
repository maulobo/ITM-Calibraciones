import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { EnvEnum } from 'src/common/enums/env.enum';
import {
  CustomHttpExceptionResponse,
  HttpExceptionResponse,
} from './interfaces/error.interfaces';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorType: string;
    let errorMessage: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      errorType =
        (errorResponse as HttpExceptionResponse).error || exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorType = 'Critical server error';
    }

    if (exception.response && exception.response.message) {
      errorMessage = exception.response.message;
    }

    const errorResponse = this.getErrorResponse(
      status,
      errorType,
      request,
      errorMessage,
    );
    const errorLog = this.logError(errorResponse, request, exception);

    if (process.env.NODE_ENV === EnvEnum.DEV) {
      console.log(errorLog);
      console.log(exception);
      console.log('----------------------------------------------------');
    }

    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorType: string,
    request: Request,
    errorMessage?: string,
  ): CustomHttpExceptionResponse => {
    const response: CustomHttpExceptionResponse = {
      statusCode: status,
      error: errorType,
      path: request.url,
      method: request.method,
      timestamp: new Date(),
    };

    if (errorMessage) {
      response.message = errorMessage;
    }

    return response;
  };

  private logError = (
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: unknown,
  ): string => {
    const { statusCode, error } = errorResponse;
    const { method, url, body, params } = request;

    if (body && typeof body === 'object' && body.password) {
      body.password = '*******';
    }

    const errorLog = `{
    Response Code ${statusCode} - Method ${method} - URL ${url} - Error ${error}
    Response ${JSON.stringify(errorResponse)}

    Request Body ${body ? JSON.stringify(body) : ''}
    Request Params ${params ? JSON.stringify(params) : ''}
    Request User ${
      (request as any).user ? JSON.stringify((request as any).user) : ''
    }

    Stack ${exception instanceof HttpException ? exception.stack : exception}
}\n`;

    return errorLog;
  };

  private writeErrorLogToFile = (errorLog: string): void => {
    fs.appendFile(process.env.ERRORS_LOG, errorLog, (err) => {
      if (err) throw err;
    });
  };
}
