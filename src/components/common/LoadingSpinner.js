import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500" />
        <p className="text-gray-500 text-sm font-medium">読み込み中...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 