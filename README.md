# Fenice (フェニーチェ)

Slackで今は亡きかの鳥のような輝きをもう一度。SlackクライアントChrome拡張。

![](./public/icon/384.png)

## 🐦 特徴

Feniceは作業に集中しつつもSlackを使いこなしたいと思っている方向けのツールです。

特に**Slackを開くと集中できないが**

- 自分に関係がありすぐ確認した方がいいメッセージは確認したい
- 作業の記録やメモをtimesなどに投稿したい

という方向けです。

> [!Warning]
> FeniceはSlackのイベントやメッセージをリアルタイムで受信しているわけではありません。リアルタイム性が求められるコミュニケーションには公式のSlackクライアントをご利用ください。

### 主な機能

- 基本機能
  - メッセージの投稿
    - 画像・動画の添付可
    - メンションや絵文字のオートコンプリート可
  - メッセージの表示
  - メッセージへの返信
  - メッセージへのクリックプリセットリアクション
    - 予め投稿した絵文字リアクションのみをワンクリックで可能
  - メッセージ検索機能
  - メッセージをブラウザやSlackアプリで開く
  - メッセージのコピー
  - メッセージリンクのコピー
  - メッセージのJSON確認
    - APIから返却される値 (開発者向け)
- 目玉機能
  - クエリで定義した重要なメッセージがあったときのみデスクトップへ通知
    - 1分ごとに`search.messages` APIで検索
  - メッセージ投稿欄のVim対応
    - codemirror-vimで可能なことはできる
- Fenice独自機能
  - 投稿前プレビュー機能
    - WYSIWYGは非対応
  - 誤メンション防止機能
    - メンションされたユーザーの顔写真を表示し気づきやすくする
  - メッセージ検索結果をタブで複数保持
  - タスクのようなメッセージ既読管理
- その他
  - 認証はOAuth2
    - アクセストークン有効期限は12時間

## 🤖 開発者向け

### 利用技術

- [WXT]
- [Vue3]
- [Bun]
- [TypeScript]

### 推奨開発環境

- [Neovim]

### 開発環境構築

#### hooks設定

```bash
git config core.hooksPath hooks
```

#### 依存関係のインストール

```console
bun i
```

#### ローカル起動

```console
bun dev
```

### リリースビルド

```console
npm version 1.2.3
git push --tags
git push
bun zip
```

zipが成果物。

TODO: ストアへの登録など (形になってきたら)

---

[WXT]: https://github.com/wxt-dev/wxt
[Vue3]: https://v3.vuejs.org/
[Bun]: https://bun.sh/
[TypeScript]: https://www.typescriptlang.org/
[Neovim]: https://neovim.io/

