/* ============================================================
   CYBER TOOLKIT — toolkit.js
   8 interactive cybersecurity tools, all pure vanilla JS.
   Each tool renders into the shared modal via buildTool*() fns.
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ──────────────────────────────────────────────────────────
     MODAL WIRING
  ────────────────────────────────────────────────────────── */
  const overlay   = document.getElementById("tk-modal-overlay");
  const modal     = document.getElementById("tk-modal");
  const closeBtn  = document.getElementById("tk-modal-close");
  const titleEl   = document.getElementById("tk-modal-title");
  const bodyEl    = document.getElementById("tk-modal-body");

  function openModal(toolId) {
    const builders = {
      "password-checker": buildPasswordChecker,
      "phishing-detector": buildPhishingDetector,
      "malware-risk":      buildMalwareRisk,
      "safety-score":      buildSafetyScore,
      "pwd-generator":     buildPasswordGenerator,
      "url-checker":       buildUrlChecker,
      "tips-gen":          buildTipsGenerator,
      "breach-check":      buildBreachChecker,
    };
    const titles = {
      "password-checker": "Password Strength Checker",
      "phishing-detector": "Phishing Email Detector",
      "malware-risk":      "Malware Risk Checker",
      "safety-score":      "Internet Safety Score",
      "pwd-generator":     "Password Generator",
      "url-checker":       "URL Safety Checker",
      "tips-gen":          "Cybersecurity Tips",
      "breach-check":      "Data Breach Awareness",
    };
    titleEl.textContent = titles[toolId] || "Tool";
    bodyEl.innerHTML = "";
    if (builders[toolId]) builders[toolId](bodyEl);
    // Track tool use in progress system
    if (window.CyberProgress) window.CyberProgress.useTool(toolId);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    // Focus the modal for accessibility
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    bodyEl.innerHTML = "";
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Wire every "Try Tool" button
  document.querySelectorAll(".tk-try-btn").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.tool));
  });

  /* ──────────────────────────────────────────────────────────
     SEARCH / FILTER
  ────────────────────────────────────────────────────────── */
  const searchInput  = document.getElementById("tk-search");
  const grid         = document.getElementById("tk-grid");
  const noResults    = document.getElementById("tk-no-results");

  searchInput && searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    let visible = 0;
    grid.querySelectorAll(".tk-card").forEach(card => {
      const tags  = card.dataset.tags || "";
      const title = card.querySelector(".tk-card-title").textContent.toLowerCase();
      const match = !q || tags.includes(q) || title.includes(q);
      card.style.display = match ? "" : "none";
      if (match) visible++;
    });
    noResults.style.display = visible === 0 ? "block" : "none";
  });

  /* ──────────────────────────────────────────────────────────
     HELPER: create a labelled input inside the modal
  ────────────────────────────────────────────────────────── */
  function mkInput(type, id, placeholder, extraAttrs = "") {
    return `<input type="${type}" id="${id}" class="tk-input" placeholder="${placeholder}" ${extraAttrs} autocomplete="off">`;
  }

  function mkResult(html) {
    return `<div class="tk-result">${html}</div>`;
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 1 — PASSWORD STRENGTH CHECKER
  ══════════════════════════════════════════════════════════ */
  function buildPasswordChecker(el) {
    el.innerHTML = `
      <p class="tk-tool-desc">Type a password to analyse its strength against 5 security criteria.</p>

      <div class="tk-field">
        <div style="position:relative;">
          ${mkInput("password", "tc-pwd", "Enter a password…")}
          <button class="toggle-pwd" id="tc-show-pwd" aria-label="Show password" type="button">&#128065;</button>
        </div>
      </div>

      <div class="tk-strength-bar">
        <div class="tk-seg" id="tc-s1"></div>
        <div class="tk-seg" id="tc-s2"></div>
        <div class="tk-seg" id="tc-s3"></div>
        <div class="tk-seg" id="tc-s4"></div>
      </div>
      <div id="tc-strength-label" class="tk-strength-label">Enter a password above</div>

      <ul class="tk-checklist" id="tc-checklist">
        <li id="tc-c1" class="tc-item">&#10007; At least 12 characters</li>
        <li id="tc-c2" class="tc-item">&#10007; Uppercase letter (A–Z)</li>
        <li id="tc-c3" class="tc-item">&#10007; Lowercase letter (a–z)</li>
        <li id="tc-c4" class="tc-item">&#10007; Number (0–9)</li>
        <li id="tc-c5" class="tc-item">&#10007; Special character (!@#$%^&*)</li>
      </ul>

      <div id="tc-suggestions" class="tk-info-box" style="display:none;"></div>
    `;

    const input  = el.querySelector("#tc-pwd");
    const showBtn = el.querySelector("#tc-show-pwd");
    const segs   = [1,2,3,4].map(i => el.querySelector(`#tc-s${i}`));
    const checks = [1,2,3,4,5].map(i => el.querySelector(`#tc-c${i}`));
    const label  = el.querySelector("#tc-strength-label");
    const sug    = el.querySelector("#tc-suggestions");

    showBtn.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
    });

    input.addEventListener("input", () => {
      const v = input.value;
      const criteria = [
        v.length >= 12,
        /[A-Z]/.test(v),
        /[a-z]/.test(v),
        /[0-9]/.test(v),
        /[^A-Za-z0-9]/.test(v)
      ];
      const score = criteria.filter(Boolean).length;

      // Update checklist
      const labels = [
        "At least 12 characters",
        "Uppercase letter (A–Z)",
        "Lowercase letter (a–z)",
        "Number (0–9)",
        "Special character (!@#$%^&*)"
      ];
      criteria.forEach((met, i) => {
        checks[i].className = "tc-item " + (met ? "met" : "unmet");
        checks[i].innerHTML = (met ? "&#10003;" : "&#10007;") + " " + labels[i];
      });

      // Strength bar
      const colours = ["", "#EF4444", "#F59E0B", "#06B6D4", "#22C55E"];
      const thresholds = [0, 1, 2, 4, 5]; // score needed to light segment
      const strengthNames = ["", "Weak", "Fair", "Strong", "Very Strong"];
      segs.forEach((seg, i) => {
        seg.style.background = score > i ? colours[Math.min(score, 4)] : "";
      });

      let strengthIdx = 0;
      if (score >= 5) strengthIdx = 4;
      else if (score >= 4) strengthIdx = 3;
      else if (score >= 2) strengthIdx = 2;
      else if (score >= 1) strengthIdx = 1;

      label.textContent = v.length === 0 ? "Enter a password above" : strengthNames[strengthIdx];
      label.style.color = colours[strengthIdx] || "var(--text-muted)";

      // Suggestions
      const tips = [];
      if (!criteria[0]) tips.push("Make it at least 12 characters long.");
      if (!criteria[1]) tips.push("Add an uppercase letter.");
      if (!criteria[2]) tips.push("Add a lowercase letter.");
      if (!criteria[3]) tips.push("Add a number.");
      if (!criteria[4]) tips.push("Add a special character (!@#$%^&*).");

      if (tips.length && v.length > 0) {
        sug.style.display = "block";
        sug.innerHTML = "<strong>Suggestions:</strong><ul>" + tips.map(t => `<li>${t}</li>`).join("") + "</ul>";
      } else {
        sug.style.display = "none";
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 2 — PHISHING EMAIL DETECTOR
  ══════════════════════════════════════════════════════════ */
  function buildPhishingDetector(el) {
    el.innerHTML = `
      <p class="tk-tool-desc">Paste a suspicious email or message below. The analyser will check it for common phishing indicators.</p>
      <textarea id="ph-text" class="tk-textarea" placeholder="Paste the email or message text here…" rows="6"></textarea>
      <button class="btn btn-primary" id="ph-analyse" style="width:100%;margin-top:1rem;">Analyse Message</button>
      <div id="ph-result" style="margin-top:1.5rem;"></div>
    `;

    const urgentWords = [
      "urgent","immediately","act now","verify now","limited time",
      "expires soon","account suspended","account blocked","click here",
      "confirm your account","verify your identity","update your payment",
      "your account will be deleted","login immediately","respond now",
      "final notice","last warning","security alert"
    ];
    const requestWords = [
      "enter your password","provide your password","confirm your password",
      "enter your credit card","provide your credit card","send us your pin",
      "share your personal","verify your details","update your bank",
      "your ssn","your social security","your date of birth"
    ];
    const linkPatterns = [
      /http:\/\//i,
      /\.(xyz|top|click|gq|tk|ml|cf|ga|pw|work|zip)\b/i,
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
      /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd/i,
      /amaz[o0]n|paypa[l1]|g[o0]{2}gle|micros[o0]ft|[a\@]pple/i
    ];
    const grammarHints = [
      "dear customer","dear account holder","dear valued user",
      "kindly do the needful","please to","we have noticed an",
      "pleas click","recieve","informaton","suspicius","activty"
    ];

    el.querySelector("#ph-analyse").addEventListener("click", () => {
      const text = el.querySelector("#ph-text").value.trim().toLowerCase();
      if (!text) { return; }

      const flags = [];
      let score = 0;

      // Urgent language
      const foundUrgent = urgentWords.filter(w => text.includes(w));
      if (foundUrgent.length > 0) {
        score += foundUrgent.length * 2;
        flags.push(`<strong>Urgent language detected:</strong> "${foundUrgent.slice(0,3).join('", "')}" — phishing emails pressure you to act fast.`);
      }

      // Password/personal info requests
      const foundReq = requestWords.filter(w => text.includes(w));
      if (foundReq.length > 0) {
        score += foundReq.length * 4;
        flags.push(`<strong>Requests personal information:</strong> Legitimate organisations never ask for passwords or card details by message.`);
      }

      // Suspicious links
      const foundLinks = linkPatterns.filter(p => p.test(text));
      if (foundLinks.length > 0) {
        score += foundLinks.length * 3;
        flags.push(`<strong>Suspicious URL patterns:</strong> HTTP links, IP addresses, URL shorteners, or lookalike domains detected.`);
      }

      // Grammar hints
      const foundGrammar = grammarHints.filter(w => text.includes(w));
      if (foundGrammar.length > 0) {
        score += foundGrammar.length * 2;
        flags.push(`<strong>Grammar/phrasing issues:</strong> Common phishing phrases detected — "${foundGrammar[0]}".`);
      }

      // Unknown sender signal (generic greeting)
      if (/dear (customer|user|account holder|member|client)/.test(text)) {
        score += 3;
        flags.push(`<strong>Generic greeting:</strong> Legitimate messages usually address you by your real name.`);
      }

      let level, colour, icon, advice;
      if (score === 0) {
        level = "Safe"; colour = "var(--success)"; icon = "&#10003;";
        advice = "No obvious phishing indicators were detected. However, always stay cautious — verify the sender's email address directly.";
      } else if (score <= 5) {
        level = "Suspicious"; colour = "var(--warning)"; icon = "&#9888;";
        advice = "Some warning signs were found. Treat this message with caution. Do not click any links or provide personal information.";
      } else {
        level = "High Risk"; colour = "var(--danger)"; icon = "&#10007;";
        advice = "Multiple phishing indicators detected. This message is very likely a phishing attempt. Delete it immediately and do not interact with any links or attachments.";
      }

      const flagHTML = flags.length
        ? `<ul class="ph-flags">${flags.map(f => `<li>${f}</li>`).join("")}</ul>`
        : `<p>No specific indicators found.</p>`;

      el.querySelector("#ph-result").innerHTML = `
        <div class="tk-verdict" style="border-color:${colour};">
          <div class="tk-verdict-icon" style="color:${colour};">${icon}</div>
          <div class="tk-verdict-level" style="color:${colour};">${level}</div>
          <p>${advice}</p>
        </div>
        ${flags.length ? `<div class="tk-info-box"><strong>What was detected:</strong>${flagHTML}</div>` : ""}
      `;
    });
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 3 — MALWARE RISK CHECKER
  ══════════════════════════════════════════════════════════ */
  function buildMalwareRisk(el) {
    const behaviors = [
      { label: "I download software from unknown or unofficial websites.", risk: 3 },
      { label: "I click on pop-up ads or 'You have a virus!' warnings.", risk: 3 },
      { label: "I open email attachments without verifying the sender.", risk: 3 },
      { label: "I plug in USB drives I find in public places.", risk: 3 },
      { label: "I use pirated/cracked software or games.", risk: 3 },
      { label: "I skip software and OS update notifications.", risk: 2 },
      { label: "I use my device without any antivirus software.", risk: 2 },
      { label: "I click links in emails without checking where they go.", risk: 2 },
      { label: "I visit websites that seem unusual or unofficial.", risk: 1 },
      { label: "I share my device with people I don't fully trust.", risk: 1 },
    ];

    el.innerHTML = `
      <p class="tk-tool-desc">Select every behaviour that applies to you. Your risk score will update automatically.</p>
      <form id="mr-form">
        ${behaviors.map((b, i) => `
          <label class="tk-checkbox-label" for="mr-${i}">
            <input type="checkbox" id="mr-${i}" class="mr-check" data-risk="${b.risk}">
            <span>${b.label}</span>
          </label>
        `).join("")}
      </form>
      <div id="mr-result" class="tk-result" style="margin-top:1.5rem;display:none;"></div>
      <button class="btn btn-primary" id="mr-calc" style="width:100%;margin-top:1rem;">Check My Risk</button>
    `;

    el.querySelector("#mr-calc").addEventListener("click", () => {
      const checks = el.querySelectorAll(".mr-check:checked");
      let total = 0;
      checks.forEach(c => total += parseInt(c.dataset.risk, 10));

      let level, colour, recs;
      if (total <= 3) {
        level = "Low Risk"; colour = "var(--success)";
        recs = [
          "Keep updating your OS and applications regularly.",
          "Continue using trusted sources for software downloads.",
          "Consider running a regular antivirus scan as a precaution."
        ];
      } else if (total <= 8) {
        level = "Medium Risk"; colour = "var(--warning)";
        recs = [
          "Install reputable antivirus/anti-malware software immediately.",
          "Stop using unofficial download sites and cracked software.",
          "Be sceptical of pop-up warnings and unsolicited email attachments.",
          "Enable automatic OS updates."
        ];
      } else {
        level = "High Risk"; colour = "var(--danger)";
        recs = [
          "Run a full system antivirus scan right now.",
          "Stop downloading from unofficial sources — this is the #1 malware vector.",
          "Never plug in found USB drives. They are a common attack method.",
          "Update your OS and all applications immediately.",
          "Consider a fresh OS install if you suspect active infection.",
          "Change all important passwords from a clean device."
        ];
      }

      const resEl = el.querySelector("#mr-result");
      resEl.style.display = "block";
      resEl.innerHTML = `
        <div class="tk-verdict" style="border-color:${colour};">
          <div class="tk-verdict-level" style="color:${colour};">${level}</div>
          <p>Based on your selected behaviours, your estimated malware risk is <strong style="color:${colour};">${level}</strong>.</p>
        </div>
        <div class="tk-info-box">
          <strong>Recommendations:</strong>
          <ul>${recs.map(r => `<li>${r}</li>`).join("")}</ul>
        </div>
      `;
      resEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 4 — INTERNET SAFETY SCORE
  ══════════════════════════════════════════════════════════ */
  function buildSafetyScore(el) {
    const questions = [
      {
        q: "Do you use Two-Factor Authentication (2FA) on your accounts?",
        rec: "Enable 2FA on email, social media, and banking accounts. Even if your password is stolen, 2FA blocks attackers."
      },
      {
        q: "Do you keep your software, apps, and operating system updated?",
        rec: "Updates patch security vulnerabilities. Enable automatic updates so you never miss a critical fix."
      },
      {
        q: "Do you use unique passwords for every important account?",
        rec: "Use a password manager to generate and store unique passwords. Reusing passwords is the #1 cause of account takeovers."
      },
      {
        q: "Do you avoid performing sensitive activities (banking, shopping) on public Wi-Fi?",
        rec: "Use mobile data or a VPN for sensitive activities on the go. Public Wi-Fi can be monitored by attackers."
      },
      {
        q: "Do you verify website URLs before entering personal or payment information?",
        rec: "Always check for HTTPS and confirm the domain is correct before entering any sensitive data."
      }
    ];

    el.innerHTML = `
      <p class="tk-tool-desc">Answer 5 questions about your online habits honestly to receive your personalised Cyber Safety Score.</p>
      <form id="ss-form">
        ${questions.map((item, i) => `
          <div class="ss-question">
            <p class="ss-q-text"><strong>Q${i+1}.</strong> ${item.q}</p>
            <div class="ss-radios">
              <label class="ss-radio"><input type="radio" name="ss-${i}" value="yes"> Yes, always</label>
              <label class="ss-radio"><input type="radio" name="ss-${i}" value="sometimes"> Sometimes</label>
              <label class="ss-radio"><input type="radio" name="ss-${i}" value="no"> No / Never</label>
            </div>
          </div>
        `).join("")}
      </form>
      <button class="btn btn-primary" id="ss-calc" style="width:100%;margin-top:1rem;">Calculate My Score</button>
      <div id="ss-result" style="margin-top:1.5rem;"></div>
    `;

    el.querySelector("#ss-calc").addEventListener("click", () => {
      let score = 0;
      const improvements = [];
      questions.forEach((item, i) => {
        const val = (el.querySelector(`input[name="ss-${i}"]:checked`) || {}).value;
        if (val === "yes") score += 20;
        else if (val === "sometimes") score += 10;
        else improvements.push({ q: item.q, rec: item.rec });
      });

      let label, colour;
      if (score >= 90) { label = "Excellent"; colour = "var(--success)"; }
      else if (score >= 70) { label = "Good"; colour = "var(--accent)"; }
      else if (score >= 50) { label = "Fair"; colour = "var(--warning)"; }
      else { label = "Needs Improvement"; colour = "var(--danger)"; }

      const improvHTML = improvements.length
        ? `<div class="tk-info-box" style="margin-top:1rem;"><strong>How to improve:</strong><ul>${improvements.map(it => `<li><em>${it.q}</em><br>${it.rec}</li>`).join("")}</ul></div>`
        : `<div class="tk-info-box" style="margin-top:1rem;">Outstanding! You follow excellent cybersecurity practices. Keep it up!</div>`;

      el.querySelector("#ss-result").innerHTML = `
        <div class="ss-score-display">
          <div class="ss-score-circle" style="background:conic-gradient(${colour} ${score}%, #E2E8F0 ${score}%);">
            <div class="ss-score-inner">${score}<span>/100</span></div>
          </div>
          <div class="tk-verdict-level" style="color:${colour};margin-top:0.75rem;">${label}</div>
        </div>
        ${improvHTML}
      `;
    });
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 5 — PASSWORD GENERATOR
  ══════════════════════════════════════════════════════════ */
  function buildPasswordGenerator(el) {
    el.innerHTML = `
      <p class="tk-tool-desc">Configure your requirements and generate a cryptographically random password instantly.</p>

      <div class="pg-options">
        <div class="pg-row">
          <label for="pg-length">Length: <strong id="pg-length-val">16</strong></label>
          <input type="range" id="pg-length" min="8" max="64" value="16" class="tk-slider">
        </div>
        <div class="pg-checkboxes">
          <label class="tk-checkbox-label"><input type="checkbox" id="pg-upper" checked> Uppercase (A–Z)</label>
          <label class="tk-checkbox-label"><input type="checkbox" id="pg-lower" checked> Lowercase (a–z)</label>
          <label class="tk-checkbox-label"><input type="checkbox" id="pg-nums"  checked> Numbers (0–9)</label>
          <label class="tk-checkbox-label"><input type="checkbox" id="pg-syms"  checked> Symbols (!@#$%^&*)</label>
        </div>
      </div>

      <button class="btn btn-primary" id="pg-generate" style="width:100%;margin-bottom:1rem;">Generate Password</button>

      <div id="pg-output-wrap" style="display:none;">
        <div class="pg-output-row">
          <code id="pg-output" class="pg-output"></code>
          <button class="btn btn-outline" id="pg-copy" aria-label="Copy password">Copy</button>
        </div>
        <div id="pg-copy-msg" class="pg-copy-msg" style="display:none;">Copied to clipboard!</div>
      </div>
    `;

    const lengthInput = el.querySelector("#pg-length");
    const lengthVal   = el.querySelector("#pg-length-val");
    lengthInput.addEventListener("input", () => { lengthVal.textContent = lengthInput.value; });

    el.querySelector("#pg-generate").addEventListener("click", () => {
      const len     = parseInt(lengthInput.value, 10);
      const useUp   = el.querySelector("#pg-upper").checked;
      const useLo   = el.querySelector("#pg-lower").checked;
      const useNum  = el.querySelector("#pg-nums").checked;
      const useSym  = el.querySelector("#pg-syms").checked;

      let chars = "";
      let guarantee = [];
      if (useUp)  { chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; guarantee.push(randomFrom("ABCDEFGHIJKLMNOPQRSTUVWXYZ")); }
      if (useLo)  { chars += "abcdefghijklmnopqrstuvwxyz"; guarantee.push(randomFrom("abcdefghijklmnopqrstuvwxyz")); }
      if (useNum) { chars += "0123456789";                  guarantee.push(randomFrom("0123456789")); }
      if (useSym) { chars += "!@#$%^&*()-_=+[]{}|;:,.<>?"; guarantee.push(randomFrom("!@#$%^&*()-_=+[]{}|;:,.<>?")); }

      if (!chars) { el.querySelector("#pg-output").textContent = "Select at least one character type."; el.querySelector("#pg-output-wrap").style.display = "block"; return; }

      // Fill remaining length with random chars from combined set
      let pwd = [...guarantee];
      for (let i = pwd.length; i < len; i++) pwd.push(randomFrom(chars));
      // Shuffle
      pwd = shuffleArr(pwd);

      el.querySelector("#pg-output").textContent = pwd.join("");
      el.querySelector("#pg-output-wrap").style.display = "block";
      el.querySelector("#pg-copy-msg").style.display = "none";
    });

    el.querySelector("#pg-copy").addEventListener("click", () => {
      const pwd = el.querySelector("#pg-output").textContent;
      if (!pwd || pwd.includes("Select at least")) return;
      navigator.clipboard.writeText(pwd).then(() => {
        const msg = el.querySelector("#pg-copy-msg");
        msg.style.display = "block";
        setTimeout(() => { msg.style.display = "none"; }, 2000);
      });
    });

    function randomFrom(str) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return str[arr[0] % str.length];
    }
    function shuffleArr(a) {
      const arr = [...a];
      for (let i = arr.length - 1; i > 0; i--) {
        const vals = new Uint32Array(1);
        crypto.getRandomValues(vals);
        const j = vals[0] % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 6 — URL SAFETY CHECKER
  ══════════════════════════════════════════════════════════ */
  function buildUrlChecker(el) {
    el.innerHTML = `
      <p class="tk-tool-desc">Enter any URL to check for common warning signs. This is an educational analysis — for real checks use Google Safe Browsing.</p>
      ${mkInput("text", "url-input", "https://example.com", 'style="width:100%;"')}
      <button class="btn btn-primary" id="url-check" style="width:100%;margin-top:1rem;">Check URL</button>
      <div id="url-result" style="margin-top:1.5rem;"></div>
    `;

    el.querySelector("#url-check").addEventListener("click", () => {
      const raw = el.querySelector("#url-input").value.trim();
      if (!raw) return;

      const flags = [];
      let risk = 0;

      // HTTPS check
      if (!raw.startsWith("https://")) {
        flags.push({ icon: "&#10007;", text: "Does not use HTTPS — connection is not encrypted.", colour: "var(--danger)" });
        risk += 3;
      } else {
        flags.push({ icon: "&#10003;", text: "Uses HTTPS — connection is encrypted.", colour: "var(--success)" });
      }

      // IP address instead of domain
      if (/^https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(raw)) {
        flags.push({ icon: "&#10007;", text: "Uses a raw IP address instead of a domain name — highly suspicious.", colour: "var(--danger)" });
        risk += 5;
      }

      // URL shortener
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd|rb\.gy|short\.io/i.test(raw)) {
        flags.push({ icon: "&#9888;", text: "URL shortener detected — the real destination is hidden.", colour: "var(--warning)" });
        risk += 3;
      }

      // Suspicious TLD
      if (/\.(xyz|top|click|gq|tk|ml|cf|ga|pw|work|zip|monster|icu)\b/i.test(raw)) {
        flags.push({ icon: "&#9888;", text: "Suspicious top-level domain (TLD) — commonly used in phishing sites.", colour: "var(--warning)" });
        risk += 3;
      }

      // Excessive subdomains
      let host = raw;
      try { host = new URL(raw).hostname; } catch(e) { host = raw; }
      const parts = host.split(".");
      if (parts.length > 4) {
        flags.push({ icon: "&#9888;", text: `Excessive subdomains (${parts.length - 2}) — legitimate sites rarely need more than one or two.`, colour: "var(--warning)" });
        risk += 2;
      }

      // Lookalike brand domains
      if (/amaz[o0]n|paypa[l1]|g[o0]{2}gle|micros[o0]ft|[a\@]pple|faceb[o0]{2}k|inst[a4]gram/i.test(host)) {
        flags.push({ icon: "&#10007;", text: "Lookalike brand name in domain — possible typosquatting attack.", colour: "var(--danger)" });
        risk += 4;
      }

      // Very long URL
      if (raw.length > 100) {
        flags.push({ icon: "&#9888;", text: "Unusually long URL — often used to obscure the real destination.", colour: "var(--warning)" });
        risk += 1;
      }

      let level, levelColour;
      if (risk === 0) { level = "Looks Safe"; levelColour = "var(--success)"; }
      else if (risk <= 3) { level = "Suspicious"; levelColour = "var(--warning)"; }
      else { level = "High Risk"; levelColour = "var(--danger)"; }

      el.querySelector("#url-result").innerHTML = `
        <div class="tk-verdict" style="border-color:${levelColour};">
          <div class="tk-verdict-level" style="color:${levelColour};">${level}</div>
          <p>Risk score: <strong>${risk}</strong> — ${risk === 0 ? "No warning signs detected." : "See findings below."}</p>
        </div>
        <div class="url-flags">
          ${flags.map(f => `<div class="url-flag" style="color:${f.colour};">${f.icon} ${f.text}</div>`).join("")}
        </div>
        <p class="tk-disclaimer">Note: This is an educational heuristic check, not a real-time threat database. Always verify important URLs through Google Safe Browsing or VirusTotal.</p>
      `;
    });
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 7 — CYBERSECURITY TIPS GENERATOR
  ══════════════════════════════════════════════════════════ */
  function buildTipsGenerator(el) {
    const tips = [
      "Use a passphrase — four random words strung together (e.g. 'correct-horse-battery-staple') are long, memorable, and very hard to crack.",
      "Enable automatic software updates. Most cyberattacks exploit vulnerabilities that have already been patched.",
      "Never reuse the same password on more than one site. A breach on one site will compromise all others.",
      "Enable Two-Factor Authentication on your email first — it's the key to recovering every other account.",
      "Use a reputable password manager. You only need to remember one strong master password.",
      "Think before you click. Hover over links to preview the URL before visiting.",
      "Verify the sender's email address — not just the display name — before trusting an email.",
      "Legitimate banks and companies will never ask for your password by email, SMS, or phone.",
      "Back up important files to an external drive or encrypted cloud service regularly.",
      "Use HTTPS websites for any activity involving personal information or payments.",
      "Log out of accounts when you're done, especially on shared or public devices.",
      "Review app permissions periodically. Revoke access to apps you no longer use.",
      "Be suspicious of any message that creates a sense of urgency or fear.",
      "Avoid clicking ads — type URLs directly into the browser instead.",
      "Don't post sensitive information (address, phone, travel plans) on social media.",
      "Use a VPN on public Wi-Fi networks to encrypt your internet traffic.",
      "Check 'haveibeenpwned.com' to see if your email has appeared in a data breach.",
      "Use a separate email address for newsletter sign-ups to reduce your attack surface.",
      "Enable login notifications so you're alerted when your accounts are accessed from new devices.",
      "Freeze your credit if you suspect your personal information has been compromised.",
      "Don't use personal information (name, birthday, pet) in your passwords.",
      "Secure your home Wi-Fi router — change default admin passwords and use WPA3 encryption.",
      "Delete accounts you no longer use. Dormant accounts are easy targets.",
      "Use private browsing / incognito mode on shared computers — it clears session data after closing.",
      "Be wary of 'free' apps that request access to your contacts, camera, or microphone.",
      "Regularly check your account activity and bank statements for unauthorised transactions.",
      "Don't scan random QR codes — they can redirect you to phishing sites or trigger downloads.",
      "Encrypt sensitive files before storing them in the cloud.",
      "Use a hardware security key for your most important accounts — it's phishing-resistant.",
      "Social engineering is more dangerous than hacking — attackers target people, not systems.",
      "Cover your webcam when it's not in use — some malware can activate it silently.",
      "Screenshot important receipts and confirmations rather than leaving them only in email.",
      "Never store card numbers or CVVs in notes apps or plain text files.",
      "Be careful with USB-C and Thunderbolt cables — some can be used to compromise your device.",
      "Educate your family about phishing — one compromised family member can endanger everyone.",
      "Use unique, hard-to-guess answers for security questions, stored in your password manager.",
      "Check URL certificates by clicking the padlock — ensure it matches the expected organisation.",
      "Disable Bluetooth when not in use in public places to reduce your attack surface.",
      "Use a separate device or browser profile for banking and financial activities.",
      "Never send sensitive information (passwords, card details) via email or chat — use encrypted channels.",
      "Be aware of shoulder surfing — shield your screen when entering passwords in public.",
      "Ransomware authors often give you a 72-hour deadline to pressure payment — regular backups are the only real defence.",
      "Check the 'Sent' folder in your email — if you see emails you didn't send, your account may be compromised.",
      "Enable disk encryption on your laptop so data is protected if the device is stolen.",
      "Read privacy policies (at least the summary) before giving an app your data.",
      "Cybercriminals often target people during high-stress events — be extra vigilant after major life changes.",
      "A strong password is only as safe as the device you type it on — keep devices malware-free.",
      "Multi-factor authentication blocks over 99% of automated account takeover attempts.",
      "Zero-day exploits are rare — most breaches happen because of outdated software and weak passwords.",
      "The safest way to share sensitive information is end-to-end encrypted messaging (e.g. Signal).",
      "When in doubt, don't — it's always safer to verify before clicking, opening, or sharing.",
      "Cyber hygiene is a daily habit, not a one-time fix. Small consistent actions keep you safe."
    ];

    let lastIdx = -1;
    function showTip() {
      let idx;
      do { idx = Math.floor(Math.random() * tips.length); } while (idx === lastIdx);
      lastIdx = idx;
      el.querySelector("#tip-text").textContent = tips[idx];
      el.querySelector("#tip-counter").textContent = `Tip ${idx + 1} of ${tips.length}`;
    }

    el.innerHTML = `
      <p class="tk-tool-desc">A randomly selected expert tip from our library of ${tips.length} cybersecurity best practices. Click for a new one!</p>
      <div class="tip-card">
        <div class="tip-icon">&#128161;</div>
        <p id="tip-text" class="tip-text"></p>
        <small id="tip-counter" class="tip-counter"></small>
      </div>
      <button class="btn btn-primary" id="new-tip" style="width:100%;margin-top:1.5rem;">New Tip</button>
    `;

    showTip();
    el.querySelector("#new-tip").addEventListener("click", showTip);
  }

  /* ══════════════════════════════════════════════════════════
     TOOL 8 — DATA BREACH AWARENESS CHECKER
  ══════════════════════════════════════════════════════════ */
  function buildBreachChecker(el) {
    // Simulated breach data — clearly marked as educational
    const simulatedBreaches = [
      { name: "SocialShare (2023)", records: "4.1M", type: "Email, Username, Password hash" },
      { name: "ShopNow (2022)",     records: "2.8M", type: "Email, Name, Phone number" },
      { name: "LearnFast (2021)",   records: "900K", type: "Email, Password hash, DOB" },
    ];

    el.innerHTML = `
      <div class="tk-info-box" style="margin-bottom:1.5rem;">
        <strong>&#9432; Educational Simulation</strong><br>
        This tool simulates a data breach lookup for educational purposes only. <strong>No real lookup is performed</strong> and no data is sent anywhere. For a real check, visit <a href="https://haveibeenpwned.com" target="_blank" rel="noopener" style="color:var(--accent);">haveibeenpwned.com</a>.
      </div>

      <p class="tk-tool-desc">Enter an email address to see a simulated example of what a data breach report looks like.</p>
      ${mkInput("email", "breach-email", "your@email.com", 'style="width:100%;"')}
      <button class="btn btn-primary" id="breach-go" style="width:100%;margin-top:1rem;">Check Email (Simulation)</button>
      <div id="breach-result" style="margin-top:1.5rem;"></div>
    `;

    el.querySelector("#breach-go").addEventListener("click", () => {
      const email = el.querySelector("#breach-email").value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        el.querySelector("#breach-result").innerHTML = `<p style="color:var(--danger);">Please enter a valid email address.</p>`;
        return;
      }

      // Deterministically simulate based on email hash-like logic (educational demo)
      const seed = email.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const found = seed % 3 !== 0; // ~67% chance of "found" for demo purposes
      const count = found ? (seed % 3) + 1 : 0;
      const breaches = simulatedBreaches.slice(0, count);

      if (!found) {
        el.querySelector("#breach-result").innerHTML = `
          <div class="tk-verdict" style="border-color:var(--success);">
            <div class="tk-verdict-icon" style="color:var(--success);">&#10003;</div>
            <div class="tk-verdict-level" style="color:var(--success);">No Breaches Found (Simulated)</div>
            <p>Good news! This email was not found in our simulated breach database. Always check the real database at haveibeenpwned.com for a definitive answer.</p>
          </div>
          <div class="tk-info-box">
            <strong>What to do to stay safe:</strong>
            <ul>
              <li>Use a unique password for every account.</li>
              <li>Enable Two-Factor Authentication everywhere possible.</li>
              <li>Check haveibeenpwned.com regularly.</li>
              <li>Sign up for breach notifications at haveibeenpwned.com.</li>
            </ul>
          </div>
        `;
      } else {
        el.querySelector("#breach-result").innerHTML = `
          <div class="tk-verdict" style="border-color:var(--danger);">
            <div class="tk-verdict-icon" style="color:var(--danger);">&#10007;</div>
            <div class="tk-verdict-level" style="color:var(--danger);">Found in ${count} Breach${count > 1 ? "es" : ""} (Simulated)</div>
            <p>This email appears in ${count} simulated breach${count > 1 ? "es" : ""}. Check haveibeenpwned.com for a real lookup.</p>
          </div>

          <div class="breach-list">
            ${breaches.map(b => `
              <div class="breach-entry">
                <div class="breach-name">&#128204; ${b.name}</div>
                <div class="breach-details">Records affected: ${b.records} &nbsp;|&nbsp; Data exposed: ${b.type}</div>
              </div>
            `).join("")}
          </div>

          <div class="tk-info-box" style="margin-top:1rem;">
            <strong>Recommended actions:</strong>
            <ul>
              <li>Change the password for this email address immediately.</li>
              <li>Change passwords on any site where you used the same password.</li>
              <li>Enable 2FA on all accounts linked to this email.</li>
              <li>Watch for suspicious activity on linked accounts.</li>
              <li>Consider using a separate email for sensitive accounts.</li>
            </ul>
          </div>
        `;
      }
    });
  }

}); // end DOMContentLoaded
