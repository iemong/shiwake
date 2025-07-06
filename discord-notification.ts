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

  // 標準入力からJSONを読み取る（notification hookから呼び出された場合）
  const decoder = new TextDecoder();
  console.debug("標準入力からのデータを読み取ります...", Deno.stdin);
  const stdinData = await readAll(Deno.stdin);
  const stdinText = decoder.decode(stdinData);

  if (stdinText.trim()) {
    try {
      const notificationData = JSON.parse(stdinText);
      const title = notificationData.title || "Claude Code通知";
      const message = notificationData.message || "通知です";
      await sendDiscordNotification(webhookUrl, title, message);
      return;
    } catch (error) {
      console.error("JSON解析エラー:", error);
      // JSONの解析に失敗した場合は手動実行として処理
    }
  }

  // 手動実行の場合
  const args = Deno.args;
  if (args.length < 2) {
    console.error("使用方法: discord-notification.ts [タイトル] [メッセージ]");
    Deno.exit(1);
  }

  await sendDiscordNotification(webhookUrl, args[0], args[1]);
}

async function readAll(reader: Deno.Reader): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const buffer = new Uint8Array(1024);
  
  while (true) {
    const n = await reader.read(buffer);
    if (n === null) break;
    chunks.push(buffer.slice(0, n));
  }
  
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error("通知の送信に失敗しました:", error);
    Deno.exit(1);
  }
}