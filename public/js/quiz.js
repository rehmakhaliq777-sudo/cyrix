document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     QUESTION BANK — 40 questions across 6 categories
     Each question tracks the correct answer by TEXT (not index)
     so shuffling options doesn't break scoring.
  ============================================================ */
  const questionBank = [

    // ── PASSWORD SECURITY ──────────────────────────────────────
    {
      category: "Password Security",
      text: "What is the minimum recommended length for a strong password?",
      options: ["4 characters", "6 characters", "8 characters", "12 characters"],
      correct: "12 characters",
      explanation: "Security experts now recommend at least 12 characters. Longer passwords are exponentially harder to crack using brute-force attacks."
    },
    {
      category: "Password Security",
      text: "Which of these is the SAFEST password?",
      options: ["password123", "MyName2010", "qwerty!", "X#9mK$2pL!qR"],
      correct: "X#9mK$2pL!qR",
      explanation: "X#9mK$2pL!qR is the strongest — it mixes uppercase, lowercase, numbers, and special characters with no dictionary words."
    },
    {
      category: "Password Security",
      text: "What is a password manager?",
      options: [
        "A person who manages company passwords",
        "A tool that stores and generates strong passwords securely",
        "A browser extension that blocks websites",
        "A feature that shows your saved Wi-Fi passwords"
      ],
      correct: "A tool that stores and generates strong passwords securely",
      explanation: "Password managers securely store your passwords in an encrypted vault and can generate random, strong passwords for every account."
    },
    {
      category: "Password Security",
      text: "Why should you use a different password for every account?",
      options: [
        "It is easier to remember different passwords",
        "Websites require it",
        "If one account is breached, others remain safe",
        "It makes logging in faster"
      ],
      correct: "If one account is breached, others remain safe",
      explanation: "Reusing passwords is dangerous — if attackers steal one password, they try it on every other site (called credential stuffing)."
    },
    {
      category: "Password Security",
      text: "What is a passphrase?",
      options: [
        "A password hint stored by the browser",
        "A sequence of random words used as a long, memorable password",
        "A backup code sent by email",
        "A PIN number used with a physical card"
      ],
      correct: "A sequence of random words used as a long, memorable password",
      explanation: "Passphrases like 'correct-horse-battery-staple' are long, easy to remember, and very hard to crack compared to short complex passwords."
    },
    {
      category: "Password Security",
      text: "Which of the following is an example of credential stuffing?",
      options: [
        "Guessing a password using common words",
        "Using leaked username/password pairs to try logging into other websites",
        "Installing a keylogger on someone's device",
        "Sending fake reset-password emails"
      ],
      correct: "Using leaked username/password pairs to try logging into other websites",
      explanation: "Credential stuffing automates login attempts using previously stolen credentials, exploiting password reuse across multiple sites."
    },
    {
      category: "Password Security",
      text: "When should you change your password?",
      options: [
        "Every single day",
        "Only when forced to by the website",
        "When you suspect it has been compromised or leaked",
        "Never — frequent changes weaken security"
      ],
      correct: "When you suspect it has been compromised or leaked",
      explanation: "Modern guidance says change passwords when compromised or after a data breach. Forced regular changes often lead to weaker passwords."
    },
    {
      category: "Password Security",
      text: "Which character type adds the MOST complexity to a password?",
      options: [
        "Extra numbers",
        "Capital letters only",
        "Special characters like !@#$%",
        "Longer lowercase words"
      ],
      correct: "Special characters like !@#$%",
      explanation: "Special characters greatly expand the possible character set attackers must search through, making brute-force attacks much harder."
    },

    // ── PHISHING ───────────────────────────────────────────────
    {
      category: "Phishing",
      text: "Which of the following is a sign of a phishing email?",
      options: [
        "Sent from an official company domain",
        "Contains urgent language and threats",
        "Addressed to you by your real name",
        "Has a visible and working unsubscribe link"
      ],
      correct: "Contains urgent language and threats",
      explanation: "Phishing emails use urgency and fear to pressure you into acting quickly without thinking — 'Your account will be deleted in 24 hours!'"
    },
    {
      category: "Phishing",
      text: "What is spear phishing?",
      options: [
        "A phishing attack targeting a large random group",
        "A highly targeted phishing attack aimed at a specific person or organisation",
        "Phishing carried out using USB drives",
        "An attack that targets only government websites"
      ],
      correct: "A highly targeted phishing attack aimed at a specific person or organisation",
      explanation: "Spear phishing uses personal information (name, employer, colleagues) to craft convincing messages, making them harder to detect than generic phishing."
    },
    {
      category: "Phishing",
      text: "What is smishing?",
      options: [
        "Phishing carried out via social media posts",
        "Phishing attacks delivered through SMS text messages",
        "Phishing using fake Wi-Fi hotspots",
        "Sending malware via email attachments"
      ],
      correct: "Phishing attacks delivered through SMS text messages",
      explanation: "Smishing (SMS + phishing) sends fake texts pretending to be banks, delivery services, or government agencies to steal your information."
    },
    {
      category: "Phishing",
      text: "What is vishing?",
      options: [
        "Video-based phishing on streaming platforms",
        "Voice phishing conducted over phone calls",
        "A type of malware spread through voicemail",
        "Phishing using virtual reality applications"
      ],
      correct: "Voice phishing conducted over phone calls",
      explanation: "Vishing attackers call victims pretending to be bank employees, tech support, or government officials to extract personal information over the phone."
    },
    {
      category: "Phishing",
      text: "You receive an email from 'PayPaI.com' asking you to verify your account. What should you do?",
      options: [
        "Click the link and enter your details",
        "Forward it to friends to warn them",
        "Reply asking if it is legitimate",
        "Do not click — go directly to paypal.com in your browser"
      ],
      correct: "Do not click — go directly to paypal.com in your browser",
      explanation: "The domain 'PayPaI.com' uses a capital letter I instead of lowercase l — a classic typosquatting trick. Always type official URLs directly into your browser."
    },
    {
      category: "Phishing",
      text: "A phishing email asks for your password. What should you do?",
      options: [
        "Reply with your password if the email looks official",
        "Delete it and report it as phishing",
        "Click the link to see if it is real",
        "Provide your email but not your password"
      ],
      correct: "Delete it and report it as phishing",
      explanation: "Legitimate organisations never ask for your password by email. Always report suspicious emails to your email provider and delete them."
    },
    {
      category: "Phishing",
      text: "Which feature in email clients helps identify phishing messages?",
      options: [
        "The unsubscribe button",
        "Spam/junk filters and sender verification (DMARC)",
        "Read receipts",
        "The CC (carbon copy) field"
      ],
      correct: "Spam/junk filters and sender verification (DMARC)",
      explanation: "Email providers use DMARC, SPF, and DKIM protocols to authenticate senders. Spam filters flag suspicious messages before they reach your inbox."
    },

    // ── MALWARE ────────────────────────────────────────────────
    {
      category: "Malware",
      text: "What does malware stand for?",
      options: ["Malicious Software", "Management Software", "Multiple Application Ware", "Managed Layer Ware"],
      correct: "Malicious Software",
      explanation: "Malware is any software intentionally designed to cause damage or unauthorised access to a computer system or network."
    },
    {
      category: "Malware",
      text: "Which type of malware encrypts your files and demands payment to restore them?",
      options: ["Virus", "Worm", "Spyware", "Ransomware"],
      correct: "Ransomware",
      explanation: "Ransomware locks or encrypts your data and demands a ransom (usually cryptocurrency) in exchange for the decryption key."
    },
    {
      category: "Malware",
      text: "Which of these is NOT a type of malware?",
      options: ["Trojan", "Spyware", "Firewall", "Ransomware"],
      correct: "Firewall",
      explanation: "A firewall is a security tool that monitors and controls network traffic — it protects against malware rather than being one."
    },
    {
      category: "Malware",
      text: "How does a computer worm spread?",
      options: [
        "By attaching itself to email attachments only",
        "By waiting for the user to download it manually",
        "Across networks automatically without needing a host program",
        "Only through USB drives"
      ],
      correct: "Across networks automatically without needing a host program",
      explanation: "Unlike viruses, worms self-replicate and spread across networks independently, often exploiting security vulnerabilities without user interaction."
    },
    {
      category: "Malware",
      text: "What is adware?",
      options: [
        "Malware that encrypts your files",
        "Software that monitors your keystrokes",
        "Software that displays unwanted advertisements, often bundled with free apps",
        "A type of firewall for blocking ads"
      ],
      correct: "Software that displays unwanted advertisements, often bundled with free apps",
      explanation: "Adware generates revenue for attackers by displaying ads. It can slow your device and sometimes track your browsing behaviour."
    },
    {
      category: "Malware",
      text: "A Trojan horse malware is dangerous because:",
      options: [
        "It spreads automatically across all networks",
        "It disguises itself as legitimate software to trick users into installing it",
        "It is impossible to detect with antivirus tools",
        "It only targets government computers"
      ],
      correct: "It disguises itself as legitimate software to trick users into installing it",
      explanation: "Like the mythical Trojan Horse, this malware appears harmless or useful but secretly gives attackers control over your system."
    },
    {
      category: "Malware",
      text: "What is the BEST way to protect yourself against malware?",
      options: [
        "Only use the internet at night",
        "Keep your operating system and apps updated and use reputable antivirus software",
        "Never connect to the internet",
        "Change your passwords every day"
      ],
      correct: "Keep your operating system and apps updated and use reputable antivirus software",
      explanation: "Updates patch known vulnerabilities that malware exploits. Antivirus software detects and removes threats before they can cause damage."
    },

    // ── SAFE INTERNET PRACTICES ────────────────────────────────
    {
      category: "Safe Internet",
      text: "What does a padlock icon in the browser address bar mean?",
      options: [
        "The website is completely safe to use",
        "The connection between your browser and the site is encrypted (HTTPS)",
        "The website has no viruses or malware",
        "You are logged into the website"
      ],
      correct: "The connection between your browser and the site is encrypted (HTTPS)",
      explanation: "The padlock means the connection uses HTTPS encryption, protecting data in transit. It does NOT guarantee the site itself is trustworthy."
    },
    {
      category: "Safe Internet",
      text: "Why should you be careful when using public Wi-Fi?",
      options: [
        "It uses more battery than mobile data",
        "Public Wi-Fi is always slower than home Wi-Fi",
        "Attackers on the same network can potentially intercept your data",
        "Public Wi-Fi disconnects frequently"
      ],
      correct: "Attackers on the same network can potentially intercept your data",
      explanation: "Public Wi-Fi networks are often unencrypted. Attackers can use 'man-in-the-middle' attacks to intercept your data, especially on HTTP sites."
    },
    {
      category: "Safe Internet",
      text: "What is a VPN and how does it help?",
      options: [
        "A type of antivirus program that scans downloads",
        "A tool that encrypts your internet traffic and hides your IP address",
        "A browser extension that blocks pop-up ads",
        "A service that speeds up your internet connection"
      ],
      correct: "A tool that encrypts your internet traffic and hides your IP address",
      explanation: "A VPN (Virtual Private Network) creates an encrypted tunnel for your internet traffic, protecting it from eavesdroppers — especially useful on public Wi-Fi."
    },
    {
      category: "Safe Internet",
      text: "What should you look for before entering payment details on a shopping site?",
      options: [
        "A .com domain name and colourful design",
        "A website that loads quickly",
        "HTTPS in the URL and a padlock icon",
        "More than 1000 products listed"
      ],
      correct: "HTTPS in the URL and a padlock icon",
      explanation: "HTTPS ensures your payment details are encrypted during transmission. Never enter card details on plain HTTP sites."
    },
    {
      category: "Safe Internet",
      text: "What is the safest way to handle a suspicious link you received?",
      options: [
        "Click it quickly and close the tab immediately",
        "Copy and paste it into Google to see what it is",
        "Do not click it — delete the message or verify with the sender directly",
        "Open it in a private/incognito browser window"
      ],
      correct: "Do not click it — delete the message or verify with the sender directly",
      explanation: "Even in private/incognito mode, clicking malicious links can download malware or capture credentials. Always verify through a separate, trusted channel."
    },
    {
      category: "Safe Internet",
      text: "Which of the following is considered a safe online habit?",
      options: [
        "Clicking 'Allow All' on cookie consent banners without reading them",
        "Using the same email and password for all social media accounts",
        "Reviewing app permissions before installing and removing unused apps",
        "Keeping all apps open and running in the background"
      ],
      correct: "Reviewing app permissions before installing and removing unused apps",
      explanation: "Apps can request access to your camera, microphone, contacts, and location. Only grant permissions that are genuinely needed for the app's function."
    },

    // ── SOCIAL ENGINEERING ─────────────────────────────────────
    {
      category: "Social Engineering",
      text: "What is social engineering in cybersecurity?",
      options: [
        "Engineering software for social media platforms",
        "Building secure physical access systems",
        "Manipulating or tricking people into revealing confidential information",
        "Designing user-friendly security interfaces"
      ],
      correct: "Manipulating or tricking people into revealing confidential information",
      explanation: "Social engineering exploits human psychology rather than technical vulnerabilities — attackers manipulate trust, fear, or helpfulness to extract information."
    },
    {
      category: "Social Engineering",
      text: "What is pretexting?",
      options: [
        "Sending a text message before making a phone call",
        "Creating a fabricated scenario (pretext) to trick someone into sharing information",
        "A type of phishing that targets older people",
        "Encrypting messages before sending them"
      ],
      correct: "Creating a fabricated scenario (pretext) to trick someone into sharing information",
      explanation: "An attacker might pretend to be an IT technician, bank employee, or government official to create a believable reason to request sensitive data."
    },
    {
      category: "Social Engineering",
      text: "What is 'baiting' in a social engineering context?",
      options: [
        "Offering free gifts online to gather personal information",
        "Leaving infected USB drives in public places hoping someone will plug them in",
        "Sending fake job offers by email",
        "Threatening victims to extract information"
      ],
      correct: "Leaving infected USB drives in public places hoping someone will plug them in",
      explanation: "Baiting exploits curiosity. An infected USB labelled 'Payroll 2026' left in a car park is likely to be plugged into a work computer by a curious employee."
    },
    {
      category: "Social Engineering",
      text: "What is tailgating (piggybacking) in physical security?",
      options: [
        "Following someone's social media account without them knowing",
        "Hacking into a system by following network traffic",
        "Physically following an authorised person through a secure door without credentials",
        "Intercepting someone's internet traffic on public Wi-Fi"
      ],
      correct: "Physically following an authorised person through a secure door without credentials",
      explanation: "Tailgating bypasses physical security by exploiting politeness — people often hold doors open for others without checking their credentials."
    },
    {
      category: "Social Engineering",
      text: "How can you best protect yourself against social engineering attacks?",
      options: [
        "Install the latest antivirus and never use email",
        "Always verify the identity of anyone requesting sensitive information, even if they seem official",
        "Trust anyone who knows your name and workplace",
        "Only use a company-issued phone for calls"
      ],
      correct: "Always verify the identity of anyone requesting sensitive information, even if they seem official",
      explanation: "Attackers research their targets. Knowing your name, company, or colleague's name doesn't make someone trustworthy. Always verify through official channels."
    },
    {
      category: "Social Engineering",
      text: "A stranger approaches you and says they are from IT support and need your password to fix an urgent problem. What should you do?",
      options: [
        "Give them the password since they are from IT",
        "Give a fake password to test them",
        "Refuse — legitimate IT staff never need your password",
        "Write it on paper so they cannot see you type it"
      ],
      correct: "Refuse — legitimate IT staff never need your password",
      explanation: "IT professionals access systems using administrative tools — they never need your personal password. This is a classic social engineering tactic."
    },

    // ── TWO-FACTOR AUTHENTICATION ──────────────────────────────
    {
      category: "Two-Factor Authentication",
      text: "What is two-factor authentication (2FA)?",
      options: [
        "Using two different passwords for the same account",
        "A backup email address linked to your account",
        "A second verification step required after entering your password",
        "Changing your password twice a year"
      ],
      correct: "A second verification step required after entering your password",
      explanation: "2FA adds a second layer of security. Even if an attacker steals your password, they still cannot access your account without the second factor."
    },
    {
      category: "Two-Factor Authentication",
      text: "Which of the following is an example of a 2FA second factor?",
      options: [
        "Your username",
        "A one-time code sent to your phone or generated by an authenticator app",
        "A security question about your pet's name",
        "A longer version of your password"
      ],
      correct: "A one-time code sent to your phone or generated by an authenticator app",
      explanation: "2FA second factors include SMS codes, authenticator app codes (TOTP), hardware keys, and biometrics — something you have or something you are."
    },
    {
      category: "Two-Factor Authentication",
      text: "Why is 2FA important even if you have a strong password?",
      options: [
        "Strong passwords expire quickly and 2FA extends them",
        "2FA replaces the need for a strong password",
        "If your password is stolen in a data breach, 2FA prevents attackers from logging in",
        "2FA makes logging in faster"
      ],
      correct: "If your password is stolen in a data breach, 2FA prevents attackers from logging in",
      explanation: "Data breaches expose millions of passwords. 2FA means stolen credentials alone are useless — attackers also need physical access to your second factor."
    },
    {
      category: "Two-Factor Authentication",
      text: "Which 2FA method is generally considered the MOST secure?",
      options: [
        "SMS text message codes",
        "Security questions",
        "Backup email codes",
        "A hardware security key (e.g. YubiKey)"
      ],
      correct: "A hardware security key (e.g. YubiKey)",
      explanation: "Hardware keys are phishing-resistant — they only respond to the legitimate website's domain. SMS codes can be intercepted through SIM-swapping attacks."
    },
    {
      category: "Two-Factor Authentication",
      text: "You receive an unexpected 2FA code on your phone that you did not request. What does this mean?",
      options: [
        "Your phone has a virus sending random notifications",
        "Someone is trying to log into your account using your password",
        "Your 2FA app needs updating",
        "Your account has been permanently locked"
      ],
      correct: "Someone is trying to log into your account using your password",
      explanation: "An unexpected 2FA code means someone already has your password and is attempting to log in. Change your password immediately and check for suspicious activity."
    },
    {
      category: "Two-Factor Authentication",
      text: "What is Multi-Factor Authentication (MFA)?",
      options: [
        "Authentication that requires answering multiple security questions",
        "A system requiring two or more independent verification factors to grant access",
        "Logging in from multiple devices at the same time",
        "A type of password that contains multiple words"
      ],
      correct: "A system requiring two or more independent verification factors to grant access",
      explanation: "MFA combines something you know (password), something you have (phone/key), and/or something you are (fingerprint/face). More factors means stronger security."
    }
  ];

  /* ============================================================
     QUIZ STATE
  ============================================================ */
  let activeQuestions = [];     // 10 randomly selected & shuffled questions for this attempt
  let previousAttempt = [];     // question texts from the last attempt (to reduce repeats)
  let userAnswers = [];         // what the user selected for each question (text value)
  let currentQuestion = 0;
  let selectedAnswer = null;    // text of selected answer

  /* ============================================================
     DOM REFERENCES
  ============================================================ */
  const quizContainer   = document.getElementById("quiz-container");
  const resultsContainer = document.getElementById("quiz-results");
  const questionCounter  = document.getElementById("question-counter");
  const questionText     = document.getElementById("question-text");
  const optionsGrid      = document.getElementById("options-grid");
  const btnNext          = document.getElementById("btn-next");
  const quizBar          = document.getElementById("quiz-bar");

  /* ============================================================
     HELPERS
  ============================================================ */

  // Fisher-Yates shuffle — returns a new shuffled array
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Pick 10 unique questions, avoiding repeats from previous attempt where possible
  function pickQuestions() {
    const pool = shuffle(questionBank);

    // Prefer questions NOT in the previous attempt
    const fresh = pool.filter(q => !previousAttempt.includes(q.text));
    const repeated = pool.filter(q => previousAttempt.includes(q.text));

    const selected = [];
    for (const q of [...fresh, ...repeated]) {
      if (selected.length === 10) break;
      selected.push(q);
    }

    // Shuffle the options for each question (keep correct tracked by text)
    return selected.map(q => ({
      ...q,
      options: shuffle(q.options)
    }));
  }

  /* ============================================================
     RENDER QUESTION
  ============================================================ */
  function renderQuestion(index) {
    const q = activeQuestions[index];

    // Progress bar
    const pct = (index / activeQuestions.length) * 100;
    quizBar.style.width = pct + "%";
    questionCounter.textContent = `Question ${index + 1} of ${activeQuestions.length}`;

    questionText.textContent = q.text;
    optionsGrid.innerHTML = "";
    selectedAnswer = null;
    btnNext.disabled = true;

    q.options.forEach(optText => {
      const div = document.createElement("div");
      div.className = "option-card";
      div.textContent = optText;
      div.addEventListener("click", () => selectOption(optText, div));
      optionsGrid.appendChild(div);
    });
  }

  /* ============================================================
     SELECT AN OPTION
  ============================================================ */
  function selectOption(answerText, el) {
    document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    selectedAnswer = answerText;
    btnNext.disabled = false;
  }

  /* ============================================================
     ADVANCE TO NEXT QUESTION
  ============================================================ */
  function nextQuestion() {
    if (selectedAnswer === null) return;

    // Record user's answer
    userAnswers[currentQuestion] = selectedAnswer;

    currentQuestion++;
    if (currentQuestion < activeQuestions.length) {
      renderQuestion(currentQuestion);
    } else {
      showResults();
    }
  }

  /* ============================================================
     SHOW RESULTS
  ============================================================ */
  function showResults() {
    // Calculate score
    let correct = 0;
    activeQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correct++;
    });
    const wrong = activeQuestions.length - correct;
    const percentage = Math.round((correct / activeQuestions.length) * 100);

    // Track completion in progress system
    if (window.CyberProgress) window.CyberProgress.completeQuiz(correct, activeQuestions.length, percentage);

    // Hide quiz, show results
    quizContainer.style.display = "none";
    resultsContainer.style.display = "block";

    // ── Circular progress ──
    const circleEl = document.getElementById("circle-progress");
    const circlePct = document.getElementById("circle-pct");
    // Animate the circle fill
    let current = 0;
    const step = percentage / 40;
    const interval = setInterval(() => {
      current = Math.min(current + step, percentage);
      const color = percentage >= 90 ? "#22C55E"
                  : percentage >= 70 ? "#06B6D4"
                  : percentage >= 50 ? "#F59E0B"
                  : "#EF4444";
      circleEl.style.background =
        `conic-gradient(${color} ${current}%, #E2E8F0 ${current}%)`;
      circlePct.textContent = Math.round(current) + "%";
      if (current >= percentage) clearInterval(interval);
    }, 25);

    // ── Stats ──
    document.getElementById("stat-correct").textContent = correct;
    document.getElementById("stat-wrong").textContent = wrong;
    document.getElementById("stat-pct").textContent = percentage + "%";

    // ── Performance badge ──
    const badgeEl = document.getElementById("performance-badge");
    const msgEl   = document.getElementById("performance-msg");
    badgeEl.className = "badge";

    if (percentage >= 90) {
      badgeEl.textContent = "Excellent!";
      badgeEl.classList.add("green");
      msgEl.textContent = "You have strong cybersecurity knowledge. Outstanding work!";
    } else if (percentage >= 70) {
      badgeEl.textContent = "Good Job!";
      badgeEl.classList.add("blue");
      msgEl.textContent = "You understand most cybersecurity concepts. Keep it up!";
    } else if (percentage >= 50) {
      badgeEl.textContent = "Fair";
      badgeEl.classList.add("orange");
      msgEl.textContent = "Not bad! Review the lessons and try again to improve.";
    } else {
      badgeEl.textContent = "Keep Learning!";
      badgeEl.classList.add("red");
      msgEl.textContent = "Review the cybersecurity lessons below before retaking the quiz.";
    }

    // ── Answer Review ──
    const reviewList = document.getElementById("review-list");
    reviewList.innerHTML = "";

    activeQuestions.forEach((q, i) => {
      const isCorrect = userAnswers[i] === q.correct;
      const card = document.createElement("div");
      card.className = "review-card";

      card.innerHTML = `
        <div class="review-num">Question ${i + 1} <span class="review-category">${q.category}</span></div>
        <div class="review-question">${q.text}</div>
        <div class="review-answer ${isCorrect ? "correct" : "wrong"}">
          <span class="review-answer-label">Your Answer:</span>
          <span>${userAnswers[i]}</span>
          <span class="review-icon">${isCorrect ? "&#10003;" : "&#10007;"}</span>
        </div>
        ${!isCorrect ? `
        <div class="review-answer correct">
          <span class="review-answer-label">Correct Answer:</span>
          <span>${q.correct}</span>
          <span class="review-icon">&#10003;</span>
        </div>` : ""}
        <div class="review-explanation">
          <span class="review-exp-icon">i</span>
          ${q.explanation}
        </div>
      `;

      reviewList.appendChild(card);
    });

    // Save this attempt's questions for next time
    previousAttempt = activeQuestions.map(q => q.text);

    // Scroll to top of results
    resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ============================================================
     START / RESTART QUIZ
  ============================================================ */
  function startQuiz() {
    activeQuestions = pickQuestions();
    userAnswers = [];
    currentQuestion = 0;
    selectedAnswer = null;

    quizContainer.style.display = "block";
    resultsContainer.style.display = "none";

    renderQuestion(0);
  }

  /* ============================================================
     EVENT LISTENERS
  ============================================================ */
  if (btnNext) {
    btnNext.addEventListener("click", nextQuestion);
  }

  const restartBtn = document.getElementById("btn-restart");
  if (restartBtn) {
    restartBtn.addEventListener("click", startQuiz);
  }

  /* ============================================================
     INIT
  ============================================================ */
  if (quizContainer) {
    startQuiz();
  }

});
