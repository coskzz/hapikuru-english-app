// ==============================================================
// Firebase 設定ファイル
//
// 【初回設定手順】
// 1. https://console.firebase.google.com/ にアクセス
// 2. 「プロジェクトを追加」→ 名前（例: hapikuru-english）を入力
// 3. 左メニュー「Authentication」→「始める」
//    → 「メール/パスワード」を有効化
// 4. 左メニュー「Firestore Database」→「データベースを作成」
//    → 本番環境モードで作成
//    → ルール（下記）を貼り付けて「公開」
// 5. 左メニュー「プロジェクトの概要」横の⚙歯車
//    →「プロジェクトの設定」→「マイアプリ」
//    → ウェブアプリ（</>）を追加 → firebaseConfig をコピー
// 6. 下の firebaseConfig に貼り付けて保存
//
// 【Firestore セキュリティルール】
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//       allow read: if request.auth != null &&
//         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
//     }
//   }
// }
//
// 【講師アカウントの設定方法】
// 1. 講師用メールアドレスで普通にアプリからサインアップ
// 2. Firebase Console → Firestore → users コレクション
//    → 該当ユーザーの role フィールドを 'teacher' に変更
// ==============================================================

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
