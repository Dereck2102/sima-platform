import React, { useEffect, useState, useMemo } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import { AssetService, Asset, CreateAssetDto } from '../services/asset.service';
import { AuthService } from '../services/auth.service';
import { GeoService } from '../services/geo.service';

interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

const STATUSES = ['ACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED'];
const CONDITIONS = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

export const HomeScreen = ({ navigation }: any) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Form state
  const [form, setForm] = useState<CreateAssetDto>({
    internalCode: '',
    name: '',
    description: '',
    price: 0,
    status: 'ACTIVE',
    condition: 'NEW',
    locationId: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    latitude: undefined,
    longitude: undefined,
  });

  // Filtered assets based on search
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const query = searchQuery.toLowerCase();
    return assets.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.internalCode.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    );
  }, [assets, searchQuery]);

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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const openCreateModal = () => {
    setSelectedAsset(null);
    setForm({
      internalCode: '',
      name: '',
      description: '',
      price: 0,
      status: 'ACTIVE',
      condition: 'NEW',
      locationId: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      latitude: undefined,
      longitude: undefined,
    });
    setShowModal(true);
  };

  const handleGetLocation = async () => {
    if (!GeoService.isAvailable()) {
      Alert.alert('Error', 'Geolocation is not available on this device');
      return;
    }
    
    setGettingLocation(true);
    try {
      const coords = await GeoService.getCurrentPosition();
      setForm(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      Alert.alert('Location Captured', GeoService.formatCoordinates(coords.latitude, coords.longitude));
    } catch (error: any) {
      Alert.alert('Location Error', error.message || 'Could not get location');
    } finally {
      setGettingLocation(false);
    }
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setForm({
      internalCode: asset.internalCode,
      name: asset.name,
      description: asset.description || '',
      price: asset.price,
      status: asset.status,
      condition: asset.condition,
      locationId: asset.locationId || '',
      acquisitionDate: asset.acquisitionDate?.split('T')[0] || '',
      latitude: asset.latitude,
      longitude: asset.longitude,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.internalCode || !form.name) {
      Alert.alert('Error', 'Code and name are required');
      return;
    }
    
    setSaving(true);
    try {
      if (selectedAsset) {
        await AssetService.update(selectedAsset.id, form);
        Alert.alert('Success', 'Asset updated');
      } else {
        await AssetService.create(form);
        Alert.alert('Success', 'Asset created');
      }
      setShowModal(false);
      fetchAssets();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (asset: Asset) => {
    Alert.alert('Delete Asset', `Delete "${asset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AssetService.delete(asset.id);
            fetchAssets();
          } catch {
            Alert.alert('Error', 'Could not delete');
          }
        },
      },
    ]);
  };

  const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{assets.length}</Text>
          <Text style={styles.statLabel}>Assets</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#34C759' }]}>
          <Text style={styles.statNumber}>${totalValue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search assets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
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
          {filteredAssets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>{searchQuery ? 'No matching assets' : 'No assets found'}</Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
                  <Text style={styles.createButtonText}>+ Create Asset</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredAssets.map((asset) => (
              <TouchableOpacity key={asset.id} style={styles.card} onPress={() => openEditModal(asset)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{asset.name}</Text>
                  <Text style={styles.price}>${Number(asset.price).toLocaleString()}</Text>
                </View>
                <Text style={styles.code}>📋 {asset.internalCode}</Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: asset.status === 'ACTIVE' ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={[styles.statusBadgeText, { color: asset.status === 'ACTIVE' ? '#2E7D32' : '#E65100' }]}>
                      {asset.status}
                    </Text>
                  </View>
                  <View style={styles.conditionBadge}>
                    <Text style={styles.conditionText}>{asset.condition}</Text>
                  </View>
                </View>
                {asset.latitude && asset.longitude && (
                  <Text style={styles.locationText}>📍 {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}</Text>
                )}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(asset)}>
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedAsset ? '✏️ Edit Asset' : '➕ New Asset'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Internal Code *"
              value={form.internalCode}
              onChangeText={(v) => setForm({...form, internalCode: v})}
              editable={!selectedAsset}
            />
            <TextInput
              style={styles.input}
              placeholder="Name *"
              value={form.name}
              onChangeText={(v) => setForm({...form, name: v})}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={form.description}
              onChangeText={(v) => setForm({...form, description: v})}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={String(form.price)}
              onChangeText={(v) => setForm({...form, price: parseFloat(v) || 0})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={form.locationId}
              onChangeText={(v) => setForm({...form, locationId: v})}
            />
            
            {/* Get Location Button */}
            <TouchableOpacity 
              style={[styles.locationBtn, gettingLocation && styles.locationBtnDisabled]} 
              onPress={handleGetLocation}
              disabled={gettingLocation}
            >
              <Text style={styles.locationBtnText}>
                {gettingLocation ? '📡 Getting location...' : '📍 Get Current Location'}
              </Text>
            </TouchableOpacity>
            
            {form.latitude && form.longitude && (
              <Text style={styles.coordsText}>
                📍 {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
              </Text>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    backgroundColor: '#FFFFFF', padding: 20, borderBottomWidth: 1, borderColor: '#E5E5EA',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  userInfo: { flex: 1 },
  welcomeText: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  roleBadge: { backgroundColor: '#E1F5FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#0288D1', textTransform: 'uppercase' },
  logoutButton: { backgroundColor: '#FF3B30', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#007AFF', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 14, color: '#fff', marginTop: 4, opacity: 0.9 },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', flex: 1 },
  price: { fontSize: 18, color: '#34C759', fontWeight: '800' },
  code: { color: '#8E8E93', fontSize: 13, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  conditionBadge: { backgroundColor: '#F3E5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  conditionText: { fontSize: 11, fontWeight: '600', color: '#7B1FA2' },
  deleteBtn: { position: 'absolute', top: 12, right: 12 },
  deleteBtnText: { fontSize: 18 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#8E8E93', marginBottom: 16 },
  createButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '600', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#F2F2F7', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E5EA',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#E5E5EA', padding: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600', color: '#666' },
  saveBtn: { flex: 1, backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { fontWeight: '700', color: '#fff' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { 
    backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 16, 
    borderWidth: 1, borderColor: '#E5E5EA',
  },
  locationText: { color: '#007AFF', fontSize: 12, marginTop: 8 },
  locationBtn: { 
    backgroundColor: '#E8F5E9', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12,
  },
  locationBtnDisabled: { backgroundColor: '#F5F5F5' },
  locationBtnText: { color: '#2E7D32', fontWeight: '600', fontSize: 14 },
  coordsText: { 
    color: '#007AFF', fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: '500',
  },
});
