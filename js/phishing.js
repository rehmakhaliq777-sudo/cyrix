document.addEventListener("DOMContentLoaded", () => {
  const emails = [
    {
      fromName: "Amazon Support",
      fromEmail: "support@amaz0n-security.net",
      subject: "URGENT: Your account has been suspended!",
      body: "Dear Valued Customer, your account has been suspeneded due to suspecious activty. Click the link below immediatly to verify your identity or your account will be permanantly deleted:\n\nhttp://amaz0n-verify-now.xyz/login",
      isPhishing: true,
      explanation: "Red flags — misspelled domain (amaz0n instead of amazon), urgent language, grammar mistakes ('suspeneded', 'suspecious'), suspicious external URL, pressure tactics."
    },
    {
      fromName: "Khan Academy",
      fromEmail: "no-reply@khanacademy.org",
      subject: "You've earned a new badge! Keep it up.",
      body: "Hi Alex,\n\nCongratulations! You just completed the Algebra 2 unit and earned the 'Algebra Master' badge. Keep up the great work!\n\nView your progress on your dashboard.",
      isPhishing: false,
      explanation: "Official domain (@khanacademy.org), no urgent demands, no suspicious links, no request for personal info. Legitimate notification email."
    },
    {
      fromName: "IT Department",
      fromEmail: "it-security@school-helpdesk.support",
      subject: "Password expiration notice – action required in 24 hours",
      body: "Your school password will expire in 24 hours. You must reset it immediately at the link below or you will lose access to all school systems.\n\nhttp://school-password-reset.info/renew\n\nEnter your current username and password to continue.",
      isPhishing: true,
      explanation: "Red flags — suspicious external domain (not your school's domain), asking for your current password (schools never do this), artificial urgency, threat of losing access."
    }
  ];

  const container = document.getElementById("email-container");

  emails.forEach((email, index) => {
    const card = document.createElement("div");
    card.className = "email-card fade-in-section";
    
    card.innerHTML = `
      <div class="email-header">
        <div class="email-from">${email.fromName} <span class="email-address">&lt;${email.fromEmail}&gt;</span></div>
        <div class="email-subject">${email.subject}</div>
      </div>
      <div class="email-body">${email.body}</div>
      <div class="email-actions" id="actions-${index}">
        <button class="btn btn-safe" onclick="answerEmail(${index}, false)">Safe</button>
        <button class="btn btn-phish" onclick="answerEmail(${index}, true)">Phishing</button>
      </div>
      <div class="email-result" id="result-${index}"></div>
    `;
    
    container.appendChild(card);
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('#email-container .fade-in-section').forEach(el => observer.observe(el));

  window.answerEmail = function(index, userSaidPhishing) {
    const email = emails[index];
    const actions = document.getElementById(`actions-${index}`);
    const resultBox = document.getElementById(`result-${index}`);
    
    actions.style.display = 'none';
    resultBox.classList.add('show');
    
    const isCorrect = userSaidPhishing === email.isPhishing;
    
    if (isCorrect) {
      resultBox.classList.add('correct');
      resultBox.innerHTML = `✓ Correct!<div class="email-result-explanation">${email.explanation}</div>`;
    } else {
      resultBox.classList.add('wrong');
      resultBox.innerHTML = `✗ Wrong!<div class="email-result-explanation">${email.explanation}</div>`;
    }
  };
});