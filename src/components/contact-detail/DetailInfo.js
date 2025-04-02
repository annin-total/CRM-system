// ゲスト情報表示と対応状況管理のためのコンポーネント
import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { fetchStaffName } from "../common/staffUtils";

// ゲスト情報と遷移関数を受け取るコンポーネント
const GuestInfo = ({ guest, navigate }) => {
  const [user] = useAuthState(auth);
  const [localGuest, setLocalGuest] = useState(guest);
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    const getStaffName = async () => {
      if (user?.email) {
        const name = await fetchStaffName(user.email);
        setStaffName(name);
      }
    };
    getStaffName();
  }, [user]);

  // 対応状況を更新する関数
  // Firestoreのデータを更新し、ローカルステートも同期する
  const updateStatus = async (newStatus) => {
    try {
      const guestRef = doc(db, "chatusers", guest.id);
      const updateData = {
        status: newStatus,
        supportStaff:
          newStatus === "未対応"
            ? "未定"
            : newStatus === "対応中"
            ? staffName
            : localGuest.supportStaff,
      };

      await updateDoc(guestRef, updateData);
      setLocalGuest((prev) => ({
        ...prev,
        ...updateData,
      }));
    } catch (error) {
      console.error("対応状況の更新エラー:", error);
    }
  };

  // タイムスタンプを日本語の日時形式に変換する関数
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "日時不明";
    try {
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("日時フォーマットエラー:", error);
      return "日時不明";
    }
  };

  // 対応状況に応じた背景色を返す関数
  const getStatusColor = (status) => {
    switch (status) {
      case "未対応":
        return "bg-red-100 text-red-800";
      case "対応中":
        return "bg-blue-100 text-blue-800";
      case "対応済み":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ゲスト情報表示用のUIをレンダリング
  return (
    <div className="bg-white rounded-lg border border-gray-100">
      {/* ゲスト名と対応状況の表示 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-medium text-gray-900">{localGuest.name}</h2>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full
                      ${getStatusColor(localGuest.status)}`}
          >
            <i className="fas fa-circle text-[8px] mr-1.5"></i>
            {localGuest.status}
          </span>
        </div>

        {/* 対応状況変更ボタン群 */}
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus("対応中")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 
                     text-gray-600 rounded-md text-sm transition-colors"
          >
            <i className="fas fa-play text-xs"></i>
            対応開始
          </button>
          <button
            onClick={() => updateStatus("対応済み")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 
                     text-gray-600 rounded-md text-sm transition-colors"
          >
            <i className="fas fa-check text-xs"></i>
            対応完了
          </button>
          <button
            onClick={() => updateStatus("未対応")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 
                     text-gray-600 rounded-md text-sm transition-colors"
          >
            <i className="fas fa-undo-alt text-xs"></i>
            未対応に戻す
          </button>
        </div>
      </div>

      {/* ゲストの基本情報表示セクション */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            <i className="fas fa-box-open mr-1.5 w-4"></i>製品種別
          </label>
          <div className="text-sm text-gray-900">{localGuest.productType}</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            <i className="fas fa-envelope mr-1.5 w-4"></i>メールアドレス
          </label>
          <div className="text-sm text-gray-900">{localGuest.email}</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            <i className="fas fa-phone mr-1.5 w-4"></i>電話番号
          </label>
          <div className="text-sm text-gray-900">{localGuest.phone}</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            <i className="fas fa-clock mr-1.5 w-4"></i>受付日時
          </label>
          <div className="text-sm text-gray-900">
            {formatDateTime(localGuest.createdAt)}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">
            <i className="fas fa-user mr-1.5 w-4"></i>対応担当者
          </label>
          <div className="text-sm text-gray-900">{localGuest.supportStaff || "未定"}</div>
        </div>
      </div>

      {/* お問い合わせ内容表示セクション */}
      <div className="p-6 space-y-6">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-3">
            <i className="fas fa-comment-alt mr-1.5"></i>お問い合わせ内容
          </label>
          <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
            {localGuest.message}
          </p>
        </div>

        {/* チャット画面への遷移ボタン */}
        <div className="pt-2">
          <button
            onClick={() => navigate(`/chat/${localGuest.id}`)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md 
                     text-sm font-medium transition-colors"
          >
            <i className="far fa-comments"></i>
            チャットを開く
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestInfo;
