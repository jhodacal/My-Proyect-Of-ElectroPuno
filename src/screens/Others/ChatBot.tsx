import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define the Message interface
interface Message {
  id: number | string;
  text: string;
  fromUser: boolean;
}

// Componente principal del ChatBot
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Cargar historial de mensajes al iniciar
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem('chatMessages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          // Mensaje de bienvenida inicial
          const welcomeMessage: Message = { 
            id: 1, 
            text: t('virtualAssistantWelcome'), 
            fromUser: false 
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
        setMessages([{ 
          id: 1, 
          text: t('virtualAssistantWelcome'), 
          fromUser: false 
        }]);
      }
    };
    
    loadMessages();
  }, [language]);

  // Guardar mensajes cuando cambian
  useEffect(() => {
    const saveMessages = async () => {
      if (messages.length > 0) {
        try {
          await AsyncStorage.setItem('chatMessages', JSON.stringify(messages));
        } catch (error) {
          console.error('Error saving chat messages:', error);
        }
      }
    };
    
    saveMessages();
  }, [messages]);

  // Manejar cambio de idioma
  useEffect(() => {
    if (messages.length > 0 && !messages[0].fromUser) {
      const updatedMessages = [...messages];
      updatedMessages[0] = {
        ...updatedMessages[0],
        text: t('virtualAssistantWelcome')
      };
      setMessages(updatedMessages);
    }
  }, [language]);

  // Enviar mensaje al backend
  const handleSend = async () => {
    if (inputText.trim() === '') return;

    // Agregar mensaje del usuario
    const userMessage: Message = { id: Date.now(), text: inputText, fromUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Enviar solicitud al backend
      const response = await axios.post('http://192.168.1.7:4000/chat', {
        message: inputText,
        language
      });

      const botResponse: Message = {
        id: Date.now() + 1,
        text: response.data.reply,
        fromUser: false
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: t('chatError'),
        fromUser: false
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Limpiar historial de chat
  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem('chatMessages');
      setMessages([{ 
        id: Date.now(), 
        text: t('virtualAssistantWelcome'), 
        fromUser: false 
      }]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  // Asegurar que el scroll baje cuando se añaden nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Renderizar botón flotante cuando el chat está cerrado
  if (!isOpen) {
    return (
      <TouchableOpacity 
        style={[styles.chatButton, { backgroundColor: theme === 'dark' ? '#3498db' : '#2ecc71' }]}
        onPress={() => setIsOpen(true)}
      >
        <Icon name="chat" size={24} color="#fff" />
      </TouchableOpacity>
    );
  }

  // Renderizar ventana de chat
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.chatContainer, { backgroundColor: theme === 'dark' ? '#2c3e50' : '#ecf0f1' }]}
    >
      <View style={styles.chatHeader}>
        <Text style={[styles.chatTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
          {t('virtualAssistant')}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={clearChat}
          >
            <Icon name="delete" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setIsOpen(false)}
          >
            <Icon name="close" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble, 
              message.fromUser 
                ? [styles.userMessage, { backgroundColor: theme === 'dark' ? '#3498db' : '#2ecc71' }]
                : [styles.botMessage, { backgroundColor: theme === 'dark' ? '#34495e' : '#bdc3c7' }]
            ]}
          >
            <Text style={[
              styles.messageText, 
              { color: message.fromUser || theme === 'dark' ? '#fff' : '#000' }
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
        
        {isTyping && (
          <View style={[
            styles.messageBubble,
            styles.botMessage,
            { backgroundColor: theme === 'dark' ? '#34495e' : '#bdc3c7' }
          ]}>
            <View style={styles.typingIndicator}>
              <View style={[styles.typingDot, { backgroundColor: theme === 'dark' ? '#fff' : '#555' }]} />
              <View style={[styles.typingDot, { backgroundColor: theme === 'dark' ? '#fff' : '#555' }]} />
              <View style={[styles.typingDot, { backgroundColor: theme === 'dark' ? '#fff' : '#555' }]} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: theme === 'dark' ? '#34495e' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              borderColor: theme === 'dark' ? '#555' : '#ddd'
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('typeMessage')}
          placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: theme === 'dark' ? '#3498db' : '#2ecc71' },
            !inputText.trim() && styles.disabledButton
          ]} 
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.suggestionsContainer}
      >
        <TouchableOpacity 
          style={[styles.suggestionChip, { backgroundColor: theme === 'dark' ? '#34495e' : '#e0e0e0' }]}
          onPress={() => {
            setInputText(t('howToPay'));
            setTimeout(() => {
              handleSend();
            }, 100);
          }}
        >
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{t('howToPay')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.suggestionChip, { backgroundColor: theme === 'dark' ? '#34495e' : '#e0e0e0' }]}
          onPress={() => {
            setInputText(t('energySavingTips'));
            setTimeout(() => {
              handleSend();
            }, 100);
          }}
        >
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{t('energySavingTips')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.suggestionChip, { backgroundColor: theme === 'dark' ? '#34495e' : '#e0e0e0' }]}
          onPress={() => {
            setInputText(t('aboutElectroPuno'));
            setTimeout(() => {
              handleSend();
            }, 100);
          }}
        >
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{t('aboutElectroPuno')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.suggestionChip, { backgroundColor: theme === 'dark' ? '#34495e' : '#e0e0e0' }]}
          onPress={() => {
            setInputText(t('smartMeterInfo'));
            setTimeout(() => {
              handleSend();
            }, 100);
          }}
        >
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{t('smartMeterInfo')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 320,
    height: 450,
    borderRadius: 15,
    elevation: 5,
    zIndex: 1000,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 5,
    marginLeft: 10,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingRight: 5,
    paddingLeft: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2ecc71',
    borderTopRightRadius: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#bdc3c7',
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    width: 50,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#555',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    maxHeight: 40,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
});

export default ChatBot;