# Latlas – Teacher Dashboard (Phase 1)

教育支援プラットフォーム「Latlas」の教員用ダッシュボードです。

## 技術スタック

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Database / Auth**: Supabase (PostgreSQL)
- **i18n**: next-intl（日本語・英語）
- **Icons**: Lucide React

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、Supabase の値を設定してください。

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクト URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon (publishable) key

### 3. データベース

Supabase ダッシュボードの SQL Editor で `supabase/schema.sql` を実行し、`profiles` と `classes` テーブルおよび RLS を作成してください。

**ダッシュボードのテーマ等を端末間で同期する場合**（任意）: 次を SQL Editor で 1 回実行します（`profiles` に JSON カラムを追加します）。

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dashboard_ui_settings JSONB;
```

または `supabase/migrations/20250318000000_dashboard_ui_settings.sql` と同じ内容です。未適用でもアプリは動作しますが、カスタマイズ設定のクラウド保存は行われません。

### 4. 開発サーバー

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、言語に応じて `/ja` または `/en` にリダイレクトされます。

## 主な機能（Phase 1）

- **認証**: ログイン / サインアップ（Supabase Auth）
- **ダッシュボード**: サイドバー + メインの 2 ペイン構成（NavigationSplitView 風）
- **クラス管理**: クラス新規作成（6 桁アクセスコード・パスワード自動生成）、カード一覧
- **モニタリング**: 生徒アクティビティ用グリッドのスケルトン
- **設定・プロフィール**: プレースホルダ
- **i18n**: 日本語 / 英語、言語切替リンク（サイドバー）

## プロジェクト構成

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx, page.tsx
│   │   ├── login/, signup/
│   │   └── dashboard/
│   │       ├── layout.tsx, page.tsx
│   │       ├── monitoring/, settings/
│   └── actions/          # Server Actions (auth, classes)
├── components/
│   ├── auth/             # LoginForm, SignupForm
│   └── dashboard/        # Sidebar, ClassCard, CreateClassForm
├── i18n/                 # routing, request, navigation
├── lib/
│   ├── supabase/        # client, server
│   └── utils.ts         # accessCode, password hash
├── messages/            # ja.json, en.json
├── types/               # database.ts
└── middleware.ts        # next-intl + Supabase session
```

## ビルド

```bash
npm run build
npm start
```
