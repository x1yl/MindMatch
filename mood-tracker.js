let currentView = "week";
let selectedMood = null;
let moodData = [];
let moodChart = null;

const currentDate = document.getElementById("currentDate");
const today = new Date();
currentDate.textContent = today.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const moodOptions = document.querySelectorAll(".mood-option");
const saveMoodBtn = document.getElementById("saveMoodBtn");
const moodNotes = document.getElementById("moodNotes");
const successMessage = document.getElementById("successMessage");

moodOptions.forEach((option) => {
  option.addEventListener("click", () => {
    moodOptions.forEach((opt) => opt.classList.remove("selected"));

    option.classList.add("selected");

    selectedMood = {
      mood: option.dataset.mood,
      value: parseInt(option.dataset.value),
      emoji: option.querySelector(".mood-emoji").textContent,
      label: option.querySelector(".font-medium").textContent,
    };

    saveMoodBtn.disabled = false;
  });
});

saveMoodBtn.addEventListener("click", () => {
  if (!selectedMood) return;

  const moodEntry = {
    ...selectedMood,
    notes: moodNotes.value.trim(),
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
  };

  moodData.unshift(moodEntry);

  showSuccessMessage();

  resetForm();

  updateMoodHistory();

  updateMoodChart();
  updateMoodInsights();
});

function showSuccessMessage() {
  successMessage.classList.remove("hidden");
  successMessage.classList.add("success-animation");

  setTimeout(() => {
    successMessage.classList.add("hidden");
    successMessage.classList.remove("success-animation");
  }, 3000);
}

function resetForm() {
  moodOptions.forEach((opt) => opt.classList.remove("selected"));
  selectedMood = null;
  moodNotes.value = "";
  saveMoodBtn.disabled = true;
}

function updateMoodHistory() {
  const moodHistory = document.getElementById("moodHistory");

  if (moodData.length === 0) {
    moodHistory.innerHTML =
      '<p class="text-dark-2 text-center py-8">No mood entries yet. Track your first mood above!</p>';
    return;
  }

  moodHistory.innerHTML = moodData
    .slice(0, 5)
    .map(
      (entry) => `
          <div class="bg-light-1 rounded-xl p-4 border border-dark-3 fade-in">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">${entry.emoji}</span>
              <div>
                <div class="font-medium text-dark-1">${entry.label}</div>
                <div class="text-sm text-dark-2">${entry.date}</div>
              </div>
            </div>
            ${
              entry.notes
                ? `<p class="text-dark-2 text-sm mt-2">${entry.notes}</p>`
                : ""
            }
          </div>
        `
    )
    .join("");
}

updateMoodHistory();

function initMoodChart() {
  const ctx = document.getElementById("moodChart").getContext("2d");

  moodChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Mood Level",
          data: [],
          borderColor: "var(--color-primary)",
          backgroundColor: "rgba(0, 128, 64, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: function (context) {
            const value = context.parsed?.y;
          },
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "var(--color-light-1)",
          titleColor: "var(--color-dark-1)",
          bodyColor: "var(--color-dark-2)",
          borderColor: "var(--color-dark-3)",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              const moodLabels = {
                5: "Amazing 😄",
                4: "Good 😊",
                3: "Okay 😐",
                2: "Sad 😔",
                1: "Terrible 😢",
              };
              return moodLabels[context.parsed.y] || "Unknown";
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 0.5,
          max: 5.5,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              const moodEmojis = {
                1: "😢",
                2: "😔",
                3: "😐",
                4: "😊",
                5: "😄",
              };
              return moodEmojis[value] || "";
            },
            color: "var(--color-dark-2)",
            font: {
              size: 16,
            },
          },
          grid: {
            color: "var(--color-light-3)",
            borderDash: [2, 2],
          },
        },
        x: {
          ticks: {
            color: "var(--color-dark-2)",
            maxTicksLimit: 7,
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function updateMoodChart() {
  if (!moodChart) return;

  if (moodData.length === 0) {
    moodChart.data.labels = [];
    moodChart.data.datasets[0].data = [];
    moodChart.update();
    return;
  }

  const days = currentView === "week" ? 7 : 30;
  const recentData = moodData.slice(0, days).reverse();

  const labels = recentData.map((entry) => {
    const date = new Date(entry.timestamp);
    return currentView === "week"
      ? date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
  });

  const data = recentData.map((entry) => entry.value);

  moodChart.data.labels = labels;
  moodChart.data.datasets[0].data = data;
  moodChart.update();
}

function updateMoodInsights() {
  const insightsContent = document.getElementById("insightsContent");

  if (moodData.length === 0) {
    insightsContent.innerHTML =
      '<p class="text-dark-2 col-span-2 text-center py-8">Start tracking your moods to see personalized insights!</p>';
    return;
  }

  const recentWeek = moodData.slice(0, 7);
  const averageMood =
    recentWeek.reduce((sum, entry) => sum + entry.value, 0) / recentWeek.length;
  const moodTrend = calculateMoodTrend(recentWeek);
  const dominantMood = getDominantMood(recentWeek);
  const moodVariability = calculateMoodVariability(recentWeek);

  insightsContent.innerHTML = `
          <div class="bg-light-2 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <i class="fas fa-chart-line text-primary"></i>
              </div>
              <div>
                <h4 class="font-semibold text-dark-1">Weekly Average</h4>
                <p class="text-2xl font-bold text-primary">${averageMood.toFixed(
                  1
                )}/5</p>
              </div>
            </div>
            <p class="text-sm text-dark-2">${getMoodDescription(
              averageMood
            )}</p>
          </div>
          
          <div class="bg-light-2 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <i class="fas fa-trending-${
                  moodTrend.direction === "up"
                    ? "up"
                    : moodTrend.direction === "down"
                    ? "down"
                    : "up"
                } text-blue-500"></i>
              </div>
              <div>
                <h4 class="font-semibold text-dark-1">Mood Trend</h4>
                <p class="text-lg font-semibold ${
                  moodTrend.direction === "up"
                    ? "text-green-500"
                    : moodTrend.direction === "down"
                    ? "text-red-500"
                    : "text-yellow-500"
                }">${moodTrend.description}</p>
              </div>
            </div>
            <p class="text-sm text-dark-2">${moodTrend.message}</p>
          </div>
          
          <div class="bg-light-2 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span class="text-xl">${dominantMood.emoji}</span>
              </div>
              <div>
                <h4 class="font-semibold text-dark-1">Most Common</h4>
                <p class="text-lg font-semibold text-dark-1">${
                  dominantMood.label
                }</p>
              </div>
            </div>
            <p class="text-sm text-dark-2">You've felt ${dominantMood.label.toLowerCase()} most often this week</p>
          </div>
          
          <div class="bg-light-2 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <i class="fas fa-balance-scale text-orange-500"></i>
              </div>
              <div>
                <h4 class="font-semibold text-dark-1">Stability</h4>
                <p class="text-lg font-semibold text-dark-1">${
                  moodVariability.level
                }</p>
              </div>
            </div>
            <p class="text-sm text-dark-2">${moodVariability.message}</p>
          </div>
        `;
}

function calculateMoodTrend(data) {
  if (data.length < 3)
    return {
      direction: "stable",
      description: "Not enough data",
      message: "Track more moods to see your trend",
    };

  const recent = data.slice(0, 3);
  const older = data.slice(3, 6);

  if (older.length === 0) {
    const first = data[data.length - 1].value;
    const last = data[0].value;
    const difference = last - first;

    if (difference > 0.5) {
      return {
        direction: "up",
        description: "Improving",
        message: "Your recent moods are getting better!",
      };
    } else if (difference < -0.5) {
      return {
        direction: "down",
        description: "Declining",
        message: "Your recent moods have been lower. Consider some self-care.",
      };
    } else {
      return {
        direction: "stable",
        description: "Stable",
        message: "Your mood has been relatively consistent.",
      };
    }
  }

  const recentAvg =
    recent.reduce((sum, entry) => sum + entry.value, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, entry) => sum + entry.value, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.3) {
    return {
      direction: "up",
      description: "Improving",
      message: "Your mood has been trending upward!",
    };
  } else if (difference < -0.3) {
    return {
      direction: "down",
      description: "Declining",
      message: "Your mood has been dipping. Consider self-care activities.",
    };
  } else {
    return {
      direction: "stable",
      description: "Stable",
      message: "Your mood has been relatively consistent.",
    };
  }
}

function getDominantMood(data) {
  const moodCounts = {};
  data.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  const dominantMoodKey = Object.keys(moodCounts).reduce((a, b) =>
    moodCounts[a] > moodCounts[b] ? a : b
  );

  return data.find((entry) => entry.mood === dominantMoodKey);
}

function calculateMoodVariability(data) {
  if (data.length < 2) return { level: "Unknown", message: "Not enough data" };

  const values = data.map((entry) => entry.value);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
    values.length;
  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation < 0.5) {
    return {
      level: "Very Stable",
      message: "Your moods have been quite consistent",
    };
  } else if (standardDeviation < 1) {
    return {
      level: "Stable",
      message: "Your moods show normal variation",
    };
  } else if (standardDeviation < 1.5) {
    return {
      level: "Variable",
      message: "Your moods fluctuate more than average",
    };
  } else {
    return {
      level: "Highly Variable",
      message: "Your moods change significantly day to day",
    };
  }
}

function getMoodDescription(average) {
  if (average >= 4.5) return "You've been feeling great recently!";
  if (average >= 3.5) return "You've been doing pretty well overall.";
  if (average >= 2.5) return "You've had some ups and downs recently.";
  if (average >= 1.5) return "Recent days have been challenging for you.";
  return "You've been going through a difficult time.";
}

document.getElementById("weekView").addEventListener("click", function () {
  currentView = "week";
  this.classList.add("bg-primary", "text-white");
  this.classList.remove("bg-light-3", "text-dark-1");
  document
    .getElementById("monthView")
    .classList.remove("bg-primary", "text-white");
  document
    .getElementById("monthView")
    .classList.add("bg-light-3", "text-dark-1");
  updateMoodChart();
});

document.getElementById("monthView").addEventListener("click", function () {
  currentView = "month";
  this.classList.add("bg-primary", "text-white");
  this.classList.remove("bg-light-3", "text-dark-1");
  document
    .getElementById("weekView")
    .classList.remove("bg-primary", "text-white");
  document
    .getElementById("weekView")
    .classList.add("bg-light-3", "text-dark-1");
  updateMoodChart();
});

initMoodChart();
updateMoodChart();
updateMoodInsights();
