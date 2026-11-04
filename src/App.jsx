import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { 
  Sparkles, Users, Bot, Play, Volume2, VolumeX, Copy, Check, 
  Settings, HelpCircle, RefreshCw, Clock, Send, Shield, Zap, 
  Award, BookOpen, Radio, Plus, Trash2, Globe, Laptop, LogOut
} from 'lucide-react';
import {
  BOT_PERSONAS,
  buildLocalDirectedScript,
  directStory,
  generateLocalBotWord,
  generateBotWord
} from './aiAgents';

// ============================================================================
// 1. FIREBASE CONFIGURATION (Connected to multiplayer-bd6af)
// ============================================================================
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC98ECdsi_EY_PEH0vUHiUpnxZ54wxfV50",
  authDomain: "multiplayer-bd6af.firebaseapp.com",
  projectId: "multiplayer-bd6af",
  storageBucket: "multiplayer-bd6af.firebasestorage.app",
  messagingSenderId: "319863603791",
  appId: "1:319863603791:web:f6278fce3f73c105e8e03a",
  measurementId: "G-GDQCKQMLXD"
};

let db = null;
let auth = null;
const isFirebaseConfigured = DEFAULT_FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY";
const LLM_ENV_CONFIG = {
  geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  geminiModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
  groqKey: import.meta.env.VITE_GROQ_API_KEY || '',
  grokKey: import.meta.env.VITE_GROK_API_KEY || '',
  openRouterKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  openRouterModel: import.meta.env.VITE_OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free'
};

function getFirebaseErrorMessage(error, action) {
  const code = error?.code || 'unknown error';
  const details = {
    'auth/operation-not-allowed': 'Enable Anonymous sign-in in Firebase Console > Authentication > Sign-in method.',
    'auth/unauthorized-domain': 'Add this site’s hostname under Firebase Console > Authentication > Settings > Authorized domains.',
    'auth/invalid-api-key': 'Check that the Firebase web API key in the app matches the Firebase project.',
    'auth/network-request-failed': 'The request could not reach Firebase. Check the network, browser extensions, and firewall.',
    'permission-denied': 'Firestore rejected the request. Check the Firestore security rules for authenticated room access.',
    'firestore/permission-denied': 'Firestore rejected the request. Check the Firestore security rules for authenticated room access.'
  };
  return `Firebase ${action} failed (${code}). ${details[code] || 'Check the Firebase project configuration and browser console for details.'}`;
}

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.warn("Firebase fallback to local mode:", err);
  }
}

// ============================================================================
// 3. ZERO-COST WEB AUDIO API SOUND SYNTHESIZER
// ============================================================================
class SoundEffectsEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type, muted = false) {
    if (muted || !type || type === 'none') return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'suspense') {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(95, now);
        osc1.frequency.linearRampToValueAtTime(102, now + 0.75);
        osc2.frequency.setValueAtTime(100, now);
        osc2.frequency.linearRampToValueAtTime(108, now + 0.75);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.85);
        osc2.stop(now + 0.85);
      } else if (type === 'boing') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.34);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'boom') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.7);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      } else if (type === 'gasp') {
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(1300, now + 0.35);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
      } else if (type === 'applause') {
        for (let i = 0; i < 14; i++) {
          const offset = i * 0.085;
          const bufferSize = this.ctx.sampleRate * 0.08;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let j = 0; j < bufferSize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.4));
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 950 + Math.random() * 600;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.14, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          noise.start(now + offset);
        }
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }
}

const sfxEngine = new SoundEffectsEngine();

// ============================================================================
// 6. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'lobby' | 'game' | 'finale'
  const [mode, setMode] = useState('sandbox'); // 'sandbox' | 'online'
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [playerName, setPlayerName] = useState('Player 1');
  const [playerEmoji, setPlayerEmoji] = useState('😎');
  const [userId, setUserId] = useState('local-host');
  const [authStatus, setAuthStatus] = useState(() =>
    !isFirebaseConfigured ? 'unconfigured' : auth && db ? 'connecting' : 'failed'
  );
  const [roomError, setRoomError] = useState('');
  const [aiNotice, setAiNotice] = useState('');
  const [leavingRoom, setLeavingRoom] = useState(false);

  const [showAIModal, setShowAIModal] = useState(false);
  const [showHostingModal, setShowHostingModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [aiSettings, setAiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ows_ai_settings');
      const defaults = {
        useZeroKeyCloud: true,
        ...LLM_ENV_CONFIG
      };
      if (!saved) return defaults;
      const savedSettings = JSON.parse(saved);
      return {
        ...defaults,
        ...savedSettings,
        geminiKey: savedSettings.geminiKey || defaults.geminiKey,
        groqKey: savedSettings.groqKey || defaults.groqKey,
        openRouterKey: savedSettings.openRouterKey || defaults.openRouterKey
      };
    } catch {
      return { useZeroKeyCloud: true, ...LLM_ENV_CONFIG };
    }
  });

  const [roomState, setRoomState] = useState({
    hostId: 'local-host',
    status: 'lobby',
    sessionMode: '5min',
    llmEnabled: false,
    sessionSecondsTotal: 300,
    turnSecondsMax: 30,
    currentTurnIndex: 0,
    players: [
      { id: 'local-host', name: 'Player 1', isBot: false, emoji: '😎' },
      { id: 'bot-1', name: 'Grammar Glue', isBot: true, personaId: 'grammar', emoji: '🤖' },
      { id: 'bot-2', name: 'Chaotic Goblin', isBot: true, personaId: 'goblin', emoji: '🤪' }
    ],
    story: [],
    finaleState: {
      isPlaying: false,
      triggerId: 0,
      directedScript: []
    }
  });

  const [sessionRemaining, setSessionRemaining] = useState(300);
  const [turnRemaining, setTurnRemaining] = useState(30);
  const [wordDraft, setWordDraft] = useState('');
  const [selectedPunc, setSelectedPunc] = useState('');
  const [botThinking, setBotThinking] = useState(false);
  const [newHumanName, setNewHumanName] = useState('');

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [activeEmotionBadge, setActiveEmotionBadge] = useState(null);
  const lastTriggerRef = useRef(0);
  const finishInProgressRef = useRef(false);
  const roomStateRef = useRef(roomState);
  roomStateRef.current = roomState;

  useEffect(() => {
    try {
      localStorage.setItem('ows_ai_settings', JSON.stringify(aiSettings));
    } catch {}
  }, [aiSettings]);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (u) {
          setUserId(u.uid);
          setAuthStatus('ready');
        }
      });
      signInAnonymously(auth)
        .then(({ user }) => {
          setUserId(user.uid);
          setAuthStatus('ready');
          setRoomError('');
        })
        .catch(error => {
          console.warn('Firebase sign-in failed:', error);
          if (auth.currentUser) {
            setUserId(auth.currentUser.uid);
            setAuthStatus('ready');
            return;
          }
          setAuthStatus('failed');
          setRoomError(getFirebaseErrorMessage(error, 'anonymous sign-in'));
        });
      return unsubscribe;
    }
    setAuthStatus(isFirebaseConfigured ? 'failed' : 'unconfigured');
    if (isFirebaseConfigured) {
      setRoomError('Firebase could not initialize. Check the Firebase web configuration.');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setAvailableVoices(v);
        const preferred = v.find(voice => /Google|Natural|English/i.test(voice.name)) || v[0];
        if (preferred && !selectedVoiceURI) setSelectedVoiceURI(preferred.voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceURI]);

  useEffect(() => {
    if (mode !== 'online' || !roomCode || !isFirebaseConfigured || !db) return;
    const roomRef = doc(db, 'ows_rooms', roomCode);
    const unsub = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'closed') {
          setRoomState(data);
          setRoomCode('');
          setMode('sandbox');
          setScreen('home');
          setRoomError('This room was closed because no human players remained.');
          return;
        }
        if (data.sessionMode === 'words40') data.sessionMode = '40min';
        data.llmEnabled = data.llmEnabled === true;
        setRoomState(data);
        if (data.status === 'playing' && screen !== 'game') setScreen('game');
        if (data.status === 'finale' && screen !== 'finale') setScreen('finale');
        if (data.status === 'lobby' && screen !== 'lobby') setScreen('lobby');
      }
    }, error => {
      console.warn('Firestore room listener error:', error);
      setRoomError('Lost the room connection. Check your network and try again.');
    });
    return () => unsub();
  }, [mode, roomCode, screen]);

  const syncRoomUpdate = async (updater) => {
    if (mode === 'online' && roomCode && isFirebaseConfigured && db) {
      try {
        const ref = doc(db, 'ows_rooms', roomCode);
        const nextState = await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(ref);
          if (!snap.exists()) throw new Error('Room no longer exists.');
          const current = snap.data();
          const updated = typeof updater === 'function' ? updater(current) : updater;
          transaction.set(ref, updated);
          return updated;
        });
        setRoomState(nextState);
      } catch (e) {
        console.warn("Firestore sync error:", e);
        setRoomError('Could not sync this room. Please try again.');
      }
      return;
    }
    setRoomState(current => typeof updater === 'function' ? updater(current) : updater);
  };

  const isHost = mode === 'sandbox' || roomState.hostId === userId;
  const activePlayer = roomState.players[roomState.currentTurnIndex] || roomState.players[0];
  const canSubmitTurn = Boolean(activePlayer && !activePlayer.isBot &&
    (mode === 'sandbox' || activePlayer.id === userId));

  const startSandboxLobby = () => {
    setMode('sandbox');
    const code = 'PARTY' + Math.floor(10 + Math.random() * 89);
    setRoomCode(code);
    setRoomState(prev => ({
      ...prev,
      hostId: userId,
      status: 'lobby',
      sessionMode: '5min',
      llmEnabled: false,
      sessionSecondsTotal: 300,
      turnSecondsMax: 30,
      currentTurnIndex: 0,
      players: [
        { id: userId, name: playerName.trim() || 'Player 1', isBot: false, emoji: playerEmoji },
        { id: 'bot-1', name: 'Grammar Glue', isBot: true, personaId: 'grammar', emoji: '🤖' },
        { id: 'bot-2', name: 'Chaotic Goblin', isBot: true, personaId: 'goblin', emoji: '🤪' }
      ],
      story: [],
      finaleState: { isPlaying: false, triggerId: 0, directedScript: [] }
    }));
    setScreen('lobby');
  };

  const createOnlineRoom = async () => {
    setRoomError('');
    if (authStatus !== 'ready' || !db || !auth?.currentUser) {
      setRoomError('Online play requires Firebase anonymous sign-in. Enable Anonymous sign-in in Firebase Console and wait until the connection is ready.');
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const initial = {
      hostId: userId,
      status: 'lobby',
      sessionMode: '5min',
      llmEnabled: false,
      sessionSecondsTotal: 300,
      turnSecondsMax: 30,
      currentTurnIndex: 0,
      players: [
        { id: userId, name: playerName.trim() || 'Host', isBot: false, emoji: playerEmoji },
        { id: 'bot-1', name: 'Grammar Glue', isBot: true, personaId: 'grammar', emoji: '🤖' }
      ],
      story: [],
      finaleState: { isPlaying: false, triggerId: 0, directedScript: [] }
    };
    try {
      await setDoc(doc(db, 'ows_rooms', code), initial);
      setRoomCode(code);
      setRoomState(initial);
      setMode('online');
      setScreen('lobby');
    } catch (error) {
      console.warn('Firebase room creation failed:', error);
      setRoomError(getFirebaseErrorMessage(error, 'room creation'));
    }
  };

  const joinOnlineRoom = async () => {
    setRoomError('');
    if (authStatus !== 'ready' || !db || !auth?.currentUser) {
      setRoomError('Online play requires Firebase anonymous sign-in. Enable Anonymous sign-in in Firebase Console and wait until the connection is ready.');
      return;
    }
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    if (isFirebaseConfigured && db) {
      const ref = doc(db, 'ows_rooms', cleanCode);
      try {
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setRoomError('Room not found. Check the room code and try again.');
          return;
        }
        await runTransaction(db, async transaction => {
          const currentSnap = await transaction.get(ref);
          if (!currentSnap.exists()) throw new Error('Room no longer exists.');
          const current = currentSnap.data();
          if (current.status !== 'lobby') throw new Error('This game has already started.');
          const exists = current.players.some(p => p.id === userId);
          if (!exists && current.players.length >= 10) throw new Error('Room is full (Max 10 players)!');
          if (!exists) {
            transaction.update(ref, {
              players: [...current.players, {
                id: userId,
                name: playerName.trim() || `Player ${current.players.length + 1}`,
                isBot: false,
                emoji: playerEmoji
              }]
            });
          }
        });
        setRoomCode(cleanCode);
        setMode('online');
        setScreen('lobby');
      } catch (error) {
        console.warn('Firebase room join failed:', error);
        setRoomError(error.code
          ? getFirebaseErrorMessage(error, 'room join')
          : error.message || 'Could not join this room.');
      }
    }
  };

  const addBotToLobby = () => {
    if (roomState.players.length >= 10) return;
    const nextPersona = BOT_PERSONAS[roomState.players.length % BOT_PERSONAS.length];
    const newBot = {
      id: 'bot-' + Date.now() + '-' + Math.floor(Math.random() * 999),
      name: nextPersona.name,
      isBot: true,
      personaId: nextPersona.id,
      emoji: nextPersona.emoji
    };
    syncRoomUpdate(prev => ({
      ...prev,
      players: [...prev.players, newBot]
    }));
  };

  const addLocalHumanToLobby = () => {
    if (roomState.players.length >= 10) return;
    const emojis = ['🔥', '🌟', '🦊', '🐼', '🐯', '🐸', '🐙', '🦄'];
    const name = newHumanName.trim() || `Player ${roomState.players.length + 1}`;
    const newHuman = {
      id: 'local-human-' + Date.now(),
      name,
      isBot: false,
      emoji: emojis[roomState.players.length % emojis.length]
    };
    setNewHumanName('');
    syncRoomUpdate(prev => ({
      ...prev,
      players: [...prev.players, newHuman]
    }));
  };

  const cycleBotPersona = (botId) => {
    syncRoomUpdate(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id !== botId) return p;
        const idx = BOT_PERSONAS.findIndex(b => b.id === p.personaId);
        const next = BOT_PERSONAS[(idx + 1) % BOT_PERSONAS.length];
        return { ...p, name: next.name, personaId: next.id, emoji: next.emoji };
      })
    }));
  };

  const removePlayer = (id) => {
    if (roomState.players.length <= 2) return;
    syncRoomUpdate(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }));
  };

  const startMatch = () => {
    if (roomState.players.length < 2) return;
    const sessionDurations = { '5min': 300, '10min': 600, '20min': 1200, '40min': 2400 };
    const sessionMode = roomState.sessionMode === 'words40' ? '40min' : roomState.sessionMode;
    const totalSecs = sessionDurations[sessionMode] || 300;
    const now = Date.now();
    setSessionRemaining(totalSecs);
    setTurnRemaining(roomState.turnSecondsMax);
    syncRoomUpdate(prev => ({
      ...prev,
      status: 'playing',
      sessionMode,
      sessionSecondsTotal: totalSecs,
      sessionDeadlineAt: now + totalSecs * 1000,
      turnDeadlineAt: now + prev.turnSecondsMax * 1000,
      currentTurnIndex: 0,
      story: [],
      finaleState: { isPlaying: false, triggerId: 0, directedScript: [] }
    }));
    setScreen('game');
  };

  const submitSingleWord = async (rawWord, playerObj) => {
    const clean = (rawWord || '').trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9'-.,!?]/g, '');
    if (!clean) return;

    const finalWord = selectedPunc && !/[.,!?]$/.test(clean) ? `${clean}${selectedPunc}` : clean;
    const appendWord = current => {
      if (current.status !== 'playing') throw new Error('This game is not accepting words.');
      const active = current.players[current.currentTurnIndex];
      if (!active || active.id !== playerObj.id) throw new Error('It is not this player’s turn.');
      if (active.isBot ? current.hostId !== userId : mode === 'online' && active.id !== userId) {
        throw new Error('Only the active player can submit a word.');
      }
      const now = Date.now();
      if (current.sessionDeadlineAt <= now || current.turnDeadlineAt <= now) {
        throw new Error('This turn has expired.');
      }
      const nextTurn = (current.currentTurnIndex + 1) % current.players.length;
      return {
        ...current,
        story: [...current.story, {
          word: finalWord,
          playerId: active.id,
          playerName: active.name,
          emoji: active.emoji,
          isBot: active.isBot,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }],
        currentTurnIndex: nextTurn,
        turnDeadlineAt: now + current.turnSecondsMax * 1000
      };
    };

    try {
      if (mode === 'online' && roomCode && db) {
        const ref = doc(db, 'ows_rooms', roomCode);
        const updated = await runTransaction(db, async transaction => {
          const snap = await transaction.get(ref);
          if (!snap.exists()) throw new Error('Room no longer exists.');
          const nextState = appendWord(snap.data());
          transaction.set(ref, nextState);
          return nextState;
        });
        setRoomState(updated);
      } else {
        setRoomState(appendWord(roomStateRef.current));
      }
      setWordDraft('');
      setSelectedPunc('');
      setRoomError('');
    } catch (error) {
      setRoomError(error.message || 'Could not submit that word.');
    }
  };

  useEffect(() => {
    if (screen !== 'game' || roomState.status !== 'playing') return;
    const interval = setInterval(() => {
      const current = roomStateRef.current;
      const now = Date.now();
      const sessionLeft = Math.max(0, Math.ceil(((current.sessionDeadlineAt || now) - now) / 1000));
      const turnLeft = Math.max(0, Math.ceil(((current.turnDeadlineAt || now) - now) / 1000));
      setSessionRemaining(sessionLeft);
      setTurnRemaining(turnLeft);
      if (!isHost) return;
      if (sessionLeft === 0) {
        finishAndLaunchFinale();
        return;
      }
      if (turnLeft === 0) {
        const skipExpiredTurn = async () => {
          try {
            if (mode === 'online' && roomCode && db) {
              const ref = doc(db, 'ows_rooms', roomCode);
              const updated = await runTransaction(db, async transaction => {
                const snap = await transaction.get(ref);
                if (!snap.exists()) throw new Error('Room no longer exists.');
                const latest = snap.data();
                if (latest.status !== 'playing' || latest.turnDeadlineAt > Date.now()) return null;
                const nextTurn = (latest.currentTurnIndex + 1) % latest.players.length;
                const nextState = {
                  ...latest,
                  currentTurnIndex: nextTurn,
                  turnDeadlineAt: Date.now() + latest.turnSecondsMax * 1000
                };
                transaction.set(ref, nextState);
                return nextState;
              });
              if (updated) setRoomState(updated);
            } else {
              setRoomState(latest => {
                if (latest.status !== 'playing' || latest.turnDeadlineAt > Date.now()) return latest;
                return {
                  ...latest,
                  currentTurnIndex: (latest.currentTurnIndex + 1) % latest.players.length,
                  turnDeadlineAt: Date.now() + latest.turnSecondsMax * 1000
                };
              });
            }
          } catch (error) {
            console.warn('Could not advance expired turn:', error);
            setRoomError('Could not advance the expired turn. Please check the connection.');
          }
        };
        skipExpiredTurn();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, roomState.status, isHost, mode, roomCode]);

  useEffect(() => {
    if (screen !== 'game' || roomState.status !== 'playing') return;
    if (!activePlayer || !activePlayer.isBot || !isHost) return;

    let cancelled = false;
    setBotThinking(true);

    const runBotTurn = async () => {
      await new Promise(r => setTimeout(r, 950));
      if (cancelled) return;

      let aiWord;
      try {
        aiWord = roomState.llmEnabled
          ? await generateBotWord(
            roomState.story,
            activePlayer.personaId,
            aiSettings,
            message => { if (!cancelled) setAiNotice(message); }
          )
          : generateLocalBotWord(roomState.story, activePlayer.personaId);
      } catch (error) {
        console.warn('Bot word generation failed:', error);
        setAiNotice('AI generation failed unexpectedly. Using the local storyteller instead.');
        aiWord = generateLocalBotWord(roomState.story, activePlayer.personaId);
      }

      if (!cancelled) {
        setBotThinking(false);
        submitSingleWord(aiWord, activePlayer);
      }
    };

    runBotTurn();
    return () => { cancelled = true; };
  }, [screen, roomState.status, roomState.currentTurnIndex, roomState.llmEnabled, aiSettings]);

  const finishAndLaunchFinale = async (storyList) => {
    if (finishInProgressRef.current || roomStateRef.current.status !== 'playing') return;
    finishInProgressRef.current = true;
    const finalizeText = story => {
      const finalStory = [...story];
      if (finalStory.length > 0) {
        const lastIdx = finalStory.length - 1;
        if (!/[.!?]$/.test(finalStory[lastIdx].word)) {
          finalStory[lastIdx] = {
            ...finalStory[lastIdx],
            word: finalStory[lastIdx].word.replace(/[,]+$/, '') + '.'
          };
        }
      }
      return finalStory;
    };
    const startingStory = storyList || roomStateRef.current.story;
    const finalStory = finalizeText(startingStory);
    const script = roomStateRef.current.llmEnabled
      ? await directStory(finalStory, aiSettings)
      : buildLocalDirectedScript(finalStory);

    const triggerId = Date.now();
    try {
      if (mode === 'online' && roomCode && db) {
        const ref = doc(db, 'ows_rooms', roomCode);
        const updated = await runTransaction(db, async transaction => {
          const snap = await transaction.get(ref);
          if (!snap.exists()) throw new Error('Room no longer exists.');
          const current = snap.data();
          if (current.status !== 'playing') return current;
          const authoritativeStory = finalizeText(current.story || []);
          const directedScript = current.story.length === startingStory.length
            ? script
            : buildLocalDirectedScript(authoritativeStory);
          const nextState = {
            ...current,
            status: 'finale',
            story: authoritativeStory,
            finaleState: { isPlaying: true, triggerId, directedScript }
          };
          transaction.set(ref, nextState);
          return nextState;
        });
        setRoomState(updated);
      } else {
        const current = roomStateRef.current;
        const authoritativeStory = finalizeText(current.story || []);
        setRoomState({
          ...current,
          status: 'finale',
          story: authoritativeStory,
          finaleState: {
            isPlaying: true,
            triggerId,
            directedScript: current.story.length === startingStory.length
              ? script
              : buildLocalDirectedScript(authoritativeStory)
          }
        });
      }
      setScreen('finale');
    } catch (error) {
      console.warn('Could not finish the story:', error);
      setRoomError('Could not finish the game. Please check the connection and try again.');
    } finally {
      finishInProgressRef.current = false;
    }
  };

  useEffect(() => {
    if (screen !== 'finale') return;
    const fState = roomState.finaleState;
    if (!fState || !fState.triggerId || fState.triggerId === lastTriggerRef.current) return;
    lastTriggerRef.current = fState.triggerId;
    playExpressiveStory(fState.directedScript || buildLocalDirectedScript(roomState.story));
  }, [screen, roomState.finaleState]);

  const playExpressiveStory = async (scriptToPlay) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const script = scriptToPlay?.length ? scriptToPlay : buildLocalDirectedScript(roomState.story);
    for (let i = 0; i < script.length; i++) {
      const item = script[i];
      setActiveSentenceIdx(i);
      setActiveEmotionBadge(item);

      if (item.sfx && item.sfx !== 'none') {
        sfxEngine.play(item.sfx, isMuted);
      }

      await new Promise(r => setTimeout(r, item.pauseMs || 350));

      if (!isMuted) {
        await new Promise((resolve) => {
          const utter = new SpeechSynthesisUtterance(item.text);
          const chosenVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
          if (chosenVoice) utter.voice = chosenVoice;
          utter.pitch = Math.max(0.5, Math.min(1.6, Number(item.pitch) || 1.0));
          utter.rate = Math.max(0.7, Math.min(1.4, Number(item.rate) || 1.0));
          utter.onend = () => resolve();
          utter.onerror = () => resolve();
          window.speechSynthesis.speak(utter);
        });
      } else {
        await new Promise(r => setTimeout(r, 1800));
      }
    }

    sfxEngine.play('applause', isMuted);
    setActiveSentenceIdx(-1);
  };

  const broadcastReplay = () => {
    const script = roomState.finaleState?.directedScript?.length
      ? roomState.finaleState.directedScript
      : buildLocalDirectedScript(roomState.story);
    syncRoomUpdate(prev => ({
      ...prev,
      finaleState: {
        isPlaying: true,
        triggerId: Date.now(),
        directedScript: script
      }
    }));
  };

  const copyTranscript = () => {
    const storyStr = roomState.story.map(s => s.word).join(' ');
    const cast = roomState.players.map(p => `${p.emoji} ${p.name}`).join(', ');
    navigator.clipboard.writeText(`📖 ONE WORD STORY\n\n"${storyStr}"\n\n🎭 Cast: ${cast}`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const formatClock = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const leaveRoom = async () => {
    if (leavingRoom) return;
    setRoomError('');
    setLeavingRoom(true);

    try {
      if (mode === 'online' && roomCode && db) {
        const roomRef = doc(db, 'ows_rooms', roomCode);
        await runTransaction(db, async transaction => {
          const snap = await transaction.get(roomRef);
          if (!snap.exists()) return;

          const current = snap.data();
          const leavingIndex = current.players.findIndex(player => player.id === userId);
          if (leavingIndex < 0) return;

          const players = current.players.filter(player => player.id !== userId);
          if (players.length === 0 || !players.some(player => !player.isBot)) {
            transaction.update(roomRef, {
              players: [],
              status: 'closed',
              hostId: null
            });
            return;
          }

          const nextHost = current.hostId === userId
            ? players.find(player => !player.isBot)
            : null;
          const currentTurnIndex = current.currentTurnIndex > leavingIndex
            ? current.currentTurnIndex - 1
            : current.currentTurnIndex === leavingIndex
              ? leavingIndex % players.length
              : current.currentTurnIndex;
          const turnWasRemoved = current.currentTurnIndex === leavingIndex;
          transaction.update(roomRef, {
            players,
            hostId: nextHost?.id || current.hostId,
            currentTurnIndex,
            ...(turnWasRemoved && current.status === 'playing'
              ? { turnDeadlineAt: Date.now() + current.turnSecondsMax * 1000 }
              : {})
          });
        });
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setMode('sandbox');
      setRoomCode('');
      setScreen('home');
      setWordDraft('');
      setSelectedPunc('');
      setBotThinking(false);
    } catch (error) {
      console.warn('Could not leave multiplayer room:', error);
      setRoomError(getFirebaseErrorMessage(error, 'leaving the room'));
    } finally {
      setLeavingRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={leaveRoom}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
            aria-label={screen === 'home' ? 'Go to home' : 'Leave room and go home'}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-amber-200 bg-clip-text text-transparent">
                One Word Story
              </h1>
              <p className="text-[11px] text-slate-400">2–10 Players • Online Multiplayer • Live TTS</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {screen !== 'home' && (
              <button
                type="button"
                onClick={leaveRoom}
                disabled={leavingRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 disabled:opacity-50 text-xs font-medium text-rose-200 border border-rose-500/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                {leavingRoom ? 'Leaving...' : 'Leave Room'}
              </button>
            )}
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-indigo-300 border border-indigo-500/30 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Free AI Router
            </button>
            <button
              onClick={() => setShowHostingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 border border-emerald-500/30 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Free Hosting
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {roomError && (
          <div role="alert" className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/60 px-4 py-3 text-sm text-rose-200">
            {roomError}
          </div>
        )}
        {aiNotice && (
          <div role="status" aria-live="polite" className="mb-5 rounded-xl border border-amber-500/40 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">
            {aiNotice}
          </div>
        )}
        {screen === 'home' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Multiplayer Room Connected (multiplayer-bd6af)
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                One Word at a Time. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                  Infinite Chaos.
                </span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Collaborate with 2 to 10 players across different devices using real-time Firestore room codes.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Your Display Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={24}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Choose Your Emoji
                </span>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Choose your player emoji">
                  {['😎', '😀', '🦊', '🐼', '🐯', '🐸', '🐙', '🦄', '🔥', '🌟', '🚀', '🎉'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Choose ${emoji}`}
                      aria-pressed={playerEmoji === emoji}
                      onClick={() => setPlayerEmoji(emoji)}
                      className={`h-10 w-10 rounded-xl border text-xl transition ${
                        playerEmoji === emoji
                          ? 'border-indigo-400 bg-indigo-600/30'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-600'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-b from-indigo-950/50 to-slate-950 border border-indigo-500/40 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold">
                      <Laptop className="w-5 h-5" /> Couch Party Sandbox
                    </div>
                    <p className="text-xs text-slate-400">
                      Play instantly on one screen with local bots and players.
                    </p>
                  </div>
                  <button
                    onClick={startSandboxLobby}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Start Sandbox Lobby
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Globe className="w-5 h-5" /> Online Multiplayer Room
                    </div>
                    <p className="text-xs text-slate-400">
                      Create or join a synced room code across devices.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={createOnlineRoom}
                      disabled={authStatus !== 'ready'}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition"
                    >
                      {authStatus === 'ready'
                        ? 'Create Online Room'
                        : authStatus === 'connecting'
                          ? 'Connecting...'
                          : 'Online Unavailable'}
                    </button>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        placeholder="CODE (e.g. WORD42)"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs uppercase tracking-widest font-mono text-white"
                      />
                      <button
                        onClick={joinOnlineRoom}
                        disabled={authStatus !== 'ready'}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === 'lobby' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
                    {mode === 'online' ? 'Online Multiplayer Room' : 'Party Sandbox Lobby'}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl font-black text-white font-mono tracking-wider">{roomCode}</h2>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                      {roomState.players.length} / 10 Seats
                    </span>
                  </div>
                </div>

                {isHost && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addBotToLobby}
                      disabled={roomState.players.length >= 10}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white transition"
                    >
                      <Bot className="w-4 h-4" /> + Add AI Bot
                    </button>
                  </div>
                )}
              </div>

              {isHost && roomState.players.length < 10 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHumanName}
                    onChange={(e) => setNewHumanName(e.target.value)}
                    placeholder="Add human player seat..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    onClick={addLocalHumanToLobby}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Seat
                  </button>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {roomState.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                        {p.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{p.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            Turn #{idx + 1}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {p.isBot ? 'AI Bot' : 'Human Player'}
                        </p>
                      </div>
                    </div>

                    {isHost && (
                      <div className="flex items-center gap-1.5">
                        {p.isBot && (
                          <button
                            onClick={() => cycleBotPersona(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold transition"
                          >
                            Swap Style
                          </button>
                        )}
                        {roomState.players.length > 2 && (
                          <button
                            onClick={() => removePlayer(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Session Rules
                </h3>

                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">Allow LLM bot turns</p>
                      <p className="text-[11px] text-slate-400">
                        {roomState.llmEnabled
                          ? 'Bots and finale direction can use the configured language model.'
                          : 'Bots and finale direction use local logic; no LLM calls are made.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={roomState.llmEnabled === true}
                      disabled={!isHost}
                      onClick={() => syncRoomUpdate(prev => ({
                        ...prev,
                        llmEnabled: !prev.llmEnabled
                      }))}
                      className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        roomState.llmEnabled
                          ? 'border-emerald-400 bg-emerald-500'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                      aria-label="Allow LLM bot turns"
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                          roomState.llmEnabled ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  {!isHost && (
                    <p className="text-[10px] text-slate-500">The host controls whether bots may use an LLM.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '5min', label: '5 Mins' },
                      { id: '10min', label: '10 Mins' },
                      { id: '20min', label: '20 Mins' },
                      { id: '40min', label: '40 Mins' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        disabled={!isHost}
                        onClick={() => syncRoomUpdate(prev => ({ ...prev, sessionMode: opt.id }))}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                          roomState.sessionMode === opt.id
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Per-Turn Timer</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45].map(sec => (
                      <button
                        key={sec}
                        disabled={!isHost}
                        onClick={() => syncRoomUpdate(prev => ({ ...prev, turnSecondsMax: sec }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          roomState.turnSecondsMax === sec
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={startMatch}
                disabled={!isHost || roomState.players.length < 2}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 font-black text-sm text-white shadow-lg shadow-indigo-600/30 transition"
              >
                Launch Game ({roomState.players.length} Players)
              </button>
            </div>
          </div>
        )}

        {screen === 'game' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl border font-mono font-black text-lg flex items-center gap-2 ${
                  sessionRemaining <= 30
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-amber-400'
                }`}>
                  <Clock className="w-4 h-4" />
                  {formatClock(sessionRemaining)}
                </div>

                <div className="text-xs text-slate-400">
                  <div>Turn Timer: <span className="font-bold text-white">{turnRemaining}s</span></div>
                  <div>Total Words: <span className="font-bold text-indigo-300">{roomState.story.length}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {roomState.players.map((p, idx) => {
                  const isCurrent = idx === roomState.currentTurnIndex;
                  return (
                    <div
                      key={p.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition shrink-0 ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-400 text-white scale-105 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 opacity-75'
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.name}</span>
                    </div>
                  );
                })}
              </div>

              {isHost && (
                <button
                  onClick={() => finishAndLaunchFinale(roomState.story)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition"
                >
                  Finish & Read Aloud 🔊
                </button>
              )}
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between">
              {roomState.story.length === 0 ? (
                <div className="my-auto text-center text-slate-500 py-12">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Type the first word to begin!</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2.5 leading-relaxed">
                  {roomState.story.map((entry, idx) => (
                    <span
                      key={idx}
                      className="group relative inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-indigo-500/60 text-lg sm:text-xl font-bold text-slate-100 transition cursor-default"
                    >
                      {entry.word}
                      <span className="ml-1.5 text-xs opacity-60 group-hover:opacity-100">
                        {entry.emoji}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Active Turn: <span className="font-bold text-white">{activePlayer?.emoji} {activePlayer?.name}</span>
                </div>
                {botThinking && (
                  <span className="text-indigo-400 font-semibold animate-pulse">
                    🤖 AI Bot is thinking...
                  </span>
                )}
              </div>
            </div>

            {canSubmitTurn && (
              <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    {activePlayer?.emoji} {activePlayer?.name}'s Turn — Enter 1 Word
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">Punctuation:</span>
                    {['', ',', '.', '!', '?'].map((punc) => (
                      <button
                        key={punc || 'none'}
                        type="button"
                        onClick={() => setSelectedPunc(punc)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                          selectedPunc === punc
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {punc === '' ? 'None' : punc}
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (wordDraft.trim()) submitSingleWord(wordDraft, activePlayer);
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={wordDraft}
                    onChange={(e) => setWordDraft(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Type one word..."
                    autoFocus
                    className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-lg font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" /> Play Word
                  </button>
                </form>
              </div>
            )}
            {!activePlayer?.isBot && mode === 'online' && !canSubmitTurn && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-sm text-slate-400">
                Waiting for {activePlayer?.emoji} {activePlayer?.name} to enter one word.
              </div>
            )}
          </div>
        )}

        {screen === 'finale' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Volume2 className="w-3.5 h-3.5" /> Synchronized Finale Theater
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    Grand Read-Aloud Performance
                  </h2>
                </div>

                {activeEmotionBadge && (
                  <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-indigo-500/50 text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <span>🎭 {activeEmotionBadge.emotion.toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6">
                {(roomState.finaleState?.directedScript?.length
                  ? roomState.finaleState.directedScript
                  : buildLocalDirectedScript(roomState.story)
                ).map((seg, idx) => {
                  const isSpeaking = idx === activeSentenceIdx;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all duration-300 ${
                        isSpeaking
                          ? 'bg-indigo-600/25 border-indigo-400 text-white scale-[1.01] shadow-lg'
                          : 'bg-slate-900/60 border-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-indigo-400 mb-1">
                        <span>Scene #{idx + 1} • {seg.emotion}</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold leading-relaxed">{seg.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 max-w-xs"
                  >
                    {availableVoices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        🎙️ {v.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    {isMuted ? 'Muted' : 'Audio On'}
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={broadcastReplay}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Replay Aloud
                  </button>

                  <button
                    onClick={copyTranscript}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText ? 'Copied!' : 'Copy Story'}
                  </button>

                  <button
                    onClick={() => setScreen('lobby')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAIModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Free AI Router
              </h3>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              OpenRouter sends AI requests using the selected model. Free model availability and rate limits are controlled by OpenRouter.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Google AI Studio Free Key</label>
                <input
                  type="password"
                  value={aiSettings.geminiKey}
                  onChange={(e) => setAiSettings({ ...aiSettings, geminiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">OpenRouter API Key</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={aiSettings.openRouterKey}
                  onChange={(e) => setAiSettings({ ...aiSettings, openRouterKey: e.target.value })}
                  placeholder="Paste your replacement OpenRouter key"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">OpenRouter model</label>
                <input
                  type="text"
                  value={aiSettings.openRouterModel}
                  onChange={(e) => setAiSettings({ ...aiSettings, openRouterModel: e.target.value.trim() })}
                  placeholder="nvidia/nemotron-3-nano-30b-a3b:free"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
                <p className="mt-1 text-slate-500">
                  NVIDIA Nemotron free model. The API key is saved in this browser’s local storage; do not use this setup on a public/shared device.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showHostingModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">🚀 Free Hosting</h3>
              <button onClick={() => setShowHostingModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside">
              <li>Run <code className="text-amber-300">npm run build</code> to generate the dist folder.</li>
              <li>Drag and drop the folder onto <strong>app.netlify.com/drop</strong> for a free live URL.</li>
            </ol>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHostingModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
