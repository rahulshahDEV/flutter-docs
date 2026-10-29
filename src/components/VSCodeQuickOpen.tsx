import React, { useEffect, useRef, useState } from 'react';
import { DocItem } from '../types.ts';
import { MarkdownFileIcon } from './FileIcons.tsx';
import { Search, X } from 'lucide-react';

interface VSCodeQuickOpenProps {
  isOpen: boolean;
  onClose: () => void;
  docs: DocItem[];
  onSelectDoc: (id: string) => void;
}

export const VSCodeQuickOpen: React.FC<VSCodeQuickOpenProps> = ({
  isOpen,
  onClose,
  docs,
  onSelectDoc,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  const filteredDocs = docs.filter((doc) => {
    const q = query.toLowerCase();
    return (
      doc.fileName.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      doc.relativePath.toLowerCase().includes(q) ||
      doc.headings.some((h) => h.text.toLowerCase().includes(q))
    );
  });

  // Handle keyboard navigation (Arrow Up, Down, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredDocs.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredDocs.length) % Math.max(1, filteredDocs.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredDocs[selectedIndex]) {
          onSelectDoc(filteredDocs[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredDocs, selectedIndex, onClose, onSelectDoc]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/60 backdrop-blur-[2px] select-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-[#454545] bg-[#1e1e1e] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick Open Input Header */}
        <div className="flex items-center gap-2.5 border-b border-[#2d2d2d] bg-[#252526] px-3.5 py-2.5">
          <Search className="h-4 w-4 text-[#75beff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by file name or topic (e.g., cicd, keystore, testflight)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-xs text-[#ffffff] placeholder-[#777777] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-[#858585] hover:text-[#cccccc] p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="text-[10px] text-[#858585] font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">
            {filteredDocs.length} files
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto py-1">
          {filteredDocs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#858585]">
              No documents matching "{query}"
            </div>
          ) : (
            filteredDocs.map((doc, idx) => {
              const isHighlighted = idx === selectedIndex;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                    isHighlighted
                      ? 'bg-[#04395e] text-white'
                      : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MarkdownFileIcon className="h-4 w-4 shrink-0" />
                    <span className="font-medium truncate text-white">{doc.fileName}</span>
                    <span
                      className={`text-[11px] font-mono truncate px-1.5 py-0.5 rounded ${
                        isHighlighted ? 'bg-[#002440] text-[#9cdcfe]' : 'bg-[#2a2d2e] text-[#858585]'
                      }`}
                    >
                      {doc.folder || 'docs'}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] truncate max-w-[220px] ${
                      isHighlighted ? 'text-[#e0e0e0]' : 'text-[#777777]'
                    }`}
                  >
                    {doc.title}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="flex items-center justify-between border-t border-[#2d2d2d] bg-[#181818] px-3.5 py-2 text-[10px] text-[#858585]">
          <span>Use ↑↓ to navigate • enter to select</span>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[9px] font-mono text-[#aaaaaa] border border-[#3e3e42]">
              esc to close
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
