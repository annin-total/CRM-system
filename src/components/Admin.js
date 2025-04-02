// 必要なモジュールのインポート
import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Logout from "./auth/Logout";

// 対応状況の選択肢の定義
const STATUS_OPTIONS = [
  { value: "all", label: "全て" },
  { value: "未対応", label: "未対応" },
  { value: "対応中", label: "対応中" },
  { value: "対応済み", label: "対応済み" },
];

// 製品種別の選択肢を定義
const PRODUCT_TYPES = [
  { value: "all", label: "全て" },
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

// 管理画面のメインコンポーネント
function Admin() {
  // 状態管理の定義
  const [guests, setGuests] = useState([]); // ゲスト一覧
  const [selectedStatus, setSelectedStatus] = useState("未対応"); // 選択された対応状況
  const [selectedProduct, setSelectedProduct] = useState("all"); // 選択された製品種別
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号
  const itemsPerPage = 10; // 1ページあたりの表示件数
  const navigate = useNavigate();

  // ゲスト一覧を取得する関数
  // Firestoreからゲストデータを取得し、選択された対応状況と製品種別でフィルタリングする
  const fetchGuests = useCallback(async () => {
    const usersRef = collection(db, "chatusers");
    let q;

    try {
      // 選択された対応状況と製品種別に基づいてクエリを構築
      if (selectedStatus === "all" && selectedProduct === "all") {
        // (1) 対応状況=全て / 製品種別=全て
        q = query(usersRef, where("position", "==", "guest"));
      } else if (selectedStatus === "all") {
        // (5) 対応状況=全て / 製品種別=A001~A016
        q = query(
          usersRef,
          where("position", "==", "guest"),
          where("productType", "==", selectedProduct)
        );
      } else if (selectedProduct === "all") {
        // (2), (3), (4) 対応状況=未対応/対応中/対応済み / 製品種別=全て
        q = query(
          usersRef,
          where("position", "==", "guest"),
          where("status", "==", selectedStatus)
        );
      } else {
        // (6), (7), (8) 対応状況=未対応/対応中/対応済み / 製品種別=A001~A016
        q = query(
          usersRef,
          where("position", "==", "guest"),
          where("status", "==", selectedStatus),
          where("productType", "==", selectedProduct)
        );
      }

      // クエリを実行してデータを取得し、IDと共にリストに追加
      const querySnapshot = await getDocs(q);
      const guestsList = [];
      querySnapshot.forEach((doc) => {
        guestsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // 取得したデータのソート処理
      if (selectedStatus === "all") {
        // 対応状況が「全て」の場合のソート処理
        // 未対応→対応中→対応済みの順にグループ化し、各グループ内で日付順にソート
        const groupedGuests = {
          未対応: [],
          対応中: [],
          対応済み: [],
        };

        guestsList.forEach((guest) => {
          if (groupedGuests[guest.status]) {
            groupedGuests[guest.status].push(guest);
          }
        });

        // 各グループ内で日付でソート
        Object.keys(groupedGuests).forEach((status) => {
          groupedGuests[status].sort((a, b) => {
            const dateA = a.createdAt?.toDate() || new Date(0);
            const dateB = b.createdAt?.toDate() || new Date(0);
            if (status === "対応済み") {
              return dateB - dateA; // 新しい順
            } else {
              return dateA - dateB; // 古い順
            }
          });
        });

        const sortedGuests = [
          ...groupedGuests["未対応"],
          ...groupedGuests["対応中"],
          ...groupedGuests["対応済み"],
        ];

        setGuests(sortedGuests);
      } else {
        // 特定の対応状況が選択されている場合の日付ソート
        // 対応済みは新しい順、その他は古い順でソート
        guestsList.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          if (selectedStatus === "対応済み") {
            return dateB - dateA; // 新しい順
          } else {
            return dateA - dateB; // 古い順
          }
        });
        setGuests(guestsList);
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      if (error.message.includes("index")) {
        const indexUrl = error.message.match(/https:\/\/.*$/)[0];
        console.log("Create index here:", indexUrl);
      }
    }
  }, [selectedStatus, selectedProduct]);

  // 選択状態が変更されたときにデータを再取得
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // ページネーション用の計算処理
  // 現在のページに表示するデータの範囲を計算
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGuests = guests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(guests.length / itemsPerPage);

  // ページ変更時の処理
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 問い合わせ内容の表示文字数を制限する関数
  // 100文字を超える場合は末尾に...を付加
  const truncateMessage = (message) => {
    if (!message) return "";
    return message.length > 100 ? message.substring(0, 100) + "..." : message;
  };

  // 日時（タイムスタンプ）を日本語形式にフォーマットする関数
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(date)
      .replace(/\//g, "/");
  };

  // UIのレンダリング
  // ヘッダー部分：タイトル、対応状況選択、製品種別選択、ログアウトボタンを表示
  // テーブル部分：ゲスト一覧を表示（対応状況、製品種別、氏名、メール、電話番号、問い合わせ内容、受付日時、担当者）
  // フッター部分：ページネーションを表示
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">ゲスト一覧</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              対応状況で分類：
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md 
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              製品種別で分類：
            </span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md 
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-blue-500"
            >
              {PRODUCT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Logout />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  対応状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  製品種別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  氏名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  電話番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  問い合わせ内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  受付日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden">
                  チャット
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGuests.map((guest) => (
                <tr
                  key={guest.id}
                  onClick={() => navigate(`/guest/${guest.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors h-20"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${
                          guest.status === "未対応"
                            ? "bg-red-100 text-red-800"
                            : guest.status === "対応中"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                    >
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.productType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md ">
                    {truncateMessage(guest.message)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(guest.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.supportStaff || "未定"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/${guest.id}`);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md 
                               hover:bg-blue-600 transition-colors text-sm"
                    >
                      チャットを開く
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`pagination-button ${
              currentPage === number ? "active" : ""
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Admin;
