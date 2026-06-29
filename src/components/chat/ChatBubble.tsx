import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { normalize, normalizeFont } from '@theme/normalize';
import dayjs from 'dayjs';
import { ChatMessage } from '../../hooks/useAiChat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);

  const isUser = message.role === 'user';
  const timeText = dayjs(message.timestamp).format('hh:mm A');

  // Truncate long text if not expanded
  const MAX_LENGTH = 800;
  const isLong = message.text.length > MAX_LENGTH;
  const displayText = !isUser && isLong && !expanded 
    ? message.text.substring(0, MAX_LENGTH) + '...' 
    : message.text;

  if (isUser) {
    return (
      <View style={styles.userMessageWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userMessageText}>{message.text}</Text>
          <View style={styles.msgFooter}>
            <Text style={styles.msgTimeUser}>{timeText}</Text>
            <Icon name="check-all" size={14} color="#0D1117" style={{ marginLeft: 4, opacity: 0.7 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botMessageWrapper}>
      <View style={styles.botAvatar}>
        <Icon name="robot-outline" size={20} color={colors.accent} />
      </View>
      <View style={styles.botContent}>
        <View style={styles.botBubble}>
          <Markdown
            style={{
              body: { color: colors.text, fontSize: normalizeFont(15), lineHeight: normalizeFont(22) },
              code_inline: { backgroundColor: colors.background, color: colors.accent, borderRadius: 4, padding: 2 },
              fence: { backgroundColor: colors.background, color: colors.text, borderRadius: 8, padding: 8 },
              link: { color: colors.accent },
              strong: { color: colors.text, fontWeight: '700' },
              heading1: { color: colors.text, fontSize: normalizeFont(20), fontWeight: '700', marginVertical: 8 },
              heading2: { color: colors.text, fontSize: normalizeFont(18), fontWeight: '700', marginVertical: 8 },
              heading3: { color: colors.text, fontSize: normalizeFont(16), fontWeight: '700', marginVertical: 8 },
              list_item: { color: colors.text, marginVertical: 2 },
              bullet_list: { marginBottom: 8 },
            }}
          >
            {displayText}
          </Markdown>
          
          {isLong && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
              <Text style={styles.expandBtnText}>{expanded ? 'Read less' : 'Read more'}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.botFooter}>
            <Text style={styles.msgTimeBot}>{timeText}</Text>
            {message.isStreaming && (
              <Icon name="circle-slice-8" size={12} color={colors.accent} style={styles.streamingIcon} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  userMessageWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: normalize(20),
  },
  userBubble: {
    backgroundColor: colors.accent,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(20),
    borderBottomRightRadius: 4,
    maxWidth: '85%',
  },
  userMessageText: {
    color: '#0D1117',
    fontSize: normalizeFont(15),
    fontWeight: '500',
    lineHeight: normalizeFont(22),
  },
  msgFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: normalize(4),
  },
  msgTimeUser: {
    color: '#0D1117',
    fontSize: normalizeFont(10),
    opacity: 0.7,
  },
  botMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(24),
  },
  botAvatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
    borderWidth: 1,
    borderColor: colors.outline,
  },
  botContent: {
    flex: 1,
  },
  botBubble: {
    backgroundColor: colors.surface,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(20),
    borderTopLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  botFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(6),
  },
  msgTimeBot: {
    color: colors.muted,
    fontSize: normalizeFont(10),
  },
  streamingIcon: {
    marginLeft: 6,
  },
  expandBtn: {
    marginTop: normalize(8),
    alignSelf: 'flex-start',
  },
  expandBtnText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },
});
