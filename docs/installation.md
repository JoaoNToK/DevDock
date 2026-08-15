# Guia de Instalação — DevDock

> **Status:** Atualizado

## Pré-requisitos

Antes de iniciar a instalação do **DevDock**, certifique-se de possuir instalado em sua máquina:

- **Node.js**: Versão `18.x` ou superior (recomendado `20.x` / `24.x`).
- **npm**: Gerenciador de pacotes padrão do Node.js.
- **Git**: Para clonar o repositório.

---

## Passos para Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/JoaoNToK/DevDock.git
cd DevDock
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com base no modelo fornecido:

```bash
cp .env.example .env.local
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.
