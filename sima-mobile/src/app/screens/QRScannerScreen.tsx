import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, TextInput } from 'react-native';
import { QrReader } from 'react-qr-reader';

export const QRScannerScreen = ({ navigation }: any) => {
  const [data, setData] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  const handleScan = (result: any, error: any) => {
    if (!!result) {
      setData(result?.text);
      Alert.alert('QR Detected', `Code: ${result?.text}`, [
        { text: 'View Asset', onPress: () => navigation.navigate('Assets', { search: result?.text }) }
      ]);
    }
    if (!!error) {
      // console.info(error);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      navigation.navigate('Assets', { search: manualCode });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.content}>
        {Platform.OS === 'web' ? (
          <View style={styles.scannerContainer}>
            <Text style={styles.instruction}>Point your camera at a QR Code</Text>
            <View style={styles.webScanner}>
              <QrReader
                onResult={handleScan}
                constraints={{ facingMode: 'environment' }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text style={styles.hint}>Ensure you have granted camera permissions</Text>
          </View>
        ) : (
          <View style={styles.nativePlaceholder}>
             <Text style={styles.icon}>📷</Text>
             <Text style={styles.nativeText}>
               For Native App, we use 'react-native-camera-kit'. 
               (This view is only visible in development without native linkage)
             </Text>
          </View>
        )}

        <View style={styles.manualEntry}>
          <Text style={styles.orText}>OR Enter Code Manually</Text>
          <TextInput 
            style={styles.input}
            placeholder="Asset Tag (e.g., LAP-001)"
            value={manualCode}
            onChangeText={setManualCode}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleManualSubmit}>
            <Text style={styles.btnText}>Search Asset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {data && (
        <View style={styles.resultOverlay}>
          <Text style={styles.resultText}>Detected: {data}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.5)'
  },
  backBtn: { padding: 8 },
  backText: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scannerContainer: { width: '100%', alignItems: 'center', flex: 1 },
  webScanner: { 
    width: 300, height: 300, overflow: 'hidden', borderRadius: 20, 
    borderWidth: 2, borderColor: '#007AFF', marginVertical: 20, backgroundColor: '#333'
  },
  instruction: { color: '#fff', marginTop: 20, fontSize: 16 },
  hint: { color: '#aaa', fontSize: 12, marginBottom: 20 },
  nativePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  nativeText: { color: '#fff', textAlign: 'center', marginTop: 20 },
  icon: { fontSize: 64 },
  manualEntry: { 
    width: '100%', padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 
  },
  orText: { textAlign: 'center', color: '#666', marginBottom: 16, fontWeight: '600' },
  input: { 
    backgroundColor: '#f0f0f0', padding: 14, borderRadius: 12, marginBottom: 12, fontSize: 16 
  },
  searchBtn: { 
    backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' 
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultOverlay: {
    position: 'absolute', bottom: 120, alignSelf: 'center',
    backgroundColor: 'rgba(0,255,0,0.8)', padding: 10, borderRadius: 8
  },
  resultText: { color: '#000', fontWeight: 'bold' }
});
