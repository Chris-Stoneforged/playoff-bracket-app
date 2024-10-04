import { NextFunction, Request, Response } from 'express';
import ServerError from '../errors/serverError';

export default async function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  throw error;
  // let statusCode = 500;
  // if (error instanceof ServerError) {
  //   statusCode = error.statusCode;
  // }

  // let message = error.message;
  // if (statusCode === 500 && process.env.ENV == 'PRODUCTION') {
  //   message = 'Something went wrong';
  // }

  // response.status(statusCode).json({
  //   success: false,
  //   message: message,
  // });
}
