import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import ApiService from '../service/apiService';
import Toast from 'react-native-toast-message';

export type CmsContentType = 'terms-conditions' | 'privacy-policy' | 'refund-policy' | 'about-us';

interface CmsContent {
  _id?: string;
  contentType: CmsContentType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Fallback content when CMS data is empty
const fallbackContent: Record<CmsContentType, CmsContent> = {
  'about-us': {
    contentType: 'about-us',
    title: 'About Us',
    content: 'We are dedicated to providing fresh, high-quality groceries and vegetables to our customers. Our mission is to make healthy eating convenient and affordable for everyone. We work directly with local farmers and suppliers to ensure you get the best products at the best prices.',
    isActive: true,
  },
  'privacy-policy': {
    contentType: 'privacy-policy',
    title: 'Privacy Policy',
    content: 'We respect your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you use our services. We do not share your personal information with third parties without your consent, except as required by law.',
    isActive: true,
  },
  'terms-conditions': {
    contentType: 'terms-conditions',
    title: 'Terms & Conditions',
    content: 'By using our services, you agree to these terms and conditions. We provide grocery delivery services subject to the following terms: All sales are final, products are subject to availability, and delivery times may vary. Please read our full terms for more details.',
    isActive: true,
  },
  'refund-policy': {
    contentType: 'refund-policy',
    title: 'Refund Policy',
    content: 'We want you to be completely satisfied with your purchase. If you receive damaged or incorrect items, please contact us within 24 hours of delivery. We will arrange for a replacement or refund as appropriate. Please note that fresh produce cannot be returned once delivered.',
    isActive: true,
  },
};

interface UseCmsContentReturn {
  content: CmsContent | null;
  loading: boolean;
  error: string | null;
  isUsingFallback: boolean;
  refetch: () => Promise<void>;
}

export const useCmsContent = (contentType: CmsContentType): UseCmsContentReturn => {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const fetchCmsContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always call the general endpoint to get all CMS data (better data structure)
      const response = await ApiService.getCmsContent(); // No contentType parameter
      
      if (response.status === 200 && response.data?.status) {
        const cmsData = response.data.data;
        
        let targetContent = null;
        
        // Handle array response (all CMS data) - find specific contentType
        if (Array.isArray(cmsData)) {
          targetContent = cmsData.find(item => item.contentType === contentType);
        } else if (cmsData && typeof cmsData === 'object') {
          // Handle object response (fallback)
          if (cmsData.contentType === contentType) {
            targetContent = cmsData;
          }
        }
        
        if (targetContent && targetContent.isActive) {
          // Use the content field directly (it has the proper data in array response)
          const finalContent = targetContent.content || targetContent.title || '';
          
          if (finalContent && finalContent.trim() !== '') {
            setContent({
              ...targetContent,
              content: finalContent
            });
            setIsUsingFallback(false);
          } else {
            // Use fallback content when CMS data is empty
            setContent(fallbackContent[contentType]);
            setIsUsingFallback(true);
          }
        } else {
          // Use fallback content when CMS is not active or not found
          setContent(fallbackContent[contentType]);
          setIsUsingFallback(true);
        }
      } else {
        // Use fallback content when API fails
        setContent(fallbackContent[contentType]);
        setIsUsingFallback(true);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Network error';
      setError(errorMessage);
      // Use fallback content when network error occurs
      setContent(fallbackContent[contentType]);
      setIsUsingFallback(true);
      Toast.show({
        type: 'warning',
        text1: 'Using offline content',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsContent();
  }, [contentType]);

  return {
    content,
    loading,
    error,
    isUsingFallback,
    refetch: fetchCmsContent,
  };
};
