// logic.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("requestForm");
  if (!form) return;

  const spinner = document.getElementById("requestFormSpinner");
  const msgEl = document.getElementById("requestFormMessage");

  const disposableDomains = [
    "mailinator.com", "tempmail.com", "10minutemail.com",
    "guerrillamail.com", "yopmail.com", "dispostable.com"
  ];

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return false;
    const domain = email.split("@")[1].toLowerCase();
    return !disposableDomains.includes(domain);
  };

  const isValidName = (name) => /^[a-zA-Z\s]{2,50}$/.test(name.trim());
  const isValidPhone = (phone) => phone === "" || /^\+?\d{7,15}$/.test(phone.trim());
  const isValidLinkedIn = (link) => link === "" || link.startsWith("https://www.linkedin.com/");

  const showMessage = (msg, type = "error") => {
    msgEl.textContent = msg;
    msgEl.style.color = type === "error" ? "red" : type === "info" ? "blue" : "green";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.querySelector("input[name='name']").value.trim();
    const email = form.querySelector("input[name='email']").value.trim();
    const phone = form.querySelector("input[name='phone']").value.trim();
    const linkedin = form.querySelector("input[name='linkedin']").value.trim();
    const message = form.querySelector("textarea[name='message']").value.trim();
    const hp = form.querySelector("input[name='hp_field']").value.trim();

    // Honeypot
    if (hp !== "") return;

    // Field validation
    if (!isValidName(name)) return showMessage("Please enter a valid name (letters only).");
    if (!isValidEmail(email)) return showMessage("Please enter a valid email (no disposable emails).");
    if (!isValidPhone(phone)) return showMessage("Please enter a valid phone number (optional).");
    if (!isValidLinkedIn(linkedin)) return showMessage("Please enter a valid LinkedIn URL (optional).");

    // Check reCAPTCHA
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) return showMessage("Please complete the reCAPTCHA challenge.");

    // Show spinner
    spinner.style.display = "inline";
    showMessage("Sending request...", "info");

    const formData = new FormData(form);

    // Include reCAPTCHA token in the Formspree request
    formData.append("g-recaptcha-response", recaptchaResponse);

    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { "Accept": "application/json" },
    })
    .then(response => response.json())
    .then(data => {
      spinner.style.display = "none";
      grecaptcha.reset(); // reset reCAPTCHA

      if (data.ok || data.success) {
        showMessage("✅ Request sent successfully!", "success");
        form.reset();
      } else {
        showMessage("❌ Submission failed. Please try again.", "error");
      }
    })
    .catch(() => {
      spinner.style.display = "none";
      grecaptcha.reset();
      showMessage("❌ Network error. Please try again later.", "error");
    });
  });
});

