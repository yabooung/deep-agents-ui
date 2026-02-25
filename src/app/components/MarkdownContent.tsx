"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent = React.memo<MarkdownContentProps>(
  ({ content, className = "" }) => {
    return (
      <div
        className={cn(
          "prose min-w-0 max-w-full overflow-hidden break-words text-sm leading-relaxed text-inherit [&_h1:first-child]:mt-0 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:font-semibold [&_h2:first-child]:mt-0 [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:font-semibold [&_h3:first-child]:mt-0 [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_h4:first-child]:mt-0 [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:font-semibold [&_h5:first-child]:mt-0 [&_h5]:mb-2 [&_h5]:mt-3 [&_h5]:font-semibold [&_h6:first-child]:mt-0 [&_h6]:mb-2 [&_h6]:mt-3 [&_h6]:font-semibold [&_p:last-child]:mb-0 [&_p]:mb-3 [&_hr]:my-3",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            hr({ ...props }: { children?: React.ReactNode }) {
              return <hr className="!my-2 border-border" {...props} />;
            },
            p({ children, ...props }: { children?: React.ReactNode }) {
              let contentString = "";
              const extractText = (node: any) => {
                if (typeof node === "string") {
                  contentString += node;
                } else if (Array.isArray(node)) {
                  node.forEach(extractText);
                } else if (node?.props?.children) {
                  extractText(node.props.children);
                }
              };
              extractText(children);

              const isTreeOrSpaced = /[├└│]/.test(contentString) || / {3,}/.test(contentString);

              return (
                <p
                  className={cn(
                    "my-1 last:mb-0",
                    isTreeOrSpaced
                      ? "whitespace-pre-wrap font-mono text-[13px] leading-[1.3] tracking-tight"
                      : "whitespace-pre-wrap leading-relaxed"
                  )}
                  {...props}
                >
                  {children}
                </p>
              );
            },
            code({
              inline,
              className,
              children,
              ...props
            }: {
              inline?: boolean;
              className?: string;
              children?: React.ReactNode;
            }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="max-w-full rounded-md text-sm"
                  wrapLines={true}
                  wrapLongLines={true}
                  lineProps={{
                    style: {
                      wordBreak: "break-all",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                    },
                  }}
                  customStyle={{
                    margin: 0,
                    maxWidth: "100%",
                    overflowX: "auto",
                    fontSize: "0.875rem",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code
                  className="bg-surface rounded-sm px-1 py-0.5 font-mono text-[0.9em]"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre({ children }: { children?: React.ReactNode }) {
              return (
                <div className="my-4 max-w-full overflow-hidden last:mb-0">
                  {children}
                </div>
              );
            },
            a({
              href,
              children,
            }: {
              href?: string;
              children?: React.ReactNode;
            }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary no-underline hover:underline"
                >
                  {children}
                </a>
              );
            },
            blockquote({ children }: { children?: React.ReactNode }) {
              return (
                <blockquote className="text-primary/50 my-4 border-l-4 border-border pl-4 italic">
                  {children}
                </blockquote>
              );
            },
            ul({ children }: { children?: React.ReactNode }) {
              return (
                <ul className="my-4 pl-6 [&>li:last-child]:mb-0 [&>li]:mb-1">
                  {children}
                </ul>
              );
            },
            ol({ children }: { children?: React.ReactNode }) {
              return (
                <ol className="my-4 pl-6 [&>li:last-child]:mb-0 [&>li]:mb-1">
                  {children}
                </ol>
              );
            },
            table({ children }: { children?: React.ReactNode }) {
              return (
                <div className="my-4 overflow-x-auto">
                  <table className="[&_th]:bg-surface w-full border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold">
                    {children}
                  </table>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownContent.displayName = "MarkdownContent";
