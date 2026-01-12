import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { AssetService } from '../services/asset.service';
import { AuthService } from '../services/auth.service';

interface IAsset {
  id: string;
  name: string;
  internalCode: string;
  price: number;
  status: string;
  locationId: string;
}

interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

export const HomeScreen = ({ navigation }: any) => {
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadUser(), fetchAssets()]);
  };

  const loadUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await AssetService.getAll();
      setAssets(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [
          { text: 'OK', onPress: handleLogout },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssets();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>
            <View style={styles.tenantBadge}>
              <Text style={styles.tenantBadgeText}>📍 {user?.tenantId}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Assets List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{assets.length}</Text>
              <Text style={styles.statLabel}>Total Assets</Text>
            </View>
          </View>

          {assets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No assets found</Text>
              <Text style={styles.emptySubtext}>
                Create one via the API Gateway
              </Text>
            </View>
          ) : (
            assets.map((asset) => (
              <View key={asset.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{asset.name}</Text>
                  <Text style={styles.price}>
                    {typeof asset.price === 'number'
                      ? '$' + asset.price.toFixed(2)
                      : asset.price}
                  </Text>
                </View>
                <Text style={styles.code}>ID: {asset.internalCode}</Text>
                <View style={styles.badgeContainer}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{asset.status}</Text>
                  </View>
                  <View style={styles.locationBadge}>
                    <Text style={styles.locationBadgeText}>
                      📍 {asset.locationId}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0288D1',
    textTransform: 'uppercase',
  },
  tenantBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tenantBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7B1FA2',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    opacity: 0.9,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  price: {
    fontSize: 20,
    color: '#34C759',
    fontWeight: '800',
  },
  code: {
    color: '#8E8E93',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0288D1',
  },
  locationBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E65100',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});
