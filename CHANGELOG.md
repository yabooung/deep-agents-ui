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
- **Send 버튼 반응성**: 메시지 전송 전 `/api/usage` 비용 체크가 지연될 때 클릭이 “먹통”처럼 보이던 문제를 완화하기 위해 타임아웃을 추가했습니다.
- **대화 중 깜빡임 완화**: `isThreadLoading` 전환 시 레이아웃 변화가 커서 깜빡임처럼 보이던 부분을 완화했습니다.
- **버튼 눌림 피드백**: 공통 `Button`에 `active` 상태(pressed) 시각 피드백을 추가해 눌림성을 개선했습니다.
