import * as SQLite from 'expo-sqlite';

// Open database
const db = SQLite.openDatabase('productivity.db');

// Initialize database tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          naam TEXT,
          strafpunten INTEGER DEFAULT 0
        );`,
        [],
        () => console.log('Users table created'),
        (_, error) => console.log('Error creating users table:', error)
      );

      // Habits table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gebruiker_id INTEGER,
          naam TEXT NOT NULL,
          beschrijving TEXT,
          frequentie TEXT NOT NULL,
          streak INTEGER DEFAULT 0,
          laatst_voltooid TEXT,
          strafpunten_bij_falen INTEGER DEFAULT 0,
          FOREIGN KEY (gebruiker_id) REFERENCES users (id)
        );`,
        [],
        () => console.log('Habits table created'),
        (_, error) => console.log('Error creating habits table:', error)
      );

      // Tasks table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gebruiker_id INTEGER,
          naam TEXT NOT NULL,
          beschrijving TEXT,
          deadline TEXT,
          voltooid INTEGER DEFAULT 0,
          datum_voltooid TEXT,
          categorie TEXT,
          FOREIGN KEY (gebruiker_id) REFERENCES users (id)
        );`,
        [],
        () => console.log('Tasks table created'),
        (_, error) => console.log('Error creating tasks table:', error)
      );

      // Goals table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gebruiker_id INTEGER,
          naam TEXT NOT NULL,
          beschrijving TEXT,
          deadline TEXT NOT NULL,
          voltooid INTEGER DEFAULT 0,
          datum_voltooid TEXT,
          strafpunten_bij_falen INTEGER DEFAULT 0,
          FOREIGN KEY (gebruiker_id) REFERENCES users (id)
        );`,
        [],
        () => console.log('Goals table created'),
        (_, error) => console.log('Error creating goals table:', error)
      );

      // Goal-Task links table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goal_task_links (
          doel_id INTEGER,
          taak_id INTEGER,
          PRIMARY KEY (doel_id, taak_id),
          FOREIGN KEY (doel_id) REFERENCES goals (id),
          FOREIGN KEY (taak_id) REFERENCES tasks (id)
        );`,
        [],
        () => console.log('Goal-Task links table created'),
        (_, error) => console.log('Error creating goal-task links table:', error)
      );

      // Goal-Habit links table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goal_habit_links (
          doel_id INTEGER,
          gewoonte_id INTEGER,
          PRIMARY KEY (doel_id, gewoonte_id),
          FOREIGN KEY (doel_id) REFERENCES goals (id),
          FOREIGN KEY (gewoonte_id) REFERENCES habits (id)
        );`,
        [],
        () => {
          console.log('Goal-Habit links table created');
          resolve();
        },
        (_, error) => {
          console.log('Error creating goal-habit links table:', error);
          reject(error);
        }
      );
    });
  });
};

// Database operations for Habits
export const habitOperations = {
  // Create a new habit
  create: (habit) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO habits (gebruiker_id, naam, beschrijving, frequentie, strafpunten_bij_falen) VALUES (?, ?, ?, ?, ?)',
          [1, habit.naam, habit.beschrijving, habit.frequentie, habit.strafpunten_bij_falen || 0],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Get all habits
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM habits WHERE gebruiker_id = ?',
          [1],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Update habit completion
  updateCompletion: (habitId, completed) => {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];
      db.transaction(tx => {
        if (completed) {
          tx.executeSql(
            'UPDATE habits SET laatst_voltooid = ?, streak = streak + 1 WHERE id = ?',
            [today, habitId],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        } else {
          tx.executeSql(
            'UPDATE habits SET streak = 0 WHERE id = ?',
            [habitId],
            (_, result) => resolve(result),
            (_, error) => reject(error)
          );
        }
      });
    });
  }
};

// Database operations for Tasks
export const taskOperations = {
  // Create a new task
  create: (task) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO tasks (gebruiker_id, naam, beschrijving, deadline, categorie) VALUES (?, ?, ?, ?, ?)',
          [1, task.naam, task.beschrijving, task.deadline, task.categorie],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Get all tasks
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM tasks WHERE gebruiker_id = ?',
          [1],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Update task completion
  updateCompletion: (taskId, completed) => {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE tasks SET voltooid = ?, datum_voltooid = ? WHERE id = ?',
          [completed ? 1 : 0, completed ? today : null, taskId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }
};

// Database operations for Goals
export const goalOperations = {
  // Create a new goal
  create: (goal) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO goals (gebruiker_id, naam, beschrijving, deadline, strafpunten_bij_falen) VALUES (?, ?, ?, ?, ?)',
          [1, goal.naam, goal.beschrijving, goal.deadline, goal.strafpunten_bij_falen || 0],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Get all goals
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM goals WHERE gebruiker_id = ?',
          [1],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      });
    });
  },

  // Update goal completion
  updateCompletion: (goalId, completed) => {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0];
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE goals SET voltooid = ?, datum_voltooid = ? WHERE id = ?',
          [completed ? 1 : 0, completed ? today : null, goalId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }
};

// User operations
export const userOperations = {
  // Create or get user
  createOrGet: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // First, try to get existing user
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [1],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows._array[0]);
            } else {
              // Create new user
              tx.executeSql(
                'INSERT INTO users (naam, strafpunten) VALUES (?, ?)',
                ['Productieve Gebruiker', 0],
                (_, insertResult) => {
                  resolve({ id: insertResult.insertId, naam: 'Productieve Gebruiker', strafpunten: 0 });
                },
                (_, error) => reject(error)
              );
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },

  // Update penalty points
  updatePenaltyPoints: (points) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE users SET strafpunten = strafpunten + ? WHERE id = ?',
          [points, 1],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }
};

export default db;

