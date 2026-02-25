# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-25

### Added
- **Per-User Thread Isolation**: Implemented `userId.ts` to generate and store a persistent UUID in browser localStorage. New threads are now tagged with `user_id` metadata, and users only see their own threads in the sidebar.
- **Admin Thread Access**: Added a hidden admin backdoor. Double-clicking the "Threads" header and entering the secret code (`admin123`) bypasses the `user_id` filter, allowing administrators to view all threads in the system.
- **Responsive Thread Sidebar**: Overhauled the `ThreadList` layout in `page.tsx`. On desktop (`lg` and above), it acts as a 30% resizable left panel. On mobile networks, it displays as a full-screen overlay with a backdrop that automatically closes when a thread is selected.
- **Markdown Empty Line Optimization**: Added a custom recursive text node parser inside `MarkdownContent` to detect completely blank lines (or lines with only spaces) and aggressively compress their line-height down to `4px`. This solves the issue of double-spacing or overly large gaps when typing multiple enters.

### Fixed
- **Markdown Line Breaks**: Removed `remark-breaks` which was causing double line breaks when combined with the `whitespace-pre-wrap` CSS property. The UI now respects literal `\n` characters perfectly.
- **Horizontal Rule Spacing**: Overrode Tailwind Typography's default massive margins on `<hr>` tags. Applied `[&_hr]:my-4` to the prose wrapper and `!my-2` directly to the custom component to create tightly spaced divider lines.
