import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const HABITS_KEY = '@habits';
const TASKS_KEY = '@tasks';
const GOALS_KEY = '@goals';
const PENALTIES_KEY = '@penalties';
const USER_KEY = 'user';

// Helper functions
const generateId = () => Date.now().toString();

const getStoredData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return [];
  }
};

const setStoredData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
  }
};

// Initialize database with sample data if empty
export const initDatabase = async () => {
  try {
    // Initialize user if not exists
    const user = await AsyncStorage.getItem(USER_KEY);
    if (!user) {
      const defaultUser = {
        id: '1',
        naam: 'Productieve Gebruiker',
        strafpunten: 8
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
    }

    // Initialize habits if empty - no default habits
    const habits = await getStoredData(HABITS_KEY);
    // Habits will be added through the weekly setup screen

    // Initialize tasks if empty - no default tasks
    const tasks = await getStoredData(TASKS_KEY);
    // Tasks will be added through the weekly setup screen

    // Initialize goals if empty - no default goals
    const goals = await getStoredData(GOALS_KEY);
    // Goals will be managed through the weekly setup system
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Habit operations
export const habitOperations = {
  getAll: async () => {
    return await getStoredData(HABITS_KEY);
  },

  create: async (habit) => {
    const habits = await getStoredData(HABITS_KEY);
    const newHabit = {
      ...habit,
      id: generateId(),
      streak: 0,
      laatst_voltooid: null
    };
    habits.push(newHabit);
    await setStoredData(HABITS_KEY, habits);
    return newHabit.id;
  },

  updateCompletion: async (habitId, completed) => {
    const habits = await getStoredData(HABITS_KEY);
    const habitIndex = habits.findIndex(h => h.id === habitId);
    
    if (habitIndex !== -1) {
      const today = new Date().toISOString().split('T')[0];
      const wasCompleted = habits[habitIndex].laatst_voltooid === today;
      
      if (completed && !wasCompleted) {
        // Completing habit
        habits[habitIndex].laatst_voltooid = today;
        habits[habitIndex].streak += 1;
        
        // Award XP
        const { xpOperations, XP_VALUES } = require('./xpSystem');
        let xpToAdd = XP_VALUES.HABIT_COMPLETION;
        
        // Bonus XP for streaks
        if (habits[habitIndex].streak > 0 && habits[habitIndex].streak % 7 === 0) {
          xpToAdd += XP_VALUES.STREAK_BONUS;
        }
        
        await xpOperations.addXP(xpToAdd, 'habit_completion');
        
      } else if (!completed && wasCompleted) {
        // Uncompleting habit
        habits[habitIndex].laatst_voltooid = null;
        habits[habitIndex].streak = Math.max(0, habits[habitIndex].streak - 1);
        
        // Remove XP (negative XP)
        const { xpOperations, XP_VALUES } = require('./xpSystem');
        await xpOperations.addXP(-XP_VALUES.HABIT_COMPLETION, 'habit_uncompletion');
      }
      
      await setStoredData(HABITS_KEY, habits);
    }
  },

  delete: async (habitId) => {
    const habits = await getStoredData(HABITS_KEY);
    const filteredHabits = habits.filter(h => h.id !== habitId);
    await setStoredData(HABITS_KEY, filteredHabits);
  }
};

// Task operations
export const taskOperations = {
  getAll: async () => {
    return await getStoredData(TASKS_KEY);
  },

  create: async (task) => {
    const tasks = await getStoredData(TASKS_KEY);
    const newTask = {
      ...task,
      id: generateId(),
      voltooid: false,
      datum_voltooid: null
    };
    tasks.push(newTask);
    await setStoredData(TASKS_KEY, tasks);
    return newTask.id;
  },

  updateCompletion: async (taskId, completed) => {
    const tasks = await getStoredData(TASKS_KEY);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      const wasCompleted = tasks[taskIndex].voltooid;
      
      tasks[taskIndex].voltooid = completed;
      tasks[taskIndex].datum_voltooid = completed ? new Date().toISOString().split('T')[0] : null;
      
      // Award/remove XP
      if (completed && !wasCompleted) {
        const { xpOperations, XP_VALUES } = require('./xpSystem');
        await xpOperations.addXP(XP_VALUES.TASK_COMPLETION, 'task_completion');
      } else if (!completed && wasCompleted) {
        const { xpOperations, XP_VALUES } = require('./xpSystem');
        await xpOperations.addXP(-XP_VALUES.TASK_COMPLETION, 'task_uncompletion');
      }
      
      await setStoredData(TASKS_KEY, tasks);
    }
  },

  delete: async (taskId) => {
    const tasks = await getStoredData(TASKS_KEY);
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    await setStoredData(TASKS_KEY, filteredTasks);
  }
};

// Goal operations
export const goalOperations = {
  getAll: async () => {
    return await getStoredData(GOALS_KEY);
  },

  create: async (goal) => {
    const goals = await getStoredData(GOALS_KEY);
    const newGoal = {
      ...goal,
      id: generateId(),
      voltooid: false,
      datum_voltooid: null
    };
    goals.push(newGoal);
    await setStoredData(GOALS_KEY, goals);
    return newGoal.id;
  },

  updateCompletion: async (goalId, completed) => {
    const goals = await getStoredData(GOALS_KEY);
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex !== -1) {
      goals[goalIndex].voltooid = completed;
      goals[goalIndex].datum_voltooid = completed ? new Date().toISOString().split('T')[0] : null;
      await setStoredData(GOALS_KEY, goals);
    }
  },

  delete: async (goalId) => {
    const goals = await getStoredData(GOALS_KEY);
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await setStoredData(GOALS_KEY, filteredGoals);
  }
};

// User operations
export const userOperations = {
  get: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  updatePenaltyPoints: async (points) => {
    try {
      const user = await userOperations.get();
      if (user) {
        user.strafpunten += points;
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating penalty points:', error);
    }
  }
};



// Penalty operations
export const penaltyOperations = {
  async getAll() {
    return await getStoredData(PENALTIES_KEY);
  },

  async create(penalty) {
    const penalties = await getStoredData(PENALTIES_KEY);
    const newPenalty = {
      id: generateId(),
      ...penalty,
      datum_toegevoegd: new Date().toISOString()
    };
    penalties.push(newPenalty);
    await setStoredData(PENALTIES_KEY, penalties);
    return newPenalty;
  },

  async delete(id) {
    const penalties = await getStoredData(PENALTIES_KEY);
    const filteredPenalties = penalties.filter(penalty => penalty.id !== id);
    await setStoredData(PENALTIES_KEY, filteredPenalties);
    return true;
  },

  async getTotalPoints() {
    const penalties = await getStoredData(PENALTIES_KEY);
    return penalties.reduce((total, penalty) => total + (penalty.punten || 0), 0);
  },

  async getByDateRange(startDate, endDate) {
    const penalties = await getStoredData(PENALTIES_KEY);
    return penalties.filter(penalty => {
      const penaltyDate = new Date(penalty.datum);
      return penaltyDate >= new Date(startDate) && penaltyDate <= new Date(endDate);
    });
  }
};

