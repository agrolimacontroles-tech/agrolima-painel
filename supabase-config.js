// ============================================================
// Agro Lima Painel — Configuração do Supabase
// Inclua este arquivo em todas as páginas, antes dos demais scripts
// ============================================================

const SUPABASE_URL = 'https://glfgkjpgqkgvmpeevsgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZmdranBncWtndm1wZWV2c2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MjMyMjcsImV4cCI6MjEwNTE5OTIyN30.GKZRdUyeLaAAUExXKuQ3wbf_Jy3Xfl7d-57Fu0rJe1k';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------------------------------------
// Proteção de página: redireciona para login se não autenticado
// Chame checkAuth() no topo de toda página exceto login.html
// ------------------------------------------------------------
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}
