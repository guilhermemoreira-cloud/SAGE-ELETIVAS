async function carregarDadosDaPlanilha() {
  console.log("📦 Carregando dados do arquivo local...");

  try {
    showToast("Carregando dados...", "info");

    // CAMINHO RELATIVO CORRETO
    const response = await fetch("data/dados-planilha.json");

    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.status}`);
    }

    const data = await response.json();

    console.log("✅ Arquivo JSON carregado com sucesso!");
    console.log("📊 Estatísticas:", data.estatisticas);

    processarDadosPlanilha(data.dados);

    const agora = new Date().toISOString();
    state.ultimaSincronizacao = agora;
    localStorage.setItem(CONFIG.storageKeys.ultimaSincronizacao, agora);

    showToast(
      `Dados carregados! ${data.estatisticas.alunos} alunos, ${data.estatisticas.professores} professores`,
      "success",
    );

    return true;
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
    showToast("Erro ao carregar dados. Usando fallback.", "error");
    carregarDadosFallback();
    return false;
  }
}

// O restante do arquivo permanece igual
// ... (processarDadosPlanilha, criarMatriculasBasicas, carregarDadosFallback)
