const STORAGE_KEY = "rep-club-demo-v3";
const PLAYERS_STORAGE_KEY = "rep-club-players-v1";
const PRIZE_STORAGE_KEY = "rep-club-prize-v1";
const PERIOD_STORAGE_KEY = "rep-club-period-v1";
const SUPABASE_URL = "https://clojwloczhmjiivcazjh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zQRh7cNIIcFebCxZ7_vpPA_2ceLdrB4";
var supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const DEFAULT_PLAYERS = [
  { id: "player-1", name: "Jogador 1", short: "1", side: "me" },
  { id: "player-2", name: "Jogador 2", short: "2", side: "rival" },
];

function loadPlayerConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYERS_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length === 2 && saved.every((player) => typeof player.name === "string" && player.name.trim())) {
      return saved.map((player, index) => ({
        ...DEFAULT_PLAYERS[index],
        name: player.name.trim(),
        short: player.name.trim().charAt(0).toUpperCase(),
      }));
    }
  } catch (error) {
    console.warn("Não foi possível ler a configuração dos jogadores.", error);
  }
  return null;
}

let playerConfig = loadPlayerConfig();
let PLAYERS = playerConfig || DEFAULT_PLAYERS;
let challengePrize = localStorage.getItem(PRIZE_STORAGE_KEY);
const TRAINING_PLANS = [
  {
    id: "A", day: "SEGUNDA", title: "Puxada & Pegada", exercises: [
      { name: "Pulldown na Polia Alta", sets: 4, min: 8, max: 10 },
      { name: "Remada Baixa Sentada no Cabo com Triângulo", sets: 4, min: 8, max: 10 },
      { name: "Remada Alta com Halteres", sets: 3, min: 10, max: 12 },
      { name: "Rosca Martelo Sentado com Halteres", sets: 3, min: 10, max: 12 },
      { name: "Dead Hang na Barra Fixa", sets: 3, min: 30, max: 40, unit: "s", load: false },
      { name: "Pallof Press no Cabo", sets: 3, min: 12, max: 12, note: "por lado" },
    ],
  },
  {
    id: "B", day: "TERÇA", title: "Empurrada & Estrutura", exercises: [
      { name: "Supino Reto com Halteres", sets: 4, min: 8, max: 10 },
      { name: "Desenvolvimento com Halteres Sentado", sets: 3, min: 8, max: 10 },
      { name: "Supino Vertical na Máquina", sets: 3, min: 10, max: 12 },
      { name: "Elevação Lateral com Halteres", sets: 3, min: 12, max: 15 },
      { name: "Tríceps Corda na Polia", sets: 3, min: 12, max: 15 },
    ],
  },
  {
    id: "C", day: "QUINTA", title: "Pernas, Posterior & Core", exercises: [
      { name: "RDL com Halteres", sets: 4, min: 8, max: 10 },
      { name: "Agachamento Goblet", sets: 4, min: 8, max: 10, alternatives: ["Agachamento Goblet", "Leg Press 45º"] },
      { name: "Elevação Pélvica / Hip Thrust", sets: 4, min: 10, max: 12 },
      { name: "Afundo Búlgaro com Halteres", sets: 3, min: 10, max: 10, note: "por perna" },
      { name: "Cadeira Flexora", sets: 3, min: 12, max: 15 },
      { name: "Abdominal Infra na Paralela", sets: 3, min: 15, max: 20, load: false },
    ],
  },
  {
    id: "D", day: "SEXTA", title: "Potência, Estabilidade & Prevenção", exercises: [
      { name: "Kettlebell Swing", sets: 4, min: 15, max: 20 },
      { name: "Remada Unilateral com Halter (Serrote)", sets: 3, min: 10, max: 12 },
      { name: "Encolhimento de Ombros com Halteres", sets: 3, min: 12, max: 15 },
      { name: "Face Pull na Polia", sets: 3, min: 15, max: 20 },
      { name: "Rotação Externa de Ombro na Polia", sets: 3, min: 15, max: 15 },
      { name: "Prancha com Toque no Ombro", sets: 3, min: 45, max: 45, unit: "s", load: false },
    ],
  },
];
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
    sets: repsByExercise[index].map((reps) => ({ done: true, reps })),
    load: exercise.load === false ? 0 : loads[index],
  }));
  const trainingVolume = exercises.reduce((total, exercise) => total + exerciseVolume(exercise), 0);
  const effortPoints = effortBonus(MODALITIES.strength.effortMax, effort);
  const executionPoints = 4;
  const qualityPoints = executionPoints + effortPoints + progressionPoints;

  return {
    id,
    owner: "player-1",
    category: "strength",
    templateId: "A",
    name: "Treino A · Puxada & Pegada",
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
      createDemoStrengthWorkout("demo-m-a-1", shiftDate(-4), 5, [35, 40, 12, 10, 0, 15], [[9, 9, 8, 8], [10, 9, 8, 8], [11, 10, 10], [11, 10, 10], [35, 35, 30], [12, 12, 12]], 2),
      createDemoStrengthWorkout("demo-m-a-2", shiftDate(-2), 8, [37.5, 42.5, 14, 11, 0, 17.5], [[10, 10, 9, 8], [10, 10, 9, 9], [12, 11, 10], [12, 11, 10], [40, 40, 35], [12, 12, 12]], 2),
      { id: "demo-m-2", owner: "player-1", category: "bjj", name: "Jiu-jitsu", points: 19, basePoints: 11, qualityPoints: 8, duration: 60, effort: 6, date: shiftDate(-4) },
      { id: "demo-m-3", owner: "player-1", category: "cardio", name: "Cardio", points: 18, basePoints: 8, qualityPoints: 10, duration: 35, effort: 7, date: shiftDate(-6) },
      { id: "demo-r-1", owner: "player-2", category: "bjj", name: "Jiu-jitsu", points: 22, basePoints: 11, qualityPoints: 11, duration: 70, effort: 10, date: shiftDate(-1) },
      { id: "demo-r-2", owner: "player-2", category: "strength", templateId: "B", name: "Treino B · Empurrada & Estrutura", points: 16, basePoints: 9, qualityPoints: 7, effort: 5, duration: 60, date: shiftDate(-3) },
      { id: "demo-r-3", owner: "player-2", category: "cardio", name: "Cardio", points: 15, basePoints: 8, qualityPoints: 7, duration: 25, effort: 6, date: shiftDate(-5) },
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
  if (!supabaseClient || !remoteDuelId || workout.id.startsWith("demo-")) return;
  const { error } = await supabaseClient.from("workouts").insert(remoteWorkoutPayload(workout));
  if (error) throw error;
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
      state.workouts = remoteWorkouts.map((workout) => ({
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
    }
    state.activePlayer = PLAYERS[0].id;
    saveState();
    render();
    if (byId("setup-dialog").open) byId("setup-dialog").close();
  } catch (error) {
    console.warn("Supabase indisponível; mantendo os dados locais.", error);
  }
}

function savePlayerConfig(names) {
  PLAYERS = names.map((name, index) => ({
    ...DEFAULT_PLAYERS[index],
    name,
    short: name.charAt(0).toUpperCase(),
  }));
  playerConfig = PLAYERS.map(({ id, name }) => ({ id, name }));
  localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerConfig));
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
  return state.workouts.filter((workout) => workout.owner === playerId);
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
  select.innerHTML = PLAYERS.map((player) => `<option value="${player.id}">${player.name}${player.id === state.activePlayer ? " (você)" : ""}</option>`).join("");
  select.value = state.activePlayer;
}

function renderScoreboard() {
  const me = playerFor(state.activePlayer);
  const rival = PLAYERS.find((player) => player.id !== state.activePlayer);
  const mePoints = totalPoints(me.id);
  const rivalPoints = totalPoints(rival.id);
  const total = Math.max(1, mePoints + rivalPoints);
  const lead = mePoints - rivalPoints;

  byId("you-name").textContent = me.name;
  byId("you-avatar").textContent = me.short;
  byId("rival-name").textContent = rival.name;
  byId("rival-avatar").textContent = rival.short;
  byId("you-score").textContent = String(mePoints).padStart(2, "0");
  byId("rival-score").textContent = String(rivalPoints).padStart(2, "0");
  byId("score-track-me").style.width = `${(mePoints / total) * 100}%`;
  byId("score-track-rival").style.flex = `${rivalPoints}`;
  byId("chart-you-name").textContent = me.name;
  byId("chart-rival-name").textContent = rival.name;
  byId("prize-display").textContent = challengePrize || "Não definido";
  const period = activeDuelPeriod();
  const periodLabel = `${formatPeriodDate(period.start)} – ${formatPeriodDate(period.end)}`;
  byId("period-display").textContent = periodLabel;
  byId("period-range-intro").textContent = periodLabel;

  if (lead > 0) {
    byId("score-message").textContent = `${me.name} na frente por ${lead} ponto${lead === 1 ? "" : "s"}`;
    byId("weekly-lead").textContent = `Você está na frente por ${lead} ponto${lead === 1 ? "" : "s"}.`;
  } else if (lead < 0) {
    byId("score-message").textContent = `${rival.name} na frente por ${Math.abs(lead)} ponto${Math.abs(lead) === 1 ? "" : "s"}`;
    byId("weekly-lead").textContent = `Faltam ${Math.abs(lead)} ponto${Math.abs(lead) === 1 ? "" : "s"} para buscar a liderança.`;
  } else {
    byId("score-message").textContent = "Empate. O próximo treino desempata.";
    byId("weekly-lead").textContent = "Empate. O próximo treino desempata.";
  }

  const outcome = lead === 0 ? "tie" : lead > 0 ? "win" : "loss";
  const winner = lead >= 0 ? me : rival;
  const loser = lead >= 0 ? rival : me;
  byId("loser-roast").textContent = VISIT_BANTER[outcome]
    .replaceAll("{me}", me.name)
    .replaceAll("{rival}", rival.name)
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
  const me = playerFor(state.activePlayer);
  const recent = [...state.workouts].sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date)).slice(0, 6);
  byId("activity-count").textContent = `${state.workouts.length} REGISTRO${state.workouts.length === 1 ? "" : "S"}`;

  if (recent.length === 0) {
    byId("activity-list").innerHTML = '<p class="empty-activity">Nenhum treino por aqui ainda. O primeiro ponto está esperando.</p>';
    return;
  }

  byId("activity-list").innerHTML = recent.map((workout) => {
    const player = playerFor(workout.owner);
    const isMe = player.id === me.id;
    const completedSets = workout.exercises?.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
    const plannedSets = workout.exercises?.reduce((sum, exercise) => sum + exercise.plannedSets, 0);
    const details = workout.category === "strength"
      ? `${workout.exercises ? `${completedSets}/${plannedSets} séries` : "Treino demonstrativo"} · esforço ${workout.effort ?? "-"}/10`
      : `${workout.duration} min · esforço ${workout.effort ?? workout.rpe ?? "-"}/10`;
    const comment = workout.comments ? `<span class="activity-comment">${escapeHTML(workout.comments)}</span>` : "";
    return `<article class="activity-row"><span class="activity-avatar ${isMe ? "me" : "rival"}">${escapeHTML(player.short)}</span><span class="activity-detail"><strong>${escapeHTML(player.name)} · ${escapeHTML(workout.name)}</strong><span>${details}${isMe ? " · você" : ""}</span>${comment}</span><span class="activity-date">${formatShortDate(workout.date)}</span><strong class="activity-points">+${pointsForWorkout(workout)} pts</strong></article>`;
  }).join("");
}

function renderWeekChart() {
  const me = playerFor(state.activePlayer);
  const rival = PLAYERS.find((player) => player.id !== state.activePlayer);
  const period = activeDuelPeriod();
  const start = dateFromString(period.start);
  const todayKey = localDate();
  const mePeriod = duelWorkouts(me.id);
  const rivalPeriod = duelWorkouts(rival.id);
  const dayCount = Math.round((dateFromString(period.end) - start) / 86400000) + 1;
  const dailyPoints = (records, dateKey) => records
    .filter((workout) => workout.date === dateKey)
    .reduce((sum, workout) => sum + pointsForWorkout(workout), 0);

  byId("week-chart").style.setProperty("--chart-days", dayCount);
  byId("week-chart").innerHTML = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = localDate(date);
    const day = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "").toUpperCase();
    const dateLabel = `${day} ${String(date.getDate()).padStart(2, "0")}`;
    const meScore = dailyPoints(mePeriod, key);
    const rivalScore = dailyPoints(rivalPeriod, key);
    const meHeight = meScore === 0 ? 0 : Math.max(4, Math.min(78, (meScore / 66) * 78));
    const rivalHeight = rivalScore === 0 ? 0 : Math.max(4, Math.min(78, (rivalScore / 66) * 78));
    const fullDate = formatPeriodDate(key);
    return `<div class="chart-day"><div class="chart-bars"><span class="chart-bar me" data-points="${meScore}" style="height:${meHeight}px" title="${fullDate}: ${meScore} pts de ${me.name}"></span><span class="chart-bar rival" data-points="${rivalScore}" style="height:${rivalHeight}px" title="${fullDate}: ${rivalScore} pts de ${rival.name}"></span></div><span class="chart-label ${key === todayKey ? "today" : ""}">${dateLabel}</span></div>`;
  }).join("");

  byId("modality-breakdown").innerHTML = `
    <div class="modality-row modality-heading"><span>MODALIDADE</span><span>${me.name}</span><span>${rival.name}</span></div>
    ${Object.entries(MODALITIES).map(([category, modality]) => {
      const meSessions = mePeriod.filter((workout) => workout.category === category);
      const rivalSessions = rivalPeriod.filter((workout) => workout.category === category);
      const mePoints = meSessions.reduce((sum, workout) => sum + pointsForWorkout(workout), 0);
      const rivalPoints = rivalSessions.reduce((sum, workout) => sum + pointsForWorkout(workout), 0);
      return `<div class="modality-row"><span>${modality.label}</span><span class="modality-player"><strong>${meSessions.length} treino${meSessions.length === 1 ? "" : "s"}</strong>${mePoints} pts</span><span class="modality-player"><strong>${rivalSessions.length} treino${rivalSessions.length === 1 ? "" : "s"}</strong>${rivalPoints} pts</span></div>`;
    }).join("")}`;

  byId("week-summary-number").textContent = String(mePeriod.length);
  byId("streak-number").textContent = String(currentStreak(me.id));
}

function formatPrescription(exercise) {
  const range = exercise.min === exercise.max ? String(exercise.min) : `${exercise.min}–${exercise.max}`;
  const unit = exercise.unit === "s" ? "s" : "reps";
  return `${exercise.sets} × ${range} ${unit}${exercise.note ? ` ${exercise.note}` : ""}`;
}

function renderTrainingPlan() {
  byId("program-list").innerHTML = TRAINING_PLANS.map((plan) => `
    <article class="program-card">
      <div class="program-card-meta"><span>${plan.day}</span><span>TREINO ${plan.id}${plan.id === "C" ? " · FORTE" : ""}</span></div>
      <h3>${plan.title}</h3>
      <details class="program-details">
        <summary>Ver ${plan.exercises.length} exercícios</summary>
        <ul>${plan.exercises.map((exercise) => `<li><span>${exercise.name}</span><strong>${formatPrescription(exercise)}</strong></li>`).join("")}</ul>
      </details>
      <button class="program-action" type="button" data-start-template="${plan.id}">Registrar treino <span>↗</span></button>
    </article>`).join("");
}

function readExerciseLogs(formData, plan) {
  return plan.exercises.map((exercise, index) => ({
    name: formData.get(`variation-${index}`) || exercise.name,
    plannedSets: exercise.sets,
    minReps: exercise.min,
    maxReps: exercise.max,
    requiresLoad: exercise.load !== false,
    sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
      done: formData.getAll(`done-${index}`).includes(String(setIndex)),
      reps: Number(formData.get(`reps-${index}-${setIndex}`) || 0),
    })),
    load: exercise.load === false ? 0 : Number(formData.get(`load-${index}`) || 0),
  }));
}

function exerciseVolume(exercise) {
  const completedReps = exercise.sets.filter((set) => set.done).reduce((sum, set) => sum + set.reps, 0);
  return completedReps * (exercise.load || 1);
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
  const executionPoints = Math.round((effectiveSets / plannedSets) * 4);
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

function renderWorkoutFields(templateId = null) {
  const category = byId("workout-category").value;
  const fields = byId("workout-fields");
  if (category === "strength") {
    const selectedId = templateId || byId("template-select")?.value || "A";
    const plan = TRAINING_PLANS.find((item) => item.id === selectedId) || TRAINING_PLANS[0];
    fields.innerHTML = `
      <label class="form-field"><span>TREINO DO PROGRAMA</span><select id="template-select" name="templateId">${TRAINING_PLANS.map((item) => `<option value="${item.id}" ${item.id === plan.id ? "selected" : ""}>Treino ${item.id} · ${item.title}</option>`).join("")}</select></label>
      <p class="effort-hint log-instruction">Marque cada série concluída e registre as reps. Halteres: kg por mão; máquinas: use o valor indicado.</p>
      <div class="exercise-log-list">${plan.exercises.map((exercise, index) => `
        <article class="exercise-log">
          <div class="exercise-log-heading"><strong>${exercise.name}</strong><span>${formatPrescription(exercise)}</span></div>
          ${exercise.alternatives ? `<label class="exercise-variation"><span>VARIAÇÃO</span><select name="variation-${index}">${exercise.alternatives.map((alternative) => `<option value="${alternative}">${alternative}</option>`).join("")}</select></label>` : ""}
          <div class="exercise-log-fields">
            ${exercise.load === false ? `<span class="bodyweight-note">PESO CORPORAL</span>` : `<label><span>CARGA MÉDIA KG</span><input name="load-${index}" type="number" min="0.5" max="500" step="0.5" placeholder="kg" /></label>`}
          </div>
          <div class="set-log-list">${Array.from({ length: exercise.sets }, (_, setIndex) => `
            <div class="set-log-row">
              <label class="set-check-label"><input class="set-check" name="done-${index}" type="checkbox" value="${setIndex}" /><span>SÉRIE ${setIndex + 1}</span></label>
              <label class="set-reps-label"><span>${exercise.unit === "s" ? "SEGUNDOS" : "REPS"}</span><input name="reps-${index}-${setIndex}" type="number" min="1" max="${exercise.max}" step="1" value="${exercise.min}" required /></label>
            </div>`).join("")}</div>
        </article>`).join("")}</div>
      <p class="effort-hint">Halteres: kg por mão; máquinas: use o valor indicado e mantenha o critério.</p>`;
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
    const plan = TRAINING_PLANS.find((item) => item.id === formData.get("templateId")) || TRAINING_PLANS[0];
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
}

function historyExerciseOptions() {
  const seen = new Set();
  return TRAINING_PLANS.flatMap((plan) => plan.exercises.flatMap((exercise) => {
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
          value: unit === "kg" ? exercise.load : reps,
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
  saveState();
  render();
  showToast(`Perfil de ${playerFor(state.activePlayer).name} selecionado.`);
});

byId("setup-dialog").addEventListener("cancel", (event) => event.preventDefault());
byId("setup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const names = [String(form.get("playerOne") || "").trim(), String(form.get("playerTwo") || "").trim()];
  const periodStart = String(form.get("periodStart") || "");
  const periodEnd = String(form.get("periodEnd") || "");
  const error = byId("setup-error");
  if (!names[0] || !names[1]) {
    error.textContent = "Preencha os dois nomes para continuar.";
    return;
  }
  if (names[0].toLocaleLowerCase("pt-BR") === names[1].toLocaleLowerCase("pt-BR")) {
    error.textContent = "Os dois nomes precisam ser diferentes.";
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodStart) || !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd) || periodStart > periodEnd) {
    error.textContent = "Informe um período válido: a data de início precisa ser anterior ou igual à data final.";
    return;
  }

  savePlayerConfig(names);
  challengePrize = String(form.get("prize") || "").trim();
  localStorage.setItem(PRIZE_STORAGE_KEY, challengePrize);
  duelPeriod = { start: periodStart, end: periodEnd };
  localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(duelPeriod));
  if (supabaseClient) {
    const { data: duel, error: duelError } = await supabaseClient.from("duels").insert({
      player_one_name: names[0],
      player_two_name: names[1],
      prize: challengePrize || null,
      period_start: periodStart,
      period_end: periodEnd,
    }).select().single();
    if (!duelError && duel) {
      remoteDuelId = duel.id;
      localStorage.setItem("rep-club-remote-duel-id", remoteDuelId);
    } else if (duelError) {
      console.warn("Não foi possível criar o duelo remoto; o modo local continua disponível.", duelError);
    }
  }
  state.activePlayer = PLAYERS[0].id;
  saveState();
  render();
  byId("setup-dialog").close();
});

byId("open-workout").addEventListener("click", () => openWorkoutDialog());
byId("close-dialog").addEventListener("click", () => byId("workout-dialog").close());
byId("cancel-dialog").addEventListener("click", () => byId("workout-dialog").close());
byId("workout-category").addEventListener("change", () => renderWorkoutFields());
byId("workout-date").addEventListener("input", updatePointsPreview);
byId("workout-date").addEventListener("change", updatePointsPreview);
byId("workout-fields").addEventListener("input", (event) => {
  if (event.target.id === "effort-input") updateEffortLabel();
  updatePointsPreview();
});
byId("workout-fields").addEventListener("change", (event) => {
  if (event.target.id === "template-select") renderWorkoutFields(event.target.value);
  else {
    if (event.target.matches(".set-check")) {
      event.target.closest(".set-check-label").classList.toggle("done", event.target.checked);
      if (event.target.checked) startRestTimer(60);
    }
    updatePointsPreview();
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
  const form = new FormData(event.currentTarget);
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
  if (category === "strength") {
    const plan = TRAINING_PLANS.find((item) => item.id === form.get("templateId"));
    const exercises = readExerciseLogs(form, plan);
    const completedSets = exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
    if (completedSets < 1 || exercises.some((exercise) => exercise.sets.some((set) => set.done && (set.reps < 1 || set.reps > exercise.maxReps)) || (exercise.requiresLoad && exercise.sets.some((set) => set.done) && exercise.load < 0.5))) {
      byId("form-error").textContent = "Registre séries, reps e cargas dentro dos limites da ficha.";
      return;
    }
    const effort = Number(form.get("effort"));
    const previous = previousStrengthWorkout(state.activePlayer, plan.id, workoutDate);
    const quality = strengthQuality(exercises, effort, previous);
    const volume = exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
    workout = {
      category,
      templateId: plan.id,
      name: `Treino ${plan.id} · ${plan.title}`,
      exercises,
      effort,
      basePoints: MODALITIES.strength.basePoints,
      trainingVolume: volume,
      duration: 0,
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
  workout.date = workoutDate;
  workout.createdAt = new Date().toISOString();
  workout.points = workout.basePoints + workout.qualityPoints;
  state.workouts.push(workout);
  saveState();
  try {
    await syncWorkoutToSupabase(workout);
  } catch (error) {
    console.warn("Treino salvo localmente, mas não foi enviado ao Supabase.", error);
  }
  byId("workout-dialog").close();
  event.currentTarget.reset();
  render();
  showToast(`Treino registrado. +${workout.points} pontos (${workout.basePoints} base + ${workout.qualityPoints} qualidade).`);
});

byId("reset-demo").addEventListener("click", () => {
  if (!window.confirm("Apagar os registros locais e restaurar os dados da demonstração?")) return;
  state = createDemoState();
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
      ? "Os nomes já estão salvos. Escolham as datas do duelo."
      : "Os nomes já estão salvos. Escolham um prêmio ou deixem o campo em branco.";
    byId("setup-form").querySelector('[name="playerOne"]').value = PLAYERS[0].name;
    byId("setup-form").querySelector('[name="playerTwo"]').value = PLAYERS[1].name;
    byId("setup-form").querySelector('[name="prize"]').value = challengePrize || "";
  }
  const setupPeriod = activeDuelPeriod();
  byId("setup-form").querySelector('[name="periodStart"]').value = setupPeriod.start;
  byId("setup-form").querySelector('[name="periodEnd"]').value = setupPeriod.end;
  byId("setup-dialog").showModal();
}
hydrateFromSupabase();