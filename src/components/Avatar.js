import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// Avatar images for different levels
const avatarImages = {
  1: require('../../assets/avatar-level-1.png'),
  5: require('../../assets/avatar-level-5.png'),
  10: require('../../assets/avatar-level-10.png'),
};

// Function to get appropriate avatar based on level
const getAvatarForLevel = (level) => {
  if (level >= 10) {
    return avatarImages[10];
  } else if (level >= 5) {
    return avatarImages[5];
  } else {
    return avatarImages[1];
  }
};

// Function to get level title
const getLevelTitle = (level) => {
  if (level >= 10) {
    return 'Expert';
  } else if (level >= 5) {
    return 'Gevorderd';
  } else {
    return 'Beginner';
  }
};

export default function Avatar({ level, size = 'medium', showTitle = true }) {
  const avatarSource = getAvatarForLevel(level);
  const levelTitle = getLevelTitle(level);
  
  const sizeStyles = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 80, height: 80 },
  };

  return (
    <View style={styles.container}>
      <View style={[styles.avatarContainer, sizeStyles[size]]}>
        <Image 
          source={avatarSource} 
          style={[styles.avatar, sizeStyles[size]]}
          resizeMode="contain"
        />
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{level}</Text>
        </View>
      </View>
      {showTitle && (
        <Text style={styles.levelTitle}>{levelTitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    borderRadius: 50,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  levelTitle: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
});

