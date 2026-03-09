// js/professor.js - Lógica do professor com Firebase

let professorAtual = null;
let eletivaSelecionada = null;

document.addEventListener("DOMContentLoaded", async function () {
  console.log("👨‍🏫 Inicializando página do professor...");

  carregarTheme();

  // Carregar professor selecionado
  const profStorage = localStorage.getItem("professor_atual");
  if (!profStorage) {
    window.location.href = "selecionar-professor.html";
    return;
  }

  professorAtual = JSON.parse(profStorage);

  // Carregar estado do localStorage primeiro
  if (typeof carregarEstado === "function") {
    carregarEstado();
  }

  // Sincronizar com Firebase
  await FirebaseService.sincronizarDadosIniciais();

  // Atualizar interface
  document.getElementById("userName").textContent = professorAtual.nome;
  document.getElementById("userRole").textContent = "Professor";
  document.getElementById("professorInfoHeader").innerHTML =
    `<span>${professorAtual.nome}</span>`;

  if (typeof atualizarIndicadorSemestre === "function") {
    atualizarIndicadorSemestre();
  }

  // Carregar eletivas do professor
  carregarEletivasProfessor();
  carregarSelectHistorico();

  // Setar data atual
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataAula").value = hoje;
});

// ==================== CARREGAR ELETIVAS ====================

function carregarEletivasProfessor() {
  const container = document.getElementById("professorEletivasCards");

  const eletivas = state.eletivas.filter(
    (e) => e.professorId === professorAtual.id,
  );

  if (eletivas.length === 0) {
    container.innerHTML =
      '<p class="empty-state">Nenhuma eletiva encontrada</p>';
    return;
  }

  container.innerHTML = "";

  eletivas.forEach((eletiva) => {
    const matriculas = state.matriculas.filter(
      (m) => m.eletivaId === eletiva.id,
    ).length;

    const card = document.createElement("div");
    card.className = "eletiva-card";
    card.onclick = () => selecionarEletiva(eletiva.id);
    card.innerHTML = `
            <h3>${eletiva.codigo} - ${eletiva.nome}</h3>
            <p><i class="fas fa-clock"></i> ${eletiva.horario.diaSemana} ${eletiva.horario.codigoTempo}</p>
            <p><i class="fas fa-users"></i> ${matriculas}/${eletiva.vagas} alunos</p>
            <p><i class="fas fa-tag"></i> ${eletiva.tipo} ${eletiva.turmaOrigem ? "- " + eletiva.turmaOrigem : ""}</p>
        `;
    container.appendChild(card);
  });
}

// ==================== SELEÇÃO DE ELETIVA ====================

function selecionarEletiva(eletivaId) {
  eletivaSelecionada = eletivaId;

  document
    .querySelectorAll(".eletiva-card")
    .forEach((c) => c.classList.remove("selected"));
  event.currentTarget.classList.add("selected");

  document.getElementById("acoesEletiva").style.display = "flex";
}

// ==================== REGISTRO DE FREQUÊNCIA ====================

function abrirRegistroFrequencia() {
  if (!eletivaSelecionada) return;

  document.getElementById("modalFrequencia").classList.add("active");
  carregarAlunosParaChamada();
}

function carregarAlunosParaChamada() {
  const matriculas = state.matriculas.filter(
    (m) => m.eletivaId === eletivaSelecionada,
  );
  const alunos = state.alunos.filter((a) =>
    matriculas.some((m) => m.alunoId === a.id),
  );

  const container = document.getElementById("listaAlunosChamada");
  container.innerHTML = "";

  alunos.forEach((aluno) => {
    const div = document.createElement("div");
    div.className = "aluno-chamada-item";
    div.innerHTML = `
            <label class="toggle-switch">
                <input type="checkbox" id="aluno_${aluno.id}" value="${aluno.codigoSige}" checked>
                <span class="toggle-slider"></span>
            </label>
            <div class="aluno-info">
                <strong>${aluno.codigoSige}</strong> - ${aluno.nome}
                <span class="aluno-turma">${aluno.turmaOrigem}</span>
            </div>
        `;
    container.appendChild(div);
  });

  atualizarResumoChamada();
}

function atualizarResumoChamada() {
  const checkboxes = document.querySelectorAll(
    '#listaAlunosChamada input[type="checkbox"]',
  );
  const presentes = Array.from(checkboxes).filter((cb) => cb.checked).length;
  const ausentes = checkboxes.length - presentes;

  document.getElementById("presentesCount").textContent = presentes;
  document.getElementById("ausentesCount").textContent = ausentes;
}

async function salvarFrequencia() {
  const data = document.getElementById("dataAula").value;
  const conteudo = document.getElementById("conteudoAula").value;

  if (!data || !conteudo) {
    showToast("Preencha data e conteúdo!", "error");
    return;
  }

  const presentes = [];
  const ausentes = [];

  document
    .querySelectorAll('#listaAlunosChamada input[type="checkbox"]')
    .forEach((cb) => {
      if (cb.checked) {
        presentes.push(cb.value);
      } else {
        ausentes.push(cb.value);
      }
    });

  const registro = {
    eletivaId: eletivaSelecionada,
    data: data,
    conteudo: conteudo,
    frequencia: { presentes, ausentes },
    professorId: professorAtual.id,
    semestreId: state.semestreAtivo.id,
  };

  const saved = await FirebaseService.salvarRegistro(registro);

  if (saved) {
    showToast("Frequência registrada com sucesso!", "success");
    document.getElementById("modalFrequencia").classList.remove("active");

    document.getElementById("dataAula").value = new Date()
      .toISOString()
      .split("T")[0];
    document.getElementById("conteudoAula").value = "";

    await FirebaseService.sincronizarDadosIniciais();
  }
}

// ==================== REGISTRO DE NOTAS ====================

function abrirRegistroNotas() {
  if (!eletivaSelecionada) return;

  document.getElementById("modalNotas").classList.add("active");
  carregarAlunosParaNotas();
}

async function carregarAlunosParaNotas() {
  const bimestre = parseInt(document.getElementById("selectBimestre").value);

  const matriculas = state.matriculas.filter(
    (m) => m.eletivaId === eletivaSelecionada,
  );
  const alunos = state.alunos.filter((a) =>
    matriculas.some((m) => m.alunoId === a.id),
  );

  const notasExistentes =
    state.notas?.filter(
      (n) => n.eletivaId === eletivaSelecionada && n.bimestre === bimestre,
    ) || [];

  const container = document.getElementById("listaAlunosNotas");
  container.innerHTML = "";

  alunos.forEach((aluno) => {
    const notaExistente = notasExistentes.find((n) => n.alunoId === aluno.id);

    const div = document.createElement("div");
    div.className = "aluno-nota-item";
    div.innerHTML = `
            <div class="aluno-info">
                <strong>${aluno.codigoSige}</strong> - ${aluno.nome}
                <span class="aluno-turma">${aluno.turmaOrigem}</span>
            </div>
            <input type="number" class="nota-input" id="nota_${aluno.id}" 
                   value="${notaExistente?.nota || ""}" min="0" max="10" step="0.1"
                   placeholder="Nota">
        `;
    container.appendChild(div);
  });
}

window.marcarTodosDez = function () {
  document
    .querySelectorAll("#listaAlunosNotas .nota-input")
    .forEach((input) => {
      input.value = "10.0";
    });
};

window.limparTodasNotas = function () {
  document
    .querySelectorAll("#listaAlunosNotas .nota-input")
    .forEach((input) => {
      input.value = "";
    });
};

async function salvarNotas() {
  const bimestre = parseInt(document.getElementById("selectBimestre").value);

  const notas = [];

  document
    .querySelectorAll("#listaAlunosNotas .aluno-nota-item")
    .forEach((item) => {
      const input = item.querySelector(".nota-input");
      const alunoId = input.id.replace("nota_", "");
      const valor = parseFloat(input.value);

      if (!isNaN(valor) && valor >= 0 && valor <= 10) {
        const aluno = state.alunos.find((a) => a.id === parseInt(alunoId));
        notas.push({
          eletivaId: eletivaSelecionada,
          alunoId: parseInt(alunoId),
          alunoNome: aluno.nome,
          alunoCodigo: aluno.codigoSige,
          bimestre: bimestre,
          nota: valor,
          professorId: professorAtual.id,
          semestreId: state.semestreAtivo.id,
        });
      }
    });

  if (notas.length === 0) {
    showToast("Nenhuma nota válida para salvar", "error");
    return;
  }

  const saved = await FirebaseService.salvarNotasEmLote(notas);

  if (saved) {
    showToast(`Notas do ${bimestre}º bimestre salvas!`, "success");
    document.getElementById("modalNotas").classList.remove("active");
    await FirebaseService.sincronizarDadosIniciais();
  }
}

// ==================== HISTÓRICO ====================

function carregarSelectHistorico() {
  const select = document.getElementById("filterEletivaHistorico");
  const eletivas = state.eletivas.filter(
    (e) => e.professorId === professorAtual.id,
  );

  select.innerHTML = '<option value="">Todas as eletivas</option>';
  eletivas.forEach((e) => {
    select.innerHTML += `<option value="${e.id}">${e.codigo} - ${e.nome}</option>`;
  });
}

window.mudarHistoricoSemestre = function (semestreId) {
  document
    .getElementById("hist2026-1")
    .classList.toggle("active", semestreId === "2026-1");
  document
    .getElementById("hist2026-2")
    .classList.toggle("active", semestreId === "2026-2");
  carregarHistorico();
};

window.filtrarHistorico = function () {
  carregarHistorico();
};

function carregarHistorico() {
  const container = document.getElementById("historicoAulas");
  const filtroEletiva = document.getElementById(
    "filterEletivaHistorico",
  )?.value;
  const semestreHistorico =
    document.querySelector(".historico-semestre-selector .btn-toggle.active")
      ?.id === "hist2026-2"
      ? "2026-2"
      : "2026-1";

  let registros = state.registros.filter(
    (r) =>
      r.professorId === professorAtual.id && r.semestreId === semestreHistorico,
  );

  if (filtroEletiva) {
    registros = registros.filter(
      (r) => r.eletivaId === parseInt(filtroEletiva),
    );
  }

  if (registros.length === 0) {
    container.innerHTML =
      '<p class="empty-state">Nenhum registro encontrado</p>';
    return;
  }

  container.innerHTML = "";

  registros
    .sort((a, b) => b.data.localeCompare(a.data))
    .forEach((registro) => {
      const eletiva = state.eletivas.find((e) => e.id === registro.eletivaId);

      const div = document.createElement("div");
      div.className = "registro-item";
      div.onclick = () => verDetalhesRegistro(registro);
      div.innerHTML = `
            <div class="registro-header">
                <span class="registro-data">${formatarData(registro.data)}</span>
                <span class="registro-turma">${eletiva.codigo}</span>
            </div>
            <div class="registro-conteudo">${registro.conteudo.substring(0, 100)}...</div>
            <div class="registro-frequencia">
                <span class="presentes">✅ ${registro.frequencia.presentes.length} presentes</span>
                <span class="ausentes">❌ ${registro.frequencia.ausentes.length} ausentes</span>
            </div>
        `;
      container.appendChild(div);
    });
}

function verDetalhesRegistro(registro) {
  const eletiva = state.eletivas.find((e) => e.id === registro.eletivaId);

  const presentesLista = registro.frequencia.presentes
    .map((codigo) => {
      const aluno = state.alunos.find((a) => a.codigoSige === codigo);
      return aluno ? `${aluno.nome} (${aluno.codigoSige})` : codigo;
    })
    .join("<br>");

  const ausentesLista = registro.frequencia.ausentes
    .map((codigo) => {
      const aluno = state.alunos.find((a) => a.codigoSige === codigo);
      return aluno ? `${aluno.nome} (${aluno.codigoSige})` : codigo;
    })
    .join("<br>");

  document.getElementById("modalTitle").textContent =
    `Registro - ${formatarData(registro.data)}`;
  document.getElementById("modalBody").innerHTML = `
        <p><strong>Eletiva:</strong> ${eletiva.codigo} - ${eletiva.nome}</p>
        <p><strong>Conteúdo:</strong> ${registro.conteudo}</p>
        <div style="margin-top: 1rem;">
            <p><strong>Presentes (${registro.frequencia.presentes.length}):</strong></p>
            <p style="color: green;">${presentesLista || "Nenhum"}</p>
        </div>
        <div style="margin-top: 1rem;">
            <p><strong>Ausentes (${registro.frequencia.ausentes.length}):</strong></p>
            <p style="color: red;">${ausentesLista || "Nenhum"}</p>
        </div>
    `;

  document.getElementById("modalFooter").innerHTML = `
        <button class="btn-secondary" onclick="fecharModal()">Fechar</button>
    `;

  document.getElementById("modalDetalhes").classList.add("active");
}

// ==================== FUNÇÕES DE TABS ====================

window.mudarTab = function (tab) {
  document
    .querySelectorAll(".professor-tabs .tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => pane.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");

  if (tab === "historico") {
    carregarHistorico();
  }
};

// ==================== LOGOUT ====================

window.fazerLogout = function () {
  localStorage.removeItem("professor_atual");
  window.location.href = "index.html";
};

// ==================== FECHAR MODAIS ====================

window.fecharModal = function () {
  document.getElementById("modalDetalhes").classList.remove("active");
  document.getElementById("modalFrequencia")?.classList.remove("active");
  document.getElementById("modalNotas")?.classList.remove("active");
};

window.fecharModalConfirmacao = function () {
  document.getElementById("modalConfirmacao").classList.remove("active");
};
