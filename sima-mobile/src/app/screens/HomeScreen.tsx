import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { AuthService } from '../services/auth.service';
import { AssetService } from '../services/asset.service';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  activeAssets: number;
  maintenanceAssets: number;
}

export const HomeScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalValue: 0,
    activeAssets: 0,
    maintenanceAssets: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);
    
    // Validate token exists
    const token = await AuthService.getAccessToken();
    if (!token) {
      console.log('[HomeScreen] No token, redirecting to login');
      navigation.replace('Login');
      return;
    }

    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      console.log('[HomeScreen] No user data, clearing session');
      await AuthService.logout();
      navigation.replace('Login');
      return;
    }
    
    setUser(currentUser);
    
    // Fetch stats (we'll calculate from all assets for now, ideally backend provides this)
    try {
      const assets = await AssetService.getAll();
      console.log('[HomeScreen] Loaded assets:', assets.length);
      const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const active = assets.filter(a => a.status === 'ACTIVE').length;
      const maintenance = assets.filter(a => a.status === 'IN_MAINTENANCE').length;
      
      setStats({
        totalAssets: assets.length,
        totalValue,
        activeAssets: active,
        maintenanceAssets: maintenance,
      });
    } catch (e: any) {
      console.error('Failed to load stats', e);
      // If unauthorized, force re-login
      if (e?.response?.status === 401) {
        await AuthService.logout();
        navigation.replace('Login');
        return;
      }
      setError('Failed to load data. Pull down to refresh.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const menuItems = [
    { title: 'Assets Inventory', icon: '📦', route: 'Assets', params: undefined, color: '#4CAF50' },
    { title: 'Scan QR', icon: '📷', route: 'Placeholder', params: { title: 'QR Scanner' }, color: '#2196F3' },
    { title: 'Reports', icon: '📊', route: 'Placeholder', params: { title: 'Reports' }, color: '#FF9800' },
    { title: 'My Profile', icon: '👤', route: 'Profile', params: undefined, color: '#9C27B0' },
  ];

  const handleProfileClick = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleProfileClick} style={styles.profileBtn}>
            <Text style={styles.profileInitials}>
              {user?.fullName?.charAt(0) || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statLabelLight}>Total Value</Text>
            <Text style={styles.statValueLight}>${stats.totalValue.toLocaleString()}</Text>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>Across {stats.totalAssets} assets</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.statCard, styles.halfCard]}>
              <Text style={styles.icon}>✅</Text>
              <Text style={styles.statValue}>{stats.activeAssets}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={[styles.statCard, styles.halfCard]}>
              <Text style={styles.icon}>🔧</Text>
              <Text style={styles.statValue}>{stats.maintenanceAssets}</Text>
              <Text style={styles.statLabel}>In Maint.</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.route, item.params)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.gridTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Placeholder */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.emptyText}>No recent activity</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitials: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#1E293B',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  statLabelLight: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  statValueLight: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
  },
  statFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statFooterText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  gridItem: {
    width: (width - 56) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIcon: {
    fontSize: 28,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
