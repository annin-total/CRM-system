// ログアウト機能を提供するコンポーネント
// Firebase Authenticationを使用してログアウト処理を実行し、
// ログアウト後はホーム画面へリダイレクトする
import React from "react";
import { auth } from "../../firebase.js";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Logout() {
  // ページ遷移のためのhook
  const navigate = useNavigate();

  // ログアウト処理を行う関数
  // Firebase AuthenticationのsignOut関数を呼び出し、
  // 成功時はホーム画面へリダイレクト、失敗時はエラーをコンソールに出力
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // ログアウトボタンのレンダリング
  // クリック時にhandleLogout関数を実行
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 
                 rounded-md text-sm font-medium transition-colors"
    >
      ログアウト
    </button>
  );
}

export default Logout;
