# えらびより / Raku Atlas / raku-toolv2

楽天Web Serviceの公式APIを横断して、紹介候補を検索・保存するアフィリエイト検証ツールです。

## 対応範囲

- API検索: 楽天市場、楽天トラベル、楽天ブックス、楽天Kobo、楽天GORA
- コンテンツ企画支援: 楽天レシピ（API自体はアフィリエイト非対応）
- サービスカタログ: 楽天公式のアフィリエイト対象サービスをカテゴリ別に表示
- 編集支援: 候補保存、広告表記・確認事項付き投稿メモ
- UGC: Supabase接続時のレビュー投稿、審査待ち保存、公開済みレビュー一覧
- SEO/AIO/LLMO: JSON-LD、canonical、OG、robots、sitemap、llms.txt、一次情報へのcitation

「楽天アフィリエイト対象」と「楽天Web Serviceでアフィリエイト対応APIが提供されている」は同じではありません。公開APIがないサービスを取得済みとは表現せず、公式リンク作成画面へ案内します。

## 認証情報

楽天Web Serviceで発行されたApplication ID、Access Key、Affiliate IDをXサーバーの公開ディレクトリ外に保存します。ブラウザは同一ドメインの`/api/rakuten.php`だけを呼び、Access Keyを受け取りません。配置方法は`server/README.md`を参照してください。

## コマンド

```bash
npm ci
npm run lint
npm test
npm run build
```

## UGCバックエンド

`supabase/schema.sql`を実行し、次をビルド環境に設定します。匿名投稿は必ず`pending`となり、RLSで`published`だけを公開取得します。

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

大量アクセスに備えるには、CAPTCHA、IP/ユーザー単位のレート制限、管理者モデレーション画面、通報・削除窓口、CDNキャッシュが追加で必要です。現時点ではこれらを実装済みとは扱いません。

本番ドメインは `https://erabiyori.jp/` です。GitHub Pagesでは `public/CNAME` を利用します。

## 公式資料

- API一覧: https://webservice.rakuten.co.jp/documentation
- アフィリエイト対象サービス: https://affiliate.rakuten.co.jp/group/
- ガイドライン: https://affiliate.rakuten.co.jp/guideline/rule/

成果、売上、報酬の増加は保証しません。料率・対象条件・API仕様は変更されるため、公開前に公式資料を確認してください。
