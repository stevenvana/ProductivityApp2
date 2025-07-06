import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { xpOperations } from '../database/xpSystem';
import Avatar from './Avatar';

export default function XPDisplay({ onPress }) {
  const [xpData, setXpData] = useState(null);
  const [levelProgress, setLevelProgress] = useState(null);

  useEffect(() => {
    loadXPData();
  }, []);

  const loadXPData = async () => {
    try {
      const data = await xpOperations.get();
      const progress = await xpOperations.getLevelProgress();
      setXpData(data);
      setLevelProgress(progress);
    } catch (error) {
      console.error('Error loading XP data:', error);
    }
  };

  // Refresh XP data when component receives focus
  const refreshXPData = () => {
    loadXPData();
  };

  if (!xpData || !levelProgress) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.topRow}>
        <Avatar level={levelProgress.currentLevel} size="medium" showTitle={false} />
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {levelProgress.currentLevel}</Text>
          <Text style={styles.xpText}>{levelProgress.totalXP} XP</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${levelProgress.progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {levelProgress.progressXP} / {levelProgress.neededXP} XP
        </Text>
      </View>

      <View style={styles.dailyWeeklyContainer}>
        <View style={styles.dailyWeeklyItem}>
          <Text style={styles.dailyWeeklyLabel}>Vandaag</Text>
          <Text style={styles.dailyWeeklyValue}>{levelProgress.dailyXP} XP</Text>
        </View>
        <View style={styles.dailyWeeklyItem}>
          <Text style={styles.dailyWeeklyLabel}>Deze week</Text>
          <Text style={styles.dailyWeeklyValue}>{levelProgress.weeklyXP} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Export refresh function for parent components
XPDisplay.refresh = () => {
  // This will be handled by the parent component
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  xpText: {
    fontSize: 16,
    color: '#757575',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  dailyWeeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyWeeklyItem: {
    alignItems: 'center',
  },
  dailyWeeklyLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  dailyWeeklyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

