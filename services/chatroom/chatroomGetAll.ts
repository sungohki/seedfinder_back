// import node module
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// import local module
import { connection as conn } from '../../mariadb';
import { verifyAccessToken } from '../common';

export interface IChatroom {
  chatroomId: number;
  numberingId: number;
}

export interface IChatroomPreview extends IChatroom {
  lastMessage: string | null;
  lastMessageCreatedAt: string | null;
  unreadMessageCount: number | null;
}

export const chatroomGetAll = (req: Request, res: Response) => {
  // 로그인 상태 확인
  const decodedUserAccount = verifyAccessToken(req, res);
  if (decodedUserAccount === null) return;
  const sql = `
    SELECT 
      CR.id AS chatroom_id,
      CR.name AS chatroom_name,  -- 채팅방 테이블의 다른 정보도 추가할 수 있습니다.
      C.content AS latest_content,
      C.createdAt AS latest_createdAt
    FROM 
      ChatRoom CR
    JOIN 
      User_ChatRoom UC
      ON CR.id = UC.chatroom_id
    JOIN 
      Chat C
      ON CR.id = C.chatroom_id
    WHERE 
      UC.user_id = ?
    AND 
      C.createdAt = (
        SELECT MAX(C2.createdAt)
        FROM Chat C2
        WHERE C2.chatroom_id = CR.id
      )
  `;
  const values = [decodedUserAccount.id];
  let resValue: Array<IChatroomPreview>;

  try {
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: err,
        });
      }
      resValue = Object.values(results) as Array<IChatroomPreview>;
      return res.status(StatusCodes.OK).json(resValue);
    });
  } catch (e) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: e,
    });
  }
};
