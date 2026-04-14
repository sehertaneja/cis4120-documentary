import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import React, { useRef, useState } from 'react';
import { Animated, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CARD_H = 95;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 0,
    height: 45,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 20, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6695FC' },
  tabText: { fontSize: 12, fontWeight: '500', color: '#5A5F67' },
  tabTextActive: { color: '#6695FC' },

  helloContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  helloText: { fontSize: 48, fontWeight: '700', color: '#1F2937' },
  helloSub: { fontSize: 16, fontWeight: '300', color: '#5A5F67', marginTop: 12 },

  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 8, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  pageSubtitle: { fontSize: 12, fontWeight: '300', color: '#5A5F67', marginBottom: 8 },

  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: '#1F2937',
    marginTop: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: '#6695FC', paddingLeft: 10,
  },

  colorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 6 },
  swatch: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  colorLabel: { fontSize: 14, fontWeight: '500', color: '#1F2937' },

  typeBox: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6 },
  typeLabel: { fontSize: 10, color: '#6695FC', fontWeight: '500', marginBottom: 4 },
  typeSample: { fontSize: 16, color: '#1F2937' },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: '28%', backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 4 },
  iconLabel: { fontSize: 10, color: '#5A5F67', marginTop: 6, fontWeight: '500' },

  importBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#6695FC', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 20,
  },
  importBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 14, fontWeight: '500', color: '#9CA3AF', marginTop: 8 },
  emptySubtext: { fontSize: 12, fontWeight: '300', color: '#D1D5DB', marginTop: 3 },

  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 6 },
  fileCardActive: { borderWidth: 2, borderColor: '#6695FC' },
  fileName: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 3 },
  fileUri: { fontSize: 9, color: '#9CA3AF', fontFamily: 'monospace' },

  playerContainer: { marginBottom: 12 },
  video: { width: '100%', height: 300, backgroundColor: '#000', borderRadius: 12, marginBottom: 12 },
  controlsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  controlsTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 10 },
  timeDisplay: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 10 },
  timeText: { fontSize: 18, fontWeight: '600', color: '#1F2937', fontFamily: 'monospace' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  controlBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#6695FC', borderRadius: 10, paddingVertical: 14,
  },
  controlBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#5A5F67', marginTop: 8, marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12,
    fontSize: 16, fontFamily: 'monospace', borderWidth: 1, borderColor: '#E5E7EB',
  },
  seekBtn: { backgroundColor: '#6695FC', borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  seekBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  trimCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  trimDisplay: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginBottom: 10,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  trimPoint: { alignItems: 'center' },
  trimLabel: { fontSize: 10, fontWeight: '700', color: '#6695FC', marginBottom: 6, letterSpacing: 0.5 },
  trimValue: { fontSize: 18, fontWeight: '700', color: '#1F2937', fontFamily: 'monospace' },
  quickSetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#EFF6FF', borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 10, marginTop: 6,
    borderWidth: 1, borderColor: '#DBEAFE',
  },
  quickSetBtnText: { color: '#6695FC', fontSize: 13, fontWeight: '500' },
  infoCard: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#FDE68A' },
  infoText: { fontSize: 14, color: '#92400E', textAlign: 'center' },

  // Storyboard styles
  storyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 2, borderColor: 'transparent', height: CARD_H,
  },
  storyCardHover: { borderColor: '#6695FC', backgroundColor: '#EFF6FF' },
  storyCardDragging: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  storyCardEditing: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  storyCardHandle: { alignItems: 'center', marginRight: 12, width: 28 },
  storyCardNum: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginTop: 4 },
  storyCardTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  storyCardNotes: { fontSize: 11, fontWeight: '300', color: '#5A5F67', marginBottom: 2 },
  storyCardVideo: { fontSize: 10, color: '#16A34A', fontWeight: '500', fontFamily: 'monospace' },
  storyCardNoVideo: { fontSize: 10, color: '#9CA3AF', fontStyle: 'italic' },
  thumbBox: {
    width: 44, height: 44, borderRadius: 8, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  hintCard: {
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: '#DBEAFE', flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  hintText: { fontSize: 13, color: '#1E40AF', flex: 1 },
  editPanel: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 2, borderColor: '#F59E0B',
  },
  editPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  editPanelTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', flex: 1 },
  editHint: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 8 },
  filePickRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8, marginBottom: 4,
    borderWidth: 1, borderColor: 'transparent',
  },
  filePickRowActive: { borderColor: '#6695FC', backgroundColor: '#EFF6FF' },
  filePickName: { flex: 1, fontSize: 12, color: '#1F2937' },
  trimRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  saveClipCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginTop: 12, borderWidth: 2, borderColor: '#6695FC',
  },
  saveClipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#16A34A', borderRadius: 10,
    paddingVertical: 14, marginTop: 12,
  },
  saveClipBtnDisabled: { backgroundColor: '#D1D5DB' },
  saveClipBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1F2937', borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 20, marginTop: 16, marginBottom: 8,
  },
  exportBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

type Clip = {
  id: string;
  title: string;
  description: string;
  videoUri: string;
  videoName: string;
  inPoint: number;
  outPoint: number;
};

function DraggableCard({
  clip, index, isDragging, isHover,
  dragIdxRef, onDragStart, onDragMoveRef, onDragEndRef,
}: {
  clip: Clip;
  index: number;
  isDragging: boolean;
  isHover: boolean;
  dragIdxRef: { current: number };
  onDragStart: (i: number) => void;
  onDragMoveRef: { current: (i: number, dy: number) => void };
  onDragEndRef: { current: (i: number, dy: number) => void };
}) {
  const animY = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(index);
  indexRef.current = index;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => dragIdxRef.current === indexRef.current,
      onMoveShouldSetPanResponderCapture: () => dragIdxRef.current === indexRef.current,
      onPanResponderMove: (_, gs) => {
        animY.setValue(gs.dy);
        onDragMoveRef.current(indexRef.current, gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        onDragEndRef.current(indexRef.current, gs.dy);
        animY.setValue(0);
      },
      onPanResponderTerminate: () => {
        onDragEndRef.current(indexRef.current, 0);
        animY.setValue(0);
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={isDragging ? { transform: [{ translateY: animY }], opacity: 0.65, zIndex: 999 } : { zIndex: 1 }}
    >
      <TouchableOpacity
        onLongPress={() => { animY.setValue(0); onDragStart(index); }}
        delayLongPress={400}
        activeOpacity={0.85}
        style={[styles.storyCard, isHover && styles.storyCardHover, isDragging && styles.storyCardDragging]}
      >
        <View style={styles.storyCardHandle}>
          <MaterialCommunityIcons name="drag-vertical" size={22} color="#9CA3AF" />
          <Text style={styles.storyCardNum}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.storyCardTitle}>{clip.title}</Text>
          <Text style={styles.storyCardNotes} numberOfLines={1}>{clip.description}</Text>
          <Text style={styles.storyCardVideo} numberOfLines={1}>
            {(clip.outPoint - clip.inPoint).toFixed(1)}s — {clip.videoName}
          </Text>
        </View>
        <View style={[styles.thumbBox, { backgroundColor: '#DCFCE7' }]}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#16A34A" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('hello');
  const [importedFiles, setImportedFiles] = useState<any[]>([]);

  // Playback state
  const videoRef = useRef<Video>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekInput, setSeekInput] = useState('');

  // Trimming state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimStartInput, setTrimStartInput] = useState('');
  const [trimEndInput, setTrimEndInput] = useState('');

  // Clip save state
  const [clipTitle, setClipTitle] = useState('');
  const [clipDescription, setClipDescription] = useState('');

  // Storyboard state (Req 6 + Req 7)
  const [clips, setClips] = useState<Clip[]>([]);
  const [dragIdx, setDragIdx] = useState(-1);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const dragIdxRef = useRef(-1);
  const clipsRef = useRef<Clip[]>([]);
  clipsRef.current = clips;

  const onDragMoveRef = useRef((_i: number, _dy: number) => {});
  const onDragEndRef = useRef((_i: number, _dy: number) => {});

  onDragMoveRef.current = (i: number, dy: number) => {
    if (dragIdxRef.current !== i) return;
    const to = Math.max(0, Math.min(clipsRef.current.length - 1, i + Math.round(dy / CARD_H)));
    setHoverIdx(to);
  };

  onDragEndRef.current = (i: number, dy: number) => {
    if (dragIdxRef.current !== i) {
      dragIdxRef.current = -1;
      setDragIdx(-1);
      setHoverIdx(-1);
      return;
    }
    const to = Math.max(0, Math.min(clipsRef.current.length - 1, i + Math.round(dy / CARD_H)));
    if (to !== i) {
      const next = [...clipsRef.current];
      const [item] = next.splice(i, 1);
      next.splice(to, 0, item);
      setClips(next);
      clipsRef.current = next;
    }
    dragIdxRef.current = -1;
    setDragIdx(-1);
    setHoverIdx(-1);
  };

  const handleDragStart = (i: number) => {
    dragIdxRef.current = i;
    setDragIdx(i);
    setHoverIdx(i);
  };

  const handleSaveClip = () => {
    if (!selectedFile || !clipTitle || trimEnd <= trimStart) return;
    const newClip: Clip = {
      id: Date.now().toString(),
      title: clipTitle,
      description: clipDescription,
      videoUri: selectedFile.uri,
      videoName: selectedFile.name,
      inPoint: trimStart,
      outPoint: trimEnd,
    };
    setClips(prev => [...prev, newClip]);
    clipsRef.current = [...clipsRef.current, newClip];
    setClipTitle('');
    setClipDescription('');
    console.log('Clip saved:', newClip);
  };

  const generateFCPXML = (allClips: Clip[]): string => {
    const esc = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    if (allClips.length === 0) return '';

    const assets = allClips.map((clip, i) => ({
      id: `r${i + 2}`,
      clip,
      duration: clip.outPoint - clip.inPoint,
      src: `file:///${clip.videoName}`,
    }));

    const totalDur = assets.reduce((sum, a) => sum + a.duration, 0);

    let offset = 0;
    const clipsXml = assets.map(a => {
      const xml = `            <clip name="${esc(a.clip.title)}" ref="${a.id}" offset="${offset}s" duration="${a.duration}s" start="${a.clip.inPoint}s">
              <note>${esc(a.clip.description)}</note>
            </clip>`;
      offset += a.duration;
      return xml;
    }).join('\n');

    const assetsXml = assets.map(a =>
      `    <asset id="${a.id}" name="${esc(a.clip.title)}" uid="${a.id}" src="${a.src}" start="0s" duration="${a.duration}s" hasVideo="1" hasAudio="1">
      <media-rep kind="original-media" src="${a.src}"/>
    </asset>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p25" frameDuration="1/25s" width="1920" height="1080"/>
${assetsXml}
  </resources>
  <library>
    <event name="Documentary">
      <project name="My Documentary">
        <sequence format="r1" duration="${totalDur}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
${clipsXml}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
  };

  const handleExport = () => {
    const xml = generateFCPXML(clipsRef.current);
    if (!xml) {
      console.warn('No clips saved — use the Trimming tab to create clips first');
      return;
    }
    console.log('Exporting FCPXML:\n', xml);
    if (typeof document !== 'undefined') {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentary.fcpxml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['video/*', 'audio/*'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setImportedFiles(prev => [...prev, ...result.assets]);
      console.log('Files imported:', result.assets);
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async () => {
    const timeMs = parseFloat(seekInput) * 1000;
    if (videoRef.current && !isNaN(timeMs)) {
      await videoRef.current.setPositionAsync(timeMs);
      console.log('Seeked to:', timeMs, 'ms');
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const handleLoadFile = (file: any) => {
    setSelectedFile(file);
    setPosition(0);
    setDuration(0);
    setIsPlaying(false);
    setTrimStart(0);
    setTrimEnd(0);
    setTrimStartInput('');
    setTrimEndInput('');
  };

  const handleSetTrimStart = () => {
    const time = parseFloat(trimStartInput);
    if (!isNaN(time)) {
      setTrimStart(time);
      console.log('Trim start set to:', time, 'seconds');
    }
  };

  const handleSetTrimEnd = () => {
    const time = parseFloat(trimEndInput);
    if (!isNaN(time)) {
      setTrimEnd(time);
      console.log('Trim end set to:', time, 'seconds');
    }
  };

  const handleSetCurrentAsTrimStart = () => {
    setTrimStart(position);
    setTrimStartInput(position.toFixed(2));
    console.log('Trim start set to current position:', position.toFixed(2), 'seconds');
  };

  const handleSetCurrentAsTrimEnd = () => {
    setTrimEnd(position);
    setTrimEndInput(position.toFixed(2));
    console.log('Trim end set to current position:', position.toFixed(2), 'seconds');
  };

  return (
    <View style={{ flex: 1 }}>

      {/* ── Tab Bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar} style={{ flexGrow: 0 }}>
        {(['hello', 'styles', 'import', 'playback', 'trimming', 'storyboard'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, screen === s && styles.tabActive]}
            onPress={() => setScreen(s)}
          >
            <Text style={[styles.tabText, screen === s && styles.tabTextActive]}>
              {s === 'hello' ? 'Hello World'
                : s === 'styles' ? 'Hello Styles'
                : s === 'import' ? 'File Import'
                : s === 'playback' ? 'Playback & Scrubbing'
                : s === 'trimming' ? 'Trimming'
                : 'Storyboard'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Screen 1: Hello World ── */}
      {screen === 'hello' && (
        <View style={styles.helloContainer}>
          <Text style={styles.helloText}>Hello World</Text>
          <Text style={styles.helloSub}>Sequence — React Native + Expo</Text>
        </View>
      )}

      {/* ── Screen 2: Hello Styles ── */}
      {screen === 'styles' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Hello Styles</Text>
          <Text style={styles.pageSubtitle}>Sequence Design System</Text>

          <Text style={styles.sectionTitle}>Colors</Text>
          {[['#6695FC','Blue'],['#5A5F67','Light Gray'],['#1F2937','Dark Gray'],['#111827','Medium Gray'],['#F7FF00','Yellow']].map(([color, name]) => (
            <View key={color} style={styles.colorRow}>
              <View style={[styles.swatch, { backgroundColor: color, borderWidth: color === '#F7FF00' ? 1 : 0, borderColor: '#ccc' }]} />
              <Text style={styles.colorLabel}>{color} — {name}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Typeface — Inter</Text>
          {(['300','500','700'] as const).map(w => (
            <View key={w} style={styles.typeBox}>
              <Text style={styles.typeLabel}>{w === '300' ? 'Light' : w === '500' ? 'Medium' : 'Bold'} ({w})</Text>
              <Text style={[styles.typeSample, { fontWeight: w }]}>The quick brown fox jumps over the lazy dog.</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Icons</Text>
          <View style={styles.iconGrid}>
            <View style={styles.iconCell}><MaterialCommunityIcons name="movie-open" size={32} color="#6695FC" /><Text style={styles.iconLabel}>Projects</Text></View>
            <View style={styles.iconCell}><MaterialCommunityIcons name="filmstrip" size={32} color="#6695FC" /><Text style={styles.iconLabel}>Clips</Text></View>
            <View style={styles.iconCell}><MaterialCommunityIcons name="clock-outline" size={32} color="#6695FC" /><Text style={styles.iconLabel}>Moments</Text></View>
            <View style={styles.iconCell}><Ionicons name="cloud-upload" size={32} color="#6695FC" /><Text style={styles.iconLabel}>Upload</Text></View>
            <View style={styles.iconCell}><Ionicons name="search" size={32} color="#6695FC" /><Text style={styles.iconLabel}>Search</Text></View>
            <View style={styles.iconCell}><FontAwesome5 name="share-alt" size={32} color="#6695FC" /><Text style={styles.iconLabel}>Export</Text></View>
          </View>
        </ScrollView>
      )}

      {/* ── Screen 3: File Import ── */}
      {screen === 'import' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>File Import</Text>
          <Text style={styles.pageSubtitle}>Import video or audio files from your computer.</Text>

          <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.importBtnText}>+ Import Video / Audio</Text>
          </TouchableOpacity>

          {importedFiles.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="movie-open-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No files imported yet</Text>
              <Text style={styles.emptySubtext}>Tap the button above to get started</Text>
            </View>
          )}

          {importedFiles.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>{importedFiles.length} file(s) imported</Text>
              {importedFiles.map((file, i) => (
                <View key={i} style={styles.fileCard}>
                  <MaterialCommunityIcons name="movie-open" size={24} color="#6695FC" />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileUri} numberOfLines={2}>{file.uri}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Screen 4: Playback & Scrubbing ── */}
      {screen === 'playback' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Playback & Scrubbing</Text>
          <Text style={styles.pageSubtitle}>Play, pause, and seek to specific timestamps with frame-level precision.</Text>

          {!selectedFile && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="play-circle-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No file selected</Text>
              <Text style={styles.emptySubtext}>Choose a file from the list below</Text>
            </View>
          )}

          {selectedFile && (
            <View style={styles.playerContainer}>
              <Video
                ref={videoRef}
                source={{ uri: selectedFile.uri }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                shouldPlay={false}
              />
              <View style={styles.controlsCard}>
                <Text style={styles.controlsTitle}>Playback Controls</Text>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeText}>{position.toFixed(2)}s / {duration.toFixed(2)}s</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.controlBtn} onPress={handlePlayPause}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
                    <Text style={styles.controlBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Seek to Timestamp (seconds)</Text>
                <View style={styles.inputRow}>
                  <TextInput style={styles.input} placeholder="0.00" value={seekInput} onChangeText={setSeekInput} keyboardType="numeric" />
                  <TouchableOpacity style={styles.seekBtn} onPress={handleSeek}>
                    <Text style={styles.seekBtnText}>Seek</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {importedFiles.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Available Files</Text>
              {importedFiles.map((file, i) => (
                <TouchableOpacity key={i} style={[styles.fileCard, selectedFile?.uri === file.uri && styles.fileCardActive]} onPress={() => handleLoadFile(file)}>
                  <MaterialCommunityIcons name="movie-open" size={24} color={selectedFile?.uri === file.uri ? '#6695FC' : '#9CA3AF'} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileUri} numberOfLines={1}>{file.uri}</Text>
                  </View>
                  {selectedFile?.uri === file.uri && <Ionicons name="checkmark-circle" size={20} color="#6695FC" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {importedFiles.length === 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Import files first using the "File Import" tab</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Screen 5: Trimming ── */}
      {screen === 'trimming' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Video/Audio Trimming</Text>
          <Text style={styles.pageSubtitle}>Set start and end points to trim your video or audio clip.</Text>

          {!selectedFile && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="content-cut" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No file selected</Text>
              <Text style={styles.emptySubtext}>Choose a file from the list below</Text>
            </View>
          )}

          {selectedFile && (
            <View style={styles.playerContainer}>
              <Video
                ref={videoRef}
                source={{ uri: selectedFile.uri }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                shouldPlay={false}
              />
              <View style={styles.controlsCard}>
                <Text style={styles.controlsTitle}>Playback Position</Text>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeText}>{position.toFixed(2)}s / {duration.toFixed(2)}s</Text>
                </View>
                <TouchableOpacity style={styles.controlBtn} onPress={handlePlayPause}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
                  <Text style={styles.controlBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.trimCard}>
                <Text style={styles.controlsTitle}>Trim Points</Text>
                <View style={styles.trimDisplay}>
                  <View style={styles.trimPoint}>
                    <Text style={styles.trimLabel}>START</Text>
                    <Text style={styles.trimValue}>{trimStart.toFixed(2)}s</Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="#5A5F67" />
                  <View style={styles.trimPoint}>
                    <Text style={styles.trimLabel}>END</Text>
                    <Text style={styles.trimValue}>{trimEnd.toFixed(2)}s</Text>
                  </View>
                  <View style={styles.trimPoint}>
                    <Text style={styles.trimLabel}>DURATION</Text>
                    <Text style={styles.trimValue}>{Math.max(0, trimEnd - trimStart).toFixed(2)}s</Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Set Start Time (seconds)</Text>
                <View style={styles.inputRow}>
                  <TextInput style={styles.input} placeholder="0.00" value={trimStartInput} onChangeText={setTrimStartInput} keyboardType="numeric" />
                  <TouchableOpacity style={styles.seekBtn} onPress={handleSetTrimStart}>
                    <Text style={styles.seekBtnText}>Set Start</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.quickSetBtn} onPress={handleSetCurrentAsTrimStart}>
                  <Ionicons name="locate" size={16} color="#6695FC" />
                  <Text style={styles.quickSetBtnText}>Use Current Position as Start ({position.toFixed(2)}s)</Text>
                </TouchableOpacity>

                <Text style={[styles.inputLabel, { marginTop: 20 }]}>Set End Time (seconds)</Text>
                <View style={styles.inputRow}>
                  <TextInput style={styles.input} placeholder="0.00" value={trimEndInput} onChangeText={setTrimEndInput} keyboardType="numeric" />
                  <TouchableOpacity style={styles.seekBtn} onPress={handleSetTrimEnd}>
                    <Text style={styles.seekBtnText}>Set End</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.quickSetBtn} onPress={handleSetCurrentAsTrimEnd}>
                  <Ionicons name="locate" size={16} color="#6695FC" />
                  <Text style={styles.quickSetBtnText}>Use Current Position as End ({position.toFixed(2)}s)</Text>
                </TouchableOpacity>
              </View>

              {trimEnd > trimStart && (
                <View style={styles.saveClipCard}>
                  <Text style={styles.controlsTitle}>Save as Clip</Text>
                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Opening Shot"
                    value={clipTitle}
                    onChangeText={setClipTitle}
                  />
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                    placeholder="Brief description of this clip..."
                    value={clipDescription}
                    onChangeText={setClipDescription}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.saveClipBtn, !clipTitle && styles.saveClipBtnDisabled]}
                    onPress={handleSaveClip}
                    disabled={!clipTitle}
                  >
                    <MaterialCommunityIcons name="content-save" size={18} color="#fff" />
                    <Text style={styles.saveClipBtnText}>Save Clip to Storyboard</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {importedFiles.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Available Files</Text>
              {importedFiles.map((file, i) => (
                <TouchableOpacity key={i} style={[styles.fileCard, selectedFile?.uri === file.uri && styles.fileCardActive]} onPress={() => handleLoadFile(file)}>
                  <MaterialCommunityIcons name="movie-open" size={24} color={selectedFile?.uri === file.uri ? '#6695FC' : '#9CA3AF'} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileUri} numberOfLines={1}>{file.uri}</Text>
                  </View>
                  {selectedFile?.uri === file.uri && <Ionicons name="checkmark-circle" size={20} color="#6695FC" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {importedFiles.length === 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Import files first using the "File Import" tab</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Screen 6: Storyboard (Drag-and-Drop + FCPXML Export) ── */}
      {screen === 'storyboard' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container} scrollEnabled={dragIdx === -1}>
          <Text style={styles.pageTitle}>Storyboard</Text>
          <Text style={styles.pageSubtitle}>Arrange clips in order, then export as FCPXML for Final Cut Pro, Premiere, or DaVinci Resolve.</Text>

          {clips.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="filmstrip" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No clips yet</Text>
              <Text style={styles.emptySubtext}>Go to Trimming to trim and save clips</Text>
            </View>
          ) : (
            <>
              <View style={styles.hintCard}>
                <MaterialCommunityIcons name="drag-vertical" size={18} color="#1E40AF" />
                <Text style={styles.hintText}>Long-press a card to drag and reorder.</Text>
              </View>

              {clips.map((clip, i) => (
                <DraggableCard
                  key={i}
                  clip={clip}
                  index={i}
                  isDragging={dragIdx === i}
                  isHover={hoverIdx === i && dragIdx !== i}
                  dragIdxRef={dragIdxRef}
                  onDragStart={handleDragStart}
                  onDragMoveRef={onDragMoveRef}
                  onDragEndRef={onDragEndRef}
                />
              ))}

              <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                <FontAwesome5 name="share-alt" size={16} color="#fff" />
                <Text style={styles.exportBtnText}>Export as FCPXML</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

    </View>
  );
}
