# 🧠 AI Facilitator
**Built for HackMIT China 2026**

AI Facilitator is a real-time, deterministic cognitive mediator designed to instantly distill the chaotic entropy of student brainstorming into rigorously structured, actionable blueprints. 

## 📖 Project Background
During group projects and hackathons, discussions frequently devolve into disorganized, circular tangents. While human creativity is wildly abundant, manually compiling fragmented ideas into a cohesive, executable plan is incredibly tedious. 

Instead of replacing the human spark with generative AI, we built a digital referee. Our facilitator acts as a "Campus Innovation Mentor," monitoring real-time chat streams to untangle the verbal labyrinth of group work. It separates actionable gold from conversational static, evaluating ideas based strictly on innovation and fair collaboration.

## ✨ Core Features
* **⚡ Real-Time Chaos Stream:** A bi-directional, WebSocket-powered chat interface where multiple users can rapidly inject their perspectives simultaneously.
* **🤖 AI Consensus Engine:** Utilizing GPT-4o with strict JSON-object parsing, the engine evaluates the chat log to extract the *Project Vision*, *Innovation Assessment*, *Task Delegations*, and *Collaboration Gaps*.
* **📱 Responsive Matrix:** A dual-interface architecture featuring a mobile-optimized "Contributor Uplink" (bottom navigation) that gracefully scales up into a sleek, dual-pane desktop "Host Dashboard."
* **📄 Instant PDF Reporting:** One-click client-side PDF generation equipped with smart pagination to export the synthesized consensus into a formal meeting document.
* **🔐 Host Privileges & Moderation:** Password-protected facilitator mode allowing the host to trigger synthesis or wipe the ephemeral data stream entirely.

## 🛠 Tech Stack & Dependencies
* **Frontend:** Next.js, React, Tailwind CSS, Framer Motion (for fluid, glassmorphic UI transitions).
* **Backend:** Node.js, Express.js.
* **Real-Time Communication:** Socket.io.
* **AI & Parsing:** OpenAI SDK (GPT-4o).
* **Utilities:** jsPDF (Client-side PDF generation).

## 🚀 Installation & Running Guide

**1. Clone the repository:**
```bash
git clone [https://github.com/BarryWuu/ai-facilitator.git](https://github.com/BarryWuu/ai-facilitator.git)
cd ai-facilitator
