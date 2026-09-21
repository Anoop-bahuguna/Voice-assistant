const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const btn = document.getElementById("btn");
const buttonLabel = btn.querySelector(".button-label");
const status = document.getElementById("status");
const transcript = document.getElementById("transcript");
const activityCount = document.getElementById("activity-count");
let recognition;
let activityTotal = 0;

const speak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
};

const updateStatus = (message, icon = "◌") => {
  status.innerHTML = `<span class="status-icon">${icon}</span> ${message}`;
};

const addActivity = (command, result = "Command received") => {
  const emptyState = transcript.querySelector(".empty-state");
  if (emptyState) emptyState.remove();
  activityTotal += 1;
  activityCount.textContent = String(activityTotal).padStart(2, "0");
  const item = document.createElement("div");
  item.className = "activity-item";
  const time = document.createElement("small");
  time.textContent = "JUST NOW";
  const commandText = document.createElement("p");
  commandText.textContent = `“${command}”`;
  const outcome = document.createElement("small");
  outcome.textContent = result;
  item.append(time, commandText, outcome);
  transcript.prepend(item);
};

const handleCommand = (command) => {
  const destinations = {
    youtube: "https://www.youtube.com",
    google: "https://www.google.com",
    twitter: "https://www.twitter.com",
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com",
  };
  const destination = Object.keys(destinations).find((site) =>
    command.includes(`open ${site}`),
  );
  if (destination) {
    const label = destination[0].toUpperCase() + destination.slice(1);
    speak(`Opening ${label}`);
    addActivity(command, `Opening ${label}`);
    window.open(destinations[destination], "_blank", "noopener");
    updateStatus(`${label} is opening`, "✓");
    return;
  }
  speak(`Searching for ${command}`);
  addActivity(command, "Searching the web");
  window.open(
    `https://www.google.com/search?q=${encodeURIComponent(command)}`,
    "_blank",
    "noopener",
  );
  updateStatus("Search opened in a new tab", "✓");
};

const resetButton = () => {
  btn.classList.remove("is-listening");
  buttonLabel.textContent = "Start listening";
};

const startListening = () => {
  if (!recognition) {
    updateStatus("Voice recognition is not supported in this browser", "!");
    return;
  }
  try {
    recognition.start();
    btn.classList.add("is-listening");
    buttonLabel.textContent = "Listening...";
    updateStatus("I’m listening for your command", "◉");
  } catch (error) {
    updateStatus("Already listening. Speak naturally", "◉");
  }
};

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase().trim();
    updateStatus(`Heard: “${command}”`, "✓");
    handleCommand(command);
  };
  recognition.onend = resetButton;
  recognition.onerror = (event) => {
    resetButton();
    updateStatus(
      event.error === "not-allowed"
        ? "Microphone access is blocked"
        : "I didn’t catch that. Try again",
      "!",
    );
  };
} else {
  updateStatus("Voice recognition is not supported in this browser", "!");
}

btn.addEventListener("click", startListening);
document.querySelectorAll(".quick-command").forEach((commandButton) => {
  commandButton.addEventListener("click", () =>
    handleCommand(commandButton.dataset.command),
  );
});
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && event.target === document.body) {
    event.preventDefault();
    startListening();
  }
});
