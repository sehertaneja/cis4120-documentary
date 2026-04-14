# Sequence — Implementation Prototypes

## How to Run

1. Install dependencies: `npm install`
2. Start the app: `npm run web`
3. Open: http://localhost:8081

## Requirements Implemented

- **Req 1: Hello World** — Hello World tab
- **Req 2: Hello Styles** — Hello Styles tab (colors, fonts, icons)
- **Req 3: File Import** — File Import tab, click Import to pick video/audio files
- **Req 4: Playback & Scrubbing** — Playback & Scrubbing tab
  - Play/pause and real-time position display
  - Seek to specific timestamps
- **Req 5: Trimming & Clip Creation** — Trimming tab
  - Select an imported file and play it
  - Set in/out trim points manually or from current playback position
  - Enter a title and description, then tap "Save Clip to Storyboard" to save the clip
  - Saved clips appear immediately in the Storyboard tab
- **Req 6: Drag-and-Drop Reordering** — Storyboard tab
  - Long-press a clip card (~0.4s) then drag up/down to reorder
  - Release to drop; list order updates immediately
  - Drop target highlighted in blue while dragging
  - [`DraggableCard` component (lines 172–238)](https://github.com/sehertaneja/cis4120-documentary/blob/e980601/app/index.tsx#L172-L238) — PanResponder setup, long-press activation, animated translateY
  - [Drag state & reorder logic (lines 262–303)](https://github.com/sehertaneja/cis4120-documentary/blob/e980601/app/index.tsx#L262-L303) — `onDragMoveRef`, `onDragEndRef`, splice-based reorder
- **Req 7: Export as FCPXML** — Storyboard tab
  - Click "Export as FCPXML" to generate a Final Cut Pro XML file from the ordered clips
  - Each clip includes its source video reference, in/out trim points, title, and description
  - Downloads `documentary.fcpxml` — import into Final Cut Pro, Premiere, or DaVinci Resolve to assemble the edit
  - [`generateFCPXML` (lines 323–375)](https://github.com/sehertaneja/cis4120-documentary/blob/e980601/app/index.tsx#L323-L375) — builds asset + clip XML with title, description, in/out points
  - [`handleExport` (lines 377–395)](https://github.com/sehertaneja/cis4120-documentary/blob/e980601/app/index.tsx#L377-L395) — creates Blob, triggers browser download of `documentary.fcpxml`

## Tech Stack
- React Native + Expo (web)
- expo-document-picker (file import)
- expo-av (video/audio playback)
- @expo/vector-icons (icons)
- React Native PanResponder + Animated (drag-and-drop)
- FCPXML generation (string templating, no dependencies)
- Browser Blob API via React Native Web (file download)

