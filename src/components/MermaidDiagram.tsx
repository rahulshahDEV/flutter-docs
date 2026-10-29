import React, { useEffect, useRef, useState, memo } from 'react';
import mermaid from 'mermaid';
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

// Module-level cache to eliminate blank flashes/flickering completely
const svgCache = new Map<string, string>();

// Simple fast string hash for deterministic DOM IDs
function getChartHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Initialize mermaid once at module level with Antigravity dark theme tokens
let isMermaidInitialized = false;
function ensureMermaidInit() {
  if (isMermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      darkMode: true,
      background: '#18181a',
      mainBkg: '#212124',
      nodeBorder: '#3f3f46',
      nodeTextColor: '#f4f4f5',
      actorBkg: '#212124',
      actorBorder: '#3f3f46',
      actorTextColor: '#f4f4f5',
      actorLineColor: '#71717a',
      signalColor: '#71717a',
      signalTextColor: '#f4f4f5',
      labelBoxBkgColor: '#27272a',
      labelBoxBorderColor: '#3f3f46',
      labelTextColor: '#f4f4f5',
      loopTextColor: '#f4f4f5',
      noteBorderColor: '#3f3f46',
      noteBkgColor: '#212124',
      noteTextColor: '#f4f4f5',
      activationBorderColor: '#52525b',
      activationBkgColor: '#3f3f46',
      sequenceNumberColor: '#18181a',
      primaryColor: '#212124',
      primaryTextColor: '#f4f4f5',
      primaryBorderColor: '#3f3f46',
      lineColor: '#71717a',
      secondaryColor: '#27272a',
      tertiaryColor: '#18181a',
      clusterBkg: '#18181a',
      clusterBorder: '#3f3f46',
      titleColor: '#e4e4e7',
      edgeLabelBackground: '#18181a',
      fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
    },
    securityLevel: 'loose',
    flowchart: {
      padding: 16,
      nodeSpacing: 35,
      rankSpacing: 45,
      htmlLabels: true,
      useMaxWidth: false,
    },
  });
  isMermaidInitialized = true;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = memo(({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>(() => svgCache.get(chart) || '');
  const [error, setError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (svgCache.has(chart)) {
      setSvgContent(svgCache.get(chart)!);
      return;
    }

    ensureMermaidInit();
    const id = `mermaid-${getChartHash(chart)}`;

    let isCancelled = false;

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (!isCancelled) {
          svgCache.set(chart, svg);
          setSvgContent(svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Mermaid rendering failed:', err);
          setError('Failed to render diagram');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [chart]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-red-900/50 bg-[#18181a] p-4 text-xs font-mono text-red-400">
        <p className="font-semibold">{error}</p>
        <pre className="mt-2 overflow-x-auto text-[11px] text-red-300">{chart}</pre>
      </div>
    );
  }

  return (
    <>
      {/* Antigravity Diagram Card */}
      <div className="group relative my-8 w-full rounded-2xl border border-[#27272a] bg-[#18181a] p-4 sm:p-7 shadow-xl transition-all">
        {/* Floating Top Action Bar (Antigravity Style) */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setZoomLevel(1);
              setIsLightboxOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#27272a]/90 hover:bg-[#323236] border border-[#3f3f46] px-2.5 py-1 text-xs text-[#d4d4d8] hover:text-white transition-colors backdrop-blur-sm"
            title="Open large diagram view"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="text-[11px]">Expand</span>
          </button>
        </div>

        {/* Diagram SVG Wrapper */}
        <div
          ref={containerRef}
          onClick={() => {
            setZoomLevel(1);
            setIsLightboxOpen(true);
          }}
          className="mermaid-wrapper flex justify-center overflow-x-auto w-full py-2 cursor-zoom-in [&_svg]:max-w-full [&_svg]:h-auto select-none"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          title="Click to expand diagram"
        />
      </div>

      {/* Fullscreen Lightbox Modal (Exact Antigravity Expanded View) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-6xl max-h-[92vh] rounded-2xl border border-[#27272a] bg-[#18181a] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27272a] bg-[#1d1d20] px-4 py-3 select-none">
              <span className="text-xs font-semibold text-[#e4e4e7] uppercase tracking-wider">
                Architecture Diagram
              </span>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-[#27272a] rounded-lg p-0.5 border border-[#3f3f46]">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-[#323236] transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-[#d4d4d8] px-1.5 select-none">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                    className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-[#323236] transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 rounded text-[#a1a1aa] hover:text-white hover:bg-[#323236] transition-colors ml-0.5"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="rounded-lg bg-[#27272a] hover:bg-red-500/20 hover:text-red-400 border border-[#3f3f46] p-1.5 text-[#a1a1aa] transition-colors"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Diagram Body */}
            <div className="flex-1 overflow-auto p-6 sm:p-10 flex items-center justify-center bg-[#141416]">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="transition-transform duration-100 flex items-center justify-center w-full min-h-[400px] [&_svg]:max-w-none"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});
