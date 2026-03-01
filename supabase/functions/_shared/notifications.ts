export type PushMessage = {
  to: string;
  sound?: 'default';
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export async function sendExpoPush(messages: PushMessage[]) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`expo push failed: ${res.status} ${text}`);
  }

  return await res.json();
}

export async function sendExpoPushBatches(
  messages: PushMessage[],
  batchSize = 100,
) {
  const receipts: unknown[] = [];
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const receipt = await sendExpoPush(batch);
    receipts.push(receipt);
  }
  return receipts;
}
