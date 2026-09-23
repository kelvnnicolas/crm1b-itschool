# Modelo de Dados

O banco de dados será construído com foco em **multi-tenancy** através da entidade `organizations`.

## Core (Multi-tenant)
- `organizations`
- `profiles` (Roles: Admin, Comercial, Professor, Operacional)
- `contacts`
- `leads`, `lead_stages`
- `tasks`, `activities`, `notes`, `tags`

## Domínio (School)
- `courses`
- `teachers`
- `classes`
- `students`
- `enrollments`, `attendance`

## Financeiro
- `payments`

Todas as consultas serão protegidas pelo **RLS (Row Level Security)** do Supabase.
