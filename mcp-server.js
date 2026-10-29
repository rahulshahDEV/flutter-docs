#!/usr/bin/env node

/**
 * Flutter Documentation & Implementation MCP Server
 * Zero-dependency Model Context Protocol (MCP) server that connects AI assistants
 * (Antigravity, Claude Desktop, Cursor, Cline, Roo Code, Windsurf) directly to
 * Flutter CI/CD and Social Auth documentation and code generators.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, 'docs');

const DOCS_BASE_URL = 'https://docs.rahulsha.com.np';
const GITHUB_REPO_URL = 'https://github.com/rahulshahDEV/flutter-docs';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/rahulshahDEV/flutter-docs/main/docs';

async function fetchRemoteDoc(docId) {
  try {
    const res = await fetch(`${GITHUB_RAW_BASE}/${docId}.md`);
    if (res.ok) {
      return await res.text();
    }
  } catch (_) {}
  return null;
}

const AVAILABLE_DOCS = [
  {
    id: 'guides/app_initialization',
    title: 'Flutter Application Bootstrap (App.dart & Main.dart)',
    category: 'Guides',
    description: 'Definitive initialization: WidgetsFlutterBinding, ScreenUtil, orientation locking, edge-to-edge transparent system UI, Firebase, error zones, and ANR prevention.',
    path: path.join(DOCS_DIR, 'guides', 'app_initialization.md'),
  },
  {
    id: 'guides/location_and_gps',
    title: 'Location Permission vs. GPS Hardware Service Architecture',
    category: 'Guides',
    description: 'Dual-gate location architecture: Software permission vs hardware GPS radio, instant last-known cache fallback, Android 14+ ANR protection, and reactive service streams.',
    path: path.join(DOCS_DIR, 'guides', 'location_and_gps.md'),
  },
  {
    id: 'guides/flavors',
    title: 'Flutter Flavors & Environment Setup (Android & iOS)',
    category: 'Guides',
    description: 'Complete multi-flavor environment pipeline: AppConfig runtime singleton, Android Gradle Kotlin DSL productFlavors, iOS Xcode Build Configurations and Schemes, and .env loading.',
    path: path.join(DOCS_DIR, 'guides', 'flavors.md'),
  },
  {
    id: 'guides/proguard_rules',
    title: 'ProGuard & R8 Obfuscation Architecture in Flutter',
    category: 'Guides',
    description: 'Complete Android R8 shrinking, obfuscation, and bytecode optimization guide: Universal proguard-rules.pro, MissingPluginException fixes, and mapping.txt de-obfuscation.',
    path: path.join(DOCS_DIR, 'guides', 'proguard_rules.md'),
  },
  {
    id: 'guides/getting_started',
    title: 'Getting Started with Flutter Docs',
    category: 'Guides',
    description: 'Documentation portal overview and architecture conventions.',
    path: path.join(DOCS_DIR, 'guides', 'getting_started.md'),
  },
  {
    id: 'git/basics',
    title: 'Git Foundations & Core Workflow Architecture',
    category: 'Git & GitHub',
    description: 'Content-addressable DAG, 3-tree mental model (Working tree, Staging, HEAD), patch staging (git add -p), atomic commits, modern switch/restore, and .gitignore hygiene.',
    path: path.join(DOCS_DIR, 'git', 'basics.md'),
  },
  {
    id: 'git/advanced',
    title: 'Advanced Git: Plumbing, Interactive Rebase & Disaster Recovery',
    category: 'Git & GitHub',
    description: 'Interactive rebase (-i, --autosquash), reset vs revert mental model, reflog recovery, git worktree multi-directory workspaces, automated git bisect, and Lefthook hooks.',
    path: path.join(DOCS_DIR, 'git', 'advanced.md'),
  },
  {
    id: 'git/github_stack',
    title: 'The GitHub Stack: Enterprise Workflows, Rulesets & CI Automation',
    category: 'Git & GitHub',
    description: 'Trunk-Based Development, branch rulesets, CODEOWNERS, PR templates, GitHub CLI (gh), and cached GitHub Actions CI with concurrency cancellation.',
    path: path.join(DOCS_DIR, 'git', 'github_stack.md'),
  },
  {
    id: 'git/cheatsheet',
    title: 'Git & GitHub Emergency Cheatsheet & Incident Playbook',
    category: 'Git & GitHub',
    description: 'Interactive emergency decision matrix, 30 essential copy-paste one-liners, disaster recovery playbooks, and Conventional Commit reference.',
    path: path.join(DOCS_DIR, 'git', 'cheatsheet.md'),
  },
  {
    id: 'social/feed_prefetch',
    title: 'Social Media Feed & Video Reel Architecture (Prefetch & Memory Pool)',
    category: 'Social Media',
    description: 'Zero-lag TikTok/Reels feed engine: two-controller VideoPlayerPool, generation tokens against race conditions, 1-day TTL disk cache, and IndexedStack audio isolation.',
    path: path.join(DOCS_DIR, 'social', 'feed_prefetch.md'),
  },
  {
    id: 'skills/flutter_superpower',
    title: 'Flutter Superpower (Senior AI Coding Skill)',
    category: 'Skills',
    description: 'Senior developer AI framework: The 12 Laws of Flutter Architecture, feature-first Clean Architecture, SafeCubit, Injectable, and Evidence Gate.',
    path: path.join(DOCS_DIR, 'skills', 'flutter_superpower.md'),
  },
  {
    id: 'skills/goldie',
    title: 'Goldie (Automated App Store & Play Store Screenshots)',
    category: 'Skills',
    description: 'Automated simulator replay, photorealistic iPhone 16/17 Pro Max & iPad 13" framing, gradient typography, and Fastlane deliver distribution.',
    path: path.join(DOCS_DIR, 'skills', 'goldie.md'),
  },
  {
    id: 'in-app-update/in_app_update',
    title: 'Google Play In-App Updates (Play Core API)',
    category: 'In-App Updates',
    description: 'Immediate fullscreen and flexible background downloads via native Google Play Core, priority thresholds, and lifecycle observers.',
    path: path.join(DOCS_DIR, 'in-app-update', 'in_app_update.md'),
  },
  {
    id: 'in-app-update/upgrader',
    title: 'App Store & Play Store Update Dialogs (Upgrader)',
    category: 'In-App Updates',
    description: 'Cross-platform iTunes API & Play Store web scraping, UpgradeAlert dialogs, inline UpgradeCard feeds, custom UpgraderMessages, and mandatory force updates.',
    path: path.join(DOCS_DIR, 'in-app-update', 'upgrader.md'),
  },
  {
    id: 'monitoring/logger',
    title: 'Production Logging Architecture (AppLogger & PrettyDioLogger)',
    category: 'Monitoring',
    description: 'Structured, leak-proof mobile logging with dart:developer AppLogger (tag filtering, severity levels, kReleaseMode stripping) and PrettyDioLogger formatted HTTP inspection.',
    path: path.join(DOCS_DIR, 'monitoring', 'logger.md'),
  },
  {
    id: 'monitoring/sentry',
    title: 'Sentry Error Monitoring & Telemetry',
    category: 'Monitoring',
    description: 'Enterprise crash reporting, unhandled async exceptions, SentryNavigatorObserver, HTTP tracking, breadcrumbs, user context, and native symbolication.',
    path: path.join(DOCS_DIR, 'monitoring', 'sentry.md'),
  },
  {
    id: 'monitoring/crashlytics',
    title: 'Firebase Crashlytics Crash Reporting',
    category: 'Monitoring',
    description: 'Fatal and non-fatal crash collection, PlatformDispatcher hooks, custom diagnostic keys, forensic logs, and dual Sentry+Crashlytics co-existence.',
    path: path.join(DOCS_DIR, 'monitoring', 'crashlytics.md'),
  },
  {
    id: 'analytics/amplitude',
    title: 'Amplitude Product Analytics & User Metrics',
    category: 'Analytics',
    description: 'Abstract Analytics interface, startup ANR prevention (avoiding @preResolve), typed domain events, session tracking, and user property management.',
    path: path.join(DOCS_DIR, 'analytics', 'amplitude.md'),
  },
  {
    id: 'chat/e2e',
    title: 'End-to-End Encrypted (E2EE) Chat Architecture',
    category: 'Chat & E2E',
    description: 'Zero-knowledge messaging: Libsodium X25519 SealedBox key distribution + AES-256-GCM authenticated cipher with secure hardware storage.',
    path: path.join(DOCS_DIR, 'chat', 'e2e.md'),
  },
  {
    id: 'chat/socket',
    title: 'Real-Time WebSocket & Socket.io Architecture',
    category: 'Chat & E2E',
    description: 'Connection retain counting, app lifecycle backgrounding, deterministic room re-joining, and typed event stream controllers.',
    path: path.join(DOCS_DIR, 'chat', 'socket.md'),
  },
  {
    id: 'CI-CD/codemagic',
    title: 'Codemagic CI/CD Pipeline (Android & iOS)',
    category: 'CI/CD',
    description: 'Automated dual-lane build pipeline, Google Cloud service accounts, Play Console tracks, Apple API keys, and Google Drive APK distribution.',
    path: path.join(DOCS_DIR, 'CI-CD', 'codemagic.md'),
  },
  {
    id: 'CI-CD/fastlane',
    title: 'Fastlane CI/CD Automation (Android & iOS)',
    category: 'CI/CD',
    description: 'Complete Fastlane setup with supply (Play Store), match (Git code signing), pilot (TestFlight), Appfile, Fastfile, and GitHub Actions.',
    path: path.join(DOCS_DIR, 'CI-CD', 'fastlane.md'),
  },
  {
    id: 'CI-CD/shorebird',
    title: 'Shorebird Code Push & OTA Patching (Android & iOS)',
    category: 'CI/CD',
    description: 'Instant over-the-air Dart patching, multi-flavor shorebird.yaml setup, base store releases, and automated GitHub Actions patch pipelines.',
    path: path.join(DOCS_DIR, 'CI-CD', 'shorebird.md'),
  },
  {
    id: 'auth/google',
    title: 'Google Sign-In Implementation Guide',
    category: 'Authentication',
    description: 'Google Cloud Console OAuth consent screen, serverClientId setup, 3 mandatory SHA-1 fingerprints, iOS Info.plist, and Dart GoogleSignInHelper.',
    path: path.join(DOCS_DIR, 'auth', 'google.md'),
  },
  {
    id: 'auth/apple',
    title: 'Sign in with Apple Implementation Guide',
    category: 'Authentication',
    description: 'Apple Developer Portal capability, Service ID for Android/Web, private key (.p8), Xcode entitlements, and Dart AppleSignInHelper.',
    path: path.join(DOCS_DIR, 'auth', 'apple.md'),
  },
  {
    id: 'notifications/notification',
    title: 'Push Notifications (Foreground, Background & Terminated)',
    category: 'Notifications',
    description: 'Firebase Cloud Messaging (FCM) + Flutter Local Notifications, APNs key (.p8), Android 13+ channels, background isolate handler, and cold boot tap navigation.',
    path: path.join(DOCS_DIR, 'notifications', 'notification.md'),
  },
  {
    id: 'packages/overview',
    title: 'Published Packages Catalog (rahulsha.com.np)',
    category: 'Packages',
    description: 'Overview of all open-source packages: flutter_smartdio, accurate_step_counter, contextengine, flutter_handbreak, and fdev.',
    path: path.join(DOCS_DIR, 'packages', 'overview.md'),
  },
  {
    id: 'packages/flutter_smartdio',
    title: 'Flutter SmartDio (Offline Caching & Queue)',
    category: 'Packages',
    description: 'Transport-agnostic HTTP wrapper with Hive caching, offline mutation request queue, retries, and logging.',
    path: path.join(DOCS_DIR, 'packages', 'flutter_smartdio.md'),
  },
  {
    id: 'packages/accurate_step_counter',
    title: 'Accurate Step Counter (Hardware Sensor & FGS)',
    category: 'Packages',
    description: 'Android hardware TYPE_STEP_COUNTER sensor tracking with Health Foreground Service, SQLite history, and live streams.',
    path: path.join(DOCS_DIR, 'packages', 'accurate_step_counter.md'),
  },
  {
    id: 'packages/contextengine',
    title: 'ContextEngine (AI Context & Memory Optimization)',
    category: 'Packages',
    description: 'Provider-agnostic AI orchestration, semantic memory, GraphifyCompressor (30-60% input savings) and CavemanMode.',
    path: path.join(DOCS_DIR, 'packages', 'contextengine.md'),
  },
  {
    id: 'packages/flutter_handbreak',
    title: 'Flutter HandBreak (Video & Image Compression)',
    category: 'Packages',
    description: 'Hardware-accelerated (MediaCodec/VideoToolbox) video and image compression with HandBrake CRF presets and progress streams.',
    path: path.join(DOCS_DIR, 'packages', 'flutter_handbreak.md'),
  },
  {
    id: 'packages/fdev',
    title: 'fdev (Flutter Developer Tools CLI)',
    category: 'Packages',
    description: 'Local Dart developer CLI for build_runner, multi-flavor builds, Android upload keystores, and OpenAPI Swagger code gen.',
    path: path.join(DOCS_DIR, 'packages', 'fdev.md'),
  },
];

const TOOLS = [
  {
    name: 'list_flutter_docs',
    description: 'Lists all available Flutter architectural and implementation guides (CI/CD, Fastlane, Google Sign-In, Sign in with Apple).',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter: "Guides", "Skills", "Packages", "Git & GitHub", "Social Media", "In-App Updates", "Monitoring", "Analytics", "Chat & E2E", "Authentication", "Notifications", or "CI/CD".',
          enum: ['Guides', 'Skills', 'Packages', 'Git & GitHub', 'Social Media', 'In-App Updates', 'Monitoring', 'Analytics', 'Chat & E2E', 'Authentication', 'Notifications', 'CI/CD'],
        },
      },
    },
  },
  {
    name: 'read_flutter_doc',
    description: 'Reads the complete, step-by-step documentation for a specific Flutter feature (e.g., "guides/app_initialization", "skills/goldie", "monitoring/sentry", "monitoring/crashlytics", "analytics/amplitude", "chat/e2e", "upgrader/in_app_update", "auth/google", "auth/apple", "CI-CD/fastlane", "CI-CD/codemagic").',
    inputSchema: {
      type: 'object',
      properties: {
        doc_id: {
          type: 'string',
          description: 'The ID of the document to read (e.g., "guides/app_initialization", "skills/goldie", "monitoring/sentry", "monitoring/crashlytics", "analytics/amplitude", "chat/e2e", "upgrader/in_app_update", "auth/google", "auth/apple", "CI-CD/fastlane", "CI-CD/codemagic").',
        },
      },
      required: ['doc_id'],
    },
  },
  {
    name: 'search_flutter_docs',
    description: 'Searches across all Flutter documentation guides for a keyword or query and returns matching sections and code examples.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or concept to search for (e.g. "ScreenUtil", "SystemChrome", "Goldie", "Sentry", "Crashlytics", "Amplitude", "SealedBox", "InAppUpdate", "SHA-1").',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_implementation_code',
    description: 'Returns clean, production-ready, copy-pasteable code snippets for Flutter social login and CI/CD automation.',
    inputSchema: {
      type: 'object',
      properties: {
        snippet_name: {
          type: 'string',
          description: 'Name of the snippet to retrieve.',
          enum: [
            'app_bootstrap_dart',
            'location_helper_dart',
            'flutter_flavor_app_config_dart',
            'android_build_gradle_flavors_kts',
            'proguard_rules_pro',
            'android_r8_build_gradle_kts',
            'feed_prefetch_manager_dart',
            'git_config_aliases',
            'git_hooks_lefthook_yml',
            'github_actions_flutter_ci_yml',
            'git_emergency_cheatsheet',
            'goldie_config_ts',
            'in_app_update_helper_dart',
            'upgrader_dialog_helper_dart',
            'app_logger_dart',
            'pretty_dio_logger_setup_dart',
            'sentry_init_main_dart',
            'crashlytics_telemetry_dart',
            'amplitude_analytics_module_dart',
            'e2e_crypto_service_dart',
            'chat_socket_service_dart',
            'google_sign_in_helper_dart',
            'apple_sign_in_helper_dart',
            'fastlane_android_fastfile',
            'fastlane_ios_fastfile',
            'github_actions_fastlane_yml',
            'codemagic_pipeline_yaml',
            'shorebird_yaml_config',
            'shorebird_github_actions_yml',
            'notification_service_dart',
            'smartdio_setup_dart',
            'accurate_step_counter_service_dart',
            'contextengine_setup_dart',
            'flutter_handbreak_compression_dart',
            'flutter_superpower_12_laws',
          ],
        },
      },
      required: ['snippet_name'],
    },
  },
];

function handleListDocs(args) {
  const category = args && args.category;
  const docs = category
    ? AVAILABLE_DOCS.filter((d) => d.category.toLowerCase() === category.toLowerCase())
    : AVAILABLE_DOCS;

  const summary = docs.map((d) => ({
    doc_id: d.id,
    title: d.title,
    category: d.category,
    description: d.description,
    web_url: `${DOCS_BASE_URL}/#/doc/${d.id}`,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}

async function handleReadDoc(args) {
  const docId = (args && args.doc_id) || '';
  const normalized = docId.toLowerCase().replace(/^\/+|\/+$/g, '');
  const doc = AVAILABLE_DOCS.find(
    (d) =>
      d.id.toLowerCase() === normalized ||
      d.id.toLowerCase().endsWith(normalized) ||
      normalized.includes(d.id.toLowerCase())
  );

  if (!doc) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Document "${docId}" not found. Browse full docs online: ${DOCS_BASE_URL}\nAvailable doc IDs: ${AVAILABLE_DOCS.map((d) => d.id).join(', ')}`,
        },
      ],
    };
  }

  let content = '';
  if (fs.existsSync(doc.path)) {
    content = fs.readFileSync(doc.path, 'utf8');
  } else {
    content = await fetchRemoteDoc(doc.id);
  }

  if (!content) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Could not load content for "${doc.id}". View online at: ${DOCS_BASE_URL}/#/doc/${doc.id}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: `// Web Documentation: ${DOCS_BASE_URL}/#/doc/${doc.id}\n\n${content}`,
      },
    ],
  };
}

function handleSearchDocs(args) {
  const query = ((args && args.query) || '').toLowerCase();
  if (!query) {
    return {
      content: [{ type: 'text', text: `Please provide a search query. You can also search online at ${DOCS_BASE_URL}` }],
    };
  }

  const results = [];

  for (const doc of AVAILABLE_DOCS) {
    if (!fs.existsSync(doc.path)) continue;
    const content = fs.readFileSync(doc.path, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query)) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        const excerpt = lines.slice(start, end).join('\n');
        results.push({
          doc_id: doc.id,
          title: doc.title,
          web_url: `${DOCS_BASE_URL}/#/doc/${doc.id}`,
          line: i + 1,
          excerpt,
        });
        i = end; // Skip adjacent matches
      }
    }
  }

  return {
    content: [
      {
        type: 'text',
        text:
          results.length > 0
            ? JSON.stringify(results.slice(0, 10), null, 2)
            : `No matching content found for query "${query}". Search full docs at ${DOCS_BASE_URL}`,
      },
    ],
  };
}

function handleGetSnippet(args) {
  const snippet = (args && args.snippet_name) || '';

  const snippetMap = {
    app_bootstrap_dart: {
      file: path.join(DOCS_DIR, 'guides', 'app_initialization.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Production bootstrap.dart orchestrating WidgetsFlutterBinding, ScreenUtil, system chrome, Firebase, and error boundaries.',
    },
    location_helper_dart: {
      file: path.join(DOCS_DIR, 'guides', 'location_and_gps.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Production LocationHelper with dual-gate checks, last-known fallback, and Android NMEA ANR fix.',
    },
    flutter_flavor_app_config_dart: {
      file: path.join(DOCS_DIR, 'guides', 'flavors.md'),
      regex: /### 2\.1 The `AppConfig` Singleton[\s\S]*?```dart([\s\S]*?)```/,
      description: 'Production AppConfig singleton with Flavor enum, .env resolution, and dynamic URLs.',
    },
    android_build_gradle_flavors_kts: {
      file: path.join(DOCS_DIR, 'guides', 'flavors.md'),
      regex: /```kotlin([\s\S]*?)```/,
      description: 'Android Gradle Kotlin DSL productFlavors with applicationIdSuffix and resValue strings.',
    },
    proguard_rules_pro: {
      file: path.join(DOCS_DIR, 'guides', 'proguard_rules.md'),
      regex: /```proguard([\s\S]*?)```/,
      description: 'Universal Flutter proguard-rules.pro protecting engine internals, serialization, Firebase, and native plugins.',
    },
    android_r8_build_gradle_kts: {
      file: path.join(DOCS_DIR, 'guides', 'proguard_rules.md'),
      regex: /### 2\.1 Kotlin DSL[\s\S]*?```kotlin([\s\S]*?)```/,
      description: 'Android Gradle Kotlin DSL release configuration enabling isMinifyEnabled and isShrinkResources.',
    },
    feed_prefetch_manager_dart: {
      file: path.join(DOCS_DIR, 'social', 'feed_prefetch.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Production MediaPrefetchManager with two-controller VideoPlayerPool, generation tokens, and lookahead disk cache.',
    },
    git_config_aliases: {
      file: path.join(DOCS_DIR, 'git', 'basics.md'),
      regex: /```ini([\s\S]*?)```/,
      description: 'Production ~/.gitconfig with zdiff3 conflicts, pull rebase, and productivity aliases.',
    },
    git_hooks_lefthook_yml: {
      file: path.join(DOCS_DIR, 'git', 'advanced.md'),
      regex: /```yaml\s*# lefthook\.yml in project root([\s\S]*?)```/,
      description: 'Enterprise lefthook.yml enforcing dart format, flutter analyze, and Conventional Commit regex.',
    },
    github_actions_flutter_ci_yml: {
      file: path.join(DOCS_DIR, 'git', 'github_stack.md'),
      regex: /Create `\.github\/workflows\/flutter_ci\.yml`:[\s\S]*?```yaml([\s\S]*?)```/,
      description: 'Cached, concurrency-optimized GitHub Actions Flutter CI workflow.',
    },
    git_emergency_cheatsheet: {
      file: path.join(DOCS_DIR, 'git', 'cheatsheet.md'),
      regex: /### Fixing the Last Commit[\s\S]*?```bash([\s\S]*?)```/,
      description: 'Essential Git emergency recovery one-liners for amends, restores, and rollbacks.',
    },
    goldie_config_ts: {
      file: path.join(DOCS_DIR, 'skills', 'goldie.md'),
      regex: /```typescript([\s\S]*?)```/,
      description: 'Production goldie.config.ts configuration for automated 6.9" iPhone & 13" iPad store screenshots.',
    },
    in_app_update_helper_dart: {
      file: path.join(DOCS_DIR, 'in-app-update', 'in_app_update.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Native Google Play PlayUpdateService with Immediate and Flexible background update handling.',
    },
    upgrader_dialog_helper_dart: {
      file: path.join(DOCS_DIR, 'in-app-update', 'upgrader.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Cross-platform UpgradeAlert and UpgradeCard configuration with custom UpgraderMessages.',
    },
    app_logger_dart: {
      file: path.join(DOCS_DIR, 'monitoring', 'logger.md'),
      regex: /Create `lib\/core\/debug\/app_logger\.dart`:[\s\S]*?```dart([\s\S]*?)```/,
      description: 'Production AppLogger with severity badges, tag filtering, and kReleaseMode leak prevention.',
    },
    pretty_dio_logger_setup_dart: {
      file: path.join(DOCS_DIR, 'monitoring', 'logger.md'),
      regex: /Create `lib\/core\/network\/dio_client\.dart`:[\s\S]*?```dart([\s\S]*?)```/,
      description: 'DioClient with PrettyDioLogger active in development and sanitization interceptors.',
    },
    sentry_init_main_dart: {
      file: path.join(DOCS_DIR, 'monitoring', 'sentry.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'SentryFlutter.init setup with tracesSampleRate, breadcrumbs, and SentryUserInteractionWidget.',
    },
    crashlytics_telemetry_dart: {
      file: path.join(DOCS_DIR, 'monitoring', 'crashlytics.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'CrashlyticsTelemetry service with FlutterError.onError, PlatformDispatcher hooks, and custom keys.',
    },
    amplitude_analytics_module_dart: {
      file: path.join(DOCS_DIR, 'analytics', 'amplitude.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'AmplitudeModule with @lazySingleton ANR protection and typed domain events.',
    },
    e2e_crypto_service_dart: {
      file: path.join(DOCS_DIR, 'chat', 'e2e.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'SealedBoxCryptoKeyExchange and ConversationMessageCipher for zero-knowledge E2EE chat.',
    },
    chat_socket_service_dart: {
      file: path.join(DOCS_DIR, 'chat', 'socket.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Production ChatSocketService with connection retain counting, lifecycle backgrounding, and typed event stream.',
    },
    google_sign_in_helper_dart: {
      file: path.join(DOCS_DIR, 'auth', 'google.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Production GoogleSignInHelper Dart class with concurrency mutex and Android recovery.',
    },
    apple_sign_in_helper_dart: {
      file: path.join(DOCS_DIR, 'auth', 'apple.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Production AppleSignInHelper Dart class with native iOS/web Android branching.',
    },
    fastlane_android_fastfile: {
      file: path.join(DOCS_DIR, 'CI-CD', 'fastlane.md'),
      regex: /Create `android\/fastlane\/Fastfile`:[\s\S]*?```ruby([\s\S]*?)```/,
      description: 'Android Fastfile with internal, build_dev_apk, and promote_to_production lanes.',
    },
    fastlane_ios_fastfile: {
      file: path.join(DOCS_DIR, 'CI-CD', 'fastlane.md'),
      regex: /Create `ios\/fastlane\/Fastfile`:[\s\S]*?```ruby([\s\S]*?)```/,
      description: 'iOS Fastfile with App Store Connect API key, match code signing, and beta TestFlight lane.',
    },
    github_actions_fastlane_yml: {
      file: path.join(DOCS_DIR, 'CI-CD', 'fastlane.md'),
      regex: /```yaml\s*name: Flutter Fastlane CI\/CD([\s\S]*?)```/,
      description: 'Complete GitHub Actions workflow for automated Android & iOS Fastlane deployment.',
    },
    codemagic_pipeline_yaml: {
      file: path.join(DOCS_DIR, 'CI-CD', 'codemagic.md'),
      regex: /```yaml([\s\S]*?)```/,
      description: 'Complete sanitized codemagic.yaml dual-lane pipeline specification.',
    },
    shorebird_yaml_config: {
      file: path.join(DOCS_DIR, 'CI-CD', 'shorebird.md'),
      regex: /```yaml([\s\S]*?)```/,
      description: 'Multi-flavor shorebird.yaml configuration blueprint.',
    },
    shorebird_github_actions_yml: {
      file: path.join(DOCS_DIR, 'CI-CD', 'shorebird.md'),
      regex: /```yaml\s*name: Deploy Shorebird Hot Patch([\s\S]*?)```/,
      description: 'GitHub Actions workflow for automated Android & iOS Shorebird patch delivery.',
    },
    notification_service_dart: {
      file: path.join(DOCS_DIR, 'notifications', 'notification.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'Complete production NotificationService with foreground local banners, background handler, and cold boot tap navigation.',
    },
    smartdio_setup_dart: {
      file: path.join(DOCS_DIR, 'packages', 'flutter_smartdio.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'SmartDio initialization with Hive cache policies and offline queuing.',
    },
    accurate_step_counter_service_dart: {
      file: path.join(DOCS_DIR, 'packages', 'accurate_step_counter.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'AccurateStepCounter singleton service with live stream and SQLite history query.',
    },
    contextengine_setup_dart: {
      file: path.join(DOCS_DIR, 'packages', 'contextengine.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'ContextEngine initialization with GraphifyCompressor and CavemanMode token optimization.',
    },
    flutter_handbreak_compression_dart: {
      file: path.join(DOCS_DIR, 'packages', 'flutter_handbreak.md'),
      regex: /```dart([\s\S]*?)```/,
      description: 'FlutterHandbreak video and image compression with hardware acceleration.',
    },
    flutter_superpower_12_laws: {
      file: path.join(DOCS_DIR, 'skills', 'flutter_superpower.md'),
      regex: /## 2\. The 12 Laws of Flutter Architecture[\s\S]*?\| (\*\*1\. Feature-First[\s\S]*?)\| \*\*12\. Quality Gate[\s\S]*?\|/,
      description: 'The 12 Architectural Laws of Flutter Superpower (Clean Architecture, SafeCubit, Injectable, GoRouter, Evidence Gate).',
    },
  };

  const target = snippetMap[snippet];
  if (!target || !fs.existsSync(target.file)) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Snippet "${snippet}" not found. Available snippets: ${Object.keys(snippetMap).join(', ')}`,
        },
      ],
    };
  }

  const fileContent = fs.readFileSync(target.file, 'utf8');
  const match = fileContent.match(target.regex);

  if (!match) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Could not parse code snippet "${snippet}" from documentation.` }],
    };
  }

  const code = (match[1] || match[0]).trim();
  return {
    content: [
      {
        type: 'text',
        text: `// ${target.description}\n// Web Documentation: ${DOCS_BASE_URL}\n\n${code}`,
      },
    ],
  };
}

// JSON-RPC 2.0 Stdio Transport Protocol Handler
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function sendResponse(id, result, error) {
  const response = {
    jsonrpc: '2.0',
    id,
  };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', async (line) => {
  if (!line || !line.trim()) return;

  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    // Handle MCP protocol methods
    switch (method) {
      case 'initialize':
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'flutter-docs-mcp',
            version: '1.2.0',
            homepage: DOCS_BASE_URL,
            repository: GITHUB_REPO_URL,
          },
        });
        break;

      case 'notifications/initialized':
        // Acknowledge notification (no reply needed)
        break;

      case 'ping':
        sendResponse(id, {});
        break;

      case 'tools/list':
        sendResponse(id, { tools: TOOLS });
        break;

      case 'tools/call': {
        const toolName = params && params.name;
        const toolArgs = (params && params.arguments) || {};

        let result;
        if (toolName === 'list_flutter_docs') {
          result = await handleListDocs(toolArgs);
        } else if (toolName === 'read_flutter_doc') {
          result = await handleReadDoc(toolArgs);
        } else if (toolName === 'search_flutter_docs') {
          result = await handleSearchDocs(toolArgs);
        } else if (toolName === 'get_implementation_code') {
          result = await handleGetSnippet(toolArgs);
        } else {
          sendResponse(id, null, {
            code: -32601,
            message: `Method not found: ${toolName}`,
          });
          return;
        }

        sendResponse(id, result);
        break;
      }

      default:
        // Unknown method
        if (id !== undefined) {
          sendResponse(id, null, {
            code: -32601,
            message: `Method not supported: ${method}`,
          });
        }
    }
  } catch (err) {
    // Malformed JSON
    process.stderr.write(`MCP server parse error: ${err.message}\n`);
  }
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
