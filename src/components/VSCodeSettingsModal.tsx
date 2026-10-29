import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Server,
  Code2,
  Terminal,
  Cpu,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface VSCodeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ClientType = 'cursor' | 'antigravity' | 'claude' | 'vscode' | 'windsurf';

export const VSCodeSettingsModal: React.FC<VSCodeSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeClient, setActiveClient] = useState<ClientType>('cursor');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mcpServerPath = '/Volumes/automation/flutter docs/mcp-server.js';
  const liveDocsUrl = 'https://docs.rahulsha.com.np';
  const serverCommand = `node "${mcpServerPath}"`;
  const testCommand = `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node "${mcpServerPath}"`;

  const clientConfigs: Record<
    ClientType,
    { name: string; file: string; config: string; steps: string[] }
  > = {
    cursor: {
      name: 'Cursor',
      file: '.cursor/mcp.json (or Cursor Settings > Features > MCP)',
      config: JSON.stringify(
        {
          mcpServers: {
            'flutter-docs': {
              command: 'node',
              args: [mcpServerPath],
            },
          },
        },
        null,
        2
      ),
      steps: [
        'Open your project in Cursor.',
        'Create or edit .cursor/mcp.json in the project root (or navigate to Cursor Settings > Features > MCP > Add New MCP Server).',
        'Paste the configuration JSON below and save.',
      ],
    },
    antigravity: {
      name: 'Antigravity',
      file: '~/.gemini/antigravity/mcp/flutter_docs/config.json',
      config: JSON.stringify(
        {
          mcpServers: {
            'flutter-docs': {
              command: 'node',
              args: [mcpServerPath],
            },
          },
        },
        null,
        2
      ),
      steps: [
        'Open your Antigravity MCP configuration.',
        'Add the "flutter-docs" server definition under mcpServers.',
        'Antigravity will automatically load the tools in your next session.',
      ],
    },
    claude: {
      name: 'Claude Desktop',
      file: '~/Library/Application Support/Claude/claude_desktop_config.json',
      config: JSON.stringify(
        {
          mcpServers: {
            'flutter-docs': {
              command: 'node',
              args: [mcpServerPath],
            },
          },
        },
        null,
        2
      ),
      steps: [
        'Open Claude Desktop Settings > Developer > Edit Config.',
        'Paste the JSON block below into your claude_desktop_config.json.',
        'Restart Claude Desktop. The hammer icon will show the new tools.',
      ],
    },
    vscode: {
      name: 'VS Code (Cline / Roo / Continue)',
      file: 'cline_mcp_settings.json (or Extension MCP Settings)',
      config: JSON.stringify(
        {
          mcpServers: {
            'flutter-docs': {
              command: 'node',
              args: [mcpServerPath],
              disabled: false,
              autoApprove: [
                'list_flutter_docs',
                'read_flutter_doc',
                'search_flutter_docs',
                'get_implementation_code',
              ],
            },
          },
        },
        null,
        2
      ),
      steps: [
        'In VS Code, open the Cline or Roo Code extension tab.',
        'Click the MCP Servers icon > Configure MCP Servers.',
        'Paste the JSON block below and save.',
      ],
    },
    windsurf: {
      name: 'Windsurf',
      file: '~/.codeium/windsurf/mcp_config.json',
      config: JSON.stringify(
        {
          mcpServers: {
            'flutter-docs': {
              command: 'node',
              args: [mcpServerPath],
            },
          },
        },
        null,
        2
      ),
      steps: [
        'Open or create ~/.codeium/windsurf/mcp_config.json.',
        'Add the "flutter-docs" server entry.',
        'Restart Windsurf or reload the Cascade window.',
      ],
    },
  };

  const current = clientConfigs[activeClient];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#cccccc]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] bg-[#252526] px-5 py-3.5 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#007acc]/20 border border-[#007acc]/30 flex items-center justify-center">
              <Server className="h-4 w-4 text-[#75beff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Connect MCP Server</h2>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Stdio Ready
                </span>
                <a
                  href={liveDocsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-[#75beff] hover:text-[#9cdcfe] hover:underline bg-[#007acc]/10 border border-[#007acc]/20 px-2 py-0.5 rounded-full transition-colors"
                  title="Open live web portal"
                >
                  <Globe className="h-3 w-3" />
                  <span>docs.rahulsha.com.np</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
              </div>
              <p className="text-[11px] text-[#888888]">
                Connect your AI assistant directly to Flutter Docs via Model Context Protocol
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#858585] hover:text-white hover:bg-[#333333] transition-colors"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Server Stdio Info Card */}
          <div className="rounded-xl border border-[#007acc]/30 bg-[#161c24] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#75beff]" />
                <span className="text-xs font-semibold text-white">Server Command (Node.js Stdio)</span>
              </div>
              <button
                onClick={() => handleCopy('server-cmd', serverCommand)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252526] hover:bg-[#2d2d2d] border border-[#3e3e42] text-xs text-[#cccccc] transition-colors"
              >
                {copiedId === 'server-cmd' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#0f141a] p-2.5 rounded-lg border border-[#233140] font-mono text-xs text-[#9cdcfe] overflow-x-auto select-all">
              {serverCommand}
            </div>
          </div>

          {/* Client Selection Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block">
              Select Your AI Coding Assistant:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(Object.keys(clientConfigs) as ClientType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveClient(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    activeClient === key
                      ? 'bg-[#007acc] text-white shadow'
                      : 'bg-[#252526] text-[#858585] hover:text-[#cccccc] border border-[#333333]'
                  }`}
                >
                  {clientConfigs[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Card */}
          <div className="rounded-xl border border-[#333333] bg-[#141416] p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs truncate">
                <span className="text-[#858585]">Config File: </span>
                <span className="font-mono text-[#75beff]">{current.file}</span>
              </div>

              <button
                onClick={() => handleCopy(`config-${activeClient}`, current.config)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-medium transition-colors shrink-0 shadow"
              >
                {copiedId === `config-${activeClient}` ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Config JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* JSON snippet */}
            <div className="overflow-x-auto rounded-lg bg-[#0a0a0c] border border-[#2d2d2d] p-3.5">
              <pre className="text-xs font-mono text-[#d4d4d8] leading-relaxed">
                {current.config}
              </pre>
            </div>

            {/* Setup instructions */}
            <div className="space-y-1.5 pt-1 border-t border-[#252526]">
              <span className="text-[11px] font-semibold text-[#858585] uppercase tracking-wider block">
                How to apply:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-xs text-[#aaaaaa]">
                {current.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Terminal Test Command */}
          <div className="rounded-xl border border-[#2d2d2d] bg-[#1a1a1c] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden text-xs">
              <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[#858585]">Quick Terminal Test: </span>
                <code className="text-[#9cdcfe] font-mono text-[11px]">{testCommand}</code>
              </div>
            </div>

            <button
              onClick={() => handleCopy('test-cmd', testCommand)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#252526] hover:bg-[#2d2d2d] border border-[#3e3e42] text-xs text-[#cccccc] shrink-0 transition-colors"
            >
              {copiedId === 'test-cmd' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#2d2d2d] bg-[#252526] px-5 py-3 flex items-center justify-between text-xs text-[#858585]">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span>Stdio Server: <code className="text-[#9cdcfe]">mcp-server.js</code></span>
            <span className="hidden sm:inline text-[#555555]">•</span>
            <a
              href={liveDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#75beff] hover:underline"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>docs.rahulsha.com.np</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#333333] hover:bg-[#3e3e42] text-white transition-colors ml-2 shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
