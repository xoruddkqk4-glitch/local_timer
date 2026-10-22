/* ==========================================================================
   05Timer - High Visibility Offline Timer Logic
   ========================================================================== */

(function () {
  'use strict';

  // --- State Variables ---
  let mode = 'timer'; // 'timer' | 'stopwatch'
  let isRunning = false;
  let timerId = null;
  let currentSizeLevel = 2; // default 1/4 screen (level 2)

  // Timer State
  let timerDuration = 300; // default 5 min (in seconds)
  let timerRemaining = 300;
  let totalLoops = 1;      // default 1 loop
  let currentLoop = 1;

  // Stopwatch State
  let stopwatchElapsed = 0; // in milliseconds
  let lastTimestamp = 0;

  // Sound & Alarm State
  let soundEnabled = true;
  let audioCtx = null;
  let alarmVolume = 0.8; // 0.0 ~ 1.0 (default 80%)
  let currentAlarmSoundId = 'mp3-yarsong'; // default to user's mp3 alarm
  let customSounds = []; // user added sounds [{id, name, category, dataUrl, desc, isCustom}]
  let currentPreviewAudio = null;
  let currentPreviewSoundId = null;

  const ALARM_SOUND_PRESETS = [
    {
      id: 'mp3-yarsong',
      name: '야르송 알람',
      category: 'mp3',
      tag: 'MP3',
      path: 'mp3/야르송알람.mp3',
      desc: '경쾌한 멜로디 알림음 (mp3)'
    },
    {
      id: 'mp3-clear-chime',
      name: '맑은 차임벨',
      category: 'mp3',
      tag: 'MP3',
      path: 'mp3/맑은차임.mp3',
      desc: '은은하게 울리는 4화음 맑은 벨'
    },
    {
      id: 'mp3-digital-beep',
      name: '디지털 비프',
      category: 'mp3',
      tag: 'MP3',
      path: 'mp3/디지털비프.mp3',
      desc: '클래식 전자 알람 비프음'
    },
    {
      id: 'mp3-marimba',
      name: '우든 마림바',
      category: 'mp3',
      tag: 'MP3',
      path: 'mp3/마림바.mp3',
      desc: '따뜻하고 발랄한 마림바 타음'
    },
    {
      id: 'mp3-urgent-siren',
      name: '긴급 사이렌',
      category: 'mp3',
      tag: 'MP3',
      path: 'mp3/긴급사이렌.mp3',
      desc: '집중 환기용 펄스 경보음'
    },
    {
      id: 'synth-default',
      name: '기본 신스음',
      category: 'synth',
      tag: '내장',
      path: null,
      desc: '내장 오실레이터 순수 합성음'
    }
  ];

  // Theme State ('default-dark' | 'default-light' | 'apple' | etc.)
  let currentTheme = 'default-dark';

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
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const btnThemeMenu = document.getElementById('btn-theme-menu');
  const themePopover = document.getElementById('theme-popover');
  const btnCloseThemePopover = document.getElementById('btn-close-theme-popover');
  const themeCardBtns = document.querySelectorAll('.theme-card-btn');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const btnAlarmMenu = document.getElementById('btn-alarm-menu');
  const alarmPopover = document.getElementById('alarm-popover');
  const btnCloseAlarmPopover = document.getElementById('btn-close-alarm-popover');
  const alarmSoundList = document.getElementById('alarm-sound-list');
  const alarmVolumeSlider = document.getElementById('alarm-volume-slider');
  const alarmVolumeValue = document.getElementById('alarm-volume-value');
  const btnAddAlarmFile = document.getElementById('btn-add-alarm-file');
  const alarmFileInput = document.getElementById('alarm-file-input');

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

  function playTone(freq, type, duration, delay = 0, volScale = 1.0) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        const effectiveGain = 0.3 * (typeof volScale === 'number' ? volScale : 1.0) * Math.max(0.1, alarmVolume);
        gain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
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
    playFinalAlarm();
  }

  function playFinalAlarmSynth(volScale = 1.0) {
    if (!soundEnabled) return;
    playTone(523.25, 'triangle', 0.2, 0, volScale);
    playTone(659.25, 'triangle', 0.2, 0.15, volScale);
    playTone(783.99, 'triangle', 0.2, 0.3, volScale);
    playTone(1046.50, 'triangle', 0.6, 0.45, volScale);
  }

  function getAllSounds() {
    return [...ALARM_SOUND_PRESETS, ...customSounds];
  }

  function getSoundById(id) {
    return getAllSounds().find(s => s.id === id) || ALARM_SOUND_PRESETS[0];
  }

  function selectAlarmSound(id) {
    currentAlarmSoundId = id;
    try {
      localStorage.setItem('05timer_alarm_sound_id', id);
    } catch (e) {}
    renderAlarmSoundsList();
  }

  function stopPreviewAudio() {
    if (currentPreviewAudio) {
      try {
        currentPreviewAudio.pause();
        currentPreviewAudio.currentTime = 0;
      } catch (e) {}
      currentPreviewAudio = null;
    }
    currentPreviewSoundId = null;
    renderAlarmSoundsList();
  }

  function playAlarmSound(soundId, isPreview = false) {
    if (!soundEnabled && !isPreview) return;

    const sound = getSoundById(soundId || currentAlarmSoundId);
    if (!sound) return;

    const effectiveVol = Math.max(0, Math.min(1, alarmVolume));

    if (sound.category === 'synth') {
      if (isPreview) {
        stopPreviewAudio();
        currentPreviewSoundId = sound.id;
        renderAlarmSoundsList();
        playFinalAlarmSynth(1.0);
        setTimeout(() => {
          if (currentPreviewSoundId === sound.id) {
            currentPreviewSoundId = null;
            renderAlarmSoundsList();
          }
        }, 1100);
      } else {
        playFinalAlarmSynth(1.0);
      }
      return;
    }

    try {
      stopPreviewAudio();

      const audioSrc = sound.dataUrl || sound.path;
      const audio = new Audio(audioSrc);
      audio.volume = effectiveVol;

      if (isPreview) {
        currentPreviewAudio = audio;
        currentPreviewSoundId = sound.id;
        renderAlarmSoundsList();

        audio.onended = () => {
          currentPreviewAudio = null;
          currentPreviewSoundId = null;
          renderAlarmSoundsList();
        };
        audio.onerror = () => {
          currentPreviewAudio = null;
          currentPreviewSoundId = null;
          renderAlarmSoundsList();
        };
      }

      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn('Audio play failed, falling back to synth:', err);
          if (!isPreview) {
            playFinalAlarmSynth(1.0);
          }
        });
      }
    } catch (e) {
      console.warn('Audio object initialization failed, falling back to synth:', e);
      if (!isPreview) {
        playFinalAlarmSynth(1.0);
      }
    }
  }

  function playFinalAlarm() {
    playAlarmSound(currentAlarmSoundId, false);
  }

  function deleteCustomSound(soundId) {
    if (currentPreviewSoundId === soundId) {
      stopPreviewAudio();
    }
    customSounds = customSounds.filter(s => s.id !== soundId);
    saveCustomSounds();
    if (currentAlarmSoundId === soundId) {
      selectAlarmSound('mp3-yarsong');
    } else {
      renderAlarmSoundsList();
    }
  }

  function saveCustomSounds() {
    try {
      localStorage.setItem('05timer_custom_sounds', JSON.stringify(customSounds));
    } catch (e) {
      console.warn('Failed to save custom sounds to localStorage:', e);
    }
  }

  function loadCustomSounds() {
    try {
      const saved = localStorage.getItem('05timer_custom_sounds');
      if (saved) {
        customSounds = JSON.parse(saved);
      }
    } catch (e) {
      customSounds = [];
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAlarmSoundsList() {
    if (!alarmSoundList) return;
    const sounds = getAllSounds();

    alarmSoundList.innerHTML = '';
    sounds.forEach((sound) => {
      const isSelected = sound.id === currentAlarmSoundId;
      const isPlaying = sound.id === currentPreviewSoundId;

      const card = document.createElement('div');
      card.className = `alarm-card ${isSelected ? 'active' : ''}`;
      card.dataset.soundId = sound.id;

      card.innerHTML = `
        <div class="alarm-card-left">
          <div class="alarm-radio-check">
            ${isSelected ? '<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </div>
          <div class="alarm-card-info">
            <div class="alarm-card-name-row">
              <span class="alarm-card-name">${escapeHtml(sound.name)}</span>
              <span class="alarm-tag">${escapeHtml(sound.tag || (sound.isCustom ? '사용자' : 'MP3'))}</span>
            </div>
            <span class="alarm-card-desc">${escapeHtml(sound.desc || '')}</span>
          </div>
        </div>
        <div class="alarm-card-actions">
          <button type="button" class="alarm-preview-btn ${isPlaying ? 'playing' : ''}" data-sound-id="${sound.id}" title="${isPlaying ? '정지' : '미리듣기'}">
            ${isPlaying ? '⏹' : '▶'}
          </button>
          ${sound.isCustom ? `<button type="button" class="alarm-delete-btn" data-sound-id="${sound.id}" title="삭제">&times;</button>` : ''}
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.alarm-preview-btn') || e.target.closest('.alarm-delete-btn')) {
          return;
        }
        selectAlarmSound(sound.id);
        playClickSound();
      });

      const previewBtn = card.querySelector('.alarm-preview-btn');
      if (previewBtn) {
        previewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentPreviewSoundId === sound.id) {
            stopPreviewAudio();
          } else {
            playAlarmSound(sound.id, true);
          }
        });
      }

      const deleteBtn = card.querySelector('.alarm-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomSound(sound.id);
        });
      }

      alarmSoundList.appendChild(card);
    });
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
    if (!timeWrapper || !displaySection || !appContainer) return;

    const text = timeDisplay.textContent + (mode === 'stopwatch' ? '.00' : '');
    const textLength = Math.max(1, text.length);

    const activeWin = pipWindow || window;
    const containerWidth = appContainer.clientWidth || activeWin.innerWidth || 600;
    const containerHeight = appContainer.clientHeight || activeWin.innerHeight || 400;

    // Dynamically calculate vertical space occupied by UI chrome
    const topBar = document.querySelector('.top-bar');
    const controlsBar = document.querySelector('.controls-bar');
    const statusContainer = document.querySelector('.status-container');
    const presetBar = document.getElementById('preset-bar');

    let otherHeight = 0;
    if (topBar) otherHeight += topBar.offsetHeight;
    if (controlsBar) otherHeight += controlsBar.offsetHeight;
    if (statusContainer) otherHeight += statusContainer.offsetHeight;
    if (presetBar && !presetBar.classList.contains('hidden')) otherHeight += presetBar.offsetHeight;
    otherHeight += 28; // Container padding and gap buffer

    const availWidth = Math.max(120, containerWidth - 24);
    const availHeight = Math.max(50, containerHeight - otherHeight);

    // Monospace width ratio (~0.60em)
    const charWidthRatio = 0.60;
    const fontFromWidth = (availWidth * 0.94) / (textLength * charWidthRatio);
    const fontFromHeight = availHeight * 0.90;

    const finalFontSize = Math.min(fontFromWidth, fontFromHeight);
    timeDisplay.style.fontSize = `${Math.max(18, Math.floor(finalFontSize))}px`;
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
            playFinalAlarm();
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

  // --- Theme (8 Curated Designs from .design) Logic ---
  const LIGHT_THEMES = ['default-light', 'apple', 'retro-win', 'sakura'];

  function isLightTheme(theme) {
    return LIGHT_THEMES.includes(theme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') theme = 'default-dark';
    if (theme === 'light') theme = 'default-light';

    currentTheme = theme;

    document.documentElement.setAttribute('data-theme', theme);
    if (appContainer) {
      appContainer.setAttribute('data-theme', theme);
    }

    if (pipWindow && pipWindow.document) {
      try {
        pipWindow.document.documentElement.setAttribute('data-theme', theme);
        if (pipWindow.document.body) {
          pipWindow.document.body.setAttribute('data-theme', theme);
          pipWindow.document.body.style.background = 'var(--bg-canvas, #020617)';
        }
      } catch (e) {}
    }

    const isLight = isLightTheme(theme);

    if (themeIconSun && themeIconMoon) {
      themeIconSun.classList.toggle('hidden', isLight);
      themeIconMoon.classList.toggle('hidden', !isLight);
    }

    if (btnThemeToggle) {
      btnThemeToggle.setAttribute('title', isLight ? '밤 모드로 전환 (단축키: D)' : '낮 모드로 전환 (단축키: D)');
    }

    // Synchronize active card in theme popover
    if (themeCardBtns) {
      themeCardBtns.forEach(btn => {
        const isActive = btn.dataset.themeId === theme;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    try {
      localStorage.setItem('05timer_theme', theme);
    } catch (e) {}

    // Synchronize mode accent variables dynamically from active theme CSS variables
    if (mode === 'timer') {
      document.documentElement.style.setProperty('--accent-current', 'var(--accent-timer)');
      document.documentElement.style.setProperty('--accent-glow-current', 'var(--accent-timer-glow)');
    } else {
      document.documentElement.style.setProperty('--accent-current', 'var(--accent-stopwatch)');
      document.documentElement.style.setProperty('--accent-glow-current', 'var(--accent-stopwatch-glow)');
    }
  }

  function toggleTheme() {
    playClickSound();
    blurActiveElements();
    const isLight = isLightTheme(currentTheme);
    const newTheme = isLight ? 'default-dark' : 'default-light';
    applyTheme(newTheme);
  }

  function toggleThemePopover(show) {
    if (!themePopover) return;
    const shouldShow = typeof show === 'boolean' ? show : themePopover.classList.contains('hidden');
    if (shouldShow) {
      if (typeof toggleAlarmPopover === 'function') {
        toggleAlarmPopover(false);
      }
      themePopover.classList.remove('hidden');
      if (btnThemeMenu) btnThemeMenu.classList.add('active');
    } else {
      themePopover.classList.add('hidden');
      if (btnThemeMenu) btnThemeMenu.classList.remove('active');
    }
  }

  function toggleAlarmPopover(show) {
    if (!alarmPopover) return;
    const shouldShow = typeof show === 'boolean' ? show : alarmPopover.classList.contains('hidden');
    if (shouldShow) {
      toggleThemePopover(false);
      alarmPopover.classList.remove('hidden');
      if (btnAlarmMenu) btnAlarmMenu.classList.add('active');
      renderAlarmSoundsList();
    } else {
      alarmPopover.classList.add('hidden');
      if (btnAlarmMenu) btnAlarmMenu.classList.remove('active');
      stopPreviewAudio();
    }
  }

  // --- Presets Handler ---
  function getButtonSeconds(btn) {
    if (btn.dataset.seconds) {
      return parseInt(btn.dataset.seconds, 10);
    }
    if (btn.dataset.minutes) {
      return Math.round(parseFloat(btn.dataset.minutes) * 60);
    }
    return 0;
  }

  function setPresetTime(totalSeconds, customLabel) {
    playClickSound();
    blurActiveElements();
    timerDuration = totalSeconds;
    timerRemaining = timerDuration;
    currentLoop = 1;

    presetBtns.forEach(btn => {
      btn.classList.toggle('active-preset', getButtonSeconds(btn) === totalSeconds);
    });

    if (isRunning) {
      pauseTimer();
    }

    let label = customLabel;
    if (!label) {
      const matchedBtn = Array.from(presetBtns).find(btn => getButtonSeconds(btn) === totalSeconds);
      if (matchedBtn) {
        label = matchedBtn.textContent.trim();
      } else {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        label = secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
      }
    }

    modeStatusText.textContent = `${label} 설정됨`;
    updateDisplay();
  }

  function setPresetMinutes(mins) {
    const totalSecs = Math.round(mins * 60);
    setPresetTime(totalSecs);
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

  // --- Window Resizing Levels (1: 35%/25%, 2: 50%/33%, 3: 65%/42%, 4: 80%/50%, 5: Fullscreen) ---
  function setWindowSizeLevel(level) {
    blurActiveElements();
    currentSizeLevel = level;

    // Reset container max-width so Fullscreen and main window resizing never get trapped in side margins
    if (appContainer) {
      appContainer.style.maxWidth = '100%';
      appContainer.style.margin = '0';
    }

    // 1. Level 5 triggers Fullscreen mode
    if (level === 5) {
      toggleFullscreen();
      return;
    }

    const availW = window.screen.availWidth;
    const availH = window.screen.availHeight;

    // 2. In PiP (맨 위 창) mode:
    // Chromium limits Document Picture-in-Picture windows to a maximum of ~50% screen size for security.
    // Scales above 50% (such as 65% or 80%) get clamped down to 50% by Chrome, making 2, 3, 4 look identical.
    // To ensure distinct, step-by-step visible window scaling in PiP mode, we map levels 1~4 to 25%, 33%, 42%, and 50% (Chrome's PiP ceiling).
    if (pipWindow) {
      let pipScale = 0.33; // default level 2 in PiP
      if (level === 1) pipScale = 0.25;
      else if (level === 2) pipScale = 0.33;
      else if (level === 3) pipScale = 0.42;
      else if (level === 4) pipScale = 0.50; // Maximum allowed PiP size in Chrome (~50% of screen)

      const targetW = Math.floor(availW * pipScale);
      const targetH = Math.floor(availH * pipScale);

      try {
        pipWindow.resizeTo(targetW, targetH);
      } catch (e) {
        console.warn('PiP window resize error:', e);
      }

      setTimeout(adjustFontSizeToViewport, 50);
      setTimeout(adjustFontSizeToViewport, 150);
      return;
    }

    // 3. In Main window mode (levels 1, 2, 3, 4):
    // Exit HTML Fullscreen if currently active in main window
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    let scale = 0.50; // default level 2
    if (level === 1) scale = 0.35;
    else if (level === 2) scale = 0.50;
    else if (level === 3) scale = 0.65;
    else if (level === 4) scale = 0.80; // 80% screen width and height in Restore mode

    const w = Math.floor(availW * scale);
    const h = Math.floor(availH * scale);

    // Try outer window resizeTo
    try {
      window.resizeTo(w, h);
      window.moveTo(0, 0);
    } catch (e) {
      console.warn('Window resize restricted by browser:', e);
    }

    setTimeout(adjustFontSizeToViewport, 50);
    setTimeout(adjustFontSizeToViewport, 150);
  }

  // --- Fullscreen Toggle ---
  function toggleFullscreen() {
    blurActiveElements();

    if (appContainer) {
      appContainer.style.maxWidth = '100%';
      appContainer.style.margin = '0';
    }

    // If currently in PiP mode:
    // Chrome forbids HTML Fullscreen inside PiP popup windows.
    // 5 key smoothly restores to main window and enters 100% TRUE HTML FULLSCREEN on main window!
    if (pipWindow) {
      try {
        pipWindow.moveTo(20000, 20000); // Move PiP off-screen immediately so no ghost box appears
      } catch (e) {}
      restoreFromPiP();
      setTimeout(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }, 100);
      return;
    }

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error in main window:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(e => {});
      }
    }
  }

  // --- Fullscreen change listener to prevent parent window overlap ---
  function handleFullscreenChange() {
    const isPiPFullscreen = pipWindow && pipWindow.document && pipWindow.document.fullscreenElement;
    if (isPiPFullscreen) {
      // Move parent window completely off-screen so it does not overlap top-left of Fullscreen PiP
      try {
        window.moveTo(window.screen.availWidth + 2000, window.screen.availHeight + 2000);
      } catch (e) {}
    } else if (pipWindow) {
      // When exiting Fullscreen while still in PiP mode, bring parent window back to top-left (420x140)
      try {
        window.resizeTo(420, 140);
        window.moveTo(0, 0);
      } catch (e) {}
    }
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange);

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

      // Enable keyboard shortcuts, fullscreen & resize listeners when focused on the PiP window
      pipWindow.addEventListener('keydown', handleKeyDown);
      pipWindow.document.addEventListener('keydown', handleKeyDown);
      pipWindow.document.addEventListener('fullscreenchange', handleFullscreenChange);
      pipWindow.addEventListener('resize', adjustFontSizeToViewport);
      try {
        pipWindow.focus();
      } catch (e) {}

      // Reset PiP document & body layout styles
      try {
        pipWindow.document.documentElement.style.width = '100%';
        pipWindow.document.documentElement.style.height = '100%';
        pipWindow.document.documentElement.style.overflow = 'hidden';
        pipWindow.document.documentElement.setAttribute('data-theme', currentTheme);
        pipWindow.document.body.style.width = '100%';
        pipWindow.document.body.style.height = '100%';
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.padding = '0';
        pipWindow.document.body.style.overflow = 'hidden';
        pipWindow.document.body.setAttribute('data-theme', currentTheme);
        pipWindow.document.body.style.background = 'var(--bg-canvas, #020617)';
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
        window.resizeTo(420, 140);
        window.moveTo(0, 0);
      } catch (e) {}

      pipWindow.addEventListener('pagehide', () => {
        restoreFromPiP();
      });

      // Immediately calculate font size for PiP window dimensions
      adjustFontSizeToViewport();
      setTimeout(adjustFontSizeToViewport, 50);
      setTimeout(adjustFontSizeToViewport, 150);

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
        pipWindow.moveTo(20000, 20000);
        pipWindow.removeEventListener('keydown', handleKeyDown);
        pipWindow.removeEventListener('resize', adjustFontSizeToViewport);
        pipWindow.document.removeEventListener('keydown', handleKeyDown);
        pipWindow.document.removeEventListener('fullscreenchange', handleFullscreenChange);
        pipWindow.close();
      } catch (e) {}
      pipWindow = null;
    }

    try {
      window.resizeTo(originalWidth, originalHeight);
      window.moveTo(0, 0);
    } catch (e) {}

    updateDisplay();
    setTimeout(adjustFontSizeToViewport, 50);
    setTimeout(adjustFontSizeToViewport, 150);
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

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', toggleTheme);
  }

  if (btnThemeMenu) {
    btnThemeMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThemePopover();
    });
  }

  if (btnCloseThemePopover) {
    btnCloseThemePopover.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThemePopover(false);
    });
  }

  if (btnAlarmMenu) {
    btnAlarmMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAlarmPopover();
    });
  }

  if (btnCloseAlarmPopover) {
    btnCloseAlarmPopover.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAlarmPopover(false);
    });
  }

  // Volume slider event
  if (alarmVolumeSlider) {
    alarmVolumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      alarmVolume = val / 100;
      if (alarmVolumeValue) alarmVolumeValue.textContent = `${val}%`;
      try {
        localStorage.setItem('05timer_alarm_volume', String(alarmVolume));
      } catch (err) {}
    });
  }

  // Custom audio file input handling
  if (btnAddAlarmFile && alarmFileInput) {
    btnAddAlarmFile.addEventListener('click', () => {
      alarmFileInput.click();
    });

    alarmFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (readEvt) => {
        const dataUrl = readEvt.target.result;
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        const newSound = {
          id: 'custom-' + Date.now(),
          name: cleanName,
          category: 'custom',
          tag: '내 MP3',
          dataUrl: dataUrl,
          desc: `로컬 파일 (${(file.size / 1024).toFixed(0)}KB)`,
          isCustom: true
        };
        customSounds.push(newSound);
        saveCustomSounds();
        selectAlarmSound(newSound.id);
        renderAlarmSoundsList();
        playAlarmSound(newSound.id, true);
      };
      reader.readAsDataURL(file);
      alarmFileInput.value = '';
    });
  }

  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (themePopover && !themePopover.classList.contains('hidden')) {
      if (!themePopover.contains(e.target) && (!btnThemeMenu || !btnThemeMenu.contains(e.target))) {
        toggleThemePopover(false);
      }
    }
    if (alarmPopover && !alarmPopover.classList.contains('hidden')) {
      if (!alarmPopover.contains(e.target) && (!btnAlarmMenu || !btnAlarmMenu.contains(e.target))) {
        toggleAlarmPopover(false);
      }
    }
  });

  // Theme cards selection
  themeCardBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.themeId;
      if (themeId) {
        playClickSound();
        applyTheme(themeId);
        toggleThemePopover(false);
      }
    });
  });

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
      const totalSecs = getButtonSeconds(btn);
      const label = btn.textContent.trim();
      setPresetTime(totalSecs, label);
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

    // Escape: close theme or alarm popover if open
    if (code === 'Escape' || key === 'Escape') {
      let handled = false;
      if (themePopover && !themePopover.classList.contains('hidden')) {
        toggleThemePopover(false);
        handled = true;
      }
      if (alarmPopover && !alarmPopover.classList.contains('hidden')) {
        toggleAlarmPopover(false);
        handled = true;
      }
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    // Day / Night Theme Toggle (D)
    if (code === 'KeyD' || key === 'd' || key === 'D' || key === 'ㅇ') {
      e.preventDefault();
      blurActiveElements();
      toggleTheme();
      return;
    }

    // Theme Menu Popover (M)
    if (code === 'KeyM' || key === 'm' || key === 'M' || key === 'ㅡ') {
      e.preventDefault();
      blurActiveElements();
      toggleThemePopover();
      return;
    }

    // Alarm Sound Menu Popover (A)
    if (code === 'KeyA' || key === 'a' || key === 'A' || key === 'ㅁ') {
      e.preventDefault();
      blurActiveElements();
      toggleAlarmPopover();
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
  try {
    const savedTheme = localStorage.getItem('05timer_theme');
    if (savedTheme) {
      currentTheme = savedTheme;
    }
  } catch (e) {}
  applyTheme(currentTheme);

  // Load saved alarm sound & volume
  loadCustomSounds();
  try {
    const savedSound = localStorage.getItem('05timer_alarm_sound_id');
    if (savedSound) {
      currentAlarmSoundId = savedSound;
    } else {
      currentAlarmSoundId = 'mp3-yarsong'; // default to user's mp3 alarm
    }
    const savedVol = localStorage.getItem('05timer_alarm_volume');
    if (savedVol !== null) {
      const v = parseFloat(savedVol);
      if (!isNaN(v) && v >= 0 && v <= 1) {
        alarmVolume = v;
      }
    }
  } catch (e) {}

  if (alarmVolumeSlider) {
    alarmVolumeSlider.value = Math.round(alarmVolume * 100);
  }
  if (alarmVolumeValue) {
    alarmVolumeValue.textContent = `${Math.round(alarmVolume * 100)}%`;
  }
  renderAlarmSoundsList();

  setPresetMinutes(5);
  updateDisplay();
})();
