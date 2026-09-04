/* ==========================================================================
   05Timer - High Visibility Offline Timer Logic
   ========================================================================== */

(function () {
  'use strict';

  // --- State Variables ---
  let mode = 'timer'; // 'timer' | 'stopwatch'
  let isRunning = false;
  let timerId = null;

  // Timer State
  let timerDuration = 300; // default 5 min (in seconds)
  let timerRemaining = 300;
  let totalLoops = 1;      // default 1 loop
  let currentLoop = 1;

  // Stopwatch State
  let stopwatchElapsed = 0; // in milliseconds
  let lastTimestamp = 0;

  // Sound State
  let soundEnabled = true;
  let audioCtx = null;

  // Document Picture-in-Picture window reference
  let pipWindow = null;
  let originalWidth = 960;
  let originalHeight = 540;

  // --- DOM Elements ---
  const appContainer = document.getElementById('app');
  const pipPlaceholder = document.getElementById('pip-placeholder');
  const btnPipRestore = document.getElementById('btn-pip-restore');

  const tabTimer = document.getElementById('tab-timer');
  const tabStopwatch = document.getElementById('tab-stopwatch');
  
  const btnPip = document.getElementById('btn-pip');
  const labelPip = document.getElementById('label-pip');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const loopBadge = document.getElementById('loop-badge');
  const currentLoopDisplay = document.getElementById('current-loop-display');
  const totalLoopsDisplay = document.getElementById('total-loops-display');
  const modeStatusText = document.getElementById('mode-status-text');

  const displaySection = document.querySelector('.display-section');
  const timeWrapper = document.getElementById('time-wrapper');
  const timeDisplay = document.getElementById('time-display');
  const msDisplay = document.getElementById('ms-display');

  const presetBar = document.getElementById('preset-bar');
  const presetBtns = document.querySelectorAll('.preset-btn');

  const btnStartPause = document.getElementById('btn-start-pause');
  const labelStartPause = document.getElementById('label-start-pause');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');

  const btnReset = document.getElementById('btn-reset');
  const loopControls = document.getElementById('loop-controls');
  const loopCountInput = document.getElementById('loop-count-input');
  const btnLoopMinus = document.getElementById('btn-loop-minus');
  const btnLoopPlus = document.getElementById('btn-loop-plus');

  // --- Window Quarter Screen Position (Top-Left 1/4 Screen) ---
  function resizeToQuarterScreen() {
    try {
      originalWidth = Math.floor(window.screen.availWidth / 2);
      originalHeight = Math.floor(window.screen.availHeight / 2);
      window.moveTo(0, 0);
      window.resizeTo(originalWidth, originalHeight);
    } catch (e) {
      console.warn('Window resize/move restricted by browser settings:', e);
    }
  }

  // Execute on load
  resizeToQuarterScreen();

  // --- Audio Synthesizer (Web Audio API for Offline Use) ---
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }, delay * 1000);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  function playLoopChime() {
    playTone(587.33, 'sine', 0.25, 0);
    playTone(880.00, 'sine', 0.4, 0.15);
  }

  function playFinalAlarm() {
    playTone(523.25, 'triangle', 0.2, 0);
    playTone(659.25, 'triangle', 0.2, 0.15);
    playTone(783.99, 'triangle', 0.2, 0.3);
    playTone(1046.50, 'triangle', 0.6, 0.45);
  }

  function playClickSound() {
    playTone(440, 'sine', 0.05, 0);
  }

  // --- Formatting Helpers ---
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');

    if (hrs > 0) {
      const hh = String(hrs).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }

  function formatStopwatch(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = Math.floor(totalSecs % 60);
    const hundredths = Math.floor((ms % 1000) / 10);

    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    const cs = String(hundredths).padStart(2, '0');

    if (hrs > 0) {
      const hh = String(hrs).padStart(2, '0');
      return { timeStr: `${hh}:${mm}:${ss}`, msStr: `.${cs}` };
    }
    return { timeStr: `${mm}:${ss}`, msStr: `.${cs}` };
  }

  // --- Render Display ---
  function updateDisplay() {
    let titleText = '';
    if (mode === 'timer') {
      timeDisplay.textContent = formatTime(timerRemaining);
      msDisplay.classList.add('hidden');
      titleText = `(${formatTime(timerRemaining)}) 타이머 - 05Timer`;
    } else {
      const formatted = formatStopwatch(stopwatchElapsed);
      timeDisplay.textContent = formatted.timeStr;
      msDisplay.textContent = formatted.msStr;
      msDisplay.classList.remove('hidden');
      titleText = `(${formatted.timeStr}) 스톱워치 - 05Timer`;
    }

    document.title = titleText;
    if (pipWindow && pipWindow.document) {
      pipWindow.document.title = titleText;
    }

    currentLoopDisplay.textContent = currentLoop;
    totalLoopsDisplay.textContent = totalLoops;

    adjustFontSizeToViewport();
  }

  // --- Dynamic Maximum Font Size Fitting ---
  function adjustFontSizeToViewport() {
    if (!timeWrapper || !displaySection) return;

    const text = timeDisplay.textContent + (mode === 'stopwatch' ? '.00' : '');
    const textLength = text.length;

    const wrapperWidth = timeWrapper.clientWidth || (window.innerWidth * 0.95);
    const wrapperHeight = timeWrapper.clientHeight || (window.innerHeight * 0.45);

    const fontFromWidth = (wrapperWidth * 0.9) / (textLength * 0.55);
    const fontFromHeight = wrapperHeight * 0.95;

    const finalFontSize = Math.min(fontFromWidth, fontFromHeight);
    timeDisplay.style.fontSize = `${Math.max(30, Math.floor(finalFontSize))}px`;
  }

  window.addEventListener('resize', adjustFontSizeToViewport);
  setTimeout(adjustFontSizeToViewport, 50);

  // --- Flash Visual Alert ---
  function triggerFlashAlert() {
    appContainer.classList.add('flash-alert');
    if (pipWindow) {
      pipWindow.document.body.classList.add('flash-alert');
    }
    setTimeout(() => {
      appContainer.classList.remove('flash-alert');
      if (pipWindow) {
        pipWindow.document.body.classList.remove('flash-alert');
      }
    }, 1500);
  }

  // --- Timer Tick Logic ---
  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    getAudioContext();

    appContainer.classList.add('running');
    if (iconPlay) iconPlay.classList.add('hidden');
    if (iconPause) iconPause.classList.remove('hidden');
    labelStartPause.textContent = '일시정지';
    btnStartPause.classList.add('running');
    modeStatusText.textContent = '작동 중...';

    if (mode === 'timer') {
      timerId = setInterval(() => {
        if (timerRemaining > 0) {
          timerRemaining--;
          updateDisplay();
        } else {
          if (currentLoop < totalLoops) {
            playLoopChime();
            triggerFlashAlert();
            currentLoop++;
            timerRemaining = timerDuration;
            updateDisplay();
          } else {
            pauseTimer();
            playFinalAlarm();
            triggerFlashAlert();
            modeStatusText.textContent = '완료!';
          }
        }
      }, 1000);
    } else { // Stopwatch mode
      lastTimestamp = performance.now();
      timerId = setInterval(() => {
        const now = performance.now();
        stopwatchElapsed += (now - lastTimestamp);
        lastTimestamp = now;
        updateDisplay();
      }, 16);
    }
  }

  function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerId);
    timerId = null;

    appContainer.classList.remove('running');
    if (iconPlay) iconPlay.classList.remove('hidden');
    if (iconPause) iconPause.classList.add('hidden');
    labelStartPause.textContent = '시작';
    btnStartPause.classList.remove('running');
    modeStatusText.textContent = '일시정지됨';
  }

  // --- Focus Helper ---
  function blurActiveElements() {
    try {
      if (document.activeElement && typeof document.activeElement.blur === 'function' && document.activeElement.tagName !== 'INPUT') {
        document.activeElement.blur();
      }
      if (pipWindow && pipWindow.document && pipWindow.document.activeElement && typeof pipWindow.document.activeElement.blur === 'function' && pipWindow.document.activeElement.tagName !== 'INPUT') {
        pipWindow.document.activeElement.blur();
      }
    } catch (e) {}
  }

  function toggleStartPause() {
    playClickSound();
    blurActiveElements();
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function resetTimer() {
    playClickSound();
    blurActiveElements();
    pauseTimer();

    if (mode === 'timer') {
      timerRemaining = timerDuration;
      currentLoop = 1;
      modeStatusText.textContent = '준비됨';
    } else {
      stopwatchElapsed = 0;
      modeStatusText.textContent = '준비됨';
    }
    updateDisplay();
  }

  // --- Adjust Time (+10s, -10s, +1m, -1m) ---
  function adjustTime(secondsDelta) {
    playClickSound();
    blurActiveElements();
    if (mode === 'timer') {
      if (isRunning) {
        timerRemaining = Math.max(0, timerRemaining + secondsDelta);
      } else {
        timerDuration = Math.max(1, timerDuration + secondsDelta);
        timerRemaining = timerDuration;
      }
    } else {
      stopwatchElapsed = Math.max(0, stopwatchElapsed + (secondsDelta * 1000));
    }
    updateDisplay();
  }

  // --- Presets Handler ---
  function setPresetMinutes(mins) {
    playClickSound();
    blurActiveElements();
    timerDuration = mins * 60;
    timerRemaining = timerDuration;
    currentLoop = 1;

    presetBtns.forEach(btn => {
      btn.classList.toggle('active-preset', parseInt(btn.dataset.minutes) === mins);
    });

    if (isRunning) {
      pauseTimer();
    }
    modeStatusText.textContent = `${mins}분 설정됨`;
    updateDisplay();
  }

  // --- Mode Switching ---
  function setMode(newMode) {
    if (mode === newMode) return;
    playClickSound();
    blurActiveElements();
    pauseTimer();
    mode = newMode;

    if (mode === 'timer') {
      tabTimer.classList.add('active');
      tabTimer.setAttribute('aria-selected', 'true');
      tabStopwatch.classList.remove('active');
      tabStopwatch.setAttribute('aria-selected', 'false');

      presetBar.classList.remove('hidden');
      loopBadge.classList.remove('hidden');

      // Enable loop controls
      loopControls.classList.remove('disabled');
      loopCountInput.disabled = false;
      btnLoopMinus.disabled = false;
      btnLoopPlus.disabled = false;

      document.documentElement.style.setProperty('--accent-current', 'var(--accent-timer)');
      document.documentElement.style.setProperty('--accent-glow-current', 'var(--accent-timer-glow)');
    } else {
      tabStopwatch.classList.add('active');
      tabStopwatch.setAttribute('aria-selected', 'true');
      tabTimer.classList.remove('active');
      tabTimer.setAttribute('aria-selected', 'false');

      presetBar.classList.add('hidden');
      loopBadge.classList.add('hidden');

      // Disable loop controls in stopwatch mode (grayed out)
      loopControls.classList.add('disabled');
      loopCountInput.disabled = true;
      btnLoopMinus.disabled = true;
      btnLoopPlus.disabled = true;

      document.documentElement.style.setProperty('--accent-current', 'var(--accent-stopwatch)');
      document.documentElement.style.setProperty('--accent-glow-current', 'var(--accent-stopwatch-glow)');
    }

    modeStatusText.textContent = '준비됨';
    updateDisplay();
  }

  // --- Window Resizing Levels (1: 35%, 2: 50% default, 3: 65%, 4: 80%, 5: Fullscreen) ---
  function setWindowSizeLevel(level) {
    blurActiveElements();
    
    if (level === 5) {
      toggleFullscreen();
      return;
    }

    // Exit fullscreen if currently active
    const targetDoc = (pipWindow && pipWindow.document) ? pipWindow.document : document;
    if (targetDoc.fullscreenElement) {
      targetDoc.exitFullscreen().catch(() => {});
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const targetWin = pipWindow || window;
    const availW = targetWin.screen ? targetWin.screen.availWidth : window.screen.availWidth;
    const availH = targetWin.screen ? targetWin.screen.availHeight : window.screen.availHeight;

    let scale = 0.5; // default level 2
    if (level === 1) scale = 0.35;
    else if (level === 2) scale = 0.50;
    else if (level === 3) scale = 0.65;
    else if (level === 4) scale = 0.80;

    const w = Math.floor(availW * scale);
    const h = Math.floor(availH * scale);

    try {
      targetWin.resizeTo(w, h);
      targetWin.moveTo(0, 0);
    } catch (e) {
      console.warn('Window resize restricted by browser:', e);
    }

    setTimeout(adjustFontSizeToViewport, 50);
  }

  // --- Fullscreen Toggle ---
  function toggleFullscreen() {
    blurActiveElements();
    const targetDoc = (pipWindow && pipWindow.document) ? pipWindow.document : document;
    if (!targetDoc.fullscreenElement && !document.fullscreenElement) {
      targetDoc.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error in target document, falling back to main window:', err);
        if (pipWindow) {
          restoreFromPiP();
          setTimeout(() => {
            document.documentElement.requestFullscreen().catch(e => {});
          }, 50);
        }
      });
    } else {
      if (pipWindow && pipWindow.document && pipWindow.document.fullscreenElement) {
        pipWindow.document.exitFullscreen().catch(e => {});
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => {});
      }
    }
  }

  // --- Document Picture-in-Picture (Single Window Experience) ---
  async function toggleDocumentPiP() {
    blurActiveElements();
    if (!('documentPictureInPicture' in window)) {
      alert('사용 중인 브라우저가 Document Picture-in-Picture (맨 위 창)를 지원하지 않거나 파일 프로토콜 제한이 있습니다.\n\nChrome / Edge 116+ 브라우저를 사용해 주세요!');
      return;
    }

    if (pipWindow) {
      pipWindow.close();
      return;
    }

    try {
      const width = Math.min(Math.floor(window.screen.availWidth / 2), 650);
      const height = Math.min(Math.floor(window.screen.availHeight / 2), 480);

      pipWindow = await window.documentPictureInPicture.requestWindow({
        width: width,
        height: height
      });

      // Enable keyboard shortcuts when focused on the PiP window (both Window and Document)
      pipWindow.addEventListener('keydown', handleKeyDown);
      pipWindow.document.addEventListener('keydown', handleKeyDown);
      try {
        pipWindow.focus();
      } catch (e) {}

      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      });

      pipWindow.document.body.appendChild(appContainer);
      if (pipPlaceholder) pipPlaceholder.classList.remove('hidden');

      btnPip.classList.add('active');
      labelPip.textContent = '📌 복원 (T)';

      try {
        window.resizeTo(280, 50);
        window.moveTo(0, 0);
      } catch (e) {}

      pipWindow.addEventListener('pagehide', () => {
        restoreFromPiP();
      });

    } catch (err) {
      console.error('PiP request failed:', err);
    }
  }

  function restoreFromPiP() {
    blurActiveElements();
    if (pipPlaceholder) pipPlaceholder.classList.add('hidden');
    document.body.appendChild(appContainer);
    btnPip.classList.remove('active');
    labelPip.textContent = '📌 맨 위 창 (T)';
    if (pipWindow) {
      try {
        pipWindow.removeEventListener('keydown', handleKeyDown);
        pipWindow.document.removeEventListener('keydown', handleKeyDown);
      } catch (e) {}
      pipWindow = null;
    }

    try {
      window.resizeTo(originalWidth, originalHeight);
      window.moveTo(0, 0);
    } catch (e) {}

    updateDisplay();
  }

  if (btnPipRestore) {
    btnPipRestore.addEventListener('click', () => {
      if (pipWindow) {
        pipWindow.close();
      } else {
        restoreFromPiP();
      }
    });
  }

  // --- Event Listeners ---
  tabTimer.addEventListener('click', () => setMode('timer'));
  tabStopwatch.addEventListener('click', () => setMode('stopwatch'));

  if (btnPip) {
    btnPip.addEventListener('click', toggleDocumentPiP);
  }

  btnSoundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIconOn.classList.toggle('hidden', !soundEnabled);
    soundIconOff.classList.toggle('hidden', soundEnabled);
    blurActiveElements();
  });

  btnFullscreen.addEventListener('click', toggleFullscreen);

  btnStartPause.addEventListener('click', toggleStartPause);
  btnReset.addEventListener('click', resetTimer);

  // Preset Buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.minutes, 10);
      setPresetMinutes(mins);
    });
  });

  // Loop Count Inputs
  loopCountInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    totalLoops = val;
    loopCountInput.value = val;
    updateDisplay();
  });

  btnLoopMinus.addEventListener('click', () => {
    if (totalLoops > 1) {
      totalLoops--;
      loopCountInput.value = totalLoops;
      updateDisplay();
      blurActiveElements();
    }
  });

  btnLoopPlus.addEventListener('click', () => {
    totalLoops++;
    loopCountInput.value = totalLoops;
    updateDisplay();
    blurActiveElements();
  });

  // --- Keyboard Shortcuts Listener ---
  function handleKeyDown(e) {
    if (e.defaultPrevented) return;
    if (e.target && e.target.tagName === 'INPUT') return;

    const key = e.key;
    const code = e.code;

    // Window Sizing: 1, 2 (current default 1/4 size), 3, 4, 5 (fullscreen)
    if (code === 'Digit1' || code === 'Numpad1' || key === '1') {
      e.preventDefault();
      setWindowSizeLevel(1);
      return;
    }
    if (code === 'Digit2' || code === 'Numpad2' || key === '2') {
      e.preventDefault();
      setWindowSizeLevel(2);
      return;
    }
    if (code === 'Digit3' || code === 'Numpad3' || key === '3') {
      e.preventDefault();
      setWindowSizeLevel(3);
      return;
    }
    if (code === 'Digit4' || code === 'Numpad4' || key === '4') {
      e.preventDefault();
      setWindowSizeLevel(4);
      return;
    }
    if (code === 'Digit5' || code === 'Numpad5' || key === '5' || code === 'KeyF' || key === 'f' || key === 'F' || key === 'ㄹ') {
      e.preventDefault();
      setWindowSizeLevel(5);
      return;
    }

    // Spacebar (Start / Pause)
    if (code === 'Space' || key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      blurActiveElements();
      toggleStartPause();
      return;
    }

    // Reset (R)
    if (code === 'KeyR' || key === 'r' || key === 'R' || key === 'ㄱ') {
      e.preventDefault();
      blurActiveElements();
      resetTimer();
      return;
    }

    // Always-on-Top / PiP (T or P)
    if (code === 'KeyT' || code === 'KeyP' || key === 't' || key === 'T' || key === 'p' || key === 'P' || key === 'ㅅ' || key === 'ㅔ') {
      e.preventDefault();
      blurActiveElements();
      toggleDocumentPiP();
      return;
    }

    // Time adjustments (Arrows)
    if (code === 'ArrowRight' || key === 'ArrowRight') {
      e.preventDefault();
      adjustTime(10);
      return;
    }
    if (code === 'ArrowLeft' || key === 'ArrowLeft') {
      e.preventDefault();
      adjustTime(-10);
      return;
    }
    if (code === 'ArrowUp' || key === 'ArrowUp') {
      e.preventDefault();
      adjustTime(60);
      return;
    }
    if (code === 'ArrowDown' || key === 'ArrowDown') {
      e.preventDefault();
      adjustTime(-60);
      return;
    }
  }

  window.addEventListener('keydown', handleKeyDown);

  // Initial setup
  setPresetMinutes(5);
  updateDisplay();
})();
