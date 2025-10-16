document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top < triggerBottom) section.classList.add("visible");
    });
  };
  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.style.display = window.scrollY > 300 ? "block" : "none";
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const form = document.getElementById("requestForm");
  if (!form) return;

  const spinner = document.getElementById("requestFormSpinner");
  const msgEl = document.getElementById("requestFormMessage");

  const disposableDomains = [
    "mailinator.com", "tempmail.com", "10minutemail.com",
    "guerrillamail.com", "yopmail.com", "dispostable.com"
  ];

  const isValidEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return false;
    const domain = email.split("@")[1].toLowerCase();
    return !disposableDomains.includes(domain);
  };

  const isValidName = name => /^[a-zA-Z\s]{2,50}$/.test(name.trim());
  const isValidPhone = phone => phone === "" || /^\+?\d{7,15}$/.test(phone.trim());
  const isValidLinkedIn = link => link === "" || link.startsWith("https://www.linkedin.com/");

  const showMessage = (msg, type = "error") => {
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.style.color = type === "error" ? "red" : type === "info" ? "blue" : "green";
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const name = form.querySelector("input[name='name']")?.value.trim() || "";
    const email = form.querySelector("input[name='email']")?.value.trim() || "";
    const phone = form.querySelector("input[name='phone']")?.value.trim() || "";
    const linkedin = form.querySelector("input[name='linkedin']")?.value.trim() || "";
    const message = form.querySelector("textarea[name='message']")?.value.trim() || "";
    const hp = form.querySelector("input[name='hp_field']")?.value.trim() || "";

    if (hp !== "") return;

    if (!isValidName(name)) return showMessage("Please enter a valid name (letters only).");
    if (!isValidEmail(email)) return showMessage("Please enter a valid email (no disposable emails).");
    if (!isValidPhone(phone)) return showMessage("Please enter a valid phone number (optional).");
    if (!isValidLinkedIn(linkedin)) return showMessage("Please enter a valid LinkedIn URL (optional).");

    if (typeof grecaptcha === "undefined") return showMessage("reCAPTCHA not loaded.");
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) return showMessage("Please complete the reCAPTCHA challenge.");

    if (spinner) spinner.style.display = "inline";
    showMessage("Sending request...", "info");

    try {
      const formData = new FormData(form);
      formData.append("g-recaptcha-response", recaptchaResponse);

      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { "Accept": "application/json" },
      });
      const data = await response.json();

      if (spinner) spinner.style.display = "none";
      grecaptcha.reset();

      if (data.ok || data.success) {
        showMessage("✅ Request sent successfully!", "success");
        form.reset();
      } else {
        showMessage("❌ Submission failed. Please try again.", "error");
      }
    } catch {
      if (spinner) spinner.style.display = "none";
      grecaptcha.reset();
      showMessage("❌ Network error. Please try again later.", "error");
    }
  });
});
