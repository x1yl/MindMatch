const express = require("express");
const app = express();
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwtAuthz = require("express-jwt-authz");
require("dotenv").config();

const {
  initializeDatabase,
  createOrUpdateUser,
  getUserById,
  createMoodEntry,
  updateMoodEntry,
  getMoodEntriesByUser,
  deleteMoodEntry,
  testConnection,
} = require("./database");

app.use(
  cors({
    origin: ["http://localhost:5500", "https://ericafk0001.github.io", "https://mind-match-chi.vercel.app"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

app.get("/health", async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: "OK",
    message: "MindMatch API is running",
    database: dbStatus ? "Connected" : "Disconnected",
  });
});

app.get("/api/profile", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const userEmail = req.auth["https://mindmatch.app/email"] || req.auth.email;

    await createOrUpdateUser(userId, userEmail);

    const user = await getUserById(userId);

    res.json(user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/moods", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const userEmail = req.auth["https://mindmatch.app/email"] || req.auth.email;

    await createOrUpdateUser(userId, userEmail);

    const moodEntry = {
      id: Date.now().toString(),
      userId: userId,
      userEmail: userEmail,
      mood: req.body.mood,
      value: req.body.value,
      emoji: req.body.emoji,
      notes: req.body.notes || "",
      timestamp: new Date().toISOString(),
    };

    await createMoodEntry(moodEntry);

    res.status(201).json({
      message: "Mood entry created successfully",
      data: moodEntry,
    });
  } catch (error) {
    console.error("Error creating mood entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/moods/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const moodId = req.params.id;

    const moodEntry = {
      mood: req.body.mood,
      value: req.body.value,
      emoji: req.body.emoji,
      notes: req.body.notes || "",
      timestamp: new Date().toISOString(),
    };

    await updateMoodEntry(moodId, userId, moodEntry);

    res.json({
      message: "Mood entry updated successfully",
      data: { id: moodId, ...moodEntry },
    });
  } catch (error) {
    console.error("Error updating mood entry:", error);
    if (error.message === "Mood entry not found or unauthorized") {
      res.status(404).json({ error: "Mood entry not found or unauthorized" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.get("/api/moods", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { limit = "30", offset = "0" } = req.query;

    const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 30)); // Min 1, Max 100
    const offsetInt = Math.max(0, parseInt(offset, 10) || 0); // Min 0

    const result = await getMoodEntriesByUser(userId, limitInt, offsetInt);

    res.json(result);
  } catch (error) {
    console.error("Error getting mood entries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/moods/:id", checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const moodId = req.params.id;

    const result = await deleteMoodEntry(userId, moodId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mood entry not found" });
    }

    res.json({ message: "Mood entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Missing or invalid token" });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    console.log("Initializing database...");
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`MindMatch API server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
