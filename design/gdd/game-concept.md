# Game Concept: Pixel Agent Town

*Created: 2026-05-27*
*Status: Approved*

---

## Elevator Pitch

> It's a cozy pixel-art life sim where you inhabit a town of AI agents — each with a real LLM brain — who autonomously live, work, converse, and form relationships. You observe their emergent behavior, chat with them, assign tasks, and explore a world that mirrors your actual AI infrastructure.

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | Life Simulation + AI Sandbox |
| **Platform** | Web (GitHub Pages) + Desktop (Tauri) |
| **Target Audience** | AI enthusiasts, developers, indie game fans who enjoy emergent systems |
| **Player Count** | Single-player |
| **Session Length** | 15-60 minutes |
| **Monetization** | Open source / Portfolio piece |
| **Estimated Scope** | Medium (3-4 months, solo with AI assistance) |
| **Comparable Titles** | Stardew Valley (cozy pixel town), Dwarf Fortress (emergent AI), a]i16z AI Town (LLM agents) |

---

## Core Fantasy

You own a living pixel world where intelligent beings go about their lives. They think, they talk, they have opinions and relationships. You can watch them from above like a benevolent god, walk among them as a player character, or step in as their director to assign missions. The town is not scripted — every conversation, every decision, every relationship emerges from real AI reasoning. And beneath the cozy surface, this town is a living interface to your actual AI system — the buildings are your tools, the residents are your agents, the library holds your real memories.

---

## Unique Hook

Like Stardew Valley's cozy pixel town life, AND ALSO every single resident has a real LLM brain connected to your actual AI infrastructure — their conversations are generated, their decisions are reasoned, and the town reflects real system state.

---

## Player Experience Analysis (MDA Framework)

| Aesthetic | Priority | How We Deliver It |
| ---- | ---- | ---- |
| **Sensation** (sensory pleasure) | 3 | Pixel art beauty, ambient sounds, smooth animations |
| **Fantasy** (make-believe) | 1 | You inhabit a world of intelligent beings you created |
| **Narrative** (drama) | 4 | Emergent stories from agent relationships and conflicts |
| **Challenge** (obstacle course) | N/A | Not a challenge game |
| **Fellowship** (social) | 5 | Parasocial bonds with AI residents |
| **Discovery** (uncharted territory) | 2 | Finding emergent behaviors, new agent interactions |
| **Expression** (self-discovery) | 6 | Customizing town, choosing which tasks to assign |
| **Submission** (pastime) | 3 | Relaxing observation, zen-like watching |

---

## Game Pillars

### 1. Living Intelligence
Every agent has a real AI brain. No scripted dialogue, no predetermined paths. If choosing between "preset behavior" and "LLM-generated behavior", always choose the latter.
- **Design Test**: "Did the agent decide this itself?" → If not, redesign.

### 2. Cozy Observation
The core experience is comfortable discovery, not stress. No time pressure, no fail states, no urgency.
- **Design Test**: "Can the player leave for 5 minutes and miss nothing critical?" → Must be yes.

### 3. Real Connection
The town connects to real AI infrastructure. Buildings map to real tools, agents map to real roles, data is real.
- **Design Test**: "Does this information exist in the real system?" → Prefer real data over mock.

### 4. Lightweight Performance
Low CPU, low memory, low API cost. Idle state must be nearly silent.
- **Design Test**: "Is idle CPU <5%?" → Must be yes.

### Anti-Pillars
- **NOT a management sim** — No micromanaging agent schedules
- **NOT competitive** — No win/lose, no leaderboards, no time pressure
- **NOT content-heavy** — No hand-written storylines; emergent only
- **NOT a dashboard** — Must feel like a game, not a monitoring tool

---

## Core Loop

### 30-Second Loop (Moment-to-Moment)
- Walk around the pixel town as player character
- See agents doing things (working, chatting, resting, walking)
- Click agent → open dialogue / view status
- Click building → enter zone, see zone-specific activities
- Observe speech bubbles from agent-to-agent conversations

### 5-Minute Loop (Short-Term Goals)
- Watch an agent complete a small task
- Assign a new task to an agent, observe collaboration
- Discover a new relationship or conflict between agents
- Explore a zone and trigger an event

### Session Loop (30-60 Minutes)
- One full day/night cycle in the town
- Complete 2-3 task assignments and observations
- See relationship changes
- Unlock a new zone or capability

### Progression Loop (Days/Weeks)
- Agent skills grow (more tasks completed = more capable)
- Town expands (new buildings, new zones unlock)
- Relationship network deepens (friendships, rivalries, mentorships)
- Knowledge base grows (connected to real agentmemory)

---

## Agent Residents

| Agent | Role | Personality | Zone |
| ---- | ---- | ---- | ---- |
| Opus 总舵主 | Chief Architect | Deep, rigorous, philosophical | Town Hall |
| 像素猫 PixelCat | Full-Stack Executor | Calm, patient, methodical | Workshop |
| Codex 协调官 | Coordinator | Agile, decisive, parallel-minded | Command Center |
| Sonnet 审查员 | Code Reviewer | Careful, friendly, helpful | Library |
| Haiku 闪电侠 | Speed Runner | Minimal, efficient, no-waste | Sprint Track |
| 鲸鱼 DeepSeek | Bulk Worker | Gentle, steady, hardworking | Factory |
| ARIS 科研框架 | Research Framework | Systematic, process-strict | Knowledge Tower |
| 主角 (Player) | Protagonist | Player-controlled | Central Plaza |

---

## Zones

| Zone | Function | Activities |
| ---- | ---- | ---- |
| Central Plaza | Hub, social gathering | Agent meetups, announcements, events |
| Town Hall | Architecture & decisions | Opus makes big decisions here |
| Workshop | Code & building | PixelCat and others write code |
| Command Center | Task coordination | Codex assigns and tracks tasks |
| Library | Knowledge & review | Sonnet reviews, knowledge browsing |
| Sprint Track | Fast execution | Haiku does quick tasks |
| Factory | Bulk processing | DeepSeek handles batch work |
| Knowledge Tower | Research | ARIS runs research workflows |
| Dream Garden | Rest & creativity | Agents relax, have creative thoughts |

---

## Technical Architecture (High-Level)

```
┌─────────────────────────────────────────┐
│  Frontend (Phaser 3 + React + Vite)     │
│  - Pixel rendering, sprites, camera     │
│  - UI overlays (dialogue, HUD, panels)  │
│  - WebSocket client                     │
└──────────────────┬──────────────────────┘
                   │ WebSocket + REST
                   ▼
┌─────────────────────────────────────────┐
│  Backend (FastAPI + Python)             │
│  - Tick-based simulation engine         │
│  - Agent AI decision engine (LLM)      │
│  - Dialogue generation                  │
│  - Task management                      │
│  - Real data adapters                   │
└──────────────────┬──────────────────────┘
                   │ API calls (batched)
                   ▼
┌─────────────────────────────────────────┐
│  LLM Layer (DeepSeek / Haiku)           │
│  - Agent decisions (every 10-30s tick)  │
│  - Dialogue generation (on interaction) │
│  - Relationship updates (per session)   │
└─────────────────────────────────────────┘
```

---

## Scope Tiers

| Tier | Timeline | Content |
| ---- | ---- | ---- |
| **MVP** | 4 weeks | 3 agents, 1 zone, dialogue, basic AI decisions, movement |
| **Alpha** | 8 weeks | 8 agents, 4 zones, task system, relationships, real data |
| **Beta** | 12 weeks | 9+ zones, all agents, events, Tauri packaging, GitHub Pages |
| **Full Vision** | 16 weeks | Town expansion, player customization, plugin system |

---

## Risks

| Risk | Severity | Mitigation |
| ---- | ---- | ---- |
| LLM latency causes "frozen" agents | High | Pre-compute decisions, async queues, activity animations during wait |
| API cost accumulates | Medium | Use cheapest model (DeepSeek ¥0.001/1K), batch calls, cache responses |
| Emergent behavior is boring/repetitive | Medium | Good prompt engineering, memory system, relationship dynamics |
| Phaser 3 performance with many sprites | Low | Object pooling, culling off-screen, limit active agents |

---

## Visual Identity Anchor

**Direction: "Anime Storybook Town"**

NOT pixel art. This is a hand-drawn anime illustration style with the quality of a professional artbook.

**Reference**: Soft watercolor + fine lineart, chibi characters, isometric bird's-eye town map, European fantasy architecture with tech accents. Think: Atelier series concept art meets Studio Ghibli background art meets hand-drawn journal illustration.

**Style Rules**:
- Fine brown/dark-gray lineart (NOT black, NOT pixel)
- Soft watercolor palette: cream base, muted blues, greens, pinks, warm browns
- Chibi character proportions (2.5-3 head ratio)
- Isometric bird's-eye perspective for town map
- Each building has a unique thematic silhouette (gears=Workshop, books=Library, crystals=Knowledge Tower)
- Dreamy atmosphere: sparkles, butterflies, soft clouds, floating particles
- UI labels: hand-lettered wooden signboard style
- NO harsh colors, NO neon, NO flat vector style

**Color Philosophy**:
- Base: Warm cream/parchment (#f5f0e8)
- Primary: Soft blue (#7ba7c9), Sage green (#8fb89a)
- Accent: Rose pink (#d4a0a0), Crystal cyan (#a8d8e8)
- Architecture: Warm brown (#8b6b4a), Stone gray (#9a9a8a)
- Lineart: Dark brown (#4a3a2a), NOT pure black

**Character Design**:
- Chibi anime style, large expressive eyes
- Each agent has a unique outfit, hair color, and accessory reflecting their role
- Opus: Long silver hair, staff with crystal, scholarly robes
- PixelCat: Cat ears, blue hoodie, tablet device
- Codex: Short dark hair, military-style coat, clipboard
- Sonnet: Gentle face, glasses, cardigan with book
- Haiku: Spiky hair, lightning bolt accessory, running pose
- DeepSeek: Round whale-themed hat, overalls, toolbox
- ARIS: Lab coat, floating holographic screens

**Art Pipeline**: GPT Image 2 with detailed style-consistent prompts. Each asset gets a prompt that includes the full style specification above.

---

## Player Profile

- **Primary**: Explorer/Discoverer — loves watching emergent systems, finding new interactions
- **Secondary**: Creator — enjoys directing agents, shaping the town's story
- **NOT for**: Competitive players, those needing clear win conditions, impatient players

---

## Next Steps

1. `/setup-engine` — Configure Phaser 3 + Tauri technical preferences
2. `/art-bible` — Formalize visual identity from the anchor above
3. `/map-systems` — Decompose into individual systems (AI, dialogue, task, rendering, etc.)
4. `/design-system` — Author per-system GDDs
5. `/create-architecture` — Master architecture blueprint
6. `/create-epics` — Map systems to epics
7. `/sprint-plan` — Plan first sprint (MVP tier)
