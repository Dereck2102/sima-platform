import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { AssetService } from './services/asset.service';

interface IAsset {
  id: string;
  name: string;
  internalCode: string;
  price: number;
  status: string;
  locationId: string;
}

export const App = () => {
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await AssetService.getAll();
      setAssets(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SIMA Mobile</Text>
          <Text style={styles.subtitle}>Connected to Gateway :3000</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={fetchAssets}>
          <Text style={styles.buttonText}>Refresh List</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {assets.length === 0 ? (
              <Text style={styles.empty}>No assets found. Create one via cURL.</Text>
            ) : (
              assets.map((asset) => (
                <View key={asset.id} style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.cardTitle}>{asset.name}</Text>
                    <Text style={styles.price}>
                      {typeof asset.price === 'number' ? '$' + asset.price : asset.price}
                    </Text>
                  </View>
                  <Text style={styles.code}>ID: {asset.internalCode}</Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>{asset.status}</Text>
                    <Text style={[styles.badge, styles.badgeGray]}>{asset.locationId}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', minHeight: '100vh' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E5EA' },
  title: { fontSize: 24, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 14, color: '#34C759', marginTop: 4, fontWeight: '600' },
  button: { backgroundColor: '#007AFF', padding: 12, margin: 16, borderRadius: 10, alignItems: 'center', cursor: 'pointer' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  loader: { marginTop: 20 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  price: { fontSize: 18, color: '#007AFF', fontWeight: '700' },
  code: { color: '#8E8E93', marginTop: 4, fontSize: 13, fontFamily: 'monospace' },
  badgeContainer: { flexDirection: 'row', marginTop: 12 },
  badge: { fontSize: 11, fontWeight: '700', backgroundColor: '#E1F5FE', color: '#0288D1', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginRight: 8 },
  badgeGray: { backgroundColor: '#F2F2F7', color: '#636366' },
  empty: { textAlign: 'center', marginTop: 50, color: '#8E8E93' }
});

export default App;
