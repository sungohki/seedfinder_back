// Import node module
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';
dotenv.config();

// Import local module
import { IMessageRequest, sendFCM } from '../common/sendFCM';

const testToken =
  'fIY1yA8nRN6iLi8GDfos5h:APA91bHG2LlehZGIC1TK0yLAzAmwE0CW5EtGAxeJR9WBQaKuoyEQwXu4UUEWsrdjgzXtKFnd19ZCvSC-xd15lN8jOVIaeEEaHjGLzskNlizgnR54ejvTpiBmiRPW3PeNYf6G5foDn3RJ';

const testRequest: IMessageRequest = {
  title: 'test',
  body: 'Hello, World!',
  data: {
    documentId: '1',
  },
  deviceToken: testToken,
};

export const testSendFCM = async (req: Request, res: Response) => {
  const result = await sendFCM(testRequest);
  if (result)
    return res.status(StatusCodes.OK).json({
      message: 'success',
    });
  else
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'failed',
    });
};
