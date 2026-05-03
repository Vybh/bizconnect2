import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorOff } from "lucide-react";
import { getChatToken, translateText } from "../lib/api.js";
import { useAuthUser } from "../hooks/useAuthUser.js";
import toast from "react-hot-toast";

const streamChatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

function CustomCallControls() {
  const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamMuted } = useCameraState();
  const { screenShare, isMute: isScreenOff } = useScreenShareState();

  async function toggleMic() {
    try { await microphone.toggle(); } catch { toast.error("Could not toggle mic"); }
  }
  async function toggleCam() {
    try { await camera.toggle(); } catch { toast.error("Could not toggle camera"); }
  }
  async function toggleScreen() {
    try { await screenShare.toggle(); } catch { toast.error("Could not toggle screen share"); }
  }
  async function leaveCall() {
    try { window.close(); } catch { window.history.back(); }
  }

  const btnStyle = (bg) => ({
    width: 48, height: 48, borderRadius: "50%",
    background: bg, border: "none", cursor: "pointer", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      gap: "1rem", padding: "1rem", background: "rgba(0,0,0,0.85)",
    }}>
      <button onClick={toggleMic} style={btnStyle(isMicMuted ? "#ef4444" : "rgba(255,255,255,0.2)")}>
        {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      <button onClick={toggleCam} style={btnStyle(isCamMuted ? "#ef4444" : "rgba(255,255,255,0.2)")}>
        {isCamMuted ? <VideoOff size={20} /> : <Video size={20} />}
      </button>
      <button onClick={toggleScreen} style={btnStyle(!isScreenOff ? "#3b82f6" : "rgba(255,255,255,0.2)")}>
        {!isScreenOff ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
      </button>
      <button onClick={leaveCall} style={btnStyle("#ef4444")}>
        <PhoneOff size={20} />
      </button>
    </div>
  );
}

function AutoTranslatedMessage({ message, authUser }) {
  const [translated, setTranslated] = useState(null);

  useEffect(() => {
    if (!message?.text) return;
    const targetLang = authUser?.nativeLanguage || "en";
    const sourceLang = message.user?.nativeLanguage || "en";
    if (sourceLang === targetLang) return;
    async function autoTranslate() {
      try {
        const res = await translateText({ text: message.text, sourceLang, targetLang });
        setTranslated(res.data.translatedText);
      } catch {}
    }
    autoTranslate();
  }, [message.text, authUser?.nativeLanguage, message.user?.nativeLanguage]);

  if (!message?.text) return null;

  return (
    <div style={{ padding: "0.5rem 1rem" }}>
      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem" }}>
        {message.user?.name}
      </div>
      <div style={{
        background: "rgba(255,255,255,0.1)", borderRadius: 8,
        padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "white"
      }}>
        {message.text}
        {translated && (
          <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
            {translated}
          </p>
        )}
      </div>
    </div>
  );
}

function ActiveCall({ channel, authUser }) {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#000" }}>
      {/* Video section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>
        <CustomCallControls />
      </div>

      {/* Chat sidebar */}
      {channel && (
        <div style={{
          width: 320, background: "#1a1a2e", display: "flex",
          flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{
            padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)",
            color: "white", fontWeight: 600, fontSize: "0.9rem",
          }}>
            💬 In-Call Chat
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Chat client={streamChatClient} theme="str-chat__theme-dark">
              <Channel channel={channel}>
                <Window>
                  <MessageList Message={(props) => <AutoTranslatedMessage {...props} authUser={authUser} />} />
                  <MessageInput />
                </Window>
              </Channel>
            </Chat>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CallPage() {
  const { id: callId } = useParams();
  const { authUser } = useAuthUser();
  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);
  const [channel, setChannel] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["chatToken"],
    queryFn: async () => (await getChatToken()).data,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    // Setup video
    const client = new StreamVideoClient({
      apiKey: import.meta.env.VITE_STREAM_API_KEY,
      user: { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
      token: tokenData.token,
    });
    const callInstance = client.call("default", callId);
    callInstance.join({ create: true }).catch((err) => {
      toast.error("Failed to join call");
      console.error(err);
    });
    setVideoClient(client);
    setCall(callInstance);

    // Setup chat — reuse the same channel as the chat page
    async function setupChat() {
      try {
        if (!streamChatClient.userID) {
          await streamChatClient.connectUser(
            { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
            tokenData.token
          );
        }
        // callId is "userId1-userId2", reuse it as channel id
        const ch = streamChatClient.channel("messaging", callId);
        await ch.watch();
        setChannel(ch);
      } catch (err) {
        console.error("Chat setup failed:", err);
      }
    }
    setupChat();

    return () => {
      callInstance.leave().catch(() => {});
      client.disconnectUser().catch(() => {});
      streamChatClient.disconnectUser().catch(() => {});
    };
  }, [tokenData, authUser, callId]);

  if (!videoClient || !call) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <ActiveCall channel={channel} authUser={authUser} />
      </StreamCall>
    </StreamVideo>
  );
}
