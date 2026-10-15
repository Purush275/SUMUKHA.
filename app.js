const API_BASE = "http://127.0.0.1:8000";

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 3000);
}

const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(el => observer.observe(el));
} else revealElements.forEach(el => el.classList.add("visible"));

const photoInput = document.querySelector("#skinPhoto");
const preview = document.querySelector("#photoPreview");
const analyzeBtn = document.querySelector("#analyzeBtn");
const scanMessage = document.querySelector("#scanMessage");
const dropzone = document.querySelector("#uploadDropzone");
let selectedPhoto = null;
let previewUrl = null;

function clearPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  preview.replaceChildren();
  selectedPhoto = null;
  analyzeBtn.disabled = true;
}
function handlePhoto(file) {
  clearPreview();
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    scanMessage.textContent = "Choose a JPG, PNG, or WEBP image."; return;
  }
  if (file.size > 8 * 1024 * 1024) {
    scanMessage.textContent = "The image must be smaller than 8 MB."; return;
  }
  selectedPhoto = file;
  previewUrl = URL.createObjectURL(file);
  const img = document.createElement("img");
  img.alt = "Selected photo preview";
  img.src = previewUrl;
  img.onload = () => {
    scanMessage.textContent = "Photo preview ready. It has not been uploaded or analyzed.";
    analyzeBtn.disabled = false;
  };
  img.onerror = () => {
    clearPreview();
    scanMessage.textContent = "This image could not be previewed. Try another.";
  };
  preview.appendChild(img);
}
photoInput.addEventListener("change", () => handlePhoto(photoInput.files?.[0]));
["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, e => {
  e.preventDefault(); dropzone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, e => {
  e.preventDefault(); dropzone.classList.remove("dragover");
}));
dropzone.addEventListener("drop", e => {
  const file = e.dataTransfer?.files?.[0];
  if (file) handlePhoto(file);
});
analyzeBtn.addEventListener("click", () => {
  if (!selectedPhoto) return;
  scanMessage.textContent = "AI image analysis is not connected yet. Your photo has not been uploaded.";
  showToast("Photo preview works. AI scanning comes in the backend phase.");
});

const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
function addMessage(text, role) {
  const row = document.createElement("div");
  row.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;
  const bubble = document.createElement("div");
  bubble.appendChild(document.createTextNode(text));
  if (role !== "user") {
    const small = document.createElement("small");
    small.textContent = "SUMUKHA Assistant";
    bubble.appendChild(small);
    const mark = document.createElement("span");
    mark.className = "message-mark";
    mark.textContent = "✿";
    row.appendChild(mark);
  }
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function sendMessage(question) {
  const text = question.trim();
  if (!text) return;
  if (text.length > 1000) return showToast("Please keep your message under 1000 characters.");
  addMessage(text, "user");
  chatInput.value = "";
  const typing = document.createElement("div");
  typing.className = "message assistant-message";
  typing.id = "typingIndicator";
  const bubble = document.createElement("div");
  bubble.textContent = "SUMUKHA is preparing a response…";
  typing.appendChild(bubble);
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  setTimeout(() => {
    document.querySelector("#typingIndicator")?.remove();
    addMessage("Thanks for your question! The SUMUKHA AI model has not been connected yet. We will connect this chat to the Python backend in the next phase.", "assistant");
  }, 650);
}
chatForm.addEventListener("submit", e => { e.preventDefault(); sendMessage(chatInput.value); });
document.querySelectorAll(".suggestion-chip").forEach(btn => btn.addEventListener("click", () => sendMessage(btn.textContent)));

const dialog = document.querySelector("#accountDialog");
const openDialog = () => {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else showToast("Please use an up-to-date browser.");
};
document.querySelector("#accountBtn").addEventListener("click", openDialog);
document.querySelector("#historyAccountBtn").addEventListener("click", openDialog);
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
let mode = "login";
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  mode = tab.dataset.mode;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  const registering = mode === "register";
  document.querySelector("#nameField").hidden = !registering;
  document.querySelector("#accountName").required = registering;
  document.querySelector("#accountPassword").autocomplete = registering ? "new-password" : "current-password";
  document.querySelector("#accountSubmit").textContent = registering ? "Create account" : "Login";
  document.querySelector("#accountMessage").textContent = "Demo only: account services are not connected yet.";
}));
document.querySelector("#accountForm").addEventListener("submit", e => {
  e.preventDefault();
  document.querySelector("#accountMessage").textContent = "Login and registration are not active yet. Your details have not been sent or saved.";
  showToast("Account backend is the next integration step.");
});
document.querySelector("#currentYear").textContent = new Date().getFullYear();
