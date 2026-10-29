import React, { useEffect, useState } from 'react';
import { HeadingItem } from '../types.ts';
import { AlignLeft } from 'lucide-react';

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const el = document.getElementById(heading.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(heading.id);
          return;
        }
      }

      setActiveId(headings[0].id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-8">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 text-xs">
        <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#8b949e] mb-3">
          <AlignLeft className="h-3.5 w-3.5" />
          <span>On this page</span>
        </div>
        <nav className="space-y-1 border-l border-[#30363d]/60">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`block py-1 transition-colors border-l-2 -ml-[2px] ${
                  heading.level === 1
                    ? 'pl-3 font-medium'
                    : heading.level === 2
                    ? 'pl-5 text-[11.5px]'
                    : 'pl-7 text-[11px] text-[#8b949e]'
                } ${
                  isActive
                    ? 'border-[#58a6ff] text-[#58a6ff] font-semibold'
                    : 'border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e]'
                }`}
              >
                {heading.text}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

