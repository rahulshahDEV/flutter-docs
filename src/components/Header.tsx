import React, { useState } from 'react';
import { Menu, Sun, Moon, Copy, Check, FileDown, Search } from 'lucide-react';
import { DocItem } from '../types.ts';

interface HeaderProps {
  currentDoc?: DocItem;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDoc,
  onOpenMobileSidebar,
  onOpenSearch,
  isDark,
  onToggleTheme,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    if (!currentDoc) return;
    navigator.clipboard.writeText(currentDoc.content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    if (!currentDoc) return;
    const blob = new Blob([currentDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentDoc.fileName || 'document.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#30363d] bg-[#0d1117]/85 backdrop-blur-md px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#8b949e]">
          <span>Docs</span>
          <span>/</span>
          <span className="font-medium text-[#e6edf3] truncate max-w-[200px] md:max-w-xs">
            {currentDoc?.title || 'Overview'}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Quick search shortcut button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs text-[#8b949e] hover:border-[#58a6ff]/50 hover:text-[#e6edf3] transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search docs...</span>
          <kbd className="hidden sm:inline-block rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] font-mono text-[#8b949e]">
            ⌘K
          </kbd>
        </button>

        {/* Copy full markdown */}
        {currentDoc && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
            title="Copy entire raw Markdown document"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{copiedAll ? 'Copied' : 'Copy MD'}</span>
          </button>
        )}

        {/* Download markdown file */}
        {currentDoc && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
            title="Download .md file"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="rounded-lg border border-[#30363d] bg-[#161b22] p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
        </button>
      </div>
    </header>
  );
};

