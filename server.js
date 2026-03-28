// server.js
require("dotenv").config({ path: ".env.local" });
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const OpenAI = require("openai");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1" 
});

const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    
    // 1. 加入房间
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, { perspectives: [], latestConsensus: null });
      socket.emit("init_state", rooms.get(roomId));
    });

    // 2. 提交新观点
    socket.on("submit_perspective", ({ roomId, text, user }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const newPerspective = { id: Date.now(), user, text };
      room.perspectives.push(newPerspective);
      io.to(roomId).emit("new_perspective", newPerspective);
    });

    // 3. 撤回单条消息 (修复版)
    socket.on("delete_perspective", ({ roomId, messageId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.perspectives = room.perspectives.filter(p => p.id !== messageId);
      io.to(roomId).emit("perspectives_updated", room.perspectives);
    });

    // 4. 主持人清空全场
    socket.on("clear_chat", (roomId) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.perspectives = [];
      room.latestConsensus = null;
      io.to(roomId).emit("chat_cleared");
    });

    // 5. 触发 AI 校园创新导师引擎
    socket.on("trigger_consensus", async (roomId) => {
      const room = rooms.get(roomId);
      if (!room || room.perspectives.length === 0) return;
      io.to(roomId).emit("ai_thinking", true);
      
      try {
        const context = room.perspectives.map((p) => `[${p.user}]: ${p.text}`).join("\n");
        
        // 核心修复：使用 json_object 提高代理兼容性，并加入严格的垃圾数据防御指令
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: `You are an expert Campus Innovation Mentor facilitating a Hackathon brainstorming session. 
              Evaluate the chat log based on: 1. Innovation 2. Collaboration.
              
              You MUST respond in STRICT JSON format matching this exact structure:
              {
                "project_vision": "string",
                "innovation_assessment": "string",
                "task_delegation": [{"task": "string", "owner": "string"}],
                "collaboration_gaps": ["string"],
                "mood_color": "string (hex code)"
              }
              
              CRITICAL INSTRUCTION: If the chat log consists of spam, random letters, numbers, or lacks any meaningful project ideas (e.g. "hahaha", "1234"), you MUST output:
              "project_vision": "Insufficient meaningful data to analyze.",
              "innovation_assessment": "Please input actual project ideas relevant to campus or student life.",
              and leave the arrays empty.` 
            },
            { role: "user", content: `Here is the team's transcript:\n${context}` }
          ],
          response_format: { type: "json_object" } 
        });

        const result = JSON.parse(completion.choices[0].message.content);
        console.log(`[Room: ${roomId}] AI 成功生成报告`); 
        room.latestConsensus = result;
        io.to(roomId).emit("consensus_update", result);
      } catch (err) {
        console.error("API 报错:", err);
        io.to(roomId).emit("api_error", { message: err.message });
      } finally {
        io.to(roomId).emit("ai_thinking", false);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Nexus Engine ready on http://${hostname}:${port}`);
  });
});