const supabaseUrl = 'https://kwgtsplpgbjpmukbugvc.supabase.co';
const supabaseKey = 'sb_publishable_CjrhdIkcRfb1enFcpTTQAA_1fFryjoW';

// Le damos un nombre distinto (supabaseClient) y lo hacemos global
window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);