// 必要なライブラリとコンポーネントのインポート
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase.js";
import Chatroom from "./components/chatroom/Chatroom.js";
import Auth from "./components/auth/Auth";
import Admin from "./components/Admin.js";
import ContactDetail from "./components/contact-detail/ContactDetail.js";
import { isStaff } from "./constants/staffList";
import "./style/App.css";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ResetPass from "./components/auth/ResetPass";

// メインのアプリケーションロジックを別コンポーネントに分離
function AppContent() {
  // Firebase認証の状態管理
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  // ローディング中はスピナーを表示
  if (loading) {
    return <LoadingSpinner />;
  }

  // パスワードリセット画面へのアクセスは認証状態に関係なく許可
  if (location.pathname === "/reset-password") {
    return <ResetPass />;
  }

  // ユーザーの認証状態に応じて表示するコンポーネントを切り替え
  return user ? <AuthenticatedApp user={user} /> : <Auth />;
}

// 認証済みユーザー向けのアプリケーションコンポーネント
function AuthenticatedApp({ user }) {
  console.log("Current user email:", user.email);
  console.log("Is staff member:", isStaff(user.email));
  const location = useLocation();

  // スタッフユーザーの初回ログイン時のみ/adminにリダイレクト
  // /chat/*へのアクセスは許可する
  if (isStaff(user.email) && location.pathname === "/") {
    return <Navigate to="/admin" replace />;
  }

  // ルーティング設定
  return (
    <Routes>
      {/* チャットルームへのルート */}
      <Route
        path="/chat/:userId"
        element={<ProtectedChatRoute user={user} />}
      />
      {/* 管理者画面へのルート - スタッフのみアクセス可能 */}
      <Route
        path="/admin"
        element={
          isStaff(user.email) ? (
            <Admin />
          ) : (
            <Navigate to={`/chat/${user.uid}`} replace />
          )
        }
      />
      {/* ゲスト詳細画面へのルート - スタッフのみアクセス可能 */}
      <Route
        path="/guest/:id"
        element={
          isStaff(user.email) ? (
            <ContactDetail />
          ) : (
            <Navigate to={`/chat/${user.uid}`} replace />
          )
        }
      />
      {/* ルートパスへのアクセス制御 */}
      <Route
        path="/"
        element={
          isStaff(user.email) ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to={`/chat/${user.uid}`} replace />
          )
        }
      />
    </Routes>
  );
}

// メインのAppコンポーネント
// BrowserRouterでアプリケーション全体をラップ
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// チャットルームへのアクセス制御コンポーネント
function ProtectedChatRoute({ user }) {
  // URLパラメータからユーザーIDを取得
  const { userId } = useParams();

  // スタッフは全てのチャットルームにアクセス可能
  if (isStaff(user.email)) {
    return <Chatroom />;
  }

  // ゲストは自分のチャットルームのみアクセス可能
  if (userId === user.uid) {
    return <Chatroom />;
  }

  // それ以外はホームにリダイレクト
  return <Navigate to="/" replace />;
}

export default App;
