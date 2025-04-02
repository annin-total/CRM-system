// Firestoreからスタッフ情報を取得するために必要なモジュールをインポート
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

// メールアドレスからスタッフ名を取得する関数
// @param {string} email - 検索対象のメールアドレス
// @return {string} スタッフ名または"不明なスタッフ"
export const fetchStaffName = async (email) => {
  try {
    // メールアドレスで該当するスタッフを検索するクエリを作成
    const q = query(
      collection(db, "chatusers"),
      where("email", "==", email.toLowerCase())
    );
    // クエリを実行してスタッフデータを取得
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // スタッフが見つかった場合、名前を返す
      const staffData = querySnapshot.docs[0].data();
      return staffData.name || "不明なスタッフ";
    }
    // スタッフが見つからなかった場合
    return "不明なスタッフ";
  } catch (error) {
    console.error("スタッフ名の取得エラー:", error);
    return "不明なスタッフ";
  }
};
