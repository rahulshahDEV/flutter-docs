import React, { useEffect, useRef, useState } from 'react';
import { DocItem } from '../types.ts';
import { Search, FileText, ArrowRight, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  docs: DocItem[];
  onSelectDoc: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  docs,
  onSelectDoc,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = docs.filter((doc) => {
    const q = query.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.fileName.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-[#30363d] px-4 py-3">
          <Search className="h-4 w-4 text-[#8b949e]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation (titles, topics, commands)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b949e]">
              No results found for "{query}"
            </div>
          ) : (
            results.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc.id);
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs text-[#e6edf3] hover:bg-[#21262d] transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="rounded-lg bg-[#21262d] p-2 text-[#58a6ff] group-hover:bg-[#1f6feb]/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-[#8b949e] font-mono">{doc.fileName}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#30363d] bg-[#0d1117] px-4 py-2 text-[11px] text-[#8b949e] flex justify-between items-center">
          <span>Navigate with mouse or keyboard</span>
          <kbd className="rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] font-mono">ESC to close</kbd>
        </div>
      </div>
    </div>
  );
};

