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
const EXERCISE_DATA_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const EXERCISE_MEDIA_RAW = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const EXERCISE_MEDIA_GITHUB = "https://github.com/yuhonas/free-exercise-db/blob/main/exercises/";
let customTrainingPlans = [];
let exerciseCatalog = null;
let exerciseCatalogPromise = null;
let activeStrengthPlan = null;
let exercisePickerTarget = null;
let exercisePickerPanelOpen = false;

try {
  customTrainingPlans = JSON.parse(localStorage.getItem(CUSTOM_PLANS_KEY) || "[]");
} catch (error) {
  console.warn("Não foi possível carregar os treinos personalizados.", error);
}

async function loadExerciseCatalog() {
  if (exerciseCatalog) return exerciseCatalog;
  if (!exerciseCatalogPromise) {
    exerciseCatalogPromise = fetch(EXERCISE_DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Catálogo respondeu ${response.status}`);
        return response.json();
      })
      .then((records) => {
        exerciseCatalog = Array.isArray(records) ? records : [];
        return exerciseCatalog;
      });
  }
  return exerciseCatalogPromise;
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
const pointsForWorkout = (workout) => Number(workout.points ?? 10);
const playerFor = (id) => PLAYERS.find((player) => player.id === id);

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

function getActiveUserPlayer() {
  const user = getAuthUser();
  if (!user) return null;
  const cur = getActiveChallenge();
  const pool = cur?.players || PLAYERS;
  const uName = String(user.name || "").trim().toLowerCase();
  const uEmail = String(user.email || "").trim().toLowerCase();
  const uId = String(user.id || user.uid || "").trim();

  return pool.find((p) => {
    if (!p) return false;
    const pId = String(p.id || p.uid || "").trim();
    const pEmail = String(p.email || "").trim().toLowerCase();
    const pName = String(p.name || "").trim().toLowerCase();
    if (uId && pId && (pId === uId || pId.toLowerCase() === uId.toLowerCase())) return true;
    if (uEmail && pEmail && pEmail === uEmail) return true;
    if (pName && uName) {
      if (pName === uName) return true;
      const pFirst = pName.split(/\s+/)[0];
      const uFirst = uName.split(/\s+/)[0];
      if (pFirst.length >= 3 && uFirst.length >= 3 && pFirst === uFirst) return true;
    }
    return false;
  }) || pool[0];
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
      saved.activePlayer = legacyIds[saved.activePlayer] || saved.activePlayer;
      saved.workouts = saved.workouts.map((workout) => ({
        ...workout,
        challengeId: workout.challengeId || "challenge-1",
        owner: legacyIds[workout.owner] || workout.owner,
      }));
    }
    if (saved && Array.isArray(saved.workouts) && playerFor(saved.activePlayer)) {
      const demoOnly = saved.workouts.length > 0 && saved.workouts.every((workout) => workout.id.startsWith("demo-"));
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
    duel_id: CANONICAL_DUEL_ID,
    player_id: workout.owner,
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
      const resp = await fetch("https://mathub-f08b6-default-rtdb.firebaseio.com/rep-club/workouts.json");
      if (resp.ok) {
        workoutsData = await resp.json();
      }
    }

    const remoteWorkoutsList = workoutsData ? Object.values(workoutsData) : [];
    const pendingLocal = state.workouts.filter((lw) => !remoteWorkoutsList.some((rw) => rw.id === lw.id) && String(lw.id).startsWith("local-"));
    const syncedRemote = remoteWorkoutsList.map((workout) => ({
      id: workout.id,
      challengeId: activeChallengeId || "challenge-1",
      owner: workout.player_id,
      category: workout.category,
      date: workout.workout_date,
      name: workout.name || MODALITIES[workout.category]?.label || workout.category,
      comments: workout.comments || "",
      photo: workout.photo || null,
      points: workout.points || 0,
      effort: workout.effort,
      duration: workout.duration || 0,
      exercises: workout.exercises,
      qualityPoints: Math.max(0, (workout.points || 0) - (MODALITIES[workout.category]?.basePoints || 0)),
    }));

    state.workouts = [...pendingLocal, ...syncedRemote];
    state.activePlayer = PLAYERS[0].id;
    saveState();
    hydrateProgramsFromFirebase();
    await hydrateChallengesFromFirebase();
    const ind = byId("sync-status-indicator");
    if (ind) {
      ind.textContent = "● Google Firebase Ao Vivo";
      ind.style.color = "var(--lime)";
    }
  } catch (error) {
    console.warn("Firebase indisponível; mantendo os dados locais.", error);
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
      if (Array.isArray(saved)) {
        return saved.filter((c) => c && c.id && c.title);
      }
    }
  } catch (error) {
    console.warn("Não foi possível ler os desafios salvos.", error);
  }

  return [];
}

let challenges = loadChallenges();
let activeChallengeId = localStorage.getItem(ACTIVE_CHALLENGE_KEY) || (challenges[0]?.id || "none");
if (!challenges.some((c) => c.id === activeChallengeId)) {
  activeChallengeId = challenges[0]?.id || "none";
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
    return null;
  }
  return null;
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
  if (!PLAYERS.some((p) => p.id === state.activePlayer)) {
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
  return currentChallengeWorkouts().filter((workout) => workout.owner === playerId);
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
const DBZ_ASSETS = {
  goku: new Image(),
  cell: new Image(),
  gokuBlast: new Image(),
  cellBlast: new Image(),
  clashA: new Image(),
  clashB: new Image(),
  gokuBeam: new Image(),
  cellBeam: new Image(),
};
DBZ_ASSETS.goku.src = "assets/dbz/goku_ssj.png";
DBZ_ASSETS.cell.src = "assets/dbz/cell_perfect.png";
DBZ_ASSETS.gokuBlast.src = "assets/dbz/goku_blast.png";
DBZ_ASSETS.cellBlast.src = "assets/dbz/cell_blast.png";
DBZ_ASSETS.clashA.src = "assets/dbz/clash_epicenter.png";
DBZ_ASSETS.clashB.src = "assets/dbz/clash_epicenter_b.png";
DBZ_ASSETS.gokuBeam.src = "assets/dbz/goku_beam.png";
DBZ_ASSETS.cellBeam.src = "assets/dbz/cell_beam.png";

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

        // Tiers de transformação (Tier 1: Base/SSJ, Tier 2: SSJ2 / 100%, Tier 3: SSJ Blue / Gold)
        const gokuTier = gokuFighterPoints >= 100 ? 3 : gokuFighterPoints >= 50 ? 2 : 1;
        const cellTier = cellFighterPoints >= 100 ? 3 : cellFighterPoints >= 50 ? 2 : 1;

        // AURA PULSANTE DO GOKU (Tier 2 e 3)
        if (gokuTier >= 2) {
          const pulse = 0.16 + 0.12 * Math.sin(Date.now() / 130);
          ctx.fillStyle = gokuTier === 3 ? `rgba(56, 189, 248, ${pulse})` : `rgba(250, 204, 21, ${pulse})`;
          ctx.beginPath();
          ctx.arc(33, 90, gokuTier === 3 ? 46 : 38, 0, Math.PI * 2);
          ctx.fill();
        }

        // AURA PULSANTE DO CELL (Tier 2 e 3)
        if (cellTier >= 2) {
          const pulse = 0.16 + 0.12 * Math.sin(Date.now() / 130);
          ctx.fillStyle = cellTier === 3 ? `rgba(234, 179, 8, ${pulse})` : `rgba(168, 85, 247, ${pulse})`;
          ctx.beginPath();
          ctx.arc(553, 85, cellTier === 3 ? 50 : 44, 0, Math.PI * 2);
          ctx.fill();
        }

        // 1. FEIXE HORIZONTAL DO GOKU (x=142 até clashX - 35, y=62, altura 27)
        if (DBZ_ASSETS.gokuBeam.complete && clashX > 142) {
          const gokuBeamWidth = Math.max(0, (clashX - 35) - 142);
          if (gokuBeamWidth > 0) {
            ctx.drawImage(DBZ_ASSETS.gokuBeam, 0, 0, 1, 27, 142, 62, gokuBeamWidth, 27);
          }
        }

        // 2. FEIXE HORIZONTAL DO CELL (clashX + 35 até x=450, y=62, altura 27)
        if (DBZ_ASSETS.cellBeam.complete && clashX < 450) {
          const cellBeamWidth = Math.max(0, 450 - (clashX + 35));
          if (cellBeamWidth > 0) {
            ctx.drawImage(DBZ_ASSETS.cellBeam, 0, 0, 1, 27, clashX + 35, 62, cellBeamWidth, 27);
          }
        }

        // 3. SPRITE DO GOKU SSJ (x=8, y=48, tamanho 51x84)
        if (DBZ_ASSETS.goku.complete) {
          ctx.drawImage(DBZ_ASSETS.goku, 8, 48);
        }

        // 4. ESFERA DE ORIGEM DO GOKU (x=57, y=42, tamanho 85x68)
        if (DBZ_ASSETS.gokuBlast.complete) {
          ctx.drawImage(DBZ_ASSETS.gokuBlast, 57 + shakeX * 0.4, 42 + shakeY * 0.4);
        }

        // 5. SPRITE DO PERFECT CELL (x=518, y=28, tamanho 70x118)
        if (DBZ_ASSETS.cell.complete) {
          ctx.drawImage(DBZ_ASSETS.cell, 518, 28);
        }

        // 6. ESFERA DE ORIGEM DO CELL (x=450, y=42, tamanho 75x68)
        if (DBZ_ASSETS.cellBlast.complete) {
          ctx.drawImage(DBZ_ASSETS.cellBlast, 450 + shakeX * 0.4, 42 + shakeY * 0.4);
        }

        // DESCARGAS ELÉTRICAS RETRO 16-BIT (GOKU TIER 2 & 3)
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

        // DESCARGAS ELÉTRICAS RETRO 16-BIT (CELL TIER 2 & 3)
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
        const clashImg = (useFrameB && DBZ_ASSETS.clashB.complete) ? DBZ_ASSETS.clashB : DBZ_ASSETS.clashA;
        if (clashImg.complete) {
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

  // MODO KAMEHAMEHA DRAGON BALL (GOKU SSJ VS CELL - STRICT AXIS CANVAS)
  gokuFighterPoints = f1Points;
  cellFighterPoints = f2Points;

  const gokuTierName = f1Points >= 100 ? "🔥 GOKU SSJ BLUE" : f1Points >= 50 ? "⚡ GOKU SSJ2" : "GOKU SSJ";
  const cellTierName = f2Points >= 100 ? "🔥 CELL DOURADO" : f2Points >= 50 ? "⚡ CELL 100% POWER" : "PERFECT CELL";

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
      const gokuTransformNote = f1Points >= 100 ? " [MODO SSJ BLUE DIVINO]" : f1Points >= 50 ? " [MODO SSJ2 ATIVO]" : "";
      const cellTransformNote = f2Points >= 100 ? " [MODO CELL DOURADO]" : f2Points >= 50 ? " [MODO 100% POWER]" : "";

      if (lead === 0) {
        commentary.textContent = `⚡ CHOQUE DE KAMEHAMEHA EM EQUILÍBRIO TOTAL! QUEM TREINAR PRIMEIRO DESEMPATA!${gokuTransformNote || cellTransformNote}`;
      } else if (f1Points > f2Points) {
        commentary.textContent = lead >= 15
          ? `💥 ${gokuTierName} ESTÁ ESMAGANDO COM O KAMEHAMEHA DOURADO! ${fighter1.player.name} ABRIU ${lead} PTS DE VANTAGEM!${gokuTransformNote}`
          : `🔥 ${gokuTierName} ESTÁ AVANÇANDO O FEIXE DOURADO! ${fighter1.player.name} LIDERA POR ${lead} PTS!${gokuTransformNote}`;
      } else {
        const adv = f2Points - f1Points;
        commentary.textContent = adv >= 15
          ? `⚡ ${cellTierName} LIBEROU TODO O PODER DO KAMEHAMEHA SOLAR! ${fighter2.player.name} TEM ${adv} PTS DE VANTAGEM!${cellTransformNote}`
          : `✨ ${cellTierName} ESTÁ EMPURRANDO O FEIXE DE ENERGIA! ${fighter2.player.name} AVANÇA COM ${adv} PTS!${cellTransformNote}`;
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
  const list = currentChallengeWorkouts();
  const recent = [...list].sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date)).slice(0, 12);
  byId("activity-count").textContent = `${list.length} REGISTRO${list.length === 1 ? "" : "S"}`;

  if (recent.length === 0) {
    byId("activity-list").innerHTML = '<p class="empty-activity">Nenhum treino por aqui ainda. O primeiro ponto está esperando.</p>';
    return;
  }

  byId("activity-list").innerHTML = recent.map((workout) => {
    const player = playerFor(workout.owner) || { name: "Atleta", short: "A", color: "var(--lime)", textColor: "#000" };
    const isMe = player.id === me.id;
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
  const completedSets = exercise.sets.filter((set) => set.done);
  if (!completedSets.length || !exercise.requiresLoad) return 0;
  return completedSets.reduce((sum, set) => sum + Number(set.load ?? exercise.load ?? 0), 0) / completedSets.length;
}

function exerciseVolume(exercise) {
  if (!exercise.requiresLoad) return 0;
  const oldAverage = Number(exercise.load || 0);
  return exercise.sets.filter((set) => set.done).reduce((sum, set) => {
    return sum + Number(set.load ?? oldAverage) * set.reps * (exercise.loadFactor || 1);
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
          <div class="set-log-list">${Array.from({ length: exercise.sets }, (_, setIndex) => `
            <div class="set-log-row">
              <label class="set-check-label"><input class="set-check" name="done-${index}" type="checkbox" value="${setIndex}" /><span>SÉRIE ${setIndex + 1}</span></label>
              <label class="set-reps-label"><span>${exercise.unit === "s" ? "SEGUNDOS" : "REPS"}</span><input name="reps-${index}-${setIndex}" type="number" min="1" max="${exercise.max}" step="1" value="${exercise.min}" required /></label>
              ${exercise.load === false ? "" : `<label class="set-load-label"><span>KG</span><input name="load-${index}-${setIndex}" type="number" min="0.5" max="500" step="0.5" placeholder="kg" /></label>`}
            </div>`).join("")}</div>
        </article>`).join("")}</div>
      ` : `<p class="custom-plan-empty">Ficha vazia. Adicione seu primeiro exercício pelo catálogo abaixo.</p>`}
      <button class="button button-outline add-exercise-button" type="button" data-add-exercise>+ Adicionar exercício do catálogo</button>
      <details class="exercise-picker" id="exercise-picker" ${exercisePickerPanelOpen ? "open" : ""}><summary>Catálogo de exercícios · Unlicense</summary><label class="form-field"><span>BUSCAR EXERCÍCIO</span><input id="exercise-picker-search" type="search" placeholder="Nome, equipamento ou músculo" autocomplete="off" /></label><div id="exercise-picker-results" class="exercise-picker-results"><p class="exercise-picker-status">Abra este menu para carregar o catálogo.</p></div><p class="exercise-attribution">Catálogo Free Exercise DB · Unlicense · <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">GitHub</a>.</p></details>
      <p class="effort-hint">Volume externo do treino: <strong id="strength-volume">0 kg·reps</strong>. Halteres: kg por mão; o cálculo considera os dois halteres e os lados indicados.</p>`;
    if (exercisePickerPanelOpen) renderExercisePickerResults(byId("exercise-picker-search").value);
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
  return allTrainingPlans().flatMap((plan) => plan.exercises.flatMap((exercise) => {
    const names = exercise.alternatives || [exercise.name];
    const unit = exercise.load === false ? (exercise.unit === "s" ? "s" : "reps") : "kg";
    return names.map((name) => ({ name, label: `Treino ${plan.id} · ${name}`, unit }));
  })).filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

function renderHistorySelect() {
  const select = byId("history-exercise");
  const current = select.value;
  const options = historyExerciseOptions();
  select.innerHTML = options.map((item) => `<option value="${item.name}" data-unit="${item.unit}">${item.label}</option>`).join("");
  select.value = options.some((item) => item.name === current) ? current : options[0].name;
}

function drawHistoryChart() {
  const select = byId("history-exercise");
  const option = select.selectedOptions[0];
  if (!option) return;
  const exerciseName = option.value;
  const unit = option.dataset.unit;
  const activePlayer = playerFor(state.activePlayer);
  const measurements = workoutsFor(activePlayer.id)
    .filter((workout) => workout.category === "strength")
    .flatMap((workout) => (workout.exercises || [])
      .filter((exercise) => exercise.name === exerciseName)
      .map((exercise) => {
        const completedSets = exercise.sets.filter((set) => set.done);
        const reps = completedSets.reduce((sum, set) => sum + set.reps, 0);
        return {
          date: workout.createdAt || `${workout.date}T12:00:00`,
          label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(dateFromString(workout.date)),
          value: unit === "kg" ? exerciseMeanLoad(exercise) : reps,
        };
      }))
    .filter((measurement) => measurement.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  byId("history-profile").textContent = `Perfil: ${activePlayer.name} · ${unit === "kg" ? "carga média em kg" : unit === "s" ? "tempo total em segundos" : "repetições concluídas"}`;
  const canvas = byId("history-chart");
  const empty = byId("history-empty");
  canvas.hidden = measurements.length === 0;
  empty.hidden = measurements.length > 0;
  if (measurements.length === 0) {
    empty.textContent = `Sem histórico para ${exerciseName}. Registre esse exercício em mais sessões para começar a curva.`;
    return;
  }

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

function updateRestTimer() {
  const minutes = String(Math.floor(restSecondsRemaining / 60)).padStart(2, "0");
  const seconds = String(restSecondsRemaining % 60).padStart(2, "0");
  byId("timer-display").textContent = `${minutes}:${seconds}`;
}

function startRestTimer(seconds) {
  clearInterval(restTimerInterval);
  restSecondsRemaining = seconds;
  updateRestTimer();
  restTimerInterval = setInterval(() => {
    restSecondsRemaining -= 1;
    updateRestTimer();
    if (restSecondsRemaining <= 0) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
      if ("vibrate" in navigator) navigator.vibrate([120, 80, 120]);
      showToast("Descanso finalizado.");
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
  const me = getActiveUserPlayer();
  if (!me) {
    openAuthDialog("Identifique qual atleta você é neste duelo.");
    return;
  }
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
  byId("workout-dialog").showModal();
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
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
      dialog.style.display = "block";
    }
  } catch (err) {
    console.warn("showModalSafely fallback:", err);
    try {
      dialog.setAttribute("open", "");
      dialog.style.display = "block";
    } catch (e) {}
  }
}

function closeModalSafely(dialog) {
  if (!dialog) return;
  try {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    }
  } catch (err) {}
  dialog.removeAttribute("open");
  dialog.style.display = "none";
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
  const owner = playerFor(workout.owner);
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

  const configuredPlayers = names.map((name, index) => {
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
byId("workout-fields").addEventListener("click", async (event) => {
  const replaceButton = event.target.closest("[data-pick-exercise]");
  const addButton = event.target.closest("[data-add-exercise]");
  const choiceButton = event.target.closest("[data-catalog-id]");
  const closePicker = event.target.closest("[data-close-exercise-picker]");
  if (replaceButton) await openExercisePicker("replace", Number(replaceButton.dataset.pickExercise));
  else if (addButton) await openExercisePicker("add");
  else if (choiceButton) chooseCatalogExercise(choiceButton.dataset.catalogId);
  else if (closePicker) {
    exercisePickerPanelOpen = false;
    byId("exercise-picker").open = false;
  }
});
byId("history-exercise").addEventListener("change", drawHistoryChart);
window.addEventListener("resize", drawHistoryChart);
document.querySelectorAll("[data-rest-seconds]").forEach((button) => button.addEventListener("click", () => startRestTimer(Number(button.dataset.restSeconds))));
byId("timer-reset").addEventListener("click", resetRestTimer);
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
  const duplicate = workoutsFor(state.activePlayer).some((workout) => workout.date === workoutDate && workout.category === category);
  if (duplicate) {
    byId("form-error").textContent = "Esta modalidade já foi registrada para este perfil nessa data.";
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
  workout.id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  workout.owner = state.activePlayer;
  workout.challengeId = getActiveChallenge().id;
  workout.date = workoutDate;
  workout.createdAt = new Date().toISOString();
  workout.points = workout.basePoints + workout.qualityPoints;
  state.workouts.push(workout);
  if (customPlanToSave) {
    const customIndex = customTrainingPlans.findIndex((plan) => plan.id === customPlanToSave.id);
    if (customIndex >= 0) customTrainingPlans[customIndex] = customPlanToSave;
    else customTrainingPlans.push(customPlanToSave);
    localStorage.setItem(CUSTOM_PLANS_KEY, JSON.stringify(customTrainingPlans));
    activeStrengthPlan = cloneTrainingPlan(customPlanToSave);
  }
  saveState();
  clearWorkoutPhoto();
  try {
    await syncWorkoutToFirebase(workout);
  } catch (error) {
    console.warn("Treino salvo localmente, mas não foi enviado ao Firebase.", error);
  }
  byId("workout-dialog").close();
  workoutForm.reset();
  if (customPlanToSave && byId("template-select")) byId("template-select").value = customPlanToSave.id;
  render();
  showToast(`Treino registrado. +${workout.points} pontos (${workout.basePoints} base + ${workout.qualityPoints} qualidade).`);
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
        const remoteWorkoutsList = val ? Object.values(val) : [];
        const pendingLocal = state.workouts.filter((lw) => !remoteWorkoutsList.some((rw) => rw.id === lw.id) && String(lw.id).startsWith("local-"));
        const syncedRemote = remoteWorkoutsList.map((workout) => ({
          id: workout.id,
          challengeId: activeChallengeId || "challenge-1",
          owner: workout.player_id,
          category: workout.category,
          date: workout.workout_date,
          name: workout.name || MODALITIES[workout.category]?.label || workout.category,
          comments: workout.comments || "",
          photo: workout.photo || null,
          points: workout.points || 0,
          effort: workout.effort,
          duration: workout.duration || 0,
          exercises: workout.exercises,
          qualityPoints: Math.max(0, (workout.points || 0) - (MODALITIES[workout.category]?.basePoints || 0)),
        }));
        state.workouts = [...pendingLocal, ...syncedRemote];
        saveState();
        render();
        const ind = byId("sync-status-indicator");
        if (ind) {
          ind.textContent = "● Google Firebase Ao Vivo";
          ind.style.color = "var(--lime)";
        }
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
    navigator.serviceWorker.register("./sw.js?v=2.7.2").then((reg) => {
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

  container.innerHTML = letters.map((letter) => `
    <div class="builder-session-card" data-session-id="${letter}" style="background:#f4f5ee; border:1px solid #d5d7cd; border-radius:6px; padding:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:8px;">
        <strong style="font-size:13px; color:var(--ink); font-family:var(--display); min-width:60px;">Treino ${letter}</strong>
        <input type="text" class="builder-session-title" value="${defaultTitles[letter] || `Foco do Treino ${letter}`}" placeholder="Foco da sessão (ex: Costas e Bíceps)" style="font-size:12px; padding:4px 8px; border:1px solid #ccc; border-radius:4px; flex:1;" required />
      </div>
      <div class="builder-exercises-list" style="display:grid; gap:6px;">
        <div class="builder-exercise-row" style="display:grid; grid-template-columns: 1fr 60px 60px 60px 24px; gap:6px; align-items:center;">
          <input type="text" class="builder-ex-name" value="Exercício 1" placeholder="Nome" style="font-size:11px; padding:4px;" required />
          <input type="number" class="builder-ex-sets" value="4" min="1" max="10" title="Séries" placeholder="Séries" style="font-size:11px; padding:4px;" required />
          <input type="number" class="builder-ex-min" value="8" min="1" max="50" title="Reps mín" placeholder="Reps mín" style="font-size:11px; padding:4px;" required />
          <input type="number" class="builder-ex-max" value="12" min="1" max="50" title="Reps máx" placeholder="Reps máx" style="font-size:11px; padding:4px;" required />
          <button type="button" class="btn-remove-builder-ex" style="border:0; background:transparent; color:#ef4444; font-weight:700; cursor:pointer;" title="Remover">✕</button>
        </div>
      </div>
      <button type="button" class="button button-outline btn-add-builder-ex" style="margin-top:8px; font-size:10px; height:26px; padding:0 8px;">+ Adicionar Exercício</button>
    </div>
  `).join("");
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
        <input type="text" class="builder-ex-name" placeholder="Nome do exercício" style="font-size:11px; padding:4px;" required />
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

function handleWorkoutPhotoFile(file) {
  if (!file) return;
  if (photoFilename) photoFilename.textContent = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 480;
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
      currentWorkoutPhoto = canvas.toDataURL("image/jpeg", 0.72);
      if (photoPreview) photoPreview.src = currentWorkoutPhoto;
      if (photoPreviewWrap) photoPreviewWrap.style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
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
}

byId("cancel-dialog")?.addEventListener("click", () => clearWorkoutPhoto());
byId("close-dialog")?.addEventListener("click", () => clearWorkoutPhoto());

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
    setTimeout(() => renderHistoryChart(), 50);
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

// EXPOSIÇÃO GLOBAL PARA MANIPULADORES MOBILE E EVENTOS NATIVOS
window.openSetupDialog = openSetupDialog;
window.closeGearMenu = closeGearMenu;
window.toggleGearMenu = toggleGearMenu;
window.showModalSafely = showModalSafely;
window.closeModalSafely = closeModalSafely;

// Capturador de erros para depuração amigável no celular
window.addEventListener("error", (event) => {
  console.error("Global Error:", event.error || event.message);
});