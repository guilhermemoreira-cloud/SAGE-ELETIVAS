# SAGE 2026 - Sistema de Gestão de Eletivas

Sistema para gestão de eletivas da EEMTI Filgueiras Lima, desenvolvido para funcionar como PWA (Progressive Web App) e poder ser instalado em dispositivos Android.

## 📋 Funcionalidades

### 👨‍🏫 Professor

- Dashboard com eletivas do professor
- Registro de frequência por aula (com toggle switch)
- Lançamento de notas por bimestre
- Histórico completo de aulas
- Visualização detalhada de registros

### 👔 Gestor

- Dashboard com estatísticas gerais
- Lista completa de eletivas com filtros
- Lista de professores com busca
- Lista de alunos com busca
- Visualização de registros de aula
- Geração de relatórios de frequência

## 🚀 Tecnologias

- HTML5
- CSS3 (com variáveis CSS para temas claro/escuro)
- JavaScript (ES6+)
- Firebase Firestore (banco de dados em nuvem)
- LocalStorage (cache local)
- PWA (Service Worker para funcionamento offline e instalação)
- GitHub Pages (hospedagem)

## 📊 Dados

- **Professores**: 22 cadastrados
- **Alunos**: 356 cadastrados
- **Eletivas**: 22 ofertadas
- **Matrículas**: Automáticas por turma

## 🎨 Tema

Suporte a tema claro/escuro com persistência da preferência no localStorage.

## 📱 Instalação como Aplicativo (Android)

1. Acesse o sistema pelo Chrome no Android
2. Toque no menu (3 pontinhos)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação
5. O ícone aparecerá na tela inicial como um app nativo

## 🔄 Sincronização com Firebase

Os dados são sincronizados automaticamente com o Firebase Firestore, permitindo:

- Compartilhamento de dados entre todos os usuários
- Persistência em nuvem
- Backup automático
- Acesso de qualquer lugar

## 📦 Estrutura de Arquivos
