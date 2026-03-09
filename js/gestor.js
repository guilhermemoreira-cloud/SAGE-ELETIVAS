// js/gestor.js - Lógica do gestor com Firebase

let gestorAtual = null;

document.addEventListener("DOMContentLoaded", async function () {
  console.log("👔 Inicializando página do gestor...");

  carregarTheme();

  const gestorStorage = localStorage.getItem("gestor_atual");
  if (!gestorStorage) {
    window.location.href = "selecionar-gestor.html";
    return;
  }

  gestorAtual = JSON.parse(gestorStorage);

  if (typeof carregarEstado === "function") {
    carregarEstado();
  }

  await FirebaseService.sincronizarDadosIniciais();

  const roleMap = {
    GESTOR: "Gestor",
    SECRETARIA: "Secretaria",
    GESTOR_PROFESSOR: "Gestor/Professor",
  };
  document.getElementById("userName").textContent = gestorAtual.nome;
  document.getElementById("userRole").textContent =
    roleMap[gestorAtual.perfil] || "Gestor";

  if (typeof atualizarIndicadorSemestre === "function") {
    atualizarIndicadorSemestre();
  }

  carregarTodosDados();
});

// ==================== FUNÇÕES DE TABS ====================

window.mudarTab = function (tab) {
  document
    .querySelectorAll(".gestor-tabs .tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document
    .querySelectorAll(".tab-pane")
    .forEach((pane) => pane.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");

  if (tab === "eletivas") carregarEletivas();
  if (tab === "professores") carregarProfessores();
  if (tab === "alunos") carregarAlunos();
  if (tab === "registros") carregarSelectEletivasRegistros();
  if (tab === "dashboard") atualizarDashboard();
};

// ==================== CARREGAR TODOS OS DADOS ====================

window.carregarTodosDados = function () {
  atualizarCardsResumo();
  atualizarDashboard();
  atualizarSelectProfessores();
  carregarEletivas();
  carregarProfessores();
  carregarAlunos();
  carregarInfoSemestres();
  carregarSelectEletivasRegistros();

  document.getElementById("infoAlunos").textContent = state.alunos.length;
  document.getElementById("infoProfessores").textContent =
    state.professores.length;
  document.getElementById("infoEletivas").textContent = state.eletivas.length;
};

// ==================== ATUALIZAR CARDS DE RESUMO ====================

function atualizarCardsResumo() {
  document.getElementById("totalEletivas").textContent = state.eletivas.length;
  document.getElementById("totalProfessores").textContent =
    state.professores.length;
  document.getElementById("totalAlunos").textContent = state.alunos.length;
  document.getElementById("totalMatriculas").textContent =
    state.matriculas.length;
}

// ==================== ATUALIZAR DASHBOARD ====================

function atualizarDashboard() {
  const eletivasFixas = state.eletivas.filter((e) => e.tipo === "FIXA").length;
  const eletivasMistas = state.eletivas.filter(
    (e) => e.tipo === "MISTA",
  ).length;

  const matriculasFixas = state.matriculas.filter((m) => {
    const e = state.eletivas.find((el) => el.id === m.eletivaId);
    return e && e.tipo === "FIXA";
  }).length;

  const matriculasMistas = state.matriculas.filter((m) => {
    const e = state.eletivas.find((el) => el.id === m.eletivaId);
    return e && e.tipo === "MISTA";
  }).length;

  const alunos1 = state.alunos.filter((a) => a.serie === "1ª").length;
  const alunos2 = state.alunos.filter((a) => a.serie === "2ª").length;
  const alunos3 = state.alunos.filter((a) => a.serie === "3ª").length;

  const professoresLimite = state.professores.filter((p) => {
    const count = state.eletivas.filter((e) => e.professorId === p.id).length;
    return count >= 4;
  }).length;

  document.getElementById("dashboardEletivasFixas").textContent = eletivasFixas;
  document.getElementById("dashboardEletivasMistas").textContent =
    eletivasMistas;
  document.getElementById("dashboardMatriculasFixas").textContent =
    matriculasFixas;
  document.getElementById("dashboardMatriculasMistas").textContent =
    matriculasMistas;
  document.getElementById("dashboardAlunos1").textContent = alunos1;
  document.getElementById("dashboardAlunos2").textContent = alunos2;
  document.getElementById("dashboardAlunos3").textContent = alunos3;
  document.getElementById("dashboardProfessoresLimite").textContent =
    professoresLimite;
}

// ==================== ATUALIZAR SELECT DE PROFESSORES ====================

function atualizarSelectProfessores() {
  const select = document.getElementById("filterEletivasProfessor");
  if (!select) return;

  select.innerHTML = '<option value="">Todos os professores</option>';

  const professoresOrdenados = [...state.professores].sort((a, b) =>
    a.nome.localeCompare(b.nome),
  );

  professoresOrdenados.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.nome;
    select.appendChild(option);
  });
}

// ==================== CARREGAR ELETIVAS ====================

function carregarEletivas() {
  const container = document.getElementById("listaEletivas");
  const filtroTipo = document.getElementById("filterEletivasTipo")?.value;
  const filtroProfessor = document.getElementById(
    "filterEletivasProfessor",
  )?.value;

  let eletivas = state.eletivas.filter(
    (e) => e.semestreId === state.semestreAtivo.id,
  );

  if (filtroTipo) {
    eletivas = eletivas.filter((e) => e.tipo === filtroTipo);
  }

  if (filtroProfessor) {
    eletivas = eletivas.filter(
      (e) => e.professorId === parseInt(filtroProfessor),
    );
  }

  if (eletivas.length === 0) {
    container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p class="empty-state">Nenhuma eletiva encontrada</p>
                <button class="btn-primary btn-small" onclick="limparFiltrosEletivas()" style="margin-top: 1rem;">
                    <i class="fas fa-eraser"></i> Limpar Filtros
                </button>
            </div>
        `;
    return;
  }

  container.innerHTML = "";
  eletivas.forEach((e) => {
    const matriculas = state.matriculas.filter(
      (m) => m.eletivaId === e.id,
    ).length;

    const div = document.createElement("div");
    div.className = "eletiva-item";
    div.onclick = () => verDetalhesEletiva(e.id);
    div.innerHTML = `
            <div class="eletiva-info">
                <h4>${e.codigo} - ${e.nome}</h4>
                <div class="eletiva-meta">
                    <span><i class="fas fa-chalkboard-teacher"></i> ${e.professorNome}</span>
                    <span><i class="fas fa-clock"></i> ${e.horario.diaSemana} ${e.horario.codigoTempo}</span>
                    <span><i class="fas fa-users"></i> ${matriculas}/${e.vagas}</span>
                    <span><i class="fas fa-tag"></i> ${e.tipo}</span>
                    ${e.turmaOrigem ? `<span><i class="fas fa-layer-group"></i> ${e.turmaOrigem}</span>` : ""}
                </div>
            </div>
        `;
    container.appendChild(div);
  });
}

window.limparFiltrosEletivas = function () {
  document.getElementById("filterEletivasTipo").value = "";
  document.getElementById("filterEletivasProfessor").value = "";
  carregarEletivas();
};

window.recarregarEletivas = carregarEletivas;

function verDetalhesEletiva(eletivaId) {
  const eletiva = state.eletivas.find((e) => e.id === eletivaId);
  const registros = state.registros.filter((r) => r.eletivaId === eletivaId);
  const notas = state.notas?.filter((n) => n.eletivaId === eletivaId) || [];

  const totalAulas = registros.length;
  const totalPresencas = registros.reduce(
    (acc, r) => acc + r.frequencia.presentes.length,
    0,
  );
  const mediaPresencas =
    totalAulas > 0 ? (totalPresencas / totalAulas).toFixed(1) : 0;

  document.getElementById("modalTitle").textContent =
    `${eletiva.codigo} - ${eletiva.nome}`;
  document.getElementById("modalBody").innerHTML = `
        <p><strong>Professor:</strong> ${eletiva.professorNome}</p>
        <p><strong>Horário:</strong> ${eletiva.horario.diaSemana} ${eletiva.horario.codigoTempo}</p>
        <p><strong>Local:</strong> ${eletiva.local || "Não definido"}</p>
        <p><strong>Tipo:</strong> ${eletiva.tipo}</p>
        ${eletiva.turmaOrigem ? `<p><strong>Turma:</strong> ${eletiva.turmaOrigem}</p>` : ""}
        
        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
            <h4>Estatísticas</h4>
            <p><strong>Total de Aulas:</strong> ${totalAulas}</p>
            <p><strong>Média de Presenças por Aula:</strong> ${mediaPresencas}</p>
            <p><strong>Total de Notas Lançadas:</strong> ${notas.length}</p>
        </div>
    `;

  document.getElementById("modalFooter").innerHTML = `
        <button class="btn-secondary" onclick="fecharModal()">Fechar</button>
    `;

  document.getElementById("modalDetalhes").classList.add("active");
}

// ==================== CARREGAR PROFESSORES ====================

function carregarProfessores() {
  const container = document.getElementById("listaProfessores");
  const searchTerm =
    document.getElementById("searchProfessores")?.value.toLowerCase() || "";

  let professores = state.professores;

  if (searchTerm) {
    professores = professores.filter(
      (p) =>
        p.nome.toLowerCase().includes(searchTerm) ||
        p.email.toLowerCase().includes(searchTerm),
    );
  }

  if (professores.length === 0) {
    container.innerHTML =
      '<p class="empty-state">Nenhum professor encontrado</p>';
    return;
  }

  container.innerHTML = "";
  professores.forEach((p) => {
    const eletivas = state.eletivas.filter(
      (e) => e.professorId === p.id,
    ).length;

    const div = document.createElement("div");
    div.className = "professor-item";
    div.innerHTML = `
            <div class="professor-info">
                <h4>${p.nome} ${eletivas >= 4 ? "⚠️" : ""}</h4>
                <div class="professor-meta">
                    <span><i class="fas fa-envelope"></i> ${p.email}</span>
                    <span><i class="fas fa-book"></i> ${eletivas} eletivas</span>
                    <span><i class="fas fa-tag"></i> ${p.perfil}</span>
                </div>
            </div>
        `;
    container.appendChild(div);
  });
}

// ==================== CARREGAR ALUNOS ====================

function carregarAlunos() {
  const container = document.getElementById("listaAlunos");
  const searchTerm =
    document.getElementById("searchAlunos")?.value.toLowerCase() || "";

  let alunos = state.alunos;

  if (searchTerm) {
    alunos = alunos.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm) ||
        a.codigoSige.toLowerCase().includes(searchTerm),
    );
  }

  if (alunos.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhum aluno encontrado</p>';
    return;
  }

  container.innerHTML = "";
  alunos.forEach((a) => {
    const matriculas = state.matriculas.filter(
      (m) => m.alunoId === a.id,
    ).length;

    const div = document.createElement("div");
    div.className = "aluno-item";
    div.innerHTML = `
            <div class="aluno-info">
                <h4>${a.nome}</h4>
                <div class="aluno-meta">
                    <span><i class="fas fa-hashtag"></i> ${a.codigoSige}</span>
                    <span><i class="fas fa-users"></i> ${a.turmaOrigem}</span>
                    <span><i class="fas fa-user-graduate"></i> ${matriculas} matrículas</span>
                </div>
            </div>
        `;
    container.appendChild(div);
  });
}

// ==================== CARREGAR INFO SEMESTRES ====================

function carregarInfoSemestres() {
  const eletivasS1 = state.eletivas.filter(
    (e) => e.semestreId === "2026-1",
  ).length;
  const eletivasS2 = state.eletivas.filter(
    (e) => e.semestreId === "2026-2",
  ).length;
  const matriculasS1 = state.matriculas.filter(
    (m) => m.semestreId === "2026-1",
  ).length;
  const matriculasS2 = state.matriculas.filter(
    (m) => m.semestreId === "2026-2",
  ).length;

  document.getElementById("totalEletivasS1").textContent = eletivasS1;
  document.getElementById("totalEletivasS2").textContent = eletivasS2;
  document.getElementById("totalMatriculasS1").textContent = matriculasS1;
  document.getElementById("totalMatriculasS2").textContent = matriculasS2;
}

// ==================== REGISTROS ====================

function carregarSelectEletivasRegistros() {
  const select = document.getElementById("selectEletivaRegistros");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione uma eletiva</option>';
  state.eletivas
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((e) => {
      select.innerHTML += `<option value="${e.id}">${e.codigo} - ${e.nome}</option>`;
    });
}

async function carregarRegistrosEletiva() {
  const eletivaId = document.getElementById("selectEletivaRegistros").value;
  if (!eletivaId) {
    document.getElementById("registrosContainer").innerHTML =
      '<p class="empty-state">Selecione uma eletiva</p>';
    document.getElementById("registrosActions").style.display = "none";
    return;
  }

  const registros = await FirebaseService.buscarRegistrosPorEletiva(
    parseInt(eletivaId),
    state.semestreAtivo.id,
  );
  const eletiva = state.eletivas.find((e) => e.id === parseInt(eletivaId));

  if (registros.length === 0) {
    document.getElementById("registrosContainer").innerHTML =
      '<p class="empty-state">Nenhum registro encontrado</p>';
    document.getElementById("registrosActions").style.display = "none";
    return;
  }

  let html = `
        <h4>${eletiva.codigo} - ${eletiva.nome}</h4>
        <p>Total de aulas: ${registros.length}</p>
        <table class="alunos-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Conteúdo</th>
                    <th>Presentes</th>
                    <th>Ausentes</th>
                </tr>
            </thead>
            <tbody>
    `;

  registros.forEach((r) => {
    html += `
            <tr>
                <td>${formatarData(r.data)}</td>
                <td>${r.conteudo.substring(0, 50)}${r.conteudo.length > 50 ? "..." : ""}</td>
                <td>${r.frequencia.presentes.length}</td>
                <td>${r.frequencia.ausentes.length}</td>
            </tr>
        `;
  });

  html += `</tbody></table>`;

  document.getElementById("registrosContainer").innerHTML = html;
  document.getElementById("registrosActions").style.display = "block";
  window.eletivaRegistroAtual = parseInt(eletivaId);
}

// ==================== RELATÓRIOS ====================

async function gerarRelatorioFrequencia() {
  const eletivaId = window.eletivaRegistroAtual;
  if (!eletivaId) return;

  const eletiva = state.eletivas.find((e) => e.id === eletivaId);
  const registros = state.registros
    .filter((r) => r.eletivaId === eletivaId)
    .sort((a, b) => a.data.localeCompare(b.data));

  const alunos = state.alunos.filter((a) =>
    state.matriculas.some(
      (m) => m.alunoId === a.id && m.eletivaId === eletivaId,
    ),
  );

  const relatorioAlunos = alunos.map((aluno) => {
    let presencas = 0;
    let ausencias = 0;

    registros.forEach((r) => {
      if (r.frequencia.presentes.includes(aluno.codigoSige)) {
        presencas++;
      } else {
        ausencias++;
      }
    });

    const totalAulas = registros.length;
    const percentual =
      totalAulas > 0 ? ((presencas / totalAulas) * 100).toFixed(1) : 0;

    return {
      nome: aluno.nome,
      codigo: aluno.codigoSige,
      turma: aluno.turmaOrigem,
      presencas,
      ausencias,
      percentual,
    };
  });

  let html = `
        <html>
        <head>
            <title>Relatório de Frequência - ${eletiva.codigo}</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h1 { color: #2c5f2d; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #2c5f2d; color: white; padding: 10px; text-align: left; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                .header { margin-bottom: 20px; }
                .footer { margin-top: 20px; font-size: 0.9em; color: #666; }
            </style>
        </head>
        <body>
            <h1>Relatório de Frequência</h1>
            <div class="header">
                <p><strong>Eletiva:</strong> ${eletiva.codigo} - ${eletiva.nome}</p>
                <p><strong>Professor:</strong> ${eletiva.professorNome}</p>
                <p><strong>Semestre:</strong> ${state.semestreAtivo.id}</p>
                <p><strong>Total de Aulas:</strong> ${registros.length}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Aluno</th>
                        <th>Turma</th>
                        <th>Presenças</th>
                        <th>Ausências</th>
                        <th>Frequência</th>
                    </tr>
                </thead>
                <tbody>
    `;

  relatorioAlunos.forEach((a) => {
    html += `
            <tr>
                <td>${a.codigo}</td>
                <td>${a.nome}</td>
                <td>${a.turma}</td>
                <td>${a.presencas}</td>
                <td>${a.ausencias}</td>
                <td>${a.percentual}%</td>
            </tr>
        `;
  });

  html += `
                </tbody>
            </table>
            
            <div class="footer">
                <p>Relatório gerado em: ${new Date().toLocaleString("pt-BR")}</p>
                <p>SAGE 2026 - Sistema de Gestão de Eletivas</p>
            </div>
        </body>
        </html>
    `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.print();
}

// ==================== SINCRONIZAÇÃO ====================

window.sincronizarAgora = async function () {
  showToast("Sincronizando dados...", "info");
  await FirebaseService.sincronizarDadosIniciais();
  carregarTodosDados();
  const agora = new Date().toLocaleString("pt-BR");
  document.getElementById("ultimaSincronizacao").innerHTML =
    `<i class="fas fa-check-circle" style="color: green;"></i> Última sincronização: ${agora}`;
  showToast("Dados sincronizados!", "success");
};

// ==================== FUNÇÕES DE FILTRO ====================

window.filtrarEletivas = carregarEletivas;
window.filtrarProfessores = carregarProfessores;
window.filtrarAlunos = carregarAlunos;

// ==================== LOGOUT ====================

window.fazerLogout = function () {
  localStorage.removeItem("gestor_atual");
  window.location.href = "index.html";
};

// ==================== FECHAR MODAIS ====================

window.fecharModal = function () {
  document.getElementById("modalDetalhes").classList.remove("active");
};

window.fecharModalConfirmacao = function () {
  document.getElementById("modalConfirmacao").classList.remove("active");
};
