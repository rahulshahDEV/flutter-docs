import React, { useEffect, useState, useRef, useCallback } from 'react';
import { loadAllDocs } from './utils/docsLoader.ts';
import { DocItem, FolderNode } from './types.ts';
import { VSCodeActivityBar, ActivityTab } from './components/VSCodeActivityBar.tsx';
import { VSCodeSidebar } from './components/VSCodeSidebar.tsx';
import { VSCodeTabBar } from './components/VSCodeTabBar.tsx';
import { VSCodeQuickOpen } from './components/VSCodeQuickOpen.tsx';
import { VSCodeSettingsModal } from './components/VSCodeSettingsModal.tsx';
import { MarkdownRenderer } from './components/MarkdownRenderer.tsx';
import { BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [folderTree, setFolderTree] = useState<FolderNode>({
    name: 'docs',
    fullPath: 'docs',
    isFolder: true,
    children: [],
  });
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [openDocIds, setOpenDocIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActivityTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Load docs on mount
  useEffect(() => {
    const { docs: loadedDocs, tree } = loadAllDocs();
    setDocs(loadedDocs);
    setFolderTree(tree);

    const hash = window.location.hash;
    const match = hash.match(/#\/doc\/([^?#]+)/);
    const initialId = match ? match[1] : '';

    const targetDoc =
      (initialId && loadedDocs.find((d) => d.id === initialId)) ||
      loadedDocs.find((d) => d.id.includes('codemagic')) ||
      loadedDocs[0];

    if (targetDoc) {
      setSelectedDocId(targetDoc.id);
      setOpenDocIds([targetDoc.id]);
      window.location.hash = `#/doc/${targetDoc.id}`;
    }
  }, []);

  // Listen to hash changes for browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/doc\/([^?#]+)/);
      if (match && match[1]) {
        setSelectedDocId(match[1]);
        if (!openDocIds.includes(match[1])) {
          setOpenDocIds((prev) => [...prev, match[1]]);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [openDocIds]);

  const currentDoc = docs.find((d) => d.id === selectedDocId);
  const openDocs = docs.filter((d) => openDocIds.includes(d.id));

  // Select document
  const handleSelectDoc = useCallback(
    (id: string) => {
      setSelectedDocId(id);
      if (!openDocIds.includes(id)) {
        setOpenDocIds((prev) => [...prev, id]);
      }
      window.location.hash = `#/doc/${id}`;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    [openDocIds]
  );

  // Close specific document
  const handleCloseDoc = useCallback(
    (idToClose: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      setOpenDocIds((prev) => {
        const next = prev.filter((id) => id !== idToClose);

        if (idToClose === selectedDocId) {
          if (next.length > 0) {
            const nextDocId = next[next.length - 1];
            setSelectedDocId(nextDocId);
            window.location.hash = `#/doc/${nextDocId}`;
          } else {
            const fallback = docs[0]?.id || '';
            setSelectedDocId(fallback);
            window.location.hash = fallback ? `#/doc/${fallback}` : '';
            return fallback ? [fallback] : [];
          }
        }
        return next;
      });
    },
    [selectedDocId, docs]
  );

  // Close all other documents except current (Ctrl+W)
  const handleCloseOthers = useCallback(
    (keepId?: string) => {
      const targetId = keepId || selectedDocId;
      if (!targetId) return;
      setSelectedDocId(targetId);
      setOpenDocIds([targetId]);
      window.location.hash = `#/doc/${targetId}`;
    },
    [selectedDocId]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+P or Ctrl+P: Find file
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsQuickOpen((prev) => !prev);
      }

      // Cmd+, or Ctrl+,: Open Settings & MCP
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }

      // Ctrl+W: Close all except current open one
      if (e.ctrlKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseOthers();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseOthers]);

  // Robust Viewport-Based Scroll Spy
  // Handles large diagrams and code blocks without stutter or layout shifts
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !currentDoc) return;

    const onScroll = () => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      window.requestAnimationFrame(() => {
        const headings = currentDoc.headings;
        if (!headings || headings.length === 0) {
          isScrollingRef.current = false;
          return;
        }

        const viewportTop = container.getBoundingClientRect().top;
        const activationThreshold = viewportTop + 140; // 140px offset below header

        let currentActive = headings[0].id;

        for (let i = 0; i < headings.length; i++) {
          const el = document.getElementById(headings[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= activationThreshold) {
              currentActive = headings[i].id;
            } else {
              break;
            }
          }
        }

        setActiveHeadingId((prev) => (prev !== currentActive ? currentActive : prev));
        isScrollingRef.current = false;
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    // Initial calculation
    onScroll();

    return () => container.removeEventListener('scroll', onScroll);
  }, [currentDoc]);

  const handleSelectHeading = (headingId: string) => {
    const el = document.getElementById(headingId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(headingId);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex overflow-hidden antialiased select-none selection:bg-[#264f78] selection:text-white">
      {/* Activity Bar (Far Left 48px) */}
      <VSCodeActivityBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Primary Sidebar (Explorer Tree + Left Table of Contents) */}
      {isSidebarOpen && (
        <VSCodeSidebar
          activeTab={activeTab}
          docs={docs}
          folderTree={folderTree}
          selectedDocId={selectedDocId}
          onSelectDoc={handleSelectDoc}
          activeHeadingId={activeHeadingId}
          onSelectHeading={handleSelectHeading}
        />
      )}

      {/* Main Editor View */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] overflow-hidden">
        {/* Top Tabs & Clean Breadcrumbs Bar */}
        <VSCodeTabBar
          currentDoc={currentDoc}
          openDocs={openDocs.length > 0 ? openDocs : currentDoc ? [currentDoc] : []}
          onSelectDoc={handleSelectDoc}
          onCloseDoc={handleCloseDoc}
          onCloseOthers={handleCloseOthers}
          onOpenQuickOpen={() => setIsQuickOpen(true)}
        />

        {/* Clean, Non-Cluttered Document Body with Strict Overflow Control */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-3 py-8 bg-[#1e1e1e] select-text overscroll-contain"
        >
          <div className="max-w-5xl mx-auto w-full min-w-0 pb-32">
            {currentDoc ? (
              <article className="w-full min-w-0">
                <MarkdownRenderer content={currentDoc.content} />
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-[#858585]">
                <BookOpen className="h-10 w-10 mb-2 text-[#555555]" />
                <div className="text-xs">No file open. Press ⌘P to open a file.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VS Code Quick Open (⌘P / Ctrl+P) Modal */}
      <VSCodeQuickOpen
        isOpen={isQuickOpen}
        onClose={() => setIsQuickOpen(false)}
        docs={docs}
        onSelectDoc={handleSelectDoc}
      />

      {/* VS Code Settings & MCP Server Configuration Modal */}
      <VSCodeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
