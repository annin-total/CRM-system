// 必要なモジュールとライブラリのインポート
import React, { useState } from "react";
import { auth, db } from "../../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { isStaff } from "../../constants/staffList";
import { useNavigate } from "react-router-dom";

// 製品種別の選択肢を定義
export const PRODUCT_TYPES = [
  { value: "", label: "選択肢から選んでください" },
  { value: "KM-001", label: "KM-001" },
  { value: "HD-100", label: "HD-100" },
  { value: "HD-200", label: "HD-200" },
  { value: "MN-4K27", label: "MN-4K27" },
  { value: "WC-720P", label: "WC-720P" },
  { value: "WC-1080P", label: "WC-1080P" },
  { value: "RT-AX3000", label: "RT-AX3000" },
  { value: "BT-5000", label: "BT-5000" },
  { value: "DS-USB4", label: "DS-USB4" },
  { value: "PB-20000", label: "PB-20000" },
  { value: "CH-100W", label: "CH-100W" },
  { value: "SP-2.1", label: "SP-2.1" },
  { value: "HS-WL", label: "HS-WL" },
  { value: "MS-RGB", label: "MS-RGB" },
  { value: "KB-MEC", label: "KB-MEC" },
  { value: "PR-4800", label: "PR-4800" },
];

// 新規登録フォームのメインコンポーネント
function Register({ onToggleMode }) {
  // フォームの入力値を管理するstate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(""); // 問い合わせ内容
  const [productType, setProductType] = useState(""); // 製品種別
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 新規登録処理を行う関数
  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    // 入力必須項目のチェック
    if (!name || !phone || !email || !password || !message || !productType) {
      setError("全ての必須項目を入力してください。");
      return;
    }

    // 問い合わせ内容がスペースのみの場合は処理を中断
    if (/^[\s　]*$/.test(message)) {
      setError("問い合わせ内容を入力してください。");
      return;
    }

    try {
      //!! デバッグ用のログ出力は本番環境では不要なため、
      //!! 開発環境でのみ出力されるように条件分岐すべきです。
      console.log("Registration started with:", {
        email,
        password,
        name,
        phone,
        message,
        productType,
      });

      // Firebase Authでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created in Auth:", userCredential.user.uid);

      // Firestoreにユーザー情報を保存するためのデータ準備
      const userDocRef = doc(db, "chatusers", userCredential.user.uid);
      const userData = {
        name: name,
        email: email,
        phone: phone,
        message: message,
        productType: productType,
        status: "未対応", // 全ての新規ユーザーを"未対応"として登録
        supportStaff: "未定", // 全ての新規ユーザーを"未定"として登録
        position: isStaff(email) ? "staff" : "guest",
        createdAt: serverTimestamp(),
      };

      // Firestoreにユーザーデータを保存
      console.log("Attempting to save user data:", userData);
      await setDoc(userDocRef, userData);
      console.log("User data saved successfully");

      // 登録成功後のリダイレクト処理
      if (isStaff(email)) {
        navigate("/admin");
      } else {
        navigate(`/chat/${userCredential.user.uid}`);
      }
    } catch (error) {
      // エラーハンドリングとエラーメッセージの設定
      console.error("Registration error:", error);
      setError(
        error.code === "auth/email-already-in-use"
          ? "このメールアドレスは既に使用されています。"
          : error.code === "auth/invalid-email"
          ? "メールアドレスの形式が正しくありません。"
          : error.code === "auth/weak-password"
          ? "パスワードは6文字以上で設定してください。"
          : "エラーが発生しました。もう一度お試しください。"
      );
    }
  }

  // 電話番号入力欄のonChangeハンドラーを修正
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // 半角数字以外を削除
    setPhone(value);
  };

  // 登録フォームのUIレンダリング
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="w-full max-w-[600px] p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900">アカウント作成</h2>
          <p className="mt-2 text-sm text-gray-600">
            新規登録して問い合わせを開始
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-colors"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-colors"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={12}
                required
              />
            </div>

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
                maxLength={200}
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                製品種別
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-colors"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お問い合わせ内容
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-colors min-h-[120px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                required
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {message.length}/2000文字
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={handleRegister}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              登録する
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onToggleMode}
              className="text-sm text-blue-600 hover:text-blue-700 
                       transition-colors"
            >
              既にアカウントをお持ちの方はこちら
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
