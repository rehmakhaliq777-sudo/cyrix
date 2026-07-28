document.addEventListener("DOMContentLoaded", () => {
  const pwdInput = document.getElementById("pwd-input");
  const toggleBtn = document.getElementById("toggle-pwd");
  
  const seg1 = document.getElementById("seg-1");
  const seg2 = document.getElementById("seg-2");
  const seg3 = document.getElementById("seg-3");
  const seg4 = document.getElementById("seg-4");
  const strengthLabel = document.getElementById("strength-label");
  
  const chkLength = document.getElementById("check-length");
  const chkUpper = document.getElementById("check-upper");
  const chkLower = document.getElementById("check-lower");
  const chkNumber = document.getElementById("check-number");
  const chkSpecial = document.getElementById("check-special");

  if(toggleBtn && pwdInput) {
    toggleBtn.addEventListener("click", () => {
      const type = pwdInput.getAttribute("type") === "password" ? "text" : "password";
      pwdInput.setAttribute("type", type);
      toggleBtn.textContent = type === "password" ? "👁" : "⊘";
    });

    pwdInput.addEventListener("input", () => {
      const val = pwdInput.value;
      
      let score = 0;
      
      if(val.length >= 8) {
        score++;
        updateCheck(chkLength, true, "At least 8 characters");
      } else {
        updateCheck(chkLength, false, "At least 8 characters");
      }
      
      if(/[A-Z]/.test(val)) {
        score++;
        updateCheck(chkUpper, true, "Contains uppercase letter (A-Z)");
      } else {
        updateCheck(chkUpper, false, "Contains uppercase letter (A-Z)");
      }
      
      if(/[a-z]/.test(val)) {
        score++;
        updateCheck(chkLower, true, "Contains lowercase letter (a-z)");
      } else {
        updateCheck(chkLower, false, "Contains lowercase letter (a-z)");
      }
      
      if(/[0-9]/.test(val)) {
        score++;
        updateCheck(chkNumber, true, "Contains a number (0-9)");
      } else {
        updateCheck(chkNumber, false, "Contains a number (0-9)");
      }
      
      if(/[^A-Za-z0-9]/.test(val)) {
        score++;
        updateCheck(chkSpecial, true, "Contains special character (!@#$%^&*)");
      } else {
        updateCheck(chkSpecial, false, "Contains special character (!@#$%^&*)");
      }

      resetSegments();
      
      if(val.length === 0) {
        strengthLabel.textContent = "Empty";
        strengthLabel.style.color = "var(--text)";
      } else if(score <= 2) {
        seg1.style.backgroundColor = "var(--danger)";
        strengthLabel.textContent = "Weak";
        strengthLabel.style.color = "var(--danger)";
      } else if(score === 3 || score === 4) {
        seg1.style.backgroundColor = "var(--warning)";
        seg2.style.backgroundColor = "var(--warning)";
        seg3.style.backgroundColor = "var(--warning)";
        strengthLabel.textContent = "Medium";
        strengthLabel.style.color = "var(--warning)";
      } else if(score === 5) {
        seg1.style.backgroundColor = "var(--success)";
        seg2.style.backgroundColor = "var(--success)";
        seg3.style.backgroundColor = "var(--success)";
        seg4.style.backgroundColor = "var(--success)";
        strengthLabel.textContent = "Strong";
        if(val.length >= 12) strengthLabel.textContent = "Very Strong";
        strengthLabel.style.color = "var(--success)";
      }
    });
  }
  
  function updateCheck(el, isMet, text) {
    if(isMet) {
      el.className = "checklist-item met";
      el.innerHTML = "✓ " + text;
    } else {
      el.className = "checklist-item unmet";
      el.innerHTML = "✗ " + text;
    }
  }
  
  function resetSegments() {
    seg1.style.backgroundColor = "";
    seg2.style.backgroundColor = "";
    seg3.style.backgroundColor = "";
    seg4.style.backgroundColor = "";
  }
});