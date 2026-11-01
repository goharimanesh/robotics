/* ═══════════════════════════════════════════════════════════
   lecture.js v3 — منطق مشترک همه جلسات درس رباتیک
   دکتر مسعود گوهری‌منش — دانشگاه تربت حیدریه
═══════════════════════════════════════════════════════════ */

/* ═══════ ۱. toFa سراسری — قبل از هر چیز ═══════ */
window.toFa = function(n) {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

/* ═══════ ۲. صدا ═══════ */
window.soundEnabled = true;
window.audioCtx = null;

window.initAudio = function() {
  if (!window.audioCtx) {
    try {
      window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  if (window.audioCtx && window.audioCtx.state === 'suspended') {
    window.audioCtx.resume();
  }
};

window.playTone = function(freq, dur, type, vol) {
  if (!window.soundEnabled) return;
  try {
    window.initAudio();
    if (!window.audioCtx) return;
    const osc = window.audioCtx.createOscillator();
    const gain = window.audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, window.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol || 0.06, window.audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, window.audioCtx.currentTime + dur);
    osc.connect(gain); gain.connect(window.audioCtx.destination);
    osc.start(); osc.stop(window.audioCtx.currentTime + dur);
  } catch (e) {}
};

window.playClick = function() { window.playTone(880, 0.06, 'sine', 0.04); };
window.playSlideSound = function() {
  if (!window.soundEnabled) return;
  window.playTone(523, 0.1, 'sine', 0.04);
  setTimeout(() => window.playTone(784, 0.12, 'sine', 0.04), 60);
};
window.playSuccess = function() {
  if (!window.soundEnabled) return;
  window.playTone(523, 0.12, 'sine', 0.06);
  setTimeout(() => window.playTone(659, 0.12, 'sine', 0.06), 80);
  setTimeout(() => window.playTone(784, 0.2, 'sine', 0.06), 160);
  setTimeout(() => window.playTone(1046, 0.3, 'sine', 0.06), 260);
};
window.playError = function() {
  if (!window.soundEnabled) return;
  window.playTone(300, 0.15, 'sawtooth', 0.05);
  setTimeout(() => window.playTone(200, 0.2, 'sawtooth', 0.05), 100);
};

/* ═══════ ۳. Toast ═══════ */
window.showToast = function(msg) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
};

/* ═══════ ۴. کانفتی ═══════ */
window.fireConfetti = function() {
  const cols = ['#ffb700', '#00d4aa', '#a855f7', '#ff6b35', '#06b6d4', '#ec4899'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = cols[Math.floor(Math.random() * cols.length)];
    c.style.animationDelay = (Math.random() * 0.5) + 's';
    c.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
};

/* ═══════ ۵. ناوبری — پس از DOMContentLoaded ═══════ */
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 0;

  if (totalSlides === 0) {
    console.warn('No .slide found');
    return;
  }

  const navDots = document.getElementById('navDots');
  if (navDots) {
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => window.goToSlide(i));
      navDots.appendChild(dot);
    });
  }

  window.goToSlide = function(index) {
    if (index < 0 || index >= totalSlides) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');

    if (navDots) {
      document.querySelectorAll('.nav-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
      });
    }

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
    }

    const counter = document.getElementById('slideCounter');
    if (counter) {
      counter.textContent = window.toFa(currentSlide + 1) + ' / ' + window.toFa(totalSlides);
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;

    window.playSlideSound();

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch(() => {});
    }
  };

  window.nextSlide = () => window.goToSlide(currentSlide + 1);
  window.prevSlide = () => window.goToSlide(currentSlide - 1);

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.addEventListener('click', window.prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', window.nextSlide);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft' || e.key === ' ') { e.preventDefault(); window.nextSlide(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); window.prevSlide(); }
    else if (e.key === 'Home') { e.preventDefault(); window.goToSlide(0); }
    else if (e.key === 'End') { e.preventDefault(); window.goToSlide(totalSlides - 1); }
  });

  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'CANVAS') return;
    touchStartX = e.changedTouches[0].screenX;
  });
  document.addEventListener('touchend', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'CANVAS') return;
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) window.nextSlide();
      else window.prevSlide();
    }
  });

  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      window.soundEnabled = !window.soundEnabled;
      soundBtn.innerHTML = window.soundEnabled
        ? '<i class="fas fa-volume-up"></i>'
        : '<i class="fas fa-volume-mute"></i>';
      if (window.soundEnabled) window.playClick();
    });
  }

  const fsBtn = document.getElementById('fsBtn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      window.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
      } else {
        document.exitFullscreen().catch(() => {});
        fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    });
  }

  const particlesWrap = document.getElementById('particles');
  if (particlesWrap) {
    const colors = ['#ffb700', '#00d4aa', '#a855f7', '#06b6d4', '#ff6b35'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (12 + Math.random() * 18) + 's';
      p.style.animationDelay = (Math.random() * 20) + 's';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.boxShadow = '0 0 8px ' + p.style.background;
      particlesWrap.appendChild(p);
    }
  }

  window.answerQuiz = function(btn, isCorrect, correctIndex) {
    const container = btn.closest('.question-card');
    if (!container) return;
    const options = container.querySelectorAll('.quiz-option');
    const result = container.querySelector('.quiz-result');
    options.forEach(o => o.disabled = true);

    if (isCorrect) {
      btn.classList.add('correct');
      if (result) {
        result.className = 'quiz-result show ok';
        result.innerHTML = '<i class="fas fa-check-circle"></i> آفرین! پاسخ صحیح است.';
      }
      window.playSuccess();
      window.fireConfetti();
      setTimeout(() => { if (currentSlide < totalSlides - 1) window.nextSlide(); }, 2000);
    } else {
      btn.classList.add('wrong');
      if (result) {
        result.className = 'quiz-result show no';
        result.innerHTML = '<i class="fas fa-times-circle"></i> پاسخ صحیح نبود.';
      }
      window.playError();
      if (typeof correctIndex === 'number' && options[correctIndex]) {
        options[correctIndex].classList.add('correct');
      }
      setTimeout(() => { if (currentSlide < totalSlides - 1) window.nextSlide(); }, 2400);
    }
  };

  window.goToSlide(0);
});