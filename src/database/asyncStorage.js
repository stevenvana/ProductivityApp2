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

    // Initialize habits if empty
    const habits = await getStoredData(HABITS_KEY);
    if (habits.length === 0) {
      const defaultHabits = [
        {
          id: '1',
          naam: 'Water drinken',
          beschrijving: 'Dagelijks voldoende water drinken',
          frequentie: 'Dagelijks',
          streak: 5,
          laatst_voltooid: new Date().toISOString().split('T')[0],
          strafpunten_bij_falen: 1
        },
        {
          id: '2',
          naam: 'Sporten',
          beschrijving: 'Dagelijks bewegen en sporten',
          frequentie: 'Dagelijks',
          streak: 12,
          laatst_voltooid: null,
          strafpunten_bij_falen: 2
        },
        {
          id: '3',
          naam: 'Lezen',
          beschrijving: 'Dagelijks lezen voor persoonlijke ontwikkeling',
          frequentie: 'Dagelijks',
          streak: 3,
          laatst_voltooid: new Date().toISOString().split('T')[0],
          strafpunten_bij_falen: 1
        },
        {
          id: '4',
          naam: 'Mediteren',
          beschrijving: 'Dagelijkse meditatie voor mindfulness',
          frequentie: 'Dagelijks',
          streak: 8,
          laatst_voltooid: new Date().toISOString().split('T')[0],
          strafpunten_bij_falen: 1
        }
      ];
      await setStoredData(HABITS_KEY, defaultHabits);
    }

    // Initialize tasks if empty
    const tasks = await getStoredData(TASKS_KEY);
    if (tasks.length === 0) {
      const defaultTasks = [
        {
          id: '1',
          naam: 'Homepage ontwerpen',
          beschrijving: 'Lay-out maken voor de homepage',
          deadline: null,
          voltooid: false,
          datum_voltooid: null
        },
        {
          id: '2',
          naam: 'Documentatie schrijven',
          beschrijving: 'API endpoints documenteren',
          deadline: '2024-04-25',
          voltooid: false,
          datum_voltooid: null
        },
        {
          id: '3',
          naam: 'Gebruikersflow maken',
          beschrijving: 'De gebruikersflow in kaart brengen',
          deadline: '2024-04-25',
          voltooid: false,
          datum_voltooid: null
        },
        {
          id: '4',
          naam: 'Dependencies updaten',
          beschrijving: 'Upgraden naar de nieuwste packages',
          deadline: '2024-04-30',
          voltooid: false,
          datum_voltooid: null
        }
      ];
      await setStoredData(TASKS_KEY, defaultTasks);
    }

    // Initialize goals if empty
    const goals = await getStoredData(GOALS_KEY);
    if (goals.length === 0) {
      const defaultGoals = [
        {
          id: '1',
          naam: 'Regelmatig sporten',
          beschrijving: 'Minimaal 3x per week sporten',
          deadline: '2024-05-05',
          voortgang: 80,
          voltooid: false,
          datum_voltooid: null,
          deadline_locked: true
        },
        {
          id: '2',
          naam: 'Meer boeken lezen',
          beschrijving: 'Dit jaar 12 boeken lezen',
          deadline: '2024-06-10',
          voortgang: 25,
          voltooid: false,
          datum_voltooid: null,
          deadline_locked: true
        },
        {
          id: '3',
          naam: 'Sparen voor vakantie',
          beschrijving: 'Geld sparen voor zomervakantie',
          deadline: '2024-04-28',
          voortgang: 60,
          voltooid: false,
          datum_voltooid: null,
          deadline_locked: true
        },
        {
          id: '4',
          naam: 'Nieuwe taal leren',
          beschrijving: 'Basis Spaans leren',
          deadline: '2024-09-20',
          voortgang: 10,
          voltooid: false,
          datum_voltooid: null,
          deadline_locked: true
        }
      ];
      await setStoredData(GOALS_KEY, defaultGoals);
    }
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
      
      if (completed) {
        habits[habitIndex].laatst_voltooid = today;
        habits[habitIndex].streak += 1;
      } else {
        habits[habitIndex].laatst_voltooid = null;
        habits[habitIndex].streak = 0;
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
      tasks[taskIndex].voltooid = completed;
      tasks[taskIndex].datum_voltooid = completed ? new Date().toISOString().split('T')[0] : null;
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

