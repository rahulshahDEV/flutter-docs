import React, { useState, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markdown';
import { Copy, Check } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram.tsx';
import { slugify } from '../utils/slugify.ts';

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock: React.FC<{ language: string; value: string }> = memo(({ language, value }) => {
  const [copied, setCopied] = useState(false);

  if (language === 'mermaid') {
    return <MermaidDiagram chart={value} />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let highlighted = value;
  const grammar = Prism.languages[language] || Prism.languages.bash;
  if (grammar) {
    try {
      highlighted = Prism.highlight(value, grammar, language);
    } catch {
      highlighted = value;
    }
  }

  return (
    <div className="group relative my-4 w-full max-w-full overflow-hidden rounded-lg border border-[#333333] bg-[#181818] text-sm shadow-sm">
      <div className="flex items-center justify-between border-b border-[#2d2d2d] bg-[#1f1f1f] px-3.5 py-1.5 text-xs font-mono text-[#888888] select-none">
        <span className="text-[#9cdcfe]">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="rounded p-1 text-[#888888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="overflow-x-auto w-full max-w-full p-4 text-[13px] leading-relaxed font-mono">
        <pre className="!bg-transparent !p-0 !m-0 whitespace-pre">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
});

// Helper to recursively extract plain text from React children tree
function getNodeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join('');
  }
  if (node.props && node.props.children) {
    return getNodeText(node.props.children);
  }
  return '';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ content }) => {
  const components = useMemo(
    () => ({
      h1: ({ children }: any) => {
        const text = getNodeText(children).trim();
        const id = slugify(text);
        return (
          <h1
            id={id}
            className="mt-8 mb-5 pb-2 text-[26px] font-bold text-[#ffffff] border-b border-[#333333] tracking-tight"
          >
            {children}
          </h1>
        );
      },
      h2: ({ children }: any) => {
        const text = getNodeText(children).trim();
        const id = slugify(text);
        return (
          <h2
            id={id}
            className="mt-8 mb-4 text-[20px] font-bold text-[#ffffff] tracking-tight scroll-mt-6"
          >
            {children}
          </h2>
        );
      },
      h3: ({ children }: any) => {
        const text = getNodeText(children).trim();
        const id = slugify(text);
        return (
          <h3 id={id} className="mt-6 mb-3 text-[16px] font-semibold text-[#ffffff] scroll-mt-6">
            {children}
          </h3>
        );
      },
      h4: ({ children }: any) => {
        return <h4 className="mt-4 mb-2 text-[14px] font-semibold text-[#e0e0e0]">{children}</h4>;
      },
      p: ({ children }: any) => <p className="my-3 leading-7 text-[#cccccc] break-words">{children}</p>,
      strong: ({ children }: any) => <strong className="font-semibold text-[#ffffff]">{children}</strong>,
      ul: ({ children }: any) => <ul className="my-3 ml-6 list-disc space-y-1.5 text-[#cccccc]">{children}</ul>,
      ol: ({ children }: any) => <ol className="my-3 ml-6 list-decimal space-y-1.5 text-[#cccccc]">{children}</ol>,
      li: ({ children }: any) => <li className="leading-7 break-words">{children}</li>,
      hr: () => <hr className="my-8 border-t border-[#333333]" />,
      a: ({ href, children }: any) => {
        const isExternal = href?.startsWith('http');
        return (
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-[#4fc1ff] hover:underline underline-offset-2 transition-colors break-words"
          >
            {children}
          </a>
        );
      },
      table: ({ children }: any) => (
        <div className="my-6 w-full max-w-full overflow-x-auto rounded-lg border border-[#333333] bg-[#181818] shadow-sm">
          <table className="min-w-full divide-y divide-[#333333] text-left text-sm text-[#cccccc]">{children}</table>
        </div>
      ),
      thead: ({ children }: any) => <thead className="bg-[#1f1f1f] text-[#ffffff] font-semibold">{children}</thead>,
      tbody: ({ children }: any) => <tbody className="divide-y divide-[#2a2a2a]">{children}</tbody>,
      tr: ({ children }: any) => <tr className="hover:bg-[#252526]/50 transition-colors">{children}</tr>,
      th: ({ children }: any) => (
        <th className="px-4 py-2.5 font-semibold text-xs tracking-wider uppercase text-[#888888]">{children}</th>
      ),
      td: ({ children }: any) => <td className="px-4 py-2.5 text-xs">{children}</td>,
      blockquote: ({ children }: any) => {
        const rawText = React.Children.toArray(children)
          .map((c) => (React.isValidElement(c) && (c.props as any)?.children ? (c.props as any).children : ''))
          .flat()
          .join(' ');

        const alertMatch = rawText.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

        if (alertMatch) {
          const type = alertMatch[1].toUpperCase();

          const cleanChildren = React.Children.map(children, (child) => {
            if (React.isValidElement(child) && (child.props as any)?.children) {
              const pChildren = (child.props as any).children;
              if (typeof pChildren === 'string') {
                return React.cloneElement(child, {
                  ...(child.props as any),
                  children: pChildren.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim(),
                });
              }
              if (Array.isArray(pChildren) && typeof pChildren[0] === 'string') {
                const newArr = [...pChildren];
                newArr[0] = newArr[0].replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();
                return React.cloneElement(child, {
                  ...(child.props as any),
                  children: newArr,
                });
              }
            }
            return child;
          });

          const alertStyle = {
            NOTE: {
              borderColor: 'border-l-[#3794ff]',
              titleColor: 'text-[#3794ff]',
              title: 'NOTE',
            },
            TIP: {
              borderColor: 'border-l-[#4ec9b0]',
              titleColor: 'text-[#4ec9b0]',
              title: 'TIP',
            },
            IMPORTANT: {
              borderColor: 'border-l-[#a855f7]',
              titleColor: 'text-[#c586c0]',
              title: 'IMPORTANT',
            },
            WARNING: {
              borderColor: 'border-l-[#cca700]',
              titleColor: 'text-[#dcdcaa]',
              title: 'WARNING',
            },
            CAUTION: {
              borderColor: 'border-l-[#f14c4c]',
              titleColor: 'text-[#f14c4c]',
              title: 'CAUTION',
            },
          }[type] || {
            borderColor: 'border-l-[#3794ff]',
            titleColor: 'text-[#3794ff]',
            title: 'NOTE',
          };

          return (
            <div
              className={`my-4 border-l-[3px] ${alertStyle.borderColor} bg-[#1e1e1e] rounded-r py-3 px-4 shadow-sm w-full max-w-full`}
            >
              <div className={`text-[12px] font-bold tracking-wider mb-1 uppercase ${alertStyle.titleColor}`}>
                {alertStyle.title}
              </div>
              <div className="text-[13px] text-[#cccccc] leading-relaxed [&>p]:my-1">{cleanChildren}</div>
            </div>
          );
        }

        return (
          <blockquote className="my-4 border-l-2 border-[#555555] pl-4 italic text-[#888888] [&>p]:my-1">
            {children}
          </blockquote>
        );
      },
      code: ({ className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match && !String(children).includes('\n');

        if (isInline) {
          return (
            <code
              className="rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[12px] font-mono text-[#dcdcaa] border border-[#3e3e42] break-all inline-block align-middle my-0.5"
              {...props}
            >
              {children}
            </code>
          );
        }

        return <CodeBlock language={match ? match[1] : ''} value={String(children).replace(/\n$/, '')} />;
      },
    }),
    []
  );

  return (
    <div className="markdown-body w-full max-w-full min-w-0 text-[#cccccc] leading-relaxed space-y-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
