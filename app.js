const STORAGE_KEY = "rep-club-demo-v3";
const PLAYERS_STORAGE_KEY = "rep-club-players-v1";
const PRIZE_STORAGE_KEY = "rep-club-prize-v1";
const PERIOD_STORAGE_KEY = "rep-club-period-v1";
const SCOREBOARD_STYLE_KEY = "rep-club-score-style-v1";
const CHALLENGES_STORAGE_KEY = "rep-club-challenges-v2";
const ACTIVE_CHALLENGE_KEY = "rep-club-active-challenge-v2";
const SUPABASE_URL = "https://clojwloczhmjiivcazjh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zQRh7cNIIcFebCxZ7_vpPA_2ceLdrB4";
var supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
let scoreboardStyle = localStorage.getItem(SCOREBOARD_STYLE_KEY) || "kamehameha";
const TRAINING_PLANS = [
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
];
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
  return [...TRAINING_PLANS, ...customTrainingPlans];
}

function cloneTrainingPlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

function newCustomPlan() {
  return { id: "custom-new", day: "PERSONALIZADO", title: "Meu treino personalizado", exercises: [], isCustom: true };
}

function planForId(planId) {
  if (planId === "custom-new") return newCustomPlan();
  return cloneTrainingPlan(allTrainingPlans().find((plan) => plan.id === planId) || TRAINING_PLANS[0]);
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
let remoteDuelId = localStorage.getItem("rep-club-remote-duel-id");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function remoteWorkoutPayload(workout) {
  return {
    duel_id: remoteDuelId,
    player_id: workout.owner,
    category: workout.category,
    workout_date: workout.date,
    name: workout.name,
    comments: workout.comments || null,
    points: pointsForWorkout(workout),
    effort: workout.effort || null,
    duration: workout.duration || null,
    exercises: workout.exercises || null,
  };
}

async function syncWorkoutToSupabase(workout) {
  if (!supabaseClient || !remoteDuelId || String(workout.id).startsWith("demo-")) return;
  try {
    const payload = remoteWorkoutPayload(workout);
    const { data, error } = await supabaseClient.from("workouts").insert(payload).select().single();
    if (error) {
      console.warn("Erro ao salvar treino no Supabase:", error);
      return;
    }
    if (data?.id) {
      const oldId = workout.id;
      workout.id = data.id;
      const local = state.workouts.find((w) => w.id === oldId);
      if (local) local.id = data.id;
      saveState();
    }
  } catch (err) {
    console.warn("Falha de rede ao sincronizar com Supabase:", err);
  }
}

async function deleteWorkoutFromSupabase(workoutId) {
  if (!supabaseClient || !workoutId || String(workoutId).startsWith("demo-")) return;
  try {
    const { error } = await supabaseClient.from("workouts").delete().eq("id", workoutId);
    if (error) console.warn("Erro ao excluir do Supabase:", error);
  } catch (err) {
    console.warn("Falha ao excluir do Supabase:", err);
  }
}

async function resetDuelInSupabase(duelId) {
  if (!supabaseClient || !duelId) return;
  try {
    const { error } = await supabaseClient.from("workouts").delete().eq("duel_id", duelId);
    if (error) console.warn("Erro ao resetar treinos no Supabase:", error);
  } catch (err) {
    console.warn("Falha ao resetar no Supabase:", err);
  }
}

async function hydrateFromSupabase() {
  if (!supabaseClient) return;
  try {
    let duelQuery = supabaseClient.from("duels").select("*").order("created_at", { ascending: false }).limit(1);
    if (remoteDuelId) duelQuery = supabaseClient.from("duels").select("*").eq("id", remoteDuelId).limit(1);
    const { data: duels, error: duelError } = await duelQuery;
    if (duelError || !duels?.[0]) return;

    const duel = duels[0];
    remoteDuelId = duel.id;
    localStorage.setItem("rep-club-remote-duel-id", remoteDuelId);
    savePlayerConfig([duel.player_one_name, duel.player_two_name]);
    challengePrize = duel.prize || "";
    duelPeriod = { start: duel.period_start, end: duel.period_end };
    localStorage.setItem(PRIZE_STORAGE_KEY, challengePrize);
    localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(duelPeriod));

    const { data: remoteWorkouts, error: workoutsError } = await supabaseClient.from("workouts").select("*").eq("duel_id", remoteDuelId).order("created_at", { ascending: false });
    if (!workoutsError && remoteWorkouts) {
      // Mantenha quaisquer treinos locais que ainda não foram sincronizados
      const pendingLocal = state.workouts.filter((lw) => !remoteWorkouts.some((rw) => rw.id === lw.id) && String(lw.id).startsWith("local-"));
      const syncedRemote = remoteWorkouts.map((workout) => ({
        id: workout.id,
        owner: workout.player_id,
        category: workout.category,
        date: workout.workout_date,
        name: workout.name || MODALITIES[workout.category]?.label || workout.category,
        comments: workout.comments || "",
        points: workout.points || 0,
        effort: workout.effort,
        duration: workout.duration || 0,
        exercises: workout.exercises,
        qualityPoints: Math.max(0, (workout.points || 0) - (MODALITIES[workout.category]?.basePoints || 0)),
      }));

      state.workouts = [...pendingLocal, ...syncedRemote];
    }
    state.activePlayer = PLAYERS[0].id;
    saveState();
    render();
    if (byId("setup-dialog")?.open) byId("setup-dialog").close();
    const ind = byId("sync-status-indicator");
    if (ind) ind.textContent = "● Supabase Sincronizado";
  } catch (error) {
    console.warn("Supabase indisponível; mantendo os dados locais.", error);
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
    const saved = JSON.parse(localStorage.getItem(CHALLENGES_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0 && saved.every((c) => c.id && c.title)) {
      return saved;
    }
  } catch (error) {
    console.warn("Não foi possível ler os desafios salvos.", error);
  }

  const savedPrize = localStorage.getItem(PRIZE_STORAGE_KEY) || "";
  const savedPeriod = duelPeriod || defaultDuelPeriod();
  const savedPlayers = playerConfig || DEFAULT_PLAYERS;

  return [
    {
      id: "challenge-1",
      title: "Duelo 01",
      prize: savedPrize,
      period: savedPeriod,
      players: savedPlayers,
      activePlayer: savedPlayers[0].id,
      createdAt: new Date().toISOString(),
    },
  ];
}

let challenges = loadChallenges();
let activeChallengeId = localStorage.getItem(ACTIVE_CHALLENGE_KEY) || challenges[0].id;
if (!challenges.some((c) => c.id === activeChallengeId)) {
  activeChallengeId = challenges[0].id;
}

function getActiveChallenge() {
  return challenges.find((c) => c.id === activeChallengeId) || challenges[0];
}

function saveChallenges() {
  localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
  localStorage.setItem(ACTIVE_CHALLENGE_KEY, activeChallengeId);
}

function syncActiveChallengeGlobals() {
  const cur = getActiveChallenge();
  PLAYERS = Array.isArray(cur.players) && cur.players.length >= 2 ? cur.players : DEFAULT_PLAYERS;
  challengePrize = cur.prize || "";
  duelPeriod = cur.period || defaultDuelPeriod();
  playerConfig = PLAYERS;
  localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerConfig));
  localStorage.setItem(PRIZE_STORAGE_KEY, challengePrize);
  localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(duelPeriod));
  if (!PLAYERS.some((p) => p.id === state.activePlayer)) {
    state.activePlayer = cur.activePlayer || PLAYERS[0].id;
  }
}

syncActiveChallengeGlobals();

function currentChallengeWorkouts() {
  const cur = getActiveChallenge();
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
  const cur = getActiveChallenge();
  if (miniTitle) {
    miniTitle.textContent = cur.title || "Duelo";
  }
  if (!select) return;
  select.innerHTML = challenges.map((c) => `
    <option value="${c.id}" ${c.id === cur.id ? "selected" : ""}>${escapeHTML(c.title)}</option>
  `).join("");
  select.value = cur.id;
}

function switchChallenge(challengeId) {
  const target = challenges.find((c) => c.id === challengeId);
  if (!target) return;
  activeChallengeId = target.id;
  syncActiveChallengeGlobals();
  saveChallenges();
  saveState();
  render();
  showToast(`Desafio alternado para "${target.title}".`);
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
  const classicView = byId("scoreboard-classic");
  const kamehamehaView = byId("scoreboard-kamehameha");
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
        commentary.textContent = "⚡ CHOQUE DE KAMEHAMEHA EM EQUILÍBRIO TOTAL! QUEM TREINAR PRIMEIRO DESEMPATA!";
      } else if (f1Points > f2Points) {
        commentary.textContent = lead >= 15
          ? `💥 GOKU SSJ ESTÁ ESMAGANDO COM O KAMEHAMEHA DOURADO! ${fighter1.player.name} ABRIU ${lead} PTS DE VANTAGEM!`
          : `🔥 GOKU SSJ ESTÁ AVANÇANDO O FEIXE DOURADO! ${fighter1.player.name} LIDERA POR ${lead} PTS!`;
      } else {
        const adv = f2Points - f1Points;
        commentary.textContent = adv >= 15
          ? `⚡ CELL LIBEROU TODO O PODER DO KAMEHAMEHA SOLAR! ${fighter2.player.name} TEM ${adv} PTS DE VANTAGEM!`
          : `✨ CELL ESTÁ EMPURRANDO O FEIXE DE ENERGIA! ${fighter2.player.name} AVANÇA COM ${adv} PTS!`;
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

function renderTrainingPlan() {
  byId("program-list").innerHTML = allTrainingPlans().map((plan) => `
    <article class="program-card">
      <div class="program-card-meta"><span>${plan.day || "PERSONALIZADO"}</span><span>${plan.id.startsWith("custom-") ? "MINHA FICHA" : `TREINO ${plan.id}`}${plan.id === "C" ? " · LEVE" : ""}</span></div>
      <h3>${plan.title}</h3>
      ${plan.cardioBlock ? `<p class="program-card-cardio">${plan.cardioBlock.label} · ${plan.cardioBlock.min}–${plan.cardioBlock.max} min</p>` : ""}
      <details class="program-details">
        <summary>Ver ${plan.exercises.length} exercícios</summary>
        <ul>${plan.exercises.map((exercise) => `<li><span>${exercise.name}</span><strong>${formatPrescription(exercise)}</strong></li>`).join("")}</ul>
      </details>
      <button class="program-action" type="button" data-start-template="${escapeHTML(plan.id)}">Registrar treino <span>↗</span></button>
    </article>`).join("") + `<article class="program-card custom-plan-card"><div class="program-card-meta"><span>FICHA LIVRE</span><span>DO ZERO</span></div><h3>Monte seu próprio treino.</h3><p class="program-card-cardio">Escolha os movimentos no catálogo e salve a ficha para repetir.</p><button class="program-action" type="button" data-start-template="custom-new">Criar treino <span>↗</span></button></article>`;
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
  if (category === "strength") {
    const selectedId = templateId || byId("template-select")?.value || activeStrengthPlan?.id || "A";
    activeStrengthPlan = planOverride
      ? cloneTrainingPlan(planOverride)
      : planForId(selectedId);
    const plan = activeStrengthPlan;
    const isCustomPlan = plan.id === "custom-new" || plan.id.startsWith("custom-");
    const planOptions = [
      ...TRAINING_PLANS.map((item) => `<option value="${item.id}" ${item.id === plan.id ? "selected" : ""}>Treino ${item.id} · ${item.title}</option>`),
      ...customTrainingPlans.map((item) => `<option value="${escapeHTML(item.id)}" ${item.id === plan.id ? "selected" : ""}>Minha ficha · ${escapeHTML(item.title)}</option>`),
      `<option value="custom-new" ${plan.id === "custom-new" ? "selected" : ""}>Criar treino do zero…</option>`,
    ].join("");
    fields.innerHTML = `
      <label class="form-field"><span>FICHA</span><select id="template-select" name="templateId">${planOptions}</select></label>
      ${isCustomPlan ? `<label class="form-field"><span>NOME DA FICHA</span><input name="customPlanTitle" maxlength="50" value="${escapeHTML(plan.title)}" /></label>` : ""}
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
  renderProfileSelect();
  renderScoreboard();
  renderToday();
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
  const me = playerFor(state.activePlayer);
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

byId("profile-select").addEventListener("change", (event) => {
  state.activePlayer = event.target.value;
  const cur = getActiveChallenge();
  if (cur) cur.activePlayer = state.activePlayer;
  saveChallenges();
  saveState();
  render();
  showToast(`Perfil de ${playerFor(state.activePlayer).name} selecionado.`);
});

function renderSetupPlayers(namesList = null) {
  const container = byId("setup-players-list");
  if (!container) return;
  const list = namesList || PLAYERS.map((p) => p.name);
  if (!list.length) list.push("Jogador 1", "Jogador 2");
  container.innerHTML = list.map((name, index) => {
    const palette = PLAYER_PALETTE[index % PLAYER_PALETTE.length];
    return `
      <div class="setup-player-row" data-index="${index}">
        <span class="setup-player-color" style="background:${palette.color}; color:${palette.text}">${index + 1}</span>
        <input class="setup-player-input" type="text" name="playerNames" value="${escapeHTML(name)}" placeholder="Nome do participante ${index + 1}" maxlength="24" required />
        ${list.length > 2 ? `<button type="button" class="setup-player-remove" data-remove-player="${index}" title="Remover participante">×</button>` : ""}
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

function openSetupDialog(mode = "edit") {
  setupMode = mode;
  const cur = getActiveChallenge();
  const cancelBtn = byId("cancel-setup-dialog");
  const closeBtn = byId("close-setup-dialog");
  const deleteBtn = byId("delete-challenge-btn");
  const error = byId("setup-error");
  if (error) error.textContent = "";

  if (cancelBtn) cancelBtn.style.display = "inline-flex";
  if (closeBtn) closeBtn.style.display = "block";

  if (mode === "create") {
    byId("setup-title").textContent = "Criar novo desafio";
    byId("setup-copy").textContent = "Cadastre o nome, participantes, datas e prêmio da nova disputa.";
    byId("setup-challenge-title").value = `Duelo ${String(challenges.length + 1).padStart(2, "0")}`;
    byId("setup-prize").value = "";
    const defaultPeriod = defaultDuelPeriod();
    byId("setup-period-start").value = defaultPeriod.start;
    byId("setup-period-end").value = defaultPeriod.end;
    renderSetupPlayers(PLAYERS.map((p) => p.name));
    if (deleteBtn) deleteBtn.style.display = "none";
  } else {
    byId("setup-title").textContent = "Configuração do duelo";
    byId("setup-copy").textContent = "Edite o nome, participantes, período do desafio e prêmio.";
    byId("setup-challenge-title").value = cur.title || "Duelo 01";
    byId("setup-prize").value = cur.prize || "";
    byId("setup-period-start").value = cur.period?.start || activeDuelPeriod().start;
    byId("setup-period-end").value = cur.period?.end || activeDuelPeriod().end;
    renderSetupPlayers(PLAYERS.map((p) => p.name));
    if (deleteBtn) deleteBtn.style.display = challenges.length > 1 ? "inline-flex" : "none";
  }

  byId("setup-dialog").showModal();
}

byId("open-setup-btn")?.addEventListener("click", () => openSetupDialog("edit"));
byId("btn-new-challenge")?.addEventListener("click", () => openSetupDialog("create"));
byId("challenge-select")?.addEventListener("change", (event) => switchChallenge(event.target.value));

byId("close-setup-dialog")?.addEventListener("click", () => byId("setup-dialog").close());
byId("cancel-setup-dialog")?.addEventListener("click", () => byId("setup-dialog").close());

byId("btn-style-classic")?.addEventListener("click", () => setScoreboardStyle("classic"));
byId("btn-style-kamehameha")?.addEventListener("click", () => setScoreboardStyle("kamehameha"));

byId("setup-dialog").addEventListener("cancel", (event) => {
  if (!playerConfig) event.preventDefault();
});

byId("delete-challenge-btn")?.addEventListener("click", () => {
  if (challenges.length <= 1) {
    alert("Você precisa manter pelo menos 1 desafio ativo.");
    return;
  }
  const cur = getActiveChallenge();
  if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o desafio "${cur.title}"?\n\nTodos os treinos registrados neste desafio serão removidos.`)) {
    return;
  }
  state.workouts = state.workouts.filter((w) => (w.challengeId || "challenge-1") !== cur.id);
  challenges = challenges.filter((c) => c.id !== cur.id);
  activeChallengeId = challenges[0].id;
  saveChallenges();
  syncActiveChallengeGlobals();
  saveState();
  byId("setup-dialog").close();
  render();
  showToast(`Desafio "${cur.title}" excluído com sucesso.`);
});

byId("reset-current-challenge")?.addEventListener("click", () => {
  const cur = getActiveChallenge();
  const curWorkouts = currentChallengeWorkouts();
  const confirmMsg = curWorkouts.length > 0
    ? `Deseja realmente ZERAR todos os treinos do desafio atual ("${cur.title}")?\n\n${curWorkouts.length} treino(s) registrados serão apagados e o placar voltará ao início.\nOs participantes e as datas serão mantidos.`
    : `O desafio "${cur.title}" não possui treinos registrados no momento. Deseja redefinir o placar?`;

  if (!window.confirm(confirmMsg)) return;

  state.workouts = state.workouts.filter((w) => (w.challengeId || "challenge-1") !== cur.id);
  saveState();
  if (remoteDuelId) {
    resetDuelInSupabase(remoteDuelId);
  }
  render();
  showToast(`Desafio "${cur.title}" foi zerado com sucesso!`);
});

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
  deleteWorkoutFromSupabase(workoutId);
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

  if (setupMode === "create") {
    const newId = `challenge-${Date.now()}`;
    const newChallenge = {
      id: newId,
      title: challengeTitle,
      prize,
      period: { start: periodStart, end: periodEnd },
      players: configuredPlayers,
      activePlayer: configuredPlayers[0].id,
      createdAt: new Date().toISOString(),
    };
    challenges.push(newChallenge);
    activeChallengeId = newId;
    saveChallenges();
    syncActiveChallengeGlobals();
    saveState();
    render();
    byId("setup-dialog").close();
    showToast(`Novo desafio "${challengeTitle}" criado com sucesso!`);
  } else {
    const cur = getActiveChallenge();
    cur.title = challengeTitle;
    cur.prize = prize;
    cur.period = { start: periodStart, end: periodEnd };
    cur.players = configuredPlayers;
    if (!configuredPlayers.some((p) => p.id === cur.activePlayer)) {
      cur.activePlayer = configuredPlayers[0].id;
    }
    saveChallenges();
    syncActiveChallengeGlobals();
    saveState();
    render();
    byId("setup-dialog").close();
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
  try {
    await syncWorkoutToSupabase(workout);
  } catch (error) {
    console.warn("Treino salvo localmente, mas não foi enviado ao Supabase.", error);
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
if (!playerConfig || challengePrize === null || duelPeriod === null) {
  if (playerConfig) {
    byId("setup-title").textContent = duelPeriod === null ? "Definam o período." : "Definam o prêmio.";
    byId("setup-copy").textContent = duelPeriod === null
      ? "Os participantes já estão salvos. Escolham as datas do duelo."
      : "Os participantes já estão salvos. Escolham um prêmio ou deixem o campo em branco.";
    renderSetupPlayers(PLAYERS.map((p) => p.name));
    byId("setup-challenge-title").value = getActiveChallenge().title || "Duelo 01";
    byId("setup-prize").value = challengePrize || "";
  } else {
    renderSetupPlayers(["Matheus", "Rafa"]);
    byId("setup-challenge-title").value = "Duelo 01";
  }
  const setupPeriod = activeDuelPeriod();
  byId("setup-period-start").value = setupPeriod.start;
  byId("setup-period-end").value = setupPeriod.end;
  byId("setup-dialog").showModal();
}
hydrateFromSupabase();

// SINCRONIZAÇÃO EM TEMPO REAL E MULTI-DISPOSITIVOS VIA SUPABASE
function setupSupabaseSync() {
  if (!supabaseClient) return;

  // Canal Realtime para escutar inserções e deleções de outros celulares
  try {
    supabaseClient
      .channel("rep-club-sync-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "workouts" }, (payload) => {
        console.log("Supabase Realtime workout update:", payload);
        hydrateFromSupabase();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "duels" }, () => {
        hydrateFromSupabase();
      })
      .subscribe((status) => {
        const ind = byId("sync-status-indicator");
        if (ind) {
          ind.textContent = status === "SUBSCRIBED" ? "● Supabase Ao Vivo" : "● Supabase Conectado";
          ind.style.color = status === "SUBSCRIBED" ? "var(--lime)" : "#a1a1aa";
        }
      });
  } catch (err) {
    console.warn("Falha ao inicializar Supabase Realtime:", err);
  }

  // Polling automático a cada 15 segundos para garantir paridade entre celulares
  setInterval(() => {
    if (!document.hidden) {
      hydrateFromSupabase();
    }
  }, 15000);

  // Sincroniza ao focar ou alternar de volta ao app no celular
  window.addEventListener("focus", () => hydrateFromSupabase());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) hydrateFromSupabase();
  });
}
setupSupabaseSync();

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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
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