# Architecture Blueprint: Pixel Agent Town v2

*Created: 2026-05-27*
*Status: Approved*

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/Tauri)                     │
├─────────────────────────────────────────────────────────────────┤
│  Phaser 3 Game Engine          │  React UI Layer                 │
│  - TileMap renderer            │  - DialoguePanel                │
│  - Sprite system (agents)      │  - TaskPanel                    │
│  - Camera + input              │  - HUD (stats, time, zone)      │
│  - Animation state machine     │  - InspectorPanel               │
│  - Particle effects            │  - SettingsPanel                 │
├────────────────────────────────┴─────────────────────────────────┤
│  Zustand Store (shared state: agents, events, dialogue, tasks)   │
│  WebSocket Client (real-time sync)                                │
│  REST Client (on-demand queries)                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ WS + REST (localhost:8000)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│  Simulation Engine             │  API Layer                      │
│  - TickLoop (10s interval)     │  - REST endpoints               │
│  - AgentScheduler              │  - WebSocket broadcast           │
│  - ZoneManager                 │  - Player commands               │
│  - EventBus                    │                                  │
├────────────────────────────────┼─────────────────────────────────┤
│  Agent AI Engine               │  Data Layer                     │
│  - DecisionEngine (LLM)       │  - SQLite (events, state)       │
│  - DialogueGenerator (LLM)    │  - AgentMemory adapter          │
│  - MemoryManager (per-agent)  │  - Skills adapter               │
│  - RelationshipGraph          │  - Knowledge adapter             │
│  - TaskExecutor               │                                  │
├────────────────────────────────┴─────────────────────────────────┤
│  LLM Gateway (batched, cached, async)                            │
│  - Primary: DeepSeek V4 (cheapest, ¥0.001/1K tokens)            │
│  - Fallback: Haiku 4.5 (fast, slightly more expensive)           │
│  - Cache: LRU response cache (same context → same response)      │
│  - Batch: Collect all agent decisions per tick → single batch     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. Frontend Modules

| Module | Responsibility | Key Files |
| ---- | ---- | ---- |
| `game/` | Phaser 3 scene, tilemap, sprites, camera | TownScene.ts, AgentSprite.ts |
| `ui/` | React overlays (dialogue, HUD, panels) | DialoguePanel.tsx, HUD.tsx |
| `store/` | Zustand state management | gameStore.ts, agentStore.ts |
| `net/` | WebSocket + REST client | wsClient.ts, apiClient.ts |
| `audio/` | Ambient sounds, SFX | AudioManager.ts |

### 2. Backend Modules

| Module | Responsibility | Key Files |
| ---- | ---- | ---- |
| `core/` | Tick loop, event bus, config | engine.py, events.py, config.py |
| `agents/` | Agent state, AI decisions, memory | agent.py, decision.py, memory.py |
| `dialogue/` | Conversation generation, history | dialogue.py, history.py |
| `tasks/` | Task creation, assignment, tracking | task.py, executor.py |
| `world/` | Zones, buildings, pathfinding | zone.py, pathfinding.py |
| `relations/` | Relationship graph, dynamics | graph.py, dynamics.py |
| `adapters/` | Real system connections | agentmemory.py, skills.py |
| `llm/` | LLM gateway, batching, caching | gateway.py, cache.py, batch.py |
| `api/` | FastAPI routes, WebSocket | routes.py, websocket.py |

---

## Key Architecture Decisions (ADRs)

### ADR-001: LLM Call Strategy
- **Decision**: Batch all agent decisions per tick into a single API call with multiple prompts
- **Rationale**: 8 agents × 1 call each = 8 API calls per tick = expensive and slow. Batching reduces to 1-2 calls.
- **Implementation**: DeepSeek batch API or sequential with connection reuse. 10-30s tick interval.

### ADR-002: Agent Decision Architecture
- **Decision**: Hybrid state machine + LLM. State machine handles movement/animation. LLM handles decisions at tick boundaries.
- **Rationale**: LLM every frame = impossible. LLM every 10s = affordable. State machine fills the gaps with smooth behavior.
- **Flow**: `Tick → LLM decides action → State machine executes action over 10s → Next tick`

### ADR-003: Dialogue System
- **Decision**: On-demand LLM generation with conversation history cache
- **Rationale**: Pre-generating all dialogue wastes tokens. On-demand means only active conversations cost money.
- **Implementation**: Player clicks agent → send context (agent personality + recent memory + relationship) → LLM generates response → cache for 5 min

### ADR-004: Performance Budget
- **Decision**: Strict performance envelope: idle <5% CPU, <200MB RAM, <$0.10/hour API cost
- **Rationale**: This is a cozy game, not a benchmark. Must run alongside other work.
- **Implementation**: 10s tick (not 1s), LRU cache (avoid repeat calls), lazy loading (only active zone agents think)

### ADR-005: Data Persistence
- **Decision**: SQLite for game state, agentmemory MCP for cross-session knowledge
- **Rationale**: SQLite is zero-config, fast, single-file. agentmemory already runs and has the agent's real memories.
- **Implementation**: SQLite stores: agent positions, relationships, task history, events. agentmemory stores: lessons learned, cross-session context.

### ADR-006: Platform Strategy
- **Decision**: Web-first (Vite dev server → GitHub Pages static build), Tauri for desktop
- **Rationale**: Phaser 3 + React + Vite already works in browser. Tauri adds native wrapper with minimal overhead (~5MB binary vs Electron's 150MB).
- **Implementation**: `npm run build` → static files → GitHub Pages. `tauri build` → native app.

### ADR-007: Art Pipeline
- **Decision**: All art generated via GPT Image 2 (media-gen MCP tool). Style: anime storybook illustration (NOT pixel art).
- **Rationale**: Consistent high-quality style, no licensing issues, can regenerate any asset on demand.
- **Implementation**: 
  - Town map: Single large pre-rendered background image (isometric bird's-eye view, ~2560×1440)
  - Characters: Individual chibi sprites with transparent backgrounds (~256×256 each)
  - Buildings: Pre-rendered into the town map background (not separate tiles)
  - UI: Hand-lettered signboard style labels, generated as image assets
  - Rendering: Background image + character sprites overlaid (NOT tilemap-based)

---

## Data Flow

### Tick Cycle (every 10 seconds)
```
1. TickLoop fires
2. For each active agent (only in player's zone + adjacent):
   a. Collect context: personality, current activity, nearby agents, recent events, memory
   b. Add to batch decision request
3. Send batch to LLM Gateway
4. LLM returns decisions: [{agent_id, action, target, dialogue?}, ...]
5. Apply decisions:
   a. Update agent state (activity, position target, mood)
   b. If dialogue → broadcast speech bubble event
   c. If task progress → update task state
   d. If relationship change → update graph
6. Broadcast state delta via WebSocket
7. Frontend applies delta (smooth interpolation over 10s)
```

### Player Interaction Flow
```
1. Player clicks agent
2. Frontend sends: POST /api/dialogue/start {agent_id, player_message?}
3. Backend:
   a. Load agent context (personality, memory, relationship with player)
   b. Generate response via LLM (not batched — immediate)
   c. Store in conversation history
4. Return response to frontend
5. Frontend shows dialogue panel with response
6. Player can continue conversation or close
```

---

## Performance Optimization Strategy

| Technique | Impact | Implementation |
| ---- | ---- | ---- |
| **Zone-based activation** | -70% LLM calls | Only agents in player's zone + adjacent zones think |
| **Response caching** | -40% LLM calls | Same context hash → cached response (5 min TTL) |
| **Batch decisions** | -80% API overhead | All agent decisions in one API call per tick |
| **Lazy tick scaling** | -50% idle CPU | Tick interval increases when player is AFK (10s → 30s → 60s) |
| **Sprite pooling** | -30% render cost | Reuse sprite objects, only render visible agents |
| **Delta broadcasts** | -90% WS bandwidth | Only send changed state, not full state each tick |

---

## Directory Structure (Target)

```
D:\Game_develop\ai-town\
├── frontend/
│   ├── src/
│   │   ├── game/           # Phaser 3 (scenes, sprites, tilemap)
│   │   ├── ui/             # React components (panels, HUD, dialogue)
│   │   ├── store/          # Zustand stores
│   │   ├── net/            # WebSocket + REST clients
│   │   ├── audio/          # Sound manager
│   │   └── main.tsx        # Entry point
│   ├── public/assets/      # Sprites, tilesets, audio
│   ├── package.json
│   ├── vite.config.ts
│   └── src-tauri/          # Tauri native shell
├── backend/
│   ├── core/               # Engine, events, config
│   ├── agents/             # Agent AI, decisions, memory
│   ├── dialogue/           # Conversation system
│   ├── tasks/              # Task management
│   ├── world/              # Zones, pathfinding
│   ├── relations/          # Relationship graph
│   ├── adapters/           # Real system connections
│   ├── llm/                # LLM gateway, cache, batch
│   ├── api/                # FastAPI routes
│   ├── main.py             # Server entry
│   └── requirements.txt
├── art/                    # Art generation pipeline
├── design/
│   ├── gdd/                # Game design documents
│   ├── architecture.md     # This file
│   └── systems/            # Per-system design docs
├── production/
│   ├── stage.txt
│   ├── review-mode.txt
│   ├── sprints/
│   └── milestones/
├── .claude/                # Game Studios skills
├── CLAUDE.md
├── start.cmd
└── stop.cmd
```

---

## Required ADR List (for /architecture-decision)

1. ✅ ADR-001: LLM Call Strategy
2. ✅ ADR-002: Agent Decision Architecture
3. ✅ ADR-003: Dialogue System
4. ✅ ADR-004: Performance Budget
5. ✅ ADR-005: Data Persistence
6. ✅ ADR-006: Platform Strategy
7. ✅ ADR-007: Art Pipeline
