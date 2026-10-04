const SOLO_KEY = "rep-club-solo-workouts-v2";
const soloPlans = {
  A: {
    title: "Costas, Bíceps e Posterior de Coxa · Segunda",
    exercises: [
      { name: "Pulldown na Polia Alta", sets: 4, min: 8, max: 10, factor: 1 },
      { name: "Remada Baixa Sentada no Cabo", sets: 4, min: 8, max: 10, factor: 1 },
      { name: "RDL com Halteres", sets: 4, min: 8, max: 10, factor: 2 },
      { name: "Cadeira Flexora", sets: 3, min: 12, max: 15, factor: 1 },
      { name: "Rosca Martelo Sentado", sets: 3, min: 10, max: 12, factor: 2 },
      { name: "Dead Hang na Barra Fixa", sets: 3, min: 30, max: 40, unit: "s", load: false },
    ],
  },
  B: {
    title: "Peito, Tríceps e Quadríceps · Terça",
    exercises: [
      { name: "Supino Reto com Halteres", sets: 4, min: 8, max: 10, factor: 2 },
      { name: "Supino Vertical na Máquina", sets: 3, min: 10, max: 12, factor: 1 },
      { name: "Leg Press 45º", sets: 4, min: 8, max: 10, factor: 1 },
      { name: "Afundo com Halteres", sets: 3, min: 10, max: 12, factor: 4 },
      { name: "Tríceps Corda na Polia", sets: 3, min: 12, max: 15, factor: 1 },
      { name: "Pallof Press no Cabo", sets: 3, min: 12, max: 12, factor: 1 },
    ],
  },
  C: {
    title: "Leve: Cardio e Core · Quarta",
    cardioBlock: { min: 30, max: 40, label: "Cardio contínuo · esteira, bike ou elíptico" },
    exercises: [
      { name: "Abdominal Infra na Paralela", sets: 3, min: 15, max: 20, load: false },
      { name: "Prancha Abdominal", sets: 3, min: 45, max: 45, unit: "s", load: false },
    ],
  },
  D: {
    title: "Ombros, Costas Superior e Glúteos · Quinta",
    exercises: [
      { name: "Desenvolvimento com Halteres Sentado", sets: 4, min: 8, max: 10, factor: 2 },
      { name: "Elevação Lateral com Halteres", sets: 4, min: 12, max: 15, factor: 2 },
      { name: "Remada Unilateral com Halter (Serrote)", sets: 3, min: 10, max: 12, factor: 2 },
      { name: "Remada Alta na Polia", sets: 3, min: 12, max: 15, factor: 1 },
      { name: "Elevação Pélvica na Máquina", sets: 4, min: 10, max: 12, factor: 1 },
    ],
  },
  E: {
    title: "Leve: Cardio e Prevenção · Sexta",
    cardioBlock: { min: 20, max: 30, label: "Cardio · aquecimento ativo" },
    exercises: [
      { name: "Face Pull na Polia", sets: 3, min: 15, max: 20, factor: 1 },
      { name: "Rotação Externa de Ombro na Polia", sets: 3, min: 15, max: 15, factor: 1 },
      { name: "Encolhimento de Ombros com Halteres", sets: 3, min: 12, max: 15, factor: 2 },
      { name: "Extensão Lombar no Banco (Cadeira Romana)", sets: 3, min: 15, max: 15, load: false },
    ],
  },
};

const soloById = (id) => document.getElementById(id);
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const dateLabel = (value) => new Intl.DateTimeFormat("pt-BR", { day:"2-digit", month:"short", year:"numeric" }).format(new Date(`${value}T12:00:00`)).replace(".", "");
const effortPoints = (effort) => effort <= 3 ? 0 : effort <= 6 ? 1 : 2;

let soloState = [];
try {
  soloState = JSON.parse(localStorage.getItem(SOLO_KEY) || localStorage.getItem("rep-club-solo-workouts-v1") || "[]");
} catch (e) {
  soloState = [];
}
let selectedPlan = "A";

function saveSolo() { localStorage.setItem(SOLO_KEY, JSON.stringify(soloState)); }

function renderPlanNav() {
  soloById("solo-plan-nav").innerHTML = Object.keys(soloPlans).map((key) => `<button class="solo-plan-button ${key === selectedPlan ? "active" : ""}" data-plan="${key}" type="button">Treino ${key}</button>`).join("");
  soloById("solo-plan-title").textContent = soloPlans[selectedPlan].title;
}

function renderActivity() {
  const records = [...soloState].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  soloById("solo-session-count").textContent = `${records.length} REGISTRO${records.length === 1 ? "" : "S"}`;
  soloById("solo-activity").innerHTML = records.length ? records.slice(0,10).map((record) => {
    const volStr = record.volume ? ` · ${Math.round(record.volume).toLocaleString("pt-BR")} kg levantados` : "";
    return `<article class="solo-record"><strong>${record.name}</strong><span>${dateLabel(record.date)} · ${record.categoryLabel} · esforço ${record.effort}/10${volStr}${record.comments ? ` · ${record.comments}` : ""}</span><strong class="record-points">+${record.points} pts</strong><button type="button" class="solo-delete-btn" data-delete-created="${record.createdAt}" title="Excluir treino" aria-label="Excluir treino">✕</button></article>`;
  }).join("") : "<p class='history-empty'>Nenhum treino registrado ainda.</p>";
}

function updateSoloPreview() {
  const form = soloById("solo-form");
  if (!form) return;
  const formData = new FormData(form);
  const plan = soloPlans[selectedPlan];
  let totalVolume = 0;

  plan.exercises.forEach((exercise, index) => {
    const requiresLoad = exercise.load !== false;
    const factor = exercise.factor || 1;
    let completedLoads = [];
    let completedSetsCount = 0;

    for (let set = 0; set < exercise.sets; set++) {
      const isDone = formData.getAll(`done-${index}`).includes(String(set));
      if (isDone) {
        completedSetsCount++;
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

function renderExerciseFields() {
  const plan = soloPlans[selectedPlan];
  const cardioHtml = plan.cardioBlock ? `
    <div class="solo-exercise" style="border-left: 3px solid var(--lime);">
      <div class="solo-exercise-title"><strong>${plan.cardioBlock.label.toUpperCase()}</strong><span>${plan.cardioBlock.min}–${plan.cardioBlock.max} min</span></div>
      <div class="solo-exercise-fields"><label>MINUTOS FEITOS<input name="cardioMinutes" type="number" min="${plan.cardioBlock.min}" max="${plan.cardioBlock.max}" value="${plan.cardioBlock.min}" required /></label></div>
    </div>` : "";

  soloById("solo-fields").innerHTML = `
    ${cardioHtml}
    ${plan.exercises.map((exercise, index) => {
      const isWeight = exercise.load !== false;
      return `
        <article class="solo-exercise">
          <div class="solo-exercise-title">
            <strong>${exercise.name}</strong>
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
                ${isWeight ? `<label>KG<input name="load-${index}-${set}" type="number" min="0" max="400" step="0.5" placeholder="kg" /></label>` : ""}
              </div>
            `).join("")}
          </div>
        </article>
      `;
    }).join("")}
    <div style="padding:10px; border-radius:4px; background:#e9ecde; font-size:10px; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
      <span>VOLUME TOTAL LEVANTADO:</span>
      <strong id="solo-total-volume" style="font-family:var(--display); font-size:16px;">0 kg</strong>
    </div>
    <label class="form-field" style="margin-top:12px;"><span>AVALIAÇÃO DE ESFORÇO · 1 A 10</span><input name="effort" id="solo-effort" type="range" min="1" max="10" value="7" /></label>
  `;

  setTimeout(updateSoloPreview, 50);
}

function renderSportFields(category) {
  const label = category === "bjj" ? "Jiu-jitsu" : "Cardio";
  const target = category === "bjj" ? 60 : 30;
  soloById("solo-fields").innerHTML = `
    <div class="solo-sport">
      <label>MODALIDADE<select name="category"><option value="bjj" ${category === "bjj" ? "selected" : ""}>Jiu-jitsu</option><option value="cardio" ${category === "cardio" ? "selected" : ""}>Cardio</option></select></label>
      <label>DURAÇÃO MIN<input name="duration" type="number" min="10" max="240" value="${target}" required /></label>
    </div>
    <label class="form-field"><span>AVALIAÇÃO DE ESFORÇO · 1 A 10</span><input name="effort" type="range" min="1" max="10" value="7" /></label>
  `;
}

function openSoloDialog() {
  const dialog = soloById("solo-dialog");
  soloById("solo-date").value = todayKey();
  soloById("solo-date").max = todayKey();
  soloById("solo-error").textContent = "";
  renderExerciseFields();
  dialog.showModal();
}

function drawSoloHistory() {
  const exercise = soloById("solo-history-exercise").value;
  const points = soloState.filter(record => record.category === "strength").flatMap(record => {
    const item = (record.exercises || []).find(ex => ex.name === exercise);
    return item && item.meanLoad > 0 ? [{ date: record.date, value: item.meanLoad }] : [];
  }).sort((a,b) => a.date.localeCompare(b.date));

  const canvas = soloById("solo-history-chart");
  const empty = soloById("solo-history-empty");
  if (!canvas) return;
  canvas.hidden = !points.length;
  if (empty) empty.hidden = Boolean(points.length);
  if (!points.length) {
    if (empty) empty.textContent = "Registre este exercício com carga para ver a evolução.";
    return;
  }

  const width = Math.max(260, canvas.getBoundingClientRect().width);
  const height = 230;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const pad = { left: 48, right: 18, top: 18, bottom: 34 };
  const min = Math.max(0, Math.min(...points.map(p => p.value)) * 0.85);
  const max = Math.max(...points.map(p => p.value)) * 1.15 || 1;
  const x = i => points.length === 1 ? width / 2 : pad.left + i / (points.length - 1) * (width - pad.left - pad.right);
  const y = v => pad.top + (max - v) / (max - min) * (height - pad.top - pad.bottom);

  ctx.strokeStyle = "#4664ea";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value)));
  ctx.stroke();

  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(p.value), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#d7fa52";
    ctx.fill();
    ctx.fillStyle = "#777970";
    ctx.font = "10px DM Sans";
    ctx.textAlign = "center";
    ctx.fillText(`${p.value.toFixed(1)}kg`, x(i), y(p.value) - 8);
    ctx.fillText(dateLabel(p.date).slice(0, 5), x(i), height - 12);
  });
}

function populateHistory() {
  const names = [...new Set(Object.values(soloPlans).flatMap(plan => plan.exercises.filter(ex => ex.load !== false).map(ex => ex.name)))];
  const select = soloById("solo-history-exercise");
  if (select) {
    select.innerHTML = names.map(name => `<option value="${name}">${name}</option>`).join("");
    drawSoloHistory();
  }
}

soloById("solo-plan-nav").addEventListener("click", event => {
  const button = event.target.closest("[data-plan]");
  if (button) {
    selectedPlan = button.dataset.plan;
    renderPlanNav();
  }
});
soloById("solo-register").addEventListener("click", openSoloDialog);
soloById("solo-close").addEventListener("click", () => soloById("solo-dialog").close());
soloById("solo-cancel").addEventListener("click", () => soloById("solo-dialog").close());
soloById("solo-fields").addEventListener("input", updateSoloPreview);
soloById("solo-history-exercise").addEventListener("change", drawSoloHistory);
window.addEventListener("resize", drawSoloHistory);

soloById("solo-activity")?.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-delete-created]");
  if (!btn) return;
  const createdAt = btn.dataset.deleteCreated;
  const record = soloState.find((r) => r.createdAt === createdAt);
  if (!record) return;
  if (!window.confirm(`Deseja excluir o treino "${record.name}" (${dateLabel(record.date)})?`)) return;
  soloState = soloState.filter((r) => r.createdAt !== createdAt);
  saveSolo();
  renderActivity();
  populateHistory();
});

document.querySelectorAll(".solo-tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".solo-tab").forEach(item => item.classList.toggle("active", item === tab));
  soloById("solo-workouts").hidden = tab.dataset.tab !== "workouts";
  soloById("solo-history").hidden = tab.dataset.tab !== "history";
  if (tab.dataset.tab === "history") drawSoloHistory();
}));

soloById("solo-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const category = "strength";
  const date = form.get("date");
  if (date > todayKey()) {
    soloById("solo-error").textContent = "A data não pode estar no futuro.";
    return;
  }

  const plan = soloPlans[selectedPlan];
  let totalVolume = 0;
  let totalSetsCompleted = 0;

  const exercises = plan.exercises.map((exercise, index) => {
    const requiresLoad = exercise.load !== false;
    const factor = exercise.factor || 1;
    let completedLoads = [];

    const sets = Array.from({ length: exercise.sets }, (_, setIndex) => {
      const isDone = form.getAll(`done-${index}`).includes(String(setIndex));
      const reps = Number(form.get(`reps-${index}-${setIndex}`) || exercise.min);
      const load = requiresLoad ? Number(form.get(`load-${index}-${setIndex}`) || 0) : 0;
      if (isDone) {
        totalSetsCompleted++;
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

  const effort = Number(form.get("effort") || 7);
  const points = 9 + Math.min(4, Math.round(totalSetsCompleted / plan.exercises.reduce((s, e) => s + e.sets, 0) * 4)) + effortPoints(effort) + 2;

  const record = {
    name: `Treino ${selectedPlan} · ${plan.title.split("·")[0].trim()}`,
    comments: String(form.get("comments") || "").trim(),
    date,
    effort,
    category: "strength",
    categoryLabel: "Musculação",
    exercises,
    volume: totalVolume,
    points,
    createdAt: new Date().toISOString(),
  };

  soloState.push(record);
  saveSolo();
  renderActivity();
  populateHistory();
  soloById("solo-dialog").close();
  event.currentTarget.reset();
});

renderPlanNav();
renderActivity();
populateHistory();
