import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';

export default function LevelUpModal({ visible, level, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.congratsText}>🎉 Gefeliciteerd! 🎉</Text>
          <Text style={styles.levelUpText}>Level Up!</Text>
          
          <Avatar level={level} size="large" showTitle={true} />
          
          <Text style={styles.newLevelText}>
            Je bent nu Level {level}!
          </Text>
          
          <Text style={styles.motivationText}>
            Blijf doorgaan met je geweldige werk!
          </Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Geweldig!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  congratsText: {
    fontSize: 20,
    marginBottom: 8,
  },
  levelUpText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  newLevelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

