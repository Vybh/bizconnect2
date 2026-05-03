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
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorOff } from "lucide-react";
import { getChatToken } from "../lib/api.js";
import { useAuthUser } from "../hooks/useAuthUser.js";
import toast from "react-hot-toast";

function CustomCallControls() {
  const { useMicrophoneState, useCameraState, useCallCallingState } = useCallStateHooks();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamMuted } = useCameraState();
  const callingState = useCallCallingState();

  async function toggleMic() {
    try { await microphone.toggle(); } catch { toast.error("Could not toggle mic"); }
  }

  async function toggleCam() {
    try { await camera.toggle(); } catch { toast.error("Could not toggle camera"); }
  }

  const { useScreenShareState } = useCallStateHooks();
  const { screenShare, isMute: isScreenOff } = useScreenShareState();

  async function toggleScreen() {
    try { await screenShare.toggle(); } catch { toast.error("Could not toggle screen share"); }
  }

  async function leaveCall() {
    try { window.close(); } catch { window.history.back(); }
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "1.5rem",
      padding: "1.5rem",
      background: "rgba(0,0,0,0.85)",
    }}>
      <button onClick={toggleMic} style={{
        width: 56, height: 56, borderRadius: "50%",
        background: isMicMuted ? "#ef4444" : "rgba(255,255,255,0.2)",
        border: "none", cursor: "pointer", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      <button onClick={toggleCam} style={{
        width: 56, height: 56, borderRadius: "50%",
        background: isCamMuted ? "#ef4444" : "rgba(255,255,255,0.2)",
        border: "none", cursor: "pointer", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isCamMuted ? <VideoOff size={22} /> : <Video size={22} />}
      </button>

      <button onClick={toggleScreen} style={{
        width: 56, height: 56, borderRadius: "50%",
        background: !isScreenOff ? "#3b82f6" : "rgba(255,255,255,0.2)",
        border: "none", cursor: "pointer", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!isScreenOff ? <MonitorOff size={22} /> : <MonitorUp size={22} />}
      </button>

      <button onClick={leaveCall} style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "#ef4444",
        border: "none", cursor: "pointer", color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <PhoneOff size={22} />
      </button>
    </div>
  );
}

function ActiveCall() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#000" }}>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>
      <CustomCallControls />
    </div>
  );
}

export default function CallPage() {
  const { id: callId } = useParams();
  const { authUser } = useAuthUser();
  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["chatToken"],
    queryFn: async () => (await getChatToken()).data,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

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

    return () => {
      callInstance.leave().catch(() => {});
      client.disconnectUser().catch(() => {});
    };
  }, [tokenData, authUser, callId]);

  if (!videoClient || !call) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <ActiveCall />
      </StreamCall>
    </StreamVideo>
  );
}
