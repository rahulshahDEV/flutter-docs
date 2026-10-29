import { DocItem, FolderNode, HeadingItem } from '../types.ts';
import { slugify } from './slugify.ts';

// Vite eager glob import for markdown files in /docs and all subdirectories
const rawDocs = import.meta.glob('/docs/**/*.md', {
  query: '?raw',
  eager: true,
  import: 'default',
}) as Record<string, string>;

function formatFolderName(name: string): string {
  const lower = name.toLowerCase();
  if (lower === 'ci-cd' || lower === 'cicd' || lower === 'ci_cd') {
    return 'CI/CD';
  }
  if (lower === 'auth' || lower === 'authentication') {
    return 'Authentication';
  }
  if (lower === 'guides' || lower === 'guide') {
    return 'Guides';
  }
  if (lower === 'notifications' || lower === 'notification') {
    return 'Notifications';
  }
  if (lower === 'packages' || lower === 'package') {
    return 'Packages';
  }
  if (lower === 'skills' || lower === 'skill') {
    return 'Skills';
  }
  if (lower === 'monitoring' || lower === 'error-monitoring') {
    return 'Monitoring';
  }
  if (lower === 'analytics') {
    return 'Analytics';
  }
  if (lower === 'chat') {
    return 'Chat & E2E';
  }
  if (lower === 'git' || lower === 'github' || lower === 'git & github' || lower === 'git-github') {
    return 'Git & GitHub';
  }
  if (lower === 'social' || lower === 'social-media' || lower === 'social_media') {
    return 'Social Media';
  }
  if (lower === 'upgrader' || lower === 'in-app-update' || lower === 'inapp-update' || lower === 'inapp_update' || lower === 'in_app_update') {
    return 'In-App Updates';
  }
  return name;
}

function extractHeadings(content: string): { title: string; headings: HeadingItem[] } {
  const lines = content.split('\n');
  let docTitle = '';
  const headings: HeadingItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track fenced code blocks (``` or ~~~) so we never parse comments inside code as headings
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    // Match markdown ATX headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const rawText = headingMatch[2].trim();

      // Clean inline markdown formatting from heading text for display
      const cleanText = rawText
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .trim();

      // Filter out pure divider / decorative symbols (like === or --- or ***)
      // Must contain at least one alphanumeric character
      if (!cleanText || /^[-=_*~]{3,}$/.test(cleanText) || !/[a-zA-Z0-9]/.test(cleanText)) {
        continue;
      }

      if (level === 1 && !docTitle) {
        docTitle = cleanText;
      }

      headings.push({
        id: slugify(cleanText),
        text: cleanText,
        level,
      });
    }
  }

  return { title: docTitle, headings };
}

export function loadAllDocs(): { docs: DocItem[]; tree: FolderNode } {
  const docs: DocItem[] = [];
  const rootTree: FolderNode = {
    name: 'docs',
    displayName: 'WORKSPACE DOCS',
    fullPath: 'docs',
    isFolder: true,
    children: [],
  };

  for (const [rawPath, rawContent] of Object.entries(rawDocs)) {
    // rawPath is e.g. "/docs/CI-CD/codemagic.md"
    const rel = rawPath.replace(/^\/docs\//, '');
    const segments = rel.split('/');
    const fileName = segments[segments.length - 1];
    const rawFolder = segments.length > 1 ? segments.slice(0, -1).join('/') : '';
    const folder = formatFolderName(rawFolder);
    const id = rel.replace(/\.md$/, '');
    const { title: extractedTitle, headings } = extractHeadings(rawContent);

    const title =
      extractedTitle ||
      fileName
        .replace(/\.md$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const docItem: DocItem = {
      id,
      title,
      fileName,
      folder,
      relativePath: rel,
      content: rawContent,
      headings,
      isFolder: false,
    };

    docs.push(docItem);

    // Insert into FolderTree
    let currentFolder = rootTree;
    for (let i = 0; i < segments.length - 1; i++) {
      const folderName = segments[i];
      let existing = currentFolder.children.find(
        (c) => c.isFolder && c.name === folderName
      ) as FolderNode | undefined;

      if (!existing) {
        existing = {
          name: folderName,
          displayName: formatFolderName(folderName),
          fullPath: segments.slice(0, i + 1).join('/'),
          isFolder: true,
          children: [],
        };
        currentFolder.children.push(existing);
      }
      currentFolder = existing;
    }
    currentFolder.children.push(docItem);
  }

  // Priority order for folders (Guides MUST be at very top)
  const folderPriority: Record<string, number> = {
    guides: 1,
    guide: 1,
    skills: 2,
    skill: 2,
    packages: 3,
    package: 3,
    git: 4,
    github: 4,
    'git & github': 4,
    auth: 5,
    social: 6,
    'social-media': 6,
    'social_media': 6,
    chat: 7,
    notifications: 8,
    notification: 8,
    monitoring: 9,
    analytics: 10,
    upgrader: 11,
    'in-app-update': 11,
    'inapp-update': 11,
    'inapp_update': 11,
    'in_app_update': 11,
    'ci-cd': 12,
    'ci/cd': 12,
  };

  function sortTree(node: FolderNode) {
    node.children.sort((a, b) => {
      // Folders come before files
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      if (a.isFolder && b.isFolder) {
        const pA = folderPriority[a.name.toLowerCase()] ?? 99;
        const pB = folderPriority[b.name.toLowerCase()] ?? 99;
        if (pA !== pB) return pA - pB;
        const nameA = a.displayName || a.name;
        const nameB = b.displayName || b.name;
        return nameA.localeCompare(nameB);
      }

      // Both are files: sort alphabetically by title / fileName
      const docA = a as DocItem;
      const docB = b as DocItem;
      return docA.fileName.localeCompare(docB.fileName);
    });

    for (const child of node.children) {
      if (child.isFolder) {
        sortTree(child as FolderNode);
      }
    }
  }

  sortTree(rootTree);

  // Sort docs list
  docs.sort((a, b) => {
    const folderA = a.folder.toLowerCase();
    const folderB = b.folder.toLowerCase();
    const pA = folderPriority[folderA] ?? 99;
    const pB = folderPriority[folderB] ?? 99;
    if (pA !== pB) return pA - pB;
    return a.relativePath.localeCompare(b.relativePath);
  });

  return { docs, tree: rootTree };
}
