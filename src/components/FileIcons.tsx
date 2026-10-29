import React from 'react';

interface FolderIconProps {
  isOpen: boolean;
  folderName?: string;
  className?: string;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
  isOpen,
  folderName = '',
  className = 'h-4 w-4 shrink-0',
}) => {
  const name = folderName.toLowerCase();
  const isCi = name.includes('ci') || name.includes('cd') || name.includes('workflow');
  const isGuide = name.includes('guide') || name.includes('doc') || name.includes('book');
  const isAuth = name.includes('auth') || name.includes('login') || name.includes('security');
  const isPkg = name.includes('package') || name.includes('plugin');
  const isSkill = name.includes('skill');
  const isMonitoring = name.includes('monitor') || name.includes('sentry') || name.includes('crash');
  const isAnalytics = name.includes('analytic') || name.includes('amplitude');
  const isChat = name.includes('chat') || name.includes('e2e') || name.includes('crypto');
  const isUpgrader = name.includes('upgrad') || name.includes('update');
  const isNotification = name.includes('notif');
  const isSocial = name.includes('social') || name.includes('feed') || name.includes('reel');
  const isGit = name.includes('git') || name.includes('github') || name.includes('version');

  // Palette customization by folder purpose
  const backColor = isGuide
    ? '#059669'
    : isSkill
    ? '#9333ea'
    : isPkg
    ? '#b45309'
    : isGit
    ? '#c2410c'
    : isAuth
    ? '#7c3aed'
    : isSocial
    ? '#e11d48'
    : isChat
    ? '#4338ca'
    : isNotification
    ? '#ea580c'
    : isMonitoring
    ? '#dc2626'
    : isAnalytics
    ? '#0284c7'
    : isUpgrader
    ? '#0d9488'
    : isCi
    ? '#2563eb'
    : '#c99a4e';

  const frontColor = isGuide
    ? '#10b981'
    : isSkill
    ? '#c084fc'
    : isPkg
    ? '#f59e0b'
    : isGit
    ? '#f97316'
    : isAuth
    ? '#8b5cf6'
    : isSocial
    ? '#f43f5e'
    : isChat
    ? '#6366f1'
    : isNotification
    ? '#f97316'
    : isMonitoring
    ? '#ef4444'
    : isAnalytics
    ? '#0ea5e9'
    : isUpgrader
    ? '#14b8a6'
    : isCi
    ? '#3b82f6'
    : '#e5bb7e';

  const paperColor = isGuide
    ? '#a7f3d0'
    : isSkill
    ? '#f3e8ff'
    : isPkg
    ? '#fde68a'
    : isGit
    ? '#ffedd5'
    : isAuth
    ? '#ddd6fe'
    : isSocial
    ? '#ffe4e6'
    : isChat
    ? '#e0e7ff'
    : isNotification
    ? '#ffedd5'
    : isMonitoring
    ? '#fee2e2'
    : isAnalytics
    ? '#e0f2fe'
    : isUpgrader
    ? '#ccfbf1'
    : isCi
    ? '#93c5fd'
    : '#ffffff';

  if (isOpen) {
    return (
      <svg
        viewBox="0 0 16 16"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Folder back */}
        <path
          d="M1.5 2.8A1.3 1.3 0 0 0 .2 4.1v7.8a1.3 1.3 0 0 0 1.3 1.3h13a1.3 1.3 0 0 0 1.3-1.3V5.4a1.3 1.3 0 0 0-1.3-1.3H7.6l-.8-.8a1.3 1.3 0 0 0-.9-.5H1.5z"
          fill={backColor}
        />
        {/* Inner paper sheet */}
        <rect x="2.5" y="4.2" width="10.5" height="4.8" rx="0.5" fill={paperColor} opacity="0.9" />
        {/* Open front flap */}
        <path
          d="M15.4 6.7a.9.9 0 0 0-.8-.6H3.1a.9.9 0 0 0-.9.7l-1.3 5.4a1.2 1.2 0 0 0 1.2 1.5h11.9a1.2 1.2 0 0 0 1.2-1.5L15.4 6.7z"
          fill={frontColor}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5 4H7.6l-.8-.8a1.3 1.3 0 0 0-.9-.5H1.5A1.3 1.3 0 0 0 .2 4v8a1.3 1.3 0 0 0 1.3 1.3h13a1.3 1.3 0 0 0 1.3-1.3V5.3A1.3 1.3 0 0 0 14.5 4z"
        fill={frontColor}
      />
      {/* Subtle folder tab shading */}
      <path
        d="M1.5 2.7h4.4a1.3 1.3 0 0 1 .9.5l.8.8H14.5a1.3 1.3 0 0 1 1.3 1.3v.5a1.3 1.3 0 0 0-1.3-1.3H7.6l-.8-.8a1.3 1.3 0 0 0-.9-.5H1.5A1.3 1.3 0 0 0 .2 4.5v-.5c0-.7.6-1.3 1.3-1.3z"
        fill={backColor}
        opacity="0.6"
      />
    </svg>
  );
};

export const MarkdownFileIcon: React.FC<{ className?: string }> = ({
  className = 'h-3.5 w-3.5 shrink-0',
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Markdown</title>
      {/* Document page silhouette */}
      <path
        d="M2.5 1.5A1 1 0 0 1 3.5.5h6.293a1 1 0 0 1 .707.293l2.707 2.707a1 1 0 0 1 .293.707V14.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-13z"
        fill="#519aba"
      />
      {/* Corner fold */}
      <path
        d="M9.5.5v3a1 1 0 0 0 1 1h3L9.5.5z"
        fill="#3c7d9a"
      />
      {/* Classic 'M↓' Markdown symbol */}
      <path
        d="M4.5 6.5h.9l.9 1.4.9-1.4h.9v3.8h-.8V7.9l-.7 1.1h-.6l-.7-1.1v2.4h-.8V6.5zm5.5 1.6h.9V6.5h.8v1.6h.9l-1.3 1.8-1.3-1.8z"
        fill="#ffffff"
      />
    </svg>
  );
};
