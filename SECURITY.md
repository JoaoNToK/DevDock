# Política de Segurança — DevDock

## Versões Suportadas

Atualmente, fornecemos atualizações de segurança para as seguintes versões:

| Versão | Suportada |
| :--- | :--- |
| `0.1.x` (Main branch) | ✅ Sim |
| `< 0.1.0` | ❌ Não |

---

## Reportando uma Vulnerabilidade

A segurança da plataforma **DevDock** é levada a sério. Se você descobrir uma vulnerabilidade de segurança, siga as orientações abaixo:

1. **Não divulgue publicamente** a vulnerabilidade até que ela tenha sido analisada e corrigida pela equipe.
2. Abra um relatório detalhado por e-mail para `security@devdock.app` ou abra uma **Private Vulnerability Report / Issue Privada** diretamente no repositório oficial no GitHub.
3. Inclua os seguintes detalhes no relatório:
   - Descrição clara da vulnerabilidade.
   - Passos para reprodução ou Proof of Concept (PoC).
   - Módulo afetado (ex: Autenticação, Web Push, Storage, Server Actions).
   - Impacto estimado (ex: Vazamento de dados, XSS, Negação de Serviço).

---

## Tempo de Resposta Esperado

- **Confirmação inicial do recebimento**: até **48 horas úteis**.
- **Avaliação e Triagem**: até **5 dias úteis**.
- **Lançamento de patch de correção**: até **14 dias úteis** (dependendo da gravidade).

---

## Boas Práticas de Segurança no DevDock

- **Persistência Local-First**: Os dados do usuário permanecem no navegador via `storageAdapter` com namespaces seguros.
- **Variáveis de Ambiente**: Nunca comite arquivos `.env` ou `.env.local` contendo secrets reais ou chaves VAPID privadas.
- **Sanitização de Inputs**: Todas as entradas do usuário são validadas através de tipos estritos TypeScript e schemas Zod.
