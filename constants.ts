// ⚠️ CRITICAL: You must use the NEW Project URL and the 'anon' public key (starts with 'ey...') from Project Settings > API.
export const SUPABASE_URL = 'https://dpwzunudlcgrfwgjdmia.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwd3p1bnVkbGNncmZ3Z2pkbWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzYzNTAsImV4cCI6MjA4NjY1MjM1MH0.X7e9Zph7CD_wpP_viePUnd_EhARFX5doHHo78STCejg'; // <-- Go to Dashboard > Project Settings > API > copy 'anon' 'public' key (it is a long string starting with 'eyJ...')
// export const GEMINI_API_KEY = 'AIzaSyBoXHaGewSNY8IgPEY7w6h2G9ZXm41C8JQ'; // <-- REMOVED: API key must be obtained from process.env.API_KEY

export const NUM_STARS = 10000;
export const STARFIELD_RADIUS = 200;
export const CRYSTAL_COUNT_MIN = 5; // Minimum crystals to upload
export const CRYSTAL_SPAWN_RADIUS = 80;

// Colors for the proposal scene
export const PROPOSAL_LIGHT_COLOR = '#FFDDC2'; // Warm light
export const PROPOSAL_BLOOM_COLOR = '#FFB6C1'; // Pinkish bloom