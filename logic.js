document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.85;
    sections.forEach(s => {
      if (s.getBoundingClientRect().top < trigger) s.classList.add("visible");
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

  fetch('https://api.github.com/users/SwapnopamMitra')
    .then(res => res.json())
    .then(d => {
      const a = document.getElementById('avatar');
      const n = document.getElementById('github-name');
      const b = document.getElementById('github-bio');
      const l = document.getElementById('github-link');
      if(a) a.src = d.avatar_url;
      if(n) n.textContent = d.name || d.login;
      if(b) b.textContent = d.bio || '';
      if(l) l.href = d.html_url;
    });

  fetch('https://api.github.com/users/SwapnopamMitra/repos?sort=updated&per_page=5')
    .then(res => res.json())
    .then(repos => {
      const pl = document.getElementById('project-list');
      if(!pl) return;
      pl.innerHTML = '';
      repos.forEach(r => {
        const c = document.createElement('div');
        c.className = 'project-card';
        c.innerHTML = `<h3><a href="${r.html_url}" target="_blank">${r.name}</a></h3><p class="project-meta">${r.description||'No description'} • ⭐ ${r.stargazers_count}</p>`;
        pl.appendChild(c);
      });
    })
    .catch(()=>{const pl=document.getElementById('project-list');if(pl) pl.innerHTML='<p>Failed to load projects.</p>';});

  const form = document.getElementById("requestForm");
  if(!form) return;
  const spinner = document.getElementById("requestFormSpinner");
  const msgEl = document.getElementById("requestFormMessage");
  const disposableDomains=["mailinator.com","tempmail.com","10minutemail.com","guerrillamail.com","yopmail.com","dispostable.com"];
  const isValidEmail=e=>{const r=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;return r.test(e)&&!disposableDomains.includes(e.split("@")[1].toLowerCase());};
  const isValidName=n=>/^[a-zA-Z\s]{2,50}$/.test(n.trim());
  const isValidPhone=p=>p===""||/^\+?\d{7,15}$/.test(p.trim());
  const isValidLinkedIn=l=>l===""||l.startsWith("https://www.linkedin.com/");
  const showMessage=(m,t="error")=>{if(!msgEl)return;msgEl.textContent=m;msgEl.style.color=t==="error"?"red":t==="info"?"blue":"green";};

  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const name=form.querySelector("input[name='name']")?.value.trim()||"";
    const email=form.querySelector("input[name='email']")?.value.trim()||"";
    const phone=form.querySelector("input[name='phone']")?.value.trim()||"";
    const linkedin=form.querySelector("input[name='linkedin']")?.value.trim()||"";
    const message=form.querySelector("textarea[name='message']")?.value.trim()||"";
    const hp=form.querySelector("input[name='hp_field']")?.value.trim()||"";
    if(hp!=="") return;
    if(!isValidName(name)) return showMessage("Please enter a valid name (letters only).");
    if(!isValidEmail(email)) return showMessage("Please enter a valid email (no disposable emails).");
    if(!isValidPhone(phone)) return showMessage("Please enter a valid phone number (optional).");
    if(!isValidLinkedIn(linkedin)) return showMessage("Please enter a valid LinkedIn URL (optional).");
    if(typeof grecaptcha==="undefined") return showMessage("reCAPTCHA not loaded.");
    const recaptchaResponse=grecaptcha.getResponse();
    if(!recaptchaResponse) return showMessage("Please complete the reCAPTCHA challenge.");
    if(spinner) spinner.style.display="inline";
    showMessage("Sending request...","info");
    try{
      const fd=new FormData(form);
      fd.append("g-recaptcha-response",recaptchaResponse);
      const res=await fetch(form.action,{method:form.method,body:fd,headers:{"Accept":"application/json"}});
      const data=await res.json();
      if(spinner) spinner.style.display="none";
      grecaptcha.reset();
      if(data.ok||data.success){showMessage("✅ Request sent successfully!","success");form.reset();}
      else showMessage("❌ Submission failed. Please try again.","error");
    }catch{
      if(spinner) spinner.style.display="none";
      grecaptcha.reset();
      showMessage("❌ Network error. Please try again later.","error");
    }
  });
});
