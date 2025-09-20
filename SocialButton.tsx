// components/SocialButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function SocialButton({ provider, color, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <FontAwesome name={icon} size={20} color={color} />
      <Text style={[styles.socialButtonText, { color }]}>{provider}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    width: '48%',
  },
  socialButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 16,
  },
});
