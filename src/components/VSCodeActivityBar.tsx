import React from 'react';
import { Files, ListTree, Search, PanelLeftClose, PanelLeft, Settings } from 'lucide-react';

export type ActivityTab = 'explorer' | 'outline' | 'search';

interface VSCodeActivityBarProps {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
}

export const VSCodeActivityBar: React.FC<VSCodeActivityBarProps> = ({
  activeTab,
  onTabChange,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSettings,
}) => {
  return (
    <div className="w-12 shrink-0 bg-[#181818] border-r border-[#2d2d2d] flex flex-col justify-between items-center py-2 select-none z-20">
      {/* Top tabs */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          onClick={() => {
            if (!isSidebarOpen) onToggleSidebar();
            onTabChange('explorer');
          }}
          className={`relative w-12 h-11 flex items-center justify-center transition-colors ${
            isSidebarOpen && activeTab === 'explorer'
              ? 'text-white'
              : 'text-[#858585] hover:text-[#cccccc]'
          }`}
          title="Explorer (Files & Folders)"
        >
          {isSidebarOpen && activeTab === 'explorer' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ffffff]" />
          )}
          <Files className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => {
            if (!isSidebarOpen) onToggleSidebar();
            onTabChange('outline');
          }}
          className={`relative w-12 h-11 flex items-center justify-center transition-colors ${
            isSidebarOpen && activeTab === 'outline'
              ? 'text-white'
              : 'text-[#858585] hover:text-[#cccccc]'
          }`}
          title="Table of Contents"
        >
          {isSidebarOpen && activeTab === 'outline' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ffffff]" />
          )}
          <ListTree className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => {
            if (!isSidebarOpen) onToggleSidebar();
            onTabChange('search');
          }}
          className={`relative w-12 h-11 flex items-center justify-center transition-colors ${
            isSidebarOpen && activeTab === 'search'
              ? 'text-white'
              : 'text-[#858585] hover:text-[#cccccc]'
          }`}
          title="Search in Documentation"
        >
          {isSidebarOpen && activeTab === 'search' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ffffff]" />
          )}
          <Search className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Bottom controls: Settings (MCP) & Sidebar Toggle */}
      <div className="flex flex-col items-center gap-1 w-full pb-1">
        <button
          onClick={onOpenSettings}
          className="w-12 h-10 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
          title="Settings & Model Context Protocol (MCP)"
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <button
          onClick={onToggleSidebar}
          className="w-12 h-10 flex items-center justify-center text-[#858585] hover:text-[#cccccc] transition-colors"
          title={isSidebarOpen ? 'Hide Primary Side Bar' : 'Show Primary Side Bar'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
};
