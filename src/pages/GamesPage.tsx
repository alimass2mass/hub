import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { 
  Gamepad2, Search, Send, Trophy, Users, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  RefreshCw, Play, ArrowLeft, ArrowRight, Zap, Award, Sparkles, Plus, Check, ShieldAlert,
  Car, Compass, UserCheck, MessageSquare, X
} from 'lucide-react';
import { MockDB } from '../utils/db';
import { User } from '../types';

interface RacingCar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  friction: number;
  steerSpeed: number;
  color: string;
  name: string;
  avatar?: string;
  isPlayer: boolean;
  isNitro: boolean;
  nitroTime: number;
  distance: number;
  finished: boolean;
  rank?: number;
  crashTime: number;
}

interface Obstacle {
  x: number;
  y: number;
  type: 'cone' | 'barrier';
}

interface Powerup {
  x: number;
  y: number;
  active: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'player' | 'opponent';
  senderName: string;
  text: string;
  timestamp: string;
}

export default function GamesPage({ currentUser }: { currentUser: User | null }) {
  const { t, isRtl } = useLanguage();
  
  // States: 'lobby' | 'garage' | 'loading' | 'race' | 'results'
  const [screen, setScreen] = useState<'lobby' | 'garage' | 'race' | 'results'>('lobby');
  
  // Users for matchmaking
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [opponent, setOpponent] = useState<User | null>(null);
  
  // Invitations / Calling
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'calling' | 'accepted' | 'declined'>('idle');
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceVol, setVoiceVol] = useState(80);
  
  // Game Configuration Modes
  const [gameMode, setGameMode] = useState<'solo' | '1v1' | 'teams'>('1v1');
  const [selectedCarModel, setSelectedCarModel] = useState<'compiler' | 'dynamo' | 'cruiser' | 'tanker'>('compiler');
  const [myTeam, setMyTeam] = useState<'coders' | 'hardware'>('coders');
  const [trackDifficulty, setTrackDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [raceCountdown, setRaceCountdown] = useState<number | string>('');

  // Interactive Live Chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Canvas Refs & Game Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Physics engine states (In-Memory to prevent React lag on 60FPS)
  const carsRef = useRef<RacingCar[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const trackPathRef = useRef<{ x: number; y: number }[]>([]);
  const gameActiveRef = useRef<boolean>(false);
  const cameraYRef = useRef<number>(0);
  const shakeRef = useRef<number>(0);
  const trackLength = 4000; // Total track length in coordinate units
  
  // Particles for nitro/speed effects
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[]>([]);

  // User input controls ref (holding keyboard inputs)
  const controlsRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false
  });

  // Load all users for matchmaking
  useEffect(() => {
    // Collect users from MockDB or standard seeds
    try {
      const dbUsers = JSON.parse(localStorage.getItem('eh_users') || '[]');
      if (dbUsers && dbUsers.length > 0) {
        setAllUsers(dbUsers.filter((u: any) => u.username !== currentUser?.username));
      } else {
        // Fallbacks
        const seeds: User[] = [
          {
            id: 'u_sara',
            username: 'sara_mech',
            fullName: 'المهندسة سارة الميكانيكية',
            email: 'sara@example.com',
            engineeringField: 'هندسة ميكانيكية',
            isPrivate: false,
            isVerified: true,
            followersCount: 140,
            followingCount: 95,
            postsCount: 12
          },
          {
            id: 'u_ahmed',
            username: 'ahmed_eng',
            fullName: 'المهندس أحمد الإنشائي',
            email: 'ahmed@example.com',
            engineeringField: 'هندسة مدنية',
            isPrivate: false,
            isVerified: true,
            followersCount: 310,
            followingCount: 121,
            postsCount: 45
          },
          {
            id: 'u_admin',
            username: 'admin',
            fullName: 'المهندس المشرف العام',
            email: 'admin@example.com',
            engineeringField: 'هندسة برمجيات',
            isPrivate: false,
            isVerified: true,
            followersCount: 890,
            followingCount: 200,
            postsCount: 110
          }
        ];
        setAllUsers(seeds.filter(u => u.username !== currentUser?.username));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Handle invitation simulations
  const handleInviteUser = (selectedUser: User) => {
    setOpponent(selectedUser);
    setInviteStatus('calling');
    setIsVoiceConnected(false);
    
    // Simulate Ringing Sound and Accepting Challenge
    const timer = setTimeout(() => {
      setInviteStatus('accepted');
      setIsVoiceConnected(true); // Voice call starts automagically on acceptance!
      
      // Seed initial welcoming message
      const initialGreeting: ChatMessage = {
        id: 'msg_init',
        sender: 'opponent',
        senderName: selectedUser.fullName,
        text: getOpponentGreeting(selectedUser),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([initialGreeting]);
    }, 2000);

    return () => clearTimeout(timer);
  };

  const getOpponentGreeting = (usr: User) => {
    if (usr.username === 'sara_mech') {
      return 'أهلاً بك يا زميل! لقد قمت بتحسين زوايا المنعطفات وهيكل السيارة ميكانيكياً لمحاكاة سباق ديناميكي مذهل.. لن تهزمني بسهولة! 📐🏎️';
    } else if (usr.username === 'ahmed_eng') {
      return 'تحدي مقبول! لقد انتهيت للتو من فحص القواعد الخرسانية وهندسة الطرق لضمان ثبات الإطارات. دعنا نرى قوة محركات الميكانيك على الأرض! 🧱⚡';
    } else if (usr.username === 'admin') {
      return 'تحدي في الكود وفي التوجيه! قمت بتحميل ملفات تعريف النظام والتحكم بمؤشرات تسريع الإطارات. أنا مستعد تماماً! 💾🏁';
    }
    return `أهلاً بك! تحديك مقبول كوني مهندس لـ ${usr.engineeringField}. دعنا نرى من يحمل العزم الأقوى لتجاوز المنعطفات! 🏎️💥`;
  };

  // Keyboard inputs for game movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'race') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') controlsRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') controlsRef.current.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') controlsRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') controlsRef.current.right = true;
      if (e.key === ' ' || e.key === 'Shift') controlsRef.current.nitro = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') controlsRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') controlsRef.current.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') controlsRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') controlsRef.current.right = false;
      if (e.key === ' ' || e.key === 'Shift') controlsRef.current.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  const getRoomId = () => {
    if (!opponent) return 'room_solo';
    const parts = [currentUser?.username || 'me', opponent.username].sort();
    return `room_${parts[0]}_${parts[1]}`;
  };

  const [chatSenderRole, setChatSenderRole] = useState<'player' | 'opponent'>('player');
  const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(true);

  // Sync isolated room chat messages on opponent changes
  useEffect(() => {
    if (!opponent) return;
    const roomId = getRoomId();
    const stored = localStorage.getItem(`eh_game_chat_${roomId}`);
    if (stored) {
      setChatMessages(JSON.parse(stored));
    } else {
      const initialGreeting: ChatMessage = {
        id: 'msg_init',
        sender: 'opponent',
        senderName: opponent.fullName,
        text: getOpponentGreeting(opponent),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const initialList = [initialGreeting];
      setChatMessages(initialList);
      localStorage.setItem(`eh_game_chat_${roomId}`, JSON.stringify(initialList));
    }
  }, [opponent]);

  // Send message and persist to specific room storage
  const sendChatMessage = (text: string, senderOverride?: 'player' | 'opponent') => {
    if (!text.trim()) return;
    const sender = senderOverride || chatSenderRole;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const roomId = getRoomId();
    
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + Math.random().toString(36).substr(2, 4),
      sender: sender,
      senderName: sender === 'player' ? (currentUser?.fullName || 'أنا') : (opponent?.fullName || 'المهندس الخصم'),
      text: text,
      timestamp: timeStr
    };
    
    setChatMessages(prev => {
      const updated = [...prev, newMsg];
      localStorage.setItem(`eh_game_chat_${roomId}`, JSON.stringify(updated));
      return updated;
    });
    setChatInput('');
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // PREPARE AND INITIALIZE THE RACING GAME SCREEN
  const startGarageScreen = () => {
    setScreen('garage');
  };

  const launchRaceGame = () => {
    setScreen('race');
    setRaceCountdown(3);
    
    // Countdown process
    const interval = setInterval(() => {
      setRaceCountdown(current => {
        if (current === 3) return 2;
        if (current === 2) return 1;
        if (current === 1) return 'انطلق! GO';
        clearInterval(interval);
        
        // Unleash physics loop
        setTimeout(() => {
          setRaceCountdown('');
          gameActiveRef.current = true;
        }, 800);
        return '';
      });
    }, 1000);

    // Initialize Race Track Data and Physics variables
    setupRacingPhysics();
  };

  const setupRacingPhysics = () => {
    gameActiveRef.current = false;
    cameraYRef.current = 0;
    shakeRef.current = 0;
    particlesRef.current = [];
    
    // Generate race track pathway (Sinusoidal curvaceous track coordinates)
    const trackPoints = [];
    let currentX = 250; // Center in a 500-wide viewport
    for (let i = 0; i < 4200; i += 20) {
      // Add curviness to the road
      const curveAmount = Math.sin(i / 150) * 80 + Math.cos(i / 400) * 120;
      trackPoints.push({
        x: 250 + curveAmount,
        y: i
      });
    }
    trackPathRef.current = trackPoints;

    // Define Car Attributes based on selection
    const myCarStats = {
      compiler: { maxSpeed: 6.2, accel: 0.18, steer: 0.05, color: '#0d9488' }, // Matte Teal - Compile Speed
      dynamo: { maxSpeed: 6.8, accel: 0.12, steer: 0.04, color: '#f97316' },  // Vibrant orange - Torque Heavy
      cruiser: { maxSpeed: 5.9, accel: 0.15, steer: 0.065, color: '#0ea5e9' }, // Grip heavy - Sky blue
      tanker: { maxSpeed: 5.5, accel: 0.22, steer: 0.045, color: '#eab308' }  // Golden mechanical
    }[selectedCarModel];

    // Build the participants list
    const participantCars: RacingCar[] = [
      {
        x: 210, // Starting grid left
        y: 100,
        vx: 0,
        vy: 0,
        angle: -Math.PI / 2,
        speed: 0,
        maxSpeed: myCarStats.maxSpeed,
        accel: myCarStats.accel,
        friction: 0.96,
        steerSpeed: myCarStats.steer,
        color: myCarStats.color,
        name: currentUser?.fullName || 'المتسابق الرئيسي',
        avatar: currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'p1'}`,
        isPlayer: true,
        isNitro: false,
        nitroTime: 0,
        distance: 0,
        finished: false,
        crashTime: 0
      }
    ];

    // Opponent Car configuration
    const opponentStats = opponent?.username === 'sara_mech' 
      ? { maxSpeed: 6.3, accel: 0.14, steer: 0.053, color: '#ec4899', name: opponent.fullName }
      : opponent?.username === 'ahmed_eng'
      ? { maxSpeed: 6.6, accel: 0.11, steer: 0.042, color: '#ef4444', name: opponent.fullName }
      : opponent?.username === 'admin'
      ? { maxSpeed: 6.4, accel: 0.15, steer: 0.048, color: '#a855f7', name: opponent.fullName }
      : { maxSpeed: 6.1, accel: 0.13, steer: 0.046, color: '#10b981', name: opponent?.fullName || 'عضو المهندسين الآخر' };

    // Add opponent car
    participantCars.push({
      x: 290, // Starting grid right
      y: 80,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: opponentStats.maxSpeed,
      accel: opponentStats.accel,
      friction: 0.96,
      steerSpeed: opponentStats.steer,
      color: opponentStats.color,
      name: opponentStats.name,
      avatar: opponent?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent?.username || 'p2'}`,
      isPlayer: false,
      isNitro: false,
      nitroTime: 0,
      distance: 0,
      finished: false,
      crashTime: 0
    });

    // TEAM MODE: Generate group players (Adds 2 extra cars to make it 2v2 racing!)
    if (gameMode === 'teams') {
      const myTeamColor = myTeam === 'coders' ? '#14b8a6' : '#f43f5e';
      const enemyTeamColor = myTeam === 'coders' ? '#f43f5e' : '#14b8a6';

      // Team Mate car
      participantCars.push({
        x: 180,
        y: 50,
        vx: 0,
        vy: 0,
        angle: -Math.PI / 2,
        speed: 0,
        maxSpeed: 6.0,
        accel: 0.13,
        friction: 0.96,
        steerSpeed: 0.048,
        color: myTeamColor,
        name: isRtl ? 'حليف: مهندس البرمجة' : 'Ally Code Engineer',
        isPlayer: false,
        isNitro: false,
        nitroTime: 0,
        distance: 0,
        finished: false,
        crashTime: 0
      });

      // Enemy Team Mate
      participantCars.push({
        x: 320,
        y: 40,
        vx: 0,
        vy: 0,
        angle: -Math.PI / 2,
        speed: 0,
        maxSpeed: 6.2,
        accel: 0.12,
        friction: 0.96,
        steerSpeed: 0.046,
        color: enemyTeamColor,
        name: isRtl ? 'منافس: العتاد الخارق' : 'Rival Hard Dynamo',
        isPlayer: false,
        isNitro: false,
        nitroTime: 0,
        distance: 0,
        finished: false,
        crashTime: 0
      });
    }

    carsRef.current = participantCars;

    // SCATTER CONES AND POWERUPS on coordinates dynamically
    const obst: Obstacle[] = [];
    const pwr: Powerup[] = [];

    for (let y = 300; y < trackLength - 300; y += 180) {
      // Find road mid-point at this Y coordinate
      const trackIdx = Math.floor(y / 20);
      const center = trackPathRef.current[trackIdx] || { x: 250 };
      
      // Random offset to place obstacle or battery
      const randomOffset = (Math.random() - 0.5) * 160; 
      
      if (Math.random() > 0.4) {
        obst.push({
          x: center.x + randomOffset,
          y: y,
          type: Math.random() > 0.7 ? 'barrier' : 'cone'
        });
      } else {
        pwr.push({
          x: center.x + randomOffset,
          y: y,
          active: true
        });
      }
    }

    obstaclesRef.current = obst;
    powerupsRef.current = pwr;
  };

  // MAIN RUNTIME PHYSICS LOOP (RequestAnimationFrame)
  useEffect(() => {
    if (screen !== 'race') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const updateGameFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cars = carsRef.current;
      const obstacles = obstaclesRef.current;
      const powerups = powerupsRef.current;
      const trackPoints = trackPathRef.current;

      // 1. UPDATE VEHICLES POSITION (PHYSICS ENGINE)
      cars.forEach((car) => {
        // Recover from crash recovery frames
        if (car.crashTime > 0) {
          car.crashTime--;
        }

        if (car.isPlayer && gameActiveRef.current) {
          // PLAYER PHYSICS: Based on keyboard controls and active key mapping
          if (controlsRef.current.left) {
            car.angle -= car.steerSpeed * (car.speed > 2 ? 1 : car.speed / 2);
          }
          if (controlsRef.current.right) {
            car.angle += car.steerSpeed * (car.speed > 2 ? 1 : car.speed / 2);
          }

          let currentMax = car.maxSpeed;
          // Apply nitro speed multipliers
          if (car.isNitro) {
            currentMax *= 1.45;
            car.nitroTime--;
            if (car.nitroTime <= 0) {
              car.isNitro = false;
            }
            // Emit fiery trail particles
            if (Math.random() > 0.3) {
              particlesRef.current.push({
                x: car.x - Math.cos(car.angle) * 12,
                y: car.y - Math.sin(car.angle) * 12,
                vx: -Math.cos(car.angle) * 2 + (Math.random() - 0.5),
                vy: -Math.sin(car.angle) * 2 + (Math.random() - 0.5),
                color: '#14b8a6',
                size: Math.random() * 5 + 3,
                alpha: 1
              });
            }
          }

          if (controlsRef.current.up) {
            car.speed += car.accel;
            if (car.speed > currentMax) car.speed = currentMax;
          } else if (controlsRef.current.down) {
            car.speed -= car.accel * 0.8;
            if (car.speed < -2) car.speed = -2;
          } else {
            // Apply neutral friction slows
            car.speed *= car.friction;
          }

          // Active keyboard Nitro trigger manually if they have energy
          if (controlsRef.current.nitro && !car.isNitro && Math.random() > 0.95) {
            car.isNitro = true;
            car.nitroTime = 90; // 1.5 seconds at 60fps
          }
        } else if (gameActiveRef.current && !car.finished) {
          // INTERACTIVE Opponents (AI Guided Pathing)
          const targetTrackIdx = Math.min(Math.floor((car.y + 120) / 20), trackPoints.length - 1);
          const targetPoint = trackPoints[targetTrackIdx] || { x: car.x };
          
          // Steer towards track middle point
          const targetAngle = Math.atan2(targetPoint.y - car.y, targetPoint.x - car.x);
          let angleDiff = targetAngle - car.angle;
          
          // Normalize angle differences
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          
          car.angle += Math.sign(angleDiff) * car.steerSpeed * 0.8;
          
          // Accelerate AI car
          let aiMax = car.maxSpeed;
          // Randomly trigger Nitro for opponent during sprint
          if (!car.isNitro && Math.random() > 0.992 && car.y < trackLength - 650) {
            car.isNitro = true;
            car.nitroTime = 100;
          }

          if (car.isNitro) {
            aiMax *= 1.4;
            car.nitroTime--;
            if (car.nitroTime <= 0) car.isNitro = false;
          }

          if (car.crashTime <= 0) {
            car.speed += car.accel * 0.95;
            if (car.speed > aiMax) car.speed = aiMax;
          } else {
            car.speed *= car.friction;
          }
        }

        // Trigonometric displacement calculations
        car.x += Math.cos(car.angle) * car.speed;
        car.y += Math.sin(car.angle) * car.speed;
        car.distance = car.y; // Standard horizontal-scrolling equivalent

        // Check if track boundaries constraint is violated (Ditch deceleration)
        const currentYIdx = Math.min(Math.max(0, Math.floor(car.y / 20)), trackPoints.length - 1);
        const roadCenter = trackPoints[currentYIdx]?.x || 250;
        const roadWidth = 190; // Width of the safe asphalt road corridor

        if (Math.abs(car.x - roadCenter) > roadWidth / 2) {
          car.speed *= 0.86; // Road shoulder friction slow-down
          // Grass particles emitter
          if (car.speed > 1) {
            particlesRef.current.push({
              x: car.x,
              y: car.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              color: '#15803d', // Grass green bits
              size: Math.random() * 3 + 1,
              alpha: 0.8
            });
          }
        }

        // Finish line achievement checkpoint detection
        if (car.y >= trackLength && !car.finished) {
          car.finished = true;
          car.speed = 0;
          
          // Assign ranking dynamically
          const currentWinners = cars.filter(c => c.finished).length;
          car.rank = currentWinners;
        }
      });

      // 2. CHECK COLLISIONS (CONES, POWERUPS, ROAD BLOCK WALLS)
      const playerCar = cars.find(c => c.isPlayer);
      if (playerCar && gameActiveRef.current) {
        // Obstacle crash inspection
        obstacles.forEach((obs) => {
          const dx = playerCar.x - obs.x;
          const dy = playerCar.y - obs.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 18) { // Crash bounds intersection
            playerCar.speed = -1.5; // Bounce reverse thrust speed
            playerCar.crashTime = 40; // Enter temporary deceleration
            shakeRef.current = 15; // Set vigorous screen shake
            
            // Spark smoke emitters
            for (let s = 0; s < 12; s++) {
              particlesRef.current.push({
                x: obs.x,
                y: obs.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#f97316',
                size: Math.random() * 6 + 2,
                alpha: 1
              });
            }

            // Move the obstacle out of way so we don't collide endlessly
            obs.x = -9999;
          }
        });

        // Power-up charging cell overlap check
        powerups.forEach((pw) => {
          if (!pw.active) return;
          const dx = playerCar.x - pw.x;
          const dy = playerCar.y - pw.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 22) {
            pw.active = false;
            playerCar.isNitro = true;
            playerCar.nitroTime = 120; // Massive Nitro charge!
            
            // Teal power-up sparkles burst!
            for (let s = 0; s < 20; s++) {
              particlesRef.current.push({
                x: pw.x,
                y: pw.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#14b8a6',
                size: Math.random() * 5 + 2,
                alpha: 1
              });
            }
          }
        });
      }

      // Check if all active participant cars finished racing
      const activeUnfinishedCars = cars.filter(c => !c.finished);
      if (activeUnfinishedCars.length === 0 && gameActiveRef.current) {
        // Race finishes completely! Direct users to results
        gameActiveRef.current = false;
        setTimeout(() => {
          setScreen('results');
        }, 1500);
      }

      // 3. CANVAS DRAWING ROUTINES (HIGH FIDELITY VISUAL RENDERING)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Screen shake modifier variables
      const shakeX = (Math.random() - 0.5) * shakeRef.current;
      const shakeY = (Math.random() - 0.5) * shakeRef.current;
      if (shakeRef.current > 0) shakeRef.current *= 0.9; // Decelerating decay curve

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Camera Y placement tracking the player car (keeps player centered)
      if (playerCar) {
        cameraYRef.current = playerCar.y - canvas.height * 0.75;
      }
      const cameraY = cameraYRef.current;

      // Draw safe grass turf base color
      ctx.fillStyle = '#0f172a'; // Eye-safe background base color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render track lines and shoulder buffers inside camera view
      for (let y = Math.floor(cameraY / 20) * 20; y < Math.floor((cameraY + canvas.height) / 20) * 20 + 20; y += 20) {
        const pointIdx = Math.floor(y / 20);
        const pt = trackPoints[pointIdx];
        if (!pt) continue;

        const nextPt = trackPoints[pointIdx + 1] || pt;
        const screenY = canvas.height - (pt.y - cameraY);
        const nextScreenY = canvas.height - (nextPt.y - cameraY);

        const roadW = 190;
        
        // Draw side borders (Concrete barriers block / curbs)
        ctx.fillStyle = (pointIdx % 2 === 0) ? '#e2e8f0' : '#ef4444'; // Red and white race curbs
        ctx.beginPath();
        ctx.moveTo(pt.x - roadW/2 - 10, screenY);
        ctx.lineTo(pt.x - roadW/2, screenY);
        ctx.lineTo(nextPt.x - roadW/2, nextScreenY);
        ctx.lineTo(nextPt.x - roadW/2 - 10, nextScreenY);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(pt.x + roadW/2, screenY);
        ctx.lineTo(pt.x + roadW/2 + 10, screenY);
        ctx.lineTo(nextPt.x + roadW/2 + 10, nextScreenY);
        ctx.lineTo(nextPt.x + roadW/2, nextScreenY);
        ctx.fill();

        // Draw asphalt road mesh
        ctx.fillStyle = '#1e293b'; 
        ctx.beginPath();
        ctx.moveTo(pt.x - roadW/2, screenY);
        ctx.lineTo(pt.x + roadW/2, screenY);
        ctx.lineTo(nextPt.x + roadW/2, nextScreenY);
        ctx.lineTo(nextPt.x - roadW/2, nextScreenY);
        ctx.fill();

        // White mid-road dashed dividing markers
        if (pointIdx % 3 === 0) {
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(pt.x, screenY);
          ctx.lineTo(pt.x, nextScreenY);
          ctx.stroke();
        }
      }

      // Draw starting grid markings
      const startGridY = canvas.height - (100 - cameraY);
      if (startGridY > -50 && startGridY < canvas.height + 50) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(80, startGridY - 5, 340, 10);
        ctx.font = '9px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('خط البداية / STARTING GRID', 250, startGridY + 20);
      }

      // Draw Finish line banner flags
      const finishLineY = canvas.height - (trackLength - cameraY);
      if (finishLineY > -100 && finishLineY < canvas.height + 100) {
        // Black & White checkered pattern
        ctx.fillStyle = '#334155';
        ctx.fillRect(80, finishLineY - 14, 340, 24);
        
        ctx.fillStyle = '#ffffff';
        for (let xOffset = 80; xOffset < 420; xOffset += 20) {
          if ((xOffset / 20) % 2 === 0) {
            ctx.fillRect(xOffset, finishLineY - 14, 10, 12);
            ctx.fillRect(xOffset + 10, finishLineY - 2, 10, 12);
          } else {
            ctx.fillRect(xOffset + 10, finishLineY - 14, 10, 12);
            ctx.fillRect(xOffset, finishLineY - 2, 10, 12);
          }
        }
        
        ctx.font = 'bold 15px Cairo, Arial';
        ctx.fillStyle = '#14b8a6';
        ctx.textAlign = 'center';
        ctx.fillText('🏁 خط النهاية / FINISH ROAD 🏁', 250, finishLineY - 25);
      }

      // DRAW POWERUPS SPINNING CELLS
      powerups.forEach((pw) => {
        if (!pw.active) return;
        const screenY = canvas.height - (pw.y - cameraY);
        if (screenY < -40 || screenY > canvas.height + 40) return;

        // Glowing pulsing circle
        const scaleVal = 1 + Math.sin(Date.now() / 120) * 0.15;
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.arc(pw.x, screenY, 10 * scaleVal, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pw.x, screenY, 4 * scaleVal, 0, Math.PI * 2);
        ctx.fill();
      });

      // DRAW CONE OBSTACLES
      obstacles.forEach((obs) => {
        const screenY = canvas.height - (obs.y - cameraY);
        if (screenY < -40 || screenY > canvas.height + 40) return;

        if (obs.type === 'cone') {
          // Drawing traffic cone
          ctx.fillStyle = '#f97316'; // Orange traffic cone base
          ctx.fillRect(obs.x - 10, screenY + 6, 20, 5);
          
          ctx.beginPath();
          ctx.moveTo(obs.x, screenY - 12);
          ctx.lineTo(obs.x - 7, screenY + 6);
          ctx.lineTo(obs.x + 7, screenY + 6);
          ctx.closePath();
          ctx.fill();
          
          // White warning stripe
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(obs.x, screenY - 4);
          ctx.lineTo(obs.x - 4, screenY + 1);
          ctx.lineTo(obs.x + 4, screenY + 1);
          ctx.closePath();
          ctx.fill();
        } else {
          // Concrete block barriers
          ctx.fillStyle = '#64748b';
          ctx.fillRect(obs.x - 18, screenY - 8, 36, 16);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(obs.x - 18, screenY - 8, 36, 16);
          
          // Caution stripes
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.moveTo(obs.x - 12, screenY + 8);
          ctx.lineTo(obs.x - 6, screenY - 8);
          ctx.lineTo(obs.x, screenY - 8);
          ctx.lineTo(obs.x - 6, screenY + 8);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, screenY + 8);
          ctx.lineTo(obs.x + 10, screenY - 8);
          ctx.lineTo(obs.x + 16, screenY - 8);
          ctx.lineTo(obs.x + 10, screenY + 8);
          ctx.fill();
        }
      });

      // DRAW VEHICLE ENTITIES
      cars.forEach((car) => {
        const screenY = canvas.height - (car.y - cameraY);
        if (screenY < -100 || screenY > canvas.height + 100) return;

        ctx.save();
        ctx.translate(car.x, screenY);
        ctx.rotate(car.angle);

        // Render nitro burning exhaust trail
        if (car.isNitro) {
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.6)';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(-18, 0);
          ctx.lineTo(-35 - Math.random() * 15, 0);
          ctx.stroke();
        }

        // Car Body frame
        ctx.fillStyle = car.color;
        // Chassis bounding shape
        ctx.beginPath();
        ctx.moveTo(-15, -10);
        ctx.lineTo(18, -8);
        ctx.lineTo(18, 8);
        ctx.lineTo(-15, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Wheels drawing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, -12, 6, 3); // Rear left
        ctx.fillRect(-12, 9, 6, 3);  // Rear right
        ctx.fillRect(8, -12, 6, 3);   // Front left
        ctx.fillRect(8, 9, 6, 3);    // Front right

        // Cabin cockpit windshield
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-4, -6, 12, 12);
        
        // Spoiler wing
        ctx.fillStyle = '#334155';
        ctx.fillRect(-15, -13, 3, 26);

        ctx.restore();

        // Render Tag Labels (Username overlay metadata)
        ctx.font = 'bold 9px Cairo, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(car.name, car.x, screenY - 20);
        ctx.shadowBlur = 0;

        // Draw bubble indicators when cars finish
        if (car.finished) {
          ctx.fillStyle = '#14b8a6';
          ctx.font = 'bold 8px Cairo';
          ctx.fillText(`فينيش #${car.rank}`, car.x, screenY - 32);
        }
      });

      // DRAW FLOATING PARTICLES
      const activeParticles = particlesRef.current;
      for (let p = activeParticles.length - 1; p >= 0; p--) {
        const pt = activeParticles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.02;

        if (pt.alpha <= 0) {
          activeParticles.splice(p, 1);
          continue;
        }

        const screenY = canvas.height - (pt.y - cameraY);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, screenY, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Reset canvas opacity state

      ctx.restore();

      requestRef.current = requestAnimationFrame(updateGameFrame);
    };

    requestRef.current = requestAnimationFrame(updateGameFrame);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [screen]);

  // Touch handlers for mobile players
  const triggerMobileSteer = (dir: 'left' | 'right' | 'none') => {
    if (dir === 'left') {
      controlsRef.current.left = true;
      controlsRef.current.right = false;
    } else if (dir === 'right') {
      controlsRef.current.right = true;
      controlsRef.current.left = false;
    } else {
      controlsRef.current.left = false;
      controlsRef.current.right = false;
    }
  };

  const triggerMobileGas = (active: boolean) => {
    controlsRef.current.up = active;
  };

  const triggerMobileBrake = (active: boolean) => {
    controlsRef.current.down = active;
  };

  const triggerMobileNitro = () => {
    // Actively activate turbo blast
    const player = carsRef.current.find(c => c.isPlayer);
    if (player && !player.isNitro) {
      player.isNitro = true;
      player.nitroTime = 120;
    }
  };

  // Score Calculations after race terminates
  const getSortedRaceResults = () => {
    return [...carsRef.current].sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      return b.distance - a.distance;
    });
  };

  const isUserWinner = () => {
    const results = getSortedRaceResults();
    const rank = results.findIndex(c => c.isPlayer);
    return rank === 0;
  };

  return (
    <div className="flex-1 bg-dark-bg p-3 md:p-6 flex flex-col text-right font-sans overflow-y-auto max-w-7xl mx-auto w-full select-none pb-24">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-dark-border/40 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-inner">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{isRtl ? 'سباق التوربو العربي للمهندسين' : 'Arab Engineer Turbo GP'}</h1>
            <p className="text-[11px] text-dark-muted mt-0.5">
              {isRtl 
                ? 'ابحث عن أي زميل من المجتمع لتحديه مباشرة، اتصلوا صوتياً، دردشوا نصياً وتسابقوا سوياً!' 
                : 'Search any colleague, voice call, chat, and race on interactive circuits!'}
            </p>
          </div>
        </div>

        {/* Current Active Voice call dashboard widget */}
        {isVoiceConnected && opponent && (
          <div className="flex items-center gap-3.5 bg-dark-card/90 border border-brand-primary/30 rounded-2xl p-3 shadow-md animate-fade-in">
            {/* animated equalizer waveform */}
            <div className="flex items-center gap-1 h-6 px-1">
              <span className="w-1 bg-brand-primary rounded-full h-3 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1 bg-brand-primary rounded-full h-5 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              <span className="w-1 bg-brand-primary rounded-full h-2 animate-bounce" style={{ animationDelay: '0.5s' }}></span>
              <span className="w-1 bg-brand-primary rounded-full h-4 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-brand-primary">📞 مكالمة نشطة بقناة التحدي</span>
              <span className="text-xs font-black text-white truncate max-w-[120px]">{opponent.fullName}</span>
            </div>

            <div className="flex items-center gap-1.5 border-r border-dark-border/80 pr-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-lg border transition-all ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-dark-bg border-dark-border text-dark-muted hover:text-white'}`}
                title="كتم الصوت"
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              
              <button
                onClick={() => {
                  setIsVoiceConnected(false);
                  setChatMessages(prev => [...prev, {
                    id: 'sys_' + Date.now(),
                    sender: 'opponent',
                    senderName: 'نظام السباق',
                    text: '⚠️ تم إنهاء المكالمة الصوتية الفعالة.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                }}
                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                title="إنهاء المكالمة"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SCREEN 1: THE SEARCH, MATCHMAKING AND MULTIPLAYER LOBBY */}
      {screen === 'lobby' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* LOBBY MODES CONFIGURATION CARD (LEFT 1/3) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 bg-brand-primary/10 text-brand-primary px-3.5 py-1 text-[9px] font-black rounded-br-2xl">
                SYSTEM LOBBY
              </div>
              
              <h2 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-brand-primary" />
                خيارات نمط اللعبة الرياضية
              </h2>

              <div className="space-y-4">
                {/* Mode Toggles */}
                <div>
                  <label className="text-[10px] font-black text-dark-muted block mb-2">اختر نظام التحدي الجماعي:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setGameMode('solo')}
                      className={`py-2.5 rounded-xl text-center text-xs font-black border transition-all ${gameMode === 'solo' ? 'bg-brand-primary/15 border-brand-primary text-white' : 'bg-dark-bg border-dark-border text-dark-muted hover:text-dark-text'}`}
                    >
                      تدريب منفرد
                    </button>
                    <button
                      onClick={() => setGameMode('1v1')}
                      className={`py-2.5 rounded-xl text-center text-xs font-black border transition-all ${gameMode === '1v1' ? 'bg-brand-primary/15 border-brand-primary text-white' : 'bg-dark-bg border-dark-border text-dark-muted hover:text-dark-text'}`}
                    >
                      تحدي 1 ضد 1
                    </button>
                    <button
                      onClick={() => setGameMode('teams')}
                      className={`py-2.5 rounded-xl text-center text-xs font-black border transition-all ${gameMode === 'teams' ? 'bg-brand-primary/15 border-brand-primary text-white' : 'bg-dark-bg border-dark-border text-dark-muted hover:text-dark-text'}`}
                    >
                      سباق فِرق
                    </button>
                  </div>
                </div>

                {/* Team Assignment (For group modes) */}
                {gameMode === 'teams' && (
                  <div className="bg-dark-bg/60 border border-dark-border/80 rounded-2xl p-3 space-y-2 animate-slide-up">
                    <span className="text-[9px] font-black text-brand-primary block">اختر فريق المهندسين الخاص بك:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMyTeam('coders')}
                        className={`py-2 rounded-lg text-center text-[10px] font-bold border transition-all ${myTeam === 'coders' ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm' : 'bg-dark-bg border-dark-border text-dark-muted'}`}
                      >
                        🔥 فريق المبرمجين (Teal)
                      </button>
                      <button
                        onClick={() => setMyTeam('hardware')}
                        className={`py-2 rounded-lg text-center text-[10px] font-bold border transition-all ${myTeam === 'hardware' ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm' : 'bg-dark-bg border-dark-border text-dark-muted'}`}
                      >
                        ⚡ فريق العتاد والميكانيك (Red)
                      </button>
                    </div>
                  </div>
                )}

                {/* Map difficulty selection */}
                <div>
                  <label className="text-[10px] font-black text-dark-muted block mb-2">مستوى صعوبة حلبة الطرق:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setTrackDifficulty(level as any)}
                        className={`py-2 rounded-xl text-center text-[10px] font-bold border capitalize transition-all ${trackDifficulty === level ? 'bg-brand-primary/20 border-brand-primary/60 text-white' : 'bg-dark-bg border-dark-border text-dark-muted'}`}
                      >
                        {level === 'easy' ? 'سهل 🟢' : level === 'medium' ? 'متوسط 🟡' : 'محترف 🔴'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Leaderboard standings widget */}
            <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg">
              <h2 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-yellow-500" />
                أقوى مهندسي التوربو (ترتيب الحلبات)
              </h2>
              <div className="space-y-2.5">
                {[
                  { r: 1, name: 'المهندسة سارة الميكانيكية', text: 'سرعة قصوى: 230hp / عزم ميكانيكي', pts: 1240 },
                  { r: 2, name: 'المهندس أحمد الإنشائي', text: 'انعطافات مريحة وتوجيه مستقر', pts: 1100 },
                  { r: 3, name: 'المشرف العام', text: 'كود التوربو مفعّل بنسب مصفوفة', pts: 955 }
                ].map((l) => (
                  <div key={l.r} className="flex items-center justify-between bg-dark-bg/60 p-2 rounded-xl border border-dark-border/45">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${l.r === 1 ? 'bg-yellow-500/20 text-yellow-500' : l.r === 2 ? 'bg-slate-300/20 text-slate-300' : 'bg-amber-700/20 text-amber-600'}`}>{l.r}</span>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-white">{l.name}</span>
                        <span className="text-[8px] text-dark-muted">{l.text}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-brand-secondary">{l.pts} pts</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ACTIVE ACCOUNT SEARCH & CHALLENGE INVITE SCREEN (RIGHT 2/3) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg">
              
              {/* Account Search input bar */}
              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="ابحث عن اسم المستخدم أو التخصص لدعوته إلى التحدي الرياضي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-2xl py-3.5 pr-11 pl-4 text-xs text-dark-text focus:outline-none focus:border-brand-primary placeholder:text-dark-muted"
                />
                <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted" />
              </div>

              {/* Filtering user list */}
              <span className="text-[10px] font-black text-brand-primary block mb-3">👥 اختر الزميل المتاح لإرسال دعوة التحدي:</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {allUsers
                  .filter(u => {
                    const q = searchQuery.toLowerCase().trim();
                    return !q || 
                           u.fullName.toLowerCase().includes(q) || 
                           u.username.toLowerCase().includes(q) || 
                           u.engineeringField.toLowerCase().includes(q);
                  })
                  .map((usr) => (
                    <div 
                      key={usr.id} 
                      className="flex items-center justify-between p-3.5 bg-dark-bg border border-dark-border rounded-2xl hover:border-brand-primary/45 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${usr.username}`}
                          alt={usr.fullName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl bg-dark-card object-cover border border-dark-border group-hover:border-brand-primary"
                        />
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-black text-white group-hover:text-brand-primary transition-colors">{usr.fullName}</span>
                          <span className="text-[9px] text-dark-muted mt-0.5">@{usr.username} • {usr.engineeringField}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInviteUser(usr)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/95 text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Phone className="w-3 h-3" />
                        دعوة وتحدي
                      </button>
                    </div>
                  ))}

                {/* Empty check */}
                {allUsers.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-dark-muted text-xs">
                     لا يوجد أعضاء آخرين في الذاكرة حالياً. يمكنك تصفح الأعضاء الافتراضية للتسابق معهم!
                  </div>
                )}
              </div>

            </div>

            {/* CALLING PENDING SCREEN */}
            {inviteStatus !== 'idle' && opponent && (
              <div className="bg-dark-card border border-brand-primary/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-slide-up">
                <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none animate-pulse"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={opponent.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent.username}`}
                        alt={opponent.fullName}
                        className={`w-16 h-16 rounded-2xl border-2 ${inviteStatus === 'calling' ? 'border-amber-400 animate-pulse' : 'border-brand-primary'} object-cover`}
                      />
                      {inviteStatus === 'calling' && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[8px] px-1.5 py-0.5 rounded-full font-extrabold animate-bounce">
                          يرن.. RING
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] font-black text-brand-primary block uppercase tracking-wider">
                        {inviteStatus === 'calling' ? 'اتصال ودعوة سباق السيارات مفعّلة' : 'تم قبول دعوة الانضمام والسباق!'}
                      </span>
                      <h3 className="text-base font-black text-white mt-1">{opponent.fullName}</h3>
                      <p className="text-xs text-dark-muted mt-0.5">
                        {inviteStatus === 'calling' 
                          ? 'ننتظر إشارة الموافقة وتجهيز محرك السباق من الطرف الآخر...' 
                          : 'المكالمة الصوتية متصلة وتشغيل القناة النصية نشط. تفضل للمرأب لاختيار مركبتك!'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {inviteStatus === 'accepted' ? (
                      <button
                        onClick={startGarageScreen}
                        className="px-5 py-3 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary font-black text-xs flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all scale-100 hover:scale-105"
                      >
                        <Car className="w-4 h-4" />
                        دخول المرأب المرئي والمتابعة 🏎️
                      </button>
                    ) : (
                      <button
                        onClick={() => setInviteStatus('idle')}
                        className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                      >
                        إلغاء التحدي
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick preview of welcome bubble dialogue in call */}
                {inviteStatus === 'accepted' && (
                  <div className="mt-4 p-3.5 bg-dark-bg/85 rounded-2xl border border-dark-border/70 flex gap-3 text-right">
                    <span className="text-lg">💬</span>
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-brand-primary">المهندس @{opponent.username}:</span>
                      <p className="text-xs text-dark-text mt-0.5 font-medium">{getOpponentGreeting(opponent)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SOLO QUICKPLAY FALLBACK */}
            {gameMode === 'solo' && (
              <div className="bg-dark-card border border-brand-primary/20 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="text-right">
                  <h4 className="text-xs font-black text-white">القيادة الحرة وتجربة محركات سيارات المهندسين (منفرد)</h4>
                  <p className="text-[10px] text-dark-muted mt-0.5">تدرّب على المنعطفات، التقط التوربو وتسارع بدون خصم لتسجيل أفضل توقيت قياسي!</p>
                </div>
                <button
                  onClick={() => {
                    setOpponent({
                      id: 'solo_practice_bot',
                      username: 'practice_mode',
                      fullName: isRtl ? 'سيارة تجريبية (روبوت)' : 'Practice Drone (AI)',
                      email: 'practice@example.com',
                      engineeringField: 'تدريب ميكانيكي',
                      isPrivate: false,
                      isVerified: false,
                      followersCount: 0,
                      followingCount: 0,
                      postsCount: 0
                    });
                    startGarageScreen();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary font-black text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  ابدأ التدريب الفوري
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* SCREEN 2: GARAGE VEHICLE SELECTION (مرأب تعديل وتجهيز المحركات) */}
      {screen === 'garage' && opponent && (
        <div className="space-y-6 animate-fade-in text-right">
          
          <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg flex flex-col lg:flex-row items-center gap-6">
            
            {/* CAR MODEL PRESENTATION CARD CONTAINER (1/2) */}
            <div className="w-full lg:w-1/2 space-y-4">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-wider block">🚗 مرأب مهندسي العرب المطور</span>
              <h2 className="text-lg font-black text-white">اختر وصمم سيارة التوربو الهندسية الخاصة بك</h2>
              
              {/* Specialized dynamic parameters representation */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'compiler',
                    name: 'Turbo Compiler 💻',
                    desc: 'المطور البرمجي - تسارع هائل بفضل الاستجابة السريعة لمصفوفة المعالج.',
                    color: '#0d9488',
                    specs: { speed: 80, handling: 72, accel: 95 }
                  },
                  {
                    id: 'dynamo',
                    name: 'Mechanical Dynamo ⚙️',
                    desc: 'الميكانيك والحديد - عزم دوران شديد يعطي سرعة قصوى فائقة لسباقات الطرق المستقيمة.',
                    color: '#f97316',
                    specs: { speed: 95, handling: 60, accel: 70 }
                  },
                  {
                    id: 'cruiser',
                    name: 'BIM Civil Cruiser 📐',
                    desc: 'الإنشائي والمدني - معامل ثبات وتماسك عريض يعطي سهولة مذهلة على المنعطفات الزلقة.',
                    color: '#0ea5e9',
                    specs: { speed: 76, handling: 96, accel: 78 }
                  },
                  {
                    id: 'tanker',
                    name: 'Structural Tanker 🏗️',
                    desc: 'الرافعة والعتاد - سرعة ثابتة وهيكل صلب يتفوق عند التصادم بالأقماع والحواجز.',
                    color: '#eab308',
                    specs: { speed: 70, handling: 80, accel: 85 }
                  }
                ].map((car) => (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarModel(car.id as any)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${selectedCarModel === car.id ? 'bg-dark-bg border-brand-primary shadow-inner ring-1 ring-brand-primary/40' : 'bg-dark-bg/40 border-dark-border hover:border-dark-border/90'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: car.color }}></span>
                      <h3 className="text-xs font-black text-white">{car.name}</h3>
                    </div>
                    <p className="text-[9px] text-dark-muted mt-2 leading-relaxed h-[36px] overflow-hidden">{car.desc}</p>
                    
                    {/* Tiny spec progress bar indicators */}
                    <div className="space-y-1.5 mt-3 pt-2.5 border-t border-dark-border/40 w-full">
                      <div className="flex items-center justify-between text-[8px] font-mono">
                        <span className="text-dark-muted">السرعة القصوى</span>
                        <span className="text-white font-bold">{car.specs.speed}%</span>
                      </div>
                      <div className="w-full bg-dark-card h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary rounded-full" style={{ width: `${car.specs.speed}%`, backgroundColor: car.color }}></div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] font-mono">
                        <span className="text-dark-muted">التوجيه والانعطاف</span>
                        <span className="text-white font-bold">{car.specs.handling}%</span>
                      </div>
                      <div className="w-full bg-dark-card h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-secondary rounded-full" style={{ width: `${car.specs.handling}%` }}></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* VEHICLE VISUALIZED GRAPHICS PREVIEW CONTAINER (2/2) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-dark-bg/85 border border-dark-border p-6 rounded-3xl relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[10px] font-bold text-dark-muted">معاينة ثلاثية الأبعاد لمحرك السيارة</span>
              
              {/* A beautiful scalable vector styled car chassis */}
              <div className="p-8 relative w-44 h-72 rounded-3xl border border-brand-primary/20 bg-dark-card/90 flex items-center justify-center animate-pulse">
                {/* Wheels mockup */}
                <div className="absolute top-8 -left-2.5 w-5 h-10 bg-slate-900 rounded-lg"></div>
                <div className="absolute top-8 -right-2.5 w-5 h-10 bg-slate-900 rounded-lg"></div>
                <div className="absolute bottom-10 -left-2.5 w-5 h-10 bg-slate-900 rounded-lg"></div>
                <div className="absolute bottom-10 -right-2.5 w-5 h-10 bg-slate-900 rounded-lg"></div>

                {/* Spoiler */}
                <div className="absolute bottom-3 left-4 right-4 h-3 bg-slate-800 rounded-sm border-t border-slate-700"></div>

                {/* Dynamic Car Chassis Body based on Selection color */}
                <div 
                  className="w-24 h-52 rounded-2xl relative border border-white/25 flex flex-col items-center transition-all duration-300"
                  style={{
                    backgroundColor: {
                      compiler: '#0d9488',
                      dynamo: '#f97316',
                      cruiser: '#0ea5e9',
                      tanker: '#eab308'
                    }[selectedCarModel]
                  }}
                >
                  <div className="w-12 h-14 bg-slate-900/80 rounded-xl mt-12 border border-slate-700/80 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold tracking-widest font-mono">EH_GP</span>
                  </div>
                  {/* Engine Hood visual details */}
                  <div className="w-16 h-8 border-b-2 border-dashed border-white/20 mt-6 rounded-md"></div>
                  
                  {/* Digital headlights */}
                  <div className="absolute top-1 left-2.5 w-2 h-4 bg-yellow-300 rounded-b-md shadow-md"></div>
                  <div className="absolute top-1 right-2.5 w-2 h-4 bg-yellow-300 rounded-b-md shadow-md"></div>
                </div>
              </div>

              {/* ACTION: Launch race engine */}
              <div className="flex items-center gap-3.5 mt-5 w-full">
                <button
                  onClick={() => setScreen('lobby')}
                  className="flex-1 py-3 px-4 bg-dark-card border border-dark-border text-dark-text hover:bg-dark-border/70 rounded-xl text-xs font-bold transition-all"
                >
                  الرجوع للردهة
                </button>
                <button
                  onClick={launchRaceGame}
                  className="flex-3 py-3 px-6 bg-brand-primary text-white hover:bg-brand-secondary rounded-xl text-xs font-black tracking-wider transition-all shadow-lg shadow-brand-primary/10 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  بدء وحقن تسارع التحدي الفوري 🏎️🔥
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SCREEN 3: ACTIVE RACE ENVIRONMENT IN REALTIME (شاشة الحلبة والمكافحة) */}
      {screen === 'race' && opponent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in">
          
          {/* THE RENDERING CANVAS AND TOUCH STICK PANEL (LEFT 1/2 + 1/3) */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="relative rounded-3xl overflow-hidden border-2 border-dark-border shadow-2xl bg-[#0f172a]">
              
              {/* Countdown overlay overlay */}
              {raceCountdown !== '' && (
                <div className="absolute inset-0 bg-dark-bg/85 backdrop-blur-xs flex flex-col items-center justify-center z-25">
                  <div className="w-20 h-20 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full flex items-center justify-center text-4xl font-extrabold shadow-inner animate-pulse">
                    {typeof raceCountdown === 'number' ? raceCountdown : '🚦'}
                  </div>
                  <span className="text-sm font-black text-white mt-4 font-mono select-none">
                    {typeof raceCountdown === 'number' ? 'استعد للضغط والتحكم!' : raceCountdown}
                  </span>
                </div>
              )}

              {/* The high power rendering canvas */}
              <canvas
                ref={canvasRef}
                width={500}
                height={550}
                className="w-full max-w-full aspect-[500/550] block bg-dark-card"
              />

              {/* In game dashboard HUD overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none select-none z-10">
                
                {/* Distance completed indicator */}
                <div className="p-2.5 rounded-xl bg-dark-bg/90 border border-dark-border/80 flex flex-col">
                  <span className="text-[8px] text-dark-muted font-black">🏁 المسافة المقطوعة</span>
                  <span className="text-xs font-black text-brand-primary font-mono block mt-0.5">
                    {carsRef.current.find(c => c.isPlayer) 
                      ? `${Math.min(100, Math.floor((carsRef.current.find(c => c.isPlayer)!.y / trackLength) * 100))}%`
                      : '0%'}
                  </span>
                </div>

                {/* Keyboard keys preview shortcut list */}
                <div className="hidden sm:flex items-center gap-1 bg-dark-bg/80 border border-dark-border/60 p-2 rounded-xl text-[9px] text-dark-muted">
                  <span className="border border-dark-border px-1.5 py-0.5 rounded-md bg-dark-card">W/⬆️ غاز</span>
                  <span className="border border-dark-border px-1.5 py-0.5 rounded-md bg-dark-card">A/⬅️ يسار</span>
                  <span className="border border-dark-border px-1.5 py-0.5 rounded-md bg-dark-card">D/➡️ يمين</span>
                  <span className="border border-dark-border px-1.5 py-0.5 rounded-md bg-dark-card">SPACE توربو</span>
                </div>

              </div>

              {/* Nitro booster indicator visual */}
              {carsRef.current.find(c => c.isPlayer)?.isNitro && (
                <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none z-10 animate-pulse">
                  <span className="px-4 py-1.5 rounded-full bg-teal-500 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-md border border-teal-300">
                    ⚡ النيترو والاندفاع مفعّل 🚀💨 ⚡
                  </span>
                </div>
              )}

              {/* ========================================================= */}
              {/* CUSTOM IN-GAME CHAT UI OVERLAY (DRAPED DIRECTLY OVER CANVAS) */}
              {/* ========================================================= */}
              {!isChatOverlayOpen && (
                <button
                  onClick={() => setIsChatOverlayOpen(true)}
                  className="absolute bottom-4 right-4 z-20 p-2.5 rounded-2xl bg-brand-primary text-white shadow-xl hover:scale-105 active:scale-95 transition-all text-[10px] font-black flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>عرض الدردشة الحية 💬</span>
                </button>
              )}

              {isChatOverlayOpen && (
                <div className="absolute bottom-20 sm:bottom-4 right-3 z-20 w-64 sm:w-72 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[320px] sm:max-h-[380px] animate-slide-up text-right">
                  {/* Overlay Header with collapsible button and sender profile selector */}
                  <div className="bg-slate-900/90 px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-white">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                      <span className="font-black text-[9px] tracking-wide">دردشة الغرفة 🔴</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Testing back-and-forth selection */}
                      <button
                        onClick={() => setChatSenderRole(r => r === 'player' ? 'opponent' : 'player')}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold transition-all border ${chatSenderRole === 'player' ? 'bg-brand-primary/20 border-brand-primary/45 text-brand-primary' : 'bg-rose-500/20 border-rose-500/45 text-rose-400'}`}
                        title="تغيير المرسل لاختبار المحادثة الفورية"
                      >
                         المرسل: {chatSenderRole === 'player' ? 'أنا' : 'الخصم'}
                      </button>
                      <button
                        onClick={() => setIsChatOverlayOpen(false)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="تصغير الدردشة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Room-specific Quick dialogue presets */}
                  <div className="p-1.5 px-2 border-b border-white/5 bg-slate-950/40 flex flex-wrap gap-1 justify-end">
                    {[
                      '🏎️ سأتجاوزك!',
                      '⚙️ ميكانيك جبار!',
                      '⚠️ منعطف حاد!',
                      '⚡ توربو نفاث!'
                    ].map((ph) => (
                      <button
                        key={ph}
                        onClick={() => sendChatMessage(ph)}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-brand-primary/20 hover:text-brand-primary text-[8px] rounded text-slate-200 transition-all font-bold"
                      >
                        {ph}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable chat messages feed */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 max-h-[170px] sm:max-h-[220px]">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${msg.sender === 'player' ? 'mr-auto text-left' : 'ml-auto text-right'}`}
                      >
                        <span className="text-[7px] text-slate-400 mb-0.5 px-0.5 font-extrabold">
                          {msg.senderName} {msg.sender === 'player' ? '👤' : '🏁'}
                        </span>
                        <div
                          className={`p-2.5 rounded-xl text-[10px] leading-relaxed break-words font-medium ${
                            msg.sender === 'player'
                              ? 'bg-brand-primary text-white rounded-tl-none font-sans'
                              : 'bg-slate-900/90 border border-white/15 text-slate-100 rounded-tr-none font-sans'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[6px] text-slate-500 font-mono mt-0.5 px-0.5">{msg.timestamp}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Text typing controller in overlay */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChatMessage(chatInput);
                    }}
                    className="p-2 bg-slate-900 border-t border-white/10 flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      placeholder="دردش وعلق هنا..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-brand-primary placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      className="p-1 px-2.5 rounded-lg bg-brand-primary hover:bg-brand-secondary text-white transition-all text-[9.5px] font-black"
                    >
                      إرسال
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* HIGHLY RESPONSIVE MOBILE TOUCH SCREEN ACTION PAD (Optimized for handheld testing) */}
            <div className="block lg:hidden bg-dark-card border border-dark-border rounded-3xl p-4 shadow-lg">
              <span className="text-[8px] font-black text-dark-muted block mb-2 text-center">أزرار التحكم باللمس لأجهزة الموبايل 📱</span>
              
              <div className="flex items-center justify-between gap-5">
                
                {/* Steer controls left/right */}
                <div className="flex items-center gap-2">
                  <button
                    onTouchStart={() => triggerMobileSteer('left')}
                    onTouchEnd={() => triggerMobileSteer('none')}
                    onMouseDown={() => triggerMobileSteer('left')}
                    onMouseUp={() => triggerMobileSteer('none')}
                    className="w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-dark-text hover:text-brand-primary active:bg-brand-primary/10 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onTouchStart={() => triggerMobileSteer('right')}
                    onTouchEnd={() => triggerMobileSteer('none')}
                    onMouseDown={() => triggerMobileSteer('right')}
                    onMouseUp={() => triggerMobileSteer('none')}
                    className="w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-dark-text hover:text-brand-primary active:bg-brand-primary/10 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Secondary mid screen active Nitro Trigger button */}
                <button
                  onClick={triggerMobileNitro}
                  className="w-20 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/40 text-teal-400 hover:bg-teal-500 hover:text-slate-950 flex flex-col items-center justify-center gap-0.5 transition-all text-[9px] font-black cursor-pointer"
                >
                  <Zap className="w-5 h-5 animate-bounce" />
                  حقن توربو
                </button>

                {/* Acceleration and reverse braking pedals */}
                <div className="flex items-center gap-2">
                  <button
                    onTouchStart={() => triggerMobileGas(true)}
                    onTouchEnd={() => triggerMobileGas(false)}
                    onMouseDown={() => triggerMobileGas(true)}
                    onMouseUp={() => triggerMobileGas(false)}
                    className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                  >
                    غاز SPEED
                  </button>
                  <button
                    onTouchStart={() => triggerMobileBrake(true)}
                    onTouchEnd={() => triggerMobileBrake(false)}
                    onMouseDown={() => triggerMobileBrake(true)}
                    onMouseUp={() => triggerMobileBrake(false)}
                    className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                  >
                    فرامل
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* TWO WAY DIAGNOSTIC & EMULATED CONTROL PANEL (RIGHT 1/3) */}
          <div className="lg:col-span-4 flex flex-col h-[550px] bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-lg text-right">
            
            {/* Header info bar */}
            <div className="bg-dark-bg p-3.5 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-white">لوحة تشخيص وتوجيه المضمار اللاسلكية</span>
              </div>
              <span className="text-[9px] text-brand-primary font-mono font-bold">ONLINE</span>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-none">
              
              {/* Voice Call Telemetry Card */}
              <div className="bg-dark-bg/60 border border-dark-border/80 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-dark-muted">قناة مكالمة مهندسي العرب المزدوجة</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black">
                     متصل لاسلكياً
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={opponent?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent?.username}`}
                      alt={opponent?.fullName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl bg-slate-800 border border-dark-border object-cover"
                    />
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black text-white">{opponent?.fullName}</span>
                      <span className="text-[9px] text-dark-muted mt-0.5">@{opponent?.username} • {opponent?.engineeringField}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-xl border transition-all ${isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-dark-card border-dark-border text-slate-300 hover:text-white'}`}
                      title={isMuted ? 'إلغاء كتم المايك' : 'كتم المايك'}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsVoiceConnected(false);
                        setChatMessages(prev => [...prev, {
                          id: 'msg_sys_phone_' + Date.now(),
                          sender: 'opponent',
                          senderName: 'نظام السباق',
                          text: '⚠️ تم إنهاء المكالمة الصوتية الفعالة.',
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }]);
                      }}
                      className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title="إنهاء المكالمة"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* HUD Chat Toggle & Role Simulation Helper */}
              <div className="bg-dark-bg/60 border border-dark-border/80 p-3 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-dark-muted">التحكم في غلاف الدردشة الحية</span>
                  <button
                    onClick={() => setIsChatOverlayOpen(!isChatOverlayOpen)}
                    className={`px-2.5 py-1 rounded-xl text-[9px] font-black border transition-all ${isChatOverlayOpen ? 'bg-brand-primary/25 border-brand-primary text-white font-bold' : 'bg-dark-card border-dark-border text-dark-muted'}`}
                  >
                    {isChatOverlayOpen ? 'إخفاء الدردشة 👁️‍🗨️' : 'عرض الدردشة 💬'}
                  </button>
                </div>
                <p className="text-[9px] text-dark-muted leading-relaxed">
                   تم دمج الدردشة المشتركة كـ <b>غلاف مدمج (UI Overlay) مخصص</b> على شاشة اللعبة مباشرة لكي تتسابق وتدردش معاً!
                </p>

                {/* Simulated Peer Messaging Area */}
                <div className="pt-2.5 border-t border-dark-border/60">
                  <span className="text-[9px] font-extrabold text-brand-primary block mb-2">محاكي اختبار الاتصالات اللاسلكية:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const phrases = [
                          'سيارتي التوربو مستقرة جداً على المسار! ⚙️🏁',
                          'انتبه! لقد قمت بتفعيل تبريد محرك النيترو! ⚡🔋',
                          'المنعطفات القادمة تحتاج لفرامل ومناورة ذكية! ⚠️',
                          'سباق رائع وهندسة نظيفة جداً! 🏎️🤝',
                          'عزم الدوران في سيارتي يعطي دفعة تسارع خيالية!'
                        ];
                        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
                        sendChatMessage(randomPhrase, 'opponent');
                      }}
                      className="py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[9px] font-bold transition-all text-center cursor-pointer"
                    >
                      💬 محاكاة رد من الخصم
                    </button>

                    <button
                      onClick={() => {
                        sendChatMessage("مصفوفة التدفق عندي تسير بكفاءة 100%! 🛠️☕", "player");
                      }}
                      className="py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-[9px] font-bold transition-all text-center cursor-pointer"
                    >
                      💬 إرسال رسالة سريعة من طرفي
                    </button>
                  </div>
                </div>
              </div>

              {/* Telemetry and Specs */}
              <div className="bg-dark-bg/60 border border-dark-border/80 p-3 rounded-2xl space-y-2.5">
                <span className="text-[9px] font-extrabold text-white block">📡 بيانات تتبع المحركات الفورية (Telemetry)</span>
                
                <div className="space-y-1.5 font-mono text-[9px]">
                  <div className="flex justify-between items-center text-dark-muted">
                    <span>نسبة الاتصال والشبكة</span>
                    <span className="text-emerald-400 font-bold">🎯 مستقر (99.8%)</span>
                  </div>
                  <div className="flex justify-between items-center text-dark-muted">
                    <span>زمن الاستجابة (Latency)</span>
                    <span className="text-white font-bold">14ms - 32ms</span>
                  </div>
                  <div className="flex justify-between items-center text-dark-muted">
                    <span>تشفير مصفوفة الصوت</span>
                    <span className="text-white font-bold">AES-256 GCM</span>
                  </div>
                  <div className="flex justify-between items-center text-dark-muted">
                    <span>طاقة الـ CPU والمحرك</span>
                    <span className="text-brand-secondary font-bold">60Hz Physics Rate</span>
                  </div>
                </div>
              </div>

              {/* Race guidelines and rules */}
              <div className="p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/15">
                <span className="text-[9px] font-black text-brand-primary block mb-1">💡 نصائح سباق لمهندسي السيارات</span>
                <p className="text-[9px] text-dark-muted leading-relaxed">
                  تجنب تماماً الحواجز والأقماع الملونة، حيث تؤدي لحدوث اصطدام مروحي يخفض السرعة مؤقتاً. احصل على بطاريات الطاقة الصفراء لشحن طاقة التوربو!
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SCREEN 4: RESULTS CHAMPIONSHIP SCORES (النتائج وحساب النقاط) */}
      {screen === 'results' && opponent && (
        <div className="max-w-xl mx-auto space-y-6 animate-scale-up text-right">
          
          <div className="bg-dark-card border-2 border-brand-primary/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-brand-primary px-4 py-1.5 text-[10px] font-black text-white rounded-br-2xl">
              سباق منتهي
            </div>

            <div className="text-center py-5 space-y-3.5">
              <span className="text-4xl">🏁</span>
              <h2 className="text-xl font-black text-white">إلى خط النهاية بنجاح!</h2>
              <p className="text-xs text-dark-muted">لقد تنافستم بجدارة وقمتم بتحقيق نتائج هندسية مذهلة على الحلبة!</p>
              
              {isUserWinner() ? (
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black rounded-2xl inline-flex items-center gap-1.5 text-xs animate-bounce mt-2">
                  <Award className="w-4 h-4" />
                  لقد حققت المرتبة الأولى وهزمت الخصم! كود التوربو فائز 🏆
                </div>
              ) : (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold rounded-2xl inline-flex items-center gap-1.5 text-xs mt-2">
                  <ShieldAlert className="w-4 h-4" />
                  حسابات الخصم كانت الأفضل المرة هذه! حاول تحسين المحرك والفرامل مجدداً!
                </div>
              )}
            </div>

            {/* RESULTS DETAILS LEADERBOARD */}
            <div className="bg-dark-bg/70 border border-dark-border rounded-2xl p-4 mt-4 space-y-3">
              <span className="text-[10px] font-black text-brand-primary block mb-2 text-right">📊 لوائح السرعة والوصول النهائي:</span>
              
              {getSortedRaceResults().map((car, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${car.isPlayer ? 'bg-brand-primary/10 border-brand-primary/40' : 'bg-dark-card/65 border-dark-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-500 text-slate-950' : 'bg-dark-bg text-dark-muted border border-dark-border'}`}>
                      #{index + 1}
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black text-white">{car.name}</span>
                      <span className="text-[9px] text-dark-muted block mt-0.5">{car.isPlayer ? 'سيارتك' : 'المهندس الخصم'} • {selectedCarModel.toUpperCase()}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-brand-primary">
                    +{index === 0 ? '150 pts' : index === 1 ? '90 pts' : '50 pts'}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center gap-3.5 mt-6 pt-5 border-t border-dark-border/40">
              <button
                onClick={() => setScreen('lobby')}
                className="flex-1 py-3 bg-dark-bg border border-dark-border hover:bg-dark-border/70 rounded-xl text-xs font-bold transition-all text-dark-text cursor-pointer text-center"
              >
                العودة للردهة والبحث عن خصم آخر
              </button>
              <button
                onClick={launchRaceGame}
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-black transition-all cursor-pointer text-center"
              >
                إعادة التحدي الفوري 🔄
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
