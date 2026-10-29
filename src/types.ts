export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface DocItem {
  id: string;
  title: string;
  fileName: string;
  folder: string;
  relativePath: string;
  content: string;
  headings: HeadingItem[];
  isFolder?: false;
}

export interface FolderNode {
  name: string;
  displayName?: string;
  fullPath: string;
  isFolder: true;
  children: (FolderNode | DocItem)[];
}

export type FileSystemNode = FolderNode | DocItem;
