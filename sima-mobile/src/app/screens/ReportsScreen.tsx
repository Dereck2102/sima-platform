import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  Alert
} from 'react-native';
import { AuthService } from '../services/auth.service';

const API_URL = '/api/reports';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  formats: string[];
  requiresAdmin: boolean;
}

interface GeneratedReport {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileName?: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'asset-inventory',
    name: 'Inventario de Activos',
    description: 'Lista completa de todos los activos',
    icon: '📦',
    formats: ['PDF', 'CSV', 'XLSX'],
    requiresAdmin: false,
  },
  {
    id: 'asset-valuation',
    name: 'Valoración de Activos',
    description: 'Valores por categoría y estado',
    icon: '💰',
    formats: ['PDF', 'CSV'],
    requiresAdmin: false,
  },
  {
    id: 'location-summary',
    name: 'Resumen por Ubicación',
    description: 'Activos agrupados por ubicación',
    icon: '📍',
    formats: ['PDF', 'CSV'],
    requiresAdmin: false,
  },
];

export const ReportsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [format, setFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getAccessToken();
      const user = await AuthService.getCurrentUser();
      
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': user?.tenantId || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedReports(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!selectedReport) return;
    
    setGenerating(true);
    try {
      const token = await AuthService.getAccessToken();
      const user = await AuthService.getCurrentUser();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-tenant-id': user?.tenantId || '',
        },
        body: JSON.stringify({
          type: selectedReport.id,
          format: format,
        }),
      });

      if (response.ok) {
        // Optimistic update
        const newReport: GeneratedReport = {
          id: Date.now().toString(),
          type: selectedReport.name,
          format: format,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        setGeneratedReports([newReport, ...generatedReports]);
        setSelectedReport(null);
        Alert.alert('Success', 'Report generation started');
        // Reload to get real status
        setTimeout(fetchReports, 2000);
      } else {
        const err = await response.json();
        Alert.alert('Error', err.message || 'Failed to generate report');
      }
    } catch (e) {
      Alert.alert('Error', 'Connection failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const token = await AuthService.getAccessToken();
      const user = await AuthService.getCurrentUser();
      const response = await fetch(`${API_URL}/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': user?.tenantId || '',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        
        if (Platform.OS === 'web') {
           const url = window.URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `report-${reportId}.${format.toLowerCase()}`;
           a.click();
           window.URL.revokeObjectURL(url);
        } else {
           Alert.alert('Notice', 'Download not yet supported on Native device. Please use Web version.');
        }
      } else {
        Alert.alert('Error', 'Download failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Connection failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity onPress={fetchReports} style={styles.reloadBtn}>
          <Text style={styles.reloadText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Generate Report</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
          {REPORT_TYPES.map(report => (
            <TouchableOpacity 
              key={report.id} 
              style={[styles.typeCard, selectedReport?.id === report.id && styles.selectedCard]}
              onPress={() => setSelectedReport(report)}
            >
              <Text style={styles.typeIcon}>{report.icon}</Text>
              <Text style={styles.typeName}>{report.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedReport && (
          <View style={styles.generatePanel}>
            <Text style={styles.panelTitle}>Generate: {selectedReport.name}</Text>
            <View style={styles.formatRow}>
              {selectedReport.formats.map(f => (
                <TouchableOpacity 
                  key={f} 
                  style={[styles.formatBtn, format === f && styles.selectedFormat]}
                  onPress={() => setFormat(f)}
                >
                  <Text style={[styles.formatText, format === f && styles.selectedFormatText]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.generateBtn}
              onPress={handleGenerate}
              disabled={generating}
            >
               {generating ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>Generate Report</Text>}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>History</Text>
        {loading && generatedReports.length === 0 ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <View style={styles.list}>
            {generatedReports.map(report => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportInfo}>
                   <Text style={styles.reportType}>{report.type}</Text>
                   <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}</Text>
                </View>
                <View style={styles.reportActions}>
                   <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                     <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>{report.status}</Text>
                   </View>
                   {report.status === 'completed' && (
                     <TouchableOpacity onPress={() => handleDownload(report.id)} style={styles.downloadBtn}>
                       <Text style={styles.downloadText}>📥</Text>
                     </TouchableOpacity>
                   )}
                </View>
              </View>
            ))}
            {generatedReports.length === 0 && (
              <Text style={styles.emptyText}>No reports generated yet.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' 
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 24, color: '#007AFF', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: '700' },
  reloadBtn: { padding: 8 },
  reloadText: { fontSize: 24, color: '#007AFF' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  typesScroll: { marginBottom: 20 },
  typeCard: { 
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginRight: 12, 
    width: 140, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 
  },
  selectedCard: { borderColor: '#007AFF', borderWidth: 2 },
  typeIcon: { fontSize: 32, marginBottom: 8 },
  typeName: { fontWeight: '600', textAlign: 'center', fontSize: 13 },
  generatePanel: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24 },
  panelTitle: { fontWeight: '600', marginBottom: 12 },
  formatRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  formatBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#f0f0f0' },
  selectedFormat: { backgroundColor: '#007AFF' },
  formatText: { color: '#333', fontSize: 12, fontWeight: '600' },
  selectedFormatText: { color: '#fff' },
  generateBtn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  list: { paddingBottom: 40 },
  reportItem: { 
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  reportInfo: { flex: 1 },
  reportType: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  reportDate: { color: '#888', fontSize: 12 },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  downloadBtn: { padding: 8, backgroundColor: '#f0f9ff', borderRadius: 20 },
  downloadText: { fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});
