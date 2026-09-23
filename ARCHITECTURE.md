# Arquitetura do Projeto

O sistema é dividido em Módulos Core (reutilizáveis para futuros sistemas) e Módulos de Domínio (específico da Escola de TI).

## Camadas
1. **UI**: Componentes React responsivos, Tailwind e shadcn/ui.
2. **Actions/API**: Next.js Server Actions para manipulação de dados de forma segura.
3. **Services**: Regras de negócio e lógicas principais.
4. **Repositories**: Acesso e interação com o banco de dados.
5. **Database**: PostgreSQL hospedado no Supabase.
