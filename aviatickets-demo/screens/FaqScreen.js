// screens/FaqScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../constants/api';

const categories = [
  { id: 'all', name: 'Все', icon: 'format-list-bulleted' },
  { id: 'payments', name: 'Оплата', icon: 'credit-card' },
  { id: 'baggage', name: 'Багаж', icon: 'luggage' },
  { id: 'refunds', name: 'Возвраты', icon: 'undo' },
  { id: 'checkin', name: 'Регистрация', icon: 'airplane-takeoff' },
  { id: 'general', name: 'Общее', icon: 'help-circle' },
];

export default function FaqScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [faqs, selectedCategory, searchQuery]);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const res = await fetch(`${API_BASE}/faq${categoryParam}`);
      
      if (!res.ok) {
        throw new Error('Failed to load FAQ');
      }
      
      const data = await res.json();
      // Убеждаемся, что data - это массив
      const faqsArray = Array.isArray(data) ? data : [];
      setFaqs(faqsArray);
    } catch (error) {
      console.error('Error loading FAQ:', error);
      setFaqs([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const filterFaqs = () => {
    // Убеждаемся, что faqs - это массив
    let filtered = Array.isArray(faqs) ? [...faqs] : [];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question?.toLowerCase().includes(query) ||
          faq.answer?.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  };

  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    loadFaqs();
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
        <Text style={styles.headerTitle}>Часто задаваемые вопросы</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по вопросам..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                selectedCategory === cat.id && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FAQ List */}
      <ScrollView style={styles.faqList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        ) : !Array.isArray(filteredFaqs) || filteredFaqs.length === 0 ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="help-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Вопросы не найдены</Text>
          </View>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedItems.has(faq._id || faq.id);
            return (
              <View key={faq._id || faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleItem(faq._id || faq.id)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    color: '#111',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
  },
  categoriesScrollContent: {
    paddingVertical: 0,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: '#0277bd',
  },
  categoryText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0277bd',
    fontWeight: '700',
  },
  faqList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  faqAnswerText: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
    marginTop: 16,
  },
});

