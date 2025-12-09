import React, { FC, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from './support.styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackProps } from '../../../../../@types';
import { Header } from '../../../../../components';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../../constant/dimentions';
import { Colors } from '../../../../../constant';

type SupportScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Support'
>;

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Mera order kab tak deliver hoga?',
    answer: 'Aapka order usually 10–30 minutes mein deliver ho jayega. Live tracking aapko har update deta rahega!',
  },
  {
    question: 'Koi item missing hai ya galat aaya hai?',
    answer: 'Koi baat nahi! App mein order open karke "Missing/Wrong Item" report karein. Hum turant refund ya replacement kar denge.',
  },
  {
    question: 'Payment successful hua lekin order nahi dikha raha?',
    answer: 'Thodi der wait karein ya app refresh karein. Agar 5 minute baad bhi nahi dikhe toh humein chat karein – hum turant fix kar denge.',
  },
  {
    question: 'Cancel kaise karun order?',
    answer: 'Jab tak rider aapke order ko pick nahi karta, aap khud cancel kar sakte hain. Uske baad humse chat karke cancel request daal sakte hain.',
  },
  {
    question: 'Cash on Delivery available hai?',
    answer: 'Haan bilkul! Aap payment mode mein "Cash on Delivery" select kar sakte hain.',
  },
  {
    question: 'Refund kab tak milega?',
    answer: 'Online payment ka refund 3–5 working days mein original payment method mein wapas aa jayega.',
  },
];

const Support: FC = () => {
  const navigation = useNavigation<SupportScreenNavigationType>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Help & Support" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(4) }}
      >
        {/* Top Support Options */}
        <View style={styles.topOptions}>
          <TouchableOpacity style={styles.supportCard}>
            <View style={styles.iconCircle}>
              <Icon name="chatbubble-outline" size={28} color={Colors.PRIMARY[400]} />
            </View>
            <Text style={styles.cardTitle}>Chat with us</Text>
            <Text style={styles.cardSubtitle}>Get instant help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportCard}>
            <View style={styles.iconCircle}>
              <Icon name="call-outline" size={28} color={Colors.PRIMARY[400]} />
            </View>
            <Text style={styles.cardTitle}>Call us</Text>
            <Text style={styles.cardSubtitle}>+91 1234567890</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          {faqs.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => toggleFAQ(index)}
              style={styles.faqItem}
            >
              <View style={styles.faqQuestionRow}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Icon
                  name={openIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#666"
                />
              </View>

              {openIndex === index && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={item.answer} style={styles.faqAnswer} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Support;