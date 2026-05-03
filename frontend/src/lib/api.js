import axiosInstance from "./axios.js";

export const signup = (data) => axiosInstance.post("/api/auth/signup", data);
export const login = (data) => axiosInstance.post("/api/auth/login", data);
export const logout = () => axiosInstance.post("/api/auth/logout");
export const getAuthUser = () => axiosInstance.get("/api/auth/me");
export const onboard = (data) => axiosInstance.post("/api/auth/onboarding", data);

export const getRecommendedUsers = () => axiosInstance.get("/api/users");
export const getAllUsers = () => axiosInstance.get("/api/users/all");
export const getFriends = () => axiosInstance.get("/api/users/friends");
export const sendFriendRequest = (id) => axiosInstance.post(`/api/users/friend-request/${id}`);
export const acceptFriendRequest = (id) => axiosInstance.put(`/api/users/friend-request/${id}/accept`);
export const getFriendRequests = () => axiosInstance.get("/api/users/friend-requests");
export const getOutgoingRequests = () => axiosInstance.get("/api/users/outgoing-friend-requests");

export const getChatToken = () => axiosInstance.get("/api/chat/token");

export const translateText = (data) => axiosInstance.post("/api/translate", data);
