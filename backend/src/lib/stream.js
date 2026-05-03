import { StreamChat } from "stream-chat";

let client;

function getStreamClient() {
  if (!client) {
    client = new StreamChat(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
  }
  return client;
}

export async function upsertStreamUser(userData) {
  const streamClient = getStreamClient();
  await streamClient.upsertUser(userData);
}

export function generateStreamToken(userId) {
  const streamClient = getStreamClient();
  return streamClient.createToken(userId);
}
