import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useTheme } from '../hooks/useTheme';
import { useListings } from '../hooks/useListings';
import {
  API_BASE,
  categoryColors,
  categoryIcons,
  defaultCategoryColor,
} from '../config/siteConfig';
import { FormattedListing } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  guids: number[];
  isCrisis?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi there! I'm the Wyoming Youth Resource Navigator. I can help you find services and resources across Wyoming — things like counseling, housing, food assistance, job programs, and more.\n\nWhat are you looking for today?",
  guids: [],
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors: tc } = useTheme();
  const navigation = useNavigation<any>();
  const { listings } = useListings();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const msgIdRef = useRef(1);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {}
    })();
  }, []);

  const listingMap = useRef<Record<number, FormattedListing>>({});
  if (listings.length > 0 && Object.keys(listingMap.current).length === 0) {
    listings.forEach((l) => {
      listingMap.current[l.guid] = l;
    });
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${msgIdRef.current++}`,
      role: 'user',
      content: text,
      guids: [],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const allMsgs = [...messages, userMsg];
      const history = allMsgs
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-10);

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          ...(userLocation && {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }),
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${msgIdRef.current++}`,
        role: 'assistant',
        content:
          data.message ||
          "I'm not sure how to help with that. Could you tell me more?",
        guids: data.recommendedGuids || [],
        isCrisis: data.isCrisis || false,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${msgIdRef.current++}`,
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          guids: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const viewOnMap = useCallback(
    (guids: number[]) => {
      navigation.navigate('Map', {
        screen: 'MapMain',
        params: { chatGuids: guids },
      });
    },
    [navigation],
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View
          style={[
            styles.bubbleRow,
            isUser ? styles.bubbleRowUser : styles.bubbleRowBot,
          ]}
        >
          {!isUser && (
            <View style={[styles.avatar, { backgroundColor: tc.navy }]}>
              <Ionicons name="map" size={14} color="#fff" />
            </View>
          )}
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.bubbleUser, { backgroundColor: tc.navy }]
                : [
                    styles.bubbleBot,
                    {
                      backgroundColor: tc.surface,
                      borderColor: item.isCrisis ? '#e74c3c' : tc.border,
                      borderWidth: item.isCrisis ? 1.5 : 1,
                    },
                  ],
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${isUser ? 'You' : 'Navigator'}: ${item.content}`}
          >
            <RichText text={item.content} color={isUser ? '#fff' : tc.text} />

            {item.guids.length > 0 && (
              <View style={styles.recContainer}>
                {item.guids.map((guid) => {
                  const listing = listingMap.current[guid];
                  if (!listing) return null;
                  const parentCat =
                    listing.category?.split(': ')[0] || '';
                  const catColor =
                    categoryColors[parentCat] || defaultCategoryColor;
                  const iconName = (categoryIcons[parentCat] ||
                    'folder-outline') as any;
                  return (
                    <TouchableOpacity
                      key={guid}
                      style={[
                        styles.recCard,
                        { borderLeftColor: catColor, backgroundColor: tc.surfaceSecondary },
                      ]}
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('Map', {
                          screen: 'Detail',
                          params: { listing },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${listing.full_name}. ${parentCat}. ${listing.city || ''}`}
                    >
                      <View style={styles.recHeader}>
                        <Ionicons
                          name={iconName}
                          size={14}
                          color={catColor}
                        />
                        <Text
                          style={[styles.recName, { color: tc.text }]}
                          numberOfLines={2}
                        >
                          {listing.full_name}
                        </Text>
                      </View>
                      {listing.parent_organization &&
                        listing.parent_organization !==
                          listing.full_name && (
                          <Text
                            style={[
                              styles.recOrg,
                              { color: tc.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {listing.parent_organization}
                          </Text>
                        )}
                      <View style={styles.recMeta}>
                        <Text style={[styles.recCat, { color: catColor }]}>
                          {parentCat}
                        </Text>
                        {listing.city && (
                          <Text
                            style={[
                              styles.recCity,
                              { color: tc.textTertiary },
                            ]}
                          >
                            <Ionicons
                              name="location-outline"
                              size={11}
                              color={tc.textTertiary}
                            />{' '}
                            {listing.city}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.viewMapBtn, { backgroundColor: tc.navy }]}
                  onPress={() => viewOnMap(item.guids)}
                  accessibilityRole="button"
                  accessibilityLabel="View recommended resources on map"
                >
                  <Ionicons name="map-outline" size={16} color="#fff" />
                  <Text style={styles.viewMapText}>View on Map</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    },
    [tc, navigation, viewOnMap],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tc.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Safety banner */}
      <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
        <Ionicons name="information-circle" size={16} color="#664d03" />
        <Text style={styles.bannerText}>
          This tool helps you find resources. It does not provide medical
          advice. If you are in crisis, call{' '}
          <Text
            style={styles.bannerLink}
            onPress={() => Linking.openURL('tel:988')}
          >
            988
          </Text>{' '}
          or{' '}
          <Text
            style={styles.bannerLink}
            onPress={() => Linking.openURL('tel:911')}
          >
            911
          </Text>
          .
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          loading ? (
            <View style={[styles.bubbleRow, styles.bubbleRowBot]}>
              <View style={[styles.avatar, { backgroundColor: tc.navy }]}>
                <Ionicons name="map" size={14} color="#fff" />
              </View>
              <View
                style={[
                  styles.bubble,
                  styles.bubbleBot,
                  { backgroundColor: tc.surface, borderColor: tc.border },
                ]}
              >
                <ActivityIndicator size="small" color={tc.navy} />
              </View>
            </View>
          ) : null
        }
      />

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            backgroundColor: tc.surface,
            borderTopColor: tc.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              color: tc.text,
              backgroundColor: tc.surfaceSecondary,
              borderColor: tc.border,
            },
          ]}
          placeholder="Describe what you're looking for..."
          placeholderTextColor={tc.textTertiary}
          value={input}
          onChangeText={setInput}
          maxLength={1000}
          multiline
          returnKeyType="default"
          editable={!loading}
          accessibilityLabel="Type your message"
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                input.trim() && !loading ? tc.navy : tc.surfaceSecondary,
            },
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() && !loading ? '#fff' : tc.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function RichText({ text, color }: { text: string; color: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={{ color, fontSize: 14, lineHeight: 21 }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: '700' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: '#664d03',
    lineHeight: 17,
  },
  bannerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowBot: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  recContainer: {
    marginTop: 12,
    gap: 8,
  },
  recCard: {
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 4,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recName: {
    flex: 1,
    fontWeight: '700',
    fontSize: 13,
  },
  recOrg: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 20,
  },
  recMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginLeft: 20,
  },
  recCat: {
    fontSize: 11,
    fontWeight: '600',
  },
  recCity: {
    fontSize: 11,
  },
  viewMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewMapText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});
