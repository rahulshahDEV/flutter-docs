import React, { useState } from 'react';
import { DocItem } from '../types.ts';
import { MarkdownFileIcon } from './FileIcons.tsx';
import { ChevronRight, X, Search } from 'lucide-react';

interface VSCodeTabBarProps {
  currentDoc?: DocItem;
  openDocs: DocItem[];
  onSelectDoc: (id: string) => void;
  onCloseDoc: (id: string, e?: React.MouseEvent) => void;
  onCloseOthers: (id?: string) => void;
  onOpenQuickOpen: () => void;
}

export const VSCodeTabBar: React.FC<VSCodeTabBarProps> = ({
  currentDoc,
  openDocs,
  onSelectDoc,
  onCloseDoc,
  onCloseOthers,
  onOpenQuickOpen,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; docId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, docId });
  };

  const closeMenu = () => setContextMenu(null);

  return (
    <>
      <div className="w-full shrink-0 select-none bg-[#181818] border-b border-[#2d2d2d] z-10">
        {/* Tabs Row */}
        <div className="flex items-center justify-between bg-[#252526] h-9">
          {/* Tabs List */}
          <div className="flex items-center overflow-x-auto h-full scrollbar-none flex-1">
            {openDocs.map((doc) => {
              const isActive = doc.id === currentDoc?.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  onAuxClick={(e) => {
                    if (e.button === 1) {
                      e.preventDefault();
                      onCloseDoc(doc.id, e);
                    }
                  }}
                  onContextMenu={(e) => handleContextMenu(e, doc.id)}
                  className={`group relative flex items-center gap-2 pl-3.5 pr-2 h-full text-xs border-r border-[#2d2d2d] cursor-pointer transition-colors shrink-0 max-w-[220px] ${
                    isActive
                      ? 'bg-[#1e1e1e] text-[#ffffff] border-t-2 border-t-[#007acc]'
                      : 'bg-[#2d2d2d]/60 text-[#969696] hover:bg-[#2a2d2e] hover:text-[#cccccc]'
                  }`}
                  title={`${doc.relativePath}\n(Right-click for options, middle-click to close)`}
                >
                  <MarkdownFileIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-xs">{doc.fileName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseDoc(doc.id, e);
                    }}
                    className={`ml-1 rounded p-0.5 hover:bg-[#3e3e42] hover:text-white transition-opacity ${
                      isActive ? 'opacity-80 hover:opacity-100 text-[#cccccc]' : 'opacity-0 group-hover:opacity-100 text-[#858585]'
                    }`}
                    title="Close file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sleek VS Code Top Search Field */}
          <div className="flex items-center px-3 shrink-0 h-full border-l border-[#2d2d2d] bg-[#252526]">
            <button
              onClick={onOpenQuickOpen}
              className="flex items-center justify-between gap-3 w-48 sm:w-64 h-6 px-2.5 rounded bg-[#1e1e1e] border border-[#3e3e42] hover:border-[#007acc] text-[#858585] hover:text-[#cccccc] transition-all shadow-inner text-xs group"
              title="Search files and documentation (⌘P / Ctrl+P)"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Search className="h-3.5 w-3.5 text-[#75beff] group-hover:text-[#4fc1ff] shrink-0" />
                <span className="text-[11px] truncate">Search files & docs...</span>
              </div>
              <kbd className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[9px] font-mono text-[#9cdcfe] border border-[#3e3e42] shrink-0">
                ⌘P
              </kbd>
            </button>
          </div>
        </div>

        {/* Stable Breadcrumbs Row */}
        <div className="flex items-center justify-between px-4 h-6 text-[11px] text-[#888888] bg-[#1e1e1e] border-t border-[#252526]">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[#888888]">docs</span>
            {currentDoc?.folder && (
              <>
                <ChevronRight className="h-3 w-3 text-[#555555] shrink-0" />
                <span className="text-[#888888] truncate">{currentDoc.folder}</span>
              </>
            )}
            {currentDoc && (
              <>
                <ChevronRight className="h-3 w-3 text-[#555555] shrink-0" />
                <span className="text-[#cccccc] font-medium truncate">{currentDoc.fileName}</span>
              </>
            )}
          </div>
          {currentDoc && (
            <span className="text-[10px] text-[#666666] font-mono hidden md:inline">
              Markdown
            </span>
          )}
        </div>
      </div>

      {/* Right Click Tab Context Menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={closeMenu}
          onContextMenu={(e) => {
            e.preventDefault();
            closeMenu();
          }}
        >
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="absolute z-50 min-w-[140px] rounded-md border border-[#454545] bg-[#252526] py-1 shadow-xl text-xs text-[#cccccc]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onCloseDoc(contextMenu.docId);
                closeMenu();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#04395e] hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onCloseOthers(contextMenu.docId);
                closeMenu();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#04395e] hover:text-white transition-colors"
            >
              Close Others (Ctrl+W)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
