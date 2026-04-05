# Sequence — Implementation Prototypes

## How to Run

1. Install dependencies: npm install
2. Start the app in the browser: npm run web
3. Open your browser and go to: http://localhost:8081

## Requirements Implemented

- Req 1: Hello World — see the Hello World tab
- Req 2: Hello Styles — see the Hello Styles tab (colors, fonts, icons)
- Req 3: File Import — see the File Import tab, click the Import button to pick a video/audio file
- Req 4: Video/Audio Playback & Scrubbing — see the Playback & Scrubbing tab
  - Load and play video/audio files
  - Play and pause controls
  - Real-time position display with frame-level precision
  - Seek to specific timestamps
- Req 5: Video/Audio Trimming — see the Trimming tab
  - Set start and end trim points
  - Manual timestamp entry or use current playback position
  - Display trim duration
  - Values are saved and displayed in real-time

## Tech Stack
- React Native + Expo
- expo-document-picker (file import)
- expo-av (video/audio playback)
- @expo/vector-icons (icons)

