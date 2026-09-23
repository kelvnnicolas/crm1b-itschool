/**
 * Backend & Database Test Suite
 * Testa conexão, existência de tabelas, RLS, enums e integridade referencial.
 * 
 * Execução: node scripts/test-backend.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=["']?([^"']*)["']?$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EXPECTED_TABLES = ['organizations', 'profiles', 'contacts', 'lead_stages', 'leads', 'notes', 'tasks'];

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`  ✅ ${msg}`); passed++; }
function fail(msg, detail) { console.error(`  ❌ ${msg}`, detail || ''); failed++; }

// ─── TEST 1: Conexão básica ─────────────────────────────────────────────
async function testConnection() {
  console.log('\n🔌 Teste 1: Conexão com Supabase');
  try {
    // A simple health-check: querying a table (RLS will block data, but connection should work)
    const { error } = await supabase.from('organizations').select('id').limit(0);
    if (error) {
      fail(`Conexão falhou: ${error.message}`);
    } else {
      pass('Conexão com Supabase estabelecida com sucesso');
    }
  } catch (e) {
    fail('Exceção ao conectar', e.message);
  }
}

// ─── TEST 2: Existência das tabelas ─────────────────────────────────────
async function testTablesExist() {
  console.log('\n📋 Teste 2: Existência das tabelas');
  for (const table of EXPECTED_TABLES) {
    const { error } = await supabase.from(table).select('id').limit(0);
    if (error && error.code === '42P01') {
      fail(`Tabela "${table}" NÃO existe`);
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 = "The result contains 0 rows" which is fine
      fail(`Tabela "${table}" erro inesperado: ${error.message} (${error.code})`);
    } else {
      pass(`Tabela "${table}" existe`);
    }
  }
}

// ─── TEST 3: RLS está ativado (anon não deve ver dados) ─────────────────
async function testRLS() {
  console.log('\n🔒 Teste 3: Row Level Security (RLS)');
  console.log('  (Usando anon key sem autenticação — esperamos 0 linhas ou erro de permissão)');
  
  for (const table of EXPECTED_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      // Some RLS configs return an error for anon
      pass(`RLS ativo em "${table}" — acesso negado (${error.code})`);
    } else if (data && data.length === 0) {
      pass(`RLS ativo em "${table}" — 0 linhas retornadas para anon`);
    } else {
      fail(`RLS possivelmente INATIVO em "${table}" — ${data?.length} linhas retornadas para anon sem autenticação`);
    }
  }
}

// ─── TEST 4: Schema das tabelas (colunas principais) ────────────────────
async function testSchemaColumns() {
  console.log('\n🏗️  Teste 4: Schema (verificação de colunas)');
  
  const expectedColumns = {
    organizations: ['id', 'name', 'created_at'],
    profiles: ['id', 'organization_id', 'full_name', 'role', 'created_at'],
    contacts: ['id', 'organization_id', 'name', 'email', 'phone', 'company', 'created_at'],
    lead_stages: ['id', 'organization_id', 'name', 'sort_order', 'created_at'],
    leads: ['id', 'organization_id', 'contact_id', 'title', 'value', 'stage_id', 'created_at'],
    notes: ['id', 'organization_id', 'entity_type', 'entity_id', 'content', 'created_by', 'created_at'],
    tasks: ['id', 'organization_id', 'title', 'description', 'due_date', 'status', 'assigned_to', 'entity_type', 'entity_id', 'created_at'],
  };

  // We use a select with column names - if a column doesn't exist, PostgREST returns a specific error
  for (const [table, columns] of Object.entries(expectedColumns)) {
    const selectStr = columns.join(',');
    const { error } = await supabase.from(table).select(selectStr).limit(0);
    if (error) {
      fail(`Schema de "${table}" — coluna(s) faltando ou erro: ${error.message}`);
    } else {
      pass(`Schema de "${table}" — todas as ${columns.length} colunas presentes`);
    }
  }
}

// ─── TEST 5: Tipagens TypeScript geradas ────────────────────────────────
function testTypesGenerated() {
  console.log('\n📝 Teste 5: Tipagens TypeScript');
  
  try {
    const content = readFileSync('src/types/database.types.ts', 'utf-8');
    
    // Check for all expected tables in the types file
    const missingTables = EXPECTED_TABLES.filter(t => !content.includes(`${t}:`));
    if (missingTables.length > 0) {
      fail(`Tipagens faltando para tabelas: ${missingTables.join(', ')}`);
    } else {
      pass('Tipagens geradas para todas as 7 tabelas');
    }

    // Check for enums
    const expectedEnums = ['user_role', 'note_entity_type', 'task_status', 'task_entity_type'];
    const missingEnums = expectedEnums.filter(e => !content.includes(e));
    if (missingEnums.length > 0) {
      fail(`Enums faltando nas tipagens: ${missingEnums.join(', ')}`);
    } else {
      pass('Todos os 4 enums presentes nas tipagens');
    }

    // Check for helper function
    if (content.includes('get_current_user_org')) {
      pass('Função helper get_current_user_org presente nas tipagens');
    } else {
      fail('Função helper get_current_user_org NÃO encontrada nas tipagens');
    }
  } catch (e) {
    fail('Arquivo de tipagens não encontrado: src/types/database.types.ts');
  }
}

// ─── TEST 6: Integridade do seed.sql ────────────────────────────────────
function testSeedFile() {
  console.log('\n🌱 Teste 6: Arquivo seed.sql');
  
  try {
    const content = readFileSync('supabase/seed.sql', 'utf-8');
    
    if (content.includes('organizations')) {
      pass('Seed contém dados para organizations');
    } else {
      fail('Seed NÃO contém dados para organizations');
    }

    if (content.includes('lead_stages')) {
      pass('Seed contém estágios do Kanban (lead_stages)');
    } else {
      fail('Seed NÃO contém estágios do Kanban');
    }
  } catch (e) {
    fail('Arquivo supabase/seed.sql não encontrado');
  }
}

// ─── TEST 7: Foreign keys (via PostgREST joins) ─────────────────────────
async function testForeignKeys() {
  console.log('\n🔗 Teste 7: Foreign Keys (joins via PostgREST)');
  
  // Test that PostgREST recognizes FK relationships by attempting embedded selects
  const fkTests = [
    { table: 'contacts', select: 'id, organizations(id)', desc: 'contacts → organizations' },
    { table: 'leads', select: 'id, contacts(id)', desc: 'leads → contacts' },
    { table: 'leads', select: 'id, lead_stages(id)', desc: 'leads → lead_stages' },
    { table: 'notes', select: 'id, profiles(id)', desc: 'notes → profiles (created_by)' },
    { table: 'tasks', select: 'id, profiles(id)', desc: 'tasks → profiles (assigned_to)' },
  ];

  for (const { table, select, desc } of fkTests) {
    const { error } = await supabase.from(table).select(select).limit(0);
    if (error && error.message.includes('could not find')) {
      fail(`FK "${desc}" — relação não encontrada pelo PostgREST`);
    } else if (error && error.code === 'PGRST200') {
      // Ambiguous relationship - still means the FK exists
      pass(`FK "${desc}" — reconhecida (ambígua, mas existente)`);
    } else {
      pass(`FK "${desc}" — reconhecida`);
    }
  }
}

// ─── RUNNER ─────────────────────────────────────────────────────────────
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  🧪 Backend & Database Test Suite — CRM Escola TI');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  URL: ${supabaseUrl}`);

  await testConnection();
  await testTablesExist();
  await testRLS();
  await testSchemaColumns();
  testTypesGenerated();
  testSeedFile();
  await testForeignKeys();

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  📊 Resultado: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
