// 必要なモジュールとコンポーネントのインポート
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import DetailInfo from "./DetailInfo";
import DetailComment from "./DetailComment";
import LoadingSpinner from "../common/LoadingSpinner";

// ゲスト詳細画面のメインコンポーネント
const ContactDetail = () => {
  // URLパラメータからゲストIDを取得
  const { id } = useParams();
  const navigate = useNavigate();
  // ゲスト情報と読み込み状態の管理
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時にゲスト情報を取得
  useEffect(() => {
    const fetchGuest = async () => {
      try {
        // Firestoreからゲストデータを取得
        const docRef = doc(db, "chatusers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGuest({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error("詳細データの取得エラー:", error);
        setLoading(false);
      }
    };

    fetchGuest();
  }, [id]);

  // データ読み込み中の表示
  if (loading) {
    return <LoadingSpinner />;
  }

  // ゲストデータが存在しない場合のエラー表示
  if (!guest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">問い合わせが見つかりません</div>
      </div>
    );
  }

  // メインのUI表示
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ヘッダー部分：戻るボタンとタイトル */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600
                     hover:text-gray-900 text-sm transition-colors"
          >
            <i className="fas fa-arrow-left text-xs"></i>
            <span>一覧へ戻る</span>
          </button>
          <h1 className="text-xl font-medium text-gray-900">
            お問い合わせ詳細
          </h1>
          {/* 右側のスペースを確保するための空のdiv */}
          <div className="w-[76px]"></div>
        </div>
      </div>

      {/* ゲスト情報とアクティビティタイムラインの表示 */}
      <div className="grid gap-8">
        <DetailInfo guest={guest} navigate={navigate} />
        <DetailComment guest={guest} />
      </div>
    </div>
  );
};

export default ContactDetail;
