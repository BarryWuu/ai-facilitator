# 🧠 **The AI Facilitator**
Engineered for HackMIT China 2026
The AI Facilitator operates as a real-time, deterministic cognitive mediator. Its primary directive? Instantly distilling the chaotic, unpredictable entropy of collaborative brainstorming into rigidly structured, ruthlessly actionable blueprints. Collaboration breeds noise. We silence it.

📖 **Project Background**
During high-stakes hackathons and dense group projects, discussions inevitably devolve into disorganized, circular tangents. While human creativity remains a wildly abundant resource, manually compiling these fragmented epiphanies into a cohesive, executable schematic is an exercise in profound tedium.
Instead of merely injecting generative AI as a passive conversationalist, we architected an active digital referee. Operating as a vigilant "Campus Innovation Mentor," this engine perpetually monitors bi-directional WebSocket streams to untangle the verbal labyrinth of group dynamics. It meticulously evaluates raw dialogue against rubrics of innovation and collaboration, separating actionable gold from conversational static.

✨ **Core Features**
⚡ **Real-Time Chaos Stream**: A low-latency, bi-directional WebSocket matrix where multiple concurrent users can asynchronously inject their perspectives.
🤖 **WAF-Bypassing Consensus Engine**: Driven by a highly customized gpt-5.4 proxy pipeline, the backend is engineered to spoof genuine browser heuristics. This architecture flawlessly evades draconian Web Application Firewalls (WAF) and forced HTML interceptions, coercing informal chat logs into strict, predictable JSON structures.
📱 **Adaptive UI Matrix**: A dual-pane layout featuring a mobile-optimized "Contributor Uplink" that gracefully scales into a panoramic, glassmorphic "Host Dashboard" on desktop environments.
📄 **Instantaneous PDF Synthesis**: One-click, client-side document generation. Equipped with intelligent pagination, it instantly archives the ephemeral data stream into formal, unalterable meeting protocols.
🔐 **Cryptographic Host Controls**: Password-gated facilitator privileges grant the host absolute authority. They can unilaterally trigger algorithmic synthesis or entirely vaporize the room's data history.

🛠 **Tech Stack & Dependencies**
**Frontend**: Next.js, React, Tailwind CSS, Framer Motion (for fluid, kinematic state transitions).
**Backend**: Node.js server orchestrating Socket.io for sub-millisecond data synchronization.
Cognitive/Network Routing: OpenAI Node SDK deeply reconfigured to route through a domestic API aggregator (Shubiaobiao). Features hardcoded header manipulation to bypass regional fetching bottlenecks.
**Utilities**: jsPDF for unyielding client-side document rendering.

🚀 **Installation & Deployment Guide**


1. Clone the repository:
git clone [https://github.com/BarryWuu/ai-facilitator.git](https://github.com/BarryWuu/ai-facilitator.git)
cd ai-facilitator


2. Install dependencies:
npm install


3. Configure the Environment:
Create a .env.local file in the root directory. Ensure your proxy API credentials are strictly mapped to bypass local fetch restrictions:
OPENAI_API_KEY=sk-your-proxy-key-here


4. Ignite the Engine:
npm run dev
**or**
node server.js


The Nexus interface will initialize on http://localhost:3000.
