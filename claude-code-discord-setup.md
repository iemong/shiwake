# Claude Code Discord通知設定ガイド

このガイドでは、Claude CodeのhookとDenoを使用して、Discord通知を実装する方法を説明します。

## 必要なファイル

- `discord-notification.ts` - Denoで作成されたDiscord通知スクリプト
- `claude-code-hook-config.json` - Claude Code hook設定の例

## セットアップ手順

### 1. Discord Webhook URLの取得

1. Discordサーバーの設定を開く
2. 「連携サービス」→「ウェブフック作成」を選択
3. BOTの名前、アイコン、対象チャンネルを設定
4. 「ウェブフックURLをコピー」でURLを取得

### 2. 環境変数の設定

Discord Webhook URLとプロジェクト名を環境変数に設定します：

```bash
# ~/.bashrc または ~/.zshrc に追加
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
export PROJECT_NAME="shiwake"
```

または、プロジェクトディレクトリに`.env`ファイルを作成：

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
PROJECT_NAME=shiwake
```

### 3. Claude Code hook設定

Claude Codeの設定にNotification hookを追加します：

#### 方法1: 直接設定ファイルを編集

Claude Codeの設定ファイル（通常は`~/.claude/settings.json`）に以下を追加：

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "deno run --allow-net --allow-env --env-file ./discord-notification.ts"
          }
        ]
      }
    ]
  }
}
```

#### 方法2: Claude Code UIから設定

1. Claude Codeで`/hooks`コマンドを実行
2. 「Notification」イベントを選択
3. commandフィールドに以下を入力：

```bash
deno run --allow-net --allow-env --env-file ./discord-notification.ts
```

## 使用方法

### Claude Code notification hookから自動実行

Claude Codeが通知を送信すると、自動的にDiscordに通知が送信されます。
`message`と`title`の内容がそのままDiscordに転送されます。

### 手動実行

```bash
deno run --allow-net --allow-env --env-file ./discord-notification.ts "タイトル" "メッセージ"
```

例：
```bash
deno run --allow-net --allow-env --env-file ./discord-notification.ts "テスト通知" "手動テストです"
```

## トラブルシューティング

### 環境変数が見つからない

```bash
echo $DISCORD_WEBHOOK_URL
```

で環境変数が設定されているか確認してください。

### Denoの権限エラー

スクリプトには`--allow-net`と`--allow-env`フラグが必要です。

### Discord APIエラー

- Webhook URLが正しいか確認
- Discord側の権限設定を確認
- レート制限に引っかかっていないか確認

## セキュリティ上の注意

- Webhook URLは秘密情報として扱い、公開リポジトリにコミットしないでください
- `.env`ファイルを`.gitignore`に追加することを推奨します
- 必要最小限の権限でDenoスクリプトを実行してください

## カスタマイズ

`discord-notification.ts`を編集することで、通知の内容やフォーマットをカスタマイズできます。

- メッセージの色変更
- 追加フィールドの設定
- 通知タイプの追加
- エラーハンドリングの改善