import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Book } from 'lucide-react-native';

export default function DashboardScreen() {
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notebooks')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) setNotebooks(data);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        {item.type === 'pdf' ? (
          <FileText size={24} color="#3b82f6" />
        ) : (
          <Book size={24} color="#8b5cf6" />
        )}
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.cardDate}>
        Updated {new Date(item.updated_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : notebooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No notebooks yet</Text>
          <Text style={styles.emptySubText}>Tap New to create one natively.</Text>
        </View>
      ) : (
        <FlatList
          data={notebooks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardDate: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 36,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptySubText: {
    color: '#6b7280',
    marginTop: 8,
  },
});
