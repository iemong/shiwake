#!/usr/bin/env -S deno run --allow-net --allow-env --env-file ./discord-notification-hook.env

/**
 * Claude Code Discord Notification Hook
 * Claude Codeのnotification hookから渡されるmessageとtitleをDiscordに送信
 */

interface DiscordWebhookMessage {
  username: string;
  embeds: {
    title: string;
    description: string;
    color: number;
    timestamp: string;
  }[];
}

async function sendDiscordNotification(webhookUrl: string, title: string, message: string): Promise<void> {
  const projectName = Deno.env.get("PROJECT_NAME");
  const formattedTitle = projectName ? `[${projectName}] ${title}` : title;

  const payload: DiscordWebhookMessage = {
    username: "Claude Code",
    embeds: [{
      title: formattedTitle,
      description: message,
      color: 0x00ff00,
      timestamp: new Date().toISOString(),
    }],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
  }

  console.log("Discord通知を送信しました");
}

async function main() {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) {
    console.error("エラー: DISCORD_WEBHOOK_URL環境変数が設定されていません");
    Deno.exit(1);
  }

  // コマンドライン引数を確認
  const args = Deno.args;
  
  // 引数が指定されている場合は、それを使用
  if (args.length >= 2) {
    await sendDiscordNotification(webhookUrl, args[0], args[1]);
    return;
  }

  // 標準入力からJSONを読み取る（notification hookから呼び出された場合）
  console.debug("標準入力からのデータを読み取ります...", Deno.stdin);
  const stdinText = await new Response(Deno.stdin.readable).text();

  if (stdinText.trim()) {
    try {
      const notificationData = JSON.parse(stdinText);
      const title = notificationData.title || "Claude Code通知";
      const message = notificationData.message || "通知です";
      await sendDiscordNotification(webhookUrl, title, message);
      return;
    } catch (error) {
      console.error("JSON解析エラー:", error);
      // JSONの解析に失敗した場合はデフォルトメッセージを使用
    }
  }

  // stop hookやstdinにデータがない場合のデフォルトメッセージ
  const defaultTitle = "実装完了";
  const defaultMessage = "Claude Codeによる実装が完了しました。";
  await sendDiscordNotification(webhookUrl, defaultTitle, defaultMessage);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error("通知の送信に失敗しました:", error);
    Deno.exit(1);
  }
}