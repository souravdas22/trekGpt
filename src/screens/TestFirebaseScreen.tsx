import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { loginWithEmail, logout, getCurrentUser } from '../services/firebase/auth.service';
import { createDocument, getDocument } from '../services/firebase/firestore.service';
import { COLLECTIONS } from '../services/firebase/collections';

export const TestFirebaseScreen = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestAuth = async () => {
    setLoading(true);
    setResult('Testing Auth...');
    try {
      // Create a dummy email just for test purposes (won't actually work without correct credentials or disabled Firebase auth restrictions, but it will ping the server)
      // Since we just want to test if auth is connected, we can check currentUser and try a dummy login
      const user = getCurrentUser();
      if (user) {
        await logout();
        setResult(`Logged out user: ${user.email}`);
      } else {
        try {
          await loginWithEmail('test@test.com', 'password123');
          setResult('Successfully connected and logged in (dummy user)');
        } catch (e: any) {
          setResult(`Auth is connected. Error: ${e.message}`);
        }
      }
    } catch (e: any) {
      setResult(`Auth Error: ${e.message}`);
      Alert.alert('Auth Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFirestoreWrite = async () => {
    setLoading(true);
    setResult('Testing Firestore Write...');
    try {
      const docId = 'test_doc_' + Date.now();
      await createDocument(COLLECTIONS.USERS, docId, {
        test: true,
        timestamp: new Date().toISOString(),
      });
      setResult(`Successfully wrote document: ${docId} to ${COLLECTIONS.USERS}`);
    } catch (e: any) {
      setResult(`Firestore Write Error: ${e.message}`);
      Alert.alert('Firestore Write Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFirestoreRead = async () => {
    setLoading(true);
    setResult('Testing Firestore Read...');
    try {
      // Assuming we just created a doc, or we try to read a non-existent one
      const doc = await getDocument(COLLECTIONS.USERS, 'test_doc_id');
      setResult(`Successfully read from Firestore. Data: ${JSON.stringify(doc)}`);
    } catch (e: any) {
      setResult(`Firestore Read Error: ${e.message}`);
      Alert.alert('Firestore Read Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Firebase Integration Test</Text>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleTestAuth} 
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Test Auth
        </Button>

        <Button 
          mode="contained" 
          onPress={handleTestFirestoreWrite} 
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Test Firestore Write
        </Button>

        <Button 
          mode="contained" 
          onPress={handleTestFirestoreRead} 
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Test Firestore Read
        </Button>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Result:</Text>
        <Text style={styles.resultText}>{result}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 5,
  },
  resultContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 150,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
  },
});
