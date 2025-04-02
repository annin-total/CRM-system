// アクティビティタイムラインコンポーネント
// ゲストの対応履歴を表示し、新しいコメントを追加する機能を提供する

// 必要なモジュールとコンポーネントのインポート
import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// ActivityTimelineコンポーネントの定義
// guest: 表示対象のゲスト情報を受け取るprops
const ActivityTimeline = ({ guest }) => {
  // ユーザー認証状態、コメント入力、スタッフ名、コメント一覧の状態管理
  const [user] = useAuthState(auth);
  const [comment, setComment] = useState("");
  const [staffName, setStaffName] = useState("");
  const [localComments, setLocalComments] = useState(guest.comments || []);

  // コメントの最大文字数を定義
  const MAX_CHARS = 4000;

  // スタッフ名を取得する関数
  // メールアドレスからスタッフのユーザー情報を検索し、名前を返す
  const fetchStaffName = async (email) => {
    try {
      const q = query(
        collection(db, "chatusers"),
        where("email", "==", email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const staffData = querySnapshot.docs[0].data();
        return staffData.name || "不明なスタッフ";
      }
      return "不明なスタッフ";
    } catch (error) {
      console.error("スタッフ名の取得エラー:", error);
      return "不明なスタッフ";
    }
  };

  // コンポーネントマウント時にログインユーザーのスタッフ名を取得
  useEffect(() => {
    const getStaffName = async () => {
      if (user?.email) {
        const name = await fetchStaffName(user.email);
        setStaffName(name);
      }
    };
    getStaffName();
  }, [user]);

  // 新しいコメントを追加する関数
  // Firestoreにコメントを保存し、ローカルの状態も更新する
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const newComment = {
        senderStaffName: staffName,
        comment: comment.trim(),
        createdAt: Timestamp.now(),
      };

      const guestRef = doc(db, "chatusers", guest.id);
      await updateDoc(guestRef, {
        comments: arrayUnion(newComment),
      });

      setLocalComments((prev) => [...prev, newComment]);
      setComment("");
    } catch (error) {
      console.error("コメント追加エラー:", error);
    }
  };

  // タイムスタンプを日本語形式の日時文字列に変換する関数
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

  // UIのレンダリング
  // タイムライン形式でコメント履歴を表示し、新規コメント入力フォームを提供
  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
          <i className="fas fa-history text-gray-400"></i>
          対応履歴
        </h3>

        {/* コメント履歴の表示部分 */}
        <div className="space-y-6 mb-8">
          {localComments.length > 0 ? (
            localComments
              .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)
              .map((comment, index) => (
                <div key={index} className="relative pl-8">
                  {/* タイムラインの縦線 */}
                  <div className="absolute left-[11px] top-2.5 -bottom-8 w-[2px] bg-gray-100"></div>
                  {/* タイムラインのドット */}
                  <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                    <i className="fas fa-comment-dots text-xs text-blue-500"></i>
                  </div>

                  <div className="rounded-lg p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-gray-900 flex items-center gap-2">
                        <i className="fas fa-user-circle text-gray-400"></i>
                        {comment.senderStaffName}
                      </span>
                      <span className="text-gray-500 text-xs flex items-center gap-1.5">
                        <i className="far fa-clock"></i>
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {comment.comment}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500 rounded-lg border border-gray-100">
              <i className="fas fa-inbox text-2xl mb-2"></i>
              <p>対応履歴はありません</p>
            </div>
          )}
        </div>

        {/* 新規コメント入力フォーム */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
              <i className="fas fa-plus-circle text-gray-400"></i>
              コメントを追加
            </h3>
            <span className="text-xs text-gray-500">
              {comment.length}/{MAX_CHARS}
            </span>
          </div>
          <form onSubmit={handleAddComment} className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              maxLength={MAX_CHARS}
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg
                       text-sm resize-y focus:outline-none focus:border-blue-500 
                       focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="対応内容を入力してください"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 
                         hover:bg-blue-100 text-blue-600 rounded-md text-sm 
                         font-medium transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
                コメントを追加
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
