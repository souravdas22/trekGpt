import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleLikeTrek } from '../../store/slices/likedTreksSlice';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

interface AiRecommendationCardProps {
  id: string;
  title: string;
  location: string;
  days: string;
  difficulty: string;
  price: string;
  imageUrl: string;
  onGenerateItinerary?: () => void;
  onGeneratePackingList?: () => void;
}

export const AiRecommendationCard: React.FC<AiRecommendationCardProps> = ({ 
  id, title, location, days, difficulty, price, imageUrl, onGenerateItinerary, onGeneratePackingList
}) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const likedTrekIds = useSelector((state: RootState) => state.likedTreks.likedTrekIds);
  const isLiked = likedTrekIds.includes(id);

  const handleViewDetails = () => {
    // In a real scenario we might navigate to trek details using the id
    navigation.navigate('TrekDetails', { trekId: id });
  };

  const handleSave = () => {
    dispatch(toggleLikeTrek(id));
    Toast.show({
      type: 'success',
      text1: isLiked ? 'Removed from saved treks' : 'Trek Saved',
      position: 'bottom',
    });
  };

  return (
    <View style={styles.trekCard}>
      <View style={styles.trekCardImageContainer}>
        <Image source={{uri: imageUrl}} style={styles.trekCardImage} />
        <TouchableOpacity style={styles.favoriteBtn} onPress={handleSave}>
          <Icon name={isLiked ? "heart" : "heart-outline"} size={16} color={isLiked ? "#EF4444" : colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.trekCardContent}>
        <Text style={styles.trekCardTitle}>{title}</Text>
        <View style={styles.trekLocationRow}>
          <Icon name="map-marker-outline" size={14} color={colors.muted} />
          <Text style={styles.trekCardLocation}>{location}</Text>
        </View>
        <View style={styles.trekStatsRow}>
          <Icon name="calendar-blank-outline" size={14} color={colors.muted} />
          <Text style={styles.trekCardStat}>{days}</Text>
          <View style={styles.statDivider} />
          <Icon name="poll" size={14} color={colors.muted} />
          <Text style={styles.trekCardStat}>{difficulty}</Text>
        </View>
        <View style={styles.trekPriceRow}>
          <Text style={styles.trekCardPrice}>{price}</Text>
          <Text style={styles.trekCardPriceSuffix}> per person</Text>
        </View>
        
        <View style={styles.trekActionsRow}>
          <TouchableOpacity style={styles.viewDetailsBtn} onPress={handleViewDetails}>
            <Text style={styles.viewDetailsBtnText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.planBtn} onPress={onGenerateItinerary}>
            <Text style={styles.planBtnText}>Generate Itinerary</Text>
          </TouchableOpacity>
        </View>
        
        {onGeneratePackingList && (
          <TouchableOpacity style={styles.packBtn} onPress={onGeneratePackingList}>
            <Icon name="backpack-outline" size={14} color={colors.accent} style={{marginRight: 6}} />
            <Text style={styles.packBtnText}>Create Packing List</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  trekCard: {
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    padding: normalize(10),
    flexDirection: 'row',
    marginBottom: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
    width: '100%',
  },
  trekCardImageContainer: {
    width: normalize(90),
    height: normalize(130), // Slightly taller to accommodate new button
    borderRadius: normalize(12),
    overflow: 'hidden',
    marginRight: normalize(10),
    backgroundColor: colors.outline,
  },
  trekCardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: normalize(6),
    right: normalize(6),
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trekCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: normalize(2),
  },
  trekCardTitle: {
    fontSize: normalizeFont(15),
    fontWeight: '700',
    color: colors.accent,
    marginBottom: normalize(2),
  },
  trekLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  trekCardLocation: {
    fontSize: normalizeFont(11),
    color: colors.muted,
    marginLeft: normalize(4),
  },
  trekStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(6),
  },
  trekCardStat: {
    fontSize: normalizeFont(11),
    color: colors.text,
    marginLeft: normalize(4),
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: normalize(10),
    backgroundColor: colors.outline,
    marginHorizontal: normalize(6),
  },
  trekPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: normalize(10),
  },
  trekCardPrice: {
    fontSize: normalizeFont(15),
    fontWeight: '700',
    color: colors.accent,
  },
  trekCardPriceSuffix: {
    fontSize: normalizeFont(11),
    color: colors.muted,
  },
  trekActionsRow: {
    flexDirection: 'row',
    gap: normalize(6),
    marginBottom: normalize(6),
  },
  viewDetailsBtn: {
    flex: 1,
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtnText: {
    color: colors.text,
    fontSize: normalizeFont(11),
    fontWeight: '600',
    textAlign: 'center',
  },
  planBtn: {
    flex: 1.5,
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(6),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planBtnText: {
    color: '#0D1117',
    fontSize: normalizeFont(11),
    fontWeight: '600',
    textAlign: 'center',
  },
  packBtn: {
    flexDirection: 'row',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(4),
    borderRadius: normalize(6),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packBtnText: {
    color: colors.accent,
    fontSize: normalizeFont(11),
    fontWeight: '600',
    textAlign: 'center',
  },
});
