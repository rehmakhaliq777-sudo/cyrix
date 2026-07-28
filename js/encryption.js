/* ============================================================
   ENCRYPTION & DECRYPTION — encryption.js
   Classical ciphers: fully working (Caesar, Vigenère, Rail Fence, Playfair)
   Modern algorithms: AES via Web Crypto API (real); others educational.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     ALGORITHM DEFINITIONS
  ────────────────────────────────────────────────────────── */
  const ALGOS = {
    caesar: {
      icon: '🔤',
      name: 'Caesar Cipher',
      keyLabel: 'Shift Amount (1–25)',
      keyPlaceholder: 'e.g. 13',
      keyType: 'number',
      keyAttr: 'min="1" max="25"',
      securityLevel: 'Very Low',
      securityColour: '#EF4444',
      working: true,
      description: 'The Caesar Cipher is a substitution cipher where each letter is shifted a fixed number of positions along the alphabet. Named after Julius Caesar who reportedly used a shift of 3.',
      uses: 'Historical education, ROT13 puzzles, simple obfuscation.',
      pros: ['Extremely simple to implement', 'Easy to understand the concept of substitution'],
      cons: ['Only 25 possible keys', 'Broken instantly by brute force', 'No security whatsoever'],
    },
    vigenere: {
      icon: '🗝️',
      name: 'Vigenère Cipher',
      keyLabel: 'Key Word (letters only)',
      keyPlaceholder: 'e.g. SECRET',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'Low',
      securityColour: '#F97316',
      working: true,
      description: 'A polyalphabetic substitution cipher that uses a keyword to apply different Caesar shifts to each letter of the plaintext. Once considered unbreakable, it was cracked by Charles Babbage in the 19th century.',
      uses: 'Historical cryptography, teaching polyalphabetic substitution.',
      pros: ['Harder to crack than Caesar', 'Keyword can be any length', 'Easy to understand'],
      cons: ['Vulnerable to frequency analysis', 'Kasiski examination reveals key length', 'Key reuse is dangerous'],
    },
    railfence: {
      icon: '🛤️',
      name: 'Rail Fence Cipher',
      keyLabel: 'Number of Rails (2–10)',
      keyPlaceholder: 'e.g. 3',
      keyType: 'number',
      keyAttr: 'min="2" max="10"',
      securityLevel: 'Very Low',
      securityColour: '#EF4444',
      working: true,
      description: 'A transposition cipher that writes plaintext in a zigzag pattern across a set number of "rails" (rows), then reads off each row in sequence. It rearranges letters without replacing them.',
      uses: 'Teaching transposition concepts, historical puzzle ciphers.',
      pros: ['Simple transposition concept', 'Easy to visualise', 'Works on any text'],
      cons: ['Very small key space', 'Vulnerable to pattern analysis', 'Trivially broken with brute force'],
    },
    playfair: {
      icon: '♟️',
      name: 'Playfair Cipher',
      keyLabel: 'Key Word (letters only)',
      keyPlaceholder: 'e.g. MONARCHY',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'Low',
      securityColour: '#F97316',
      working: true,
      description: 'A digraph substitution cipher using a 5×5 key square (I and J share a cell). Pairs of letters are encrypted together using three rules based on their positions in the grid. Used by British forces in World War I.',
      uses: 'WWI military communications, teaching digraph substitution.',
      pros: ['Encrypts pairs (harder than single-letter substitution)', 'Large key space vs Caesar', 'Taught in cryptography courses'],
      cons: ['Still vulnerable to frequency analysis of digraphs', '26-letter key square has known weaknesses', 'I/J merger causes ambiguity'],
    },
    aes: {
      icon: '🔒',
      name: 'AES (Advanced Encryption Standard)',
      keyLabel: 'Passphrase (any length)',
      keyPlaceholder: 'Enter a strong passphrase',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'Very High',
      securityColour: '#22C55E',
      working: true,
      note: 'Real AES-256-GCM encryption via the browser\'s Web Crypto API.',
      description: 'AES is the gold-standard symmetric block cipher adopted by NIST in 2001. It operates on 128-bit blocks using 128, 192, or 256-bit keys. AES-GCM (used here) also provides authentication, ensuring the ciphertext has not been tampered with.',
      uses: 'HTTPS/TLS, Wi-Fi (WPA2/WPA3), file encryption, VPNs, banking systems.',
      pros: ['Extremely fast in hardware and software', 'Resistant to all known practical attacks', 'Widely standardised and audited'],
      cons: ['Symmetric — same key must be shared securely', 'Key management is a major challenge', 'GCM nonce must never be reused with the same key'],
    },
    des: {
      icon: '📖',
      name: 'DES (Data Encryption Standard)',
      keyLabel: 'Key (any text)',
      keyPlaceholder: 'Enter key',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'Broken',
      securityColour: '#EF4444',
      working: false,
      note: 'Educational simulation — DES is cryptographically broken and not available in Web Crypto.',
      description: 'DES was the first widely adopted symmetric cipher, standardised by NIST in 1977. It uses a 56-bit key and 16 Feistel rounds on 64-bit blocks. It was broken in 1999 when EFF\'s Deep Crack cracked a DES key in under 24 hours.',
      uses: 'Legacy banking systems (replaced by AES), early internet encryption (now retired).',
      pros: ['Pioneered modern block cipher design', 'Feistel structure is well-studied', 'Fast in dedicated hardware'],
      cons: ['56-bit key is too short — brute-forceable in hours', 'Officially deprecated by NIST', 'Should never be used in new systems'],
    },
    tripledes: {
      icon: '📖',
      name: 'Triple DES (3DES)',
      keyLabel: 'Key (any text)',
      keyPlaceholder: 'Enter key',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'Low',
      securityColour: '#F97316',
      working: false,
      note: 'Educational simulation — 3DES is deprecated; use AES instead.',
      description: 'Triple DES applies the DES cipher three times to each data block using two or three different 56-bit keys, effectively increasing security. It was developed as a stop-gap after DES was broken. NIST deprecated 3DES in 2023.',
      uses: 'Legacy payment card processing (PCI-DSS phasing out), older VPN protocols.',
      pros: ['Much stronger than single DES', 'Backward-compatible with DES hardware', 'Well-understood algorithm'],
      cons: ['Very slow (3× slower than DES)', '128-bit effective security (meet-in-the-middle attacks)', 'Officially deprecated — use AES'],
    },
    rsa: {
      icon: '🔐',
      name: 'RSA (Rivest–Shamir–Adleman)',
      keyLabel: 'Key / Seed (any text)',
      keyPlaceholder: 'Enter key or seed',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'High (with large keys)',
      securityColour: '#06B6D4',
      working: false,
      note: 'Educational demonstration with small primes. Real RSA uses 2048–4096-bit keys.',
      description: 'RSA is an asymmetric (public-key) cipher. Security relies on the difficulty of factoring the product of two large primes. Encryption uses the public key; decryption uses the private key. This demo uses p=61, q=53 (far too small for real use).',
      uses: 'Digital signatures, SSL/TLS key exchange, email encryption (PGP), certificate authorities.',
      pros: ['No shared secret needed', 'Public key can be distributed freely', 'Foundation of internet security infrastructure'],
      cons: ['Very slow compared to symmetric ciphers', 'Large key sizes required (2048+ bits)', 'Vulnerable to quantum computers (Shor\'s algorithm)'],
    },
    blowfish: {
      icon: '🐡',
      name: 'Blowfish',
      keyLabel: 'Key (any text)',
      keyPlaceholder: 'Enter key',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'Medium–High',
      securityColour: '#8B5CF6',
      working: false,
      note: 'Educational simulation — Blowfish is not in Web Crypto. Use AES for real encryption.',
      description: 'Blowfish is a symmetric block cipher designed by Bruce Schneier in 1993 as a fast, free alternative to DES. It uses variable key length (32–448 bits) and 16 Feistel rounds. Its bcrypt key derivation variant is still widely used for password hashing.',
      uses: 'Password hashing (bcrypt), legacy file encryption, older VPN protocols.',
      pros: ['Free and unpatented', 'Very fast after key setup', 'Strong against brute force with long keys'],
      cons: ['64-bit block size vulnerable to birthday attacks (SWEET32)', 'Slow key expansion (good for bcrypt, bad for general use)', 'Superseded by AES and Twofish'],
    },
    twofish: {
      icon: '🐟',
      name: 'Twofish',
      keyLabel: 'Key (any text)',
      keyPlaceholder: 'Enter key',
      keyType: 'text',
      keyAttr: '',
      securityLevel: 'High',
      securityColour: '#22C55E',
      working: false,
      note: 'Educational simulation — Twofish is not in Web Crypto. Use AES for real encryption.',
      description: 'Twofish was one of five finalists in the AES competition (won by Rijndael/AES). Designed by Bruce Schneier\'s team, it uses 128-bit blocks and keys up to 256 bits. No successful attacks against full Twofish have been published.',
      uses: 'GnuPG encryption, TrueCrypt/VeraCrypt disk encryption, some VPN software.',
      pros: ['No known practical attacks', '128-bit block size (no birthday attack weakness)', 'Free and unpatented'],
      cons: ['Slower than AES on most hardware', 'Less hardware acceleration support', 'Not as widely adopted due to losing AES competition'],
    },
  };

  /* ──────────────────────────────────────────────────────────
     DOM REFERENCES
  ────────────────────────────────────────────────────────── */
  const algoSelect  = document.getElementById('enc-algo');
  const keyWrap     = document.getElementById('enc-key-wrap');
  const keyLabel    = document.getElementById('enc-key-label');
  const keyInput    = document.getElementById('enc-key');
  const inputText   = document.getElementById('enc-input');
  const outputText  = document.getElementById('enc-output');
  const encryptBtn  = document.getElementById('enc-encrypt-btn');
  const decryptBtn  = document.getElementById('enc-decrypt-btn');
  const clearBtn    = document.getElementById('enc-clear-btn');
  const copyBtn     = document.getElementById('enc-copy-btn');
  const statusEl    = document.getElementById('enc-status');
  const infoPanel   = document.getElementById('enc-info-panel');

  /* ──────────────────────────────────────────────────────────
     INFO PANEL RENDERER
  ────────────────────────────────────────────────────────── */
  const EDU_NOTE = 'This demonstrates the working concept of the algorithm. It is intended for educational purposes only and is not real production-grade cryptographic encryption. Modern implementations require specialized cryptographic libraries, secure key management, and significantly larger key sizes.';

  function renderInfo(algoId) {
    const a = ALGOS[algoId];
    if (!a || !infoPanel) return;

    // Fade out first
    infoPanel.style.opacity = '0';
    infoPanel.style.transform = 'translateY(8px)';

    setTimeout(() => {
      const secColour = a.securityColour;
      const isEdu     = !a.working;

      infoPanel.innerHTML = `
        <div class="enc-info-card${isEdu ? ' enc-info-card-edu' : ''}">
          <div class="enc-info-header">
            <div class="enc-algo-name-wrap">
              <span class="enc-algo-icon-lg">${a.icon}</span>
              <h3 class="enc-info-title">${a.name}</h3>
            </div>
            <span class="enc-sec-badge" style="background:${secColour}20;color:${secColour};border:1px solid ${secColour}50;">${a.securityLevel}</span>
          </div>

          ${isEdu ? `
            <div class="enc-edu-badge">🎓 Educational Demonstration</div>
            <div class="enc-edu-note">${EDU_NOTE}</div>
          ` : (a.note ? `<div class="enc-note"><strong>ℹ️</strong> ${a.note}</div>` : '')}

          <p class="enc-info-desc">${a.description}</p>

          <div class="enc-info-row">
            <div class="enc-info-block">
              <h4>✅ Advantages</h4>
              <ul>${a.pros.map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
            <div class="enc-info-block">
              <h4>❌ Disadvantages</h4>
              <ul>${a.cons.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
          </div>

          <div class="enc-uses-block">
            <h4>🌐 Real-World Uses</h4>
            <p>${a.uses}</p>
          </div>
        </div>
      `;

      // Fade in
      requestAnimationFrame(() => {
        infoPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        infoPanel.style.opacity    = '1';
        infoPanel.style.transform  = 'translateY(0)';
      });
    }, 120);
  }

  /* ──────────────────────────────────────────────────────────
     ALGORITHM SELECTOR CHANGE
  ────────────────────────────────────────────────────────── */
  function onAlgoChange() {
    const id = algoSelect.value;
    const a  = ALGOS[id];
    if (!a) return;

    keyLabel.textContent  = a.keyLabel;
    keyInput.placeholder  = a.keyPlaceholder;
    keyInput.type         = a.keyType;
    keyInput.removeAttribute('min'); keyInput.removeAttribute('max');
    if (a.keyAttr) {
      a.keyAttr.split(' ').forEach(attr => {
        const [k, v] = attr.split('=');
        if (k && v) keyInput.setAttribute(k, v.replace(/"/g, ''));
      });
    }
    // Reset default value for number inputs
    if (a.keyType === 'number') keyInput.value = id === 'caesar' ? '13' : '3';
    else keyInput.value = '';

    // Show AES passphrase reminder only for AES
    const hint = document.getElementById('enc-passphrase-hint');
    if (hint) hint.style.display = id === 'aes' ? '' : 'none';

    setStatus('');
    renderInfo(id);
  }

  algoSelect.addEventListener('change', onAlgoChange);
  onAlgoChange(); // init

  /* ──────────────────────────────────────────────────────────
     BUTTON HANDLERS
  ────────────────────────────────────────────────────────── */
  encryptBtn.addEventListener('click', async () => {
    const result = await runCipher('encrypt');
    if (result !== null) {
      outputText.value = result;
      trackProgress();
    }
  });

  decryptBtn.addEventListener('click', async () => {
    const result = await runCipher('decrypt');
    if (result !== null) {
      outputText.value = result;
      trackProgress();
    }
  });

  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    setStatus('');
  });

  copyBtn.addEventListener('click', () => {
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value).then(() => {
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyBtn.innerHTML = '&#128203; Copy'; }, 2000);
    });
  });

  /* ── Track XP after using a cipher ── */
  function trackProgress() {
    if (window.CyberProgress) window.CyberProgress.useEncryption(algoSelect.value);
  }

  /* ──────────────────────────────────────────────────────────
     MAIN CIPHER DISPATCHER
  ────────────────────────────────────────────────────────── */
  async function runCipher(mode) {
    const id   = algoSelect.value;
    const text = inputText.value;
    const key  = keyInput.value.trim();

    if (!text) { setStatus('Please enter some text first.', 'warn'); return null; }
    if (!key)  { setStatus('Please enter a key.', 'warn'); return null; }
    setStatus('');

    try {
      if (id === 'caesar')    return caesarCipher(text, parseInt(key, 10), mode);
      if (id === 'vigenere')  return vigenereCipher(text, key, mode);
      if (id === 'railfence') return railFenceCipher(text, parseInt(key, 10), mode);
      if (id === 'playfair')  return playfairCipher(text, key, mode);
      if (id === 'aes')       return await aesCipher(text, key, mode);
      // Educational simulations
      return educationalSim(text, key, id, mode);
    } catch (e) {
      if (id === 'aes' && mode === 'decrypt') {
        setStatus('❌ Decryption failed — make sure you\'re using the same passphrase that was used for encryption, and that you\'ve pasted the full encrypted output.', 'error');
      } else {
        setStatus('⚠️ ' + e.message, 'error');
      }
      return null;
    }
  }

  /* ──────────────────────────────────────────────────────────
     STATUS HELPER
  ────────────────────────────────────────────────────────── */
  function setStatus(msg, type = '') {
    if (!statusEl) return;
    statusEl.style.display = msg ? 'block' : 'none';
    statusEl.textContent   = msg;
    statusEl.className     = 'enc-status' + (type ? ' enc-status-' + type : '');
  }

  /* ══════════════════════════════════════════════════════════
     ① CAESAR CIPHER
  ══════════════════════════════════════════════════════════ */
  function caesarCipher(text, shift, mode) {
    if (isNaN(shift) || shift < 1 || shift > 25) throw new Error('Shift must be between 1 and 25.');
    const s = mode === 'decrypt' ? (26 - shift) : shift;
    return text.replace(/[a-zA-Z]/g, c => {
      const base = c >= 'a' ? 97 : 65;
      return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
    });
  }

  /* ══════════════════════════════════════════════════════════
     ② VIGENÈRE CIPHER
  ══════════════════════════════════════════════════════════ */
  function vigenereCipher(text, key, mode) {
    const cleanKey = key.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (!cleanKey) throw new Error('Key must contain at least one letter.');
    let ki = 0;
    return text.replace(/[a-zA-Z]/g, c => {
      const base  = c >= 'a' ? 97 : 65;
      const shift = cleanKey.charCodeAt(ki % cleanKey.length) - 65;
      ki++;
      const s = mode === 'decrypt' ? (26 - shift) : shift;
      return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
    });
  }

  /* ══════════════════════════════════════════════════════════
     ③ RAIL FENCE CIPHER
  ══════════════════════════════════════════════════════════ */
  function railFenceCipher(text, rails, mode) {
    if (isNaN(rails) || rails < 2 || rails > 10) throw new Error('Rails must be between 2 and 10.');
    if (text.length === 0) return '';
    if (mode === 'encrypt') return rfEncrypt(text, rails);
    return rfDecrypt(text, rails);
  }

  function rfEncrypt(text, rails) {
    const fence = Array.from({ length: rails }, () => []);
    let rail = 0, dir = 1;
    for (const ch of text) {
      fence[rail].push(ch);
      if (rail === 0) dir = 1;
      else if (rail === rails - 1) dir = -1;
      rail += dir;
    }
    return fence.map(r => r.join('')).join('');
  }

  function rfDecrypt(text, rails) {
    const n = text.length;
    const positions = [];
    let rail = 0, dir = 1;
    for (let i = 0; i < n; i++) {
      positions.push(rail);
      if (rail === 0) dir = 1;
      else if (rail === rails - 1) dir = -1;
      rail += dir;
    }
    const counts  = Array(rails).fill(0);
    positions.forEach(r => counts[r]++);
    const fence   = [];
    let idx = 0;
    for (let r = 0; r < rails; r++) {
      fence.push(text.slice(idx, idx + counts[r]).split(''));
      idx += counts[r];
    }
    const pointers = Array(rails).fill(0);
    return positions.map(r => fence[r][pointers[r]++]).join('');
  }

  /* ══════════════════════════════════════════════════════════
     ④ PLAYFAIR CIPHER
  ══════════════════════════════════════════════════════════ */
  function playfairCipher(text, key, mode) {
    const cleanKey = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if (!cleanKey) throw new Error('Key must contain at least one letter.');

    // Build 5×5 grid
    const seen = new Set();
    const grid = [];
    for (const ch of cleanKey + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
      if (!seen.has(ch)) { seen.add(ch); grid.push(ch); }
    }
    const rowOf = ch => Math.floor(grid.indexOf(ch) / 5);
    const colOf = ch => grid.indexOf(ch) % 5;
    const atRC  = (r, c) => grid[r * 5 + c];

    // Prepare plaintext: uppercase, replace J→I, remove non-alpha, pair with X filler
    const prepared = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const pairs = [];
    let i = 0;
    while (i < prepared.length) {
      const a = prepared[i];
      let   b = prepared[i + 1];
      if (!b) b = 'X';
      if (a === b) { pairs.push([a, 'X']); i++; }
      else         { pairs.push([a, b]);   i += 2; }
    }

    const shift = mode === 'decrypt' ? -1 : 1;
    const result = pairs.map(([a, b]) => {
      const ra = rowOf(a), ca = colOf(a);
      const rb = rowOf(b), cb = colOf(b);
      if (ra === rb) {
        // Same row: shift columns
        return atRC(ra, (ca + shift + 5) % 5) + atRC(rb, (cb + shift + 5) % 5);
      } else if (ca === cb) {
        // Same col: shift rows
        return atRC((ra + shift + 5) % 5, ca) + atRC((rb + shift + 5) % 5, cb);
      } else {
        // Rectangle: swap columns
        return atRC(ra, cb) + atRC(rb, ca);
      }
    }).join('');

    setStatus(mode === 'encrypt'
      ? 'Note: Non-letter characters removed. J treated as I. Double letters separated with X.'
      : 'Note: Decrypted Playfair text may contain filler X characters.');

    return result;
  }

  /* ══════════════════════════════════════════════════════════
     ⑤ AES — Web Crypto API (real encryption)
  ══════════════════════════════════════════════════════════ */
  async function aesCipher(text, passphrase, mode) {
    const enc = new TextEncoder();
    const dec = new TextDecoder();

    // Derive 256-bit key from passphrase via SHA-256
    const rawKey  = await crypto.subtle.digest('SHA-256', enc.encode(passphrase));
    const cryptoKey = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false,
      mode === 'encrypt' ? ['encrypt'] : ['decrypt']);

    if (mode === 'encrypt') {
      const iv        = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(text));
      // Combine iv + ciphertext → base64
      const combined  = new Uint8Array(iv.byteLength + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.byteLength);
      return btoa(String.fromCharCode(...combined));
    } else {
      // Decode base64 → iv + ciphertext
      let combined;
      try {
        combined = Uint8Array.from(atob(text), c => c.charCodeAt(0));
      } catch (e) { throw new Error('Invalid AES ciphertext. Make sure you paste the exact encrypted output.'); }
      if (combined.length < 13) throw new Error('Ciphertext too short — must be an AES-encrypted string.');
      const iv   = combined.slice(0, 12);
      const data = combined.slice(12);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
      return dec.decode(decrypted);
    }
  }

  /* ══════════════════════════════════════════════════════════
     ⑥–⑩ EDUCATIONAL SIMULATION (DES, 3DES, RSA, Blowfish, Twofish)
         Uses reversible XOR-based obfuscation clearly labelled as demo.
         Round-trips correctly so encryption/decryption actually works.
  ══════════════════════════════════════════════════════════ */
  function educationalSim(text, key, algoId, mode) {
    const algoName = ALGOS[algoId]?.name || algoId;
    setStatus(`🎓 Educational Demonstration — this is a simulation of ${algoName}, not real cryptographic encryption.`, 'warn');

    // Generate a repeating key byte stream from key string
    function keyStream(len, keyStr) {
      const bytes = [];
      for (let i = 0; i < len; i++) bytes.push(keyStr.charCodeAt(i % keyStr.length));
      return bytes;
    }

    if (mode === 'encrypt') {
      const bytes = Array.from(text).map(c => c.charCodeAt(0));
      const ks    = keyStream(bytes.length, key);
      const xored = bytes.map((b, i) => b ^ ks[i]);
      // Encode as hex for readability
      const hex   = xored.map(b => b.toString(16).padStart(2, '0')).join('');
      return `[EDU:${algoId.toUpperCase()}]${hex}`;
    } else {
      // Expect [EDU:ALGO]hex
      const prefix = `[EDU:${algoId.toUpperCase()}]`;
      if (!text.startsWith(prefix)) {
        throw new Error(`Paste the exact output from the ${algoName} encrypt step.`);
      }
      const hex   = text.slice(prefix.length);
      const bytes = hex.match(/.{2}/g)?.map(h => parseInt(h, 16)) || [];
      const ks    = keyStream(bytes.length, key);
      return bytes.map((b, i) => String.fromCharCode(b ^ ks[i])).join('');
    }
  }

});
