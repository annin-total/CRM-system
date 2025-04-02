// メッセージ送信機能を提供するコンポーネント
// Firestoreを使用してメッセージを保存し、リアルタイムでチャットを更新する
import React, { useState } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";

function SendMessage() {
  // メッセージの入力値を管理するstate
  const [message, setMessage] = useState("");
  // URLパラメータからユーザーIDを取得
  const { userId } = useParams();

  // メッセージ送信処理を行う関数
  async function sendMessage(e) {
    e.preventDefault();
    if (message.trim() === "") return;

    // 現在ログイン中のユーザーのメールアドレスを取得
    const { email } = auth.currentUser;

    try {
      const chatDocRef = doc(db, "chatmessages", userId);
      // ドキュメントが存在しない場合は新規作成
      const docSnap = await getDoc(chatDocRef);
      if (!docSnap.exists()) {
        await setDoc(
          chatDocRef,
          {
            messages: [
              {
                messageText: message,
                sender: email,
                createdAt: Timestamp.now(),
              },
            ],
          },
          { merge: true }
        );
      } else {
        // 既存のドキュメントの場合は配列に追加
        await updateDoc(chatDocRef, {
          messages: arrayUnion({
            messageText: message,
            sender: email,
            createdAt: Timestamp.now(),
          }),
        });
      }

      // 送信後、入力フィールドをクリア
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // メッセージ入力フォームのUI
  return (
    <form onSubmit={sendMessage} className="relative">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="メッセージを入力"
        className="w-full pl-5 pr-[130px] py-4 bg-gray-50 border border-gray-200 
                 rounded-full text-sm focus:outline-none focus:border-blue-500 
                 focus:ring-1 focus:ring-blue-500 focus:bg-white 
                 placeholder-gray-400 transition-colors"
      />
      <div className="absolute right-2 top-2">
        <button
          type="submit"
          disabled={!message.trim()}
          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 
                   text-blue-600 rounded-full text-sm font-medium 
                   transition-colors hover:bg-blue-100 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:bg-blue-50"
        >
          <span>送信</span>
          <i className="fas fa-paper-plane text-xs"></i>
        </button>
      </div>
    </form>
  );
}

export default SendMessage;
