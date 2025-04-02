// 必要なライブラリとコンポーネントのインポート
import React, { useState } from "react";
import { auth } from "../../firebase.js";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// パスワードリセット機能を提供するコンポーネント
function ResetPass() {
  // フォームの状態管理
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // パスワードリセットメール送信処理
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Firebaseのパスワードリセット機能を呼び出し
      await sendPasswordResetEmail(auth, email);
      // 成功メッセージを表示
      setMessage("パスワード再設定用のメールを送信しました。");
      // 3秒後にログインページに戻る
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      // エラーメッセージの設定
      setError(
        error.code === "auth/invalid-email"
          ? "メールアドレスの形式が正しくありません。"
          : error.code === "auth/user-not-found"
          ? "このメールアドレスは登録されていません。"
          : "エラーが発生しました。もう一度お試しください。"
      );
    }
  }

  // パスワードリセットフォームのUI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="w-full max-w-[400px] p-8 space-y-8">
        {/* ヘッダー部分 */}
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900">
            パスワード再設定
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        {/* エラーメッセージ表示エリア */}
        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* 成功メッセージ表示エリア */}
        {message && (
          <div className="p-4 text-sm text-green-500 bg-green-50 rounded-lg">
            {message}
          </div>
        )}

        {/* パスワードリセットフォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-colors"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 送信ボタン */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              送信する
            </button>
          </div>

          {/* ログイン画面へ戻るリンク */}
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-blue-600 hover:text-blue-700 
                       transition-colors"
            >
              ログイン画面に戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPass;
