const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
  },
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  timezone: process.env.DB_TIMEZONE || "+00:00",
};

const pool = mysql.createPool(dbConfig);

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        mood VARCHAR(50) NOT NULL,
        value INT NOT NULL CHECK (value >= 1 AND value <= 5),
        emoji VARCHAR(10),
        label VARCHAR(100),
        notes TEXT,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_timestamp (user_id, timestamp DESC),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

async function createOrUpdateUser(userId, email) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO users (id, email) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE email = VALUES(email), updated_at = CURRENT_TIMESTAMP`,
      [userId, email]
    );
    return result;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

async function createMoodEntry(moodEntry) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO mood_entries (id, user_id, mood, value, emoji, notes, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        moodEntry.id,
        moodEntry.userId,
        moodEntry.mood,
        moodEntry.value,
        moodEntry.emoji,
        moodEntry.notes,
        moodEntry.timestamp,
      ]
    );
    return result;
  } catch (error) {
    console.error("Error creating mood entry:", error);
    throw error;
  }
}

async function updateMoodEntry(moodId, userId, moodEntry) {
  try {
    const [result] = await pool.execute(
      `UPDATE mood_entries 
       SET mood = ?, value = ?, emoji = ?, notes = ?, timestamp = ?
       WHERE id = ? AND user_id = ?`,
      [
        moodEntry.mood,
        moodEntry.value,
        moodEntry.emoji,
        moodEntry.notes,
        moodEntry.timestamp,
        moodId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Mood entry not found or unauthorized");
    }

    return result;
  } catch (error) {
    console.error("Error updating mood entry:", error);
    throw error;
  }
}

async function getMoodEntriesByUser(userId, limit = 30, offset = 0) {
  try {
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);

    if (isNaN(limitInt) || limitInt < 1) {
      throw new Error("Invalid limit parameter");
    }
    if (isNaN(offsetInt) || offsetInt < 0) {
      throw new Error("Invalid offset parameter");
    }

    const [rows] = await pool.execute(
      `SELECT * FROM mood_entries 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ${limitInt} OFFSET ${offsetInt}`,
      [userId]
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM mood_entries WHERE user_id = ?",
      [userId]
    );

    return {
      data: rows,
      total: countResult[0].total,
    };
  } catch (error) {
    console.error("Error getting mood entries:", error);
    throw error;
  }
}

async function deleteMoodEntry(userId, entryId) {
  try {
    const [result] = await pool.execute(
      "DELETE FROM mood_entries WHERE id = ? AND user_id = ?",
      [entryId, userId]
    );
    return result;
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    throw error;
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  createOrUpdateUser,
  getUserById,
  createMoodEntry,
  updateMoodEntry,
  getMoodEntriesByUser,
  deleteMoodEntry,
  testConnection,
};
