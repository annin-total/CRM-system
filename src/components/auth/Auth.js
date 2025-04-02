// 認証関連のコンポーネントをまとめた親コンポーネント
// ログイン、新規登録、パスワードリセットの画面を管理する
import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ResetPass from "./ResetPass";

// Authコンポーネント：認証フローの制御を担当
function Auth() {
  // ログインモードと新規登録モードを切り替えるための状態管理
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();

  // パスワードリセット画面へ遷移する関数
  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  // ルーティング設定を含むUIのレンダリング
  return (
    <Routes>
      {/* パスワードリセット画面へのルート */}
      <Route path="/reset-password" element={<ResetPass />} />
      {/* その他全てのパスに対するルート */}
      <Route
        path="*"
        element={
          isLoginMode ? (
            // ログインモードの場合はLoginコンポーネントを表示
            <Login
              onToggleMode={() => setIsLoginMode(false)}
              onResetPassword={handleResetPassword}
            />
          ) : (
            // 新規登録モードの場合はRegisterコンポーネントを表示
            <Register onToggleMode={() => setIsLoginMode(true)} />
          )
        }
      />
    </Routes>
  );
}

export default Auth;
