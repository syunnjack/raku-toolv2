# Xサーバー配置

## 1. 公開ファイル

`npm run build`後、`dist/`の中身を `erabiyori.jp` のドキュメントルートへアップロードします。`public/api/rakuten.php` はビルド時に `dist/api/rakuten.php` へコピーされます。

## 2. 秘密設定

公開ディレクトリの外へ次を配置します。

```text
/home/サーバーID/erabiyori-secure/rakuten-config.php
```

`server/rakuten-config.php.example`をコピーし、楽天Web ServiceのApplication ID、Access Key、Affiliate IDを記入します。このファイルはGitへ追加しません。

PHPの`HOME`が期待した値でない場合は、Xサーバーの環境設定で`RAKU_CONFIG_PATH`へ絶対パスを指定するか、`public/api/rakuten.php`の設定パスを実環境に合わせて変更します。

## 3. 動作確認

```bash
curl 'https://erabiyori.jp/api/rakuten.php?service=ichiba&q=%E9%98%B2%E7%81%BD'
```

未設定なら `{"error":"server_not_configured"}`、成功すれば楽天APIのJSONが返ります。レスポンスやログへAccess Keyを出力しないでください。

## 4. UGC

UGCはSupabaseを使用します。Xサーバーだけに統一する場合は、別途MySQL/PHP版の認証、投稿、モデレーションAPIへの置換が必要です。
