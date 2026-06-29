import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import { useAiChat } from '../../hooks/useAiChat';
import { useGemini } from '../../hooks/useGemini';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { AiRecommendationCard } from '../../components/chat/AiRecommendationCard';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { getTrekImage } from '../../utils/trekImageMap';
import Toast from 'react-native-toast-message';

const suggestions = [
  { icon: 'shoe-print', text: 'Recommend a Trek', isAction: true },
  { icon: 'image-filter-hdr', text: 'Under ₹10,000' },
  { icon: 'snowflake', text: 'Winter Treks' },
  { icon: 'train', text: 'From Kolkata' },
  { icon: 'tent', text: 'Weekend Getaways' },
];

export const AiAssistantScreen = ({ navigation }: any) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, isTyping, sendMessage, appendCustomMessage, clearChat } = useAiChat();
  const { getTrekRecommendation, generateAndSaveItinerary, generateAndSavePackingList, isLoading: isGeminiLoading } = useGemini();

  useEffect(() => {
    // Scroll to bottom whenever messages change or typing status changes
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleSuggestionPress = async (item: any) => {
    if (item.isAction && item.text === 'Recommend a Trek') {
      // Custom action for getting a recommendation card
      sendMessage('Can you recommend a trek for me?');
      const rec = await getTrekRecommendation('Recommend a good trek based on my profile.');
      if (rec) {
        appendCustomMessage('recommendation', rec);
      }
    } else {
      sendMessage(item.text);
    }
  };

  const handleGenerateItinerary = async (trekName: string) => {
    sendMessage(`I'd like to plan a custom trek for ${trekName}. Please help me create a detailed itinerary and plan.`);
  };

  const handleGeneratePackingList = async (trekName: string) => {
    Toast.show({ type: 'info', text1: 'Creating packing list...', position: 'bottom' });
    const res = await generateAndSavePackingList(trekName, 'October', 'Cold', 5, 'Moderate'); // mock data
    if (res) {
      sendMessage(`Created packing list for ${trekName}! You can view it in your plans.`);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior="padding"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.headerTitle}>TrekGPT Assistant </Text>
            <Icon name="star-four-points" size={16} color={colors.accent} />
          </View>
          <Text style={styles.headerSubtitle}>Your AI trekking companion</Text>
        </View>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8} onPress={clearChat}>
          <Icon name="delete-sweep" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context Card */}
        {messages.length === 0 && (
          <View style={styles.contextCard}>
            <View style={styles.contextCardHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="crosshairs-gps" size={16} color={colors.accent} style={{marginRight: 8}} />
                <Text style={styles.contextCardTitle}>Your trip context</Text>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Icon name="pencil" size={12} color={colors.muted} style={{marginRight: 4}} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contextRow}>
              <View style={styles.contextItem}>
                <Icon name="map-marker" size={24} color={colors.accent} />
                <View style={styles.contextItemTexts}>
                  <Text style={styles.contextItemLabel}>From</Text>
                  <Text style={styles.contextItemValue}>Kolkata</Text>
                </View>
              </View>
              <View style={styles.contextDivider} />
              <View style={styles.contextItem}>
                <Icon name="wallet" size={24} color={colors.accent} />
                <View style={styles.contextItemTexts}>
                  <Text style={styles.contextItemLabel}>Budget</Text>
                  <Text style={styles.contextItemValue}>₹12,000</Text>
                </View>
              </View>
              <View style={styles.contextDivider} />
              <View style={styles.contextItem}>
                <Icon name="shoe-print" size={24} color={colors.accent} />
                <View style={styles.contextItemTexts}>
                  <Text style={styles.contextItemLabel}>Experience</Text>
                  <Text style={styles.contextItemValue}>Beginner</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Suggestions */}
        {messages.length === 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Try asking about</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {suggestions.map((item, index) => (
                <TouchableOpacity key={index} style={styles.suggestionChip} onPress={() => handleSuggestionPress(item)}>
                  <Icon name={item.icon} size={24} color={colors.accent} style={{marginBottom: 8}} />
                  <Text style={styles.suggestionChipText}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chat Area */}
        <View style={styles.chatArea}>
          {messages.map((msg) => {
            // Prevent rendering an empty bubble if the TypingIndicator is already handling the loading state
            if (msg.role === 'model' && !msg.text.trim() && !msg.componentType && (isTyping || isGeminiLoading)) {
              return null;
            }

            if (msg.componentType === 'recommendation' && msg.componentData) {
              return (
                <AiRecommendationCard
                  key={msg.id}
                  id={Math.random().toString(36).substring(7)}
                  title={msg.componentData.name}
                  location={msg.componentData.location}
                  days={`${msg.componentData.durationDays} Days`}
                  difficulty={msg.componentData.difficulty}
                  price={msg.componentData.estimatedCost}
                  imageSource={getTrekImage(msg.componentData.name)}
                  imageUrl="https://images.unsplash.com/photo-1544644181-1484b3f8c8b0?w=400&q=80" // Fallback generic image
                  onGenerateItinerary={() => handleGenerateItinerary(msg.componentData.name)}
                  onGeneratePackingList={() => handleGeneratePackingList(msg.componentData.name)}
                />
              );
            }
            return <ChatBubble key={msg.id} message={msg} />;
          })}
          
          {(isTyping || isGeminiLoading) && <TypingIndicator />}
        </View>

      </ScrollView>

      {/* ── Input Area ── */}
      <View style={styles.inputAreaWrapper}>
        <TouchableOpacity style={styles.attachBtn}>
          <Icon name="plus" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your dream trek..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim().length > 0 ? styles.sendButtonActive : null]} 
            activeOpacity={0.8}
            disabled={inputText.trim().length === 0}
            onPress={handleSend}
          >
            <Icon name="arrow-up" size={20} color={inputText.trim().length > 0 ? '#0D1117' : colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(22),
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 12,
    paddingBottom: normalize(16),
  },
  headerIconBtn: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: '700',
    marginBottom: normalize(2),
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: normalizeFont(13),
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: normalize(40),
  },
  contextCard: {
    marginHorizontal: normalize(22),
    backgroundColor: colors.surface,
    borderRadius: normalize(20),
    padding: normalize(16),
    marginTop: normalize(8),
  },
  contextCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  contextCardTitle: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  editBtnText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '500',
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextItemTexts: {
    marginLeft: normalize(8),
  },
  contextItemLabel: {
    color: colors.muted,
    fontSize: normalizeFont(11),
    marginBottom: normalize(2),
  },
  contextItemValue: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  contextDivider: {
    width: 1,
    height: normalize(24),
    backgroundColor: colors.outline,
    marginHorizontal: normalize(12),
  },
  suggestionsContainer: {
    marginTop: normalize(24),
    marginBottom: normalize(16),
  },
  suggestionsTitle: {
    color: colors.muted,
    fontSize: normalizeFont(14),
    fontWeight: '500',
    paddingHorizontal: normalize(22),
    marginBottom: normalize(12),
  },
  suggestionsScroll: {
    paddingHorizontal: normalize(22),
    gap: normalize(12),
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: normalize(90),
    height: normalize(90),
  },
  suggestionChipText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: normalizeFont(16),
  },
  chatArea: {
    paddingHorizontal: normalize(22),
    marginTop: normalize(16),
  },
  inputAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(22),
    paddingVertical: normalize(16),
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  attachBtn: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    marginRight: normalize(12),
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(24),
    paddingLeft: normalize(16),
    paddingRight: normalize(6),
    paddingVertical: normalize(6),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: normalizeFont(15),
    paddingVertical: Platform.OS === 'ios' ? normalize(10) : normalize(8),
  },
  sendButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(8),
  },
  sendButtonActive: {
    backgroundColor: colors.accent,
  },
});
