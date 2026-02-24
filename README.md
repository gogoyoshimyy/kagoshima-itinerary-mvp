# Kagoshima Itinerary MVP (鹿児島旅行 旅程ビルダー)

Next.js + Supabase + Google Maps Platform を用いた、鹿児島旅行向けの旅程作成および相談導線MVPプロジェクトです。

## 構成技術
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State & DragDrop**: React State, `@dnd-kit/core`
- **Map**: `@react-google-maps/api`
- **Backend / DB**: Supabase, Server Actions

## MVPの要件と実装状況
「地図の代替」ではなく「旅程の無理を可視化し、旅行会社への相談を促す」ことを主眼に置いて構築しました。
UIはカードベースでわかりやすく、区間ごとの計算（Google Routes API連携）や、DBベースのレコメンド機能への導線を実装しています。

## ローカル起動手順

1. **パッケージのインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   `.env.example` をコピーして `.env.local` を作成し、各種APIキーを入力してください。
   ```bash
   cp .env.example .env.local
   ```
   
   必要なキー:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon公開キー
   - `GOOGLE_MAPS_API_KEY`: Server Action上でPlaces/Routes APIを叩くためのキー
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: クライアント（ブラウザ）で地図を描画するためのキー（HTTPリファラー制限推奨）

3. **Supabaseのセットアップ（DB構築）**
   SupabaseのSQLエディタを開き、`supabase/migrations/0000_schema_mvp.sql` の内容を実行してテーブルを作成してください。
   続いて、`supabase/seed.sql` を実行して、鹿児島のサンプルの観光スポットデータを投入してください。

4. **開発用サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで `http://localhost:3000` を開きます。

## 画面構成一覧
- `/` - トップ画面（旅行の条件入力フォーム）
- `/planner` - 旅程ビルダー主画面（タイムライン、地図、レコメンド）
- `/planner/[tripId]/consult` - 相談カルテ画面（フォーム入力と送信）
- `/admin/leads` - 管理画面（お問合せ一覧）
- `/admin/leads/[leadId]` - 管理画面詳細（旅程詳細確認）

## 連携確認と本稼働に向けた拡張ポイント
1. **Google Maps Platform設定**
   - 必要なAPI: `Places API (New)`, `Routes API`, `Maps JavaScript API`
   - GCPコンソールで上記3つを有効化し、API制限（サーバー用はIP、クライアント用はHTTPリファラー）を設定してください。
2. **九州他県への拡張**
   - 現在の `spots` テーブルには `prefecture`（例: Kagoshima）カラムを持たせています。
   - 今後大分や宮崎を追加する場合は、初期の入力フォームでエリア選択を行い、Recommendationで絞り込むだけで対応できます。
3. **認証の追加**
   - 現MVPは匿名ユーザーでの利用を前提としていますが、Supabase Authを用いてMy Page機能を拡張可能です。
   - `trip_plans` テーブルに `user_id` をリンクさせるだけで移行できます。
