import AsyncStorage from '@react-native-async-storage/async-storage';

const XP_KEY = '@xp_data';
const WEEKLY_GOALS_KEY = '@weekly_goals';

// XP values for different actions
export const XP_VALUES = {
  HABIT_COMPLETION: 10,
  TASK_COMPLETION: 15,
  WEEKLY_GOAL_COMPLETION: 50,
  STREAK_BONUS: 5, // Extra XP for maintaining streaks
};

// Level calculation
export const calculateLevel = (totalXP) => {
  // Level formula: level = floor(sqrt(totalXP / 100)) + 1
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

export const getXPForNextLevel = (currentLevel) => {
  // XP needed for next level: (level^2) * 100
  return (currentLevel * currentLevel) * 100;
};

export const getCurrentLevelXP = (currentLevel) => {
  // XP needed for current level: ((level-1)^2) * 100
  return ((currentLevel - 1) * (currentLevel - 1)) * 100;
};

// XP operations
export const xpOperations = {
  // Get current XP data
  get: async () => {
    try {
      const data = await AsyncStorage.getItem(XP_KEY);
      if (data) {
        return JSON.parse(data);
      } else {
        // Initialize default XP data
        const defaultData = {
          totalXP: 0,
          dailyXP: 0,
          weeklyXP: 0,
          level: 1,
          lastUpdated: new Date().toISOString().split('T')[0],
          weekStartDate: getWeekStartDate(),
        };
        await AsyncStorage.setItem(XP_KEY, JSON.stringify(defaultData));
        return defaultData;
      }
    } catch (error) {
      console.error('Error getting XP data:', error);
      return null;
    }
  },

  // Add XP points
  addXP: async (points, source = 'unknown') => {
    try {
      const xpData = await xpOperations.get();
      const today = new Date().toISOString().split('T')[0];
      const currentWeekStart = getWeekStartDate();

      // Reset daily XP if new day
      if (xpData.lastUpdated !== today) {
        xpData.dailyXP = 0;
        xpData.lastUpdated = today;
      }

      // Reset weekly XP if new week
      if (xpData.weekStartDate !== currentWeekStart) {
        xpData.weeklyXP = 0;
        xpData.weekStartDate = currentWeekStart;
      }

      // Add XP
      xpData.totalXP += points;
      xpData.dailyXP += points;
      xpData.weeklyXP += points;

      // Calculate new level
      const newLevel = calculateLevel(xpData.totalXP);
      const leveledUp = newLevel > xpData.level;
      xpData.level = newLevel;

      await AsyncStorage.setItem(XP_KEY, JSON.stringify(xpData));

      return {
        ...xpData,
        leveledUp,
        pointsAdded: points,
        source
      };
    } catch (error) {
      console.error('Error adding XP:', error);
      return null;
    }
  },

  // Get level progress
  getLevelProgress: async () => {
    try {
      const xpData = await xpOperations.get();
      const currentLevelXP = getCurrentLevelXP(xpData.level);
      const nextLevelXP = getXPForNextLevel(xpData.level);
      const progressXP = xpData.totalXP - currentLevelXP;
      const neededXP = nextLevelXP - currentLevelXP;
      const progressPercentage = (progressXP / neededXP) * 100;

      return {
        currentLevel: xpData.level,
        progressXP,
        neededXP,
        progressPercentage: Math.min(progressPercentage, 100),
        totalXP: xpData.totalXP,
        dailyXP: xpData.dailyXP,
        weeklyXP: xpData.weeklyXP,
      };
    } catch (error) {
      console.error('Error getting level progress:', error);
      return null;
    }
  },

  // Reset XP (for testing purposes)
  reset: async () => {
    try {
      await AsyncStorage.removeItem(XP_KEY);
      return await xpOperations.get(); // This will create new default data
    } catch (error) {
      console.error('Error resetting XP:', error);
      return null;
    }
  }
};

// Weekly goals operations
export const weeklyGoalsOperations = {
  // Get current week's goals
  get: async () => {
    try {
      const data = await AsyncStorage.getItem(WEEKLY_GOALS_KEY);
      if (data) {
        const goals = JSON.parse(data);
        const currentWeekStart = getWeekStartDate();
        
        // Check if goals are for current week
        if (goals.weekStartDate === currentWeekStart) {
          return goals;
        }
      }
      
      // Create new week goals
      const newGoals = {
        weekStartDate: getWeekStartDate(),
        targetXP: 0,
        habits: [],
        tasks: [],
        completed: false,
      };
      
      await AsyncStorage.setItem(WEEKLY_GOALS_KEY, JSON.stringify(newGoals));
      return newGoals;
    } catch (error) {
      console.error('Error getting weekly goals:', error);
      return null;
    }
  },

  // Set weekly goals
  set: async (habits, tasks) => {
    try {
      const currentWeekStart = getWeekStartDate();
      
      // Calculate target XP
      const habitXP = habits.length * XP_VALUES.HABIT_COMPLETION * 7; // Daily habits for 7 days
      const taskXP = tasks.length * XP_VALUES.TASK_COMPLETION;
      const targetXP = habitXP + taskXP;

      const weeklyGoals = {
        weekStartDate: currentWeekStart,
        targetXP,
        habits: habits.map(h => ({ id: h.id, naam: h.naam })),
        tasks: tasks.map(t => ({ id: t.id, naam: t.naam })),
        completed: false,
      };

      await AsyncStorage.setItem(WEEKLY_GOALS_KEY, JSON.stringify(weeklyGoals));
      return weeklyGoals;
    } catch (error) {
      console.error('Error setting weekly goals:', error);
      return null;
    }
  },

  // Check if weekly goal is completed
  checkCompletion: async () => {
    try {
      const goals = await weeklyGoalsOperations.get();
      const xpData = await xpOperations.get();
      
      if (goals && !goals.completed && xpData.weeklyXP >= goals.targetXP) {
        goals.completed = true;
        await AsyncStorage.setItem(WEEKLY_GOALS_KEY, JSON.stringify(goals));
        
        // Award bonus XP for completing weekly goal
        await xpOperations.addXP(XP_VALUES.WEEKLY_GOAL_COMPLETION, 'weekly_goal_completion');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking weekly goal completion:', error);
      return false;
    }
  }
};

// Helper function to get start of current week (Monday)
function getWeekStartDate() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Export helper functions
export { getWeekStartDate };

