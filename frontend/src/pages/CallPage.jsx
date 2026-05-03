import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { getChatToken } from "../lib/api.js";
import { useAuthUser } from "../hooks/useAuthUser.js";
import toast from "react-hot-toast";

function ActiveCall() {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
      <div style={{ textAlign: "center", padding: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
        State: {callingState}
      </div>
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
    <div className="call-page">
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <ActiveCall />
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
