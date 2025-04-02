// スタッフメンバーのメールアドレスと役職を管理するオブジェクト
// 環境変数から各スタッフのメールアドレスを取得し、それぞれの役職情報とマッピング
export const STAFF_EMAILS = {
  [process.env.REACT_APP_STAFF_1_EMAIL]: {
    position: "staff",
  },
  [process.env.REACT_APP_STAFF_2_EMAIL]: {
    position: "staff",
  },
  [process.env.REACT_APP_STAFF_3_EMAIL]: {
    position: "staff",
  },
};

// 与えられたメールアドレスがスタッフのものかどうかを判定する関数
// @param {string} email - 確認するメールアドレス
// @returns {boolean} - スタッフの場合はtrue、そうでない場合はfalse
export const isStaff = (email) => {
  // メールアドレスが未定義の場合はfalseを返す
  if (!email) return false;
  // メールアドレスを小文字に変換してSTAFF_EMAILSに存在するか確認
  // 二重否定で真偽値に変換して返す
  return !!STAFF_EMAILS[email.toLowerCase()];
};
