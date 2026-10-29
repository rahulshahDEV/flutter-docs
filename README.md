# Flutter Docs Portal & AI Automation Hub 🚀

A lightning-fast, personal documentation portal styled with a pure **VS Code Dark IDE aesthetic** (`#1e1e1e`, `#252526`, `#181818`), optimized for direct deployment to **Cloudflare Pages**, paired with a native **Model Context Protocol (MCP)** server for AI coding assistants.

---

## 🌟 Key Features

* **VS Code Dark IDE UI:**
  * **Activity Bar:** Explorer tree, Table of Contents, Search, Settings (`⌘,` / `Ctrl+,`).
  * **File Explorer:** Tree-structured folder navigation with connected branch lines (`├─`, `└─`) and file icons.
  * **Tab Bar & Breadcrumbs:** Multi-file tabs with middle-click / context menu close actions and instant `⌘P` Quick Open.
  * **Interactive Diagrams:** Transparent SVG Mermaid diagrams with an Antigravity-style lightbox modal featuring zoom (`-`, `%`, `+`, reset) and pan controls.
  * **Markdown Highlighting:** Full syntax highlighting for Dart, YAML, Bash, Kotlin, Swift, Python, JSON, and GFM tables.

* **Native Model Context Protocol (MCP) Server (`mcp-server.js`):**
  * Zero-dependency Node.js MCP server exposing Flutter documentation, architecture blueprints, and code generators directly to AI assistants (**Antigravity, Cursor, Claude Desktop, Cline, Roo Code, Windsurf**).
  * Exposes 4 native tools:
    * `list_flutter_docs`: Enumerate guides across CI/CD, Authentication, and general architectures.
    * `read_flutter_doc`: Read the complete Markdown guide by ID (e.g. `auth/google`, `auth/apple`, `CI-CD/fastlane`, `CI-CD/codemagic`).
    * `search_flutter_docs`: Search across all documentation for keywords (e.g. SHA-1, Credential Manager, Match, Service ID).
    * `get_implementation_code`: Retrieve production-ready snippets (e.g. `google_sign_in_helper_dart`, `apple_sign_in_helper_dart`, `fastlane_android_fastfile`, `codemagic_pipeline_yaml`).

* **One-Click AI Connect in Settings (`⌘,`):**
  * Copy-paste ready configuration JSON for Cursor (`.cursor/mcp.json`), Antigravity, Claude Desktop, and VS Code extensions.
  * Ready-to-run prompt templates for implementing Google Sign-In, Apple Sign-In, Fastlane CI/CD, and Codemagic automated pipelines.

---

## 📁 Project Structure

```text
/Volumes/automation/flutter docs/
├── docs/
│   ├── guides/                       # Core Architecture Guides (Pinned at Top)
│   │   ├── app_initialization.md     # Production Bootstrap: WidgetsFlutterBinding, ScreenUtil, System Chrome, Firebase
│   │   ├── location_and_gps.md       # Dual-Gate Location: Permission vs Hardware GPS, Cache Fallback & ANR Fix
│   │   └── getting_started.md        # Portal introduction and architecture conventions
│   ├── skills/                       # Senior Developer AI Skills & Tooling
│   │   ├── flutter_superpower.md     # Flutter Superpower: 12 Architectural Laws & Senior Mode
│   │   └── goldie.md                 # Goldie: Automated 6.9" iPhone & 13" iPad Store Screenshots
│   ├── git/                          # Git Version Control & GitHub Enterprise Stack
│   │   ├── basics.md                 # Git Foundations: Content-Addressable DAG, 3 Trees & Patch Staging
│   │   ├── advanced.md               # Advanced Git: Interactive Rebase, Reset vs Revert, Reflog, Worktrees
│   │   ├── github_stack.md           # The GitHub Stack: Trunk-Based Development, Rulesets & Actions CI
│   │   └── cheatsheet.md             # Emergency Cheatsheet: Decision Matrix & 30 Essential One-Liners
│   ├── social/                       # High-Performance Social Feeds & Video Reels
│   │   └── feed_prefetch.md          # Feed Prefetch: Two-controller VideoPlayerPool, generation tokens, disk cache
│   ├── in-app-update/                # App Store & Google Play Update Handlers
│   │   ├── upgrader.md               # Upgrader: App Store & Play Store alerts, UpgradeCard, force updates
│   │   └── in_app_update.md          # Google Play Core: Immediate fullscreen & flexible background downloads
│   ├── monitoring/                   # Real-Time Telemetry & Crash Reporting
│   │   ├── logger.md                 # Structured Logging: Custom AppLogger (tags, zero leak) & PrettyDioLogger
│   │   ├── sentry.md                 # Sentry: Unhandled Async Errors, Navigation, HTTP & Symbolication
│   │   └── crashlytics.md            # Firebase Crashlytics: Fatal/Non-fatal errors, Logs & Custom Keys
│   ├── analytics/                    # Product Telemetry & Metrics
│   │   └── amplitude.md              # Amplitude: ANR-Safe Lazy Injection, Typed Events & Session Tracking
│   ├── chat/                         # Secure Messaging & Real-Time Infrastructure
│   │   ├── e2e.md                    # End-to-End Encryption: Libsodium X25519 SealedBox + AES-256-GCM
│   │   └── socket.md                 # Real-Time WebSocket & Socket.io: Retain counting, lifecycle & events
│   ├── CI-CD/
│   │   ├── codemagic.md              # Complete Codemagic CI/CD (Google Drive APK + App Store)
│   │   ├── fastlane.md               # Complete Fastlane automation (Match, supply, pilot)
│   │   └── shorebird.md              # Shorebird Code Push & OTA patch automation (Android + iOS)
│   ├── auth/
│   │   ├── google.md                 # Google Sign-In (Credential Manager, SHA-1s, helper)
│   │   └── apple.md                  # Apple Sign-In (iOS Entitlements, Android Web OAuth)
│   ├── notifications/
│   │   └── notification.md           # Push Notifications (Foreground, Background & Terminated states)
│   └── packages/                     # Official pub.dev Packages by rahulsha.com.np
│       ├── overview.md               # Packages catalog & quick install guide
│       ├── flutter_smartdio.md       # SmartDio: HTTP with offline caching & queue
│       ├── accurate_step_counter.md  # AccurateStepCounter: Android hardware sensor & FGS
│       ├── contextengine.md          # ContextEngine: AI context & memory optimization
│       ├── flutter_handbreak.md      # FlutterHandbreak: Video & image compression
│       └── fdev.md                   # fdev: Flutter developer automation CLI
├── src/
│   ├── components/
│   │   ├── VSCodeActivityBar.tsx     # Far-left 48px activity icon bar
│   │   ├── VSCodeSidebar.tsx         # Explorer tree & left Table of Contents
│   │   ├── VSCodeTabBar.tsx          # Editor tabs, Quick Open & Connect AI button
│   │   ├── VSCodeQuickOpen.tsx       # ⌘P file & heading switcher
│   │   ├── VSCodeSettingsModal.tsx   # MCP settings hub & auto-implementation prompts
│   │   ├── MarkdownRenderer.tsx      # Prism code highlighter, GFM tables, alerts
│   │   └── MermaidDiagram.tsx        # Antigravity diagram card & zoomable lightbox
│   ├── utils/
│   │   ├── docsLoader.ts             # Vite glob loader for docs/**/*.md
│   │   └── slugify.ts                # Deterministic anchor slug generator
│   ├── App.tsx                       # Root layout & scroll-spy
│   └── main.tsx
├── mcp-server.js                     # Zero-dependency Node.js MCP server (Stdio JSON-RPC)
├── public/
│   ├── _routes.json                  # Cloudflare Pages SPA routing
│   └── _headers                      # Edge caching & security headers
├── package.json
└── vite.config.ts
```

---

## 🤖 Connecting Your AI Assistant (MCP)

### 1. Cursor (`.cursor/mcp.json`)
Add this to `.cursor/mcp.json` in your Flutter project root:
```json
{
  "mcpServers": {
    "flutter-docs": {
      "command": "node",
      "args": ["/Volumes/automation/flutter docs/mcp-server.js"]
    }
  }
}
```

### 2. Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "flutter-docs": {
      "command": "node",
      "args": ["/Volumes/automation/flutter docs/mcp-server.js"]
    }
  }
}
```

### 3. Test MCP Server in Terminal
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node "/Volumes/automation/flutter docs/mcp-server.js"
```

---

## 🛠️ Local Development & Build

```bash
cd "/Volumes/automation/flutter docs"
npm run dev      # Launch local dev server (http://localhost:3000)
npm run build    # Build production static bundle in dist/
```
