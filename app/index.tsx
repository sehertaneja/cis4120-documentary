import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

const CARD_H = 95;

type Clip = {
  id: string; title: string; description: string;
  videoUri: string; videoName: string; inPoint: number; outPoint: number;
  tag?: string;
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

function TrimScrubber({ duration, trimStart, trimEnd, position, onTrimStartChange, onTrimEndChange, onSeek }: {
  duration: number; trimStart: number; trimEnd: number; position: number;
  onTrimStartChange: (t: number) => void;
  onTrimEndChange: (t: number) => void;
  onSeek: (t: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const trimStartRef = useRef(trimStart);
  const trimEndRef = useRef(trimEnd);
  const durationRef = useRef(duration);
  trimStartRef.current = trimStart;
  trimEndRef.current = trimEnd;
  durationRef.current = duration;

  const leftStartX = useRef(0);
  const rightStartX = useRef(0);
  const HANDLE_W = 20;

  const trackPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (e) => {
      if (!trackWidthRef.current || !durationRef.current) return false;
      const x = e.nativeEvent.locationX;
      const spx = (trimStartRef.current / durationRef.current) * trackWidthRef.current;
      const epx = (trimEndRef.current / durationRef.current) * trackWidthRef.current;
      return Math.abs(x - spx) > HANDLE_W * 2 && Math.abs(x - epx) > HANDLE_W * 2;
    },
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: (e) => {
      if (!trackWidthRef.current || !durationRef.current) return;
      const t = Math.max(0, Math.min((e.nativeEvent.locationX / trackWidthRef.current) * durationRef.current, durationRef.current));
      onSeek(t);
    },
  })).current;

  const leftPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      leftStartX.current = durationRef.current > 0
        ? (trimStartRef.current / durationRef.current) * trackWidthRef.current : 0;
    },
    onPanResponderMove: (_, gs) => {
      if (!trackWidthRef.current || !durationRef.current) return;
      const max = (trimEndRef.current / durationRef.current) * trackWidthRef.current - HANDLE_W;
      const x = Math.max(0, Math.min(leftStartX.current + gs.dx, max));
      const t = (x / trackWidthRef.current) * durationRef.current;
      onTrimStartChange(t);
      onSeek(t);
    },
  })).current;

  const rightPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      rightStartX.current = durationRef.current > 0
        ? (trimEndRef.current / durationRef.current) * trackWidthRef.current : trackWidthRef.current;
    },
    onPanResponderMove: (_, gs) => {
      if (!trackWidthRef.current || !durationRef.current) return;
      const min = (trimStartRef.current / durationRef.current) * trackWidthRef.current + HANDLE_W;
      const x = Math.max(min, Math.min(rightStartX.current + gs.dx, trackWidthRef.current));
      const t = (x / trackWidthRef.current) * durationRef.current;
      onTrimEndChange(t);
      onSeek(t);
    },
  })).current;

  const startPx = trackWidth > 0 && duration > 0 ? (trimStart / duration) * trackWidth : 0;
  const endPx = trackWidth > 0 && duration > 0 ? (trimEnd / duration) * trackWidth : trackWidth;
  const posPx = trackWidth > 0 && duration > 0 ? (position / duration) * trackWidth : 0;

  return (
    <View>
      <View
        {...trackPan.panHandlers}
        style={{ height: 48, justifyContent: 'center' }}
        onLayout={e => { trackWidthRef.current = e.nativeEvent.layout.width; setTrackWidth(e.nativeEvent.layout.width); }}
      >
        <View style={s.scrubTrack} />
        <View style={[s.scrubRange, { left: startPx, width: Math.max(0, endPx - startPx) }]} />
        <View style={[s.scrubPlayhead, { left: posPx }]} />
        <Animated.View {...leftPan.panHandlers} style={[s.scrubHandle, { left: startPx - HANDLE_W / 2 }]}>
          <View style={s.scrubHandleBar} /><View style={s.scrubHandleBar} />
        </Animated.View>
        <Animated.View {...rightPan.panHandlers} style={[s.scrubHandle, { left: endPx - HANDLE_W / 2 }]}>
          <View style={s.scrubHandleBar} /><View style={s.scrubHandleBar} />
        </Animated.View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={s.scrubLabelBlue}>{trimStart.toFixed(2)}s  IN</Text>
        <Text style={s.scrubLabelGray}>{position.toFixed(2)}s / {duration.toFixed(2)}s</Text>
        <Text style={s.scrubLabelBlue}>OUT  {trimEnd.toFixed(2)}s</Text>
      </View>
    </View>
  );
}

function VideoThumb({ uri, seekTo }: { uri: string; seekTo: number }) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const video = document.createElement('video');
    video.src = uri;
    video.addEventListener('loadedmetadata', () => { video.currentTime = seekTo; });
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 120; canvas.height = 68;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(video, 0, 0, 120, 68); setThumb(canvas.toDataURL('image/jpeg', 0.8)); }
    }, { once: true });
    video.load();
  }, [uri, seekTo]);

  if (!thumb) return (
    <View style={s.thumbBox}>
      <MaterialCommunityIcons name="movie-open" size={24} color="#6695FC" />
    </View>
  );
  return <Image source={{ uri: thumb }} style={s.thumbBox} />;
}

function DraggableCard({
  clip, index, isDragging, isHover,
  dragIdxRef, onDragStart, onDragMoveRef, onDragEndRef,
}: {
  clip: Clip; index: number; isDragging: boolean; isHover: boolean;
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
        delayLongPress={150}
        style={[s.storyCard, isHover && !isDragging && s.storyCardHover]}
      >
        <Text style={s.storyCardNum}>#{index + 1}</Text>
        <View style={{ width: 10 }} />
        <VideoThumb uri={clip.videoUri} seekTo={clip.inPoint} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={s.storyCardTitle}>{clip.title}</Text>
            {clip.tag && (
              <View style={[s.clipTagBadge, {
                backgroundColor: clip.tag === 'Interview' ? '#EEF2FF' : clip.tag === 'B-roll' ? '#F3F4F6' : '#FEFCE8',
              }]}>
                <Text style={[s.clipTagText, {
                  color: clip.tag === 'Interview' ? '#6695FC' : clip.tag === 'B-roll' ? '#1F2937' : '#854D0E',
                }]}>{clip.tag}</Text>
              </View>
            )}
          </View>
          <Text style={s.storyCardNotes} numberOfLines={1}>{clip.description}</Text>
          <Text style={s.storyCardNotes}>{(clip.outPoint - clip.inPoint).toFixed(1)}s — {clip.videoName}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [importedFiles, setImportedFiles] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('Clips');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
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

  const seekTo = async (t: number) => {
    if (videoRef.current) await videoRef.current.setPositionAsync(t * 1000);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      const dur = status.durationMillis ? status.durationMillis / 1000 : 0;
      setDuration(dur);
      if (dur > 0) setTrimEnd(prev => prev === 0 ? dur : prev);
    }
  };

  const handleLoadFile = (file: any) => {
    setSelectedFile(file);
    setPosition(0); setDuration(0);
    setTrimStart(0); setTrimEnd(0);
    setScreen('moments');
  };

  const handleSaveClip = () => {
    if (!selectedFile || !clipTitle || trimEnd <= trimStart) return;
    const newClip: Clip = {
      id: Date.now().toString(), title: clipTitle, description: clipDescription,
      videoUri: selectedFile.uri, videoName: selectedFile.name,
      inPoint: trimStart, outPoint: trimEnd, tag: selectedFile.tag,
    };
    setClips(prev => [...prev, newClip]);
    clipsRef.current = [...clipsRef.current, newClip];
    setClipTitle(''); setClipDescription('');
    setScreen('storyboard');
  };

  const generateFCPXML = (allClips: Clip[]): string => {
    const esc = (str: string) => str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    if (allClips.length === 0) return '';
    const assets = allClips.map((clip, i) => ({
      id: `r${i + 2}`, clip,
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
    if (!xml) return;
    if (typeof document !== 'undefined') {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'documentary.fcpxml';
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
                  <Text style={s.cardTitle}>Trim</Text>
                  <TrimScrubber
                    duration={duration}
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    position={position}
                    onTrimStartChange={t => setTrimStart(t)}
                    onTrimEndChange={t => setTrimEnd(t)}
                    onSeek={seekTo}
                  />
                </View>

                {trimEnd > trimStart && (
                  <View style={s.card}>
                    <Text style={s.cardTitle}>Save Moment</Text>
                    <TextInput style={s.input} placeholder="Moment title" value={clipTitle} onChangeText={setClipTitle} />
                    <TextInput style={[s.input, { height: 60, marginTop: 8 }]} placeholder="Notes..." value={clipDescription} onChangeText={setClipDescription} multiline />
                    <TouchableOpacity style={[s.controlBtn, { marginTop: 10, backgroundColor: '#16A34A' }]} onPress={handleSaveClip} disabled={!clipTitle}>
                      <Text style={s.controlBtnText}>Save Moment</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
                  <DraggableCard
                    key={clip.id}
                    clip={clip}
                    index={i}
                    isDragging={dragIdx === i}
                    isHover={hoverIdx === i}
                    dragIdxRef={dragIdxRef}
                    onDragStart={(idx) => { dragIdxRef.current = idx; setDragIdx(idx); setHoverIdx(idx); }}
                    onDragMoveRef={onDragMoveRef}
                    onDragEndRef={onDragEndRef}
                  />
                ))}
                <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
                  <FontAwesome5 name="file-code" size={14} color="#fff" />
                  <Text style={s.exportBtnText}>Export as FCPXML</Text>
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

  scrubTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  scrubRange: { position: 'absolute', height: 6, backgroundColor: '#6695FC', borderRadius: 3, top: 21 },
  scrubPlayhead: { position: 'absolute', width: 2, height: 48, backgroundColor: '#1F2937', top: 0, marginLeft: -1 },
  scrubHandle: { position: 'absolute', width: 20, height: 36, backgroundColor: '#6695FC', borderRadius: 6, top: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  scrubHandleBar: { width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 1 },
  scrubLabelBlue: { fontSize: 11, color: '#6695FC', fontFamily: 'monospace', fontWeight: '600' },
  scrubLabelGray: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },

  thumbBox: { width: 80, height: 56, borderRadius: 8, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  clipTagBadge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 7, borderRadius: 20, marginTop: 4 },
  clipTagText: { fontSize: 10, fontWeight: '600' },
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