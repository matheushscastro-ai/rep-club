const SOLO_KEY = "rep-club-solo-workouts-v2";
const PROGRAMS_STORAGE_KEY = "rep-club-training-programs-v2";

const DEFAULT_PROGRAM = {
  id: "program-jiu-cardio",
  name: "Treino Jiu + Cardio",
  structure: "ABCDE",
  sessions: [
    {
      id: "A", day: "SEGUNDA", title: "Costas, Bíceps e Posterior de Coxa", exercises: [
        { name: "Pulldown na Polia Alta", sets: 4, min: 8, max: 10, factor: 1 },
        { name: "Remada Baixa Sentada no Cabo", sets: 4, min: 8, max: 10, factor: 1 },
        { name: "RDL com Halteres", sets: 4, min: 8, max: 10, factor: 2 },
        { name: "Cadeira Flexora", sets: 3, min: 12, max: 15, factor: 1 },
        { name: "Rosca Martelo Sentado", sets: 3, min: 10, max: 12, factor: 2 },
        { name: "Dead Hang na Barra Fixa", sets: 3, min: 30, max: 40, unit: "s", load: false },
      ]
    },
    {
      id: "B", day: "TERÇA", title: "Peito, Tríceps e Quadríceps", exercises: [
        { name: "Supino Reto com Halteres", sets: 4, min: 8, max: 10, factor: 2 },
        { name: "Supino Vertical na Máquina", sets: 3, min: 10, max: 12, factor: 1 },
        { name: "Leg Press 45º", sets: 4, min: 8, max: 10, factor: 1 },
        { name: "Afundo com Halteres", sets: 3, min: 10, max: 12, factor: 4 },
        { name: "Tríceps Corda na Polia", sets: 3, min: 12, max: 15, factor: 1 },
        { name: "Pallof Press no Cabo", sets: 3, min: 12, max: 12, factor: 1 },
      ]
    },
    {
      id: "C", day: "QUARTA", title: "Leve: Cardio e Core",
      cardioBlock: { min: 30, max: 40, label: "Cardio contínuo · esteira, bike ou elíptico" },
      exercises: [
        { name: "Abdominal Infra na Paralela", sets: 3, min: 15, max: 20, load: false },
        { name: "Prancha Abdominal", sets: 3, min: 45, max: 45, unit: "s", load: false },
      ]
    },
    {
      id: "D", day: "QUINTA", title: "Ombros, Costas Superior e Glúteos", exercises: [
        { name: "Desenvolvimento com Halteres Sentado", sets: 4, min: 8, max: 10, factor: 2 },
        { name: "Elevação Lateral com Halteres", sets: 4, min: 12, max: 15, factor: 2 },
        { name: "Remada Unilateral com Halter (Serrote)", sets: 3, min: 10, max: 12, factor: 2 },
        { name: "Remada Alta na Polia", sets: 3, min: 12, max: 15, factor: 1 },
        { name: "Elevação Pélvica na Máquina", sets: 4, min: 10, max: 12, factor: 1 },
      ]
    },
    {
      id: "E", day: "SEXTA", title: "Leve: Cardio e Prevenção",
      cardioBlock: { min: 20, max: 30, label: "Cardio · aquecimento ativo" },
      exercises: [
        { name: "Face Pull na Polia", sets: 3, min: 15, max: 20, factor: 1 },
        { name: "Rotação Externa de Ombro na Polia", sets: 3, min: 15, max: 15, factor: 1 },
        { name: "Encolhimento de Ombros com Halteres", sets: 3, min: 12, max: 15, factor: 2 },
        { name: "Extensão Lombar no Banco (Cadeira Romana)", sets: 3, min: 15, max: 15, load: false },
      ]
    }
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
        { name: "Gato-Vaca em 4 Apoios (Aquecimento)", sets: 2, min: 8, max: 10, unit: "reps", load: false, factor: 1 },
        { name: "Círculos de Quadril na Bola Suíça/Em Pé (Aquecimento)", sets: 2, min: 10, max: 10, unit: "voltas/lado", load: false, factor: 1 },
        { name: "Alongamento Peitoral na Parede/Porta (Aquecimento)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1 },
        { name: "Sentar e Levantar do Banco/Cadeira", sets: 3, min: 10, max: 12, factor: 1 },
        { name: "Elevação Pélvica com as Costas no Banco (Hip Thrust)", sets: 3, min: 10, max: 12, factor: 1 },
        { name: "Remada Baixa no Cabo / Elástico Sentada", sets: 3, min: 12, max: 12, factor: 1 },
        { name: "Respiração Diafragmática com Ativação Transversa", sets: 3, min: 8, max: 10, unit: "ciclos", load: false, factor: 1 },
      ]
    },
    {
      id: "B",
      day: "DIA 2",
      title: "Membros Superiores e Postura (~30-35 min)",
      exercises: [
        { name: "Gato-Vaca em 4 Apoios (Aquecimento)", sets: 2, min: 8, max: 10, unit: "reps", load: false, factor: 1 },
        { name: "Círculos de Quadril na Bola Suíça/Em Pé (Aquecimento)", sets: 2, min: 10, max: 10, unit: "voltas/lado", load: false, factor: 1 },
        { name: "Alongamento Peitoral na Parede/Porta (Aquecimento)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1 },
        { name: "Puxada Aberta na Polia (Pulldown Sentada)", sets: 3, min: 10, max: 12, factor: 1 },
        { name: "Desenvolvimento de Ombros com Halteres Sentada em Banco", sets: 3, min: 10, max: 12, factor: 2 },
        { name: "Flexão de Braços Inclinada na Parede / Barra Alta", sets: 3, min: 8, max: 10, unit: "reps", load: false, factor: 1 },
        { name: "Rosca Martelo Sentada com Halteres", sets: 3, min: 12, max: 12, factor: 2 },
      ]
    },
    {
      id: "C",
      day: "DIA 3",
      title: "Força Geral e Mobilidade de Parto (~30-35 min)",
      exercises: [
        { name: "Gato-Vaca em 4 Apoios (Aquecimento)", sets: 2, min: 8, max: 10, unit: "reps", load: false, factor: 1 },
        { name: "Círculos de Quadril na Bola Suíça/Em Pé (Aquecimento)", sets: 2, min: 10, max: 10, unit: "voltas/lado", load: false, factor: 1 },
        { name: "Alongamento Peitoral na Parede/Porta (Aquecimento)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1 },
        { name: "Agachamento Sumô Livre com Apoio de Mãos", sets: 3, min: 8, max: 10, factor: 1 },
        { name: "Face Pull na Polia / Elástico", sets: 3, min: 12, max: 15, factor: 1 },
        { name: "Extensão de Quadril em 4 Apoios (Glúteo Coice)", sets: 3, min: 10, max: 10, factor: 2 },
        { name: "Alongamento de Glúteo Sentada na Cadeira (Figura 4)", sets: 2, min: 30, max: 30, unit: "s", load: false, factor: 1 },
      ]
    }
  ]
};

const soloById = (id) => document.getElementById(id);
const escapeHTML = (str) => String(str || "").replace(/[&<>'"]/g, (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[tag] || tag));

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dateLabel = (value) => {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)).replace(".", "");
  } catch (e) {
    return value;
  }
};

const effortPoints = (effort) => (effort <= 3 ? 0 : effort <= 6 ? 1 : 2);

function weekStart(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = start.getDay();
  start.setDate(start.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return start;
}

function currentWeekBounds() {
  const start = weekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: toStr(start), end: toStr(end) };
}

// PROGRAMAS DISPONÍVEIS
function loadPrograms() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRAMS_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) {
      if (!saved.some((p) => p.id === DEFAULT_PROGRAM.id)) saved.unshift(DEFAULT_PROGRAM);
      if (!saved.some((p) => p.id === PREGNANCY_PROGRAM.id)) saved.push(PREGNANCY_PROGRAM);
      return saved;
    }
  } catch (e) {}
  return [DEFAULT_PROGRAM, PREGNANCY_PROGRAM];
}

let programsList = loadPrograms();
let currentProgram = programsList[0] || DEFAULT_PROGRAM;
let selectedSessionId = currentProgram.sessions[0]?.id || "A";

// ESTADO DOS TREINOS SOLO
let soloState = [];
try {
  soloState = JSON.parse(localStorage.getItem(SOLO_KEY) || localStorage.getItem("rep-club-solo-workouts-v1") || "[]");
} catch (e) {
  soloState = [];
}

function saveSolo() {
  localStorage.setItem(SOLO_KEY, JSON.stringify(soloState));
}

// FOTO ATUAL DO TREINO SOLO
let soloCurrentPhoto = null;

// ==========================================
// RENDERIZAÇÃO DO PLACAR CLÁSSICO E NÍVEIS
// ==========================================
function renderSoloScoreboard() {
  const { start, end } = currentWeekBounds();
  const weekWorkouts = soloState.filter((r) => r.date >= start && r.date <= end);
  const weekPts = weekWorkouts.reduce((acc, r) => acc + (r.points || 0), 0);
  const weekVolume = weekWorkouts.reduce((acc, r) => acc + (r.volume || 0), 0);

  const goalPts = 60;
  const pct = Math.min(100, Math.round((weekPts / goalPts) * 100));

  // Sequência de dias consecutivos
  const uniqueDates = [...new Set(soloState.map((r) => r.date))].sort().reverse();
  let streak = 0;
  let check = new Date();
  while (true) {
    const key = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, "0")}-${String(check.getDate()).padStart(2, "0")}`;
    if (uniqueDates.includes(key)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      // Se hoje ainda não treinou, checar se treinou ontem
      if (streak === 0 && key === todayKey()) {
        check.setDate(check.getDate() - 1);
        const yKey = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, "0")}-${String(check.getDate()).padStart(2, "0")}`;
        if (uniqueDates.includes(yKey)) {
          streak++;
          check.setDate(check.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  // Nível de poder solo (Transformação)
  let tierName = "🥋 Faixa Branca";
  let leadMsg = "Registre seu primeiro treino da semana para subir de nível!";
  if (weekPts >= 60) {
    tierName = "💥 SSJ Blue · Mestre";
    leadMsg = "🔥 META SEMANAL BATIDA! Você atingiu o ápice da semana!";
  } else if (weekPts >= 40) {
    tierName = "🔥 Super Saiyajin";
    leadMsg = "Ritmo insano! Faltam apenas " + (goalPts - weekPts) + " pts para bater a meta máxima!";
  } else if (weekPts >= 20) {
    tierName = "⚡ Em Ritmo · Focado";
    leadMsg = "Bom aquecimento! Mais " + (goalPts - weekPts) + " pts para atingir a meta semanal.";
  } else if (weekPts > 0) {
    tierName = "🥋 Iniciando Semana";
    leadMsg = "Primeiro passo dado! Continue firme rumo aos 60 pontos.";
  }

  // Dias restantes até domingo
  const today = new Date();
  const sunday = new Date(weekStart());
  sunday.setDate(sunday.getDate() + 6);
  const diffDays = Math.max(0, Math.ceil((sunday - today) / (1000 * 60 * 60 * 24)));

  if (soloById("solo-days-remaining")) soloById("solo-days-remaining").textContent = `FALTAM ${diffDays} DIAS`;
  if (soloById("solo-tier-badge")) soloById("solo-tier-badge").textContent = tierName;
  if (soloById("solo-week-pts")) soloById("solo-week-pts").textContent = String(weekPts).padStart(2, "0");
  if (soloById("solo-week-pct")) soloById("solo-week-pct").textContent = `${pct}%`;
  if (soloById("solo-progress-fill")) soloById("solo-progress-fill").style.width = `${pct}%`;
  if (soloById("solo-lead-message")) soloById("solo-lead-message").textContent = leadMsg;

  if (soloById("solo-streak-count")) soloById("solo-streak-count").textContent = streak;
  if (soloById("solo-week-volume")) soloById("solo-week-volume").textContent = `${Math.round(weekVolume).toLocaleString("pt-BR")} kg`;
  if (soloById("solo-week-workouts")) soloById("solo-week-workouts").textContent = weekWorkouts.length;
}

// ==========================================
// PROGRAMAS & SESSÕES DE TREINO
// ==========================================
function renderProgramSelectors() {
  const select = soloById("solo-program-select");
  if (select) {
    select.innerHTML = programsList.map((p) => `<option value="${p.id}" ${p.id === currentProgram.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("");
  }
  if (soloById("solo-current-program-name")) {
    soloById("solo-current-program-name").textContent = currentProgram.name;
  }
  renderPlanNav();
}

function renderPlanNav() {
  const container = soloById("solo-plan-nav");
  if (!container) return;

  const sessions = currentProgram.sessions || [];
  if (!sessions.some((s) => s.id === selectedSessionId) && sessions.length > 0) {
    selectedSessionId = sessions[0].id;
  }

  container.innerHTML = sessions.map((s) => `
    <button class="solo-plan-button ${s.id === selectedSessionId ? "active" : ""}" data-session-id="${s.id}" type="button">
      Treino ${s.id}
    </button>
  `).join("");

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  if (soloById("solo-plan-title") && activeSession) {
    soloById("solo-plan-title").textContent = `${activeSession.day ? activeSession.day + " · " : ""}${activeSession.title}`;
  }
}

// ==========================================
// FEED DE ATIVIDADES SOLO
// ==========================================
function renderActivity() {
  const records = [...soloState].sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));
  if (soloById("solo-session-count")) {
    soloById("solo-session-count").textContent = `${records.length} REGISTRO${records.length === 1 ? "" : "S"}`;
  }

  const container = soloById("solo-activity");
  if (!container) return;

  if (!records.length) {
    container.innerHTML = "<p class='history-empty' style='padding:16px 0; text-align:center;'>Nenhum treino registrado ainda. Clique em '+ Registrar treino selecionado' para começar!</p>";
    return;
  }

  container.innerHTML = records.slice(0, 15).map((record) => {
    const volStr = record.volume ? ` · ${Math.round(record.volume).toLocaleString("pt-BR")} kg levantados` : "";
    const photoHtml = record.photo ? `<img src="${record.photo}" class="solo-photo-thumb" data-view-photo="${record.photo}" alt="Comprovante do treino" title="Clique para ampliar" />` : "";

    return `
      <article class="solo-record">
        ${photoHtml}
        <div class="solo-record-info">
          <strong>${escapeHTML(record.name)}</strong>
          <span>${dateLabel(record.date)} · ${escapeHTML(record.categoryLabel || "Musculação")} · esforço ${record.effort}/10${volStr}</span>
          ${record.comments ? `<div class="solo-record-comments">💬 ${escapeHTML(record.comments)}</div>` : ""}
        </div>
        <strong class="record-points">+${record.points} pts</strong>
        <button type="button" class="solo-delete-btn" data-delete-created="${record.createdAt}" title="Excluir treino" aria-label="Excluir treino">✕</button>
      </article>
    `;
  }).join("");
}

// ==========================================
// MODAL DE REGISTRO DE TREINO SOLO
// ==========================================
function openSoloDialog() {
  const dialog = soloById("solo-dialog");
  soloById("solo-date").value = todayKey();
  soloById("solo-date").max = todayKey();
  soloById("solo-error").textContent = "";

  // Preencher seletores do modal
  const progSel = soloById("solo-dialog-program-select");
  if (progSel) {
    progSel.innerHTML = programsList.map((p) => `<option value="${p.id}" ${p.id === currentProgram.id ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("");
  }
  updateDialogSessions();

  soloById("solo-category-select").value = "strength";
  renderSoloFields();
  clearSoloPhoto();

  dialog.showModal();
}

function updateDialogSessions() {
  const sessSel = soloById("solo-dialog-session-select");
  if (!sessSel) return;
  const sessions = currentProgram.sessions || [];
  sessSel.innerHTML = sessions.map((s) => `<option value="${s.id}" ${s.id === selectedSessionId ? "selected" : ""}>Treino ${s.id} (${escapeHTML(s.title)})</option>`).join("");
}

function renderSoloFields() {
  const cat = soloById("solo-category-select")?.value || "strength";
  const strengthBlock = soloById("solo-strength-selectors");
  const fieldsContainer = soloById("solo-fields");
  if (!fieldsContainer) return;

  if (cat === "bjj" || cat === "cardio") {
    if (strengthBlock) strengthBlock.style.display = "none";
    const isBjj = cat === "bjj";
    fieldsContainer.innerHTML = `
      <div class="solo-sport" style="margin-top:8px;">
        <label>DURAÇÃO (MINUTOS)
          <input name="duration" id="solo-duration" type="number" min="10" max="240" value="${isBjj ? 60 : 35}" required />
        </label>
        <label>ESCALA DE ESFORÇO (1 A 10)
          <input name="effort" id="solo-effort" type="range" min="1" max="10" value="7" />
        </label>
      </div>
      <div style="font-size:11px; color:#62645c; margin-top:6px; font-weight:600;">
        Pontuação estimada: <strong id="solo-pts-estimate" style="color:var(--ink);">${isBjj ? "20" : "18"} pts</strong>
      </div>
    `;
    const effInput = soloById("solo-effort");
    const durInput = soloById("solo-duration");
    const updateEstimate = () => {
      const dur = Number(durInput?.value || 30);
      const eff = Number(effInput?.value || 7);
      let pts = 0;
      if (isBjj) {
        pts = 11 + Math.min(4, Math.round(dur / 15)) + effortPoints(eff);
      } else {
        pts = 8 + Math.min(4, Math.round(dur / 10)) + effortPoints(eff) + 2;
      }
      if (soloById("solo-pts-estimate")) soloById("solo-pts-estimate").textContent = `${pts} pts`;
    };
    effInput?.addEventListener("input", updateEstimate);
    durInput?.addEventListener("input", updateEstimate);
    return;
  }

  // Musculação
  if (strengthBlock) strengthBlock.style.display = "grid";
  const sessId = soloById("solo-dialog-session-select")?.value || selectedSessionId;
  const session = currentProgram.sessions.find((s) => s.id === sessId) || currentProgram.sessions[0];
  if (!session) return;

  const cardioHtml = session.cardioBlock ? `
    <div class="solo-exercise" style="border-left: 3px solid var(--lime); margin-bottom:8px;">
      <div class="solo-exercise-title">
        <strong>${escapeHTML(session.cardioBlock.label || "CARDIO CONTÍNUO").toUpperCase()}</strong>
        <span>${session.cardioBlock.min}–${session.cardioBlock.max} min</span>
      </div>
      <div class="solo-exercise-fields">
        <label>MINUTOS FEITOS
          <input name="cardioMinutes" type="number" min="${session.cardioBlock.min}" max="${session.cardioBlock.max}" value="${session.cardioBlock.min}" required />
        </label>
      </div>
    </div>
  ` : "";

  fieldsContainer.innerHTML = `
    ${cardioHtml}
    <div class="solo-fields">
      ${session.exercises.map((exercise, index) => {
        const isWeight = exercise.load !== false;
        return `
          <article class="solo-exercise">
            <div class="solo-exercise-title">
              <strong>${escapeHTML(exercise.name)}</strong>
              <span>${exercise.sets} × ${exercise.min}–${exercise.max} ${exercise.unit || "reps"}</span>
            </div>
            <div class="solo-exercise-fields" style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:8px; font-weight:700; color:#85877e;">${isWeight ? `CARGA ${exercise.factor === 2 ? "POR HALTER" : exercise.factor === 4 ? "DOIS HALTERES" : "APARELHO"}` : "PESO CORPORAL"}</span>
              <output id="solo-mean-${index}" style="font-size:9px; font-weight:700; color:#20211d;">MÉDIA: —</output>
            </div>
            <div class="solo-set-list">
              ${Array.from({ length: exercise.sets }, (_, set) => `
                <div class="solo-set-row" style="grid-template-columns: 1fr 65px ${isWeight ? "65px" : ""};">
                  <label><span><input name="done-${index}" type="checkbox" value="${set}" checked /> SÉRIE ${set + 1}</span></label>
                  <label>REPS<input name="reps-${index}-${set}" type="number" min="1" max="${exercise.max * 2}" value="${exercise.min}" required /></label>
                  ${isWeight ? `<label>KG<input name="load-${index}-${set}" type="number" min="0" max="500" step="0.5" placeholder="kg" /></label>` : ""}
                </div>
              `).join("")}
            </div>
          </article>
        `;
      }).join("")}
    </div>
    <div style="padding:10px; border-radius:4px; background:#e9ecde; font-size:10px; font-weight:700; display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
      <span>VOLUME TOTAL LEVANTADO:</span>
      <strong id="solo-total-volume" style="font-family:var(--display); font-size:16px;">0 kg</strong>
    </div>
    <label class="form-field" style="margin-top:10px;">
      <span>AVALIAÇÃO DE ESFORÇO · 1 A 10</span>
      <input name="effort" id="solo-effort" type="range" min="1" max="10" value="7" />
    </label>
  `;

  setTimeout(updateSoloVolumePreview, 50);
}

function updateSoloVolumePreview() {
  const form = soloById("solo-form");
  if (!form) return;
  const cat = soloById("solo-category-select")?.value;
  if (cat !== "strength") return;

  const formData = new FormData(form);
  const sessId = soloById("solo-dialog-session-select")?.value || selectedSessionId;
  const session = currentProgram.sessions.find((s) => s.id === sessId) || currentProgram.sessions[0];
  if (!session) return;

  let totalVolume = 0;
  session.exercises.forEach((exercise, index) => {
    const requiresLoad = exercise.load !== false;
    const factor = exercise.factor || 1;
    let completedLoads = [];

    for (let set = 0; set < exercise.sets; set++) {
      const isDone = formData.getAll(`done-${index}`).includes(String(set));
      if (isDone) {
        const reps = Number(formData.get(`reps-${index}-${set}`) || exercise.min);
        const load = requiresLoad ? Number(formData.get(`load-${index}-${set}`) || 0) : 0;
        if (requiresLoad && load > 0) {
          completedLoads.push(load);
          totalVolume += load * reps * factor;
        }
      }
    }

    const meanEl = soloById(`solo-mean-${index}`);
    if (meanEl) {
      if (!requiresLoad) {
        meanEl.textContent = "PESO CORPORAL";
      } else if (completedLoads.length > 0) {
        const avg = completedLoads.reduce((a, b) => a + b, 0) / completedLoads.length;
        meanEl.textContent = `MÉDIA: ${avg.toFixed(1)} kg`;
      } else {
        meanEl.textContent = "MÉDIA: —";
      }
    }
  });

  const volEl = soloById("solo-total-volume");
  if (volEl) {
    volEl.textContent = `${Math.round(totalVolume).toLocaleString("pt-BR")} kg`;
  }
}

// FOTO DO TREINO
const soloPhotoInput = soloById("solo-photo-input");
const soloPhotoPreviewWrap = soloById("solo-photo-preview-wrap");
const soloPhotoPreview = soloById("solo-photo-preview");
const soloPhotoFilename = soloById("solo-photo-filename");
const soloBtnRemovePhoto = soloById("solo-btn-remove-photo");

soloPhotoInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (soloPhotoFilename) soloPhotoFilename.textContent = file.name;
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
      soloCurrentPhoto = canvas.toDataURL("image/jpeg", 0.72);
      if (soloPhotoPreview) soloPhotoPreview.src = soloCurrentPhoto;
      if (soloPhotoPreviewWrap) soloPhotoPreviewWrap.style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

soloBtnRemovePhoto?.addEventListener("click", () => clearSoloPhoto());

function clearSoloPhoto() {
  soloCurrentPhoto = null;
  if (soloPhotoInput) soloPhotoInput.value = "";
  if (soloPhotoFilename) soloPhotoFilename.textContent = "Nenhuma foto anexada";
  if (soloPhotoPreview) soloPhotoPreview.src = "";
  if (soloPhotoPreviewWrap) soloPhotoPreviewWrap.style.display = "none";
}

// ==========================================
// MODO RAIO-X INDIVIDUAL (SOLO)
// ==========================================
function openSoloRaioXDialog() {
  const { start, end } = currentWeekBounds();
  // Se houver menos de 3 treinos na semana atual, analisa todo o histórico
  const weekRecords = soloState.filter((r) => r.date >= start && r.date <= end);
  const dataset = weekRecords.length >= 2 ? weekRecords : soloState;
  const periodLabel = weekRecords.length >= 2 ? "nesta semana" : "no histórico total";

  const strRecords = dataset.filter((r) => r.category === "strength");
  const bjjRecords = dataset.filter((r) => r.category === "bjj");
  const cardioRecords = dataset.filter((r) => r.category === "cardio");

  const strPts = strRecords.reduce((acc, r) => acc + (r.points || 0), 0);
  const bjjPts = bjjRecords.reduce((acc, r) => acc + (r.points || 0), 0);
  const cardioPts = cardioRecords.reduce((acc, r) => acc + (r.points || 0), 0);
  const totalPts = Math.max(1, strPts + bjjPts + cardioPts);

  // Diagnóstico / Trash Talk Motivacional
  let roast = "";
  if (dataset.length === 0) {
    roast = "😴 O sofá venceu por finalização até agora! Levante, registre seu primeiro treino e comece a pontuar.";
  } else if (strRecords.length > 0 && bjjRecords.length === 0 && cardioRecords.length === 0) {
    roast = "🧱 Você tá virando um bloco de cimento! Só musculação e nada de tatame ou esteira. Cuidado para o quadril não travar na primeira tentativa de amarrar o tênis.";
  } else if (bjjRecords.length > 0 && strRecords.length === 0 && cardioRecords.length === 0) {
    roast = "🥋 Muito rola e pouca carcaça! O jiu tá afiado, mas se não fizer um reforço de ferro para proteger ombro e joelho, a conta chega!";
  } else if (cardioRecords.length > 0 && strRecords.length === 0 && bjjRecords.length === 0) {
    roast = "🏃 Guerreiro do asfalto! Pulmão tá voando, mas cadê a massa muscular e a pegada no quimono? Equilibre com um treino de força!";
  } else if (strRecords.length > 0 && bjjRecords.length > 0 && cardioRecords.length === 0) {
    roast = "🔥 Força bruta e tatame em dia! Só falta 20 minutinhos de cardio regenerativo para virar uma máquina completa.";
  } else if (strRecords.length > 0 && cardioRecords.length > 0 && bjjRecords.length === 0) {
    roast = "💪 Físico de respeito e pulmão calibrado! Se colocar um treino de luta ou mobilidade na rotina, ninguém te segura.";
  } else {
    roast = "🏆 Atleta completo! Equilíbrio impecável entre ferro, luta e cardio " + periodLabel + ". Esse é o padrão Rep Club!";
  }

  const roastEl = soloById("solo-raiox-roast-text");
  if (roastEl) roastEl.textContent = roast;

  const renderRow = (label, icon, color, records, pts) => {
    const pct = Math.round((pts / totalPts) * 100);
    return `
      <div class="raiox-comparison-row">
        <div class="raiox-row-header">
          <span>${icon} ${label}</span>
          <span class="raiox-row-stats">${records.length} sessões · ${pts} pts</span>
        </div>
        <div class="raiox-bar-track">
          <div style="width:${pct}%; background:${color}; height:100%; border-radius:6px; transition:width .3s ease;" title="${pct}%"></div>
        </div>
        <div class="raiox-row-footer">
          <span style="color:${color}; font-weight:800;">${pct}% do seu volume</span>
          <span style="color:#777970; font-size:10px;">${records.length > 0 ? "Ativo" : "Sem registro"}</span>
        </div>
      </div>
    `;
  };

  const listContainer = soloById("solo-raiox-list");
  if (listContainer) {
    listContainer.innerHTML = [
      renderRow("Musculação", "🏋️", "#bad72f", strRecords, strPts),
      renderRow("Jiu-jitsu", "🥋", "#8b5cf6", bjjRecords, bjjPts),
      renderRow("Cardio", "🏃", "#f59e0b", cardioRecords, cardioPts),
      renderRow("Volume Geral", "⚡", "#4664ea", dataset, strPts + bjjPts + cardioPts),
    ].join("");
  }

  soloById("solo-raiox-dialog")?.showModal();
}

// ==========================================
// GRÁFICO HISTÓRICO SOLO
// ==========================================
function drawSoloHistory() {
  const exercise = soloById("solo-history-exercise")?.value;
  if (!exercise) return;

  const points = soloState
    .filter((r) => r.category === "strength")
    .flatMap((r) => {
      const item = (r.exercises || []).find((ex) => ex.name === exercise);
      return item && item.meanLoad > 0 ? [{ date: r.date, value: item.meanLoad }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const canvas = soloById("solo-history-chart");
  const empty = soloById("solo-history-empty");
  if (!canvas) return;

  canvas.hidden = !points.length;
  if (empty) empty.hidden = Boolean(points.length);
  if (!points.length) {
    if (empty) empty.textContent = `Nenhum treino com carga registrado para "${exercise}".`;
    return;
  }

  const width = Math.max(260, canvas.getBoundingClientRect().width || 320);
  const height = 210;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const pad = { left: 45, right: 18, top: 20, bottom: 32 };
  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const min = Math.max(0, minVal * 0.85);
  const max = maxVal === minVal ? maxVal * 1.25 : maxVal * 1.15;

  const x = (i) => (points.length === 1 ? width / 2 : pad.left + (i / (points.length - 1)) * (width - pad.left - pad.right));
  const y = (v) => pad.top + ((max - v) / (max - min)) * (height - pad.top - pad.bottom);

  // Linha
  ctx.strokeStyle = "#4664ea";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value))));
  ctx.stroke();

  // Pontos
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(p.value), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#d7fa52";
    ctx.fill();
    ctx.strokeStyle = "#20211d";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#474940";
    ctx.font = "bold 9px DM Sans";
    ctx.textAlign = "center";
    ctx.fillText(`${p.value.toFixed(1)}kg`, x(i), y(p.value) - 8);
    ctx.fillText(dateLabel(p.date).slice(0, 5), x(i), height - 10);
  });
}

function populateHistorySelect() {
  const allExercises = new Set();
  programsList.forEach((prog) => {
    (prog.sessions || []).forEach((s) => {
      (s.exercises || []).forEach((ex) => {
        if (ex.load !== false) allExercises.add(ex.name);
      });
    });
  });

  const select = soloById("solo-history-exercise");
  if (select) {
    const list = Array.from(allExercises);
    select.innerHTML = list.map((name) => `<option value="${name}">${name}</option>`).join("");
    drawSoloHistory();
  }
}

// ==========================================
// EVENT LISTENERS GERAIS
// ==========================================
soloById("solo-plan-nav")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-session-id]");
  if (!btn) return;
  selectedSessionId = btn.dataset.sessionId;
  renderPlanNav();
});

soloById("solo-program-select")?.addEventListener("change", (e) => {
  const found = programsList.find((p) => p.id === e.target.value);
  if (found) {
    currentProgram = found;
    selectedSessionId = currentProgram.sessions[0]?.id || "A";
    renderProgramSelectors();
  }
});

soloById("solo-register")?.addEventListener("click", openSoloDialog);
soloById("solo-close")?.addEventListener("click", () => soloById("solo-dialog")?.close());
soloById("solo-cancel")?.addEventListener("click", () => soloById("solo-dialog")?.close());

soloById("solo-category-select")?.addEventListener("change", () => renderSoloFields());
soloById("solo-dialog-program-select")?.addEventListener("change", (e) => {
  const found = programsList.find((p) => p.id === e.target.value);
  if (found) {
    currentProgram = found;
    updateDialogSessions();
    renderSoloFields();
  }
});
soloById("solo-dialog-session-select")?.addEventListener("change", () => renderSoloFields());
soloById("solo-fields")?.addEventListener("input", updateSoloVolumePreview);

// RAIO-X SOLO
soloById("btn-open-solo-raiox")?.addEventListener("click", openSoloRaioXDialog);
soloById("solo-close-raiox-dialog")?.addEventListener("click", () => soloById("solo-raiox-dialog")?.close());
soloById("solo-btn-close-raiox")?.addEventListener("click", () => soloById("solo-raiox-dialog")?.close());

// VISUALIZADOR DE FOTO
soloById("solo-activity")?.addEventListener("click", (e) => {
  const thumb = e.target.closest("[data-view-photo]");
  if (thumb) {
    const src = thumb.dataset.viewPhoto;
    const viewer = soloById("solo-photo-viewer-dialog");
    const img = soloById("solo-viewer-img");
    if (viewer && img) {
      img.src = src;
      viewer.showModal();
    }
    return;
  }

  // Excluir treino
  const delBtn = e.target.closest("[data-delete-created]");
  if (delBtn) {
    const createdAt = delBtn.dataset.deleteCreated;
    const record = soloState.find((r) => r.createdAt === createdAt);
    if (!record) return;
    if (!window.confirm(`Deseja excluir o treino "${record.name}" (${dateLabel(record.date)})?`)) return;
    soloState = soloState.filter((r) => r.createdAt !== createdAt);
    saveSolo();
    renderSoloScoreboard();
    renderActivity();
    drawSoloHistory();
  }
});

soloById("solo-close-viewer")?.addEventListener("click", () => soloById("solo-photo-viewer-dialog")?.close());
soloById("solo-photo-viewer-dialog")?.addEventListener("click", (e) => {
  if (e.target === soloById("solo-photo-viewer-dialog")) {
    soloById("solo-photo-viewer-dialog").close();
  }
});

// HISTÓRICO
soloById("solo-history-exercise")?.addEventListener("change", drawSoloHistory);
window.addEventListener("resize", drawSoloHistory);

// TÓPICOS RECOLHÍVEIS (MINIMIZADOS POR PADRÃO)
document.addEventListener("click", (e) => {
  const header = e.target.closest(".collapsible-header");
  if (!header) return;

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

  if (!isCollapsed && section.id === "solo-section-history") {
    setTimeout(drawSoloHistory, 60);
  }
});

// SUBMIT DO FORMULÁRIO DE TREINO SOLO
soloById("solo-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const date = form.get("date");
  if (date > todayKey()) {
    if (soloById("solo-error")) soloById("solo-error").textContent = "A data não pode estar no futuro.";
    return;
  }

  const cat = soloById("solo-category-select")?.value || "strength";
  const customName = String(form.get("name") || "").trim();
  const comments = String(form.get("comments") || "").trim();
  const effort = Number(form.get("effort") || 7);

  let record = null;

  if (cat === "strength") {
    const sessId = soloById("solo-dialog-session-select")?.value || selectedSessionId;
    const session = currentProgram.sessions.find((s) => s.id === sessId) || currentProgram.sessions[0];
    let totalVolume = 0;
    let totalSetsDone = 0;

    const exercises = session.exercises.map((exercise, index) => {
      const requiresLoad = exercise.load !== false;
      const factor = exercise.factor || 1;
      let completedLoads = [];

      const sets = Array.from({ length: exercise.sets }, (_, setIndex) => {
        const isDone = form.getAll(`done-${index}`).includes(String(setIndex));
        const reps = Number(form.get(`reps-${index}-${setIndex}`) || exercise.min);
        const load = requiresLoad ? Number(form.get(`load-${index}-${setIndex}`) || 0) : 0;
        if (isDone) {
          totalSetsDone++;
          if (requiresLoad && load > 0) {
            completedLoads.push(load);
            totalVolume += load * reps * factor;
          }
        }
        return { done: isDone, reps, load };
      });

      const meanLoad = completedLoads.length > 0 ? completedLoads.reduce((a, b) => a + b, 0) / completedLoads.length : 0;
      return {
        name: exercise.name,
        meanLoad,
        factor,
        sets,
      };
    });

    const executionPts = Math.min(4, Math.round((totalSetsDone / session.exercises.reduce((s, e) => s + e.sets, 0)) * 4));
    const points = 9 + executionPts + effortPoints(effort) + 2;

    record = {
      name: customName || `Treino ${session.id} · ${session.title.split("·")[0].trim()}`,
      category: "strength",
      categoryLabel: "Musculação",
      date,
      effort,
      volume: totalVolume,
      points,
      exercises,
      photo: soloCurrentPhoto,
      comments,
      createdAt: new Date().toISOString(),
    };
  } else if (cat === "bjj") {
    const dur = Number(form.get("duration") || 60);
    const durPts = Math.min(4, Math.round(dur / 15));
    const points = 11 + durPts + effortPoints(effort);

    record = {
      name: customName || `Jiu-jitsu (${dur} min)`,
      category: "bjj",
      categoryLabel: "Jiu-jitsu",
      date,
      effort,
      volume: 0,
      points,
      photo: soloCurrentPhoto,
      comments,
      createdAt: new Date().toISOString(),
    };
  } else {
    // Cardio
    const dur = Number(form.get("duration") || 30);
    const durPts = Math.min(4, Math.round(dur / 10));
    const points = 8 + durPts + effortPoints(effort) + 2;

    record = {
      name: customName || `Cardio (${dur} min)`,
      category: "cardio",
      categoryLabel: "Cardio",
      date,
      effort,
      volume: 0,
      points,
      photo: soloCurrentPhoto,
      comments,
      createdAt: new Date().toISOString(),
    };
  }

  soloState.push(record);
  saveSolo();
  renderSoloScoreboard();
  renderActivity();
  populateHistorySelect();

  soloById("solo-dialog")?.close();
  e.currentTarget.reset();
  clearSoloPhoto();
});

// INICIALIZAÇÃO
renderProgramSelectors();
renderSoloScoreboard();
renderActivity();
populateHistorySelect();
