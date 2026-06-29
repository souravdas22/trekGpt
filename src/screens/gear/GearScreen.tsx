import { useMemo } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GearItem {
  id: string;
  name: string;
  category: 'Clothing' | 'Gear' | 'Other';
  packed: boolean;
}

interface GearScreenProps {
  navigation?: any;
}

export const GearScreen = ({ navigation }: GearScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Initial items designed to calculate to exactly 72% packed initially (13/18 = 72.2%)
  const [items, setItems] = useState<GearItem[]>([
    { id: '1', name: 'Trekking Shoes', category: 'Clothing', packed: true },
    { id: '2', name: 'Trekking Poles', category: 'Gear', packed: true },
    { id: '3', name: 'Backpack', category: 'Gear', packed: true },
    { id: '4', name: 'Jacket', category: 'Clothing', packed: true },
    { id: '5', name: 'Sleeping Bag', category: 'Gear', packed: false },
    { id: '6', name: 'Headlamp', category: 'Gear', packed: false },
    { id: '7', name: 'Rain Cover', category: 'Other', packed: false },
    { id: '8', name: 'Gloves', category: 'Clothing', packed: false },
    { id: '9', name: 'Water Bottle', category: 'Other', packed: true },
    { id: '10', name: 'First Aid Kit', category: 'Other', packed: true },
    { id: '11', name: 'Sunglasses', category: 'Other', packed: true },
    { id: '12', name: 'Hiking Socks', category: 'Clothing', packed: true },
    { id: '13', name: 'Thermals', category: 'Clothing', packed: true },
    { id: '14', name: 'Energy Bars', category: 'Other', packed: true },
    { id: '15', name: 'Multi-tool', category: 'Other', packed: true },
    { id: '16', name: 'Map & Navigation', category: 'Other', packed: true },
    { id: '17', name: 'Sunscreen', category: 'Other', packed: false },
    { id: '18', name: 'Tent', category: 'Gear', packed: true },
  ]);

  // States
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Clothing' | 'Gear' | 'Other'>('All');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Form States
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'Clothing' | 'Gear' | 'Other'>('Clothing');
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);

  // Calculations
  const filteredItems = items.filter(
    item => selectedCategory === 'All' || item.category === selectedCategory
  );
  const totalCount = items.length;
  const packedCount = items.filter(item => item.packed).length;
  const percentPacked = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  // Circular Chart Parameters
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentPacked / 100) * circumference;

  // Handlers
  const togglePacked = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    const newItem: GearItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      category: itemCategory,
      packed: false,
    };
    setItems(prev => [...prev, newItem]);
    setItemName('');
    setItemCategory('Clothing');
    setAddModalVisible(false);
  };

  const handleOpenEdit = (item: GearItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setEditModalVisible(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !itemName.trim()) return;
    setItems(prev =>
      prev.map(item =>
        item.id === editingItem.id
          ? { ...item, name: itemName.trim(), category: itemCategory }
          : item
      )
    );
    setEditingItem(null);
    setItemName('');
    setEditModalVisible(false);
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;
    setItems(prev => prev.filter(item => item.id !== editingItem.id));
    setEditingItem(null);
    setItemName('');
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gear Checklist</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Progress Card ── */}
        <View style={styles.progressCardContainer}>
          <ImageBackground
            source={require('@assets/images/splash_bg.png')}
            style={styles.progressCardBg}
            imageStyle={styles.progressCardImage}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            
            {/* Circular Progress Ring */}
            <View style={styles.progressRingWrapper}>
              <Svg width={96} height={96} viewBox="0 0 96 96">
                <G rotation={-90} origin="48, 48">
                  {/* Track Circle */}
                  <Circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#A3E635"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressPercent}>{percentPacked}%</Text>
                <Text style={styles.progressLabel}>Packed</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* ── Category Filters ── */}
        <View style={styles.filtersContainer}>
          {(['All', 'Clothing', 'Gear', 'Other'] as const).map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Checklist Items ── */}
        <View style={styles.listContainer}>
          {filteredItems.map((item, index) => {
            const isLast = index === filteredItems.length - 1;
            const isCurrentlyEditing = editingItem?.id === item.id;
            
            return (
              <View key={item.id} style={[styles.itemRow, !isLast && styles.rowBorder]}>
                {/* Left: Pack Checkbox Toggle */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => togglePacked(item.id)}
                  activeOpacity={0.7}
                >
                  {item.packed ? (
                    <View style={styles.checkedCircle}>
                      <Icon name="check-bold" size={14} color="#0D1117" />
                    </View>
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </TouchableOpacity>

                {/* Center: Item Name */}
                <Text style={[styles.itemName, item.packed && styles.itemNamePacked]}>
                  {item.name}
                </Text>

                {/* Right: Edit/Active Circle */}
                <TouchableOpacity
                  style={[
                    styles.editActionCircle,
                    isCurrentlyEditing && styles.editActionCircleActive,
                  ]}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.7}
                >
                  {isCurrentlyEditing ? (
                    <Icon name="pencil" size={14} color="#A3E635" />
                  ) : (
                    <View style={styles.editActionInnerCircle} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ── Add Item Pill Button ── */}
        <TouchableOpacity
          style={styles.addItemBtn}
          onPress={() => {
            setItemName('');
            setItemCategory('Clothing');
            setAddModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={18} color="#A3E635" style={{ marginRight: 6 }} />
          <Text style={styles.addItemBtnText}>Add Item</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Add Item Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Checklist Item</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Trekking Shoes"
                placeholderTextColor={colors.muted}
                value={itemName}
                onChangeText={setItemName}
                autoFocus
              />

              {/* Category selector */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryChipsContainer}>
                {(['Clothing', 'Gear', 'Other'] as const).map(cat => {
                  const isSelected = itemCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setItemCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.submitButton}
                activeOpacity={0.85}
                onPress={handleAddItem}
              >
                <Text style={styles.submitButtonText}>Add to Checklist</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Edit/Delete Item Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditingItem(null);
          setEditModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Item</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditingItem(null);
                    setEditModalVisible(false);
                  }}
                >
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Item Name"
                placeholderTextColor={colors.muted}
                value={itemName}
                onChangeText={setItemName}
              />

              {/* Category selector */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryChipsContainer}>
                {(['Clothing', 'Gear', 'Other'] as const).map(cat => {
                  const isSelected = itemCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setItemCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Actions Row */}
              <View style={styles.editActionsRow}>
                <TouchableOpacity
                  style={[styles.editActionButton, styles.deleteButton]}
                  activeOpacity={0.85}
                  onPress={handleDeleteItem}
                >
                  <Icon name="trash-can-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.editActionButton, styles.updateButton]}
                  activeOpacity={0.85}
                  onPress={handleUpdateItem}
                >
                  <Text style={styles.updateButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(22),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(16),
  },
  backBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerRightPlaceholder: {
    width: normalize(44),
  },

  // Content Scroll
  scrollContent: {
    paddingHorizontal: normalize(22),
    paddingBottom: normalize(110),
  },

  // Progress Card
  progressCardContainer: {
    height: normalize(150),
    borderRadius: normalize(20),
    overflow: 'hidden',
    marginBottom: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  progressCardBg: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: normalize(24),
  },
  progressCardImage: {
    borderRadius: normalize(20),
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 17, 23, 0.45)', // subtle dark mask over bg image
  },
  progressRingWrapper: {
    width: normalize(96),
    height: normalize(96),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: normalizeFont(18),
    fontWeight: '800',
    color: '#FFF',
  },
  progressLabel: {
    fontSize: normalizeFont(9),
    color: colors.muted,
    fontWeight: '600',
    marginTop: normalize(1),
  },

  // Category Filters
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: normalize(8),
    marginBottom: normalize(24),
  },
  filterChip: {
    paddingHorizontal: normalize(18),
    height: normalize(38),
    borderRadius: normalize(19),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: normalizeFont(14),
    color: colors.muted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#0D1117',
    fontWeight: '700',
  },

  // Checklist list
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(4),
    marginBottom: normalize(24),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(16),
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },

  // Checkboxes
  checkboxContainer: {
    marginRight: normalize(14),
  },
  checkedCircle: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: 'transparent',
  },

  // Item info
  itemName: {
    flex: 1,
    fontSize: normalizeFont(15),
    color: colors.text,
    fontWeight: '500',
  },
  itemNamePacked: {
    color: colors.muted,
    textDecorationLine: 'none', // Screenshot shows normal text styling just a bit muted
  },

  // Edit Action Circle
  editActionCircle: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: 'transparent',
  },
  editActionCircleActive: {
    borderColor: '#A3E635',
  },
  editActionInnerCircle: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: colors.outline, // Small middle dot
  },

  // Add Item Button
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(48),
    borderRadius: normalize(24),
    borderWidth: 1.5,
    borderColor: '#A3E635',
    backgroundColor: colors.surface,
    alignSelf: 'center',
    paddingHorizontal: normalize(24),
  },
  addItemBtnText: {
    color: '#A3E635',
    fontSize: normalizeFont(15),
    fontWeight: '700',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: normalize(24),
    minHeight: normalize(320),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(24),
  },
  modalTitle: {
    fontSize: normalizeFont(20),
    fontWeight: '800',
    color: colors.text,
  },
  inputLabel: {
    fontSize: normalizeFont(14),
    fontWeight: '600',
    color: colors.muted,
    marginBottom: normalize(10),
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    fontSize: normalizeFont(16),
    color: colors.text,
    marginBottom: normalize(20),
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    gap: normalize(8),
    marginBottom: normalize(24),
  },
  categoryChip: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  categoryChipActive: {
    backgroundColor: '#A3E635',
    borderColor: '#A3E635',
  },
  categoryChipText: {
    fontSize: normalizeFont(13),
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#0D1117',
  },
  submitButton: {
    backgroundColor: '#A3E635',
    height: normalize(52),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#0D1117',
    fontSize: normalizeFont(16),
    fontWeight: '800',
  },

  // Edit action items
  editActionsRow: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  editActionButton: {
    flex: 1,
    height: normalize(52),
    borderRadius: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: normalizeFont(16),
    fontWeight: '800',
  },
  updateButton: {
    backgroundColor: '#A3E635',
  },
  updateButtonText: {
    color: '#0D1117',
    fontSize: normalizeFont(16),
    fontWeight: '800',
  },
});
