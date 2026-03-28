import { useEffect, useState } from "react";
import io from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 强制使用当前 host，不写死端口，避免跨域识别问题
    const socketInstance = io({
      path: "/socket.io",
      transports: ["websocket"], // 强制使用 websocket，跳过轮询
      reconnection: true,
      reconnectionAttempts: 10
    });

    socketInstance.on("connect", () => {
      console.log("🟢 成功连接到控制塔 ID:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 连接错误细节:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  return socket;
};