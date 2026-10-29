import React from 'react';
import { DocItem } from '../types.ts';
import { FileText, Search, BookOpen, Layers, X } from 'lucide-react';

interface SidebarProps {
  docs: DocItem[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  docs,
  selectedDocId,
  onSelectDoc,
  searchQuery,
  onSearchChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const filteredDocs = docs.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0d1117] border-r border-[#30363d] flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide">Flutter Docs</span>
              <span className="ml-1.5 rounded bg-[#1f6feb]/20 px-1.5 py-0.5 text-[10px] font-mono text-[#58a6ff] border border-[#1f6feb]/30">
                v1.0
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded p-1 text-[#8b949e] hover:bg-[#21262d] hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-[#21262d]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8b949e]" />
            <input
              type="text"
              placeholder="Filter docs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-[#30363d] bg-[#161b22] pl-9 pr-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] transition-all"
            />
          </div>
        </div>

        {/* Docs list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] flex items-center justify-between">
            <span>Documentation Guides</span>
            <span className="font-mono text-[10px] bg-[#21262d] px-1.5 py-0.5 rounded text-[#8b949e]">
              {docs.length}
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[#8b949e]">
              No documents match "{searchQuery}"
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc.id);
                    onCloseMobile();
                  }}
                  className={`w-full group flex items-start gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#1f6feb]/15 text-[#58a6ff] font-medium border border-[#1f6feb]/30 shadow-sm'
                      : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3]'
                  }`}
                >
                  <FileText
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      isSelected ? 'text-[#58a6ff]' : 'text-[#8b949e] group-hover:text-[#e6edf3]'
                    }`}
                  />
                  <div className="flex-1 truncate">
                    <div className="truncate font-medium">{doc.title}</div>
                    <div className="truncate text-[10px] text-[#6e7681] font-mono mt-0.5">
                      {doc.fileName}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#30363d] bg-[#161b22]/50 text-xs text-[#8b949e] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            <BookOpen className="h-3.5 w-3.5 text-[#58a6ff]" />
            <span>Cloudflare Pages Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};

