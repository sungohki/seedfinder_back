// import node module
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// import local module
import { verifyAccessToken } from '../common';
import mariadb from 'mysql2/promise';
import { connInfo } from '../../mariadb';

export interface ISurveyInfo {
  businessCategory: Array<string>;
  businessRegion: Array<string>;
  businessApply: Array<string>;
  businessExperience: number;
  businessTargetAge: number;
}

// 회원 정보 설문
export const userSurveyInfo = async (req: Request, res: Response) => {
  // 로그인 상태 확인
  const decodedUserAccount = verifyAccessToken(req, res);
  if (decodedUserAccount === null) return;

  const conn = await mariadb.createConnection(connInfo);
  const {
    businessCategory,
    businessRegion,
    businessApply,
    businessExperience,
    businessTargetAge,
  } = req.body as ISurveyInfo;
  let sql, values, results;

  // 1. 지원사업분류
  // 전처리
  sql = `DELETE FROM User_Business_Classification WHERE user_id = ?`;
  values = [decodedUserAccount.id];
  [results] = await conn.query(sql, values);
  console.log(results);

  for (let item of businessCategory) {
    sql = `
      INSERT INTO
        User_Business_Classification
          (user_id, business_classification_id)
        VALUE
          (?, (SELECT id FROM Business_Classification WHERE name = ?))`;
    values = [decodedUserAccount.id, item];
    [results] = await conn.query(sql, values);
    console.log(
      `1. 지원 사업 분류 정보 저장 완료 (${decodedUserAccount.id} : ${item})`
    );
  }

  // 2. 신청대상
  // 전처리
  sql = `DELETE FROM User_Application_Target WHERE user_id = ?`;
  values = [decodedUserAccount.id];
  [results] = await conn.query(sql, values);
  console.log(results);

  for (let item of businessApply) {
    sql = `
      INSERT INTO
          User_Application_Target
          (user_id, application_target_id)
        VALUE
          (?, (SELECT id FROM Application_Target WHERE name = ?))`;
    values = [decodedUserAccount.id, item];
    [results] = await conn.query(sql, values);
    console.log(
      `2. 신청 대상 정보 저장 완료 (${decodedUserAccount.id} : ${item})`
    );
  }

  // 3. 지역
  // 전처리
  sql = `DELETE FROM User_Support_Region WHERE user_id = ?`;
  values = [decodedUserAccount.id];
  [results] = await conn.query(sql, values);
  console.log(results);

  for (let item of businessRegion) {
    sql = `
      INSERT INTO
        User_Support_Region
        (user_id, support_region_id)
      VALUE
      (?, (SELECT id FROM Support_Region WHERE name = ?))`;
    values = [decodedUserAccount.id, item];
    [results] = await conn.query(sql, values);
    console.log(`3. 지역 정보 저장 완료 (${decodedUserAccount.id} : ${item})`);
  }

  // 4. 업력 & 예비창업자여부 & 연령
  sql = `
    UPDATE
      User
    SET
      user_age = ?, pre_business_status = ?, business_duration = ?
    WHERE
      id = ?`;
  if (businessExperience === 0)
    values = [businessTargetAge, true, null, decodedUserAccount.id];
  else
    values = [
      businessTargetAge,
      false,
      businessExperience,
      decodedUserAccount.id,
    ];
  [results] = await conn.query(sql, values);
  console.log(`4. 업력 & 예비창업자 여부 & 연령 정보 저장 완료`);
  console.log(results);

  return res.status(StatusCodes.OK).json({
    request: '설문 정보 저장',
    response: '성공',
  });
};
