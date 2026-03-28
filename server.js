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
  apiKey: "sk-o0CaD76uxlGPQ1rFFlHCbMGFVmIokNxlnqrd4EL4DKIn2w8P", 
  baseURL: "https://api.shubiaobiao.com/v1",
  defaultHeaders: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  }
});

const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, { perspectives: [], latestConsensus: null });
      socket.emit("init_state", rooms.get(roomId));
    });

    socket.on("submit_perspective", ({ roomId, text, user }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const newPerspective = { id: Date.now(), user, text };
      room.perspectives.push(newPerspective);
      io.to(roomId).emit("new_perspective", newPerspective);
    });

    socket.on("delete_perspective", ({ roomId, messageId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.perspectives = room.perspectives.filter(p => p.id !== messageId);
      io.to(roomId).emit("perspectives_updated", room.perspectives);
    });

    socket.on("clear_chat", (roomId) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.perspectives = [];
      room.latestConsensus = null;
      io.to(roomId).emit("chat_cleared");
    });

    socket.on("trigger_consensus", async (roomId) => {
      const room = rooms.get(roomId);
      if (!room || room.perspectives.length === 0) return;
      
      io.to(roomId).emit("ai_thinking", true);
      
      try {
        const context = room.perspectives.map((p) => `[${p.user}]: ${p.text}`).join("\n");
        console.log(`> Engaging gpt-5.4 via Shubiaobiao for Room: ${roomId}...`);

        const completion = await openai.chat.completions.create({
          model: "deepseek-v3.2",
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
              
              CRITICAL INSTRUCTION: If the chat log lacks meaningful project ideas, generate logical, extrapolated insights based on their casual chat. Never return error strings. ONLY output the raw JSON object, without any markdown formatting tags like \`\`\`json.` 
            },
            { role: "user", content: `Here is the team's transcript:\n${context}` }
          ]
        });

        if (!completion.choices || !completion.choices[0]) {
            throw new Error("Proxy connection established, but data payload was empty.");
        }

        let rawText = completion.choices[0].message.content;
        
        rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            rawText = rawText.substring(firstBrace, lastBrace + 1);
        }

        const result = JSON.parse(rawText);
        room.latestConsensus = result;
        io.to(roomId).emit("consensus_update", result);
        console.log("> Synthesis achieved. Payload delivered.");
        
      } catch (err) {
        console.error("API Catastrophe:", err);
        io.to(roomId).emit("api_error", { message: `Cognitive Failure: ${err.message}` });
      } finally {
        io.to(roomId).emit("ai_thinking", false);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Nexus Engine (Ultimate Override) online at http://${hostname}:${port}`);
  });
});