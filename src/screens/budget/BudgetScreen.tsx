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
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategoryBreakdown {
  id: string;
  name: string;
  spent: number;
  allocated: number;
  icon: string;
}

interface BudgetScreenProps {
  navigation?: any;
}

export const BudgetScreen = ({ navigation }: BudgetScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // State
  const [totalBudget, setTotalBudget] = useState<number>(15000);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([
    { id: '1', name: 'Travel', spent: 3200, allocated: 5000, icon: 'train-car-passenger-outline' },
    { id: '2', name: 'Permits', spent: 1500, allocated: 1500, icon: 'card-text-outline' },
    { id: '3', name: 'Stay', spent: 2400, allocated: 3000, icon: 'home-outline' },
    { id: '4', name: 'Food', spent: 2100, allocated: 3000, icon: 'food-apple-outline' },
    { id: '5', name: 'Gear', spent: 1300, allocated: 2600, icon: 'bag-personal-outline' },
    { id: '6', name: 'Misc', spent: 700, allocated: 2333, icon: 'dots-horizontal-circle-outline' },
  ]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('1');
  const [inputAmount, setInputAmount] = useState('');

  // Calculations
  const totalSpent = breakdown.reduce((sum, item) => sum + item.spent, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  // Circular Chart Parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentUsed / 100) * circumference;

  // Add Expense Handler
  const handleAddExpense = () => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    setBreakdown(prevBreakdown =>
      prevBreakdown.map(item => {
        if (item.id === selectedCategoryId) {
          return {
            ...item,
            spent: item.spent + amount,
          };
        }
        return item;
      })
    );

    setInputAmount('');
    setModalVisible(false);
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
        <Text style={styles.headerTitle}>Budget Planner</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Overview Panel (Total & Ring) ── */}
        <View style={styles.overviewContainer}>
          <View style={styles.totalBudgetCol}>
            <Text style={styles.labelMuted}>Total Budget</Text>
            <Text style={styles.totalBudgetText}>₹ {totalBudget.toLocaleString()}</Text>
          </View>

          {/* SVG Circular Progress Ring */}
          <View style={styles.chartCol}>
            <Svg width={110} height={110} viewBox="0 0 110 110">
              <G rotation={-90} origin="55, 55">
                {/* Track circle */}
                <Circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="#161B22"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Animated fill circle */}
                <Circle
                  cx="55"
                  cy="55"
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
            {/* Center Label */}
            <View style={styles.chartTextContainer}>
              <Text style={styles.chartPercentText}>{percentUsed}%</Text>
              <Text style={styles.chartLabelText}>Used</Text>
            </View>
          </View>
        </View>

        {/* ── Spent / Remaining Cards ── */}
        <View style={styles.cardsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>Used</Text>
            <Text style={styles.cardValue}>₹ {totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>Remaining</Text>
            <Text style={styles.cardValue}>₹ {remainingBudget.toLocaleString()}</Text>
          </View>
        </View>

        {/* ── Breakdown List ── */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Breakdown</Text>

          {breakdown.map((item, index) => {
            const itemPercent = Math.min(100, Math.round((item.spent / item.allocated) * 100));
            const isLast = index === breakdown.length - 1;

            return (
              <View key={item.id} style={[styles.breakdownRow, !isLast && styles.rowBorder]}>
                {/* Left: Icon */}
                <View style={styles.categoryIconContainer}>
                  <Icon name={item.icon} size={22} color={colors.text} />
                </View>

                {/* Center: Title & Progress Bar */}
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {/* Custom Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${itemPercent}%` }]} />
                  </View>
                </View>

                {/* Right: Amount & Percent */}
                <View style={styles.categoryValues}>
                  <Text style={styles.categoryAmount}>₹ {item.spent.toLocaleString()}</Text>
                  <Text style={styles.categoryPercent}>{itemPercent}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Floating Action Button ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus" size={28} color="#0D1117" />
      </TouchableOpacity>

      {/* ── Add Expense Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Expense</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Select Category Chips */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryChipsContainer}>
                {breakdown.map(cat => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Icon
                        name={cat.icon}
                        size={16}
                        color={isSelected ? '#0D1117' : colors.text}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Amount Input */}
              <Text style={styles.inputLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={inputAmount}
                onChangeText={setInputAmount}
                autoFocus
              />

              {/* Action Button */}
              <TouchableOpacity
                style={styles.submitButton}
                activeOpacity={0.85}
                onPress={handleAddExpense}
              >
                <Text style={styles.submitButtonText}>Add Expense</Text>
              </TouchableOpacity>
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
    paddingBottom: normalize(100),
  },

  // Overview Panel
  overviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(24),
  },
  totalBudgetCol: {
    flex: 1,
  },
  labelMuted: {
    fontSize: normalizeFont(14),
    color: colors.muted,
    fontWeight: '500',
    marginBottom: normalize(6),
  },
  totalBudgetText: {
    fontSize: normalizeFont(32),
    fontWeight: '800',
    color: colors.text,
  },
  chartCol: {
    width: normalize(110),
    height: normalize(110),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPercentText: {
    fontSize: normalizeFont(18),
    fontWeight: '800',
    color: colors.text,
  },
  chartLabelText: {
    fontSize: normalizeFont(10),
    color: colors.muted,
    fontWeight: '600',
    marginTop: normalize(1),
  },

  // Cards
  cardsRow: {
    flexDirection: 'row',
    gap: normalize(16),
    marginBottom: normalize(24),
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(16),
  },
  cardLabel: {
    fontSize: normalizeFont(13),
    color: colors.muted,
    fontWeight: '500',
    marginBottom: normalize(6),
  },
  cardValue: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
  },

  // Breakdown Card
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: colors.outline,
    padding: normalize(20),
  },
  breakdownTitle: {
    fontSize: normalizeFont(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(20),
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(16),
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  categoryIconContainer: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(14),
  },
  categoryDetails: {
    flex: 1,
    marginRight: normalize(16),
  },
  categoryName: {
    fontSize: normalizeFont(15),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(8),
  },
  progressBarTrack: {
    height: normalize(4),
    backgroundColor: '#2D333B',
    borderRadius: normalize(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A3E635',
    borderRadius: normalize(2),
  },
  categoryValues: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  categoryAmount: {
    fontSize: normalizeFont(15),
    fontWeight: '700',
    color: colors.text,
    marginBottom: normalize(4),
  },
  categoryPercent: {
    fontSize: normalizeFont(12),
    fontWeight: '600',
    color: '#A3E635',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: normalize(30),
    right: normalize(22),
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Modal
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
    minHeight: normalize(400),
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
    marginBottom: normalize(12),
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(8),
    marginBottom: normalize(20),
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(14),
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
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    fontSize: normalizeFont(16),
    color: colors.text,
    marginBottom: normalize(24),
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
});
