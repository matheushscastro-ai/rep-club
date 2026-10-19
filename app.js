const STORAGE_KEY = "rep-club-demo-v3";
const PLAYERS_STORAGE_KEY = "rep-club-players-v1";
const PRIZE_STORAGE_KEY = "rep-club-prize-v1";
const PERIOD_STORAGE_KEY = "rep-club-period-v1";
const SCOREBOARD_STYLE_KEY = "rep-club-score-style-v2";
const CHALLENGES_STORAGE_KEY = "rep-club-challenges-v2";
const ACTIVE_CHALLENGE_KEY = "rep-club-active-challenge-v2";
const firebaseConfig = {
  apiKey: "AIzaSyCWCyQ-2XLKrkJ_Z1_saihANmcD1Oz6lCI",
  authDomain: "mathub-f08b6.firebaseapp.com",
  databaseURL: "https://mathub-f08b6-default-rtdb.firebaseio.com",
  projectId: "mathub-f08b6",
  storageBucket: "mathub-f08b6.firebasestorage.app",
  messagingSenderId: "298779617555",
  appId: "1:298779617555:web:6a5d5bdf022d37c86412e6",
  measurementId: "G-3XNWNEEXMK"
};

let fbApp = null;
let fbDb = null;
let fbAuth = null;
try {
  if (window.firebase) {
    fbApp = window.firebase.initializeApp(firebaseConfig);
    fbDb = window.firebase.database();
    fbAuth = window.firebase.auth();
    fbAuth.onAuthStateChanged((user) => {
      if (!user) {
        fbAuth.signInAnonymously().catch(() => {});
      }
    });
  }
} catch (e) {
  console.warn("Firebase init error:", e);
}

const PLAYER_PALETTE = [
  { color: "#d7fa52", text: "#111827", name: "Lime" },
  { color: "#4664ea", text: "#ffffff", name: "Azul" },
  { color: "#f59e0b", text: "#111827", name: "Âmbar" },
  { color: "#ec4899", text: "#ffffff", name: "Rosa" },
  { color: "#8b5cf6", text: "#ffffff", name: "Roxo" },
  { color: "#06b6d4", text: "#111827", name: "Ciano" },
  { color: "#10b981", text: "#ffffff", name: "Esmeralda" },
  { color: "#f43f5e", text: "#ffffff", name: "Vermelho" },
];

const DEFAULT_PLAYERS = [
  { id: "player-1", name: "Matheus", short: "M", side: "me", color: PLAYER_PALETTE[0].color, textColor: PLAYER_PALETTE[0].text },
  { id: "player-2", name: "Rafa", short: "R", side: "rival", color: PLAYER_PALETTE[1].color, textColor: PLAYER_PALETTE[1].text },
];

function loadPlayerConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYERS_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length >= 2 && saved.every((player) => typeof player.name === "string" && player.name.trim())) {
      return saved.map((player, index) => {
        const palette = PLAYER_PALETTE[index % PLAYER_PALETTE.length];
        return {
          id: player.id || `player-${index + 1}`,
          name: player.name.trim(),
          short: player.name.trim().charAt(0).toUpperCase(),
          side: index === 0 ? "me" : index === 1 ? "rival" : `other-${index + 1}`,
          color: player.color || palette.color,
          textColor: player.textColor || palette.text,
        };
      });
    }
  } catch (error) {
    console.warn("Não foi possível ler a configuração dos jogadores.", error);
  }
  return null;
}

let playerConfig = loadPlayerConfig();
let PLAYERS = playerConfig || DEFAULT_PLAYERS;
let challengePrize = localStorage.getItem(PRIZE_STORAGE_KEY);
let scoreboardStyle = localStorage.getItem(SCOREBOARD_STYLE_KEY) || "classic";
const DEFAULT_PROGRAM = {
  id: "program-jiu-cardio",
  name: "Treino Jiu + Cardio",
  structure: "ABCDE",
  sessions: [
    {
      id: "A", day: "SEGUNDA", title: "Costas, Bíceps e Posterior de Coxa", exercises: [
        { name: "Pulldown na Polia Alta", sets: 4, min: 8, max: 10 },
        { name: "Remada Baixa Sentada no Cabo", sets: 4, min: 8, max: 10 },
        { name: "RDL com Halteres", sets: 4, min: 8, max: 10, loadFactor: 2 },
        { name: "Cadeira Flexora", sets: 3, min: 12, max: 15 },
        { name: "Rosca Martelo Sentado", sets: 3, min: 10, max: 12, loadFactor: 2 },
        { name: "Dead Hang na Barra Fixa", sets: 3, min: 30, max: 40, unit: "s", load: false },
      ],
    },
    {
      id: "B", day: "TERÇA", title: "Peito, Tríceps e Quadríceps", exercises: [
        { name: "Supino Reto com Halteres", sets: 4, min: 8, max: 10, loadFactor: 2 },
        { name: "Supino Vertical na Máquina", sets: 3, min: 10, max: 12 },
        { name: "Leg Press 45º", sets: 4, min: 8, max: 10, alternatives: ["Leg Press 45º", "Agachamento Goblet"] },
        { name: "Afundo com Halteres", sets: 3, min: 10, max: 12, alternatives: ["Afundo com Halteres", "Cadeira Extensora"], note: "por perna", loadFactor: 4 },
        { name: "Tríceps Corda na Polia", sets: 3, min: 12, max: 15 },
        { name: "Pallof Press no Cabo", sets: 3, min: 12, max: 12, note: "por lado" },
      ],
    },
    {
      id: "C", day: "QUARTA", title: "Leve: Cardio e Core", cardioBlock: { min: 30, max: 40, label: "Cardio contínuo · esteira, bike ou elíptico" }, exercises: [
        { name: "Abdominal Infra na Paralela", sets: 3, min: 15, max: 20, load: false },
        { name: "Prancha Abdominal", sets: 3, min: 45, max: 45, unit: "s", load: false },
      ],
    },
    {
      id: "D", day: "QUINTA", title: "Ombros, Costas Superior e Glúteos", exercises: [
        { name: "Desenvolvimento com Halteres Sentado", sets: 4, min: 8, max: 10, loadFactor: 2 },
        { name: "Elevação Lateral com Halteres", sets: 4, min: 12, max: 15, loadFactor: 2 },
        { name: "Remada Unilateral com Halter (Serrote)", sets: 3, min: 10, max: 12, note: "por lado", loadFactor: 2 },
        { name: "Remada Alta na Polia", sets: 3, min: 12, max: 15 },
        { name: "Elevação Pélvica na Máquina", sets: 4, min: 10, max: 12, alternatives: ["Elevação Pélvica na Máquina", "Elevação Pélvica no Smith"] },
      ],
    },
    {
      id: "E", day: "SEXTA", title: "Leve: Cardio e Prevenção", cardioBlock: { min: 20, max: 30, label: "Cardio · aquecimento ativo" }, exercises: [
        { name: "Face Pull na Polia", sets: 3, min: 15, max: 20 },
        { name: "Rotação Externa de Ombro na Polia", sets: 3, min: 15, max: 15 },
        { name: "Encolhimento de Ombros com Halteres", sets: 3, min: 12, max: 15, loadFactor: 2 },
        { name: "Extensão Lombar no Banco (Cadeira Romana)", sets: 3, min: 15, max: 15, load: false },
      ],
    },
  ]
};

const PREGNANCY_PROGRAM = {
  id: "program-gravida",
  name: "Grávida - nem parada nem correndo",
  structure: "ABC",
  sessions: [
    {
      id: "A",
      day: "DIA 1",
      title: "Pernas e Estabilidade Pélvica (~30-35 min)",
      exercises: [
        { name: "Gato-Vaca em 4 Apoios (Aquecimento)", sets: 2, min: 8, max: 10, unit: "reps", load: false, factor: 1, loadFactor: 1 },
        { name: "Círculos de Quadril na Bola Suíça/Em Pé (Aquecimento)", sets: 2, min: 10, max: 10, unit: "voltas/lado", load: false, factor: 1, loadFactor: 1 },
        { name: "Alongamento Peitoral na Parede/Porta (Aquecimento)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1, loadFactor: 1 },
        { name: "Sentar e Levantar do Banco/Cadeira", sets: 3, min: 10, max: 12, factor: 1, loadFactor: 1 },
        { name: "Elevação Pélvica com as Costas no Banco (Hip Thrust)", sets: 3, min: 10, max: 12, factor: 1, loadFactor: 1 },
        { name: "Remada Baixa no Cabo / Elástico Sentada", sets: 3, min: 12, max: 12, factor: 1, loadFactor: 1 },
        { name: "Respiração Diafragmática com Ativação Transversa", sets: 3, min: 8, max: 10, unit: "ciclos", load: false, factor: 1, loadFactor: 1 },
      ]
    },
    {
      id: "B",
      day: "DIA 2",
      title: "Membros Superiores e Postura (~30-35 min)",
      exercises: [
        { name: "Gato-Vaca em 4 Apoios (Aquecimento)", sets: 2, min: 8, max: 10, unit: "reps", load: false, factor: 1, loadFactor: 1 },
        { name: "Círculos de Quadril na Bola Suíça/Em Pé (Aquecimento)", sets: 2, min: 10, max: 10, unit: "voltas/lado", load: false, factor: 1, loadFactor: 1 },
        { name: "Alongamento Peitoral na Parede/Porta (Aquecimento)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1, loadFactor: 1 },
        { name: "Puxada Aberta na Polia (Pulldown Sentada)", sets: 3, min: 10, max: 12, factor: 1, loadFactor: 1 },
        { name: "Desenvolvimento de Ombros com Halteres Sentada em Banco", sets: 3, min: 10, max: 12, factor: 2, loadFactor: 2 },
        { name: "Flexão de Braços Inclinada na Parede / Barra Alta", sets: 3, min: 8, max: 10, unit: "reps", load: false, factor: 1, loadFactor: 1 },
        { name: "Rosca Martelo Sentada com Halteres", sets: 3, min: 12, max: 12, factor: 2, loadFactor: 2 },
      ]
    },
    {
      id: "C",
      day: "DIA 3",
      title: "Força Geral e Mobilidade de Parto (~30-35 min)",
      exercises: [
        { name: "Gato-Vaca em 4 Apoios (Aquecimento)", sets: 2, min: 8, max: 10, unit: "reps", load: false, factor: 1, loadFactor: 1 },
        { name: "Círculos de Quadril na Bola Suíça/Em Pé (Aquecimento)", sets: 2, min: 10, max: 10, unit: "voltas/lado", load: false, factor: 1, loadFactor: 1 },
        { name: "Alongamento Peitoral na Parede/Porta (Aquecimento)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1, loadFactor: 1 },
        { name: "Agachamento Sumô Livre com Apoio de Mãos", sets: 3, min: 8, max: 10, factor: 1, loadFactor: 1 },
        { name: "Face Pull na Polia / Elástico", sets: 3, min: 12, max: 15, factor: 1, loadFactor: 1 },
        { name: "Extensão de Quadril em 4 Apoios (Glúteo Coice)", sets: 3, min: 10, max: 10, factor: 2, loadFactor: 2 },
        { name: "Alongamento de Glúteo Sentada na Cadeira (Figura 4)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1, loadFactor: 1 },
      ]
    }
  ]
};

const TRAINING_PLANS = DEFAULT_PROGRAM.sessions;
const PROGRAMS_STORAGE_KEY = "rep-club-training-programs-v2";
const ACTIVE_PROGRAM_KEY = "rep-club-active-program-v2";

let trainingPrograms = [DEFAULT_PROGRAM, PREGNANCY_PROGRAM];
try {
  const savedPrograms = JSON.parse(localStorage.getItem(PROGRAMS_STORAGE_KEY) || "null");
  if (Array.isArray(savedPrograms) && savedPrograms.length > 0) {
    trainingPrograms = savedPrograms;
    if (!trainingPrograms.some((p) => p.id === DEFAULT_PROGRAM.id)) {
      trainingPrograms.unshift(DEFAULT_PROGRAM);
    }
    if (!trainingPrograms.some((p) => p.id === PREGNANCY_PROGRAM.id)) {
      trainingPrograms.push(PREGNANCY_PROGRAM);
    }
  }
} catch (e) {
  trainingPrograms = [DEFAULT_PROGRAM, PREGNANCY_PROGRAM];
}

let activeProgramId = localStorage.getItem(ACTIVE_PROGRAM_KEY) || trainingPrograms[0].id;
if (!trainingPrograms.some((p) => p.id === activeProgramId)) {
  activeProgramId = trainingPrograms[0].id;
}

function getActiveProgram() {
  return trainingPrograms.find((p) => p.id === activeProgramId) || trainingPrograms[0];
}

function saveTrainingPrograms() {
  localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(trainingPrograms));
  localStorage.setItem(ACTIVE_PROGRAM_KEY, activeProgramId);
}

const CUSTOM_PLANS_KEY = "rep-club-custom-plans-v1";

const FALLBACK_EXERCISE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44'%3E%3Crect width='44' height='44' rx='6' fill='%23e6e8de'/%3E%3Cpath d='M11 22h22M15 16v12M29 16v12' stroke='%23666' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E";

function getCatalogExerciseImage(ex) {
  if (ex && ex.folder) {
    return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.folder}/0.jpg`;
  }
  return FALLBACK_EXERCISE_SVG;
}

const STANDARD_EXERCISES_CATALOG = [
  {
    category: "Peito",
    exercises: [
      { name: "Supino Reto com Barra", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Barbell_Bench_Press_-_Medium_Grip" },
      { name: "Supino Reto com Halteres", sets: 4, min: 8, max: 10, loadFactor: 2, folder: "Dumbbell_Bench_Press" },
      { name: "Supino Inclinado com Halteres", sets: 4, min: 8, max: 10, loadFactor: 2, folder: "Incline_Dumbbell_Press" },
      { name: "Supino Inclinado com Barra", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Barbell_Incline_Bench_Press_-_Medium_Grip" },
      { name: "Supino Vertical na Máquina", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Leverage_Chest_Press" },
      { name: "Crucifixo Reto com Halteres", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "Dumbbell_Flyes" },
      { name: "Crucifixo Inclinado com Halteres", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "Incline_Dumbbell_Flyes" },
      { name: "Crossover na Polia Alta", sets: 3, min: 12, max: 15, loadFactor: 2, folder: "Cable_Crossover" },
      { name: "Peck Deck / Voador", sets: 3, min: 12, max: 15, loadFactor: 1, folder: "Butterfly" },
      { name: "Flexão de Braço no Chão", sets: 3, min: 12, max: 20, load: false, folder: "Pushups" }
    ]
  },
  {
    category: "Costas",
    exercises: [
      { name: "Pulldown na Polia Alta", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Wide-Grip_Lat_Pulldown" },
      { name: "Puxada com Pegada Triângulo", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Close-Grip_Front_Lat_Pulldown" },
      { name: "Remada Baixa Sentada no Cabo", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Seated_Cable_Rows" },
      { name: "Remada Curvada com Barra", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Bent_Over_Barbell_Row" },
      { name: "Remada Unilateral com Halter (Serrote)", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "One-Arm_Dumbbell_Row" },
      { name: "Remada Cavalinho (Barra T)", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Lying_T-Bar_Row" },
      { name: "Barra Fixa (Pronada ou Supinada)", sets: 3, min: 6, max: 12, load: false, folder: "Pullups" },
      { name: "Pullover com Halter ou Cabo", sets: 3, min: 12, max: 15, loadFactor: 1, folder: "Bent-Arm_Dumbbell_Pullover" },
      { name: "Face Pull na Polia", sets: 3, min: 12, max: 15, loadFactor: 1, folder: "Face_Pull" },
      { name: "Extensão Lombar (Cadeira Romana)", sets: 3, min: 12, max: 15, load: false, folder: "Hyperextensions_With_No_Hyperextension_Bench" }
    ]
  },
  {
    category: "Pernas & Glúteos",
    exercises: [
      { name: "Agachamento Livre com Barra", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Barbell_Full_Squat" },
      { name: "Agachamento no Smith", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Smith_Machine_Squat" },
      { name: "Leg Press 45º", sets: 4, min: 8, max: 12, loadFactor: 1, folder: "Leg_Press" },
      { name: "Agachamento Búlgaro", sets: 3, min: 8, max: 10, loadFactor: 2, folder: "Split_Squats" },
      { name: "Afundo com Halteres", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "Dumbbell_Lunges" },
      { name: "Cadeira Extensora", sets: 4, min: 10, max: 15, loadFactor: 1, folder: "Leg_Extensions" },
      { name: "Cadeira Flexora", sets: 4, min: 10, max: 15, loadFactor: 1, folder: "Seated_Leg_Curl" },
      { name: "Mesa Flexora", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Lying_Leg_Curls" },
      { name: "Stiff com Barra ou Halteres", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Stiff-Legged_Barbell_Deadlift" },
      { name: "RDL com Halteres", sets: 4, min: 8, max: 10, loadFactor: 2, folder: "Romanian_Deadlift" },
      { name: "Elevação Pélvica com Barra/Máquina", sets: 4, min: 10, max: 12, loadFactor: 1, folder: "Barbell_Glute_Bridge" },
      { name: "Cadeira Abdutora", sets: 3, min: 15, max: 20, loadFactor: 1, folder: "Thigh_Abductor" },
      { name: "Panturrilha em Pé", sets: 4, min: 12, max: 15, loadFactor: 1, folder: "Standing_Calf_Raises" },
      { name: "Panturrilha Sentado (Gêmeos)", sets: 4, min: 12, max: 15, loadFactor: 1, folder: "Seated_Calf_Raise" }
    ]
  },
  {
    category: "Ombros & Trapézio",
    exercises: [
      { name: "Desenvolvimento com Halteres Sentado", sets: 4, min: 8, max: 10, loadFactor: 2, folder: "Dumbbell_Shoulder_Press" },
      { name: "Desenvolvimento Militar com Barra", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "Standing_Military_Press" },
      { name: "Elevação Lateral com Halteres", sets: 4, min: 12, max: 15, loadFactor: 2, folder: "Side_Lateral_Raise" },
      { name: "Elevação Lateral na Polia", sets: 3, min: 12, max: 15, loadFactor: 1, folder: "Cable_Seated_Lateral_Raise" },
      { name: "Elevação Frontal com Halteres", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "Front_Dumbbell_Raise" },
      { name: "Remada Alta na Polia / Barra", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Upright_Barbell_Row" },
      { name: "Crucifixo Invertido na Máquina / Halteres", sets: 3, min: 12, max: 15, loadFactor: 2, folder: "Reverse_Flyes" },
      { name: "Encolhimento de Ombros com Halteres", sets: 4, min: 12, max: 15, loadFactor: 2, folder: "Dumbbell_Shrug" }
    ]
  },
  {
    category: "Bíceps & Tríceps",
    exercises: [
      { name: "Rosca Direta com Barra W", sets: 4, min: 8, max: 10, loadFactor: 1, folder: "EZ-Bar_Curl" },
      { name: "Rosca Martelo com Halteres", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "Hammer_Curls" },
      { name: "Rosca Scott na Máquina / Banco", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Preacher_Curl" },
      { name: "Rosca Inclinada com Halteres", sets: 3, min: 10, max: 12, loadFactor: 2, folder: "Incline_Dumbbell_Curl" },
      { name: "Tríceps Corda na Polia", sets: 4, min: 12, max: 15, loadFactor: 1, folder: "Triceps_Pushdown" },
      { name: "Tríceps Barra Reta na Polia", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Triceps_Pushdown" },
      { name: "Tríceps Testa com Barra W ou Halteres", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Lying_Triceps_Press" },
      { name: "Tríceps Francês com Halter", sets: 3, min: 10, max: 12, loadFactor: 1, folder: "Seated_Triceps_Press" },
      { name: "Mergulho em Paralelas / Banco", sets: 3, min: 8, max: 12, load: false, folder: "Bench_Dips" }
    ]
  },
  {
    category: "Abdômen & Core",
    exercises: [
      { name: "Abdominal Supra no Chão", sets: 3, min: 15, max: 20, load: false, folder: "Crunches" },
      { name: "Abdominal Infra na Paralela", sets: 3, min: 12, max: 15, load: false, folder: "Hanging_Leg_Raise" },
      { name: "Prancha Abdominal", sets: 3, min: 45, max: 60, unit: "s", load: false, folder: "Plank" },
      { name: "Abdominal na Polia Alta (Cable Crunch)", sets: 3, min: 12, max: 15, loadFactor: 1, folder: "Cable_Crunch" },
      { name: "Roda Abdominal (Ab Wheel)", sets: 3, min: 8, max: 12, load: false, folder: "Ab_Roller" },
      { name: "Pallof Press no Cabo", sets: 3, min: 12, max: 12, loadFactor: 1, folder: "Cable_Wrist_Curl" }
    ]
  },
  {
    category: "Cardio & Mobilidade",
    exercises: [
      { name: "Esteira / Corrida", sets: 1, min: 20, max: 30, unit: "min", load: false },
      { name: "Bicicleta Ergométrica", sets: 1, min: 20, max: 30, unit: "min", load: false },
      { name: "Elíptico", sets: 1, min: 20, max: 30, unit: "min", load: false },
      { name: "Pular Corda", sets: 3, min: 60, max: 120, unit: "s", load: false },
      { name: "Gato-Vaca em 4 Apoios", sets: 2, min: 8, max: 10, unit: "reps", load: false },
      { name: "Círculos de Quadril", sets: 2, min: 10, max: 10, unit: "reps", load: false }
    ]
  }
];

function buildExerciseCatalogSelectOptions() {
  return `
    <option value="">➕ Selecionar exercício do catálogo...</option>
    ${STANDARD_EXERCISES_CATALOG.map((group) => `
      <optgroup label="${group.category}">
        ${group.exercises.map((ex) => `<option value="${escapeHTML(ex.name)}" data-factor="${ex.loadFactor || 1}" data-sets="${ex.sets}" data-min="${ex.min}" data-max="${ex.max}" data-unit="${ex.unit || 'reps'}" data-load="${ex.load === false ? 'false' : 'true'}">${escapeHTML(ex.name)}</option>`).join("")}
      </optgroup>
    `).join("")}
    <option value="__custom__">✏️ Outro (digitar nome personalizado)...</option>
  `;
}

function getAllStandardExerciseNames() {
  const list = [];
  STANDARD_EXERCISES_CATALOG.forEach((g) => {
    g.exercises.forEach((e) => list.push(e.name));
  });
  return list;
}

function initExerciseAutocomplete(widgetEl, onSelect) {
  if (!widgetEl) return;
  const input = widgetEl.querySelector(".autocomplete-input");
  const dropdown = widgetEl.querySelector(".autocomplete-dropdown");
  const listEl = widgetEl.querySelector(".autocomplete-items-list");
  const clearBtn = widgetEl.querySelector(".autocomplete-clear-btn");
  const customBtn = widgetEl.querySelector(".autocomplete-custom-action");

  if (!input || !dropdown || !listEl) return;

  function renderList(query = "") {
    const q = (query || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let html = "";
    let totalMatches = 0;

    STANDARD_EXERCISES_CATALOG.forEach((group) => {
      const filtered = group.exercises.filter((ex) => {
        if (!q) return true;
        const normName = ex.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normCat = group.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normName.includes(q) || normCat.includes(q);
      });

      if (filtered.length > 0) {
        totalMatches += filtered.length;
        html += `<div class="autocomplete-category-header">${escapeHTML(group.category)}</div>`;
        filtered.forEach((ex) => {
          const imgUrl = getCatalogExerciseImage(ex);
          html += `
            <button type="button" class="autocomplete-item" data-ex-name="${escapeHTML(ex.name)}">
              <img class="autocomplete-thumb" src="${imgUrl}" alt="" loading="lazy" onerror="this.src='${FALLBACK_EXERCISE_SVG}'" />
              <div class="autocomplete-info">
                <strong class="autocomplete-name">${escapeHTML(ex.name)}</strong>
                <span class="autocomplete-sub">${escapeHTML(group.category)} · ${ex.sets} séries × ${ex.min}–${ex.max} ${ex.unit || 'reps'}${ex.load === false ? ' · Peso corporal' : ''}</span>
              </div>
              <span class="autocomplete-badge-add">+ Adicionar</span>
            </button>
          `;
        });
      }
    });

    if (totalMatches === 0) {
      html = `<div class="autocomplete-empty">Nenhum exercício encontrado para "${escapeHTML(query)}".</div>`;
    }

    listEl.innerHTML = html;

    if (customBtn) {
      if (q) {
        customBtn.innerHTML = `<span>➕ Adicionar "<strong>${escapeHTML(query.trim())}</strong>" como exercício personalizado</span>`;
      } else {
        customBtn.innerHTML = `<span>✏️ Digitar outro exercício personalizado...</span>`;
      }
    }

    if (clearBtn) {
      clearBtn.style.display = query ? "block" : "none";
    }

    dropdown.style.display = "block";
    try {
      dropdown.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {}
  }

  input.addEventListener("focus", () => {
    renderList(input.value);
  });

  input.addEventListener("input", () => {
    renderList(input.value);
  });

  listEl.addEventListener("click", (e) => {
    const item = e.target.closest(".autocomplete-item");
    if (item && item.dataset.exName) {
      const name = item.dataset.exName;
      input.value = "";
      dropdown.style.display = "none";
      if (clearBtn) clearBtn.style.display = "none";
      onSelect(name);
    }
  });

  customBtn?.addEventListener("click", () => {
    let name = input.value.trim();
    if (!name) {
      const promptVal = prompt("Digite o nome do exercício personalizado:");
      if (!promptVal || !promptVal.trim()) return;
      name = promptVal.trim();
    }
    input.value = "";
    dropdown.style.display = "none";
    if (clearBtn) clearBtn.style.display = "none";
    onSelect(name);
  });

  clearBtn?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    renderList("");
  });

  document.addEventListener("click", (e) => {
    if (!widgetEl.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.style.display = "none";
    } else if (e.key === "Enter") {
      e.preventDefault();
      const firstItem = listEl.querySelector(".autocomplete-item");
      if (firstItem && firstItem.dataset.exName) {
        onSelect(firstItem.dataset.exName);
        input.value = "";
        dropdown.style.display = "none";
        if (clearBtn) clearBtn.style.display = "none";
      } else if (input.value.trim()) {
        onSelect(input.value.trim());
        input.value = "";
        dropdown.style.display = "none";
        if (clearBtn) clearBtn.style.display = "none";
      }
    }
  });
}

let customTrainingPlans = [];
let activeStrengthPlan = null;
let exercisePickerTarget = null;
let exercisePickerPanelOpen = false;

try {
  customTrainingPlans = JSON.parse(localStorage.getItem(CUSTOM_PLANS_KEY) || "[]");
} catch (error) {
  console.warn("Não foi possível carregar os treinos personalizados.", error);
}

function exerciseMediaUrl(path, base = EXERCISE_MEDIA_RAW) {
  return `${base}${String(path).split("/").map(encodeURIComponent).join("/")}`;
}

function allTrainingPlans() {
  const currentProg = getActiveProgram();
  return currentProg?.sessions || DEFAULT_PROGRAM.sessions;
}

function cloneTrainingPlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

function newCustomPlan() {
  return { id: "custom-new", day: "PERSONALIZADO", title: "Meu treino personalizado", exercises: [], isCustom: true };
}

function planForId(planId) {
  if (planId === "custom-new") return newCustomPlan();
  const currentProg = getActiveProgram();
  const foundInActive = currentProg?.sessions?.find((s) => s.id === planId);
  if (foundInActive) return cloneTrainingPlan(foundInActive);
  for (const prog of trainingPrograms) {
    const f = prog.sessions?.find((s) => s.id === planId);
    if (f) return cloneTrainingPlan(f);
  }
  return cloneTrainingPlan(DEFAULT_PROGRAM.sessions[0]);
}

function exerciseCatalogImage(exercise) {
  return exercise.images?.[0] ? exerciseMediaUrl(exercise.images[0]) : "";
}

function exerciseCatalogPage(exercise) {
  return exercise.images?.[0] ? exerciseMediaUrl(exercise.images[0], EXERCISE_MEDIA_GITHUB) : "https://github.com/yuhonas/free-exercise-db";
}

const MODALITIES = {
  strength: { label: "Musculação", basePoints: 9, effortMax: 7, targetMinutes: 0, durationMax: 0 },
  bjj: { label: "Jiu-jitsu", basePoints: 11, effortMax: 7, targetMinutes: 60, durationMax: 4 },
  cardio: { label: "Cardio", basePoints: 8, effortMax: 8, targetMinutes: 30, durationMax: 4 },
};
const EFFORT_LABELS = {
  1: "Só bateu ponto",
  2: "Era melhor nem ter vindo",
  3: "Treino culposo",
  4: "Uma bosta",
  5: "Meio bosta",
  6: "Fisioterapia disfarçada",
  7: "Treininho honesto",
  8: "Máquina",
  9: "Rambo",
  10: "Morreu, mas entregou",
};
const TRASH_TALK_MESSAGES = {
  tie: [
    "{me} e {rival}: rivalidade alta, vantagem em falta.",
    "Empate. Dois egos no aquecimento e nenhum no pódio.",
    "Placar empatado: a competição está fazendo hora extra.",
    "Ninguém perdeu. Ainda dá tempo de decepcionar.",
    "Empate: tão equilibrado que até as desculpas vieram iguais.",
    "Dois placares iguais e duas pessoas jurando que estão dominando.",
    "Empate técnico: ninguém impressionou o suficiente para vencer.",
    "A rivalidade está em alta; o aproveitamento, em reunião.",
    "Empate. O placar está esperando alguém levar isso a sério.",
    "Ninguém na frente. Que eficiência em não decidir nada.",
    "Empate: duas promessas de reação e zero provas até agora.",
    "Até o cronômetro está mais competitivo que vocês.",
    "Um empate tão justo que as desculpas também dividiram os pontos.",
    "A disputa está equilibrada. O esforço ainda está sendo localizado.",
    "Empate. A montanha de confiança encontrou o vale da pontuação.",
    "O placar não sabe quem zoar. Façam o trabalho dele.",
    "Dois atletas, um empate e nenhuma testemunha de domínio.",
    "Empatados: a única coisa vencendo hoje é a indecisão.",
    "Ninguém perdeu. Ninguém convenceu também.",
    "Empate. Mais um treino e talvez apareça uma liderança.",
  ],
  win: [
    "Você abriu {margin} ponto(s). {loser}, prepara o discurso de vice.",
    "{winner} na frente; {loser} atualiza a lista de desculpas.",
    "{winner} pontua. {loser}, assistir também conta como descanso.",
    "A liderança é sua. {loser}, pode aplaudir entre uma série e outra.",
    "{winner} ganhou este round. {loser}, chama isso de estratégia.",
    "Você assumiu a ponta. {loser}, diga que isso faz parte do plano.",
    "Seu lado pontua; o de {loser} está em modo avião.",
    "Você está vencendo. {loser}, respira e finge que era treino leve.",
    "A diferença existe. {loser}, também existe o botão de treinar.",
    "Você na frente; {loser} no departamento de explicações.",
    "A liderança combina com você. {loser}, pode tentar depois do aquecimento.",
    "Você ganhou vantagem. {loser}, o placar não aceita recurso.",
    "{winner} entregou pontos. {loser} entregou uma apresentação convincente de ausência.",
    "Você abriu vantagem. {loser}, chama isso de motivação externa.",
    "O placar escolheu um favorito. {loser}, não foi você.",
    "Você lidera. {loser}, até sua desculpa está ficando para trás.",
    "Ponto para você; mais uma oportunidade para {loser} recalcular a rota.",
    "Você está na frente. {loser}, o modo espectador não pontua.",
    "{winner} no topo; {loser} fazendo turismo na tabela.",
    "Você venceu essa parcial. {loser}, a revanche exige aparecer.",
  ],
  loss: [
    "Você está {margin} ponto(s) atrás de {winner}. A revanche ainda não pontua.",
    "{winner} lidera. Seu plano agora é recuperar pontos, não desculpas.",
    "Você não perdeu ainda; só está deixando a vitória mais interessante para {winner}.",
    "{winner} na frente. Hora de transformar essa motivação em treino.",
    "A diferença é {margin} ponto(s). Menos que uma desculpa boa, mais que seu placar.",
    "{winner} assumiu a ponta. Você pode começar pela parte de aparecer.",
    "Você está atrás. A boa notícia: ainda dá para trocar a estratégia.",
    "{winner} pontua enquanto você desenvolve teorias sobre o placar.",
    "A liderança é de {winner}. Seu discurso de quase-vitória está pronto?",
    "Você não está perdendo; está testando a paciência do seu rival.",
    "{winner} abriu vantagem. Hora de fazer sua ficha sair do modo rascunho.",
    "O placar está sendo sincero: hoje, {winner} apareceu mais.",
    "Você está atrás de {winner}. A revanche começa no próximo treino, não no argumento.",
    "{winner} lidera. Sua dignidade ainda pode buscar uns pontos extras.",
    "A diferença pesa menos que a desculpa, mas aparece mais no placar.",
    "Você está no retrovisor de {winner}. Tente virar para-brisa.",
    "{winner} na frente. O plano de recuperação agradece sua presença.",
    "Seu rival está somando pontos; você está somando motivos para voltar.",
    "{winner} levou essa parcial. Não transforme uma derrota em rotina.",
    "A tabela não é cruel: só está anotando quem treinou.",
  ],
};
function randomBanterMessage(outcome, messages) {
  const storageKey = `rep-club-banter:${outcome}`;
  const savedIndex = sessionStorage.getItem(storageKey);
  const previousIndex = savedIndex === null ? -1 : Number(savedIndex);
  const value = new Uint32Array(1);
  let index;
  do {
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(value);
    else value[0] = Math.floor(Math.random() * 0x100000000);
    index = value[0] % messages.length;
  } while (index === previousIndex && messages.length > 1);
  sessionStorage.setItem(storageKey, String(index));
  return messages[index];
}

const VISIT_BANTER = Object.fromEntries(Object.entries(TRASH_TALK_MESSAGES).map(([outcome, messages]) => [
  outcome,
  randomBanterMessage(outcome, messages),
]));

const byId = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[character]));
const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const shiftDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
};
const pointsForWorkout = (workout) => {
  if (!workout) return 0;
  const pts = Number(workout.points);
  return Number.isFinite(pts) ? pts : 10;
};
const resolvePlayerForWorkout = (workout, challenge = null) => {
  if (!workout) return null;
  const ch = challenge || (typeof challenges !== "undefined" && Array.isArray(challenges) ? challenges.find((c) => c && c.id === (workout.challengeId || workout.duel_id)) : null) || (typeof getActiveChallenge === "function" ? getActiveChallenge() : null);
  const pool = Array.isArray(ch?.players) && ch.players.length >= 2 ? ch.players : (typeof PLAYERS !== "undefined" && Array.isArray(PLAYERS) ? PLAYERS : DEFAULT_PLAYERS);

  const wUserId = String(workout.userId || workout.user_id || "").trim().toLowerCase();
  const wEmail = String(workout.userEmail || workout.user_email || "").trim().toLowerCase();
  const wName = String(workout.userName || workout.user_name || "").trim().toLowerCase();
  const wOwner = String(workout.owner || workout.player_id || "").trim();

  // 1. Prioridade absoluta: UID / ID permanente do usuário autenticado que registrou o treino
  if (wUserId) {
    const foundByUid = pool.find((p) => {
      if (!p) return false;
      const pId = String(p.id || "").trim().toLowerCase();
      const pUid = String(p.uid || "").trim().toLowerCase();
      return pUid === wUserId || pId === wUserId || pId === `player-${wUserId}`;
    });
    if (foundByUid) return foundByUid;
  }

  // 2. Email do usuário que registrou o treino
  if (wEmail) {
    const foundByEmail = pool.find((p) => {
      if (!p) return false;
      const pEmail = String(p.email || "").trim().toLowerCase();
      return pEmail && pEmail === wEmail;
    });
    if (foundByEmail) return foundByEmail;
  }

  // 3. Nome do usuário que registrou o treino
  if (wName) {
    const foundByName = pool.find((p) => {
      if (!p) return false;
      const pName = String(p.name || "").trim().toLowerCase();
      if (!pName) return false;
      if (pName === wName) return true;
      const pFirst = pName.split(/\s+/)[0];
      const wFirst = wName.split(/\s+/)[0];
      if (pFirst.length >= 3 && wFirst.length >= 3 && pFirst === wFirst) return true;
      return false;
    });
    if (foundByName) return foundByName;
  }

  // 4. Fallback pelo ID do player registrado (owner)
  if (wOwner) {
    const foundByOwner = pool.find((p) => p && String(p.id).trim() === wOwner);
    if (foundByOwner) return foundByOwner;
  }

  return pool[0] || null;
};

function healWorkouts(workoutsList) {
  if (!Array.isArray(workoutsList)) return;
  workoutsList.forEach((w) => {
    if (!w) return;
    const ch = (typeof challenges !== "undefined" && Array.isArray(challenges) ? challenges.find((c) => c && c.id === (w.challengeId || w.duel_id)) : null) || (typeof getActiveChallenge === "function" ? getActiveChallenge() : null);
    const pool = Array.isArray(ch?.players) && ch.players.length >= 2 ? ch.players : (typeof PLAYERS !== "undefined" && Array.isArray(PLAYERS) ? PLAYERS : DEFAULT_PLAYERS);
    
    // Se o treino tem autor gravado (nome/email/userId), repara o owner para o id do atleta no desafio
    if (w.userName || w.userEmail || w.userId || w.user_name || w.user_email || w.user_id) {
      const authorPlayer = resolvePlayerForWorkout(w, ch);
      if (authorPlayer && w.owner !== authorPlayer.id) {
        w.owner = authorPlayer.id;
      }
      if (authorPlayer) {
        if (!w.userName && authorPlayer.name) w.userName = authorPlayer.name;
        if (!w.userEmail && authorPlayer.email) w.userEmail = authorPlayer.email;
        if (!w.userId && (authorPlayer.uid || authorPlayer.id)) w.userId = authorPlayer.uid || authorPlayer.id;
      }
    } else if (w.owner) {
      // Se é legado sem autor, amarra aos dados do participante atual daquele owner
      const matched = pool.find((p) => p && String(p.id).trim() === String(w.owner).trim());
      if (matched) {
        if (!w.userName && matched.name) w.userName = matched.name;
        if (!w.userEmail && matched.email) w.userEmail = matched.email;
        if (!w.userId && (matched.uid || matched.id)) w.userId = matched.uid || matched.id;
      }
    }
  });
}

const playerFor = (id) => {
  if (id && typeof id === "object" && (id.owner || id.userId || id.userName || id.player_id)) {
    return resolvePlayerForWorkout(id);
  }
  const cur = typeof getActiveChallenge === "function" ? getActiveChallenge() : null;
  if (cur && Array.isArray(cur.players)) {
    const found = cur.players.find((player) => (player?.id || player) === id);
    if (found) return typeof found === "object" ? found : { id: found, name: found };
  }
  return (typeof PLAYERS !== "undefined" && Array.isArray(PLAYERS) ? PLAYERS : DEFAULT_PLAYERS).find((player) => player.id === id) || { id, name: id || "Atleta", short: (id || "A")[0].toUpperCase(), color: "var(--lime)", textColor: "#000" };
};

// AUTENTICAÇÃO E INDIVIDUALIZAÇÃO DE PERFIL DO ATLETA (POR ETAPAS)
const AUTH_USER_KEY = "rep-club-auth-user-v2";
const AUTH_PROFILE_KEY = "rep-club-auth-profile-v1";
const AUTH_EMAIL_KEY = "rep-club-auth-email-v1";

function getAuthUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_USER_KEY));
    if (saved && (saved.name || saved.email || saved.id)) return saved;
  } catch (e) { }

  // Fallback para perfil salvo anteriormente
  const savedId = localStorage.getItem(AUTH_PROFILE_KEY);
  if (savedId) {
    return { id: savedId, name: savedId, email: localStorage.getItem(AUTH_EMAIL_KEY) || "" };
  }
  return null;
}

// CONTAS SALVAS NESTE APARELHO (APENAS AUTENTICADAS OU CRIADAS)
const SAVED_ACCOUNTS_KEY = "rep-club-saved-accounts-v2";

function getSavedAccounts() {
  try {
    const list = JSON.parse(localStorage.getItem(SAVED_ACCOUNTS_KEY));
    if (Array.isArray(list)) return list;
  } catch (e) {}
  return [];
}

function saveAccountToHistory(user) {
  if (!user || (!user.email && !user.id)) return;
  const list = getSavedAccounts();
  const key = String(user.email || user.id).toLowerCase();
  const filtered = list.filter((a) => String(a.email || a.id).toLowerCase() !== key);
  filtered.unshift({
    id: user.id || user.uid,
    name: user.name || (user.email ? user.email.split("@")[0] : "Atleta"),
    email: user.email || "",
    avatar: (user.name || user.email || "A").charAt(0).toUpperCase(),
    lastLogin: new Date().toISOString()
  });
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered.slice(0, 4)));
}

function removeSavedAccount(identifier) {
  const list = getSavedAccounts().filter((a) => String(a.email || a.id).toLowerCase() !== String(identifier).toLowerCase());
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(list));
  renderSavedAccountsUI();
}

function renderSavedAccountsUI() {
  const section = byId("saved-accounts-section");
  const listContainer = byId("saved-accounts-list");
  if (!section || !listContainer) return;
  const accounts = getSavedAccounts();
  if (accounts.length === 0) {
    section.style.display = "none";
    listContainer.innerHTML = "";
    return;
  }

  section.style.display = "block";
  listContainer.innerHTML = accounts.map((acc) => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#fff; border:1px solid #d0d2c9; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <button type="button" class="button" data-login-saved="${escapeHTML(acc.email || acc.id)}" style="background:transparent; border:none; padding:0; flex:1; justify-content:flex-start; gap:10px; cursor:pointer; text-align:left;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--lime); color:var(--ink); font-weight:800; font-size:12px;">${escapeHTML(acc.avatar)}</span>
        <div style="display:flex; flex-direction:column;">
          <strong style="font-size:13px; color:#1f2937; line-height:1.2;">${escapeHTML(acc.name)}</strong>
          <span style="font-size:10px; color:#6b7280;">${escapeHTML(acc.email || "Conta salva")}</span>
        </div>
      </button>
      <button type="button" data-remove-saved="${escapeHTML(acc.email || acc.id)}" title="Remover da lista deste aparelho" style="background:transparent; border:none; color:#9ca3af; font-size:16px; cursor:pointer; padding:4px 8px; border-radius:4px; line-height:1;">×</button>
    </div>
  `).join("");
}

function userParticipatesInChallenge(challenge, user) {
  if (!user || !challenge) return false;
  const uId = String(user.id || user.uid || "").trim().toLowerCase();
  const uEmail = String(user.email || "").trim().toLowerCase();
  const uName = String(user.name || "").trim().toLowerCase();

  // Se o usuário foi o criador do desafio
  if (challenge.createdBy && (String(challenge.createdBy).toLowerCase() === uId || String(challenge.createdBy).toLowerCase() === uEmail)) return true;
  if (challenge.creatorEmail && uEmail && String(challenge.creatorEmail).toLowerCase() === uEmail) return true;

  if (!Array.isArray(challenge.players)) return false;

  return challenge.players.some((p) => {
    if (!p) return false;
    const pId = String(p.id || p.uid || "").trim().toLowerCase();
    const pEmail = String(p.email || "").trim().toLowerCase();
    const pName = String(p.name || "").trim().toLowerCase();

    // 1. ID exato
    if (uId && pId && (pId === uId || pId === `player-${uId}`)) return true;
    // 2. Email exato
    if (uEmail && pEmail && pEmail === uEmail) return true;
    // 3. Nome exato
    if (uName && pName && pName === uName) return true;
    // 4. Primeiro e último nome coincidem (ou primeiro nome coincidente >= 3 letras)
    if (uName && pName && uName.length >= 3 && pName.length >= 3) {
      const uParts = uName.split(/\s+/);
      const pParts = pName.split(/\s+/);
      if (uParts[0] === pParts[0]) {
        if (uParts.length > 1 && pParts.length > 1) {
          if (uParts[uParts.length - 1] === pParts[pParts.length - 1]) return true;
        } else {
          return true;
        }
      }
    }
    return false;
  });
}

function getUserChallenges() {
  const user = getAuthUser();
  if (!user) return [];
  return challenges.filter((c) => userParticipatesInChallenge(c, user));
}

function getPlayerInChallenge(challenge, user) {
  if (!challenge) return null;
  const pool = Array.isArray(challenge?.players) && challenge.players.length > 0 ? challenge.players : PLAYERS;
  if (!user) return pool[0] || null;
  const uName = String(user.name || "").trim().toLowerCase();
  const uEmail = String(user.email || "").trim().toLowerCase();
  const uId = String(user.id || user.uid || "").trim();

  let matched = pool.find((p) => {
    if (!p) return false;
    const pId = String(p.id || p.uid || "").trim();
    const pEmail = String(p.email || "").trim().toLowerCase();
    const pName = String(p.name || "").trim().toLowerCase();
    if (uId && pId && (pId === uId || pId.toLowerCase() === uId.toLowerCase() || pId === `player-${uId}`)) return true;
    if (uEmail && pEmail && pEmail === uEmail) return true;
    if (pName && uName) {
      if (pName === uName) return true;
      const pFirst = pName.split(/\s+/)[0];
      const uFirst = uName.split(/\s+/)[0];
      if (pFirst.length >= 3 && uFirst.length >= 3 && pFirst === uFirst) return true;
    }
    return false;
  });

  if (matched) {
    if (!matched.uid && (user.id || user.uid)) matched.uid = user.id || user.uid;
    if (!matched.email && user.email) matched.email = user.email;
    return matched;
  }

  // Se o usuário for o criador do desafio e não há outro jogador que coincida
  if (challenge.createdBy && (String(challenge.createdBy).toLowerCase() === uId.toLowerCase() || (uEmail && String(challenge.creatorEmail || "").toLowerCase() === uEmail))) {
    const creatorP = pool[0];
    if (creatorP) {
      if (!creatorP.uid && (user.id || user.uid)) creatorP.uid = user.id || user.uid;
      if (!creatorP.email && user.email) creatorP.email = user.email;
      return creatorP;
    }
  }

  return null;
}

function getActiveUserPlayer() {
  const user = getAuthUser();
  if (!user) return null;
  const cur = getActiveChallenge();
  return getPlayerInChallenge(cur, user);
}

async function syncChallengeToFirebase(challenge) {
  if (!challenge || !challenge.id) return;
  if (fbDb) {
    try {
      await fbDb.ref(`rep-club/challenges/${challenge.id}`).set(challenge);
      return;
    } catch (e) {
      console.warn("Falha Firebase SDK desafios:", e);
    }
  }
  try {
    await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/challenges/${challenge.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(challenge)
    });
  } catch (e) {
    console.warn("Falha REST desafios:", e);
  }
}

async function removeChallengeFromFirebase(challengeId) {
  if (!challengeId) return;
  if (fbDb) {
    try {
      await fbDb.ref(`rep-club/challenges/${challengeId}`).remove();
      return;
    } catch (e) {}
  }
  try {
    await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/challenges/${challengeId}.json`, {
      method: "DELETE"
    });
  } catch (e) {}
}

async function hydrateChallengesFromFirebase() {
  try {
    let challengesData = null;
    if (fbDb) {
      try {
        const snap = await fbDb.ref("rep-club/challenges").get();
        challengesData = snap.val();
      } catch (e) {}
    }
    if (!challengesData) {
      const resp = await fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/challenges.json");
      if (resp.ok) challengesData = await resp.json();
    }
    if (challengesData && typeof challengesData === "object") {
      const remoteList = Object.values(challengesData);
      let changed = false;
      remoteList.forEach((rc) => {
        if (!rc || !rc.id) return;
        const idx = challenges.findIndex((c) => c.id === rc.id);
        if (idx >= 0) {
          challenges[idx] = rc;
        } else {
          challenges.push(rc);
        }
        changed = true;
      });
      if (changed) {
        saveChallenges();
        renderChallengeSelector();
        render();
      }
    }
  } catch (err) {
    console.warn("Erro ao sincronizar desafios remotos:", err);
  }
}

let registeredUsersDirectory = [];

async function registerUserInDirectory(user) {
  if (!user || (!user.id && !user.uid && !user.email)) return;
  const uid = String(user.id || user.uid || (user.email ? user.email.replace(/[@.]/g, "-") : "user"));
  const data = {
    id: uid,
    name: user.name || (user.email ? user.email.split("@")[0] : "Atleta"),
    email: user.email || "",
    avatar: (user.name || user.email || "A").charAt(0).toUpperCase(),
    updatedAt: new Date().toISOString()
  };
  if (fbDb) {
    try {
      await fbDb.ref(`rep-club/registered-users/${uid}`).set(data);
    } catch (e) {}
  }
  try {
    await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/registered-users/${uid}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (e) {}
}

async function loadRegisteredUsersDirectory() {
  try {
    let usersData = null;
    if (fbDb) {
      try {
        const snap = await fbDb.ref("rep-club/registered-users").get();
        usersData = snap.val();
      } catch (e) {}
    }
    if (!usersData) {
      const resp = await fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/registered-users.json");
      if (resp.ok) usersData = await resp.json();
    }
    if (usersData && typeof usersData === "object") {
      registeredUsersDirectory = Object.values(usersData);
    }
  } catch (e) {
    console.warn("Erro ao buscar atletas registrados:", e);
  }

  // Mescla histórico salvo localmente neste aparelho
  const saved = getSavedAccounts();
  saved.forEach((acc) => {
    if (!registeredUsersDirectory.some((u) => (u.email && acc.email && u.email.toLowerCase() === acc.email.toLowerCase()) || u.id === acc.id)) {
      registeredUsersDirectory.push(acc);
    }
  });

  // Mescla participantes de todos os duelos
  challenges.forEach((c) => {
    if (Array.isArray(c.players)) {
      c.players.forEach((p) => {
        if (p && p.name && !registeredUsersDirectory.some((u) => u.name.toLowerCase() === p.name.toLowerCase())) {
          registeredUsersDirectory.push({
            id: p.id,
            name: p.name,
            email: p.email || "",
            avatar: p.short || p.name.charAt(0).toUpperCase()
          });
        }
      });
    }
  });
}

async function checkInviteLinkParam() {
  const params = new URLSearchParams(window.location.search);
  const inviteId = params.get("invite");
  if (!inviteId) return;

  const user = getAuthUser();
  if (!user) {
    openAuthDialog("Você recebeu um convite para entrar no Duelo! Faça login ou crie sua conta para participar.");
    return;
  }

  const joinChallenge = (ch) => {
    if (!ch) return;
    const myName = user.name || (user.email ? user.email.split("@")[0] : "Atleta");
    if (!Array.isArray(ch.players)) ch.players = [];

    const uId = String(user.id || user.uid || "").trim().toLowerCase();
    const uEmail = String(user.email || "").trim().toLowerCase();
    const uName = String(myName).trim().toLowerCase();

    // 1. Procura se o usuário já participa do desafio
    let targetIdx = ch.players.findIndex((p) => {
      if (!p) return false;
      const pId = String(p.id || p.uid || "").trim().toLowerCase();
      const pEmail = String(p.email || "").trim().toLowerCase();
      const pName = String(p.name || "").trim().toLowerCase();
      if (uId && pId && (pId === uId || pId === `player-${uId}`)) return true;
      if (uEmail && pEmail && pEmail === uEmail) return true;
      if (uName && pName && (pName === uName || (pName.length >= 3 && uName.startsWith(pName)))) return true;
      return false;
    });

    if (targetIdx >= 0) {
      // Já está no duelo: vincula email, nome e uid atualizados
      ch.players[targetIdx].name = myName;
      if (user.email) ch.players[targetIdx].email = user.email;
      if (user.id || user.uid) ch.players[targetIdx].uid = user.id || user.uid;
      ch.players[targetIdx].short = myName.charAt(0).toUpperCase();
      syncChallengeToFirebase(ch);
    } else {
      // 2. Não participa ainda. Verifica se há um slot vago/placeholder (ex: Rival, Jogador 2, Convidado)
      const placeholderIdx = ch.players.findIndex((p, idx) => {
        if (idx === 0) return false; // Nunca substitui o criador (Player 1)
        if (p.email || p.uid) return false; // Já pertence a uma conta autenticada
        const pName = String(p.name || "").toLowerCase().trim();
        return (
          pName === "rival" ||
          pName === "jogador 2" ||
          pName === "convidado" ||
          pName === "amigo" ||
          pName === "atleta" ||
          pName === ""
        );
      });

      if (placeholderIdx >= 0) {
        // Assume o slot vago existente (ex: slot do Rival)
        ch.players[placeholderIdx].name = myName;
        ch.players[placeholderIdx].short = myName.charAt(0).toUpperCase();
        ch.players[placeholderIdx].email = user.email || "";
        ch.players[placeholderIdx].uid = user.id || user.uid || "";
        syncChallengeToFirebase(ch);
      } else {
        // Cria um novo competidor se não havia placeholder vago
        const newP = {
          id: `player-${ch.players.length + 1}`,
          name: myName,
          email: user.email || "",
          uid: user.id || user.uid || "",
          short: myName.charAt(0).toUpperCase(),
          side: ch.players.length === 1 ? "rival" : `other-${ch.players.length + 1}`,
          color: PLAYER_PALETTE[ch.players.length % PLAYER_PALETTE.length].color,
          textColor: PLAYER_PALETTE[ch.players.length % PLAYER_PALETTE.length].text
        };
        ch.players.push(newP);
        syncChallengeToFirebase(ch);
      }
    }

    activeChallengeId = ch.id;
    saveChallenges();
    syncActiveChallengeGlobals();
    saveState();
    render();
    showToast(`Você entrou no duelo "${ch.title}"!`);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
  };

  let target = challenges.find((c) => c.id === inviteId);
  if (target) {
    joinChallenge(target);
    return;
  }

  try {
    let remoteCh = null;
    if (fbDb) {
      const snap = await fbDb.ref(`rep-club/challenges/${inviteId}`).get();
      remoteCh = snap.val();
    }
    if (!remoteCh) {
      const resp = await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/challenges/${inviteId}.json`);
      if (resp.ok) remoteCh = await resp.json();
    }
    if (remoteCh && remoteCh.id) {
      const idx = challenges.findIndex((c) => c.id === remoteCh.id);
      if (idx >= 0) challenges[idx] = remoteCh;
      else challenges.push(remoteCh);
      joinChallenge(remoteCh);
    } else {
      showToast("Duelo do link não encontrado.");
    }
  } catch (err) {
    console.warn("Erro ao buscar convite de duelo:", err);
  }
}

function setAuthUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_PROFILE_KEY, user.id || user.name);
  if (user.email) localStorage.setItem(AUTH_EMAIL_KEY, user.email);

  // Salva no histórico de contas autenticadas deste aparelho
  saveAccountToHistory(user);
  registerUserInDirectory(user);

  // Filtra e sincroniza os desafios exclusivos do atleta
  const userChallenges = getUserChallenges();
  if (userChallenges.length > 0) {
    if (!userChallenges.some((c) => c.id === activeChallengeId)) {
      activeChallengeId = userChallenges[0].id;
    }
  } else {
    activeChallengeId = "none";
  }

  syncActiveChallengeGlobals();
  saveChallenges();
  saveState();
  renderAuthUI();
  renderChallengeSelector();
  render();
  byId("auth-dialog")?.close();
  showToast(`Conectado como ${user.name || user.email}!`);
  checkInviteLinkParam();
}

function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
  if (fbAuth) {
    try { fbAuth.signOut(); } catch (e) {}
  }
  renderAuthUI();
  renderChallengeSelector();
  render();
  showToast("Você saiu da conta.");
}

function setAuthProfile(playerId, email = null) {
  setAuthUser({ id: playerId, name: playerId, email: email || `${playerId}@repclub.app` });
}

function clearAuthProfile() {
  clearAuthUser();
}

function getAuthProfile() {
  const u = getAuthUser();
  return u ? (u.id || u.name) : null;
}

function renderAuthUI() {
  const user = getAuthUser();
  const userBadge = byId("user-badge");
  const authOpenBtn = byId("btn-auth-open");
  const avatarTag = byId("user-avatar-tag");
  const displayName = byId("user-display-name");

  if (user) {
    const myPlayer = getActiveUserPlayer();

    if (userBadge) userBadge.style.display = "flex";
    if (authOpenBtn) authOpenBtn.style.display = "none";
    if (avatarTag) {
      avatarTag.textContent = user.name ? user.name.charAt(0).toUpperCase() : (myPlayer?.short || "👤");
      avatarTag.style.background = myPlayer?.color || "var(--lime)";
      avatarTag.style.color = myPlayer?.textColor || "var(--ink)";
    }
    if (displayName) displayName.textContent = user.name || user.email;
    state.activePlayer = myPlayer ? myPlayer.id : PLAYERS[0].id;
  } else {
    if (userBadge) userBadge.style.display = "none";
    if (authOpenBtn) authOpenBtn.style.display = "inline-flex";
  }
}

function openAuthDialog(reasonMsg = null) {
  const errorEl = byId("auth-error");
  if (errorEl) errorEl.textContent = reasonMsg || "";
  renderSavedAccountsUI();
  byId("auth-dialog")?.showModal();
}

function createDemoStrengthWorkout(id, date, effort, loads, repsByExercise, progressionPoints) {
  const plan = TRAINING_PLANS.find((item) => item.id === "A");
  const exercises = plan.exercises.map((exercise, index) => ({
    name: exercise.name,
    plannedSets: exercise.sets,
    minReps: exercise.min,
    maxReps: exercise.max,
    requiresLoad: exercise.load !== false,
    loadFactor: exercise.loadFactor || 1,
    sets: repsByExercise[index].map((reps) => ({ done: true, reps, load: exercise.load === false ? 0 : loads[index] })),
  }));
  const trainingVolume = exercises.reduce((total, exercise) => total + exerciseVolume(exercise), 0);
  const effortPoints = effortBonus(MODALITIES.strength.effortMax, effort);
  const executionPoints = 4;
  const qualityPoints = executionPoints + effortPoints + progressionPoints;

  return {
    id,
    challengeId: "challenge-1",
    owner: "player-1",
    category: "strength",
    templateId: "A",
    name: `Treino A · ${plan.title}`,
    exercises,
    effort,
    basePoints: MODALITIES.strength.basePoints,
    qualityPoints,
    executionPoints,
    effortPoints,
    progressionPoints,
    trainingVolume,
    duration: 0,
    points: MODALITIES.strength.basePoints + qualityPoints,
    date,
  };
}

function createDemoState() {
  return {
    activePlayer: "player-1",
    workouts: [
      createDemoStrengthWorkout("demo-m-a-1", shiftDate(-4), 5, [35, 40, 12, 30, 10, 0], [[9, 9, 8, 8], [10, 9, 8, 8], [9, 9, 8, 8], [13, 12, 12], [11, 10, 10], [35, 35, 30]], 2),
      createDemoStrengthWorkout("demo-m-a-2", shiftDate(-2), 8, [37.5, 42.5, 14, 32.5, 12, 0], [[10, 10, 9, 8], [10, 10, 9, 9], [10, 10, 9, 9], [15, 14, 12], [12, 11, 10], [40, 40, 35]], 2),
      { id: "demo-m-2", challengeId: "challenge-1", owner: "player-1", category: "bjj", name: "Jiu-jitsu", points: 19, basePoints: 11, qualityPoints: 8, duration: 60, effort: 6, date: shiftDate(-4) },
      { id: "demo-m-3", challengeId: "challenge-1", owner: "player-1", category: "cardio", name: "Cardio", points: 18, basePoints: 8, qualityPoints: 10, duration: 35, effort: 7, date: shiftDate(-6) },
      { id: "demo-r-1", challengeId: "challenge-1", owner: "player-2", category: "bjj", name: "Jiu-jitsu", points: 22, basePoints: 11, qualityPoints: 11, duration: 70, effort: 10, date: shiftDate(-1) },
      { id: "demo-r-2", challengeId: "challenge-1", owner: "player-2", category: "strength", templateId: "B", name: "Treino B · Empurrada & Estrutura", points: 16, basePoints: 9, qualityPoints: 7, effort: 5, duration: 60, date: shiftDate(-3) },
      { id: "demo-r-3", challengeId: "challenge-1", owner: "player-2", category: "cardio", name: "Cardio", points: 15, basePoints: 8, qualityPoints: 7, duration: 25, effort: 6, date: shiftDate(-5) },
    ],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const legacyIds = { matheus: "player-1", rafa: "player-2" };
    if (saved && Array.isArray(saved.workouts)) {
      saved.activePlayer = legacyIds[saved.activePlayer] || saved.activePlayer || "player-1";
      saved.workouts = saved.workouts.map((workout) => ({
        ...workout,
        challengeId: workout.challengeId || "challenge-1",
        owner: legacyIds[workout.owner] || workout.owner,
        userId: workout.userId || workout.user_id || "",
        userEmail: workout.userEmail || workout.user_email || "",
        userName: workout.userName || workout.user_name || "",
      }));
      healWorkouts(saved.workouts);
      const demoOnly = saved.workouts.length > 0 && saved.workouts.every((workout) => String(workout.id).startsWith("demo-"));
      if (demoOnly) {
        const demo = createDemoState();
        demo.activePlayer = saved.activePlayer;
        return demo;
      }
      return saved;
    }
  } catch (error) {
    console.warn("Não foi possível ler os dados locais do Rep Club.", error);
  }
  return createDemoState();
}

let state = loadState();
let toastTimer;
let restTimerInterval = null;
let restSecondsRemaining = 0;
const CANONICAL_DUEL_ID = "a3026d38-17fe-48a1-92d3-d5e8df833147";

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function firebaseWorkoutPayload(workout) {
  return {
    id: workout.id,
    duel_id: workout.challengeId || CANONICAL_DUEL_ID,
    challenge_id: workout.challengeId || null,
    player_id: workout.owner,
    user_id: workout.userId || workout.user_id || null,
    user_email: workout.userEmail || workout.user_email || null,
    user_name: workout.userName || workout.user_name || null,
    category: workout.category,
    workout_date: workout.date,
    name: workout.name,
    comments: workout.comments || null,
    photo: workout.photo || null,
    points: pointsForWorkout(workout),
    effort: workout.effort || null,
    duration: workout.duration || null,
    exercises: workout.exercises || null,
    created_at: workout.createdAt || new Date().toISOString()
  };
}

async function syncWorkoutToFirebase(workout) {
  if (String(workout.id).startsWith("demo-")) return;
  const payload = firebaseWorkoutPayload(workout);

  if (fbDb) {
    try {
      await fbDb.ref(`rep-club/workouts/${workout.id}`).set(payload);
      return;
    } catch (err) {
      console.warn("Erro ao salvar no Firebase via SDK:", err);
    }
  }

  try {
    await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/workouts/${workout.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Falha de rede ao sincronizar com Firebase:", err);
  }
}

async function deleteWorkoutFromFirebase(workoutId) {
  if (!workoutId || String(workoutId).startsWith("demo-")) return;
  if (fbDb) {
    try {
      await fbDb.ref(`rep-club/workouts/${workoutId}`).remove();
      return;
    } catch (err) {
      console.warn("Erro ao excluir do Firebase via SDK:", err);
    }
  }

  try {
    await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/workouts/${workoutId}.json`, {
      method: "DELETE"
    });
  } catch (err) {
    console.warn("Falha ao excluir no Firebase REST:", err);
  }
}

async function resetDuelInFirebase() {
  if (fbDb) {
    try {
      await fbDb.ref("rep-club/workouts").remove();
      return;
    } catch (err) {
      console.warn("Erro ao resetar treinos no Firebase via SDK:", err);
    }
  }

  try {
    await fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/workouts.json", {
      method: "DELETE"
    });
  } catch (err) {
    console.warn("Falha ao resetar no Firebase REST:", err);
  }
}

async function syncDuelToFirebase(challenge) {
  if (challenge && challenge.id) {
    await syncChallengeToFirebase(challenge);
  }
}

async function hydrateFromFirebase() {
  try {
    let workoutsData = null;

    if (fbDb) {
      try {
        const workoutsSnap = await fbDb.ref("rep-club/workouts").get();
        workoutsData = workoutsSnap.val();
      } catch (e) {
        console.warn("Firebase SDK get falhou, tentando REST:", e);
      }
    }

    if (!workoutsData) {
      try {
        const resp = await fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/workouts.json");
        if (resp.ok) {
          workoutsData = await resp.json();
        }
      } catch (e) {}
    }

    // Se Firebase falhou, retornou erro ou não retornou dados válidos
    if (!workoutsData || typeof workoutsData !== "object" || workoutsData.error) {
      console.warn("Firebase workouts inacessíveis ou com erro. Mantendo dados locais.");
      if (!Array.isArray(state.workouts) || state.workouts.length === 0) {
        const demo = createDemoState();
        state.workouts = demo.workouts;
        saveState();
        render();
      }
      return;
    }

    const remoteWorkoutsList = Object.values(workoutsData).filter((w) => w && typeof w === "object" && w.id && !w.error);
    if (remoteWorkoutsList.length === 0) {
      if (!Array.isArray(state.workouts) || state.workouts.length === 0) {
        const demo = createDemoState();
        state.workouts = demo.workouts;
        saveState();
        render();
      }
      return;
    }

    // Mantém todos os treinos locais já existentes que não vieram do remoto
    const pendingLocal = state.workouts.filter((lw) => !remoteWorkoutsList.some((rw) => rw.id === lw.id));
    const syncedRemote = remoteWorkoutsList.map((workout) => ({
      id: workout.id,
      challengeId: workout.challenge_id || workout.challengeId || workout.duel_id || activeChallengeId || "challenge-1",
      owner: workout.player_id || workout.owner,
      userId: workout.user_id || workout.userId || "",
      userEmail: workout.user_email || workout.userEmail || "",
      userName: workout.user_name || workout.userName || "",
      category: workout.category,
      date: workout.workout_date || workout.date,
      name: workout.name || MODALITIES[workout.category]?.label || workout.category,
      comments: workout.comments || "",
      photo: workout.photo || null,
      points: workout.points || 0,
      effort: workout.effort,
      duration: workout.duration || 0,
      exercises: workout.exercises,
      qualityPoints: Math.max(0, (workout.points || 0) - (MODALITIES[workout.category]?.basePoints || 0)),
      createdAt: workout.created_at || workout.createdAt || new Date().toISOString(),
    }));

    state.workouts = [...pendingLocal, ...syncedRemote];
    healWorkouts(state.workouts);
    const activeUser = getAuthUser();
    const curChallenge = getActiveChallenge();
    const myPlayer = activeUser ? getPlayerInChallenge(curChallenge, activeUser) : null;
    if (myPlayer) {
      state.activePlayer = myPlayer.id;
    } else if (!PLAYERS.some((p) => p.id === state.activePlayer)) {
      state.activePlayer = PLAYERS[0]?.id || "player-1";
    }
    saveState();
    render();
    hydrateProgramsFromFirebase();
    await hydrateChallengesFromFirebase();
    const ind = byId("sync-status-indicator");
    if (ind) {
      ind.textContent = "● Google Firebase Ao Vivo";
      ind.style.color = "var(--lime)";
    }
  } catch (error) {
    console.warn("Firebase indisponível; mantendo os dados locais.", error);
    if (!Array.isArray(state.workouts) || state.workouts.length === 0) {
      const demo = createDemoState();
      state.workouts = demo.workouts;
      saveState();
      render();
    }
  }
}

function savePlayerConfig(names) {
  PLAYERS = names.map((name, index) => {
    const palette = PLAYER_PALETTE[index % PLAYER_PALETTE.length];
    return {
      id: `player-${index + 1}`,
      name,
      short: name.charAt(0).toUpperCase(),
      side: index === 0 ? "me" : index === 1 ? "rival" : `other-${index + 1}`,
      color: palette.color,
      textColor: palette.text,
    };
  });
  playerConfig = PLAYERS.map(({ id, name, color, textColor }) => ({ id, name, color, textColor }));
  localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerConfig));
}

function setScoreboardStyle(style) {
  scoreboardStyle = style;
  localStorage.setItem(SCOREBOARD_STYLE_KEY, style);
  const btnClassic = byId("btn-style-classic");
  const btnKamehameha = byId("btn-style-kamehameha");
  if (btnClassic) {
    btnClassic.classList.toggle("active", style === "classic");
    btnClassic.setAttribute("aria-pressed", String(style === "classic"));
  }
  if (btnKamehameha) {
    btnKamehameha.classList.toggle("active", style === "kamehameha");
    btnKamehameha.setAttribute("aria-pressed", String(style === "kamehameha"));
  }
  const classicView = byId("scoreboard-classic");
  const kamehamehaView = byId("scoreboard-kamehameha");
  if (classicView) classicView.hidden = style !== "classic";
  if (kamehamehaView) kamehamehaView.hidden = style !== "kamehameha";
  renderScoreboard();
}

function weekStart(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = start.getDay();
  start.setDate(start.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return start;
}

function defaultDuelPeriod() {
  const start = weekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start: localDate(start), end: localDate(end) };
}

function loadDuelPeriod() {
  try {
    const saved = JSON.parse(localStorage.getItem(PERIOD_STORAGE_KEY));
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved.start) && /^\d{4}-\d{2}-\d{2}$/.test(saved.end) && saved.start <= saved.end) return saved;
  } catch (error) {
    console.warn("Não foi possível ler o período do duelo.", error);
  }
  return null;
}

let duelPeriod = loadDuelPeriod();
const activeDuelPeriod = () => duelPeriod || defaultDuelPeriod();

function loadChallenges() {
  try {
    const raw = localStorage.getItem(CHALLENGES_STORAGE_KEY);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.filter((c) => c && c.id && c.title);
      }
    }
  } catch (error) {
    console.warn("Não foi possível ler os desafios salvos.", error);
  }

  return [{
    id: "challenge-1",
    title: "Duelo 01",
    prize: "",
    period: defaultDuelPeriod(),
    players: DEFAULT_PLAYERS,
    activePlayer: DEFAULT_PLAYERS[0].id,
    createdAt: new Date().toISOString(),
  }];
}

let challenges = loadChallenges();
let activeChallengeId = localStorage.getItem(ACTIVE_CHALLENGE_KEY) || (challenges[0]?.id || "challenge-1");
if (!challenges.some((c) => c.id === activeChallengeId)) {
  activeChallengeId = challenges[0]?.id || "challenge-1";
}

function getActiveChallenge() {
  if (activeChallengeId === "none") return null;
  const user = getAuthUser();
  if (user) {
    const userChallenges = getUserChallenges();
    if (userChallenges.length > 0) {
      const found = userChallenges.find((c) => c.id === activeChallengeId);
      if (found) return found;
      return userChallenges[0];
    }
  }
  return challenges.find((c) => c.id === activeChallengeId) || challenges[0] || null;
}

function saveChallenges() {
  localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
  localStorage.setItem(ACTIVE_CHALLENGE_KEY, activeChallengeId);
}

function syncActiveChallengeGlobals() {
  const cur = getActiveChallenge();
  PLAYERS = Array.isArray(cur?.players) && cur.players.length >= 2 ? cur.players : DEFAULT_PLAYERS;
  challengePrize = cur?.prize || "";
  duelPeriod = cur?.period || defaultDuelPeriod();
  playerConfig = PLAYERS;
  localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerConfig));
  localStorage.setItem(PRIZE_STORAGE_KEY, challengePrize);
  localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(duelPeriod));
  const authUser = getAuthUser();
  const myPlayer = authUser ? getPlayerInChallenge(cur, authUser) : null;
  if (myPlayer) {
    state.activePlayer = myPlayer.id;
  } else if (!PLAYERS.some((p) => p.id === state.activePlayer)) {
    state.activePlayer = cur?.activePlayer || PLAYERS[0].id;
  }
}

syncActiveChallengeGlobals();

function currentChallengeWorkouts() {
  const cur = getActiveChallenge();
  if (!cur) return [];
  return state.workouts.filter((workout) => (workout.challengeId || "challenge-1") === cur.id);
}

function dateFromString(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(value) {
  if (value === localDate()) return "Hoje";
  if (value === shiftDate(-1)) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(dateFromString(value)).replace(".", "");
}

function formatPeriodDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(dateFromString(value)).replace(".", "");
}

function workoutsFor(playerId) {
  const cur = getActiveChallenge();
  return currentChallengeWorkouts().filter((workout) => {
    const assigned = resolvePlayerForWorkout(workout, cur);
    return assigned && assigned.id === playerId;
  });
}

function renderChallengeSelector() {
  const select = byId("challenge-select");
  const miniTitle = byId("challenge-mini-title");
  const miniStatus = byId("challenge-mini-status");
  const user = getAuthUser();

  if (!user) {
    if (miniTitle) miniTitle.textContent = "Sem Duelo Ativo";
    if (miniStatus) miniStatus.textContent = "MODO LIVRE";
    if (select) {
      select.innerHTML = '<option value="none" selected>⚪ Sem duelo ativo</option>';
      select.value = "none";
      select.style.display = "none";
    }
    return;
  }

  const userChallenges = getUserChallenges();

  if (userChallenges.length === 0) {
    activeChallengeId = "none";
    if (miniTitle) miniTitle.textContent = "Sem Duelo Ativo";
    if (miniStatus) miniStatus.textContent = "MODO LIVRE";
    if (select) {
      select.innerHTML = '<option value="none" selected>⚪ Sem duelo ativo</option>';
      select.value = "none";
      select.style.display = "none";
    }
    return;
  }

  if (select) select.style.display = "inline-block";

  if (activeChallengeId === "none") {
    if (miniTitle) miniTitle.textContent = "Sem Duelo Ativo";
    if (miniStatus) miniStatus.textContent = "MODO LIVRE";
    if (select) {
      select.innerHTML = `
        <option value="none" selected>⚪ Sem duelo ativo</option>
        ${userChallenges.map((c) => `<option value="${c.id}">⚔️ ${escapeHTML(c.title)}</option>`).join("")}
      `;
      select.value = "none";
    }
    return;
  }

  if (!userChallenges.some((c) => c.id === activeChallengeId)) {
    activeChallengeId = userChallenges[0].id;
    syncActiveChallengeGlobals();
  }

  const cur = getActiveChallenge();
  if (miniTitle) miniTitle.textContent = cur?.title || "Duelo";
  if (miniStatus) miniStatus.textContent = "DESAFIO ATIVO";
  if (!select) return;

  select.innerHTML = `
    ${userChallenges.map((c) => `
      <option value="${c.id}" ${c.id === cur?.id ? "selected" : ""}>⚔️ ${escapeHTML(c.title)}</option>
    `).join("")}
    <option value="none">⚪ Ficar sem duelo (Modo Livre)</option>
  `;
  select.value = cur?.id || "none";
}

function switchChallenge(challengeId) {
  if (challengeId === "auth") {
    openAuthDialog();
    renderChallengeSelector();
    return;
  }
  if (challengeId === "none") {
    activeChallengeId = "none";
    syncActiveChallengeGlobals();
    saveChallenges();
    saveState();
    renderChallengeSelector();
    render();
    showToast("Modo sem duelo ativado. Use o Modo Solo ou crie um duelo!");
    return;
  }
  if (!getAuthUser()) {
    openAuthDialog("Faça login para acessar e alternar duelos.");
    return;
  }
  const userChallenges = getUserChallenges();
  const target = userChallenges.find((c) => c.id === challengeId);
  if (!target) return;
  activeChallengeId = target.id;
  syncActiveChallengeGlobals();
  saveChallenges();
  saveState();
  render();
  showToast(`Duelo "${target.title}" selecionado.`);
}

function totalPoints(playerId) {
  return duelWorkouts(playerId).reduce((total, workout) => total + pointsForWorkout(workout), 0);
}

function duelWorkouts(playerId) {
  const period = activeDuelPeriod();
  return workoutsFor(playerId).filter((workout) => workout.date >= period.start && workout.date <= period.end);
}

function currentStreak(playerId) {
  const days = new Set(duelWorkouts(playerId).map((workout) => workout.date));
  let cursor = new Date();
  if (!days.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderProfileSelect() {
  const select = byId("profile-select");
  if (!select) return;
  select.innerHTML = PLAYERS.map((player) => `<option value="${player.id}">${player.name}${player.id === state.activePlayer ? " (você)" : ""}</option>`).join("");
  select.value = state.activePlayer;
}

// ENGINE DO KAMEHAMEHA 16-BIT (STRICTLY ON-AXIS CANVAS)
// ENGINE DO KAMEHAMEHA 16-BIT & MODOS RETRO ARCADE
let currentArcadeScenario = localStorage.getItem("rep-club-arcade-scenario") || "dbz_goku_cell";

const ARCADE_SCENARIOS = {
  dbz_goku_cell: {
    id: "dbz_goku_cell",
    name: "Goku vs Cell",
    p1Name: (pts) => pts >= 100 ? "⚡ GOKU SSJ BLUE" : pts >= 50 ? "🔥 GOKU SSJ2" : "GOKU SSJ",
    p2Name: (pts) => pts >= 100 ? "👑 CELL DOURADO" : pts >= 50 ? "💥 CELL 100% POWER" : "PERFECT CELL",
    p1BeamColor: "#38bdf8",
    p2BeamColor: "#eab308",
    p1AuraColor: (tier) => tier === 3 ? "rgba(56, 189, 248, " : "rgba(250, 204, 21, ",
    p2AuraColor: (tier) => tier === 3 ? "rgba(234, 179, 8, " : "rgba(168, 85, 247, ",
  },
  sf_ryu_ken: {
    id: "sf_ryu_ken",
    name: "Ryu vs Ken",
    p1Name: (pts) => pts >= 100 ? "⚡ SHIN RYU (METSU)" : pts >= 50 ? "🔥 EVIL RYU" : "RYU",
    p2Name: (pts) => pts >= 100 ? "👑 VIOLENT KEN" : pts >= 50 ? "💥 FIRE KEN" : "KEN MASTERS",
    p1BeamColor: "#60a5fa",
    p2BeamColor: "#f97316",
    p1AuraColor: (tier) => tier === 3 ? "rgba(59, 130, 246, " : "rgba(147, 197, 253, ",
    p2AuraColor: (tier) => tier === 3 ? "rgba(239, 68, 68, " : "rgba(249, 115, 22, ",
  }
};

if (!ARCADE_SCENARIOS[currentArcadeScenario]) {
  currentArcadeScenario = "dbz_goku_cell";
}

const ARCADE_ASSETS = {
  dbz_goku_cell: {
    p1: new Image(),
    p2: new Image(),
    p1Blast: new Image(),
    p2Blast: new Image(),
    p1Beam: new Image(),
    p2Beam: new Image(),
    p1X: 8, p1Y: 48,
    p2X: 518, p2Y: 28,
    p1BlastX: 57, p1BlastY: 42,
    p2BlastX: 450, p2BlastY: 42,
    p1BeamStartX: 142,
    p2BeamEndX: 450,
    p1AuraX: 33, p1AuraY: 90,
    p2AuraX: 553, p2AuraY: 85,
  },
  sf_ryu_ken: {
    p1: new Image(),
    p2: new Image(),
    p1Blast: new Image(),
    p2Blast: new Image(),
    p1Beam: new Image(),
    p2Beam: new Image(),
    p1X: 8, p1Y: 44,
    p2X: 498, p2Y: 36,
    p1BlastX: 80, p1BlastY: 56,
    p2BlastX: 468, p2BlastY: 56,
    p1BeamStartX: 120,
    p2BeamEndX: 475,
    p1AuraX: 48, p1AuraY: 90,
    p2AuraX: 546, p2AuraY: 88,
  },
  clashA: new Image(),
  clashB: new Image(),
};

ARCADE_ASSETS.dbz_goku_cell.p1.src = "assets/dbz/goku_ssj.png";
ARCADE_ASSETS.dbz_goku_cell.p2.src = "assets/dbz/cell_perfect.png";
ARCADE_ASSETS.dbz_goku_cell.p1Blast.src = "assets/dbz/goku_blast.png";
ARCADE_ASSETS.dbz_goku_cell.p2Blast.src = "assets/dbz/cell_blast.png";
ARCADE_ASSETS.dbz_goku_cell.p1Beam.src = "assets/dbz/goku_beam.png";
ARCADE_ASSETS.dbz_goku_cell.p2Beam.src = "assets/dbz/cell_beam.png";

ARCADE_ASSETS.sf_ryu_ken.p1.src = "assets/sf/ryu.png";
ARCADE_ASSETS.sf_ryu_ken.p2.src = "assets/sf/ken.png";
ARCADE_ASSETS.sf_ryu_ken.p1Blast.src = "assets/sf/ryu_blast.png";
ARCADE_ASSETS.sf_ryu_ken.p2Blast.src = "assets/sf/ken_blast.png";
ARCADE_ASSETS.sf_ryu_ken.p1Beam.src = "assets/sf/ryu_beam.png";
ARCADE_ASSETS.sf_ryu_ken.p2Beam.src = "assets/sf/ken_beam.png";

ARCADE_ASSETS.clashA.src = "assets/dbz/clash_epicenter.png";
ARCADE_ASSETS.clashB.src = "assets/dbz/clash_epicenter_b.png";
const DBZ_ASSETS = ARCADE_ASSETS.dbz_goku_cell;

let currentClashRatio = 50;
let targetClashRatio = 50;
let kamehamehaAnimId = null;
let gokuFighterPoints = 0;
let cellFighterPoints = 0;

function startKamehamehaLoop() {
  if (kamehamehaAnimId) return;

  function loop() {
    const canvas = byId("kamehameha-canvas");
    if (canvas && !byId("scoreboard-kamehameha")?.hidden) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const scenario = ARCADE_SCENARIOS[currentArcadeScenario] || ARCADE_SCENARIOS.dbz_goku_cell;
        const assets = ARCADE_ASSETS[currentArcadeScenario] || ARCADE_ASSETS.dbz_goku_cell;

        // Interpolação suave em direção à pontuação real
        currentClashRatio += (targetClashRatio - currentClashRatio) * 0.08;

        // Fundo preto puro (retro arcade)
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 602, 174);

        // Amplitude do clash no eixo horizontal (185 = perto do Goku, 417 = perto do Cell)
        const minX = 185;
        const maxX = 417;
        const clashX = Math.round(minX + (currentClashRatio / 100) * (maxX - minX));

        // Tremor sutil de alta frequência arcade
        const shakeX = (Math.random() - 0.5) * 1.5;
        const shakeY = (Math.random() - 0.5) * 1.5;

        // Tiers de transformação (Tier 1: Base, Tier 2: 50+ pts, Tier 3: 100+ pts)
        const gokuTier = gokuFighterPoints >= 100 ? 3 : gokuFighterPoints >= 50 ? 2 : 1;
        const cellTier = cellFighterPoints >= 100 ? 3 : cellFighterPoints >= 50 ? 2 : 1;

        // AURA PULSANTE DO LUTADOR 1 (Tier 2 e 3)
        const p1AuraX = assets.p1AuraX ?? 33;
        const p1AuraY = assets.p1AuraY ?? 90;
        const p2AuraX = assets.p2AuraX ?? 553;
        const p2AuraY = assets.p2AuraY ?? 85;

        if (gokuTier >= 2) {
          const pulse = 0.16 + 0.12 * Math.sin(Date.now() / 130);
          ctx.fillStyle = `${scenario.p1AuraColor(gokuTier)}${pulse})`;
          ctx.beginPath();
          ctx.arc(p1AuraX, p1AuraY, gokuTier === 3 ? 46 : 38, 0, Math.PI * 2);
          ctx.fill();
        }

        // AURA PULSANTE DO LUTADOR 2 (Tier 2 e 3)
        if (cellTier >= 2) {
          const pulse = 0.16 + 0.12 * Math.sin(Date.now() / 130);
          ctx.fillStyle = `${scenario.p2AuraColor(cellTier)}${pulse})`;
          ctx.beginPath();
          ctx.arc(p2AuraX, p2AuraY, cellTier === 3 ? 50 : 44, 0, Math.PI * 2);
          ctx.fill();
        }

        // 1. FEIXE HORIZONTAL DO LUTADOR 1
        const p1BeamStartX = assets.p1BeamStartX ?? 142;
        if (clashX > p1BeamStartX) {
          const p1BeamWidth = Math.max(0, (clashX - 35) - p1BeamStartX);
          if (p1BeamWidth > 0) {
            if (assets.p1Beam && assets.p1Beam.complete && assets.p1Beam.naturalWidth > 0) {
              ctx.drawImage(assets.p1Beam, 0, 0, 1, 27, p1BeamStartX, 62, p1BeamWidth, 27);
            } else {
              const grad1 = ctx.createLinearGradient(p1BeamStartX, 62, clashX - 35, 89);
              grad1.addColorStop(0, scenario.p1BeamColor);
              grad1.addColorStop(0.5, "#ffffff");
              grad1.addColorStop(1, scenario.p1BeamColor);
              ctx.fillStyle = grad1;
              ctx.fillRect(p1BeamStartX, 67, p1BeamWidth, 18);
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(p1BeamStartX, 72, p1BeamWidth, 8);
            }
          }
        }

        // 2. FEIXE HORIZONTAL DO LUTADOR 2
        const p2BeamEndX = assets.p2BeamEndX ?? 450;
        if (clashX < p2BeamEndX) {
          const p2BeamWidth = Math.max(0, p2BeamEndX - (clashX + 35));
          if (p2BeamWidth > 0) {
            if (assets.p2Beam && assets.p2Beam.complete && assets.p2Beam.naturalWidth > 0) {
              ctx.drawImage(assets.p2Beam, 0, 0, 1, 27, clashX + 35, 62, p2BeamWidth, 27);
            } else {
              const grad2 = ctx.createLinearGradient(clashX + 35, 62, p2BeamEndX, 89);
              grad2.addColorStop(0, scenario.p2BeamColor);
              grad2.addColorStop(0.5, "#ffffff");
              grad2.addColorStop(1, scenario.p2BeamColor);
              ctx.fillStyle = grad2;
              ctx.fillRect(clashX + 35, 67, p2BeamWidth, 18);
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(clashX + 35, 72, p2BeamWidth, 8);
            }
          }
        }

        // 3. SPRITE DO LUTADOR 1
        if (assets.p1 && assets.p1.complete && assets.p1.naturalWidth > 0) {
          ctx.drawImage(assets.p1, assets.p1X, assets.p1Y);
        } else {
          ctx.fillStyle = scenario.p1BeamColor;
          ctx.beginPath();
          ctx.arc(33, 80, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("P1", 33, 84);
        }

        // 4. ESFERA DE ORIGEM DO LUTADOR 1
        if (assets.p1Blast && assets.p1Blast.complete && assets.p1Blast.naturalWidth > 0) {
          ctx.drawImage(assets.p1Blast, assets.p1BlastX + shakeX * 0.4, assets.p1BlastY + shakeY * 0.4);
        } else {
          ctx.fillStyle = scenario.p1BeamColor;
          ctx.beginPath();
          ctx.arc(96, 75, 18, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. SPRITE DO LUTADOR 2
        if (assets.p2 && assets.p2.complete && assets.p2.naturalWidth > 0) {
          ctx.drawImage(assets.p2, assets.p2X, assets.p2Y);
        } else {
          ctx.fillStyle = scenario.p2BeamColor;
          ctx.beginPath();
          ctx.arc(553, 80, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("P2", 553, 84);
        }

        // 6. ESFERA DE ORIGEM DO LUTADOR 2
        if (assets.p2Blast && assets.p2Blast.complete && assets.p2Blast.naturalWidth > 0) {
          ctx.drawImage(assets.p2Blast, assets.p2BlastX + shakeX * 0.4, assets.p2BlastY + shakeY * 0.4);
        } else {
          ctx.fillStyle = scenario.p2BeamColor;
          ctx.beginPath();
          ctx.arc(485, 75, 18, 0, Math.PI * 2);
          ctx.fill();
        }

        // DESCARGAS ELÉTRICAS RETRO 16-BIT (LUTADOR 1 TIER 2 & 3)
        if (gokuTier >= 2 && Math.random() < 0.75) {
          ctx.strokeStyle = gokuTier === 3 ? "#7dd3fc" : "#fef08a";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          let lx = 12 + Math.random() * 42;
          let ly = 48 + Math.random() * 26;
          ctx.moveTo(lx, ly);
          lx += (Math.random() - 0.5) * 16; ly += 12; ctx.lineTo(lx, ly);
          lx += (Math.random() - 0.5) * 16; ly += 12; ctx.lineTo(lx, ly);
          ctx.stroke();
        }

        // DESCARGAS ELÉTRICAS RETRO 16-BIT (LUTADOR 2 TIER 2 & 3)
        if (cellTier >= 2 && Math.random() < 0.75) {
          ctx.strokeStyle = cellTier === 3 ? "#fef08a" : "#c084fc";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          let cx = 525 + Math.random() * 50;
          let cy = 34 + Math.random() * 35;
          ctx.moveTo(cx, cy);
          cx += (Math.random() - 0.5) * 16; cy += 14; ctx.lineTo(cx, cy);
          cx += (Math.random() - 0.5) * 16; cy += 14; ctx.lineTo(cx, cy);
          ctx.stroke();
        }

        // 7. EPICENTRO DA COLISÃO (centralizado em clashX, y=76 -> canto superior esquerdo clashX - 53, y=20)
        const useFrameB = (Math.floor(Date.now() / 110) % 2 === 0);
        const clashImg = (useFrameB && ARCADE_ASSETS.clashB.complete) ? ARCADE_ASSETS.clashB : ARCADE_ASSETS.clashA;
        if (clashImg && clashImg.complete) {
          ctx.drawImage(clashImg, clashX - 53 + shakeX, 20 + shakeY);
        }
      }
    }
    kamehamehaAnimId = requestAnimationFrame(loop);
  }

  kamehamehaAnimId = requestAnimationFrame(loop);
}

function renderScoreboard() {
  const rankedPlayers = PLAYERS.map((player) => {
    const workouts = duelWorkouts(player.id);
    const points = workouts.reduce((sum, w) => sum + pointsForWorkout(w), 0);
    const volume = workouts.reduce((sum, w) => sum + (w.trainingVolume || 0), 0);
    return { player, points, workouts, volume };
  }).sort((a, b) => b.points - a.points || b.workouts.length - a.workouts.length);

  const me = playerFor(state.activePlayer);
  const meStats = rankedPlayers.find((r) => r.player.id === me.id) || { player: me, points: totalPoints(me.id), workouts: duelWorkouts(me.id), volume: 0 };

  // No topo (duelo direto 1v1 ou Top 1 vs Top 2)
  const fighter1 = rankedPlayers[0] || meStats;
  const fighter2 = rankedPlayers[1] || (PLAYERS.find((p) => p.id !== fighter1.player.id) ? { player: PLAYERS.find((p) => p.id !== fighter1.player.id), points: 0, workouts: [], volume: 0 } : fighter1);

  const f1Points = fighter1.points;
  const f2Points = fighter2.points;
  const totalClash = Math.max(1, f1Points + f2Points);
  const lead = f1Points - f2Points;

  // Atualização dos botões de estilo e visibilidade
  const cur = getActiveChallenge();
  const user = getAuthUser();
  const emptyView = byId("scoreboard-empty");
  const classicView = byId("scoreboard-classic");
  const kamehamehaView = byId("scoreboard-kamehameha");

  const isNoDuel = !cur || activeChallengeId === "none" || (user && getUserChallenges().length === 0);

  const duelSections = [
    document.querySelector(".intro-row"),
    byId("main-scoreboard"),
    document.querySelector(".roast-banner"),
    document.querySelector(".action-section"),
    byId("programa"),
    document.querySelector(".dashboard-grid"),
    byId("evolucao")
  ];

  if (isNoDuel) {
    duelSections.forEach((el) => { if (el) el.style.display = "none"; });
    if (emptyView) {
      emptyView.style.display = "block";
      const emptyAuthBtn = byId("btn-empty-auth");
      const descEl = byId("empty-duel-desc");

      if (user) {
        if (emptyAuthBtn) emptyAuthBtn.style.display = "none";
        if (descEl) descEl.innerHTML = `Olá, <strong>${escapeHTML(user.name || user.email)}</strong>! Você não possui nenhum duelo ativo no momento. Crie um novo duelo para competir ou treine pelo Modo Solo.`;
      } else {
        if (emptyAuthBtn) {
          emptyAuthBtn.style.display = "inline-flex";
          emptyAuthBtn.onclick = () => openAuthDialog();
        }
        if (descEl) descEl.innerHTML = `Faça login para salvar seus pontos ou acesse o <strong>Modo Solo</strong> para treinar individualmente.`;
      }
      const btnEmpty = byId("btn-empty-new-challenge");
      if (btnEmpty) btnEmpty.onclick = () => openSetupDialog("create");
    }
    if (classicView) classicView.hidden = true;
    if (kamehamehaView) kamehamehaView.hidden = true;
    return;
  } else {
    duelSections.forEach((el) => { if (el) el.style.display = ""; });
    if (emptyView) emptyView.style.display = "none";
  }

  const btnClassic = byId("btn-style-classic");
  const btnKamehameha = byId("btn-style-kamehameha");
  if (btnClassic) {
    btnClassic.classList.toggle("active", scoreboardStyle === "classic");
    btnClassic.setAttribute("aria-pressed", String(scoreboardStyle === "classic"));
  }
  if (btnKamehameha) {
    btnKamehameha.classList.toggle("active", scoreboardStyle === "kamehameha");
    btnKamehameha.setAttribute("aria-pressed", String(scoreboardStyle === "kamehameha"));
  }
  if (classicView) classicView.hidden = scoreboardStyle !== "classic";
  if (kamehamehaView) kamehamehaView.hidden = scoreboardStyle !== "kamehameha";

  // MODO CLÁSSICO
  if (byId("you-name")) {
    byId("you-name").textContent = fighter1.player.name;
    byId("you-avatar").textContent = fighter1.player.short;
    byId("you-avatar").style.backgroundColor = fighter1.player.color || "var(--lime)";
    byId("you-avatar").style.color = fighter1.player.textColor || "var(--ink)";
    byId("you-label").textContent = fighter1.player.id === state.activePlayer ? "SEU LADO · 1º" : "1º LUGAR";
    byId("you-score").textContent = String(f1Points).padStart(2, "0");

    byId("rival-name").textContent = fighter2.player.name;
    byId("rival-avatar").textContent = fighter2.player.short;
    byId("rival-avatar").style.backgroundColor = fighter2.player.color || "var(--blue)";
    byId("rival-avatar").style.color = fighter2.player.textColor || "#fff";
    byId("rival-label").textContent = fighter2.player.id === state.activePlayer ? "SEU LADO · 2º" : "2º LUGAR";
    byId("rival-score").textContent = String(f2Points).padStart(2, "0");

    byId("score-track-me").style.width = `${(f1Points / totalClash) * 100}%`;
    byId("score-track-me").style.backgroundColor = fighter1.player.color || "var(--lime)";
    byId("score-track-rival").style.flex = `${f2Points || 1}`;
    byId("score-track-rival").style.backgroundColor = fighter2.player.color || "var(--blue)";
  }

  // MODO RETRO ARCADE (KAMEHAMEHA & CENÁRIOS)
  gokuFighterPoints = f1Points;
  cellFighterPoints = f2Points;

  const scenario = ARCADE_SCENARIOS[currentArcadeScenario] || ARCADE_SCENARIOS.dbz_goku_cell;
  const gokuTierName = scenario.p1Name(f1Points);
  const cellTierName = scenario.p2Name(f2Points);

  const scenarioSelect = byId("arcade-scenario-select");
  if (scenarioSelect && scenarioSelect.value !== currentArcadeScenario) {
    scenarioSelect.value = currentArcadeScenario;
  }

  const gokuTag = byId("goku-fighter-tag");
  if (gokuTag) gokuTag.textContent = gokuTierName;
  const cellTag = byId("cell-fighter-tag");
  if (cellTag) cellTag.textContent = cellTierName;

  const gokuName = byId("goku-player-name");
  const cellName = byId("cell-player-name");
  if (gokuName && cellName) {
    gokuName.textContent = fighter1.player.name;
    byId("goku-player-score").textContent = String(f1Points).padStart(2, "0");
    cellName.textContent = fighter2.player.name;
    byId("cell-player-score").textContent = String(f2Points).padStart(2, "0");

    const ratio = Math.round((f1Points / totalClash) * 100);
    // Limita entre 12% e 88%
    targetClashRatio = Math.min(88, Math.max(12, ratio));
    startKamehamehaLoop();

    const clashMarker = byId("clash-percentage");
    if (clashMarker) {
      if (f1Points === f2Points) clashMarker.textContent = "50% · EMPATE";
      else if (ratio > 50) clashMarker.textContent = `${ratio}% · ${fighter1.player.name}`;
      else clashMarker.textContent = `${100 - ratio}% · ${fighter2.player.name}`;
    }

    const commentary = byId("kamehameha-commentary");
    if (commentary) {
      if (lead === 0) {
        commentary.textContent = `⚡ DUELO EM EQUILÍBRIO TOTAL! QUEM TREINAR PRIMEIRO DESEMPATA!`;
      } else if (f1Points > f2Points) {
        commentary.textContent = lead >= 15
          ? `💥 ${gokuTierName} ESTÁ DOMINANDO O DUELO! ${fighter1.player.name} ABRIU ${lead} PTS DE VANTAGEM!`
          : `🔥 ${gokuTierName} ESTÁ AVANÇANDO O PLACAR! ${fighter1.player.name} LIDERA POR ${lead} PTS!`;
      } else {
        const adv = f2Points - f1Points;
        commentary.textContent = adv >= 15
          ? `⚡ ${cellTierName} LIBEROU FORÇA MÁXIMA! ${fighter2.player.name} TEM ${adv} PTS DE VANTAGEM!`
          : `✨ ${cellTierName} ESTÁ PRESSIONANDO O PLACAR! ${fighter2.player.name} AVANÇA COM ${adv} PTS!`;
      }
    }
  }

  if (byId("chart-you-name")) byId("chart-you-name").textContent = fighter1.player.name;
  if (byId("chart-rival-name")) byId("chart-rival-name").textContent = fighter2.player.name;
  byId("prize-display").textContent = challengePrize || "Não definido";
  const period = activeDuelPeriod();
  const periodLabel = `${formatPeriodDate(period.start)} – ${formatPeriodDate(period.end)}`;
  byId("period-display").textContent = periodLabel;
  byId("period-range-intro").textContent = periodLabel;

  if (lead > 0) {
    byId("score-message").textContent = `${fighter1.player.name} na frente por ${lead} ponto${lead === 1 ? "" : "s"}`;
    byId("weekly-lead").textContent = `${fighter1.player.name} lidera a disputa por ${lead} ponto${lead === 1 ? "" : "s"}.`;
  } else if (lead < 0) {
    byId("score-message").textContent = `${fighter2.player.name} na frente por ${Math.abs(lead)} ponto${Math.abs(lead) === 1 ? "" : "s"}`;
    byId("weekly-lead").textContent = `${fighter2.player.name} lidera a disputa por ${Math.abs(lead)} ponto${Math.abs(lead) === 1 ? "" : "s"}.`;
  } else {
    byId("score-message").textContent = "Empate na liderança. O próximo treino desempata.";
    byId("weekly-lead").textContent = "Empate na liderança. O próximo treino desempata.";
  }

  const outcome = lead === 0 ? "tie" : lead > 0 ? "win" : "loss";
  const winner = fighter1.player;
  const loser = fighter2.player;
  byId("loser-roast").textContent = VISIT_BANTER[outcome]
    .replaceAll("{me}", fighter1.player.name)
    .replaceAll("{rival}", fighter2.player.name)
    .replaceAll("{winner}", winner.name)
    .replaceAll("{loser}", loser.name)
    .replaceAll("{margin}", String(Math.abs(lead)));

  const todayKey = localDate();
  if (todayKey < period.start) {
    const daysUntilStart = Math.round((dateFromString(period.start) - dateFromString(todayKey)) / 86400000);
    byId("days-remaining").textContent = `COMEÇA EM ${daysUntilStart} DIAS`;
  } else if (todayKey > period.end) {
    byId("days-remaining").textContent = "DUELO ENCERRADO";
  } else {
    const daysLeft = Math.round((dateFromString(period.end) - dateFromString(todayKey)) / 86400000);
    byId("days-remaining").textContent = daysLeft === 0 ? "ÚLTIMO DIA" : `FALTAM ${daysLeft} DIAS`;
  }
}

function renderToday() {
  const me = playerFor(state.activePlayer);
  const todayWorkouts = workoutsFor(me.id).filter((workout) => workout.date === localDate());
  byId("dialog-date").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  byId("dialog-profile-name").textContent = me.name;

  byId("action-status").textContent = todayWorkouts.length > 0
    ? `Hoje: ${todayWorkouts.map((workout) => `${workout.name} · +${pointsForWorkout(workout)} pts`).join(" · ")}`
    : "Nenhum treino registrado hoje";
}

function renderActivity() {
  const me = playerFor(state.activePlayer) || PLAYERS[0];
  const cur = getActiveChallenge();
  const list = currentChallengeWorkouts();
  const recent = [...list].sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date)).slice(0, 12);
  byId("activity-count").textContent = `${list.length} REGISTRO${list.length === 1 ? "" : "S"}`;

  if (recent.length === 0) {
    byId("activity-list").innerHTML = '<p class="empty-activity">Nenhum treino por aqui ainda. O primeiro ponto está esperando.</p>';
    return;
  }

  const authUser = getAuthUser();

  byId("activity-list").innerHTML = recent.map((workout) => {
    const player = resolvePlayerForWorkout(workout, cur) || playerFor(workout.owner) || { name: "Atleta", short: "A", color: "var(--lime)", textColor: "#000" };
    const isMe = (authUser && ((workout.userId && (authUser.id === workout.userId || authUser.uid === workout.userId)) || (workout.userEmail && authUser.email === workout.userEmail) || (workout.userName && authUser.name && authUser.name.toLowerCase() === workout.userName.toLowerCase()))) || (player.id === me.id);
    const completedSets = workout.exercises?.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
    const plannedSets = workout.exercises?.reduce((sum, exercise) => sum + exercise.plannedSets, 0);
    const volumeInfo = workout.trainingVolume ? ` · ${Math.round(workout.trainingVolume).toLocaleString("pt-BR")} kg levantados` : "";
    const details = workout.category === "strength"
      ? `${workout.exercises ? `${completedSets}/${plannedSets} séries` : "Treino demonstrativo"} · esforço ${workout.effort ?? "-"}/10${volumeInfo}`
      : `${workout.duration} min · esforço ${workout.effort ?? workout.rpe ?? "-"}/10`;
    const comment = workout.comments ? `<span class="activity-comment">${escapeHTML(workout.comments)}</span>` : "";
    return `
      <article class="activity-row">
        <span class="activity-avatar" style="background:${player.color || "var(--lime)"}; color:${player.textColor || "#000"};">${escapeHTML(player.short)}</span>
        <span class="activity-detail">
          <strong>${escapeHTML(player.name)} · ${escapeHTML(workout.name)}</strong>
          <span>${details}${isMe ? " · você" : ""}</span>
          ${comment}
        </span>
        ${workout.photo ? `<a href="${workout.photo}" target="_blank" rel="noreferrer" title="Ver foto em tamanho real"><img class="activity-photo-thumb" src="${workout.photo}" alt="Foto" /></a>` : ""}
        <span class="activity-date">${formatShortDate(workout.date)}</span>
        <strong class="activity-points">+${pointsForWorkout(workout)} pts</strong>
        <button type="button" class="activity-delete-btn" data-delete-workout="${escapeHTML(workout.id)}" title="Excluir este treino" aria-label="Excluir treino">✕</button>
      </article>
    `;
  }).join("");
}

function renderWeekChart() {
  const period = activeDuelPeriod();
  const start = dateFromString(period.start);
  const todayKey = localDate();
  const dayCount = Math.round((dateFromString(period.end) - start) / 86400000) + 1;
  const dailyPoints = (records, dateKey) => records
    .filter((workout) => workout.date === dateKey)
    .reduce((sum, workout) => sum + pointsForWorkout(workout), 0);

  const playerRecords = PLAYERS.map((player) => ({
    player,
    periodWorkouts: duelWorkouts(player.id),
  }));

  byId("week-chart").style.setProperty("--chart-days", dayCount);
  byId("week-chart").innerHTML = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = localDate(date);
    const day = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "").toUpperCase();
    const dateLabel = `${day} ${String(date.getDate()).padStart(2, "0")}`;
    const fullDate = formatPeriodDate(key);

    const barsHtml = playerRecords.map(({ player, periodWorkouts }) => {
      const pScore = dailyPoints(periodWorkouts, key);
      const pHeight = pScore === 0 ? 0 : Math.max(4, Math.min(78, (pScore / 66) * 78));
      return `<span class="chart-bar" data-points="${pScore}" style="height:${pHeight}px; background:${player.color}; border:1px solid ${player.color};" title="${fullDate}: ${pScore} pts de ${escapeHTML(player.name)}"></span>`;
    }).join("");

    return `<div class="chart-day"><div class="chart-bars">${barsHtml}</div><span class="chart-label ${key === todayKey ? "today" : ""}">${dateLabel}</span></div>`;
  }).join("");

  const legendEl = document.querySelector(".week-legend");
  if (legendEl) {
    legendEl.innerHTML = PLAYERS.map((p) => `<span><i class="legend-dot" style="background:${p.color}"></i><span>${escapeHTML(p.name)}</span></span>`).join("");
  }

  byId("modality-breakdown").innerHTML = `
    <div class="modality-row modality-heading"><span>MODALIDADE</span>${PLAYERS.map((p) => `<span>${escapeHTML(p.name)}</span>`).join("")}</div>
    ${Object.entries(MODALITIES).map(([category, modality]) => {
    const playerCols = PLAYERS.map((player) => {
      const sessions = duelWorkouts(player.id).filter((w) => w.category === category);
      const pts = sessions.reduce((sum, w) => sum + pointsForWorkout(w), 0);
      return `<span class="modality-player"><strong>${sessions.length}t</strong>${pts} pts</span>`;
    }).join("");
    return `<div class="modality-row"><span>${modality.label}</span>${playerCols}</div>`;
  }).join("")}`;

  const me = playerFor(state.activePlayer);
  const mePeriod = duelWorkouts(me.id);
  byId("week-summary-number").textContent = String(mePeriod.length);
  byId("streak-number").textContent = String(currentStreak(me.id));
}

function formatPrescription(exercise) {
  const range = exercise.min === exercise.max ? String(exercise.min) : `${exercise.min}–${exercise.max}`;
  const unit = exercise.unit === "s" ? "s" : "reps";
  return `${exercise.sets} × ${range} ${unit}${exercise.note ? ` ${exercise.note}` : ""}`;
}

function renderProgramSelector() {
  const select = byId("program-select");
  const progTitle = byId("program-title");
  const activeProg = getActiveProgram();
  if (progTitle) {
    progTitle.textContent = activeProg.name || "Treino Jiu + Cardio";
  }
  if (!select) return;
  select.innerHTML = trainingPrograms.map((p) => `
    <option value="${escapeHTML(p.id)}" ${p.id === activeProg.id ? "selected" : ""}>${escapeHTML(p.name)}</option>
  `).join("");
}

function renderTrainingPlan() {
  const currentProg = getActiveProgram();
  const sessions = currentProg?.sessions || DEFAULT_PROGRAM.sessions;
  byId("program-list").innerHTML = sessions.map((plan) => `
    <article class="program-card">
      <div class="program-card-meta"><span>${plan.day || "TREINO"}</span><span>TREINO ${plan.id}${plan.id === "C" && plan.cardioBlock ? " · LEVE" : ""}</span></div>
      <h3>${plan.title}</h3>
      ${plan.cardioBlock ? `<p class="program-card-cardio">${plan.cardioBlock.label} · ${plan.cardioBlock.min}–${plan.cardioBlock.max} min</p>` : ""}
      <details class="program-details">
        <summary>Ver ${plan.exercises.length} exercícios</summary>
        <ul>${plan.exercises.map((exercise) => `<li><span>${exercise.name}</span><strong>${formatPrescription(exercise)}</strong></li>`).join("")}</ul>
      </details>
      <button class="program-action" type="button" data-start-template="${escapeHTML(plan.id)}">Registrar treino <span>↗</span></button>
    </article>`).join("");
}

function normalizeExerciseSearch(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function readExerciseLogs(formData, plan) {
  return plan.exercises.map((exercise, index) => {
    const editablePrescription = plan.id === "custom-new" || plan.id.startsWith("custom-");
    const plannedSets = editablePrescription ? Number(formData.get(`plannedSets-${index}`) || exercise.sets) : exercise.sets;
    const minReps = editablePrescription ? Number(formData.get(`minReps-${index}`) || exercise.min) : exercise.min;
    const maxReps = editablePrescription ? Number(formData.get(`maxReps-${index}`) || exercise.max) : exercise.max;
    const variation = formData.get(`variation-${index}`);
    const name = formData.get(`exerciseName-${index}`) || variation || exercise.name;
    const requiresLoad = exercise.load !== false;
    const loadFactor = Number(formData.get(`loadFactor-${index}`) || exercise.loadFactor || 1);
    return {
      name,
      catalogId: exercise.catalogId || null,
      imagePath: exercise.imagePath || null,
      equipment: exercise.equipment || "",
      plannedSets,
      minReps,
      maxReps,
      unit: exercise.unit || "reps",
      note: exercise.note || "",
      requiresLoad,
      loadFactor,
      sets: Array.from({ length: plannedSets }, (_, setIndex) => ({
        done: formData.getAll(`done-${index}`).includes(String(setIndex)),
        reps: Number(formData.get(`reps-${index}-${setIndex}`) || 0),
        load: requiresLoad ? Number(formData.get(`load-${index}-${setIndex}`) || 0) : 0,
      })),
    };
  });
}

function preserveSetEntries(logs) {
  logs.forEach((exercise, index) => {
    const name = byId("workout-fields").querySelector(`[name="exerciseName-${index}"]`);
    const plannedSets = byId("workout-fields").querySelector(`[name="plannedSets-${index}"]`);
    const minReps = byId("workout-fields").querySelector(`[name="minReps-${index}"]`);
    const maxReps = byId("workout-fields").querySelector(`[name="maxReps-${index}"]`);
    const loadFactor = byId("workout-fields").querySelector(`[name="loadFactor-${index}"]`);
    if (name) name.value = exercise.name;
    if (plannedSets) plannedSets.value = exercise.plannedSets;
    if (minReps) minReps.value = exercise.minReps;
    if (maxReps) maxReps.value = exercise.maxReps;
    if (loadFactor) loadFactor.value = exercise.loadFactor;
    exercise.sets.forEach((set, setIndex) => {
      const checkbox = byId("workout-fields").querySelector(`[name="done-${index}"][value="${setIndex}"]`);
      const reps = byId("workout-fields").querySelector(`[name="reps-${index}-${setIndex}"]`);
      const load = byId("workout-fields").querySelector(`[name="load-${index}-${setIndex}"]`);
      if (checkbox) checkbox.checked = set.done;
      if (reps) reps.value = set.reps;
      if (load && set.load) load.value = set.load;
    });
  });
  updatePointsPreview();
}

function renderExercisePickerResults(query = "") {
  const results = byId("exercise-picker-results");
  if (!exerciseCatalog) {
    results.innerHTML = '<p class="exercise-picker-status">Carregando catálogo…</p>';
    return;
  }
  const normalizedQuery = normalizeExerciseSearch(query.trim());
  if (normalizedQuery.length < 2) {
    results.innerHTML = `<p class="exercise-picker-status">Digite pelo menos 2 letras para buscar nos ${exerciseCatalog.length} exercícios.</p>`;
    return;
  }
  const matches = exerciseCatalog.filter((exercise) => normalizeExerciseSearch(`${exercise.name} ${exercise.equipment || ""} ${(exercise.primaryMuscles || []).join(" ")}`).includes(normalizedQuery)).slice(0, 24);
  if (!matches.length) {
    results.innerHTML = '<p class="exercise-picker-status">Nenhum exercício encontrado.</p>';
    return;
  }
  results.innerHTML = matches.map((exercise) => {
    const image = exerciseCatalogImage(exercise);
    const source = exerciseCatalogPage(exercise);
    return `<article class="exercise-choice"><img src="${image}" alt="" decoding="async" ${image ? "" : "hidden"} /><div class="exercise-choice-copy"><strong>${escapeHTML(exercise.name)}</strong><span>${escapeHTML(exercise.equipment || "Equipamento não informado")} · ${escapeHTML((exercise.primaryMuscles || []).slice(0, 2).join(", "))}</span><a href="${source}" target="_blank" rel="noreferrer">Ver imagem no GitHub</a></div><button type="button" class="exercise-choice-button" data-catalog-id="${escapeHTML(exercise.id)}">Selecionar</button></article>`;
  }).join("");
}

async function openExercisePicker(mode, index = null) {
  exercisePickerTarget = { mode, index };
  exercisePickerPanelOpen = true;
  byId("exercise-picker").open = true;
  byId("exercise-picker-search").value = "";
  byId("exercise-picker-results").innerHTML = '<p class="exercise-picker-status">Carregando catálogo…</p>';
  try {
    await loadExerciseCatalog();
    renderExercisePickerResults(byId("exercise-picker-search").value);
  } catch (error) {
    byId("exercise-picker-results").innerHTML = '<p class="exercise-picker-status">Catálogo indisponível. Verifique a conexão e tente novamente.</p>';
    console.warn("Falha ao carregar o catálogo de exercícios.", error);
  }
  byId("exercise-picker-search").focus();
}

function chooseCatalogExercise(exerciseId) {
  const selected = exerciseCatalog?.find((exercise) => exercise.id === exerciseId);
  if (!selected || !activeStrengthPlan || !exercisePickerTarget) return;
  const currentForm = byId("workout-form");
  const priorLogs = activeStrengthPlan.exercises.length ? readExerciseLogs(new FormData(currentForm), activeStrengthPlan) : [];
  activeStrengthPlan.exercises = activeStrengthPlan.exercises.map((exercise, index) => {
    const logged = priorLogs[index];
    return logged ? { ...exercise, sets: logged.plannedSets, min: logged.minReps, max: logged.maxReps, loadFactor: logged.loadFactor } : exercise;
  });
  const equipment = selected.equipment || "";
  const noExternalLoad = normalizeExerciseSearch(equipment).includes("body weight") || normalizeExerciseSearch(equipment).includes("body only");
  const makeExercise = (prescription = {}) => ({
    name: selected.name,
    catalogId: selected.id,
    imagePath: selected.images?.[0] || null,
    equipment,
    sets: prescription.sets || 3,
    min: prescription.min || 8,
    max: prescription.max || 12,
    unit: prescription.unit || "reps",
    note: prescription.note || "",
    load: noExternalLoad ? false : undefined,
    loadFactor: prescription.loadFactor || (normalizeExerciseSearch(equipment).includes("dumbbell") ? 2 : 1),
  });

  if (exercisePickerTarget.mode === "replace") {
    const index = exercisePickerTarget.index;
    activeStrengthPlan.exercises[index] = makeExercise(activeStrengthPlan.exercises[index]);
  } else {
    activeStrengthPlan.exercises.push(makeExercise());
  }
  if (!activeStrengthPlan.isCustom) {
    const sourcePlanId = activeStrengthPlan.id;
    activeStrengthPlan.id = "custom-new";
    activeStrengthPlan.day = "PERSONALIZADO";
    activeStrengthPlan.title = `Ficha baseada no Treino ${sourcePlanId}`;
    activeStrengthPlan.isCustom = true;
  }
  const selectedId = activeStrengthPlan.id;
  const planCopy = cloneTrainingPlan(activeStrengthPlan);
  exercisePickerPanelOpen = false;
  renderWorkoutFields(selectedId, planCopy);
  preserveSetEntries(priorLogs);
  exercisePickerTarget = null;
}

function exerciseMeanLoad(exercise) {
  if (!exercise) return 0;
  const completedSets = (exercise.sets || []).filter((set) => set && set.done);
  if (!completedSets.length || !exercise.requiresLoad) return 0;
  return completedSets.reduce((sum, set) => sum + Number(set.load ?? exercise.load ?? 0), 0) / completedSets.length;
}

function exerciseVolume(exercise) {
  if (!exercise || !exercise.requiresLoad) return 0;
  const oldAverage = Number(exercise.load || 0);
  return (exercise.sets || []).filter((set) => set && set.done).reduce((sum, set) => {
    return sum + Number(set.load ?? oldAverage) * (set.reps || 0) * (exercise.loadFactor || 1);
  }, 0);
}

function previousStrengthWorkout(playerId, templateId, workoutDate = localDate()) {
  return workoutsFor(playerId)
    .filter((workout) => workout.category === "strength" && workout.templateId === templateId && workout.date < workoutDate)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

function effortBonus(maximum, effort) {
  const factor = effort <= 3 ? 0 : effort <= 6 ? 0.5 : effort <= 8 ? 0.8 : 1;
  return Math.round(maximum * factor);
}

function strengthQuality(exercises, effort, previousWorkout) {
  const plannedSets = exercises.reduce((sum, exercise) => sum + exercise.plannedSets, 0);
  const effectiveSets = exercises.reduce((sum, exercise) => {
    return sum + exercise.sets.filter((set) => set.done).reduce((setSum, set) => setSum + Math.min(set.reps / exercise.minReps, 1), 0);
  }, 0);
  const executionPoints = plannedSets ? Math.round((effectiveSets / plannedSets) * 4) : 0;
  const effortPoints = effortBonus(MODALITIES.strength.effortMax, effort);
  const previousExercises = new Map((previousWorkout?.exercises || []).map((exercise) => [exercise.name, exercise]));
  const comparableExercises = exercises.filter((exercise) => previousExercises.has(exercise.name));
  const improvedExercises = comparableExercises.filter((exercise) => exerciseVolume(exercise) >= exerciseVolume(previousExercises.get(exercise.name)) * 1.02);
  const progressionPoints = comparableExercises.length === 0 || improvedExercises.length / comparableExercises.length >= 0.5 ? 2 : 1;
  return { total: executionPoints + effortPoints + progressionPoints, executionPoints, effortPoints, progressionPoints };
}

function modalityQuality(category, duration, effort) {
  const modality = MODALITIES[category];
  const durationPoints = Math.round(modality.durationMax * Math.min(duration / modality.targetMinutes, 1));
  const effortPoints = effortBonus(modality.effortMax, effort);
  return { total: durationPoints + effortPoints, durationPoints, effortPoints };
}

// SOBRECARGA PROGRESSIVA INTELIGENTE (HISTÓRICO, 1RM E METAS)
function getHistoricalExercisePerformance(exerciseName, playerId) {
  if (!exerciseName) return null;
  const normTarget = exerciseName.trim().toLowerCase();
  const curCh = getActiveChallenge();

  const athleteWorkouts = (state.workouts || [])
    .filter((w) => {
      if (w.category !== "strength" || !Array.isArray(w.exercises)) return false;
      const owner = resolvePlayerForWorkout(w, curCh);
      return owner && owner.id === playerId;
    })
    .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

  for (const w of athleteWorkouts) {
    const found = w.exercises.find((e) => e && e.name && e.name.trim().toLowerCase() === normTarget);
    if (found && Array.isArray(found.sets) && found.sets.length > 0) {
      const validSets = found.sets.filter((s) => s && (Number(s.load) > 0 || Number(s.reps) > 0));
      if (validSets.length > 0) {
        const loads = validSets.map((s) => Number(s.load) || 0);
        const maxLoad = Math.max(...loads);
        const topSet = validSets.find((s) => (Number(s.load) || 0) === maxLoad) || validSets[0];
        const topReps = Number(topSet.reps) || 10;
        const est1RM = maxLoad > 0 ? Math.round(maxLoad * (1 + topReps / 30) * 10) / 10 : 0;
        return {
          date: w.date || (w.createdAt ? w.createdAt.split("T")[0] : null),
          maxLoad,
          topReps,
          est1RM,
          setsCount: validSets.length,
        };
      }
    }
  }
  return null;
}

function renderOverloadCardHtml(exerciseName, exerciseIndex) {
  const perf = getHistoricalExercisePerformance(exerciseName, state.activePlayer);
  if (!perf || perf.maxLoad <= 0) {
    return `
      <div class="progressive-overload-card overload-new">
        <span class="overload-badge">💡 SOBRECARGA PROGRESSIVA</span>
        <span class="overload-note">Primeiro registro deste exercício! Anote suas cargas hoje para gerar metas de progressão na próxima sessão.</span>
      </div>
    `;
  }

  const nextReps = `${perf.maxLoad}kg × ${perf.topReps + 1}–${perf.topReps + 2} reps`;
  const nextLoadInc = perf.maxLoad >= 40 ? 4 : 2;
  const nextLoad = `${perf.maxLoad + nextLoadInc}kg × ${Math.max(6, perf.topReps - 2)}–${perf.topReps} reps`;

  return `
    <div class="progressive-overload-card">
      <div class="overload-header">
        <span class="overload-badge">⚡ SOBRECARGA PROGRESSIVA</span>
        <button type="button" class="overload-apply-btn" data-apply-load="${exerciseIndex}" data-last-load="${perf.maxLoad}" title="Preencher séries com ${perf.maxLoad} kg">Copiar ${perf.maxLoad} kg</button>
      </div>
      <div class="overload-body">
        <div class="overload-row">
          <span>Última sessão:</span>
          <strong>${perf.maxLoad} kg × ${perf.topReps} reps</strong>
          ${perf.est1RM ? `<span class="est-1rm">1RM est. ~${perf.est1RM} kg</span>` : ""}
          <small>${perf.date ? `em ${formatDisplayDate(perf.date)}` : ""}</small>
        </div>
        <div class="overload-row overload-target">
          <span>🎯 Meta sugerida hoje:</span>
          <strong>${nextReps}</strong> ou <strong>${nextLoad}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderWorkoutFields(templateId = null, planOverride = null) {
  const category = byId("workout-category").value;
  const fields = byId("workout-fields");
  const strengthSelectors = byId("strength-program-selectors");

  if (category === "strength") {
    if (strengthSelectors) strengthSelectors.style.display = "grid";
    const progSelect = byId("workout-plan-program");
    const sessSelect = byId("workout-plan-session");

    const curProgId = progSelect?.value || activeProgramId;
    if (progSelect) {
      progSelect.innerHTML = trainingPrograms.map((p) => `
        <option value="${escapeHTML(p.id)}" ${p.id === curProgId ? "selected" : ""}>${escapeHTML(p.name)}</option>
      `).join("");
    }

    const currentProg = trainingPrograms.find((p) => p.id === curProgId) || getActiveProgram();
    const sessions = currentProg.sessions || DEFAULT_PROGRAM.sessions;
    const curSessId = templateId || (sessions.some(s => s.id === sessSelect?.value) ? sessSelect.value : sessions[0]?.id || "A");

    if (sessSelect) {
      sessSelect.innerHTML = sessions.map((s) => `
        <option value="${escapeHTML(s.id)}" ${s.id === curSessId ? "selected" : ""}>${escapeHTML(s.id)} - ${escapeHTML(s.title)}</option>
      `).join("");
    }

    const selectedSession = sessions.find((s) => s.id === curSessId) || sessions[0];
    activeStrengthPlan = planOverride ? cloneTrainingPlan(planOverride) : cloneTrainingPlan(selectedSession);
    const plan = activeStrengthPlan;
    const isCustomPlan = Boolean(plan.isCustom || plan.id === "custom-new" || plan.id.startsWith("custom-"));

    fields.innerHTML = `
      ${plan.cardioBlock ? `<label class="form-field cardio-block-field"><span>${plan.cardioBlock.label.toUpperCase()} · MINUTOS</span><input name="cardioMinutes" type="number" min="${plan.cardioBlock.min}" max="${plan.cardioBlock.max}" value="${plan.cardioBlock.min}" required /><small>Este cardio faz parte do treino ${plan.id}; o registro continua como Musculação.</small></label>` : ""}
      <p class="effort-hint log-instruction">Marque as séries e anote reps e kg por série. O seletor define como a carga entra no volume.</p>
      ${plan.exercises.length ? `<div class="exercise-log-list">${plan.exercises.map((exercise, index) => `
        <article class="exercise-log">
          <div class="exercise-log-heading"><strong data-exercise-title="${index}">${escapeHTML(exercise.name)}</strong><span>${formatPrescription(exercise)}</span></div>
          <input type="hidden" name="exerciseName-${index}" value="${escapeHTML(exercise.name)}" />
          ${exercise.imagePath ? `<a class="exercise-selected-image" href="${exerciseCatalogPage({ images: [exercise.imagePath] })}" target="_blank" rel="noreferrer"><img src="${exerciseCatalogImage({ images: [exercise.imagePath] })}" alt="Demonstração de ${escapeHTML(exercise.name)}" loading="lazy" /><span>Imagem · GitHub</span></a>` : ""}
          <button class="exercise-replace-button" type="button" data-pick-exercise="${index}">Substituir exercício no catálogo</button>
          ${exercise.alternatives ? `<label class="exercise-variation"><span>VARIAÇÃO</span><select name="variation-${index}">${exercise.alternatives.map((alternative) => `<option value="${alternative}">${alternative}</option>`).join("")}</select></label>` : ""}
          ${isCustomPlan ? `<div class="custom-prescription"><label>SÉRIES<input name="plannedSets-${index}" type="number" min="1" max="12" value="${exercise.sets}" /></label><label>REPS MÍN<input name="minReps-${index}" type="number" min="1" max="100" value="${exercise.min}" /></label><label>REPS MÁX<input name="maxReps-${index}" type="number" min="1" max="100" value="${exercise.max}" /></label><label>VOLUME<select name="loadFactor-${index}"><option value="1" ${(exercise.loadFactor || 1) === 1 ? "selected" : ""}>Aparelho / carga total</option><option value="2" ${exercise.loadFactor === 2 ? "selected" : ""}>Por halter / por lado</option><option value="4" ${exercise.loadFactor === 4 ? "selected" : ""}>Dois halteres / por perna</option></select></label></div>` : ""}
          <div class="exercise-log-fields"><span class="bodyweight-note">${exercise.load === false ? "PESO CORPORAL · FORA DO VOLUME EXTERNO" : `CARGA ${exercise.loadFactor === 2 ? "POR HALTER" : exercise.loadFactor === 4 ? "DOIS HALTERES · POR PERNA" : "INDICADA NO APARELHO"}`}</span><output class="exercise-mean" data-mean-for="${index}">MÉDIA: —</output></div>
          ${renderOverloadCardHtml(exercise.name, index)}
          <div class="set-log-list">${Array.from({ length: exercise.sets }, (_, setIndex) => `
            <div class="set-log-row">
              <label class="set-check-label"><input class="set-check" name="done-${index}" type="checkbox" value="${setIndex}" /><span>SÉRIE ${setIndex + 1}</span></label>
              <label class="set-reps-label"><span>${exercise.unit === "s" ? "SEGUNDOS" : "REPS"}</span><input name="reps-${index}-${setIndex}" type="number" min="1" max="${exercise.max}" step="1" value="${exercise.min}" required /></label>
              ${exercise.load === false ? "" : `<label class="set-load-label"><span>KG</span><input name="load-${index}-${setIndex}" type="number" min="0.5" max="500" step="0.5" placeholder="kg" /></label>`}
            </div>`).join("")}</div>
        </article>`).join("")}</div>
      ` : `<p class="custom-plan-empty">Ficha vazia. Adicione seu primeiro exercício pelo catálogo abaixo.</p>`}
      <div class="add-exercise-bar" style="margin: 14px 0 10px; padding: 12px; background: #f4f5ee; border: 1px solid #d5d7cd; border-radius: 6px;">
        <span style="display:block; font-size:10px; font-weight:700; color:#55574f; margin-bottom:8px; letter-spacing:0.04em;">ADICIONAR EXERCÍCIO AO TREINO</span>
        <div class="exercise-autocomplete-widget" id="duel-exercise-autocomplete">
          <div class="autocomplete-input-wrap">
            <span class="autocomplete-icon">🔍</span>
            <input type="text" id="duel-autocomplete-search" class="autocomplete-input" placeholder="Buscar exercício por nome ou grupo muscular (com fotos)..." autocomplete="off" />
            <button type="button" class="autocomplete-clear-btn" id="duel-autocomplete-clear" style="display:none;" title="Limpar">✕</button>
          </div>
          <div class="autocomplete-dropdown" id="duel-autocomplete-dropdown" style="display:none;">
            <div class="autocomplete-items-list" id="duel-autocomplete-list"></div>
            <div class="autocomplete-custom-action" id="duel-autocomplete-custom">
              <span>✏️ Digitar outro exercício personalizado...</span>
            </div>
          </div>
        </div>
      </div>
      <p class="effort-hint">Volume externo do treino: <strong id="strength-volume">0 kg·reps</strong>. Halteres: kg por mão; o cálculo considera os dois halteres e os lados indicados.</p>`;
  } else {
    if (strengthSelectors) strengthSelectors.style.display = "none";
    const isBjj = category === "bjj";
    const target = MODALITIES[category].targetMinutes;
    fields.innerHTML = `
      <div class="sport-fields">
        <label class="form-field"><span>DURAÇÃO</span><div class="duration-input"><input name="duration" type="number" min="10" max="240" step="5" value="${target}" required /><span>MIN</span></div></label>
      </div>
      <p class="effort-hint">${isBjj ? "Referência: 60 min de tatame." : "Referência: 30 min de cardio."}</p>`;
  }
  fields.insertAdjacentHTML("beforeend", `
    <label class="form-field effort-field"><span>AVALIAÇÃO DE ESFORÇO</span><div class="effort-scale-caption"><span>1 · FRACO</span><output id="effort-label" for="effort-input">7 · Cara de quem treina</output><span>10 · FORTE</span></div><input class="effort-range" id="effort-input" name="effort" type="range" min="1" max="10" step="1" value="7" /></label>
    <p class="effort-hint">O esforço conta em todas as modalidades. 7–8 aproxima do máximo; 9–10 completa o bônus. O máximo continua limitado.</p>`);
  updateEffortLabel();
  updatePointsPreview();

  if (category === "strength") {
    const duelWidget = byId("duel-exercise-autocomplete");
    if (duelWidget) {
      initExerciseAutocomplete(duelWidget, (exName) => {
        handleAddExerciseToCurrentWorkout(exName);
      });
    }
  }
}

function updateEffortLabel() {
  const input = byId("effort-input");
  const output = byId("effort-label");
  if (!input || !output) return;
  const effort = Number(input.value);
  output.textContent = `${effort} · ${EFFORT_LABELS[effort]}`;
}

function updatePointsPreview() {
  const form = byId("workout-form");
  const formData = new FormData(form);
  const category = formData.get("category");
  let quality;
  if (category === "strength") {
    const plan = activeStrengthPlan || planForId(formData.get("templateId") || "A");
    const exercises = readExerciseLogs(formData, plan);
    const workoutDate = String(formData.get("workoutDate") || localDate());
    const prior = previousStrengthWorkout(state.activePlayer, plan.id, workoutDate);
    quality = strengthQuality(exercises, Number(formData.get("effort") || 7), prior);
  } else {
    quality = modalityQuality(category, Number(formData.get("duration") || 0), Number(formData.get("effort") || 7));
  }
  const basePoints = MODALITIES[category].basePoints;
  const pointDetails = category === "strength"
    ? `${basePoints} base + ${quality.executionPoints} execução + ${quality.progressionPoints} progressão + ${quality.effortPoints} esforço`
    : `${basePoints} base + ${quality.durationPoints} duração + ${quality.effortPoints} esforço`;
  byId("points-preview").innerHTML = `Este treino vale <strong>${basePoints + quality.total} pontos</strong> <span>(${pointDetails})</span>`;
  if (category === "strength") {
    const exercises = readExerciseLogs(formData, activeStrengthPlan || planForId(formData.get("templateId") || "A"));
    exercises.forEach((exercise, index) => {
      const output = byId("workout-fields").querySelector(`[data-mean-for="${index}"]`);
      if (output) output.textContent = exercise.requiresLoad ? `MÉDIA: ${exerciseMeanLoad(exercise).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg` : "SEM CARGA";
    });
    const volume = exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
    const volumeOutput = byId("strength-volume");
    if (volumeOutput) volumeOutput.textContent = `${Math.round(volume).toLocaleString("pt-BR")} kg·reps`;
  }
}

function historyExerciseOptions() {
  const seen = new Set();
  const activePlayer = playerFor(state.activePlayer);
  const playerWorkouts = workoutsFor(activePlayer.id).filter((w) => w && w.category === "strength");
  const optionsWithHistory = [];

  playerWorkouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      if (ex && ex.name && !seen.has(ex.name)) {
        seen.add(ex.name);
        const unit = ex.load === false ? (ex.unit === "s" ? "s" : "reps") : "kg";
        optionsWithHistory.push({ name: ex.name, label: `⭐ ${ex.name}`, unit });
      }
    });
  });

  const programOptions = allTrainingPlans().flatMap((plan) => (plan.exercises || []).flatMap((exercise) => {
    const names = exercise.alternatives || [exercise.name];
    const unit = exercise.load === false ? (exercise.unit === "s" ? "s" : "reps") : "kg";
    return names.map((name) => ({ name, label: `Treino ${plan.id} · ${name}`, unit }));
  })).filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });

  const all = [...optionsWithHistory, ...programOptions];
  if (!all.length) {
    all.push({ name: "Supino Reto com Halteres", label: "Supino Reto com Halteres", unit: "kg" });
  }
  return all;
}

function renderHistorySelect() {
  const select = byId("history-exercise");
  if (!select) return;
  const current = select.value;
  const options = historyExerciseOptions();
  select.innerHTML = options.map((item) => `<option value="${escapeHTML(item.name)}" data-unit="${item.unit}">${escapeHTML(item.label)}</option>`).join("");
  if (options.length > 0) {
    select.value = options.some((item) => item.name === current) ? current : options[0].name;
  }
}

function drawHistoryChart() {
  const select = byId("history-exercise");
  if (!select) return;
  const option = select.selectedOptions[0];
  if (!option) return;
  const exerciseName = option.value;
  const unit = option.dataset.unit || "kg";
  const activePlayer = playerFor(state.activePlayer);
  const measurements = workoutsFor(activePlayer.id)
    .filter((workout) => workout && workout.category === "strength")
    .flatMap((workout) => (workout.exercises || [])
      .filter((exercise) => exercise && exercise.name === exerciseName)
      .map((exercise) => {
        const completedSets = (exercise.sets || []).filter((set) => set && set.done);
        const reps = completedSets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0);
        let dateObj = new Date();
        try {
          dateObj = dateFromString(workout.date);
        } catch (e) {}
        return {
          date: workout.createdAt || `${workout.date}T12:00:00`,
          label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(dateObj),
          value: unit === "kg" ? exerciseMeanLoad(exercise) : reps,
        };
      }))
    .filter((measurement) => measurement.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const profileEl = byId("history-profile");
  if (profileEl) profileEl.textContent = `Perfil: ${activePlayer.name} · ${unit === "kg" ? "carga média em kg" : unit === "s" ? "tempo total em segundos" : "repetições concluídas"}`;
  const canvas = byId("history-chart");
  const empty = byId("history-empty");
  if (!canvas) return;

  canvas.hidden = measurements.length === 0;
  if (empty) {
    empty.hidden = measurements.length > 0;
    if (measurements.length === 0) {
      empty.textContent = `Sem histórico para ${exerciseName}. Registre esse exercício em seus treinos para acompanhar a evolução.`;
    }
  }
  if (measurements.length === 0) return;

  const width = Math.max(250, canvas.getBoundingClientRect().width);
  const height = 230;
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const context = canvas.getContext("2d");
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  const padding = { top: 18, right: 20, bottom: 35, left: 48 };
  const values = measurements.map((item) => item.value);
  const actualMin = Math.min(...values);
  const actualMax = Math.max(...values);
  const spread = actualMax === actualMin ? Math.max(actualMax * 0.15, 1) : actualMax - actualMin;
  const min = Math.max(0, actualMin - spread * 0.15);
  const max = actualMax + spread * 0.15;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xFor = (index) => measurements.length === 1 ? padding.left + chartWidth / 2 : padding.left + (index / (measurements.length - 1)) * chartWidth;
  const yFor = (value) => padding.top + ((max - value) / (max - min)) * chartHeight;

  context.font = "10px DM Sans, sans-serif";
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (let index = 0; index <= 4; index += 1) {
    const value = max - ((max - min) * index) / 4;
    const y = padding.top + (chartHeight * index) / 4;
    context.strokeStyle = "#dedfd7";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillStyle = "#777970";
    context.fillText(`${value.toFixed(unit === "kg" && value >= 10 ? 0 : 1)} ${unit}`, padding.left - 8, y);
  }

  context.strokeStyle = "#4664ea";
  context.lineWidth = 2.5;
  context.beginPath();
  measurements.forEach((measurement, index) => {
    const x = xFor(index);
    const y = yFor(measurement.value);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  measurements.forEach((measurement, index) => {
    const x = xFor(index);
    const y = yFor(measurement.value);
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fillStyle = "#d7fa52";
    context.fill();
    context.strokeStyle = "#20211d";
    context.lineWidth = 1.5;
    context.stroke();
    if (measurements.length <= 6 || index === 0 || index === measurements.length - 1) {
      context.fillStyle = "#777970";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(measurement.label, x, height - padding.bottom + 11);
    }
  });
}

function render() {
  renderChallengeSelector();
  renderAuthUI();
  renderProfileSelect();
  renderScoreboard();
  renderToday();
  renderProgramSelector();
  renderTrainingPlan();
  renderActivity();
  renderWeekChart();
  renderHistorySelect();
  drawHistoryChart();
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

// SÍNTESE DE ÁUDIO WEB AUDIO API PARA O DESCANSO & ALERTAS
let audioCtx = null;
let soundEnabled = localStorage.getItem("rep-club-sound-enabled") !== "false";

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playBeep(freq = 440, type = "sine", duration = 0.1, gainVal = 0.15) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

function playRestCountdownBeep() {
  playBeep(520, "sine", 0.08, 0.18);
}

function playRestFinishedAlert() {
  playBeep(660, "sine", 0.14, 0.22);
  setTimeout(() => playBeep(880, "sine", 0.32, 0.25), 120);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("rep-club-sound-enabled", String(soundEnabled));
  updateSoundToggleUI();
  if (soundEnabled) {
    playBeep(600, "sine", 0.09, 0.16);
    showToast("🔊 Áudio do cronômetro ativado");
  } else {
    showToast("🔇 Áudio do cronômetro silenciado");
  }
}

function updateSoundToggleUI() {
  const btn = byId("timer-sound-toggle");
  if (btn) {
    btn.textContent = soundEnabled ? "🔊" : "🔇";
    btn.classList.toggle("muted", !soundEnabled);
    btn.setAttribute("aria-label", soundEnabled ? "Silenciar cronômetro" : "Ativar áudio do cronômetro");
  }
}

function updateRestTimer() {
  const minutes = String(Math.floor(restSecondsRemaining / 60)).padStart(2, "0");
  const seconds = String(restSecondsRemaining % 60).padStart(2, "0");
  byId("timer-display").textContent = `${minutes}:${seconds}`;
}

function startRestTimer(seconds) {
  clearInterval(restTimerInterval);
  restSecondsRemaining = seconds;
  updateRestTimer();
  getAudioContext(); // Pre-aquece contexto no clique do usuário
  restTimerInterval = setInterval(() => {
    restSecondsRemaining -= 1;
    updateRestTimer();
    // Bip sutil nos últimos 3 segundos (3, 2, 1)
    if (restSecondsRemaining === 3 || restSecondsRemaining === 2 || restSecondsRemaining === 1) {
      playRestCountdownBeep();
    }
    if (restSecondsRemaining <= 0) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
      playRestFinishedAlert();
      if ("vibrate" in navigator) navigator.vibrate([150, 80, 150]);
      showToast("⏱️ Descanso finalizado!");
    }
  }, 1000);
}

function resetRestTimer() {
  clearInterval(restTimerInterval);
  restTimerInterval = null;
  restSecondsRemaining = 0;
  updateRestTimer();
}

function openWorkoutDialog(templateId = null) {
  const user = getAuthUser();
  if (!user) {
    openAuthDialog("Por favor, faça login antes de registrar o treino.");
    return;
  }
  const cur = getActiveChallenge();
  if (!cur || activeChallengeId === "none") {
    if (window.confirm("Você está no modo sem nenhum duelo ativo.\n\nDeseja abrir o Modo Solo para registrar seu treino individual? (Ou clique em Cancelar para criar um novo duelo)")) {
      window.location.href = "solo.html";
      return;
    } else {
      openSetupDialog("create");
      return;
    }
  }
  if (!userParticipatesInChallenge(cur, user)) {
    showToast("Você não participa deste duelo selecionado.");
    openAuthDialog("Entre com um perfil que participa deste duelo ou crie um novo.");
    return;
  }
  const me = getPlayerInChallenge(cur, user) || getActiveUserPlayer() || playerFor(state.activePlayer) || PLAYERS[0];
  state.activePlayer = me.id;
  cur.activePlayer = me.id;

  const todayCategories = workoutsFor(me.id).filter((workout) => workout.date === localDate()).map((workout) => workout.category);
  const category = templateId ? "strength" : Object.keys(MODALITIES).find((item) => !todayCategories.includes(item)) || "strength";

  byId("workout-category").value = category;
  byId("workout-name").value = "";
  byId("workout-date").value = localDate();
  byId("workout-date").max = localDate();
  byId("dialog-profile-name").textContent = me.name;
  byId("form-error").textContent = "";
  renderWorkoutFields(templateId);
  showModalSafely(byId("workout-dialog"));
}

byId("profile-select")?.addEventListener("change", (event) => {
  state.activePlayer = event.target.value;
  const cur = getActiveChallenge();
  if (cur) cur.activePlayer = state.activePlayer;
  saveChallenges();
  saveState();
  render();
  showToast(`Perfil de ${playerFor(state.activePlayer).name} selecionado.`);
});

function showModalSafely(dialog) {
  if (!dialog) return;
  try {
    dialog.style.removeProperty("display");
    dialog.style.display = "";
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
      return;
    }
  } catch (err) {
    console.warn("showModalSafely fallback:", err);
  }
  dialog.setAttribute("open", "");
  dialog.style.display = "block";
}

function closeModalSafely(dialog) {
  if (!dialog) return;
  try {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    }
  } catch (err) {}
  dialog.removeAttribute("open");
  dialog.style.removeProperty("display");
  dialog.style.display = "";
}

function renderSetupPlayers(namesList = null) {
  const container = byId("setup-players-list");
  if (!container) return;
  const list = namesList || PLAYERS.map((p) => p.name);
  if (!list.length) list.push("Jogador 1", "Jogador 2");

  const registered = (registeredUsersDirectory || []).filter((u) => u && u.name);

  container.innerHTML = list.map((name, index) => {
    const palette = PLAYER_PALETTE[index % PLAYER_PALETTE.length];
    const isOwner = index === 0;
    return `
      <div class="setup-player-row" data-index="${index}" style="display:flex; align-items:flex-start; gap:8px; margin-bottom:8px;">
        <span class="setup-player-color" style="background:${palette.color}; color:${palette.text}; width:24px; height:24px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; margin-top:6px; flex-shrink:0;">${index + 1}</span>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
          <input class="setup-player-input" type="text" name="playerNames" value="${escapeHTML(name)}" placeholder="Nome do participante ${index + 1}${isOwner ? ' (Você)' : ''}" maxlength="24" required style="width:100%; box-sizing:border-box;" />
          <select class="setup-player-select" data-select-index="${index}" style="font-size:11px; padding:4px 6px; background:#f4f4ee; border:1px solid #d0d2c9; border-radius:4px; color:#374151; width:100%; cursor:pointer;">
            <option value="">👤 Selecionar atleta já cadastrado / autenticado...</option>
            ${registered.length > 0 ? registered.map((u) => `
              <option value="${escapeHTML(u.name)}" ${String(u.name).toLowerCase() === String(name).toLowerCase() ? "selected" : ""}>
                ${escapeHTML(u.name)}${u.email ? ` (${escapeHTML(u.email)})` : ""}
              </option>
            `).join("") : `<option value="" disabled>Nenhum outro atleta cadastrado ainda — digite o nome acima e use o link de convite.</option>`}
          </select>
        </div>
        ${list.length > 2 ? `<button type="button" class="setup-player-remove" data-remove-player="${index}" title="Remover participante" style="margin-top:6px;">×</button>` : ""}
      </div>
    `;
  }).join("");
}

function getSetupPlayerNames() {
  const inputs = Array.from(document.querySelectorAll("#setup-players-list .setup-player-input"));
  return inputs.map((input) => input.value.trim()).filter(Boolean);
}

byId("setup-add-player-btn")?.addEventListener("click", () => {
  const current = getSetupPlayerNames();
  current.push(`Jogador ${current.length + 1}`);
  renderSetupPlayers(current);
  const inputs = document.querySelectorAll("#setup-players-list .setup-player-input");
  inputs[inputs.length - 1]?.focus();
});

byId("setup-players-list")?.addEventListener("change", (e) => {
  const select = e.target.closest(".setup-player-select");
  if (select && select.value) {
    const row = select.closest(".setup-player-row");
    const input = row?.querySelector(".setup-player-input");
    if (input) {
      input.value = select.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
});

byId("setup-players-list")?.addEventListener("click", (event) => {
  const removeBtn = event.target.closest("[data-remove-player]");
  if (removeBtn) {
    const index = Number(removeBtn.dataset.removePlayer);
    const current = getSetupPlayerNames();
    if (current.length > 2) {
      current.splice(index, 1);
      renderSetupPlayers(current);
    }
  }
});

let setupMode = "edit";
let currentSetupChallengeId = null;

function openSetupDialog(mode = "edit") {
  try {
    const cur = getActiveChallenge();
    if (mode !== "create" && (!cur || activeChallengeId === "none")) {
      mode = "create";
    }
    setupMode = mode;

    const user = getAuthUser();
    const cancelBtn = byId("cancel-setup-dialog");
    const closeBtn = byId("close-setup-dialog");
    const deleteBtn = byId("delete-challenge-btn");
    const error = byId("setup-error");
    if (error) error.textContent = "";

    if (cancelBtn) cancelBtn.style.display = "inline-flex";
    if (closeBtn) closeBtn.style.display = "block";

    currentSetupChallengeId = mode === "create" ? `challenge-${Date.now()}` : (cur?.id || `challenge-${Date.now()}`);

    const titleEl = byId("setup-title");
    const copyEl = byId("setup-copy");
    const challengeTitleInput = byId("setup-challenge-title");
    const prizeInput = byId("setup-prize");
    const periodStartInput = byId("setup-period-start");
    const periodEndInput = byId("setup-period-end");

    if (mode === "create") {
      if (titleEl) titleEl.textContent = "Criar novo desafio";
      if (copyEl) copyEl.textContent = "Cadastre o nome, participantes, datas e prêmio da nova disputa.";
      if (challengeTitleInput) challengeTitleInput.value = `Duelo ${String(challenges.length + 1).padStart(2, "0")}`;
      if (prizeInput) prizeInput.value = "";
      const defaultPeriod = defaultDuelPeriod();
      if (periodStartInput) periodStartInput.value = defaultPeriod.start;
      if (periodEndInput) periodEndInput.value = defaultPeriod.end;
      const myName = user?.name || (user?.email ? user.email.split("@")[0] : "Você");
      renderSetupPlayers([myName, "Rival"]);
      if (deleteBtn) deleteBtn.style.display = "none";
    } else {
      if (titleEl) titleEl.textContent = "Configuração do duelo";
      if (copyEl) copyEl.textContent = "Edite o nome, participantes, período do desafio e prêmio.";
      if (challengeTitleInput) challengeTitleInput.value = cur?.title || "Duelo 01";
      if (prizeInput) prizeInput.value = cur?.prize || "";
      if (periodStartInput) periodStartInput.value = cur?.period?.start || activeDuelPeriod().start;
      if (periodEndInput) periodEndInput.value = cur?.period?.end || activeDuelPeriod().end;
      renderSetupPlayers(PLAYERS.map((p) => p.name));
      if (deleteBtn) deleteBtn.style.display = "inline-flex";
    }

    // Configura link de convite
    const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(currentSetupChallengeId)}`;
    const previewInput = byId("setup-invite-link-preview");
    if (previewInput) previewInput.value = inviteUrl;

    const btnCopy = byId("btn-copy-invite-link");
    if (btnCopy) {
      btnCopy.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(inviteUrl).then(() => {
            showToast("Link de convite copiado! Envie para o seu rival.");
          }).catch(() => {
            previewInput?.select();
            document.execCommand("copy");
            showToast("Link de convite copiado!");
          });
        } else {
          previewInput?.select();
          document.execCommand("copy");
          showToast("Link de convite copiado!");
        }
      };
    }

    const btnShare = byId("btn-share-invite-link");
    if (btnShare) {
      btnShare.onclick = async () => {
        const title = challengeTitleInput?.value || "Duelo Rep Club";
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Convite para Duelo: ${title}`,
              text: `Vem pro duelo "${title}" no Rep Club! Clique no link para entrar na disputa:`,
              url: inviteUrl
            });
          } catch (e) {}
        } else {
          btnCopy?.click();
        }
      };
    }

    showModalSafely(byId("setup-dialog"));

    // Carrega atletas registrados em segundo plano
    loadRegisteredUsersDirectory().then(() => {
      const names = getSetupPlayerNames();
      if (names.length >= 2) renderSetupPlayers(names);
    }).catch(() => {});
  } catch (err) {
    console.error("Erro ao abrir setup dialog:", err);
    showModalSafely(byId("setup-dialog"));
  }
}

byId("open-setup-btn")?.addEventListener("click", () => {
  const cur = getActiveChallenge();
  if (!cur || activeChallengeId === "none") {
    openSetupDialog("create");
  } else {
    openSetupDialog("edit");
  }
});
byId("btn-new-challenge")?.addEventListener("click", () => openSetupDialog("create"));
byId("btn-topbar-new-challenge")?.addEventListener("click", () => openSetupDialog("create"));
byId("btn-empty-new-challenge")?.addEventListener("click", () => openSetupDialog("create"));
byId("challenge-select")?.addEventListener("change", (event) => {
  switchChallenge(event.target.value);
});
byId("challenge-select")?.addEventListener("click", () => {
  if (!getAuthUser()) {
    openAuthDialog("Faça login para acessar seus duelos.");
  }
});

byId("close-setup-dialog")?.addEventListener("click", () => closeModalSafely(byId("setup-dialog")));
byId("cancel-setup-dialog")?.addEventListener("click", () => closeModalSafely(byId("setup-dialog")));

byId("btn-style-classic")?.addEventListener("click", () => setScoreboardStyle("classic"));
byId("btn-style-kamehameha")?.addEventListener("click", () => setScoreboardStyle("kamehameha"));
byId("arcade-scenario-select")?.addEventListener("change", (e) => {
  currentArcadeScenario = e.target.value;
  localStorage.setItem("rep-club-arcade-scenario", currentArcadeScenario);
  renderScoreboard();
  showToast(`Cenário arcade: ${ARCADE_SCENARIOS[currentArcadeScenario]?.name || currentArcadeScenario}`);
});

byId("setup-dialog")?.addEventListener("cancel", (event) => {
  if (!playerConfig && challenges.length > 0) event.preventDefault();
});

byId("delete-challenge-btn")?.addEventListener("click", () => {
  const cur = getActiveChallenge();
  if (!cur) return;
  if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o desafio "${cur.title}"?\n\nTodos os treinos registrados neste desafio serão removidos.`)) {
    return;
  }
  removeChallengeFromFirebase(cur.id);
  try {
    fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/duel.json", { method: "DELETE" });
  } catch (e) {}

  state.workouts = state.workouts.filter((w) => (w.challengeId || "challenge-1") !== cur.id);
  challenges = challenges.filter((c) => c.id !== cur.id);

  const userChallenges = getUserChallenges();
  if (userChallenges.length > 0) {
    activeChallengeId = userChallenges[0].id;
  } else {
    activeChallengeId = "none";
  }

  saveChallenges();
  syncActiveChallengeGlobals();
  saveState();
  byId("setup-dialog").close();
  renderChallengeSelector();
  render();
  showToast(`Desafio "${cur.title}" excluído com sucesso.`);
});

function handleResetChallenge() {
  const cur = getActiveChallenge();
  const curWorkouts = currentChallengeWorkouts();
  const confirmMsg = curWorkouts.length > 0
    ? `Deseja realmente ZERAR todos os treinos do desafio atual ("${cur.title}")?\n\n${curWorkouts.length} treino(s) registrados serão apagados e o placar voltará ao início.\nOs participantes e as datas serão mantidos.`
    : `O desafio "${cur.title}" não possui treinos registrados no momento. Deseja redefinir o placar?`;

  if (!window.confirm(confirmMsg)) return;

  state.workouts = state.workouts.filter((w) => (w.challengeId || "challenge-1") !== cur.id);
  saveState();
  resetDuelInFirebase();
  render();
  showToast(`Desafio "${cur.title}" foi zerado com sucesso!`);
}

byId("reset-current-challenge")?.addEventListener("click", handleResetChallenge);
byId("btn-reset-topbar")?.addEventListener("click", handleResetChallenge);

byId("activity-list")?.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest("[data-delete-workout]");
  if (!deleteBtn) return;
  const workoutId = deleteBtn.dataset.deleteWorkout;
  const workout = state.workouts.find((w) => String(w.id) === String(workoutId));
  if (!workout) return;
  const cur = getActiveChallenge();
  const owner = resolvePlayerForWorkout(workout, cur) || playerFor(workout.owner);
  const workoutDesc = `${workout.name} (${formatShortDate(workout.date)}) de ${owner ? owner.name : "participante"}`;
  if (!window.confirm(`Tem certeza que deseja excluir o seguinte registro de treino?\n\n${workoutDesc}\n(+${pointsForWorkout(workout)} pontos)`)) {
    return;
  }
  state.workouts = state.workouts.filter((w) => String(w.id) !== String(workoutId));
  saveState();
  deleteWorkoutFromFirebase(workoutId);
  render();
  showToast("Treino excluído com sucesso.");
});

byId("setup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const challengeTitle = String(form.get("challengeTitle") || "").trim() || "Duelo";
  const names = getSetupPlayerNames();
  const periodStart = String(form.get("periodStart") || "");
  const periodEnd = String(form.get("periodEnd") || "");
  const prize = String(form.get("prize") || "").trim();
  const error = byId("setup-error");

  if (names.length < 2) {
    error.textContent = "Cadastre pelo menos 2 participantes com nome para continuar.";
    return;
  }
  const normalized = names.map((n) => n.toLocaleLowerCase("pt-BR"));
  const hasDuplicates = new Set(normalized).size !== names.length;
  if (hasDuplicates) {
    error.textContent = "Todos os nomes dos participantes precisam ser diferentes.";
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodStart) || !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd) || periodStart > periodEnd) {
    error.textContent = "Informe um período válido: a data de início precisa ser anterior ou igual à data final.";
    return;
  }

  const curForEdit = setupMode === "edit" ? getActiveChallenge() : null;
  const existingPlayers = curForEdit?.players || [];
  const configuredPlayers = names.map((name, index) => {
    const palette = PLAYER_PALETTE[index % PLAYER_PALETTE.length];
    const prev = existingPlayers.find((p) => p && p.name && p.name.trim().toLowerCase() === name.trim().toLowerCase()) || existingPlayers[index];
    const playerId = prev?.id || `player-${index + 1}`;
    return {
      id: playerId,
      name,
      short: name.charAt(0).toUpperCase(),
      side: index === 0 ? "me" : index === 1 ? "rival" : `other-${index + 1}`,
      color: prev?.color || palette.color,
      textColor: prev?.textColor || palette.text,
      email: prev?.email || "",
      uid: prev?.uid || "",
    };
  });

  const authUser = getAuthUser();
  if (setupMode === "create") {
    const newId = currentSetupChallengeId || `challenge-${Date.now()}`;
    let creatorId = authUser?.id || authUser?.uid || null;
    let creatorEmail = authUser?.email || null;
    if (!authUser) {
      const p1 = configuredPlayers[0];
      setAuthUser({
        id: p1.id,
        name: p1.name,
        email: ""
      });
      creatorId = p1.id;
    }

    const newChallenge = {
      id: newId,
      title: challengeTitle,
      prize,
      period: { start: periodStart, end: periodEnd },
      players: configuredPlayers,
      activePlayer: configuredPlayers[0].id,
      createdBy: creatorId,
      creatorEmail: creatorEmail,
      createdAt: new Date().toISOString(),
    };
    challenges.push(newChallenge);
    activeChallengeId = newId;
    saveChallenges();
    syncActiveChallengeGlobals();
    saveState();
    syncChallengeToFirebase(newChallenge);
    render();
    closeModalSafely(byId("setup-dialog"));
    showToast(`Novo desafio "${challengeTitle}" criado com sucesso!`);
  } else {
    const cur = getActiveChallenge();
    cur.title = challengeTitle;
    cur.prize = prize;
    cur.period = { start: periodStart, end: periodEnd };
    cur.players = configuredPlayers;
    if (authUser && !cur.createdBy) {
      cur.createdBy = authUser.id || authUser.uid;
      cur.creatorEmail = authUser.email;
    }
    if (!configuredPlayers.some((p) => p.id === cur.activePlayer)) {
      cur.activePlayer = configuredPlayers[0].id;
    }
    saveChallenges();
    syncActiveChallengeGlobals();
    saveState();
    syncDuelToFirebase(cur);
    syncChallengeToFirebase(cur);
    render();
    closeModalSafely(byId("setup-dialog"));
    showToast(`Desafio "${challengeTitle}" atualizado com sucesso!`);
  }
});

byId("open-workout").addEventListener("click", () => openWorkoutDialog());
byId("close-dialog").addEventListener("click", () => byId("workout-dialog").close());
byId("cancel-dialog").addEventListener("click", () => byId("workout-dialog").close());
byId("workout-category").addEventListener("change", () => renderWorkoutFields());
byId("workout-date").addEventListener("input", updatePointsPreview);
byId("workout-date").addEventListener("change", updatePointsPreview);
byId("workout-fields").addEventListener("input", (event) => {
  if (event.target.id === "effort-input") updateEffortLabel();
  if (event.target.id === "exercise-picker-search") renderExercisePickerResults(event.target.value);
  if (event.target.name === "customPlanTitle" && activeStrengthPlan?.isCustom) activeStrengthPlan.title = event.target.value;
  updatePointsPreview();
});
byId("workout-fields").addEventListener("change", (event) => {
  if (event.target.id === "template-select") renderWorkoutFields(event.target.value);
  else if (event.target.matches("[name^='plannedSets-'], [name^='minReps-'], [name^='maxReps-'], [name^='loadFactor-']")) {
    const formData = new FormData(byId("workout-form"));
    activeStrengthPlan.exercises.forEach((exercise, index) => {
      exercise.sets = Number(formData.get(`plannedSets-${index}`) || exercise.sets);
      exercise.min = Number(formData.get(`minReps-${index}`) || exercise.min);
      exercise.max = Number(formData.get(`maxReps-${index}`) || exercise.max);
      exercise.loadFactor = Number(formData.get(`loadFactor-${index}`) || exercise.loadFactor || 1);
    });
    const plan = cloneTrainingPlan(activeStrengthPlan);
    const values = readExerciseLogs(formData, activeStrengthPlan);
    renderWorkoutFields(activeStrengthPlan.id, plan);
    preserveSetEntries(values);
  }
  else {
    if (event.target.matches(".set-check")) {
      event.target.closest(".set-check-label").classList.toggle("done", event.target.checked);
      if (event.target.checked) startRestTimer(60);
    }
    updatePointsPreview();
  }
});
function handleAddExerciseToCurrentWorkout(inputOrName) {
  let exName = typeof inputOrName === "string" ? inputOrName : inputOrName?.value;
  if (!exName) {
    showToast("Selecione um exercício do catálogo primeiro.");
    return;
  }
  let foundEx = null;
  STANDARD_EXERCISES_CATALOG.forEach((g) => {
    const f = g.exercises.find((e) => e.name === exName);
    if (f) foundEx = f;
  });

  if (exName === "__custom__") {
    const customPrompt = prompt("Digite o nome do exercício personalizado:");
    if (!customPrompt || !customPrompt.trim()) return;
    exName = customPrompt.trim();
  }

  const newExercise = {
    name: exName,
    sets: foundEx?.sets || 3,
    min: foundEx?.min || 8,
    max: foundEx?.max || 12,
    unit: foundEx?.unit || "reps",
    load: foundEx?.load,
    loadFactor: foundEx?.loadFactor || 1,
    requiresLoad: foundEx?.load !== false
  };

  const currentForm = byId("workout-form");
  const priorLogs = activeStrengthPlan && activeStrengthPlan.exercises ? readExerciseLogs(new FormData(currentForm), activeStrengthPlan) : [];
  if (!activeStrengthPlan) {
    activeStrengthPlan = planForId("A");
  }
  if (!Array.isArray(activeStrengthPlan.exercises)) activeStrengthPlan.exercises = [];
  activeStrengthPlan.exercises.push(newExercise);
  renderWorkoutFields(activeStrengthPlan.id, activeStrengthPlan);
  preserveSetEntries(priorLogs);
  showToast(`Exercício "${exName}" adicionado ao treino!`);
}

byId("workout-fields").addEventListener("click", async (event) => {
  const applyBtn = event.target.closest("[data-apply-load]");
  if (applyBtn) {
    event.preventDefault();
    const exIdx = applyBtn.dataset.applyLoad;
    const loadVal = applyBtn.dataset.lastLoad;
    if (exIdx != null && loadVal) {
      const inputs = byId("workout-fields").querySelectorAll(`[name^="load-${exIdx}-"]`);
      inputs.forEach((input) => {
        input.value = loadVal;
        input.style.borderColor = "var(--lime)";
        setTimeout(() => (input.style.borderColor = ""), 800);
      });
      updatePointsPreview();
      showToast(`Cargas preenchidas com ${loadVal} kg`);
    }
    return;
  }
  const addBtn = event.target.closest("#btn-add-exercise-to-workout");
  if (addBtn) {
    const select = byId("workout-add-exercise-select");
    handleAddExerciseToCurrentWorkout(select);
    return;
  }
  const replaceButton = event.target.closest("[data-pick-exercise]");
  if (replaceButton) {
    const customPrompt = prompt("Digite o novo nome para este exercício:");
    if (customPrompt && customPrompt.trim()) {
      const idx = Number(replaceButton.dataset.pickExercise);
      if (activeStrengthPlan?.exercises?.[idx]) {
        activeStrengthPlan.exercises[idx].name = customPrompt.trim();
        const currentForm = byId("workout-form");
        const priorLogs = readExerciseLogs(new FormData(currentForm), activeStrengthPlan);
        renderWorkoutFields(activeStrengthPlan.id, activeStrengthPlan);
        preserveSetEntries(priorLogs);
        showToast(`Exercício renomeado para "${customPrompt.trim()}".`);
      }
    }
  }
});
byId("workout-fields").addEventListener("change", (event) => {
  if (event.target.id === "workout-add-exercise-select" && event.target.value === "__custom__") {
    handleAddExerciseToCurrentWorkout(event.target);
  }
});
byId("history-exercise").addEventListener("change", drawHistoryChart);
window.addEventListener("resize", drawHistoryChart);
document.querySelectorAll("[data-rest-seconds]").forEach((button) => button.addEventListener("click", () => startRestTimer(Number(button.dataset.restSeconds))));
byId("timer-reset").addEventListener("click", resetRestTimer);
byId("timer-sound-toggle")?.addEventListener("click", toggleSound);
updateSoundToggleUI();
byId("program-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-start-template]");
  if (button) openWorkoutDialog(button.dataset.startTemplate);
});

byId("workout-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const workoutForm = event.currentTarget;
  const form = new FormData(workoutForm);
  const category = form.get("category");
  const workoutDate = String(form.get("workoutDate") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workoutDate) || workoutDate > localDate()) {
    byId("form-error").textContent = "Escolha uma data válida, hoje ou anterior.";
    return;
  }

  let workout;
  let customPlanToSave = null;
  if (category === "strength") {
    const plan = activeStrengthPlan || planForId(form.get("templateId") || "A");
    const exercises = readExerciseLogs(form, plan);
    const cardioBlockMinutes = Number(form.get("cardioMinutes") || 0);
    const completedSets = exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
    const cardioBlockInvalid = plan.cardioBlock && (!Number.isInteger(cardioBlockMinutes) || cardioBlockMinutes < plan.cardioBlock.min || cardioBlockMinutes > plan.cardioBlock.max);
    if (cardioBlockInvalid) {
      byId("form-error").textContent = `Informe o cardio entre ${plan.cardioBlock.min} e ${plan.cardioBlock.max} minutos.`;
      return;
    }
    if (completedSets < 1 || exercises.some((exercise) => exercise.sets.some((set) => set.done && (set.reps < 1 || set.reps > exercise.maxReps || (exercise.requiresLoad && set.load < 0.5))))) {
      byId("form-error").textContent = "Registre séries, reps e cargas dentro dos limites da ficha.";
      return;
    }
    const effort = Number(form.get("effort"));
    const isCustomPlan = plan.id === "custom-new" || plan.id.startsWith("custom-");
    const customTitle = String(form.get("customPlanTitle") || plan.title).trim() || "Treino personalizado";
    const finalPlanId = plan.id === "custom-new" ? `custom-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}` : plan.id;
    const previous = previousStrengthWorkout(state.activePlayer, finalPlanId, workoutDate);
    const quality = strengthQuality(exercises, effort, previous);
    const volume = exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
    if (isCustomPlan) {
      customPlanToSave = {
        id: finalPlanId,
        day: "PERSONALIZADO",
        title: customTitle,
        isCustom: true,
        cardioBlock: plan.cardioBlock || undefined,
        exercises: exercises.map((exercise) => ({
          name: exercise.name,
          catalogId: exercise.catalogId,
          imagePath: exercise.imagePath,
          equipment: exercise.equipment,
          sets: exercise.plannedSets,
          min: exercise.minReps,
          max: exercise.maxReps,
          unit: exercise.unit,
          note: exercise.note,
          load: exercise.requiresLoad ? undefined : false,
          loadFactor: exercise.loadFactor,
        })),
      };
    }
    workout = {
      category,
      templateId: finalPlanId,
      name: isCustomPlan ? customTitle : `Treino ${plan.id} · ${plan.title}`,
      exercises,
      effort,
      cardioBlockMinutes,
      basePoints: MODALITIES.strength.basePoints,
      trainingVolume: volume,
      duration: cardioBlockMinutes,
      qualityPoints: quality.total,
      executionPoints: quality.executionPoints,
      effortPoints: quality.effortPoints,
      progressionPoints: quality.progressionPoints,
    };
  } else {
    const duration = Number(form.get("duration"));
    const effort = Number(form.get("effort"));
    if (!Number.isInteger(duration) || duration < 10 || duration > 240 || effort < 1 || effort > 10) {
      byId("form-error").textContent = "Informe duração entre 10 e 240 minutos e avaliação de esforço entre 1 e 10.";
      return;
    }
    const quality = modalityQuality(category, duration, effort);
    workout = {
      category,
      name: MODALITIES[category].label,
      duration,
      effort,
      basePoints: MODALITIES[category].basePoints,
      qualityPoints: quality.total,
      durationPoints: quality.durationPoints,
      effortPoints: quality.effortPoints,
    };
  }

  const customName = String(form.get("workoutName") || "").trim();
  if (customName) workout.name = customName;
  const comments = String(form.get("comments") || "").trim();
  if (comments) workout.comments = comments;
  if (currentWorkoutPhoto) workout.photo = currentWorkoutPhoto;
  workout.date = workoutDate;

  const authUser = getAuthUser();
  const cur = getActiveChallenge();
  const currentAthlete = (cur && authUser ? getPlayerInChallenge(cur, authUser) : null) || getActiveUserPlayer() || playerFor(state.activePlayer) || PLAYERS[0];
  workout.userId = authUser?.id || authUser?.uid || "";
  workout.userEmail = authUser?.email || "";
  workout.userName = authUser?.name || currentAthlete.name || "";
  workout.owner = currentAthlete.id;
  workout.points = workout.basePoints + workout.qualityPoints;

  pendingWorkoutToSave = workout;
  pendingCustomPlanToSave = customPlanToSave;

  openSelectChallengesDialog();
});

let pendingWorkoutToSave = null;
let pendingCustomPlanToSave = null;

function openSelectChallengesDialog() {
  const dialog = byId("select-challenges-dialog");
  const listEl = byId("select-challenges-list");
  const errorEl = byId("select-challenges-error");
  if (!dialog || !listEl) return;
  if (errorEl) errorEl.textContent = "";

  const user = getAuthUser();
  // Inclui todos os desafios existentes no aparelho/banco
  let available = Array.isArray(challenges) && challenges.length > 0 ? [...challenges] : [];
  const userChs = getUserChallenges();
  userChs.forEach((uc) => {
    if (!available.some((c) => c.id === uc.id)) available.push(uc);
  });
  const cur = getActiveChallenge();
  if (cur && !available.some((c) => c.id === cur.id)) {
    available.unshift(cur);
  }
  if (available.length === 0) {
    available = [{ id: "challenge-1", title: "Duelo 01", period: defaultDuelPeriod(), players: DEFAULT_PLAYERS }];
  }

  // Desduplica desafios por ID
  const seenIds = new Set();
  available = available.filter((ch) => {
    if (!ch || !ch.id || seenIds.has(ch.id)) return false;
    seenIds.add(ch.id);
    return true;
  });

  const curActive = getActiveChallenge()?.id || activeChallengeId;

  listEl.innerHTML = available.map((ch) => {
    const isCurrent = ch.id === curActive;
    const playersNames = Array.isArray(ch.players) ? ch.players.map((p) => p?.name || p).join(" vs ") : "";
    let periodText = "";
    try {
      if (ch.period?.start && ch.period?.end) {
        periodText = `${formatPeriodDate(ch.period.start)} a ${formatPeriodDate(ch.period.end)}`;
      }
    } catch (e) {}

    const myPlayerInCh = getPlayerInChallenge(ch, user);
    const ownerId = myPlayerInCh?.id || state.activePlayer;
    const countToday = state.workouts.filter(
      (w) => (w.challengeId || "challenge-1") === ch.id && resolvePlayerForWorkout(w, ch)?.id === ownerId && w.date === pendingWorkoutToSave?.date
    ).length;

    const isChecked = isCurrent || available.length === 1;

    return `
      <label class="challenge-option-card ${isChecked ? "selected" : ""}" style="display:flex; align-items:center; gap:12px; padding:12px 14px; background:#fff; border:1.5px solid #dcdfd5; border-radius:6px; cursor:pointer;">
        <input type="checkbox" class="challenge-target-checkbox" value="${escapeHTML(ch.id)}" ${isChecked ? "checked" : ""} style="width:18px; height:18px; accent-color:var(--lime); cursor:pointer;" />
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
            <strong style="font-size:13px; color:var(--ink); font-weight:700;">${escapeHTML(ch.title || "Duelo")}</strong>
            <div style="display:flex; align-items:center; gap:4px;">
              ${isCurrent ? '<span style="font-size:9px; font-weight:800; background:var(--lime); color:var(--ink); padding:2px 5px; border-radius:3px;">ATIVO</span>' : ""}
              ${countToday > 0 ? `<span style="font-size:9px; font-weight:700; background:#f0fdf4; color:#166534; padding:2px 5px; border-radius:3px;">+${countToday} HOJE</span>` : ""}
            </div>
          </div>
          <div style="font-size:11px; color:#6b7280; margin-top:3px; display:flex; gap:8px; flex-wrap:wrap;">
            ${playersNames ? `<span>👥 ${escapeHTML(playersNames)}</span>` : ""}
            ${periodText ? `<span>📅 ${escapeHTML(periodText)}</span>` : ""}
          </div>
        </div>
      </label>
    `;
  }).join("");

  listEl.querySelectorAll(".challenge-target-checkbox").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.target.closest(".challenge-option-card")?.classList.toggle("selected", e.target.checked);
    });
  });

  const toggleBtn = byId("btn-toggle-all-challenges");
  if (toggleBtn) {
    toggleBtn.textContent = "Marcar todos";
    toggleBtn.onclick = () => {
      const boxes = listEl.querySelectorAll(".challenge-target-checkbox");
      const anyUnchecked = Array.from(boxes).some((b) => !b.checked);
      boxes.forEach((b) => {
        b.checked = anyUnchecked;
        b.closest(".challenge-option-card")?.classList.toggle("selected", anyUnchecked);
      });
      toggleBtn.textContent = anyUnchecked ? "Desmarcar todos" : "Marcar todos";
    };
  }

  // Fecha o workout-dialog para não conflitar e abre o modal de desafios
  closeModalSafely(byId("workout-dialog"));
  showModalSafely(dialog);
}

byId("cancel-select-challenges")?.addEventListener("click", () => {
  closeModalSafely(byId("select-challenges-dialog"));
  showModalSafely(byId("workout-dialog"));
});
byId("close-select-challenges-dialog")?.addEventListener("click", () => {
  closeModalSafely(byId("select-challenges-dialog"));
  showModalSafely(byId("workout-dialog"));
});

byId("confirm-select-challenges")?.addEventListener("click", async () => {
  if (!pendingWorkoutToSave) return;
  const errorEl = byId("select-challenges-error");
  const checkedBoxes = Array.from(document.querySelectorAll(".challenge-target-checkbox:checked"));
  const selectedIds = checkedBoxes.map((cb) => cb.value);

  if (selectedIds.length === 0) {
    if (errorEl) errorEl.textContent = "Selecione pelo menos um desafio para adicionar o treino.";
    return;
  }

  const btnConfirm = byId("confirm-select-challenges");
  if (btnConfirm) {
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Salvando...";
  }

  const user = getAuthUser();
  const cur = getActiveChallenge();
  const curActiveId = cur?.id || activeChallengeId;
  const curAthlete = playerFor(state.activePlayer);
  const syncPromises = [];
  const addedCount = selectedIds.length;
  const savedPoints = Number(pendingWorkoutToSave.points) || 10;

  for (const targetId of selectedIds) {
    const targetChallenge = challenges.find((c) => c.id === targetId) || (cur && cur.id === targetId ? cur : null);
    
    // Resolve o atleta deste usuário especificamente neste desafio de destino
    let playerInTarget = getPlayerInChallenge(targetChallenge, user);
    if (!playerInTarget && targetChallenge?.players) {
      playerInTarget = targetChallenge.players.find((p) => p && user?.name && p.name && p.name.trim().toLowerCase() === user.name.trim().toLowerCase());
    }
    const ownerId = playerInTarget ? playerInTarget.id : (targetChallenge?.id === curActiveId ? state.activePlayer : (targetChallenge?.players?.[0]?.id || "player-1"));

    const workoutInstance = {
      ...pendingWorkoutToSave,
      id: crypto.randomUUID ? crypto.randomUUID() : `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      challengeId: targetChallenge?.id || targetId,
      owner: ownerId,
      userId: user?.id || user?.uid || pendingWorkoutToSave.userId || "",
      userEmail: user?.email || pendingWorkoutToSave.userEmail || "",
      userName: user?.name || pendingWorkoutToSave.userName || playerInTarget?.name || "",
      createdAt: new Date().toISOString(),
    };

    state.workouts.push(workoutInstance);
    syncPromises.push(syncWorkoutToFirebase(workoutInstance));
  }

  if (pendingCustomPlanToSave) {
    const customIndex = customTrainingPlans.findIndex((plan) => plan.id === pendingCustomPlanToSave.id);
    if (customIndex >= 0) customTrainingPlans[customIndex] = pendingCustomPlanToSave;
    else customTrainingPlans.push(pendingCustomPlanToSave);
    localStorage.setItem(CUSTOM_PLANS_KEY, JSON.stringify(customTrainingPlans));
    activeStrengthPlan = cloneTrainingPlan(pendingCustomPlanToSave);
  }

  saveState();
  clearWorkoutPhoto();

  closeModalSafely(byId("select-challenges-dialog"));
  closeModalSafely(byId("workout-dialog"));
  byId("workout-form")?.reset();

  if (pendingCustomPlanToSave && byId("template-select")) {
    byId("template-select").value = pendingCustomPlanToSave.id;
  }

  render();
  showToast(`Treino registrado em ${addedCount} desafio(s)! (+${savedPoints} pts)`);
  checkNewBadgesAfterWorkout(state.activePlayer);

  pendingWorkoutToSave = null;
  pendingCustomPlanToSave = null;
  if (btnConfirm) {
    btnConfirm.disabled = false;
    btnConfirm.innerHTML = 'Confirmar e Salvar <span>↗</span>';
  }

  try {
    await Promise.allSettled(syncPromises);
  } catch (e) {
    console.warn("Falha de rede ao sincronizar multi-treinos no Firebase:", e);
  }
});

byId("reset-demo").addEventListener("click", () => {
  if (!window.confirm("Apagar os registros locais e restaurar os dados da demonstração?")) return;
  state = createDemoState();
  if (!challenges.some((c) => c.id === "challenge-1")) {
    challenges.unshift({
      id: "challenge-1",
      title: "Duelo 01",
      prize: "",
      period: defaultDuelPeriod(),
      players: DEFAULT_PLAYERS,
      activePlayer: DEFAULT_PLAYERS[0].id,
      createdAt: new Date().toISOString(),
    });
  }
  activeChallengeId = "challenge-1";
  saveChallenges();
  syncActiveChallengeGlobals();
  state.activePlayer = PLAYERS[0].id;
  saveState();
  render();
  showToast("Demonstração reiniciada.");
});

render();
saveState();
hydrateFromFirebase();

// SINCRONIZAÇÃO EM TEMPO REAL E MULTI-DISPOSITIVOS VIA GOOGLE FIREBASE
function setupFirebaseSync() {
  if (fbDb) {
    try {
      fbDb.ref("rep-club/workouts").on("value", (snapshot) => {
        const val = snapshot.val();
        if (!val || typeof val !== "object" || val.error) return;
        const remoteWorkoutsList = Object.values(val).filter((w) => w && typeof w === "object" && w.id && !w.error);
        if (remoteWorkoutsList.length === 0) return;
        const pendingLocal = state.workouts.filter((lw) => !remoteWorkoutsList.some((rw) => rw.id === lw.id));
        const syncedRemote = remoteWorkoutsList.map((workout) => ({
          id: workout.id,
          challengeId: workout.challenge_id || workout.challengeId || workout.duel_id || activeChallengeId || "challenge-1",
          owner: workout.player_id || workout.owner,
          userId: workout.user_id || workout.userId || "",
          userEmail: workout.user_email || workout.userEmail || "",
          userName: workout.user_name || workout.userName || "",
          category: workout.category,
          date: workout.workout_date || workout.date,
          name: workout.name || MODALITIES[workout.category]?.label || workout.category,
          comments: workout.comments || "",
          photo: workout.photo || null,
          points: workout.points || 0,
          effort: workout.effort,
          duration: workout.duration || 0,
          exercises: workout.exercises,
          qualityPoints: Math.max(0, (workout.points || 0) - (MODALITIES[workout.category]?.basePoints || 0)),
          createdAt: workout.created_at || workout.createdAt || new Date().toISOString(),
        }));
        healWorkouts(syncedRemote);
        checkForRivalNewWorkouts(syncedRemote);
        state.workouts = [...pendingLocal, ...syncedRemote];
        healWorkouts(state.workouts);
        saveState();
        render();
        const ind = byId("sync-status-indicator");
        if (ind) {
          ind.textContent = "● Google Firebase Ao Vivo";
          ind.style.color = "var(--lime)";
        }
      }, (err) => {
        console.warn("Firebase workouts listener erro:", err);
      });

      fbDb.ref("rep-club/training-programs").on("value", (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const remoteList = Object.values(val);
          remoteList.forEach((rp) => {
            const idx = trainingPrograms.findIndex((p) => p.id === rp.id);
            if (idx >= 0) trainingPrograms[idx] = rp;
            else trainingPrograms.push(rp);
          });
          saveTrainingPrograms();
          renderProgramSelector();
          renderTrainingPlan();
        }
      });


      fbDb.ref("rep-club/challenges").on("value", (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const remoteList = Object.values(val);
          let changed = false;
          remoteList.forEach((rc) => {
            if (!rc || !rc.id) return;
            const idx = challenges.findIndex((c) => c.id === rc.id);
            if (idx >= 0) {
              challenges[idx] = rc;
            } else {
              challenges.push(rc);
            }
            changed = true;
          });
          if (changed) {
            saveChallenges();
            renderChallengeSelector();
            render();
          }
        }
      });
    } catch (e) {
      console.warn("Erro ao configurar listeners Firebase:", e);
    }
  }

  // Backup polling a cada 15s para garantir consistência total
  setInterval(() => {
    if (!document.hidden) {
      hydrateFromFirebase();
    }
  }, 15000);

  // Sincroniza ao focar ou alternar de volta ao app no celular
  window.addEventListener("focus", () => hydrateFromFirebase());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) hydrateFromFirebase();
  });
}
setupFirebaseSync();
initNotificationControls();
loadRegisteredUsersDirectory();
checkInviteLinkParam();

// PWA: SERVICE WORKER & INSTALAÇÃO NO CELULAR
let deferredPwaPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const pwaBtn = byId("btn-pwa-install");
  if (pwaBtn) {
    pwaBtn.style.display = "block";
  }
});

byId("btn-pwa-install")?.addEventListener("click", async () => {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    const { outcome } = await deferredPwaPrompt.userChoice;
    console.log("PWA install outcome:", outcome);
    deferredPwaPrompt = null;
    byId("btn-pwa-install").style.display = "none";
  } else {
    alert("📱 Para instalar o aplicativo no seu celular:\n\n• No Android (Chrome): Toque no menu (3 pontinhos no topo) e escolha 'Instalar aplicativo' ou 'Adicionar à tela inicial'.\n\n• No iPhone (Safari): Toque no botão de Compartilhar (quadrado com seta apontando para cima) e selecione 'Adicionar à Tela de Início'.");
  }
});

if ("serviceWorker" in navigator) {
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!isRefreshing) {
      isRefreshing = true;
      console.log("Novo ServiceWorker ativado: recarregando para aplicar versão mais recente.");
      window.location.reload();
    }
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js?v=2.8.2").then((reg) => {
      reg.update();
    }).catch((err) => {
      console.warn("Falha no registro do ServiceWorker PWA:", err);
    });
  });
}

// MODAL QR CODE PARA CELULAR
byId("btn-show-qr")?.addEventListener("click", () => {
  byId("qr-dialog")?.showModal();
});
byId("close-qr-dialog")?.addEventListener("click", () => {
  byId("qr-dialog")?.close();
});

// LISTENERS DE AUTENTICAÇÃO E PERFIL

byId("btn-auth-open")?.addEventListener("click", () => openAuthDialog());
byId("close-auth-dialog")?.addEventListener("click", () => byId("auth-dialog")?.close());
byId("btn-auth-logout")?.addEventListener("click", () => clearAuthProfile());

byId("saved-accounts-list")?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-remove-saved]");
  if (removeBtn) {
    e.stopPropagation();
    removeSavedAccount(removeBtn.dataset.removeSaved);
    return;
  }
  const loginBtn = e.target.closest("[data-login-saved]");
  if (loginBtn) {
    const key = String(loginBtn.dataset.loginSaved).toLowerCase();
    const acc = getSavedAccounts().find((a) => String(a.email || a.id).toLowerCase() === key);
    if (acc) {
      setAuthUser(acc);
    }
  }
});

// LOGIN COM E-MAIL E SENHA
byId("auth-email-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = byId("auth-error");
  if (errorEl) errorEl.textContent = "";
  const emailInput = byId("auth-email-input");
  const passInput = byId("auth-password-input");
  const email = (emailInput?.value || "").trim();
  const password = passInput?.value || "";

  if (!email || !password) return;

  const btn = byId("btn-email-signin");
  const oldText = btn ? btn.innerHTML : "Entrar";
  if (btn) { btn.disabled = true; btn.textContent = "Entrando..."; }

  try {
    if (fbAuth) {
      const cred = await fbAuth.signInWithEmailAndPassword(email, password);
      const fbUser = cred.user;
      setAuthUser({
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fbUser.displayName || email.split("@")[0],
        email: fbUser.email || email
      });
    } else {
      setAuthUser({
        id: email.split("@")[0].toLowerCase(),
        name: email.split("@")[0],
        email
      });
    }
  } catch (err) {
    console.warn("Sign-in error:", err);
    let msg = "Falha ao entrar com e-mail e senha.";
    if (err.code === "auth/user-not-found") {
      msg = "Usuário não encontrado. Se ainda não possui conta, clique no botão 'Criar Conta'.";
    } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      msg = "Senha incorreta ou credenciais inválidas.";
    } else if (err.code === "auth/operation-not-allowed") {
      msg = "Provedor de E-mail/Senha ainda não habilitado no Firebase Console. Conectando em modo local...";
      setAuthUser({
        id: email.split("@")[0].toLowerCase(),
        name: email.split("@")[0],
        email
      });
      return;
    } else if (err.message) {
      msg = err.message;
    }
    if (errorEl) errorEl.textContent = msg;
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = oldText; }
  }
});

// CRIAÇÃO DE CONTA COM E-MAIL E SENHA
byId("btn-email-signup")?.addEventListener("click", async () => {
  const errorEl = byId("auth-error");
  if (errorEl) errorEl.textContent = "";
  const emailInput = byId("auth-email-input");
  const passInput = byId("auth-password-input");
  const email = (emailInput?.value || "").trim();
  const password = passInput?.value || "";

  if (!email || !password) {
    if (errorEl) errorEl.textContent = "Preencha e-mail e senha (mínimo 6 caracteres) para criar sua conta.";
    return;
  }
  if (password.length < 6) {
    if (errorEl) errorEl.textContent = "A senha deve conter no mínimo 6 caracteres.";
    return;
  }

  const btn = byId("btn-email-signup");
  const oldText = btn ? btn.textContent : "Criar Conta";
  if (btn) { btn.disabled = true; btn.textContent = "Criando..."; }

  try {
    if (fbAuth) {
      const cred = await fbAuth.createUserWithEmailAndPassword(email, password);
      const fbUser = cred.user;
      setAuthUser({
        id: fbUser.uid,
        uid: fbUser.uid,
        name: email.split("@")[0],
        email: fbUser.email || email
      });
    } else {
      setAuthUser({
        id: email.split("@")[0].toLowerCase(),
        name: email.split("@")[0],
        email
      });
    }
  } catch (err) {
    console.warn("Sign-up error:", err);
    let msg = "Falha ao criar conta.";
    if (err.code === "auth/email-already-in-use") {
      msg = "Este e-mail já está em uso. Tente clicar em 'Entrar'.";
    } else if (err.code === "auth/operation-not-allowed") {
      msg = "Provedor de E-mail/Senha ainda não habilitado no Firebase Console. Conectando em modo local...";
      setAuthUser({
        id: email.split("@")[0].toLowerCase(),
        name: email.split("@")[0],
        email
      });
      return;
    } else if (err.message) {
      msg = err.message;
    }
    if (errorEl) errorEl.textContent = msg;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = oldText; }
  }
});

// LOGIN COM GOOGLE
byId("btn-google-login")?.addEventListener("click", async () => {
  const errorEl = byId("auth-error");
  if (errorEl) errorEl.textContent = "";

  if (!fbAuth) {
    if (errorEl) errorEl.textContent = "Firebase Auth indisponível. Vincule seu perfil diretamente abaixo.";
    return;
  }

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await fbAuth.signInWithPopup(provider);
    const user = result.user;
    const email = user.email || "";
    const name = user.displayName || email.split("@")[0] || "Atleta";

    setAuthUser({
      id: user.uid,
      uid: user.uid,
      name,
      email
    });
  } catch (err) {
    console.warn("Google Auth error:", err);
    if (err.code === "auth/configuration-not-found" || err.code === "auth/operation-not-allowed") {
      if (errorEl) errorEl.textContent = "Provedor Google ainda não ativado no Firebase Console. Você pode usar e-mail/senha ou clicar no seu perfil abaixo!";
    } else if (err.code === "auth/unauthorized-domain") {
      if (errorEl) {
        errorEl.innerHTML = `<strong>Domínio não autorizado no Google Auth:</strong> adicione <code>matheushscastro-ai.github.io</code> em Firebase Console > Authentication > Configurações > Domínios autorizados.<br><br>👉 <strong>Ou mais simples:</strong> use E-mail e Senha acima ou clique no seu nome abaixo!`;
      }
    } else {
      if (errorEl) errorEl.textContent = err.message || "Não foi possível autenticar com o Google. Escolha seu perfil abaixo.";
    }
  }
});

renderAuthUI();

// SE USUÁRIO AINDA NÃO FEZ LOGIN, ABRE O MODAL NA INICIALIZAÇÃO
window.addEventListener("DOMContentLoaded", () => {
  if (!getAuthUser()) {
    setTimeout(() => {
      if (!getAuthUser()) {
        openAuthDialog("Identifique-se para acessar seus duelos e registrar seus treinos.");
      }
    }, 450);
  }
});

// PROGRAMAS DE TREINO - SINCRONIZAÇÃO FIREBASE E BUILDER
async function syncProgramToFirebase(program) {
  if (fbDb) {
    try {
      await fbDb.ref(`rep-club/training-programs/${program.id}`).set(program);
      return;
    } catch (e) {
      console.warn("Falha Firebase SDK programas:", e);
    }
  }
  try {
    await fetch(`https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/training-programs/${program.id}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(program)
    });
  } catch (e) {
    console.warn("Falha REST programas:", e);
  }
}

async function hydrateProgramsFromFirebase() {
  try {
    let programsData = null;
    if (fbDb) {
      try {
        const snap = await fbDb.ref("rep-club/training-programs").get();
        programsData = snap.val();
      } catch (e) { }
    }
    if (!programsData) {
      const resp = await fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/training-programs.json");
      if (resp.ok) programsData = await resp.json();
    }
    if (programsData) {
      const remotePrograms = Object.values(programsData);
      remotePrograms.forEach((rp) => {
        const idx = trainingPrograms.findIndex((p) => p.id === rp.id);
        if (idx >= 0) trainingPrograms[idx] = rp;
        else trainingPrograms.push(rp);
      });
      saveTrainingPrograms();
      renderProgramSelector();
      renderTrainingPlan();
    }
  } catch (e) {
    console.warn("Erro ao buscar programas do Firebase:", e);
  }
}
syncProgramToFirebase(PREGNANCY_PROGRAM);

byId("program-select")?.addEventListener("change", (e) => {
  activeProgramId = e.target.value;
  saveTrainingPrograms();
  renderProgramSelector();
  renderTrainingPlan();
  showToast(`Programa "${getActiveProgram().name}" selecionado.`);
});

function openProgramBuilder() {
  const nameInput = byId("builder-program-name");
  const structSelect = byId("builder-structure-select");
  if (nameInput) nameInput.value = "";
  if (structSelect) structSelect.value = "ABC";
  renderBuilderSessions("ABC");
  byId("program-builder-dialog")?.showModal();
}

function addExerciseRowToBuilderSession(card, exName) {
  if (!card || !exName) return;
  let found = null;
  STANDARD_EXERCISES_CATALOG.forEach((g) => {
    const f = g.exercises.find((ex) => ex.name === exName);
    if (f) found = f;
  });
  const list = card.querySelector(".builder-exercises-list");
  if (!list) return;

  const newRow = document.createElement("div");
  newRow.className = "builder-exercise-row";
  newRow.style.cssText = "display:grid; grid-template-columns: 1fr 60px 60px 60px 24px; gap:6px; align-items:center;";
  newRow.innerHTML = `
    <input type="text" list="builder-exercise-datalist" class="builder-ex-name" value="${escapeHTML(exName)}" placeholder="Nome do exercício" style="font-size:11px; padding:4px;" required />
    <input type="number" class="builder-ex-sets" value="${found?.sets || 3}" min="1" max="10" title="Séries" placeholder="Séries" style="font-size:11px; padding:4px;" required />
    <input type="number" class="builder-ex-min" value="${found?.min || 8}" min="1" max="50" title="Reps mín" placeholder="Reps mín" style="font-size:11px; padding:4px;" required />
    <input type="number" class="builder-ex-max" value="${found?.max || 12}" min="1" max="50" title="Reps máx" placeholder="Reps máx" style="font-size:11px; padding:4px;" required />
    <button type="button" class="btn-remove-builder-ex" style="border:0; background:transparent; color:#ef4444; font-weight:700; cursor:pointer;" title="Remover">✕</button>
  `;
  list.appendChild(newRow);
  showToast(`"${exName}" adicionado ao Treino ${card.dataset.sessionId}!`);
}

function renderBuilderSessions(structure = "ABC") {
  const letters = structure.split("");
  const container = byId("builder-sessions-container");
  if (!container) return;

  const defaultTitles = {
    A: "Costas e Bíceps",
    B: "Peito e Tríceps",
    C: "Pernas e Ombros",
    D: "Braços e Abdômen",
    E: "Cardio e Mobilidade"
  };

  const allExNames = getAllStandardExerciseNames();
  const datalistHtml = `<datalist id="builder-exercise-datalist">${allExNames.map((n) => `<option value="${escapeHTML(n)}"></option>`).join("")}</datalist>`;

  container.innerHTML = datalistHtml + letters.map((letter) => `
    <div class="builder-session-card" data-session-id="${letter}" style="background:#f4f5ee; border:1px solid #d5d7cd; border-radius:6px; padding:12px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:8px;">
        <strong style="font-size:14px; color:var(--ink); font-family:var(--display); min-width:60px;">Treino ${letter}</strong>
        <input type="text" class="builder-session-title" value="${defaultTitles[letter] || `Foco do Treino ${letter}`}" placeholder="Foco da sessão (ex: Costas e Bíceps)" style="font-size:12px; padding:6px 10px; border:1px solid #ccc; border-radius:4px; flex:1;" required />
      </div>
      <div class="builder-exercises-list" style="display:grid; gap:6px;">
        <div class="builder-exercise-row" style="display:grid; grid-template-columns: 1fr 60px 60px 60px 24px; gap:6px; align-items:center;">
          <input type="text" list="builder-exercise-datalist" class="builder-ex-name" value="${letter === "A" ? "Pulldown na Polia Alta" : letter === "B" ? "Supino Reto com Halteres" : "Agachamento Livre"}" placeholder="Nome" style="font-size:11px; padding:4px;" required />
          <input type="number" class="builder-ex-sets" value="4" min="1" max="10" title="Séries" placeholder="Séries" style="font-size:11px; padding:4px;" required />
          <input type="number" class="builder-ex-min" value="8" min="1" max="50" title="Reps mín" placeholder="Reps mín" style="font-size:11px; padding:4px;" required />
          <input type="number" class="builder-ex-max" value="12" min="1" max="50" title="Reps máx" placeholder="Reps máx" style="font-size:11px; padding:4px;" required />
          <button type="button" class="btn-remove-builder-ex" style="border:0; background:transparent; color:#ef4444; font-weight:700; cursor:pointer;" title="Remover">✕</button>
        </div>
      </div>
      <div class="builder-add-exercise-block" style="margin-top:10px; padding:10px; background:#e9ecde; border:1px solid #d6d9ce; border-radius:6px;">
        <span style="display:block; font-size:10px; font-weight:700; color:#4a4d44; margin-bottom:6px; letter-spacing:0.04em;">ADICIONAR EXERCÍCIO AO TREINO ${letter} (COM FOTOS)</span>
        <div class="exercise-autocomplete-widget builder-autocomplete-widget" data-session-id="${letter}">
          <div class="autocomplete-input-wrap">
            <span class="autocomplete-icon">🔍</span>
            <input type="text" class="autocomplete-input" placeholder="Buscar exercício por nome ou grupo para Treino ${letter}..." autocomplete="off" />
            <button type="button" class="autocomplete-clear-btn" style="display:none;" title="Limpar">✕</button>
          </div>
          <div class="autocomplete-dropdown" style="display:none;">
            <div class="autocomplete-items-list"></div>
            <div class="autocomplete-custom-action">
              <span>✏️ Digitar outro exercício personalizado...</span>
            </div>
          </div>
        </div>
        <div style="margin-top:6px; display:flex; justify-content:flex-end;">
          <button type="button" class="btn-add-builder-ex" style="background:transparent; border:none; color:#5c5f55; font-size:10px; font-weight:600; cursor:pointer; text-decoration:underline;">+ Inserir linha em branco para digitar manualmente</button>
        </div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".builder-session-card").forEach((card) => {
    const widget = card.querySelector(".builder-autocomplete-widget");
    if (widget) {
      initExerciseAutocomplete(widget, (exName) => {
        addExerciseRowToBuilderSession(card, exName);
      });
    }
  });
}

byId("builder-structure-select")?.addEventListener("change", (e) => {
  renderBuilderSessions(e.target.value);
});



byId("builder-sessions-container")?.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remove-builder-ex")) {
    const row = e.target.closest(".builder-exercise-row");
    const list = row?.parentElement;
    if (list && list.children.length > 1) {
      row.remove();
    } else {
      alert("A sessão precisa ter pelo menos um exercício.");
    }
  } else if (e.target.classList.contains("btn-add-builder-ex")) {
    const card = e.target.closest(".builder-session-card");
    const list = card?.querySelector(".builder-exercises-list");
    if (list) {
      const newRow = document.createElement("div");
      newRow.className = "builder-exercise-row";
      newRow.style.cssText = "display:grid; grid-template-columns: 1fr 60px 60px 60px 24px; gap:6px; align-items:center;";
      newRow.innerHTML = `
        <input type="text" list="builder-exercise-datalist" class="builder-ex-name" placeholder="Nome do exercício" style="font-size:11px; padding:4px;" required />
        <input type="number" class="builder-ex-sets" value="3" min="1" max="10" title="Séries" placeholder="Séries" style="font-size:11px; padding:4px;" required />
        <input type="number" class="builder-ex-min" value="10" min="1" max="50" title="Reps mín" placeholder="Reps mín" style="font-size:11px; padding:4px;" required />
        <input type="number" class="builder-ex-max" value="12" min="1" max="50" title="Reps máx" placeholder="Reps máx" style="font-size:11px; padding:4px;" required />
        <button type="button" class="btn-remove-builder-ex" style="border:0; background:transparent; color:#ef4444; font-weight:700; cursor:pointer;" title="Remover">✕</button>
      `;
      list.appendChild(newRow);
      newRow.querySelector(".builder-ex-name")?.focus();
    }
  }
});

byId("btn-open-program-builder")?.addEventListener("click", () => openProgramBuilder());
byId("close-builder-dialog")?.addEventListener("click", () => byId("program-builder-dialog")?.close());
byId("cancel-builder-dialog")?.addEventListener("click", () => byId("program-builder-dialog")?.close());

byId("save-builder-program")?.addEventListener("click", async () => {
  const name = byId("builder-program-name")?.value.trim();
  if (!name) {
    alert("Informe o nome do programa (ex: Hipertrofia Yuri, Auxílio Jiu).");
    return;
  }
  const structure = byId("builder-structure-select")?.value || "ABC";
  const sessionCards = Array.from(document.querySelectorAll(".builder-session-card"));
  const sessions = sessionCards.map((card) => {
    const id = card.dataset.sessionId;
    const title = card.querySelector(".builder-session-title")?.value.trim() || `Treino ${id}`;
    const exRows = Array.from(card.querySelectorAll(".builder-exercise-row"));
    const exercises = exRows.map((row) => ({
      name: row.querySelector(".builder-ex-name")?.value.trim() || "Exercício",
      sets: Number(row.querySelector(".builder-ex-sets")?.value || 4),
      min: Number(row.querySelector(".builder-ex-min")?.value || 8),
      max: Number(row.querySelector(".builder-ex-max")?.value || 12),
      loadFactor: 1
    }));
    return { id, day: id, title, exercises };
  });

  const newProg = {
    id: `program-${Date.now()}`,
    name,
    structure,
    sessions
  };

  trainingPrograms.push(newProg);
  activeProgramId = newProg.id;
  saveTrainingPrograms();
  renderProgramSelector();
  renderTrainingPlan();

  try {
    await syncProgramToFirebase(newProg);
  } catch (e) {
    console.warn("Programa salvo localmente; falha Firebase:", e);
  }

  byId("program-builder-dialog")?.close();
  showToast(`Programa "${name}" cadastrado e sincronizado entre dispositivos!`);
});

// SELECTORS DE PROGRAMA / LETRA NO REGISTRO DE TREINO
byId("workout-plan-program")?.addEventListener("change", (e) => {
  activeProgramId = e.target.value;
  saveTrainingPrograms();
  renderWorkoutFields();
});

byId("workout-plan-session")?.addEventListener("change", (e) => {
  renderWorkoutFields(e.target.value);
});

// ANEXO DE FOTO NO REGISTRO DE TREINO (CÂMERA E GALERIA)
let currentWorkoutPhoto = null;
const photoCameraInput = byId("workout-photo-camera");
const photoGalleryInput = byId("workout-photo-gallery");
const photoPreviewWrap = byId("workout-photo-preview-wrap");
const photoPreview = byId("workout-photo-preview");
const photoFilename = byId("photo-filename");
const btnRemovePhoto = byId("btn-remove-photo");

function compressWorkoutPhoto(file, callback) {
  if (!file || !file.type.startsWith("image/")) {
    if (callback) callback(null);
    return;
  }
  const originalSizeKb = Math.round(file.size / 1024);
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1280;
      let width = img.width;
      let height = img.height;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      let dataUrl = "";
      try {
        dataUrl = canvas.toDataURL("image/webp", 0.78);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.78);
        }
      } catch (err) {
        dataUrl = canvas.toDataURL("image/jpeg", 0.78);
      }

      const compressedSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
      const ratio = Math.max(0, Math.round(((file.size - (compressedSizeKb * 1024)) / file.size) * 100));

      if (callback) {
        callback({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          ratio,
          filename: file.name
        });
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function handleWorkoutPhotoFile(file) {
  if (!file) return;
  if (photoFilename) photoFilename.textContent = file.name;
  const badge = byId("photo-compress-badge");
  if (badge) {
    badge.style.display = "inline-flex";
    badge.textContent = "⏳ Otimizando foto...";
  }

  compressWorkoutPhoto(file, (res) => {
    if (!res) return;
    currentWorkoutPhoto = res.dataUrl;
    if (photoPreview) photoPreview.src = currentWorkoutPhoto;
    if (photoPreviewWrap) photoPreviewWrap.style.display = "block";
    if (badge) {
      const origStr = res.originalSizeKb > 1024 ? `${(res.originalSizeKb / 1024).toFixed(1)} MB` : `${res.originalSizeKb} KB`;
      badge.style.display = "inline-flex";
      badge.innerHTML = `⚡ Otimizada: <strong>${origStr}</strong> ➔ <strong>${res.compressedSizeKb} KB</strong> (${res.ratio}% menor)`;
    }
  });
}

photoCameraInput?.addEventListener("change", (e) => handleWorkoutPhotoFile(e.target.files?.[0]));
photoGalleryInput?.addEventListener("change", (e) => handleWorkoutPhotoFile(e.target.files?.[0]));

btnRemovePhoto?.addEventListener("click", () => {
  clearWorkoutPhoto();
});

function clearWorkoutPhoto() {
  currentWorkoutPhoto = null;
  if (photoCameraInput) photoCameraInput.value = "";
  if (photoGalleryInput) photoGalleryInput.value = "";
  if (photoFilename) photoFilename.textContent = "Nenhuma foto anexada";
  if (photoPreview) photoPreview.src = "";
  if (photoPreviewWrap) photoPreviewWrap.style.display = "none";
  const badge = byId("photo-compress-badge");
  if (badge) {
    badge.style.display = "none";
    badge.textContent = "";
  }
}

byId("cancel-dialog")?.addEventListener("click", () => clearWorkoutPhoto());
byId("close-dialog")?.addEventListener("click", () => clearWorkoutPhoto());

// ============================================================
// SISTEMA DE GAMIFICAÇÃO: BADGES & CONQUISTAS DE CONSISTÊNCIA
// ============================================================
const BADGES_CATALOG = [
  {
    id: "monstro-madrugada",
    name: "Monstro da Madrugada",
    icon: "🌅",
    description: "Registrou um treino antes das 07:00 da manhã.",
    check: (workouts) => workouts.some((w) => {
      const dt = w.createdAt ? new Date(w.createdAt) : null;
      return dt && !isNaN(dt.getTime()) && dt.getHours() < 7;
    }),
    progress: (workouts) => "Treino antes das 07h",
  },
  {
    id: "coruja-noturna",
    name: "Coruja Noturna",
    icon: "🌙",
    description: "Registrou um treino depois das 21:00 da noite.",
    check: (workouts) => workouts.some((w) => {
      const dt = w.createdAt ? new Date(w.createdAt) : null;
      return dt && !isNaN(dt.getTime()) && dt.getHours() >= 21;
    }),
    progress: (workouts) => "Treino após as 21h",
  },
  {
    id: "sequencia-ferro",
    name: "Sequência de Ferro",
    icon: "🔥",
    description: "7 dias seguidos com pelo menos um treino registrado.",
    check: (workouts) => {
      const dates = Array.from(new Set(workouts.map((w) => w.date || (w.createdAt ? w.createdAt.split("T")[0] : null)).filter(Boolean))).sort();
      if (dates.length < 7) return false;
      let streak = 1;
      let maxStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const d1 = new Date(dates[i - 1]);
        const d2 = new Date(dates[i]);
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          if (streak > maxStreak) maxStreak = streak;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }
      return maxStreak >= 7;
    },
    progress: (workouts) => {
      const dates = Array.from(new Set(workouts.map((w) => w.date || (w.createdAt ? w.createdAt.split("T")[0] : null)).filter(Boolean))).sort();
      let streak = 1;
      let maxStreak = dates.length ? 1 : 0;
      for (let i = 1; i < dates.length; i++) {
        const d1 = new Date(dates[i - 1]);
        const d2 = new Date(dates[i]);
        const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          if (streak > maxStreak) maxStreak = streak;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }
      return `${Math.min(7, maxStreak)} / 7 dias`;
    },
  },
  {
    id: "guerreiro-fds",
    name: "Guerreiro de Fim de Semana",
    icon: "⚔️",
    description: "Treinou no sábado e no domingo do mesmo fim de semana.",
    check: (workouts) => {
      const dates = new Set(workouts.map((w) => w.date || (w.createdAt ? w.createdAt.split("T")[0] : null)).filter(Boolean));
      for (const dStr of dates) {
        const d = new Date(dStr + "T12:00:00");
        if (d.getDay() === 6) {
          const sun = new Date(d);
          sun.setDate(sun.getDate() + 1);
          const sunStr = localDate(sun);
          if (dates.has(sunStr)) return true;
        }
      }
      return false;
    },
    progress: (workouts) => "Sábado + Domingo",
  },
  {
    id: "clube-100k",
    name: "Clube dos 100k",
    icon: "🏋️‍♂️",
    description: "Levantou mais de 100.000 kg (100 toneladas) acumuladas.",
    check: (workouts) => {
      const vol = workouts.reduce((sum, w) => sum + (Number(w.trainingVolume) || 0), 0);
      return vol >= 100000;
    },
    progress: (workouts) => {
      const vol = workouts.reduce((sum, w) => sum + (Number(w.trainingVolume) || 0), 0);
      return `${Math.min(100000, vol).toLocaleString("pt-BR")} / 100.000 kg`;
    },
  },
  {
    id: "centuriao",
    name: "Centurião dos Treinos",
    icon: "💯",
    description: "Atingiu 100 ou mais pontos no duelo atual.",
    check: (workouts) => {
      const pts = workouts.reduce((sum, w) => sum + pointsForWorkout(w), 0);
      return pts >= 100;
    },
    progress: (workouts) => {
      const pts = workouts.reduce((sum, w) => sum + pointsForWorkout(w), 0);
      return `${Math.min(100, pts)} / 100 pts`;
    },
  },
  {
    id: "mestre-trilhas",
    name: "Mestre Multidisciplinar",
    icon: "🥋",
    description: "Treinou nas 3 modalidades (Musculação, Jiu-jitsu e Cardio).",
    check: (workouts) => {
      const cats = new Set(workouts.map((w) => w.category));
      return cats.has("strength") && cats.has("bjj") && cats.has("cardio");
    },
    progress: (workouts) => {
      const cats = new Set(workouts.map((w) => w.category));
      const count = (cats.has("strength") ? 1 : 0) + (cats.has("bjj") ? 1 : 0) + (cats.has("cardio") ? 1 : 0);
      return `${count} / 3 modalidades`;
    },
  },
  {
    id: "virada-epica",
    name: "Virada Épica",
    icon: "⚡",
    description: "Assumiu a liderança do duelo ultrapassando o rival.",
    check: (workouts) => {
      return localStorage.getItem("rep-club-unlocked-virada-epica") === "true";
    },
    progress: () => "Ultrapassar rival",
  },
  {
    id: "batedor-recorde",
    name: "Batedor de Recordes",
    icon: "🏆",
    description: "Bateu seu recorde de carga pessoal em qualquer exercício.",
    check: (workouts) => {
      return workouts.some((w) => w.improvedRecord || (w.qualityPoints && w.qualityPoints >= 10));
    },
    progress: () => "Superar 1RM/PR",
  },
  {
    id: "primeiro-sangue",
    name: "Primeiro Sangue",
    icon: "🩸",
    description: "Registrou o primeiríssimo treino do desafio atual antes do rival.",
    check: (workouts) => workouts.length >= 1,
    progress: () => "1º treino do duelo",
  },
];

function getSavedBadges(athleteId) {
  try {
    return JSON.parse(localStorage.getItem(`rep-club-badges-${athleteId}`) || "{}");
  } catch (e) {
    return {};
  }
}

function saveBadgesState(athleteId, badgeMap) {
  try {
    localStorage.setItem(`rep-club-badges-${athleteId}`, JSON.stringify(badgeMap));
  } catch (e) {}
}

function evaluateAthleteBadges(athleteId) {
  const curCh = getActiveChallenge();
  const athleteWorkouts = (state.workouts || []).filter((w) => {
    const owner = resolvePlayerForWorkout(w, curCh);
    return owner && owner.id === athleteId;
  });

  const saved = getSavedBadges(athleteId);
  const result = [];

  for (const b of BADGES_CATALOG) {
    const wasUnlocked = Boolean(saved[b.id]?.unlocked);
    const isNowUnlocked = wasUnlocked || b.check(athleteWorkouts);
    const unlockedAt = saved[b.id]?.unlockedAt || (isNowUnlocked ? new Date().toISOString() : null);

    if (isNowUnlocked && !wasUnlocked) {
      saved[b.id] = { unlocked: true, unlockedAt };
    }

    result.push({
      ...b,
      unlocked: isNowUnlocked,
      unlockedAt,
      progressText: b.progress(athleteWorkouts),
    });
  }

  saveBadgesState(athleteId, saved);
  return result;
}

function openBadgesDialog() {
  const athleteId = state.activePlayer;
  const badges = evaluateAthleteBadges(athleteId);
  const container = byId("badges-grid-container");
  if (!container) return;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  container.innerHTML = badges.map((b) => {
    const dateFormatted = b.unlockedAt ? new Date(b.unlockedAt).toLocaleDateString("pt-BR") : "";
    return `
      <div class="badge-card ${b.unlocked ? "unlocked" : "locked"}">
        <div class="badge-top">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-title-wrap">
            <strong class="badge-title">${escapeHTML(b.name)}</strong>
            <span class="badge-status-tag">${b.unlocked ? "✓ Conquistada" : "🔒 Bloqueada"}</span>
          </div>
        </div>
        <p class="badge-desc">${escapeHTML(b.description)}</p>
        <div class="badge-footer">
          <span>${b.unlocked ? `Em ${dateFormatted}` : `Meta: ${escapeHTML(b.progressText)}`}</span>
        </div>
      </div>
    `;
  }).join("");

  const modal = byId("badges-dialog");
  if (modal) {
    const titleEl = byId("badges-title");
    if (titleEl) titleEl.textContent = `🏆 Suas Conquistas (${unlockedCount}/${badges.length})`;
    showModalSafely(modal);
  }
}

let lastCelebratedBadge = null;

function checkNewBadgesAfterWorkout(athleteId) {
  const savedBefore = getSavedBadges(athleteId);
  const badges = evaluateAthleteBadges(athleteId);

  const newlyUnlocked = badges.find((b) => b.unlocked && !savedBefore[b.id]?.unlocked);
  if (newlyUnlocked) {
    lastCelebratedBadge = newlyUnlocked;
    playBeep(523, "sine", 0.14, 0.22);
    setTimeout(() => playBeep(659, "sine", 0.14, 0.22), 120);
    setTimeout(() => playBeep(784, "sine", 0.35, 0.26), 240);

    const iconEl = byId("celebration-badge-icon");
    const titleEl = byId("celebration-title");
    const descEl = byId("celebration-desc");
    if (iconEl) iconEl.textContent = newlyUnlocked.icon;
    if (titleEl) titleEl.textContent = newlyUnlocked.name;
    if (descEl) descEl.textContent = newlyUnlocked.description;

    const modal = byId("badge-celebration-dialog");
    if (modal) showModalSafely(modal);
  }
}

// ============================================================
// GERADOR DE CARDS PARA INSTAGRAM STORIES (CANVAS VERTICAL 9:16)
// ============================================================
let currentStoryDataUrl = null;

async function generateStoryCard(workout = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");

  // 1. Fundo dark tech arena com gradiente vertical 9:16
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, "#080c14");
  bgGrad.addColorStop(0.3, "#0e1524");
  bgGrad.addColorStop(0.7, "#141c2e");
  bgGrad.addColorStop(1, "#070a10");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Grid e partículas sutis de fundo
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  for (let x = 40; x < 1080; x += 80) {
    for (let y = 40; y < 1920; y += 80) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Brilhos ambientais neon nos cantos
  const glowTop = ctx.createRadialGradient(200, 200, 10, 200, 200, 500);
  glowTop.addColorStop(0, "rgba(215, 250, 82, 0.12)");
  glowTop.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, 1080, 800);

  const glowCenter = ctx.createRadialGradient(880, 800, 10, 880, 800, 600);
  glowCenter.addColorStop(0, "rgba(70, 100, 234, 0.14)");
  glowCenter.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowCenter;
  ctx.fillRect(0, 400, 1080, 1000);

  // 2. Cabeçalho / Branding Rep Club
  ctx.fillStyle = "#d7fa52";
  ctx.font = "800 68px 'Barlow Condensed', Impact, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("REP CLUB", 90, 180);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px 'DM Sans', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("DUELO COMPETITIVO · PWA", 90, 222);

  const curCh = getActiveChallenge();
  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 24px 'DM Sans', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(curCh?.title || "Duelo Ativo", 990, 180);
  ctx.fillText(dateStr, 990, 222);

  // 3. Card do Duelo (Top Matchup)
  const rankedPlayers = PLAYERS.map((p) => {
    const workouts = duelWorkouts(p.id);
    const pts = workouts.reduce((s, w) => s + pointsForWorkout(w), 0);
    return { player: p, points: pts };
  }).sort((a, b) => b.points - a.points);

  const p1 = rankedPlayers[0] || { player: PLAYERS[0] || { name: "Atleta 1" }, points: 0 };
  const p2 = rankedPlayers[1] || { player: PLAYERS[1] || { name: "Atleta 2" }, points: 0 };

  // Moldura do matchup
  ctx.fillStyle = "rgba(18, 24, 38, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, 90, 270, 900, 340, 24, true, true);

  // Lutador 1 (Esquerda)
  ctx.fillStyle = "#d7fa52";
  ctx.beginPath();
  ctx.arc(210, 410, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#181915";
  ctx.font = "800 48px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(p1.player.name.charAt(0).toUpperCase(), 210, 426);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 36px 'DM Sans', sans-serif";
  ctx.fillText(p1.player.name, 210, 510);
  ctx.fillStyle = "#d7fa52";
  ctx.font = "800 64px 'Barlow Condensed', Impact, sans-serif";
  ctx.fillText(`${p1.points} PTS`, 210, 576);

  // Centro VS & Barra
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(540, 420, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 28px 'Barlow Condensed', Impact, sans-serif";
  ctx.fillText("VS", 540, 430);

  const totalPts = Math.max(1, p1.points + p2.points);
  const p1Pct = p1.points / totalPts;

  ctx.fillStyle = "#1e293b";
  roundRect(ctx, 420, 480, 240, 16, 8, true, false);
  ctx.fillStyle = "#d7fa52";
  roundRect(ctx, 420, 480, Math.max(12, 240 * p1Pct), 16, 8, true, false);

  // Lutador 2 (Direita)
  ctx.fillStyle = "#4664ea";
  ctx.beginPath();
  ctx.arc(870, 410, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 48px 'Barlow Condensed', sans-serif";
  ctx.fillText(p2.player.name.charAt(0).toUpperCase(), 870, 426);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 36px 'DM Sans', sans-serif";
  ctx.fillText(p2.player.name, 870, 510);
  ctx.fillStyle = "#60a5fa";
  ctx.font = "800 64px 'Barlow Condensed', Impact, sans-serif";
  ctx.fillText(`${p2.points} PTS`, 870, 576);

  // 4. Card do Treino / Destaque da Sessão
  const targetWorkout = workout || (state.workouts && state.workouts[0]) || null;
  const cardY = 650;
  const cardHeight = 900;

  ctx.fillStyle = "rgba(18, 24, 38, 0.95)";
  ctx.strokeStyle = "rgba(215, 250, 82, 0.4)";
  ctx.lineWidth = 3;
  roundRect(ctx, 90, cardY, 900, cardHeight, 28, true, true);

  const modLabel = targetWorkout ? (MODALITIES[targetWorkout.category]?.label || targetWorkout.category).toUpperCase() : "SESSÃO DO DIA";
  const ptsEarned = targetWorkout ? pointsForWorkout(targetWorkout) : 0;

  ctx.fillStyle = "#d7fa52";
  roundRect(ctx, 130, cardY + 45, 260, 42, 8, true, false);
  ctx.fillStyle = "#181915";
  ctx.font = "800 20px 'DM Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`+${ptsEarned} PTS NO DUELO`, 260, cardY + 73);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 64px 'Barlow Condensed', Impact, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(modLabel, 130, cardY + 160);

  const dur = targetWorkout?.duration || 45;
  const vol = targetWorkout?.trainingVolume || 0;
  const eff = targetWorkout?.effort || 8;

  const statWidth = 260;
  const statBoxY = cardY + 200;

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, 130, statBoxY, statWidth, 120, 14, true, false);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 18px 'DM Sans', sans-serif";
  ctx.fillText("DURAÇÃO", 155, statBoxY + 40);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 38px 'Barlow Condensed', sans-serif";
  ctx.fillText(`${dur} min`, 155, statBoxY + 88);

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, 410, statBoxY, statWidth, 120, 14, true, false);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 18px 'DM Sans', sans-serif";
  ctx.fillText("VOLUME TOTAL", 435, statBoxY + 40);
  ctx.fillStyle = "#d7fa52";
  ctx.font = "800 38px 'Barlow Condensed', sans-serif";
  ctx.fillText(vol > 0 ? `${vol.toLocaleString("pt-BR")} kg` : "—", 435, statBoxY + 88);

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, 690, statBoxY, statWidth, 120, 14, true, false);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 18px 'DM Sans', sans-serif";
  ctx.fillText("ESFORÇO RPE", 715, statBoxY + 40);
  ctx.fillStyle = "#facc15";
  ctx.font = "800 38px 'Barlow Condensed', sans-serif";
  ctx.fillText(`${eff} / 10`, 715, statBoxY + 88);

  if (targetWorkout?.photo) {
    try {
      const img = await loadHtmlImage(targetWorkout.photo);
      if (img) {
        ctx.save();
        const photoY = cardY + 360;
        const photoH = 380;
        roundRect(ctx, 130, photoY, 820, photoH, 18, false, false);
        ctx.clip();
        const aspect = img.width / img.height;
        let dw = 820;
        let dh = 820 / aspect;
        if (dh < photoH) {
          dh = photoH;
          dw = photoH * aspect;
        }
        const dx = 130 + (820 - dw) / 2;
        const dy = photoY + (photoH - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        ctx.strokeStyle = "rgba(215, 250, 82, 0.5)";
        ctx.lineWidth = 2;
        roundRect(ctx, 130, photoY, 820, photoH, 18, false, true);
      }
    } catch (e) {
      console.warn("Falha ao desenhar foto no canvas:", e);
    }
  } else if (Array.isArray(targetWorkout?.exercises) && targetWorkout.exercises.length > 0) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 22px 'DM Sans', sans-serif";
    ctx.fillText("DESTAQUES DO TREINO:", 130, cardY + 380);

    let exY = cardY + 440;
    targetWorkout.exercises.slice(0, 4).forEach((ex) => {
      const setsCount = Array.isArray(ex.sets) ? ex.sets.length : (ex.sets || 3);
      const maxL = Array.isArray(ex.sets) ? Math.max(...ex.sets.map((s) => Number(s.load) || 0)) : (ex.load || 0);
      const text = `• ${ex.name} — ${setsCount} séries ${maxL > 0 ? `com até ${maxL}kg` : ""}`;
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 28px 'DM Sans', sans-serif";
      ctx.fillText(text, 140, exY);
      exY += 56;
    });
  }

  if (targetWorkout?.comments) {
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 24px 'DM Sans', sans-serif";
    const cleanComm = `"${targetWorkout.comments.slice(0, 80)}${targetWorkout.comments.length > 80 ? "..." : ""}"`;
    ctx.fillText(cleanComm, 130, cardY + 840);
  }

  // 5. Rodapé & Tagline
  ctx.fillStyle = "#d7fa52";
  ctx.font = "800 32px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DISPUTA PONTO A PONTO. SUPERA SEU RIVAL.", 540, 1650);

  ctx.fillStyle = "#64748b";
  ctx.font = "600 22px 'DM Sans', sans-serif";
  ctx.fillText("REP CLUB · Aplicativo de Duelo & Treino PWA", 540, 1700);

  return canvas;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function loadHtmlImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function openStoryShareDialog(workout = null) {
  showToast("Gerando Story 9:16...");
  try {
    const canvas = await generateStoryCard(workout);
    currentStoryDataUrl = canvas.toDataURL("image/png");

    const preview = byId("story-preview-img");
    if (preview) preview.src = currentStoryDataUrl;

    const modal = byId("story-share-dialog");
    if (modal) showModalSafely(modal);
  } catch (err) {
    console.error("Erro ao gerar Story:", err);
    showToast("Não foi possível gerar a imagem do Story.");
  }
}

// ============================================================
// NOTIFICAÇÕES & ALERTAS EM TEMPO REAL QUANDO O RIVAL TREINA
// ============================================================
const knownWorkoutIds = new Set();
let isInitialSyncDone = false;

function checkForRivalNewWorkouts(syncedRemote) {
  if (!isInitialSyncDone) {
    syncedRemote.forEach((w) => knownWorkoutIds.add(w.id));
    isInitialSyncDone = true;
    return;
  }

  const curCh = getActiveChallenge();
  const authUser = getAuthUser();
  const currentUserId = String(authUser?.id || authUser?.uid || "").trim().toLowerCase();
  const currentEmail = String(authUser?.email || "").trim().toLowerCase();

  const newRivalWorkouts = syncedRemote.filter((w) => {
    if (knownWorkoutIds.has(w.id)) return false;
    knownWorkoutIds.add(w.id);

    if (curCh && w.challengeId && w.challengeId !== curCh.id) return false;

    const wUid = String(w.userId || w.user_id || "").trim().toLowerCase();
    const wEmail = String(w.userEmail || w.user_email || "").trim().toLowerCase();
    if (currentUserId && wUid && wUid === currentUserId) return false;
    if (currentEmail && wEmail && wEmail === currentEmail) return false;

    const owner = resolvePlayerForWorkout(w, curCh);
    if (owner && owner.id === state.activePlayer) return false;

    return true;
  });

  if (newRivalWorkouts.length > 0) {
    newRivalWorkouts.forEach((w) => {
      const owner = resolvePlayerForWorkout(w, curCh);
      const rivalName = owner ? owner.name : (w.userName || "Seu rival");
      const modLabel = MODALITIES[w.category]?.label || w.name || "treino";
      const pts = pointsForWorkout(w);

      const title = `⚠️ ${rivalName} treinou no Rep Club!`;
      const body = `${rivalName} acabou de registrar ${modLabel} (+${pts} pts) e avançou no Duelo!`;

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: "assets/icons/icon-192.png",
                badge: "assets/icons/icon-192.png",
                tag: `rival-${w.id}`,
                data: { url: "./" },
              });
            });
          } else {
            new Notification(title, {
              body,
              icon: "assets/icons/icon-192.png",
            });
          }
        } catch (e) {
          console.warn("Falha ao disparar Notification nativa:", e);
        }
      }

      showRivalAlertBanner(rivalName, modLabel, pts);
      playBeep(480, "sawtooth", 0.18, 0.2);
    });
  }
}

function showRivalAlertBanner(rivalName, modLabel, pts) {
  const toast = byId("rival-alert-toast");
  const titleEl = byId("rival-alert-title");
  const bodyEl = byId("rival-alert-body");
  if (!toast) return;

  if (titleEl) titleEl.textContent = `🚨 ALERTA: ${rivalName} acabou de treinar!`;
  if (bodyEl) bodyEl.textContent = `Registrou ${modLabel} (+${pts} pts) no Duelo. Hora de responder!`;

  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 5000);
}

function initNotificationControls() {
  const btn = byId("btn-toggle-notifications");
  if (!btn) return;

  function updateBtnUI() {
    if (!("Notification" in window)) {
      btn.style.display = "none";
      return;
    }
    if (Notification.permission === "granted") {
      btn.textContent = "🔔";
      btn.classList.add("btn-active-notif");
      btn.title = "Alertas de rival ativos! Clique para testar notificação.";
    } else if (Notification.permission === "denied") {
      btn.textContent = "🔕";
      btn.title = "Notificações bloqueadas nas configurações do navegador.";
    } else {
      btn.textContent = "🔔";
      btn.title = "Clique para receber alertas em tempo real quando o rival treinar!";
    }
  }

  btn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      showToast("Seu navegador não suporta notificações.");
      return;
    }
    if (Notification.permission === "granted") {
      showToast("🔔 Alertas ativos! Enviando notificação de teste...");
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("🔔 Rep Club: Alertas Ativos", {
          body: "Você será avisado sempre que seu rival registrar um treino!",
          icon: "assets/icons/icon-192.png",
        });
      } else {
        new Notification("🔔 Rep Club: Alertas Ativos", {
          body: "Você será avisado sempre que seu rival registrar um treino!",
          icon: "assets/icons/icon-192.png",
        });
      }
      return;
    }

    const perm = await Notification.requestPermission();
    updateBtnUI();
    if (perm === "granted") {
      showToast("🔔 Notificações ativadas com sucesso!");
    } else {
      showToast("Permissão de notificação negada.");
    }
  });

  updateBtnUI();
}

// MODO RAIO-X
function openRaioXDialog() {
  const p1 = PLAYERS[0] || { name: "Jogador 1", short: "1", color: "var(--lime)" };
  const p2 = PLAYERS[1] || { name: "Jogador 2", short: "2", color: "var(--blue)" };
  const p1Workouts = duelWorkouts(p1.id);
  const p2Workouts = duelWorkouts(p2.id);

  const getStats = (wList, cat) => {
    const list = wList.filter(w => w.category === cat);
    const pts = list.reduce((sum, w) => sum + pointsForWorkout(w), 0);
    return { count: list.length, pts };
  };

  const p1Str = getStats(p1Workouts, "strength");
  const p2Str = getStats(p2Workouts, "strength");
  const p1Bjj = getStats(p1Workouts, "bjj");
  const p2Bjj = getStats(p2Workouts, "bjj");
  const p1Cardio = getStats(p1Workouts, "cardio");
  const p2Cardio = getStats(p2Workouts, "cardio");

  const p1TotalPts = p1Workouts.reduce((s, w) => s + pointsForWorkout(w), 0);
  const p2TotalPts = p2Workouts.reduce((s, w) => s + pointsForWorkout(w), 0);

  let roast = "";
  if (p1TotalPts === 0 && p2TotalPts === 0) {
    roast = "Nenhum dos dois treinou ainda! O tatame está acumulando poeira e as anilhas estão frias. Quem vai ter a vergonha na cara de começar?";
  } else if (Math.abs(p1TotalPts - p2TotalPts) <= 3) {
    roast = `Equilíbrio tenso entre ${p1.name} (${p1TotalPts} pts) e ${p2.name} (${p2TotalPts} pts)! A rivalidade está afiada e qualquer treino ou rola a mais vira liderança isolada.`;
  } else if (p1TotalPts > p2TotalPts) {
    const diff = p1TotalPts - p2TotalPts;
    if (p1Bjj.pts > p2Bjj.pts + 10) {
      roast = `🔥 ${p1.name} está amarrando ${p2.name} no tatame! ${p2.name} precisa parar de assistir e bater ponto nos treinos de Jiu. Vantagem de ${diff} pts!`;
    } else if (p1Str.pts > p2Str.pts + 10) {
      roast = `💪 ${p1.name} está empilhando anilhas enquanto ${p2.name} finge que descanso de 5 minutos é hipertrofia. Vantagem de ${diff} pts!`;
    } else {
      roast = `🏆 ${p1.name} lidera com folga (+${diff} pts). ${p2.name}, o troféu de vice já está sendo polido com seu nome!`;
    }
  } else {
    const diff = p2TotalPts - p1TotalPts;
    if (p2Bjj.pts > p1Bjj.pts + 10) {
      roast = `🔥 ${p2.name} está finalizando geral! ${p1.name} ficou para trás na contagem de pontos do tatame (+${diff} pts de desvantagem).`;
    } else if (p2Str.pts > p1Str.pts + 10) {
      roast = `💪 ${p2.name} assumiu a maromba com autoridade! ${p1.name} está ${diff} pontos atrás e atualizando as desculpas.`;
    } else {
      roast = `🏆 ${p2.name} na liderança absoluta (+${diff} pts)! ${p1.name}, ou treina hoje ou já pode ir encomendando o prêmio combinado.`;
    }
  }

  const roastEl = byId("raiox-roast-text");
  if (roastEl) roastEl.textContent = roast;

  const renderRow = (label, icon, s1, s2) => {
    const totalPts = Math.max(1, s1.pts + s2.pts);
    const p1Pct = Math.round((s1.pts / totalPts) * 100);
    const p2Pct = 100 - p1Pct;
    return `
      <div class="raiox-comparison-row">
        <div class="raiox-row-header">
          <span>${icon} ${label}</span>
          <span class="raiox-row-stats">${s1.count}t (${s1.pts} pts) vs ${s2.count}t (${s2.pts} pts)</span>
        </div>
        <div class="raiox-bar-track">
          <div class="raiox-bar-fill-p1" style="width:${p1Pct}%; background:${p1.color};" title="${escapeHTML(p1.name)}: ${s1.pts} pts (${p1Pct}%)"></div>
          <div class="raiox-bar-fill-p2" style="width:${p2Pct}%; background:${p2.color};" title="${escapeHTML(p2.name)}: ${s2.pts} pts (${p2Pct}%)"></div>
        </div>
        <div class="raiox-row-footer">
          <span style="color:${p1.color};">${escapeHTML(p1.name)}: ${s1.pts} pts (${p1Pct}%)</span>
          <span style="color:${p2.color};">${escapeHTML(p2.name)}: ${s2.pts} pts (${p2Pct}%)</span>
        </div>
      </div>
    `;
  };

  const listContainer = byId("raiox-comparison-list");
  if (listContainer) {
    listContainer.innerHTML = [
      renderRow("Musculação", "🏋️", p1Str, p2Str),
      renderRow("Jiu-jitsu", "🥋", p1Bjj, p2Bjj),
      renderRow("Cardio", "🏃", p1Cardio, p2Cardio),
      renderRow("Pontuação Geral", "🏆", { count: p1Workouts.length, pts: p1TotalPts }, { count: p2Workouts.length, pts: p2TotalPts }),
    ].join("");
  }

  byId("raiox-dialog")?.showModal();
}

byId("btn-open-raiox")?.addEventListener("click", () => openRaioXDialog());
byId("close-raiox-dialog")?.addEventListener("click", () => byId("raiox-dialog")?.close());
byId("btn-close-raiox")?.addEventListener("click", () => byId("raiox-dialog")?.close());

// CONTROLE DOS TÓPICOS RECOLHÍVEIS (MINIMIZADOS POR PADRÃO)
document.addEventListener("click", (e) => {
  const header = e.target.closest(".collapsible-header");
  if (!header) return;

  // Ignorar cliques diretos em selects ou botões de ação internos (exceto o próprio badge de toggle)
  if (e.target.closest("select, input") || (e.target.closest("button") && !e.target.closest(".collapse-toggle-badge"))) {
    return;
  }

  const section = header.closest(".collapsible-section");
  if (!section) return;

  const isCollapsed = section.classList.toggle("is-collapsed");
  header.setAttribute("aria-expanded", String(!isCollapsed));

  const textEl = header.querySelector(".toggle-text");
  if (textEl) {
    textEl.textContent = isCollapsed ? "Expandir" : "Recolher";
  }

  // Se abriu a seção de histórico, redesenhar gráfico com dimensões corretas
  if (!isCollapsed && section.id === "evolucao") {
    renderHistorySelect();
    setTimeout(() => drawHistoryChart(), 60);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const header = e.target.closest(".collapsible-header");
    if (header && e.target === header) {
      e.preventDefault();
      header.click();
    }
  }
});

// MENU DA ENGRENAGEM (DROPDOWN NO TOPO)
const btnGear = byId("btn-gear-menu");
const gearDropdown = byId("gear-dropdown");
function toggleGearMenu() {
  if (!gearDropdown) return;
  gearDropdown.hidden = !gearDropdown.hidden;
}
function closeGearMenu() {
  if (gearDropdown) gearDropdown.hidden = true;
}
btnGear?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleGearMenu();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".gear-menu-wrap")) {
    closeGearMenu();
  }
});

byId("gear-new-challenge")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeGearMenu();
  openSetupDialog("create");
});
byId("gear-edit-challenge")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeGearMenu();
  const cur = getActiveChallenge();
  if (!cur || activeChallengeId === "none") {
    openSetupDialog("create");
  } else {
    openSetupDialog("edit");
  }
});
byId("gear-delete-challenge")?.addEventListener("click", () => {
  closeGearMenu();
  const cur = getActiveChallenge();
  if (!cur || activeChallengeId === "none") {
    showToast("Nenhum duelo selecionado para excluir.");
    return;
  }
  byId("delete-challenge-btn")?.click();
});
byId("gear-reset-challenge")?.addEventListener("click", () => {
  closeGearMenu();
  handleResetChallenge();
});
byId("gear-open-qr")?.addEventListener("click", () => {
  closeGearMenu();
  showModalSafely(byId("qr-dialog"));
});

// EVENT LISTENERS DE BADGES & STORIES
byId("btn-open-badges")?.addEventListener("click", () => openBadgesDialog());
byId("btn-open-badges-topbar")?.addEventListener("click", () => openBadgesDialog());
byId("close-badges-dialog")?.addEventListener("click", () => closeModalSafely(byId("badges-dialog")));
byId("btn-close-badges-footer")?.addEventListener("click", () => closeModalSafely(byId("badges-dialog")));

byId("btn-open-story-card")?.addEventListener("click", () => openStoryShareDialog());
byId("close-story-dialog")?.addEventListener("click", () => closeModalSafely(byId("story-share-dialog")));

byId("btn-trigger-share")?.addEventListener("click", async () => {
  if (!currentStoryDataUrl) return;
  try {
    const res = await fetch(currentStoryDataUrl);
    const blob = await res.blob();
    const file = new File([blob], "rep-club-story.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Meu Duelo no Rep Club",
        text: "Confira meu treino e o placar do duelo no Rep Club!",
        files: [file],
      });
      showToast("Compartilhado com sucesso!");
    } else {
      const a = document.createElement("a");
      a.href = currentStoryDataUrl;
      a.download = "rep-club-story.png";
      a.click();
      showToast("Story baixado! Abra o Instagram e poste no seu Story.");
    }
  } catch (e) {
    if (e.name !== "AbortError") {
      console.warn("Erro ao compartilhar story:", e);
    }
  }
});

byId("btn-download-story")?.addEventListener("click", () => {
  if (!currentStoryDataUrl) return;
  const a = document.createElement("a");
  a.href = currentStoryDataUrl;
  a.download = `rep-club-story-${new Date().toISOString().split("T")[0]}.png`;
  a.click();
  showToast("Story baixado com sucesso!");
});

byId("btn-copy-story")?.addEventListener("click", async () => {
  if (!currentStoryDataUrl) return;
  try {
    const res = await fetch(currentStoryDataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showToast("Imagem copiada para a área de transferência!");
  } catch (e) {
    showToast("Não foi possível copiar. Use o botão Baixar Story.");
  }
});

byId("btn-share-unlocked-badge")?.addEventListener("click", () => {
  closeModalSafely(byId("badge-celebration-dialog"));
  openStoryShareDialog();
});

byId("btn-close-celebration")?.addEventListener("click", () => {
  closeModalSafely(byId("badge-celebration-dialog"));
});

// EXPOSIÇÃO GLOBAL PARA MANIPULADORES MOBILE E EVENTOS NATIVOS
window.openSetupDialog = openSetupDialog;
window.closeGearMenu = closeGearMenu;
window.toggleGearMenu = toggleGearMenu;
window.showModalSafely = showModalSafely;
window.closeModalSafely = closeModalSafely;
window.drawHistoryChart = drawHistoryChart;
window.renderHistorySelect = renderHistorySelect;

// Capturador de erros para depuração amigável no celular
window.addEventListener("error", (event) => {
  console.error("Global Error:", event.error || event.message);
});