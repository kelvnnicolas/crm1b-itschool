-- Script para dados iniciais (Seed)
-- Cuidado: O Supabase exige que os perfis estejam vinculados a auth.users, 
-- então não vamos criar usuários fictícios aqui diretamente sem antes criar no Auth.

-- 1. Cria uma organização padrão
INSERT INTO public.organizations (id, name)
VALUES 
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Escola de TI Demo')
ON CONFLICT (id) DO NOTHING;

-- 2. Cria os estágios padrão do Kanban para a organização
INSERT INTO public.lead_stages (organization_id, name, sort_order)
VALUES 
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Novo Lead', 10),
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Em Contato', 20),
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Qualificado', 30),
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Proposta Enviada', 40),
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Negociação', 50),
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Matriculado (Ganho)', 60),
  ('d17d0577-28d5-45a7-96a1-f3b177265be0', 'Perdido', 70)
ON CONFLICT (organization_id, name) DO NOTHING;
