"use client";

import { useState } from "react";

type Environment = {
  id: string;
  name: string;
  displayName: string;
};

type LinkItem = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  environment: Environment;
};

const ENV_BADGES: Record<string, { bg: string; text: string; dot: string }> = {
  prod: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  stg: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  dev: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
};

export function LinkCard({ link, projectColor }: { link: LinkItem; projectColor: string }) {
  const [copied, setCopied] = useState(false);

  const envStyle = ENV_BADGES[link.environment.name] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  };

  async function copyUrl() {
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate">{link.name}</h3>
          {link.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{link.description}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${envStyle.bg} ${envStyle.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${envStyle.dot}`} />
          {link.environment.displayName}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 text-xs text-gray-400 hover:text-violet-600 truncate transition"
        >
          {link.url}
        </a>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={copyUrl}
            title="Copy URL"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open link"
            className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition opacity-0 group-hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Color accent bar */}
      <div
        className="h-0.5 rounded-full mt-3 opacity-30"
        style={{ backgroundColor: projectColor }}
      />
    </div>
  );
}
