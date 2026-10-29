import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DocItem, FolderNode, HeadingItem } from '../types.ts';
import { ActivityTab } from './VSCodeActivityBar.tsx';
import { FolderIcon, MarkdownFileIcon } from './FileIcons.tsx';
import {
  ChevronRight,
  ChevronDown,
  ListTree,
  Search,
} from 'lucide-react';

interface VSCodeSidebarProps {
  activeTab: ActivityTab;
  docs: DocItem[];
  folderTree: FolderNode;
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  activeHeadingId?: string;
  onSelectHeading: (id: string) => void;
}

export const VSCodeSidebar: React.FC<VSCodeSidebarProps> = ({
  activeTab,
  docs,
  folderTree,
  selectedDocId,
  onSelectDoc,
  activeHeadingId,
  onSelectHeading,
}) => {
  // Initially only the 'guides' folder is open by default
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => ({
    docs: true,
    guides: true,
  }));
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expand the folder containing the active document
  useEffect(() => {
    if (selectedDocId) {
      const parts = selectedDocId.split('/');
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/');
        setOpenFolders((prev) => (prev[parentPath] ? prev : { ...prev, [parentPath]: true }));
      }
    }
  }, [selectedDocId]);

  // Resizable sidebar width with persistence
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('vscode-sidebar-width');
      return saved ? Math.max(180, Math.min(650, parseInt(saved, 10))) : 280;
    } catch {
      return 280;
    }
  });
  const [isDragging, setIsDragging] = useState(false);

  // Draggable TOC height (percentage of explorer panel taken by file tree)
  // fileTreeFraction = fraction of available height allocated to the file tree (0.15 to 0.85)
  const [fileTreeFraction, setFileTreeFraction] = useState(() => {
    try {
      const saved = localStorage.getItem('vscode-filetree-fraction');
      return saved ? Math.max(0.15, Math.min(0.85, parseFloat(saved))) : 0.5;
    } catch {
      return 0.5;
    }
  });
  const [isTocDragging, setIsTocDragging] = useState(false);
  const explorerRef = useRef<HTMLDivElement | null>(null);

  const activeTocRef = useRef<HTMLButtonElement | null>(null);
  const currentDoc = docs.find((d) => d.id === selectedDocId);

  // Resize drag listener (sidebar width)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 48px is the width of the left activity bar
      const newWidth = Math.max(180, Math.min(700, e.clientX - 48));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem('vscode-sidebar-width', String(sidebarWidth));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Prevent text selection while dragging
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, sidebarWidth]);

  const handleResetWidth = () => {
    setSidebarWidth(280);
    try {
      localStorage.setItem('vscode-sidebar-width', '280');
    } catch {}
  };

  // TOC height drag listener (vertical divider between file tree and TOC)
  const handleTocDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsTocDragging(true);
  }, []);

  useEffect(() => {
    if (!isTocDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const explorerEl = explorerRef.current;
      if (!explorerEl) return;
      const rect = explorerEl.getBoundingClientRect();
      // Subtract the Explorer header height (~30px) from both top and total
      const headerHeight = 30;
      const totalHeight = rect.height - headerHeight;
      const mouseY = e.clientY - rect.top - headerHeight;
      const fraction = Math.max(0.15, Math.min(0.85, mouseY / totalHeight));
      setFileTreeFraction(fraction);
    };

    const handleMouseUp = () => {
      setIsTocDragging(false);
      try {
        localStorage.setItem('vscode-filetree-fraction', String(fileTreeFraction));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isTocDragging, fileTreeFraction]);

  const handleResetTocHeight = () => {
    setFileTreeFraction(0.5);
    try {
      localStorage.setItem('vscode-filetree-fraction', '0.5');
    } catch {}
  };

  // Auto-scroll the Table of Contents container so the active heading is always visible
  useEffect(() => {
    if (activeHeadingId && activeTocRef.current) {
      activeTocRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeHeadingId]);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Render a folder or doc recursively with connected tree guide lines
  const renderTree = (
    node: FolderNode,
    depth = 0,
    isLastChild = false,
    activeAncestors: boolean[] = []
  ) => {
    const isRoot = node.name === 'docs' && depth === 0;
    const isFolderOpen = isRoot || Boolean(openFolders[node.fullPath]);

    return (
      <div key={node.fullPath} className="w-full relative">
        {!isRoot && (
          <div className="relative w-full group">
            {/* Ancestor tree vertical guide lines */}
            {activeAncestors.map((hasLine, i) =>
              hasLine ? (
                <span
                  key={i}
                  style={{ left: `${i * 14 + 12}px` }}
                  className="absolute top-0 bottom-0 w-[1px] bg-[#333336] pointer-events-none"
                />
              ) : null
            )}

            {/* Tree branch connector for this folder */}
            <span
              style={{ left: `${(depth - 1) * 14 + 12}px` }}
              className={`absolute top-0 w-[1px] bg-[#3a3a3d] group-hover:bg-[#505054] transition-colors pointer-events-none ${
                isLastChild ? 'h-[14px]' : 'bottom-0'
              }`}
            />
            <span
              style={{
                left: `${(depth - 1) * 14 + 12}px`,
                width: '7px',
              }}
              className="absolute top-[14px] h-[1px] bg-[#3a3a3d] group-hover:bg-[#505054] transition-colors pointer-events-none"
            />

            <button
              onClick={() => toggleFolder(node.fullPath)}
              style={{ paddingLeft: `${depth * 14 + 6}px` }}
              className="w-full flex items-center gap-1.5 py-1 text-xs text-[#cccccc] hover:bg-[#2a2d2e] transition-colors font-medium text-left select-none"
            >
              {isFolderOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-[#858585] group-hover:text-white shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-[#858585] group-hover:text-white shrink-0" />
              )}
              <FolderIcon isOpen={isFolderOpen} folderName={node.name} className="h-4 w-4 shrink-0" />
              <span className="truncate">{node.displayName || node.name}</span>
            </button>
          </div>
        )}

        {(isRoot || isFolderOpen) && (
          <div className="relative">
            {node.children.map((child, index) => {
              const isLast = index === node.children.length - 1;
              const nextAncestors = isRoot
                ? []
                : [...activeAncestors, !isLastChild];

              if (child.isFolder) {
                return renderTree(
                  child,
                  isRoot ? 0 : depth + 1,
                  isLast,
                  isRoot ? [] : nextAncestors
                );
              }

              const isSelected = child.id === selectedDocId;
              const indent = isRoot ? 12 : (depth + 1) * 14 + 6;

              return (
                <div key={child.id} className="relative w-full group">
                  {/* Ancestor tree vertical guide lines */}
                  {!isRoot &&
                    activeAncestors.map((hasLine, i) =>
                      hasLine ? (
                        <span
                          key={i}
                          style={{ left: `${i * 14 + 12}px` }}
                          className="absolute top-0 bottom-0 w-[1px] bg-[#333336] pointer-events-none"
                        />
                      ) : null
                    )}

                  {/* Connected Tree Line: Vertical tick / drop */}
                  {!isRoot && (
                    <span
                      style={{ left: `${depth * 14 + 12}px` }}
                      className={`absolute top-0 w-[1px] bg-[#3a3a3d] group-hover:bg-[#505054] transition-colors pointer-events-none ${
                        isLast ? 'h-[14px]' : 'bottom-0'
                      }`}
                    />
                  )}

                  {/* Connected Tree Line: Horizontal branch to file icon */}
                  {!isRoot && (
                    <span
                      style={{
                        left: `${depth * 14 + 12}px`,
                        width: '7px',
                      }}
                      className="absolute top-[14px] h-[1px] bg-[#3a3a3d] group-hover:bg-[#505054] transition-colors pointer-events-none"
                    />
                  )}

                  <button
                    onClick={() => onSelectDoc(child.id)}
                    style={{ paddingLeft: `${indent}px` }}
                    className={`w-full flex items-center gap-2 py-1 text-xs text-left transition-colors select-none ${
                      isSelected
                        ? 'bg-[#37373d] text-white font-medium'
                        : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                    }`}
                    title={child.title}
                  >
                    <MarkdownFileIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{child.fileName}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render Table of Contents items without any '#' symbols
  const renderTocItems = (headings: HeadingItem[]) => {
    if (headings.length === 0) {
      return (
        <div className="px-4 py-3 text-xs text-[#858585] italic">
          No headings in this document
        </div>
      );
    }

    return (
      <div className="py-1">
        {headings.map((h) => {
          const isActive = activeHeadingId === h.id;
          const indent = h.level === 1 ? 12 : h.level === 2 ? 22 : 32;

          return (
            <button
              key={h.id}
              ref={isActive ? activeTocRef : null}
              onClick={() => onSelectHeading(h.id)}
              style={{ paddingLeft: `${indent}px` }}
              className={`w-full py-1 pr-3 text-left text-xs transition-colors select-none truncate block ${
                isActive
                  ? 'bg-[#04395e] text-[#ffffff] font-medium'
                  : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
              }`}
              title={h.text}
            >
              <span className="truncate">{h.text}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="relative shrink-0 bg-[#252526] border-r border-[#2d2d2d] flex flex-col h-full select-none overflow-hidden"
    >
      {/* Search Tab View */}
      {activeTab === 'search' && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-[#2d2d2d]">
            Search
          </div>
          <div className="p-3 border-b border-[#2d2d2d]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#858585]" />
              <input
                type="text"
                placeholder="Search text in docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded bg-[#1e1e1e] border border-[#3e3e42] pl-8 pr-2 py-1 text-xs text-[#cccccc] placeholder-[#666666] focus:border-[#007acc] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {docs
              .filter(
                (d) =>
                  !searchQuery ||
                  d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="w-full text-left p-2 rounded hover:bg-[#2a2d2e] text-xs text-[#cccccc] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MarkdownFileIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-white truncate">{doc.title}</span>
                  </div>
                  <div className="text-[10px] text-[#858585] font-mono mt-0.5 pl-5.5">{doc.relativePath}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Table of Contents Tab View (Dedicated) */}
      {activeTab === 'outline' && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-[#2d2d2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTree className="h-3.5 w-3.5 text-[#4fc1ff]" />
              <span>Table of Contents</span>
              {currentDoc && (
                <span className="text-[10px] text-[#858585] font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">
                  {currentDoc.headings.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {currentDoc ? (
              renderTocItems(currentDoc.headings)
            ) : (
              <div className="p-4 text-xs text-[#858585]">No document selected</div>
            )}
          </div>
        </div>
      )}

      {/* Explorer Tab View (Files Tree + Table of Contents at bottom) */}
      {activeTab === 'explorer' && (
        <div ref={explorerRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] border-b border-[#2d2d2d] shrink-0">
            Explorer: Documentation
          </div>

          {/* File Tree Section — height controlled by fileTreeFraction */}
          <div
            style={{ flex: `0 0 ${fileTreeFraction * 100}%` }}
            className="overflow-y-auto py-2 min-h-0"
          >
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#858585] flex items-center gap-1.5">
              <ChevronDown className="h-3 w-3" />
              <span>WORKSPACE DOCS</span>
            </div>
            {renderTree(folderTree)}
          </div>

          {/* Draggable horizontal divider between File Tree and TOC */}
          <div
            onMouseDown={handleTocDragStart}
            onDoubleClick={handleResetTocHeight}
            className={`shrink-0 h-[5px] cursor-row-resize transition-colors border-t border-b border-[#2d2d2d] ${
              isTocDragging ? 'bg-[#007acc]' : 'bg-[#1f1f1f] hover:bg-[#007acc]/70'
            }`}
            title="Drag to resize sections (double-click to reset)"
          />

          {/* Table of Contents Section — takes the rest */}
          <div
            style={{ flex: `0 0 ${(1 - fileTreeFraction) * 100}%` }}
            className="flex flex-col min-h-0"
          >
            {/* TOC Header with Count Side-by-Side */}
            <div className="w-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb] bg-[#1f1f1f] border-b border-[#2d2d2d] flex items-center justify-between hover:bg-[#252526] transition-colors select-none shrink-0">
              <button
                onClick={() => setIsTocOpen((o) => !o)}
                className="flex items-center gap-1.5 text-left flex-1"
                title={isTocOpen ? "Collapse section" : "Expand section"}
              >
                {isTocOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#858585] shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#858585] shrink-0" />
                )}
                <span>Table of Contents</span>
                {currentDoc && (
                  <span className="text-[10px] text-[#9cdcfe] font-normal font-mono bg-[#181818] px-1.5 py-0.5 rounded border border-[#333333] ml-1">
                    {currentDoc.headings.length}
                  </span>
                )}
              </button>
            </div>

            {/* TOC Items Container */}
            {isTocOpen && (
              <div className="flex-1 overflow-y-auto py-1 bg-[#202021] scroll-smooth min-h-0">
                {currentDoc ? (
                  renderTocItems(currentDoc.headings)
                ) : (
                  <div className="px-4 py-2 text-xs text-[#858585]">Select a document</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draggable Resizer Bar on the right border */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleResetWidth}
        className={`absolute top-0 right-0 bottom-0 w-[5px] cursor-col-resize transition-colors z-30 ${
          isDragging ? 'bg-[#007acc]' : 'hover:bg-[#007acc]/70'
        }`}
        title="Drag to resize sidebar (double-click to reset)"
      />
    </aside>
  );
};
