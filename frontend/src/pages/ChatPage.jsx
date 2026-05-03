import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  useMessageContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { getChatToken } from "../lib/api.js";
import { useAuthUser } from "../hooks/useAuthUser.js";
import { translateText } from "../lib/api.js";
import Sidebar from "../components/Sidebar.jsx";
import { Video, Languages } from "lucide-react";
import toast from "react-hot-toast";

const streamClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

function TranslateButton({ message, authUser }) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    if (translated) { setTranslated(null); return; }
    try {
      setLoading(true);
      const res = await translateText({
        text: message.text,
        sourceLang: "en",
        targetLang: authUser?.nativeLanguage || "en",
      });
      setTranslated(res.data.translatedText);
    } catch {
      toast.error("Translation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!message.text) return null;

  return (
    <div>
      {translated && (
        <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
          {translated}
        </p>
      )}
      <button
        onClick={handleTranslate}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.125rem 0", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
      >
        <Languages size={12} />
        {loading ? "…" : translated ? "Hide" : "Translate"}
      </button>
    </div>
  );
}

function CustomMessage({ authUser }) {
  const { message, isMyMessage } = useMessageContext();
  return (
    <div style={{ marginBottom: "0.5rem", textAlign: isMyMessage() ? "right" : "left" }}>
      <div style={{
        display: "inline-block",
        background: isMyMessage() ? "var(--primary)" : "var(--bg-input)",
        padding: "0.5rem 0.875rem",
        borderRadius: "12px",
        maxWidth: "70%",
        fontSize: "0.875rem",
      }}>
        {message.text}
        {!isMyMessage() && <TranslateButton message={message} authUser={authUser} />}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { id: recipientId } = useParams();
  const { authUser } = useAuthUser();
  const [channel, setChannel] = useState(null);
  const [connected, setConnected] = useState(false);

  const { data: tokenData } = useQuery({
    queryKey: ["chatToken"],
    queryFn: async () => (await getChatToken()).data,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    async function setup() {
      try {
        if (!streamClient.userID) {
          await streamClient.connectUser(
            { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
            tokenData.token
          );
        }
        const channelId = [authUser._id, recipientId].sort().join("-");
        const ch = streamClient.channel("messaging", channelId, {
          members: [authUser._id, recipientId],
        });
        await ch.watch();
        setChannel(ch);
        setConnected(true);
      } catch (err) {
        toast.error("Failed to connect to chat");
        console.error(err);
      }
    }

    setup();
    return () => { streamClient.disconnectUser().catch(() => {}); };
  }, [tokenData, authUser, recipientId]);

  function handleCallClick() {
    if (!channel) return;
    const callUrl = `${window.location.origin}/call/${channel.id}`;
    channel.sendMessage({ text: `Join my video call: ${callUrl}` });
    window.open(callUrl, "_blank");
  }

  if (!connected || !channel) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
          <button className="btn btn-primary btn-sm" onClick={handleCallClick}>
            <Video size={15} />
            Start Video Call
          </button>
        </div>

        <div className="chat-page">
          <Chat client={streamClient} theme="str-chat__theme-dark">
            <Channel channel={channel} Message={(props) => <CustomMessage {...props} authUser={authUser} />}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
            </Channel>
          </Chat>
        </div>
      </main>
    </div>
  );
}
