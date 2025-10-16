// logic.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  // Simple disposable email domains list
  const disposableDomains = [
    "mailinator.com", "tempmail.com", "10minutemail.com",
    "guerrillamail.com", "yopmail.com", "dispostable.com"
  ];

  // Utility functions
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return false;

    // Check disposable domains
    const domain = email.split("@")[1].toLowerCase();
    return !disposableDomains.includes(domain);
  };

  const isValidName = (name) => /^[a-zA-Z\s]{2,50}$/.test(name.trim());
  const isValidPhone = (phone) => phone === "" || /^\+?\d{7,15}$/.test(phone.trim());
  const isValidLinkedIn = (link) => link === "" || link.startsWith("https://www.linkedin.com/");

  // Create feedback message
  const showMessage = (msg, type = "error") => {
    let msgEl = document.getElementById("form-message");
    if (!msgEl) {
      msgEl = document.createElement("p");
      msgEl.id = "form-message";
      form.prepend(msgEl);
    }
    msgEl.textContent = msg;
    msgEl.style.color = type === "error" ? "red" : "green";
  };

  form.addEventListener("submit", (e) => {
    const name = form.querySelector("input[name='name']")?.value || "";
    const email = form.querySelector("input[name='email']")?.value || "";
    const phone = form.querySelector("input[name='phone']")?.value || "";
    const linkedin = form.querySelector("input[name='linkedin']")?.value || "";

    // Validate fields
    if (!isValidName(name)) {
      e.preventDefault();
      showMessage("Please enter a valid name (letters only).");
      return;
    }

    if (!isValidEmail(email)) {
      e.preventDefault();
      showMessage("Please enter a valid email (no disposable emails).");
      return;
    }

    if (!isValidPhone(phone)) {
      e.preventDefault();
      showMessage("Please enter a valid phone number (optional).");
      return;
    }

    if (!isValidLinkedIn(linkedin)) {
      e.preventDefault();
      showMessage("Please enter a valid LinkedIn URL (optional).");
      return;
    }

    // Optional: show "sending..." message
    showMessage("Sending request...", "info");

    // Formspree automatically handles submission, so we let it proceed
  });
});
