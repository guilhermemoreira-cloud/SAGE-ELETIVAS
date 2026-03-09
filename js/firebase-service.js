class FirebaseService {
  static async carregarProfessores() {
    try {
      const snapshot = await db.collection("professores").get();
      const professores = [];
      snapshot.forEach((doc) => {
        professores.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return professores;
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
      return [];
    }
  }

  static async salvarProfessor(professor) {
    try {
      if (professor.id) {
        await db.collection("professores").doc(professor.id).update(professor);
      } else {
        const docRef = await db.collection("professores").add(professor);
        professor.id = docRef.id;
      }
      return professor;
    } catch (error) {
      console.error("Erro ao salvar professor:", error);
      return null;
    }
  }

  static async carregarAlunos() {
    try {
      const snapshot = await db.collection("alunos").get();
      const alunos = [];
      snapshot.forEach((doc) => {
        alunos.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return alunos;
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
      return [];
    }
  }

  static async salvarAluno(aluno) {
    try {
      if (aluno.id) {
        await db.collection("alunos").doc(aluno.id).update(aluno);
      } else {
        const docRef = await db.collection("alunos").add(aluno);
        aluno.id = docRef.id;
      }
      return aluno;
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      return null;
    }
  }

  static async carregarEletivas() {
    try {
      const snapshot = await db.collection("eletivas").get();
      const eletivas = [];
      snapshot.forEach((doc) => {
        eletivas.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return eletivas;
    } catch (error) {
      console.error("Erro ao carregar eletivas:", error);
      return [];
    }
  }

  static async salvarEletiva(eletiva) {
    try {
      if (eletiva.id) {
        await db.collection("eletivas").doc(eletiva.id).update(eletiva);
      } else {
        const docRef = await db.collection("eletivas").add(eletiva);
        eletiva.id = docRef.id;
      }
      return eletiva;
    } catch (error) {
      console.error("Erro ao salvar eletiva:", error);
      return null;
    }
  }

  static async carregarMatriculas() {
    try {
      const snapshot = await db.collection("matriculas").get();
      const matriculas = [];
      snapshot.forEach((doc) => {
        matriculas.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return matriculas;
    } catch (error) {
      console.error("Erro ao carregar matrículas:", error);
      return [];
    }
  }

  static async salvarMatricula(matricula) {
    try {
      if (matricula.id) {
        await db.collection("matriculas").doc(matricula.id).update(matricula);
      } else {
        const docRef = await db.collection("matriculas").add(matricula);
        matricula.id = docRef.id;
      }
      return matricula;
    } catch (error) {
      console.error("Erro ao salvar matrícula:", error);
      return null;
    }
  }

  static async carregarRegistros() {
    try {
      const snapshot = await db.collection("registros_aula").get();
      const registros = [];
      snapshot.forEach((doc) => {
        registros.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return registros;
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
      return [];
    }
  }

  static async salvarRegistro(registro) {
    try {
      const docRef = await db.collection("registros_aula").add({
        ...registro,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return { id: docRef.id, ...registro };
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      return null;
    }
  }

  static async buscarRegistrosPorEletiva(eletivaId, semestreId) {
    try {
      let query = db
        .collection("registros_aula")
        .where("eletivaId", "==", eletivaId);

      if (semestreId) {
        query = query.where("semestreId", "==", semestreId);
      }

      const snapshot = await query.orderBy("data", "desc").get();
      const registros = [];
      snapshot.forEach((doc) => {
        registros.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return registros;
    } catch (error) {
      console.error("Erro ao buscar registros:", error);
      return [];
    }
  }

  static async carregarNotas() {
    try {
      const snapshot = await db.collection("notas").get();
      const notas = [];
      snapshot.forEach((doc) => {
        notas.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return notas;
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
      return [];
    }
  }

  static async salvarNotasEmLote(notas) {
    try {
      const batch = db.batch();

      notas.forEach((nota) => {
        const docRef = db.collection("notas").doc();
        batch.set(docRef, {
          ...nota,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Erro ao salvar notas em lote:", error);
      return false;
    }
  }

  static async buscarNotasPorEletiva(eletivaId, bimestre, semestreId) {
    try {
      let query = db
        .collection("notas")
        .where("eletivaId", "==", eletivaId)
        .where("bimestre", "==", bimestre);

      if (semestreId) {
        query = query.where("semestreId", "==", semestreId);
      }

      const snapshot = await query.get();
      const notas = [];
      snapshot.forEach((doc) => {
        notas.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return notas;
    } catch (error) {
      console.error("Erro ao buscar notas:", error);
      return [];
    }
  }

  static async sincronizarDadosIniciais() {
    console.log("🔄 Sincronizando dados com Firebase...");

    try {
      const [professores, alunos, eletivas, matriculas, registros, notas] =
        await Promise.all([
          this.carregarProfessores(),
          this.carregarAlunos(),
          this.carregarEletivas(),
          this.carregarMatriculas(),
          this.carregarRegistros(),
          this.carregarNotas(),
        ]);

      state.professores = professores;
      state.alunos = alunos;
      state.eletivas = eletivas;
      state.matriculas = matriculas;
      state.registros = registros;
      state.notas = notas;

      console.log("✅ Dados sincronizados:", {
        professores: professores.length,
        alunos: alunos.length,
        eletivas: eletivas.length,
        matriculas: matriculas.length,
        registros: registros.length,
        notas: notas.length,
      });

      return true;
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);
      return false;
    }
  }
}

window.FirebaseService = FirebaseService;
