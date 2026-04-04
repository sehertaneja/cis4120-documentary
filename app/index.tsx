import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [screen, setScreen] = useState('hello');
  const [importedFiles, setImportedFiles] = useState<any[]>([]);

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

  return (
    <View style={{ flex: 1 }}>

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, screen === 'hello' && styles.tabActive]}
          onPress={() => setScreen('hello')}
        >
          <Text style={[styles.tabText, screen === 'hello' && styles.tabTextActive]}>
            Hello World
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, screen === 'styles' && styles.tabActive]}
          onPress={() => setScreen('styles')}
        >
          <Text style={[styles.tabText, screen === 'styles' && styles.tabTextActive]}>
            Hello Styles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, screen === 'import' && styles.tabActive]}
          onPress={() => setScreen('import')}
        >
          <Text style={[styles.tabText, screen === 'import' && styles.tabTextActive]}>
            File Import
          </Text>
        </TouchableOpacity>
      </View>

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

          <View style={styles.colorRow}>
            <View style={[styles.swatch, { backgroundColor: '#6695FC' }]} />
            <Text style={styles.colorLabel}>#6695FC — Blue</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.swatch, { backgroundColor: '#5A5F67' }]} />
            <Text style={styles.colorLabel}>#5A5F67 — Light Gray</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.swatch, { backgroundColor: '#1F2937' }]} />
            <Text style={styles.colorLabel}>#1F2937 — Dark Gray</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.swatch, { backgroundColor: '#111827' }]} />
            <Text style={styles.colorLabel}>#111827 — Medium Gray</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.swatch, { backgroundColor: '#F7FF00', borderWidth: 1, borderColor: '#ccc' }]} />
            <Text style={styles.colorLabel}>#F7FF00 — Yellow</Text>
          </View>

          <Text style={styles.sectionTitle}>Typeface — Inter</Text>

          <View style={styles.typeBox}>
            <Text style={styles.typeLabel}>Light (300)</Text>
            <Text style={[styles.typeSample, { fontWeight: '300' }]}>
              The quick brown fox jumps over the lazy dog.
            </Text>
          </View>
          <View style={styles.typeBox}>
            <Text style={styles.typeLabel}>Medium (500)</Text>
            <Text style={[styles.typeSample, { fontWeight: '500' }]}>
              The quick brown fox jumps over the lazy dog.
            </Text>
          </View>
          <View style={styles.typeBox}>
            <Text style={styles.typeLabel}>Bold (700)</Text>
            <Text style={[styles.typeSample, { fontWeight: '700' }]}>
              The quick brown fox jumps over the lazy dog.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Icons</Text>

          <View style={styles.iconGrid}>
            <View style={styles.iconCell}>
              <MaterialCommunityIcons name="movie-open" size={32} color="#6695FC" />
              <Text style={styles.iconLabel}>Projects</Text>
            </View>
            <View style={styles.iconCell}>
              <MaterialCommunityIcons name="filmstrip" size={32} color="#6695FC" />
              <Text style={styles.iconLabel}>Clips</Text>
            </View>
            <View style={styles.iconCell}>
              <MaterialCommunityIcons name="clock-outline" size={32} color="#6695FC" />
              <Text style={styles.iconLabel}>Moments</Text>
            </View>
            <View style={styles.iconCell}>
              <Ionicons name="cloud-upload" size={32} color="#6695FC" />
              <Text style={styles.iconLabel}>Upload</Text>
            </View>
            <View style={styles.iconCell}>
              <Ionicons name="search" size={32} color="#6695FC" />
              <Text style={styles.iconLabel}>Search</Text>
            </View>
            <View style={styles.iconCell}>
              <FontAwesome5 name="share-alt" size={32} color="#6695FC" />
              <Text style={styles.iconLabel}>Export</Text>
            </View>
          </View>

        </ScrollView>
      )}

      {/* ── Screen 3: File Import ── */}
      {screen === 'import' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

          <Text style={styles.pageTitle}>File Import</Text>
          <Text style={styles.pageSubtitle}>
            Import video or audio files from your computer.
          </Text>

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

    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 48,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6695FC' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#5A5F67' },
  tabTextActive: { color: '#6695FC' },

  helloContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  helloText: { fontSize: 48, fontWeight: '700', color: '#1F2937' },
  helloSub: { fontSize: 16, fontWeight: '300', color: '#5A5F67', marginTop: 12 },

  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24, paddingBottom: 48 },
  pageTitle: { fontSize: 32, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, fontWeight: '300', color: '#5A5F67', marginBottom: 32 },

  sectionTitle: {
    fontSize: 18, fontWeight: '600', color: '#1F2937',
    marginTop: 28, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: '#6695FC', paddingLeft: 10,
  },

  colorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10 },
  swatch: { width: 48, height: 48, borderRadius: 10, marginRight: 14 },
  colorLabel: { fontSize: 15, fontWeight: '500', color: '#1F2937' },

  typeBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10 },
  typeLabel: { fontSize: 11, color: '#6695FC', fontWeight: '500', marginBottom: 6 },
  typeSample: { fontSize: 18, color: '#1F2937' },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconCell: { width: '28%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 4 },
  iconLabel: { fontSize: 11, color: '#5A5F67', marginTop: 8, fontWeight: '500' },

  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6695FC',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  importBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '500', color: '#9CA3AF', marginTop: 12 },
  emptySubtext: { fontSize: 13, fontWeight: '300', color: '#D1D5DB', marginTop: 4 },

  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  fileUri: { fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' },
});