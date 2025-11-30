// screens/SupportScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export default function SupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadMessages = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/support/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !token) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/support/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!res.ok) {
        throw new Error('Ошибка отправки сообщения');
      }

      // Reload messages to get the response
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч назад`;

    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Поддержка</Text>
          <Text style={styles.headerSubtitle}>Мы ответим в ближайшее время</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#29A9E0" />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.center}>
              <MaterialCommunityIcons
                name="message-outline"
                size={64}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                Начните диалог с поддержкой
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const showTime =
                index === 0 ||
                new Date(msg.createdAt) - new Date(messages[index - 1].createdAt) >
                  300000; // 5 minutes

              return (
                <View key={msg._id || msg.id || index}>
                  {showTime && (
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(msg.createdAt)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageContainer,
                      isUser ? styles.userMessage : styles.supportMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.supportMessageText,
                      ]}
                    >
                      {msg.message}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Напишите сообщение..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            placeholderTextColor="#999"
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#29A9E0',
    borderBottomRightRadius: 4,
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  supportMessageText: {
    color: '#111',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Roboto_400Regular',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#29A9E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
    marginTop: 16,
  },
});

