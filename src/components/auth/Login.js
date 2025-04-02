// 必要なライブラリとコンポーネントのインポート
import React, { useState } from "react";
import { auth } from "../../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// ログインコンポーネント
// onToggleMode: 新規登録画面への切り替え用関数
// onResetPassword: パスワードリセット画面への遷移用関数
function Login({ onToggleMode, onResetPassword }) {
  // フォームの入力値と、エラーメッセージの状態管理
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ログイン処理を行う関数
  // Firebase Authenticationを使用してログイン認証を実行
  // エラー発生時は適切なエラーメッセージを表示
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(
        error.code === "auth/invalid-email"
          ? "メールアドレスの形式が正しくありません。"
          : error.code === "auth/user-not-found"
          ? "メールアドレスまたはパスワードが間違っています。"
          : "エラーが発生しました。もう一度お試しください。"
      );
    }
  }

  // ログインフォームのUI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="w-full max-w-[400px] p-8 space-y-8">
        {/* ヘッダーセクション */}
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900">ログイン</h2>
          <p className="mt-2 text-sm text-gray-600">
            アカウントにサインインして続行
          </p>
        </div>

        {/* エラーメッセージ表示エリア */}
        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* ログインフォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
            {/* メールアドレス入力フィールド */}
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

            {/* パスワード入力フィールド */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-colors"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ログインボタン */}
          <div>
            <button
              type="submit"
              onClick={handleLogin}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              ログイン
            </button>
          </div>

          {/* 補助リンク（パスワードリセットと新規登録） */}
          <div className="text-center space-y-3">
            <button
              onClick={onResetPassword}
              className="text-sm text-gray-500 hover:text-gray-700 
                       transition-colors"
            >
              パスワードをお忘れの方はこちら
            </button>
            <button
              onClick={onToggleMode}
              className="block w-full text-sm text-blue-600 hover:text-blue-700 
                       transition-colors"
            >
              アカウントをお持ちでない方はこちら
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
