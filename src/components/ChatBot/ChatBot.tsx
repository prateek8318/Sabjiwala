import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constant/colors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Namaste! Main aapki kaise madad kar sakta hoon?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      // Simulate bot response (in a real app, you would call an API here)
      setTimeout(() => {
        const botResponses = [
          'Main samajh gaya. Kya main aapki aur madad kar sakta hoon?',
          'Kripya thoda detail mein batayein, taki main aapki behtar madad kar sakun.',
          'Main aapki baat apne support team tak pahuncha dunga. Kya main kuch aur madad kar sakta hoon?',
          'Dhanyavaad! Kya aap kuch aur janna chahenge?',
          'Main aapki shikayat ko note kar liya hoon. Hamara team jald hi aapke saath sampark karega.'
        ];
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponses[Math.floor(Math.random() * botResponses.length)],
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.botMessage,
      ]}>
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.botBubble,
        ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 100}
        enabled
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            style={styles.flatList}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#000000"
              multiline={false}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Icon name="send" size={24} color={Colors.PRIMARY[300]} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY[300],
  },
  keyboardContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: Colors.PRIMARY[300],
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  flatList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    marginVertical: 4,
    width: '100%',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  userBubble: {
    backgroundColor: Colors.PRIMARY[600],
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.NEUTRAL[200],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: Colors.PRIMARY[500],
  },
  timestamp: {
    fontSize: 10,
    color: Colors.PRIMARY[400],
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.PRIMARY[300],
    borderTopWidth: 1,
    borderTopColor: Colors.NEUTRAL[200],
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.NEUTRAL[100],
    borderRadius: 20,
    color:"#000000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatBot;
