import { useMemo } from 'react';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ImageBackground,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ImageView from 'react-native-image-viewing';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import { normalize, normalizeFont } from '@theme/normalize';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLLECTIONS } from '../../services/firebase/collections';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  subtitle?: string;
  screen?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: '1', icon: 'star-outline', label: 'My Reviews', subtitle: '24 reviews • 4.6 average rating', screen: 'Reviews' },
  { id: '2', icon: 'bookmark-outline', label: 'Saved Treks', subtitle: '18 treks saved', screen: 'SavedTreks' },
  { id: '3', icon: 'trophy-outline', label: 'Achievements', subtitle: '12 badges • 8 milestones', screen: 'Achievements' },
  { id: '4', icon: 'credit-card-outline', label: 'Payment Methods', subtitle: 'UPI, Cards & Wallets', screen: 'Payment' },
  { id: '5', icon: 'cog-outline', label: 'Settings', subtitle: 'App preferences', screen: 'Settings' },
  { id: '6', icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQs, Contact us', screen: 'Support' },
];



interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const dispatch = useDispatch();
  const [achievements, setAchievements] = React.useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = React.useState(true);

  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isImageViewVisible, setIsImageViewVisible] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    fullName: 'Agnes Walker',
    location: 'Bangalore, India',
    bio: 'Mountains are my therapy.\nAlways chasing new trails and sunrise views.',
    avatarUrl: null as string | null,
  });
  const [editData, setEditData] = React.useState({ ...profileData });

  const handleSaveProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('No authenticated user found');
      return;
    }

    setIsSaving(true);
    try {
      const db = getFirestore();
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), editData, { merge: true });
      setProfileData({ ...editData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile to DB:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (!asset.uri) return;

      setIsUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'avatar.jpg',
      } as any);
      formDataUpload.append('upload_preset', 'trekgpt_preset');
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/ddav4rqeo/image/upload`, {
        method: 'POST',
        body: formDataUpload as any,
      });
      const data = await res.json() as any;
      
      if (data.secure_url) {
        // Automatically save the new avatar URL to Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          await setDoc(doc(db, COLLECTIONS.USERS, user.uid), { avatarUrl: data.secure_url }, { merge: true });
        }
        setProfileData((prev) => ({ ...prev, avatarUrl: data.secure_url }));
        setEditData((prev) => ({ ...prev, avatarUrl: data.secure_url }));
      } else {
        console.error('Image upload failed:', data);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as any;
            const loadedData = {
              fullName: data.fullName || user.displayName || 'Agnes Walker',
              location: data.location || 'Bangalore, India',
              bio: data.bio || 'Mountains are my therapy.\nAlways chasing new trails and sunrise views.',
              avatarUrl: data.avatarUrl || user.photoURL || null,
            };
            setProfileData(loadedData);
            setEditData(loadedData);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    const fetchAchievements = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, COLLECTIONS.ACHIEVEMENTS));
        const data = snapshot.docs.map(docId => ({ id: docId.id, ...docId.data() }));
        setAchievements(data);
      } catch (e) {
        console.error('Error fetching achievements', e);
      } finally {
        setIsLoadingAchievements(false);
      }
    };
    
    fetchProfile();
    fetchAchievements();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Background Mountain Image ── */}
      <ImageBackground
        source={require('@assets/images/splash_bg.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)', colors.background]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => navigation?.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <View style={styles.notificationDot} />
            <Icon name="bell-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Icon name="cog-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Avatar & Info ── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              style={styles.avatarRing} 
              activeOpacity={0.8}
              onPress={() => {
                if (profileData.avatarUrl) {
                  setIsImageViewVisible(true);
                }
              }}
            >
              {profileData.avatarUrl ? (
                <Image
                  source={{ uri: profileData.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.fallbackAvatar]}>
                  <Icon name="account" size={54} color={colors.muted} />
                </View>
              )}
              {isUploadingImage && (
                <View style={[StyleSheet.absoluteFill, styles.fallbackAvatar, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cameraIconBadge}
              onPress={handleImagePick}
              activeOpacity={0.8}
              disabled={isUploadingImage}
            >
              <Icon name="pencil" size={14} color="#000" />
            </TouchableOpacity>
          </View>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={styles.editLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                value={editData.fullName}
                onChangeText={(text) => setEditData({...editData, fullName: text})}
                placeholder="Enter your name"
                placeholderTextColor={colors.muted}
                selectionColor={colors.accent}
              />
              
              <Text style={styles.editLabel}>Location</Text>
              <TextInput
                style={styles.editInput}
                value={editData.location}
                onChangeText={(text) => setEditData({...editData, location: text})}
                placeholder="Enter your location"
                placeholderTextColor={colors.muted}
                selectionColor={colors.accent}
              />
              
              <Text style={styles.editLabel}>Bio</Text>
              <TextInput
                style={[styles.editInput, styles.editInputMultiline]}
                value={editData.bio}
                onChangeText={(text) => setEditData({...editData, bio: text})}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.muted}
                selectionColor={colors.accent}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <View style={styles.editActionRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                  setEditData({...profileData});
                  setIsEditing(false);
                }} disabled={isSaving}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Profile</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{profileData.fullName}</Text>
                <Icon name="check-decagram" size={22} color={colors.accent} style={styles.verifiedIcon} />
              </View>
              
              <Text style={styles.userBadge}>Explorer · <Text style={{ color: colors.accent }}>Level 12</Text></Text>
              
              <View style={styles.locationRow}>
                <Icon name="map-marker-outline" size={14} color={colors.muted} />
                <Text style={styles.locationText}>{profileData.location}</Text>
              </View>
    
              <Text style={styles.bioText}>
                {profileData.bio}
              </Text>

              <TouchableOpacity style={styles.editProfileBtn} onPress={() => {
                setEditData({ ...profileData });
                setIsEditing(true);
              }}>
                <Icon name="pencil-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="terrain" size={20} color={colors.accent} style={styles.statIcon} />
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statLabel}>Treks Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="map-marker-distance" size={20} color={colors.accent} style={styles.statIcon} />
            <Text style={styles.statValue}>12.5K</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="medal-outline" size={20} color={colors.accent} style={styles.statIcon} />
            <Text style={styles.statValue}>8.4K</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        {/* ── Recent Achievements ── */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="medal-outline" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All <Icon name="chevron-right" size={12} /></Text>
            </TouchableOpacity>
          </View>

          <View style={styles.achievementsRow}>
            {isLoadingAchievements ? null : achievements.map((item) => (
              <View key={item.id} style={styles.achievementCard}>
                <View style={[styles.hexagonOutline, { borderColor: item.color }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.achievementLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.achievementSub} numberOfLines={1}>{item.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Menu List ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={() => item.screen && navigation?.navigate(item.screen)}
              >
                <View style={styles.menuIconWrap}>
                  <Icon name={item.icon} size={20} color={colors.muted} />
                </View>
                <View style={styles.menuTextContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                </View>
                <Icon name="chevron-right" size={18} color={colors.muted} />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Footer Stats Card ── */}
        <View style={styles.footerCard}>
          <View style={styles.footerContent}>
            <View style={styles.footerItem}>
              <Icon name="calendar-month-outline" size={20} color={colors.accent} style={styles.footerIcon} />
              <View>
                <Text style={styles.footerLabel}>Member since</Text>
                <Text style={styles.footerValue}>Jan 2023</Text>
              </View>
            </View>
            <View style={styles.footerItem}>
              <Icon name="walk" size={20} color={colors.accent} style={styles.footerIcon} />
              <View>
                <Text style={styles.footerLabel}>Total Days Trekking</Text>
                <Text style={styles.footerValue}><Text style={{ color: colors.accent }}>156</Text> Days</Text>
              </View>
            </View>
          </View>
          <Icon name="terrain" size={100} color="#27272A" style={styles.footerBgImage} />
        </View>
      </ScrollView>

      {profileData.avatarUrl && (
        <ImageView
          images={[{ uri: profileData.avatarUrl }]}
          imageIndex={0}
          visible={isImageViewVisible}
          onRequestClose={() => setIsImageViewVisible(false)}
          HeaderComponent={() => (
            <TouchableOpacity 
              style={{ height: 200, width: '100%', backgroundColor: 'transparent' }} 
              onPress={() => setIsImageViewVisible(false)} 
              activeOpacity={1} 
            />
          )}
          FooterComponent={() => (
            <TouchableOpacity 
              style={{ height: 200, width: '100%', backgroundColor: 'transparent' }} 
              onPress={() => setIsImageViewVisible(false)} 
              activeOpacity={1} 
            />
          )}
        />
      )}
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(320),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(10),
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: normalize(12),
  },
  iconBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(25, 25, 25, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    zIndex: 2,
    borderWidth: 1,
    borderColor: colors.background,
  },

  // Scroll
  scrollContent: {
    paddingBottom: normalize(110),
  },

  // Profile Section
  profileSection: {
    paddingHorizontal: normalize(22),
    paddingTop: normalize(10),
    paddingBottom: normalize(24),
  },
  avatarContainer: {
    alignSelf: 'flex-start',
    marginBottom: normalize(16),
  },
  avatarRing: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    borderWidth: 2,
    borderColor: colors.accent,
    padding: normalize(4),
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(50),
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(4),
  },
  userName: {
    color: colors.text,
    fontSize: normalizeFont(28),
    fontWeight: '800',
    letterSpacing: 0.2,
    marginRight: normalize(6),
  },
  verifiedIcon: {
    marginTop: 2,
  },
  userBadge: {
    color: colors.muted,
    fontSize: normalizeFont(14),
    fontWeight: '500',
    marginBottom: normalize(8),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  locationText: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    marginLeft: normalize(6),
  },
  bioText: {
    color: colors.muted,
    fontSize: normalizeFont(14),
    lineHeight: normalize(22),
    marginBottom: normalize(16),
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  editProfileBtnText: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },
  fallbackAvatar: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  
  // Edit Form
  editContainer: {
    marginTop: normalize(8),
    paddingRight: normalize(16),
  },
  editLabel: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '500',
    marginBottom: normalize(6),
  },
  editInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    color: colors.text,
    fontSize: normalizeFont(14),
    marginBottom: normalize(16),
  },
  editInputMultiline: {
    minHeight: normalize(80),
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: normalize(12),
    marginTop: normalize(8),
    marginBottom: normalize(12),
  },
  cancelBtn: {
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  cancelBtnText: {
    color: colors.text,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    backgroundColor: colors.accent,
  },
  saveBtnText: {
    color: '#000',
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: normalize(16),
    backgroundColor: colors.surface, // Darker surface
    borderRadius: normalize(16),
    paddingVertical: normalize(20),
    marginBottom: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: normalize(4),
  },
  statValue: {
    color: colors.accent,
    fontSize: normalizeFont(18),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statLabel: {
    color: colors.muted,
    fontSize: normalizeFont(10),
    marginTop: normalize(2),
    fontWeight: '500',
  },
  statDivider: {
    width: normalize(1),
    height: '60%',
    alignSelf: 'center',
    backgroundColor: colors.outline,
  },

  // Achievements
  achievementsSection: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(22),
    marginBottom: normalize(16),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: '700',
    marginLeft: normalize(8),
  },
  viewAllText: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: '600',
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
  },
  achievementCard: {
    alignItems: 'center',
    width: normalize(60), // Small enough to fit 5 items (5 * 60 = 300) + spacing
  },
  hexagonOutline: {
    width: normalize(52),
    height: normalize(58),
    borderWidth: 1.5,
    borderRadius: normalize(14), // Using rounded rect to approximate
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(8),
    backgroundColor: colors.surface,
  },
  achievementLabel: {
    color: colors.text,
    fontSize: normalizeFont(9),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: normalize(2),
  },
  achievementSub: {
    color: colors.muted,
    fontSize: normalizeFont(9),
    textAlign: 'center',
  },

  // Menu Card
  menuCard: {
    marginHorizontal: normalize(16),
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
    marginBottom: normalize(20),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    gap: normalize(12),
  },
  menuIconWrap: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(10),
    backgroundColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  menuLabel: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '600',
    marginBottom: normalize(2),
  },
  menuSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(11),
  },
  menuDivider: {
    height: normalize(1),
    backgroundColor: colors.outline,
    marginLeft: normalize(66),
  },

  // Footer Card
  footerCard: {
    marginHorizontal: normalize(16),
    backgroundColor: colors.surface,
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(20),
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  footerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: normalize(12),
    backgroundColor: colors.outline,
    padding: normalize(8),
    borderRadius: normalize(8),
  },
  footerLabel: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    marginBottom: normalize(4),
  },
  footerValue: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '700',
  },
  footerBgImage: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    opacity: 0.3,
    zIndex: 1,
  },
});

