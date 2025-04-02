// チャットアプリケーションに必要なReactコンポーネントとフックをインポート
import React, { useEffect, useState, useRef } from "react";
import Logout from "../auth/Logout.js";
import { auth, db } from "../../firebase.js";
import {
  doc,
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import SendMessage from "./SendMessage.js";
import { useParams, useNavigate } from "react-router-dom";
import { isStaff } from "../../constants/staffList.js";

// チャットのメインコンポーネント
function Chatroom() {
  // メッセージ、ゲスト名、ユーザー情報の状態管理
  const [messages, setMessages] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [users, setUsers] = useState({});
  const { userId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // チャットの最下部へスクロールする関数
  const scrollToBottom = () => {
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  // Firestoreからリアルタイムでメッセージを取得し、
  // メッセージの配列とゲスト名を状態として保存
  // コンポーネントのアンマウント時にリスナーを解除
  useEffect(() => {
    const chatDocRef = doc(db, "chatmessages", userId);

    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMessages(data.messages || []);
        setGuestName(data.guestName || "ゲスト");
      }
    });

    return () => {
      unsubscribe();
      setMessages([]);
      setGuestName("");
    };
  }, [userId]);

  // 新しいメッセージが追加されたら最下部へスクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // メッセージの送信者情報をFirestoreから取得し、
  // ローカルのユーザー情報キャッシュに保存
  useEffect(() => {
    const fetchUserData = async (email) => {
      try {
        const q = query(
          collection(db, "chatusers"),
          where("email", "==", email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUsers((prev) => ({
            ...prev,
            [email]: userData.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    messages.forEach((message) => {
      if (!users[message.sender]) {
        fetchUserData(message.sender);
      }
    });
  }, [messages, users]);

  // メッセージ送信者の表示名を生成
  // スタッフの場合は「名前（担当者）」、ゲストの場合は名前のみを表示
  const getSenderName = (message) => {
    const userName = users[message.sender];
    if (isStaff(message.sender)) {
      return userName ? `${userName}（担当者）` : "担当者";
    }
    return userName || guestName;
  };

  // タイムスタンプを日本語表記に変換
  // 今日の場合は「今日 HH:MM」
  // それ以外の場合は「MM/DD HH:MM」の形式で表示
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const today = new Date();

    // 日付が今日かどうかをチェック
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    // 時刻のフォーマット（12時間制）
    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const timeStr = new Intl.DateTimeFormat("ja-JP", timeOptions).format(date);

    // 日付のフォーマット
    if (isToday) {
      return `今日 ${timeStr}`;
    } else {
      const dateOptions = {
        month: "numeric",
        day: "numeric",
      };
      const dateStr = new Intl.DateTimeFormat("ja-JP", dateOptions)
        .format(date)
        .replace("/", "/");
      return `${dateStr} ${timeStr}`;
    }
  };

  // メッセージの表示位置を決定
  // 現在のユーザーとメッセージ送信者が同じタイプ（スタッフorゲスト）の場合は右側に表示
  const getMessageClass = (messageSender) => {
    const currentUserIsStaff = isStaff(auth.currentUser.email);
    const messageIsFromStaff = isStaff(messageSender);

    return currentUserIsStaff === messageIsFromStaff ? "guest" : "staff";
  };

  // チャットUIのレンダリング
  // ヘッダー、メッセージ表示エリア、メッセージ入力エリアの3つのセクションで構成
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-medium text-gray-900">
              {isStaff(auth.currentUser.email)
                ? "スタッフチャット"
                : "カスタマーサポート"}
            </h1>
            <span className="text-sm text-gray-500">
              {guestName}さんとのチャット
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isStaff(auth.currentUser.email) && (
              <button
                onClick={() => navigate(`/guest/${userId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 
                         hover:bg-gray-100 text-gray-600 rounded-md text-sm 
                         transition-colors"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                お問い合わせ詳細
              </button>
            )}
            <Logout />
          </div>
        </div>
      </div>

      {/* メッセージ表示エリア */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-20 pb-24 space-y-4 
                    scrollbar-hide [&::-webkit-scrollbar]:hidden 
                    [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {messages.map((message, index) => (
          <div key={index} className={`msg ${getMessageClass(message.sender)}`}>
            <div className="message-content">
              <span className="email">{getSenderName(message)}</span>
              <p>{message.messageText}</p>
              <span className="timestamp">{formatDate(message.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力エリア */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SendMessage />
        </div>
      </div>
    </div>
  );
}

export default Chatroom;
