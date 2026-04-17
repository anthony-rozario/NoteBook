import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CollaborationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collaboration Hub</Text>
      <Text style={styles.subtitle}>Shared files via Supabase Native will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
