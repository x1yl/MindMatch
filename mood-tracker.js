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

const selfCareTips = {
  declining: {
    urgent: [
      {
        title: "Take Deep Breaths",
        description:
          "Try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8.",
        icon: "fas fa-wind",
        action: "Practice now for 2 minutes",
        actionUrl: "https://www.healthline.com/health/4-7-8-breathing",
      },
      {
        title: "Reach Out",
        description:
          "Contact a trusted friend, family member, or mental health professional.",
        icon: "fas fa-phone",
        action: "Call someone who cares",
        actionUrl: "https://www.betterhelp.com/",
      },
      {
        title: "Ground Yourself",
        description:
          "Use the 5-4-3-2-1 technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
        icon: "fas fa-hand-paper",
        action: "Try grounding exercise",
        actionUrl: "https://www.verywellmind.com/grounding-techniques-4586742",
      },
    ],
    mild: [
      {
        title: "Practice Self-Compassion",
        description:
          "Treat yourself with the same kindness you'd show a good friend.",
        icon: "fas fa-heart",
        action: "Write yourself a kind note",
        actionUrl: "https://self-compassion.org/",
      },
      {
        title: "Stay Hydrated",
        description:
          "Dehydration can affect mood. Drink a glass of water mindfully.",
        icon: "fas fa-tint",
        action: "Drink water now",
        actionUrl:
          "https://www.cdc.gov/healthyweight/healthy_eating/water-and-healthier-drinks.html",
      },
      {
        title: "Listen to Music",
        description: "Put on your favorite calming or uplifting songs.",
        icon: "fas fa-music",
        action: "Play your comfort playlist",
        actionUrl: "https://open.spotify.com/",
      },
      {
        title: "Practice Gratitude",
        description:
          "Write down 3 things you're grateful for, no matter how small.",
        icon: "fas fa-list",
        action: "Start a gratitude list",
        actionUrl: "https://www.happify.com/",
      },
    ],
  },
};

function detectMoodDecline(moodHistory) {
  if (!moodHistory || moodHistory.length < 2) return null;

  const recent = moodHistory.slice(0, 7);
  const currentMood = recent[0]?.value || 3;

  let declineCount = 0;
  let significantDecline = false;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].value > recent[i - 1].value) {
      declineCount++;
    }
  }

  if (recent.length >= 3) {
    const firstThree =
      recent.slice(-3).reduce((sum, entry) => sum + entry.value, 0) / 3;
    const lastThree =
      recent.slice(0, 3).reduce((sum, entry) => sum + entry.value, 0) / 3;
    significantDecline = firstThree - lastThree >= 1;
  }

  if ((currentMood <= 2 && declineCount >= 2) || significantDecline) {
    return currentMood <= 1 ? "urgent" : "mild";
  }

  return null;
}

function getRandomTips(severity, count = 2) {
  const tips = selfCareTips.declining[severity];
  const shuffled = [...tips].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function createTipCard(tip, severity) {
  const urgentClass = severity === "urgent" ? "tip-urgent" : "tip-mild";
  return `
    <div class="tip-card ${urgentClass} rounded-xl p-6 mb-4">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i class="${tip.icon} text-black dark:text-white text-xl"></i>
          </div>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-white text-lg mb-2">${tip.title}</h4>
          <p class="text-white text-opacity-90 mb-3">${tip.description}</p>
          <a href="${tip.actionUrl}" target="_blank" rel="noopener noreferrer">
            <button class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm">
              ${tip.action} 
            </button>
          </a>
        </div>
      </div>
    </div>
  `;
}

function createDeclineAlert(severity) {
  const isUrgent = severity === "urgent";
  const alertClass = isUrgent
    ? "bg-red-100 border-red-500 text-red-800"
    : "bg-green-100 border-green-500 text-green-800";
  const icon = isUrgent ? "fas fa-exclamation-triangle" : "fas fa-info-circle";
  const title = isUrgent
    ? "We Notice You're Struggling"
    : "Your Mood Seems Lower";
  const message = isUrgent
    ? "Your recent mood entries show you might be having a difficult time. Please consider these immediate self-care strategies."
    : "Your mood hasn't been the best. Here are some gentle ways to care for yourself.";

  return `
    <div class="${alertClass} border-l-4 p-4 rounded-r-lg mb-6">
      <div class="flex items-center">
        <i class="${icon} mr-3 text-lg"></i>
        <div>
          <h4 class="font-semibold">${title}</h4>
          <p class="text-sm mt-1">${message}</p>
        </div>
      </div>
    </div>
  `;
}

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

  const moodColors = {
    5: "#22c55e", // green
    4: "#3b82f6", // blue
    3: "#facc15", // yellow
    2: "#f97316", // orange
    1: "#ef4444", // red
  };

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
            return moodColors[value] || "#a3a3a3";
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

  let regularInsightsHtml = `
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
      <p class="text-sm text-dark-2">${getMoodDescription(averageMood)}</p>
    </div>
    
    <div class="bg-light-2 rounded-lg p-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
          <i class="fas ${
            moodTrend.direction === "up"
              ? "fa-arrow-up text-green-500"
              : moodTrend.direction === "down"
              ? "fa-arrow-down text-red-500"
              : "fa-minus text-yellow-500"
          } text-2xl"></i>
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
          <p class="text-lg font-semibold text-dark-1">${dominantMood.label}</p>
        </div>
      </div>
      <p class="text-sm text-dark-2">You've felt ${dominantMood.label.toLowerCase()} most often this week</p>
    </div>
    
    <div class="bg-light-2 rounded-lg p-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
          <i class="fas fa-balance-scale text-dark-2 dark:text-dark-2-dark"></i>
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

  const declineLevel = detectMoodDecline(moodData);

  let selfCareSuggestions = "";

  if (declineLevel === "urgent" || averageMood < 1.3) {
    const alertHtml = createDeclineAlert("urgent");
    const tips = getRandomTips("urgent", 3);
    const tipsHtml = tips.map((tip) => createTipCard(tip, "urgent")).join("");
    selfCareSuggestions = `
      <div class="md:col-span-2 mt-6 border-t border-dark-3 pt-6">
        ${alertHtml}
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-dark-1 mb-4">
            <i class="fas fa-heart text-red-500 mr-2"></i>
            Self-Care Suggestions
          </h4>
          ${tipsHtml}
        </div>
        <div class="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <h4 class="font-semibold text-red-800 mb-4 flex items-center">
            <i class="fas fa-phone text-red-600 mr-2"></i>
            Need Immediate Support?
          </h4>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="font-medium text-red-700">Crisis Text Line</p>
              <p class="text-red-600">Text HOME to 741741</p>
            </div>
            <div>
              <p class="font-medium text-red-700">National Suicide Prevention Lifeline</p>
              <p class="text-red-600">988</p>
            </div>
          </div>
          <p class="text-red-600 text-xs mt-3">You are not alone. Professional help is available 24/7.</p>
        </div>
      </div>
    `;
  } else if (declineLevel === "mild" || averageMood < 3.5) {
    const alertHtml = createDeclineAlert("mild");
    const tips = getRandomTips("mild", 2);
    const tipsHtml = tips.map((tip) => createTipCard(tip, "mild")).join("");
    selfCareSuggestions = `
      <div class="md:col-span-2 mt-6 border-t border-dark-3 pt-6">
        ${alertHtml}
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-dark-1 mb-4">
            <i class="fas fa-heart text-dark-2 dark:text-dark-2-dark mr-2"></i>
            Gentle Self-Care Suggestions
          </h4>
          ${tipsHtml}
        </div>
      </div>
    `;
  } else if (moodData.length >= 3) {
    const tips = getRandomTips("mild", 1);
    const tipsHtml = tips.map((tip) => createTipCard(tip, "mild")).join("");
    selfCareSuggestions = `
      <div class="md:col-span-2 mt-6 border-t border-dark-3 pt-6">
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-dark-1 mb-4">
            <i class="fas fa-heart text-primary mr-2"></i>
            Self-Care Tip
          </h4>
          ${tipsHtml}
        </div>
      </div>
    `;
  }

  insightsContent.innerHTML = regularInsightsHtml + selfCareSuggestions;
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
