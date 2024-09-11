// import node module
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// import local module
import { connection as conn } from '../../mariadb';
import { verifyAccessToken } from '../common';

export const likePersonalList = (req: Request, res: Response) => {
  // TODO) 로그인 토큰 확인
  const decodedUserAccount = verifyAccessToken(req, res);
  if (decodedUserAccount === null) return;
  const sql = `
    SELECT
      announcement_id
    FROM
      User_Favorite_Business
    WHERE
      user_id = ?
  `;
  const values: Array<number> = [decodedUserAccount.id];

  try {
    let resValue: Array<number> = [];
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).json({
          req: '위시리스트 조회',
          res: err,
        });
      }
      for (let item of Object.values(results))
        resValue.push(item.announcement_id);
      console.log(resValue);
      return res.status(StatusCodes.OK).json({ wish_list: resValue });
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      req: '위시리스트 조회',
      res: err,
    });
  }
};
