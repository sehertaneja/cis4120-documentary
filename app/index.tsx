import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import React, { useRef, useState } from 'react';
import {
  Animated,
  ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

const CARD_H = 95;

type Clip = {
  id: string; title: string; description: string;
  videoUri: string; videoName: string; inPoint: number; outPoint: number;
};

function Sidebar({ screen, setScreen }: { screen: string; setScreen: (s: string) => void }) {
  const items = [
    { id: 'home', label: 'Project', icon: 'folder-outline' },
    { id: 'clips', label: 'Clips', icon: 'filmstrip' },
    { id: 'moments', label: 'Moments', icon: 'clock-outline' },
    { id: 'storyboard', label: 'Story', icon: 'book-open-outline' },
    { id: 'feedback', label: 'Feedback', icon: 'chat-outline' },
  ];
  return (
    <View style={s.sidebar}>
      <Text style={s.sidebarLogo}>Sequence</Text>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[s.sidebarItem, screen === item.id && s.sidebarItemActive]}
          onPress={() => setScreen(item.id)}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={16}
            color={screen === item.id ? '#6695FC' : '#5A5F67'}
          />
          <Text style={[s.sidebarLabel, screen === item.id && s.sidebarLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={s.sidebarDivider} />
      <Text style={s.sidebarDevLabel}>Dev</Text>
      {[
        { id: 'helloworld', label: 'Hello World' },
        { id: 'hellostyles', label: 'Hello Styles' },
        { id: 'fileimport', label: 'File Import' },
      ].map(item => (
        <TouchableOpacity
          key={item.id}
          style={[s.sidebarItem, screen === item.id && s.sidebarItemActive]}
          onPress={() => setScreen(item.id)}
        >
          <Text style={[s.sidebarLabel, screen === item.id && s.sidebarLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [importedFiles, setImportedFiles] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('Clips');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekInput, setSeekInput] = useState('');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimStartInput, setTrimStartInput] = useState('');
  const [trimEndInput, setTrimEndInput] = useState('');
  const [clipTitle, setClipTitle] = useState('');
  const [clipDescription, setClipDescription] = useState('');
  const [clips, setClips] = useState<Clip[]>([]);
  const [dragIdx, setDragIdx] = useState(-1);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const dragIdxRef = useRef(-1);
  const clipsRef = useRef<Clip[]>([]);
  clipsRef.current = clips;
  const videoRef = useRef<Video>(null);
  const onDragMoveRef = useRef((_i: number, _dy: number) => {});
  const onDragEndRef = useRef((_i: number, _dy: number) => {});

  onDragMoveRef.current = (i: number, dy: number) => {
    if (dragIdxRef.current !== i) return;
    const to = Math.max(0, Math.min(clipsRef.current.length - 1, i + Math.round(dy / CARD_H)));
    setHoverIdx(to);
  };

  onDragEndRef.current = (i: number, dy: number) => {
    if (dragIdxRef.current !== i) { dragIdxRef.current = -1; setDragIdx(-1); setHoverIdx(-1); return; }
    const to = Math.max(0, Math.min(clipsRef.current.length - 1, i + Math.round(dy / CARD_H)));
    if (to !== i) {
      const next = [...clipsRef.current];
      const [item] = next.splice(i, 1);
      next.splice(to, 0, item);
      setClips(next);
      clipsRef.current = next;
    }
    dragIdxRef.current = -1; setDragIdx(-1); setHoverIdx(-1);
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['video/*', 'audio/*'], multiple: true, copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const newFiles = result.assets.map(f => ({ ...f, tag: 'Clip' }));
      setImportedFiles(prev => [...prev, ...newFiles]);
      setScreen('clips');
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) { await videoRef.current.pauseAsync(); }
      else { await videoRef.current.playAsync(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async () => {
    const timeMs = parseFloat(seekInput) * 1000;
    if (videoRef.current && !isNaN(timeMs)) await videoRef.current.setPositionAsync(timeMs);
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
    setPosition(0); setDuration(0); setIsPlaying(false);
    setTrimStart(0); setTrimEnd(0);
    setTrimStartInput(''); setTrimEndInput('');
    setScreen('moments');
  };

  const handleSetTrimStart = () => { const t = parseFloat(trimStartInput); if (!isNaN(t)) setTrimStart(t); };
  const handleSetTrimEnd = () => { const t = parseFloat(trimEndInput); if (!isNaN(t)) setTrimEnd(t); };
  const handleSetCurrentAsTrimStart = () => { setTrimStart(position); setTrimStartInput(position.toFixed(2)); };
  const handleSetCurrentAsTrimEnd = () => { setTrimEnd(position); setTrimEndInput(position.toFixed(2)); };

  const handleSaveClip = () => {
    if (!selectedFile || !clipTitle || trimEnd <= trimStart) return;
    const newClip: Clip = {
      id: Date.now().toString(), title: clipTitle, description: clipDescription,
      videoUri: selectedFile.uri, videoName: selectedFile.name,
      inPoint: trimStart, outPoint: trimEnd,
    };
    setClips(prev => [...prev, newClip]);
    clipsRef.current = [...clipsRef.current, newClip];
    setClipTitle(''); setClipDescription('');
  };

  const handleExport = () => {
    const data = clipsRef.current.map(c => ({
      title: c.title, notes: c.description,
      inPoint: c.inPoint, outPoint: c.outPoint,
      videoName: c.videoName,
    }));
    if (typeof document !== 'undefined') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'storyboard.json';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }
  };

  const setFileTag = (index: number, tag: string) => {
    setImportedFiles(prev => prev.map((f, i) => i === index ? { ...f, tag } : f));
  };

  const filteredFiles = activeFilter === 'Clips'
    ? importedFiles
    : importedFiles.filter(f => f.tag === activeFilter);

  return (
    <View style={s.root}>
      <Sidebar screen={screen} setScreen={setScreen} />
      <View style={s.main}>

        {/* ── Home ── */}
        {screen === 'home' && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.pageTitle}>Documentary Projects</Text>
            <View style={s.filterRow}>
              {['All', 'Interviews', 'B-roll'].map(f => (
                <TouchableOpacity key={f} style={[s.filterBtn, f === 'All' && s.filterBtnActive]}>
                  <Text style={[s.filterBtnText, f === 'All' && s.filterBtnTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.projectCard} onPress={() => setScreen('clips')}>
              <View style={s.projectThumb}>
                <MaterialCommunityIcons name="movie-open" size={28} color="#6695FC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.projectTitle}>My Documentary</Text>
                <Text style={s.projectMeta}>Last edited: Today · {importedFiles.length} clips</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity style={s.newProjectBtn} onPress={handleImport}>
              <MaterialCommunityIcons name="plus" size={18} color="#5A5F67" />
              <Text style={s.newProjectText}>New Project</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── Clips ── */}
        {screen === 'clips' && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.pageTitle}>My Documentary</Text>
            <View style={s.filterRow}>
              {['Clips', 'Interview', 'B-roll'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[s.filterBtn, activeFilter === f && s.filterBtnActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[s.filterBtnText, activeFilter === f && s.filterBtnTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.uploadBtn} onPress={handleImport}>
                <Ionicons name="cloud-upload" size={14} color="#fff" />
                <Text style={s.uploadBtnText}>Upload clips</Text>
              </TouchableOpacity>
            </View>

            {filteredFiles.length === 0 ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="movie-open-outline" size={48} color="#D1D5DB" />
                <Text style={s.emptyText}>No clips here yet</Text>
                <Text style={s.emptySubtext}>
                  {activeFilter === 'Clips' ? 'Click "Upload clips" to import video or audio' : `No clips tagged as "${activeFilter}" yet`}
                </Text>
              </View>
            ) : (
              <View style={s.clipsGrid}>
                {filteredFiles.map((file, i) => {
                  const realIndex = importedFiles.indexOf(file);
                  return (
                    <TouchableOpacity key={i} style={s.clipCard} onPress={() => handleLoadFile(file)}>
                      <View style={s.clipThumb}>
                        <MaterialCommunityIcons name="play-circle" size={32} color="#6695FC" />
                      </View>
                      <Text style={s.clipName} numberOfLines={2}>{file.name}</Text>
                      {/* Tag selector — uses yellow for Clip, blue for Interview, dark for B-roll */}
                      <View style={s.tagRow}>
                        {(['Clip', 'Interview', 'B-roll'] as const).map(tag => (
                          <TouchableOpacity
                            key={tag}
                            onPress={(e: any) => { e.stopPropagation?.(); setFileTag(realIndex, tag); }}
                            style={[
                              s.tag,
                              file.tag === tag && tag === 'Clip' && s.tagClip,
                              file.tag === tag && tag === 'Interview' && s.tagInterview,
                              file.tag === tag && tag === 'B-roll' && s.tagBroll,
                            ]}
                          >
                            <Text style={[s.tagText, file.tag === tag && s.tagTextActive]}>
                              {tag}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Moments ── */}
        {screen === 'moments' && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.pageTitle}>{selectedFile ? selectedFile.name : 'Moments'}</Text>
            {!selectedFile ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="clock-outline" size={48} color="#D1D5DB" />
                <Text style={s.emptyText}>No clip selected</Text>
                <Text style={s.emptySubtext}>Go to Clips and tap a clip to open it</Text>
              </View>
            ) : (
              <>
                <Video
                  ref={videoRef}
                  source={{ uri: selectedFile.uri }}
                  style={s.video}
                  resizeMode={ResizeMode.CONTAIN}
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  shouldPlay={false}
                  useNativeControls
                />
                <View style={s.card}>
                  <View style={s.timeDisplay}>
                    <Text style={s.timeText}>{position.toFixed(2)}s / {duration.toFixed(2)}s</Text>
                  </View>
                  <View style={s.buttonRow}>
                    <TouchableOpacity style={s.controlBtn} onPress={handlePlayPause}>
                      <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#fff" />
                      <Text style={s.controlBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.inputLabel}>Seek to (seconds)</Text>
                  <View style={s.inputRow}>
                    <TextInput style={s.input} placeholder="0.00" value={seekInput} onChangeText={setSeekInput} keyboardType="numeric" />
                    <TouchableOpacity style={s.seekBtn} onPress={handleSeek}>
                      <Text style={s.seekBtnText}>Seek</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.card}>
                  <Text style={s.cardTitle}>Save Moment</Text>
                  <View style={s.trimDisplay}>
                    <View style={s.trimPoint}>
                      <Text style={s.trimLabel}>START</Text>
                      <Text style={s.trimValue}>{trimStart.toFixed(2)}s</Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#5A5F67" />
                    <View style={s.trimPoint}>
                      <Text style={s.trimLabel}>END</Text>
                      <Text style={s.trimValue}>{trimEnd.toFixed(2)}s</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={s.quickSetBtn} onPress={handleSetCurrentAsTrimStart}>
                    <Text style={s.quickSetBtnText}>Set Start ({position.toFixed(2)}s)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.quickSetBtn} onPress={handleSetCurrentAsTrimEnd}>
                    <Text style={s.quickSetBtnText}>Set End ({position.toFixed(2)}s)</Text>
                  </TouchableOpacity>
                  {trimEnd > trimStart && (
                    <>
                      <TextInput style={[s.input, { marginTop: 10 }]} placeholder="Moment title" value={clipTitle} onChangeText={setClipTitle} />
                      <TextInput style={[s.input, { height: 60, marginTop: 8 }]} placeholder="Notes..." value={clipDescription} onChangeText={setClipDescription} multiline />
                      <TouchableOpacity style={[s.controlBtn, { marginTop: 10, backgroundColor: '#16A34A' }]} onPress={handleSaveClip} disabled={!clipTitle}>
                        <Text style={s.controlBtnText}>Save Moment</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        )}

        {/* ── Storyboard ── */}
        {screen === 'storyboard' && (
          <ScrollView contentContainerStyle={s.content} scrollEnabled={dragIdx === -1}>
            <Text style={s.pageTitle}>Storyboard</Text>
            {clips.length === 0 ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="filmstrip" size={48} color="#D1D5DB" />
                <Text style={s.emptyText}>No moments saved yet</Text>
                <Text style={s.emptySubtext}>Go to Moments to save clips</Text>
              </View>
            ) : (
              <>
                {clips.map((clip, i) => (
                  <Animated.View key={i} style={dragIdx === i ? { opacity: 0.65, zIndex: 999 } : { zIndex: 1 }}>
                    <TouchableOpacity
                      onLongPress={() => { dragIdxRef.current = i; setDragIdx(i); setHoverIdx(i); }}
                      delayLongPress={400}
                      style={[s.storyCard, hoverIdx === i && dragIdx !== i && s.storyCardHover]}
                    >
                      <MaterialCommunityIcons name="drag-vertical" size={22} color="#9CA3AF" />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={s.storyCardTitle}>{clip.title}</Text>
                        <Text style={s.storyCardNotes}>{clip.description}</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
                <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
                  <FontAwesome5 name="share-alt" size={14} color="#fff" />
                  <Text style={s.exportBtnText}>Export Storyboard</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}

        {/* ── Feedback ── */}
        {screen === 'feedback' && (
          <View style={s.content}>
            <Text style={s.pageTitle}>Feedback</Text>
            <Text style={s.emptySubtext}>Coming soon.</Text>
          </View>
        )}

        {/* ── Hello World ── */}
        {screen === 'helloworld' && (
          <View style={[s.content, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
            <Text style={{ fontSize: 48, fontWeight: '700', color: '#1F2937' }}>Hello World</Text>
            <Text style={{ fontSize: 16, fontWeight: '300', color: '#5A5F67', marginTop: 12 }}>Sequence — React Native + Expo</Text>
          </View>
        )}

        {/* ── Hello Styles ── */}
        {screen === 'hellostyles' && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.pageTitle}>Hello Styles</Text>
            <Text style={s.sectionTitle}>Colors</Text>
            {[['#6695FC','Blue'],['#5A5F67','Light Gray'],['#1F2937','Dark Gray'],['#111827','Medium Gray'],['#F7FF00','Yellow']].map(([color, name]) => (
              <View key={color} style={s.colorRow}>
                <View style={[s.swatch, { backgroundColor: color, borderWidth: color === '#F7FF00' ? 1 : 0, borderColor: '#ccc' }]} />
                <Text style={s.colorLabel}>{color} — {name}</Text>
              </View>
            ))}
            <Text style={s.sectionTitle}>Typeface — Inter</Text>
            {(['300','500','700'] as const).map(w => (
              <View key={w} style={s.typeBox}>
                <Text style={s.typeLabel}>{w === '300' ? 'Light' : w === '500' ? 'Medium' : 'Bold'} ({w})</Text>
                <Text style={[s.typeSample, { fontWeight: w }]}>The quick brown fox jumps.</Text>
              </View>
            ))}
            <Text style={s.sectionTitle}>Icons</Text>
            <View style={s.iconGrid}>
              {[
                { name: 'movie-open', label: 'Projects' },
                { name: 'filmstrip', label: 'Clips' },
                { name: 'clock-outline', label: 'Moments' },
                { name: 'chat-outline', label: 'Feedback' },
              ].map(icon => (
                <View key={icon.label} style={s.iconCell}>
                  <MaterialCommunityIcons name={icon.name as any} size={32} color="#6695FC" />
                  <Text style={s.iconLabel}>{icon.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ── File Import (dev) ── */}
        {screen === 'fileimport' && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.pageTitle}>File Import</Text>
            <Text style={{ fontSize: 13, color: '#5A5F67', marginBottom: 16 }}>Import video or audio files from your computer.</Text>
            <TouchableOpacity style={s.uploadBtn} onPress={handleImport}>
              <Ionicons name="cloud-upload" size={16} color="#fff" />
              <Text style={s.uploadBtnText}>+ Import Video / Audio</Text>
            </TouchableOpacity>
            {importedFiles.length === 0 ? (
              <View style={s.emptyState}>
                <MaterialCommunityIcons name="movie-open-outline" size={48} color="#D1D5DB" />
                <Text style={s.emptyText}>No files imported yet</Text>
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>{importedFiles.length} file(s) imported</Text>
                {importedFiles.map((file, i) => (
                  <View key={i} style={s.colorRow}>
                    <MaterialCommunityIcons name="movie-open" size={20} color="#6695FC" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={s.colorLabel}>{file.name}</Text>
                      <Text style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }} numberOfLines={1}>{file.uri}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#F3F4F6' },
  sidebar: { width: 160, backgroundColor: '#fff', paddingTop: 24, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  sidebarLogo: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 24, paddingLeft: 8 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, marginBottom: 2 },
  sidebarItemActive: { backgroundColor: '#EEF2FF' },
  sidebarLabel: { fontSize: 13, fontWeight: '500', color: '#5A5F67' },
  sidebarLabelActive: { color: '#6695FC' },
  sidebarDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  sidebarDevLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 4, paddingLeft: 8 },

  main: { flex: 1 },
  content: { padding: 32, paddingBottom: 48 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 20, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#6695FC', paddingLeft: 8 },

  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterBtnActive: { backgroundColor: '#6695FC', borderColor: '#6695FC' },
  filterBtnText: { fontSize: 13, fontWeight: '500', color: '#5A5F67' },
  filterBtnTextActive: { color: '#fff' },

  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6695FC', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginLeft: 'auto' },
  uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  projectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  projectThumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  projectTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  projectMeta: { fontSize: 12, fontWeight: '300', color: '#5A5F67' },
  newProjectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  newProjectText: { fontSize: 14, fontWeight: '500', color: '#5A5F67' },

  clipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  clipCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  clipThumb: { width: '100%', height: 80, borderRadius: 8, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  clipName: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 6 },

  tagRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  tag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  tagClip: { backgroundColor: '#F7FF00', borderColor: '#F7FF00' },
  tagInterview: { backgroundColor: '#6695FC', borderColor: '#6695FC' },
  tagBroll: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  tagText: { fontSize: 10, fontWeight: '500', color: '#5A5F67' },
  tagTextActive: { color: '#111827' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, fontWeight: '500', color: '#9CA3AF', marginTop: 12 },
  emptySubtext: { fontSize: 12, fontWeight: '300', color: '#D1D5DB', marginTop: 4 },

  video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 12, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 10 },
  timeDisplay: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 10 },
  timeText: { fontSize: 18, fontWeight: '600', color: '#1F2937', fontFamily: 'monospace' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  controlBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6695FC', borderRadius: 10, paddingVertical: 12 },
  controlBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#5A5F67', marginTop: 10, marginBottom: 6 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  seekBtn: { backgroundColor: '#6695FC', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  seekBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  trimDisplay: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  trimPoint: { alignItems: 'center' },
  trimLabel: { fontSize: 10, fontWeight: '700', color: '#6695FC', marginBottom: 4 },
  trimValue: { fontSize: 16, fontWeight: '700', color: '#1F2937', fontFamily: 'monospace' },
  quickSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', borderRadius: 8, padding: 10, marginTop: 6, borderWidth: 1, borderColor: '#DBEAFE' },
  quickSetBtnText: { color: '#6695FC', fontSize: 13, fontWeight: '500' },

  storyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', height: CARD_H },
  storyCardHover: { borderColor: '#6695FC', backgroundColor: '#EEF2FF' },
  storyCardTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  storyCardNotes: { fontSize: 11, color: '#5A5F67' },
  storyCardNum: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  storyCardDragging: {},
  storyCardHandle: { marginRight: 8 },

  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F2937', borderRadius: 10, paddingVertical: 14, marginTop: 16 },
  exportBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  colorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 6 },
  swatch: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  colorLabel: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  typeBox: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6 },
  typeLabel: { fontSize: 10, color: '#6695FC', fontWeight: '500', marginBottom: 4 },
  typeSample: { fontSize: 16, color: '#1F2937' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: '22%', backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center' },
  iconLabel: { fontSize: 10, color: '#5A5F67', marginTop: 6, fontWeight: '500' },
});