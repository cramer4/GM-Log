
// ============================================================
// CONSTANTS
// ============================================================
const ABILITIES = ["STR","DEX","CON","INT","WIS","CHA"];
const ABILITY_FULL = { STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma" };
const SKILLS_DATA = [
  {name:"Acrobatics",ability:"DEX"},{name:"Animal Handling",ability:"WIS"},
  {name:"Arcana",ability:"INT"},{name:"Athletics",ability:"STR"},
  {name:"Deception",ability:"CHA"},{name:"History",ability:"INT"},
  {name:"Insight",ability:"WIS"},{name:"Intimidation",ability:"CHA"},
  {name:"Investigation",ability:"INT"},{name:"Medicine",ability:"WIS"},
  {name:"Nature",ability:"INT"},{name:"Perception",ability:"WIS"},
  {name:"Performance",ability:"CHA"},{name:"Persuasion",ability:"CHA"},
  {name:"Religion",ability:"INT"},{name:"Sleight of Hand",ability:"DEX"},
  {name:"Stealth",ability:"DEX"},{name:"Survival",ability:"WIS"},
];
const SPELL_SCHOOLS = ["Abjuration","Conjuration","Divination","Enchantment","Evocation","Illusion","Necromancy","Transmutation"];
const CONDITIONS = ["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious","Exhausted"];
const ALIGNMENTS = ["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil","Unaligned"];

function mod(score) { return Math.floor((score - 10) / 2); }
function profBonus(level) { return Math.ceil(level / 4) + 1; }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}`; }

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
const STORAGE_KEY = "gm_logbook_v2";
const REL_TYPES = ["Ally","Rival","Enemy","Mentor","Protégé","Family","Lover","Employer","Employee","Friend","Informant","Unknown"];
const REL_COLORS = {Ally:"#5ab85a",Rival:"#c9923a",Enemy:"#c44040",Mentor:"#9b72cf",Protégé:"#9b72cf",Family:"#4aabab",Lover:"#e8b86d",Employer:"#8ab0c0",Employee:"#8ab0c0",Friend:"#5ab85a",Informant:"#c0b8d0",Unknown:"#4a3e2a"};
const FAC_REL_TYPES = ["Allied","Trade Partners","Tense","Rivals","At War","Neutral","Unknown"];
const FAC_REL_COLORS = {Allied:"#5ab85a","Trade Partners":"#4aabab",Tense:"#c9923a",Rivals:"#c9923a","At War":"#c44040",Neutral:"#8a7a60",Unknown:"#4a3e2a"};
function loadData() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ============================================================
// DEFAULT DATA
// ============================================================
function defaultCharacter(id) {
  const skills = {};
  SKILLS_DATA.forEach(s => { skills[s.name] = { proficient: false, expertise: false }; });
  const saves = {};
  ABILITIES.forEach(a => { saves[a] = { proficient: false }; });
  return {
    id, name:"New Character", playerName:"", race:"", charClass:"", subclass:"",
    level:1, background:"", alignment:"True Neutral", xp:0, xpNext:300,
    portrait: null,
    hp:{ current:10, max:10, temp:0 },
    hitDice:{ type:"d8", total:1, remaining:1 },
    deathSaves:{ successes:[false,false,false], failures:[false,false,false] },
    abilities:{ STR:10, DEX:10, CON:10, INT:10, WIS:10, CHA:10 },
    skills, saves,
    ac:10, speed:30, spellSaveDC:8,
    inventory:[], currency:{ pp:0, gp:0, ep:0, sp:0, cp:0 },
    spellSlots: Array.from({length:9},(_,i)=>({level:i+1,max:0,used:0})),
    spells:[],
    features:[],
    backstory:"", personality:"", ideals:"", bonds:"", flaws:"", dmNotes:"",
    relationships:[],
    conditions:[],
    customStatsMode: false,
    customStats: [],
    tabConfig: { core:{hidden:[],custom:[]}, combat:{hidden:[],custom:[]}, skills:{hidden:[],custom:[]}, inventory:{hidden:[],custom:[]}, spells:{hidden:[],custom:[]}, features:{hidden:[],custom:[]}, notes:{hidden:[],custom:[]} },
  };
}
function defaultNPC(id) {
  return { id, name:"New NPC", race:"", occupation:"", location:"", age:"",
    description:"", personality:"", motivation:"", secret:"",
    attitude:"Neutral", history:"", factionId:null, status:"Alive", dmNotes:"", tags:[],
    npcRelationships:[] };
}
function defaultLocation(id) {
  return { id, name:"New Location", type:"Town", region:"", population:"", atmosphere:"",
    description:"", history:"", secrets:"", hooks:"", status:"Unknown", dmNotes:"", tags:[] };
}
function defaultFaction(id) {
  return { id, name:"New Faction", type:"Guild", powerLevel:"Local",
    goals:"", methods:"", attitude:"Neutral", resources:"", notes:"", influenceScore:50 };
}
function defaultLore(id) {
  return { id, name:"New Lore Entry", category:"History", content:"", tags:[] };
}
function defaultSession(id) {
  const now = new Date();
  return { id, number:1, date: now.toISOString().split("T")[0], inWorldDate:"",
    playersPresent:"", summary:"", keyEvents:"", npcsEncountered:"",
    locationsVisited:"", lootDistributed:"", cliffhanger:"", xpAwarded:0, prepNotes:"" };
}
function defaultQuest(id) {
  return { id, name:"New Quest", giver:"", objective:"", stakes:"",
    progress:"", reward:"", status:"Active", dmNotes:"" };
}
function defaultPlotThread(id) {
  return { id, name:"New Plot Thread", cluesFound:"", cluesMissed:"", truth:"", status:"Active" };
}
function defaultCampaign(id) {
  const c1 = defaultCharacter(`char_${Date.now()}_1`);
  c1.name = "Character 1"; c1.playerName = "Player 1";
  return {
    id, name:"My Campaign", system:"D&D 5e", setting:"",
    characters:[c1],
    npcs:[], locations:[], factions:[], lore:[],
    sessions:[], quests:[], plotThreads:[],
    vaultItems:[], houseRules:"",
    initiative:[], sessionNotes:"",
    factionRelations:{},
  };
}
function defaultAppData() {
  const campaign = defaultCampaign(`camp_${Date.now()}`);
  return { campaigns:[campaign], activeCampaignId: campaign.id };
}

// ============================================================
// STYLES
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f0d0b;--surface:#181410;--card:#1e1914;--card2:#231e17;
  --border:#2e2518;--border2:#3a2f1e;
  --gold:#c9923a;--gold-light:#e8b86d;--gold-dim:#7a5520;
  --red:#c44040;--teal:#4aabab;--green:#5ab85a;--purple:#9b72cf;
  --text:#e8dcc8;--muted:#8a7a60;--faint:#4a3e2a;
  --font-serif:'Cinzel',serif;--font-body:'Crimson Pro',serif;--font-mono:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:16px;line-height:1.6;overflow:hidden;height:100vh}
h1,h2,h3{font-family:var(--font-serif);font-weight:600;color:var(--gold-light)}
h1{font-size:1.4rem;letter-spacing:0.08em}
h2{font-size:1.1rem;letter-spacing:0.06em;margin-bottom:12px}
h3{font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
input,textarea,select{background:var(--card2);border:1px solid var(--border2);color:var(--text);font-family:var(--font-body);font-size:14px;padding:6px 10px;border-radius:3px;width:100%;outline:none;transition:border-color 0.15s}
input:focus,textarea:focus,select:focus{border-color:var(--gold-dim)}
input[type=number]{-moz-appearance:textfield}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
input[type=checkbox]{width:auto;accent-color:var(--gold)}
textarea{resize:vertical;min-height:80px}
button{cursor:pointer;font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;border:none;border-radius:2px;padding:6px 14px;transition:all 0.15s}
.btn-primary{background:var(--gold);color:#0f0d0b;font-weight:500}
.btn-primary:hover{background:var(--gold-light)}
.btn-ghost{background:transparent;border:1px solid var(--border2);color:var(--muted)}
.btn-ghost:hover{border-color:var(--gold-dim);color:var(--gold-light)}
.btn-danger{background:transparent;border:1px solid #5a2020;color:var(--red)}
.btn-danger:hover{background:#3a1010}
.btn-sm{padding:3px 10px;font-size:10px}
label{font-family:var(--font-mono);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px}
.field{margin-bottom:14px}
.field-row{display:grid;gap:12px;margin-bottom:14px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-3{grid-template-columns:1fr 1fr 1fr}
.grid-4{grid-template-columns:1fr 1fr 1fr 1fr}
.grid-6{grid-template-columns:repeat(6,1fr)}
.card{background:var(--card);border:1px solid var(--border);border-radius:3px;padding:20px}
.card+.card{margin-top:12px}
.card-sm{background:var(--card);border:1px solid var(--border);border-radius:3px;padding:12px}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}
.tag{display:inline-block;font-family:var(--font-mono);font-size:9px;padding:2px 8px;border-radius:2px;letter-spacing:0.1em;text-transform:uppercase;background:var(--card2);border:1px solid var(--border2);color:var(--muted)}
.tag-gold{background:rgba(201,146,58,0.1);border-color:rgba(201,146,58,0.3);color:var(--gold)}
.tag-red{background:rgba(196,64,64,0.1);border-color:rgba(196,64,64,0.3);color:var(--red)}
.tag-green{background:rgba(90,184,90,0.1);border-color:rgba(90,184,90,0.3);color:var(--green)}
.tag-teal{background:rgba(74,171,171,0.1);border-color:rgba(74,171,171,0.3);color:var(--teal)}
.badge-alive{color:var(--green)} .badge-dead{color:var(--red)} .badge-unknown{color:var(--muted)}
.saved-indicator{font-family:var(--font-mono);font-size:10px;color:var(--green);opacity:0;transition:opacity 0.5s;letter-spacing:0.1em}
.saved-indicator.show{opacity:1}
.divider{border:none;border-top:1px solid var(--border);margin:16px 0}
.scroll-area{overflow-y:auto;height:100%}
.scroll-area::-webkit-scrollbar{width:4px}
.scroll-area::-webkit-scrollbar-track{background:transparent}
.scroll-area::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.ability-box{background:var(--card2);border:1px solid var(--border2);border-radius:3px;padding:12px 8px;text-align:center;position:relative}
.ability-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px}
.ability-mod{font-family:var(--font-serif);font-size:1.4rem;color:var(--gold-light);line-height:1}
.ability-score-input{font-size:12px;text-align:center;padding:4px;margin-top:6px}
.stat-box{background:var(--card2);border:1px solid var(--border2);border-radius:3px;padding:10px;text-align:center}
.stat-val{font-family:var(--font-serif);font-size:1.3rem;color:var(--text);line-height:1;margin-bottom:2px}
.stat-lbl{font-family:var(--font-mono);font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted)}
.hp-current{font-family:var(--font-serif);font-size:2rem;color:var(--green);line-height:1}
.hp-max{font-family:var(--font-mono);font-size:12px;color:var(--muted)}
.death-save-row{display:flex;align-items:center;gap:6px;margin:4px 0}
.death-save-row span{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;width:60px;color:var(--muted)}
.skill-row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(46,37,24,0.5)}
.skill-row:last-child{border-bottom:none}
.skill-name{font-size:13px;flex:1;color:var(--text)}
.skill-ability{font-family:var(--font-mono);font-size:9px;color:var(--muted);width:28px;text-align:center}
.skill-bonus{font-family:var(--font-mono);font-size:12px;color:var(--gold-light);width:28px;text-align:right}
.inv-row{display:grid;grid-template-columns:1fr 60px 70px 1fr 32px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(46,37,24,0.4)}
.inv-row:last-child{border-bottom:none}
.currency-box{background:var(--card2);border:1px solid var(--border2);border-radius:3px;padding:10px;text-align:center}
.currency-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:4px}
.currency-pp{color:#c0b8d0} .currency-gp{color:var(--gold-light)} .currency-ep{color:#8ab0c0} .currency-sp{color:#c8c8c8} .currency-cp{color:#c08070}
.spell-row{display:grid;grid-template-columns:40px 1fr 100px 80px 32px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(46,37,24,0.4)}
.spell-slot-box{background:var(--card2);border:1px solid var(--border2);border-radius:3px;padding:8px;text-align:center}
.slot-pips{display:flex;gap:3px;justify-content:center;flex-wrap:wrap;margin-top:4px}
.slot-pip{width:10px;height:10px;border-radius:50%;border:1px solid var(--gold-dim);cursor:pointer;transition:background 0.1s}
.slot-pip.used{background:var(--card2)} .slot-pip.available{background:var(--gold)}
.initiative-row{display:flex;align-items:center;gap:10px;background:var(--card2);border:1px solid var(--border2);padding:10px 14px;border-radius:3px;margin-bottom:6px}
.initiative-row.active-turn{border-color:var(--gold);background:rgba(201,146,58,0.08)}
.init-order{font-family:var(--font-serif);font-size:1.2rem;color:var(--gold);width:28px;text-align:center}
.init-name{flex:1;font-size:14px}
.init-hp{font-family:var(--font-mono);font-size:12px;color:var(--green);width:60px;text-align:center}
.condition-chip{display:inline-flex;align-items:center;gap:4px;background:rgba(196,64,64,0.12);border:1px solid rgba(196,64,64,0.3);color:var(--red);font-family:var(--font-mono);font-size:9px;padding:2px 8px;border-radius:10px;letter-spacing:0.1em;text-transform:uppercase;margin:2px}
.tab-bar{display:flex;gap:2px;border-bottom:1px solid var(--border);margin-bottom:16px}
.tab{font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;padding:8px 16px;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all 0.15s;background:transparent;border-radius:0}
.tab:hover{color:var(--text)}
.tab.active{color:var(--gold-light);border-bottom-color:var(--gold)}
.sidebar{width:220px;min-width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100vh}
.sidebar-logo{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.sidebar-logo span{font-family:var(--font-serif);font-size:1rem;color:var(--gold);letter-spacing:0.08em}
.nav-section{padding:8px 0}
.nav-section-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--faint);padding:6px 20px 4px}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 20px;cursor:pointer;font-size:13px;color:var(--muted);transition:all 0.15s;border-left:2px solid transparent}
.nav-item:hover{color:var(--text);background:rgba(201,146,58,0.04)}
.nav-item.active{color:var(--gold-light);border-left-color:var(--gold);background:rgba(201,146,58,0.06)}
.nav-item-icon{font-size:14px;width:18px;text-align:center}
.nav-sub{padding-left:48px;font-size:12px;color:var(--faint);cursor:pointer;padding-top:4px;padding-bottom:4px;transition:color 0.15s;border-left:2px solid transparent}
.nav-sub:hover{color:var(--muted)}
.nav-sub.active{color:var(--gold);border-left-color:var(--gold-dim)}
.campaign-switcher{padding:12px 16px;border-bottom:1px solid var(--border)}
.campaign-switcher select{font-family:var(--font-serif);font-size:12px;padding:5px 8px}
.main-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
.page-header{padding:20px 28px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.page-body{flex:1;overflow-y:auto;padding:24px 28px}
.page-body::-webkit-scrollbar{width:5px}
.page-body::-webkit-scrollbar-track{background:transparent}
.page-body::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
.char-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:0 28px 0;border-bottom:1px solid var(--border);background:var(--surface)}
.char-tab{font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;padding:10px 14px;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all 0.15s;background:transparent;border-radius:0;border:none}
.char-tab:hover{color:var(--text)}
.char-tab.active{color:var(--gold-light);border-bottom-color:var(--gold)}
.dm-notes-field textarea{background:#12100e;border-color:#3a2015}
.list-empty{text-align:center;padding:40px 20px;color:var(--faint);font-style:italic}
.npc-card{background:var(--card);border:1px solid var(--border);border-radius:3px;padding:16px;cursor:pointer;transition:border-color 0.15s}
.npc-card:hover{border-color:var(--gold-dim)}
.npc-card h3{font-size:14px;font-family:var(--font-serif);color:var(--text);margin-bottom:4px;text-transform:none;letter-spacing:0.02em}
.session-card{background:var(--card);border:1px solid var(--border);border-radius:3px;padding:16px;cursor:pointer;transition:border-color 0.15s;margin-bottom:8px}
.session-card:hover{border-color:var(--gold-dim)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.modal{background:var(--card);border:1px solid var(--border2);border-radius:4px;padding:28px;width:90%;max-width:700px;max-height:85vh;overflow-y:auto}
.modal::-webkit-scrollbar{width:4px}
.modal::-webkit-scrollbar-thumb{background:var(--border2)}
.modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.close-btn{background:transparent;border:none;color:var(--muted);font-size:20px;cursor:pointer;padding:0;line-height:1}
.close-btn:hover{color:var(--text)}
.combat-panel{display:grid;grid-template-columns:1fr 280px;gap:16px;height:100%}
.dice-result{font-family:var(--font-serif);font-size:3rem;color:var(--gold-light);text-align:center;padding:20px 0}
.dice-history{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-align:center;max-height:120px;overflow-y:auto}
.quest-status-active{color:var(--gold)} .quest-status-completed{color:var(--green)} .quest-status-failed{color:var(--red)}
/* ── VIEW / EDIT MODAL ───────────────────────────────────── */
.view-edit-modal{display:flex;flex-direction:column;height:100%}
.modal-mode-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 24px;background:var(--card2);border-bottom:1px solid var(--border);flex-shrink:0;gap:10px}
.mode-toggle-btn{display:flex;gap:0;border:1px solid var(--border2);border-radius:3px;overflow:hidden}
.mode-toggle-btn button{padding:5px 14px;background:transparent;border:none;color:var(--muted);font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.15s}
.mode-toggle-btn button.active{background:var(--gold-dim);color:var(--gold-light)}
.view-body{flex:1;overflow-y:auto;padding:20px 24px}
.edit-body{flex:1;overflow-y:auto;padding:20px 24px}
.view-field{margin-bottom:14px}
.view-field-label{font-family:var(--font-mono);font-size:9px;color:var(--faint);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px}
.view-field-value{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap}
.view-field-empty{font-size:12px;color:var(--faint);font-style:italic}
.view-section-title{font-family:var(--font-serif);font-size:11px;color:var(--gold-dim);text-transform:uppercase;letter-spacing:0.15em;padding:6px 0 10px;border-bottom:1px solid var(--border);margin-bottom:12px;margin-top:4px}
.view-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:16px}
.view-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.dm-view-field{background:rgba(0,0,0,0.25);border:1px solid rgba(201,146,58,0.15);border-radius:3px;padding:10px 12px;margin-bottom:14px}
.custom-fields-section{margin-top:20px;padding-top:16px;border-top:2px dashed var(--border)}
.custom-field-row{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;padding:8px;background:var(--card2);border-radius:3px}
.hidden-fields-toggle{font-family:var(--font-mono);font-size:9px;color:var(--faint);cursor:pointer;text-transform:uppercase;letter-spacing:0.1em;padding:4px 8px;border:1px solid var(--border);border-radius:2px;background:transparent;transition:all 0.15s}
.hidden-fields-toggle:hover{color:var(--gold-light);border-color:var(--gold-dim)}
.field-hide-btn{padding:2px 7px;font-size:9px;background:transparent;border:1px solid var(--border);color:var(--faint);border-radius:2px;cursor:pointer;font-family:var(--font-mono);white-space:nowrap;margin-left:6px}
.field-hide-btn:hover{border-color:var(--gold-dim);color:var(--gold-light)}
/* ── CUSTOM FIELD TYPES ──────────────────────────────────────────────────── */
.cf-rating{display:flex;gap:3px;align-items:center}
.cf-star{font-size:18px;cursor:pointer;color:var(--faint);transition:color 0.1s;user-select:none;line-height:1}
.cf-star.lit{color:var(--gold)}
.cf-star:hover{color:var(--gold-light)}
.cf-progress-wrap{display:flex;align-items:center;gap:10px}
.cf-progress-bar{flex:1;height:10px;background:var(--card2);border-radius:5px;overflow:hidden;border:1px solid var(--border)}
.cf-progress-fill{height:100%;background:var(--gold-dim);border-radius:5px;transition:width 0.25s}
.cf-color-swatch{width:32px;height:28px;border-radius:3px;border:2px solid var(--border2);cursor:pointer;padding:0;overflow:hidden}
.cf-color-swatch input[type=color]{width:100%;height:100%;border:none;padding:0;cursor:pointer;opacity:0;position:absolute;top:0;left:0}
.cf-color-swatch-wrap{position:relative;display:inline-block}
.cf-tag-wrap{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.cf-tag-chip{padding:2px 8px;background:var(--gold-dim);color:var(--gold-light);border-radius:10px;font-size:11px;font-family:var(--font-mono);display:flex;align-items:center;gap:4px}
.cf-tag-chip .rm{cursor:pointer;color:var(--faint);font-size:9px}
.cf-tag-chip .rm:hover{color:var(--red)}
.cf-dice-wrap{display:flex;align-items:center;gap:8px}
.cf-dice-result{font-family:var(--font-serif);font-size:16px;color:var(--gold-light);min-width:32px;text-align:center}
.cf-dice-roll-btn{padding:3px 10px;font-size:10px;font-family:var(--font-mono);background:var(--gold-dim);color:var(--gold-light);border:1px solid var(--gold-dim);border-radius:2px;cursor:pointer;letter-spacing:0.05em;transition:all 0.15s}
.cf-dice-roll-btn:hover{background:var(--gold-light);color:var(--bg)}
.cf-separator{border:none;border-top:1px solid var(--border);margin:14px 0 10px;position:relative}
.cf-separator-label{position:absolute;top:-9px;left:10px;background:var(--card);padding:0 8px;font-family:var(--font-mono);font-size:9px;color:var(--gold-dim);text-transform:uppercase;letter-spacing:0.15em}
.cf-url-link{color:var(--gold-light);text-decoration:underline;font-size:13px;word-break:break-all}

/* ── CUSTOM STATS MODE ───────────────────────────────────────────────────── */
.custom-stat-row{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)}
.custom-stat-row:last-child{border-bottom:none}
.custom-stat-name{font-family:var(--font-serif);font-size:13px;color:var(--text)}
.custom-stat-val{font-family:var(--font-mono);font-size:13px;color:var(--gold-light);text-align:center}
.custom-stat-mod{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-align:center}
.custom-stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:10px}
.custom-stat-box{background:var(--card2);border:1px solid var(--border2);border-radius:3px;padding:10px 6px;text-align:center}
.custom-stat-box-name{font-family:var(--font-mono);font-size:8px;color:var(--faint);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px}
.custom-stat-box-val{font-family:var(--font-serif);font-size:20px;color:var(--gold-light)}
.custom-stat-box-sub{font-family:var(--font-mono);font-size:9px;color:var(--muted);margin-top:2px}
.custom-mode-badge{padding:2px 8px;background:rgba(155,114,207,0.15);border:1px solid rgba(155,114,207,0.4);border-radius:2px;font-family:var(--font-mono);font-size:9px;color:#9b72cf;letter-spacing:0.1em;text-transform:uppercase}
.formula-select{font-size:10px;font-family:var(--font-mono);padding:2px 4px;background:var(--card2);border:1px solid var(--border);color:var(--muted);border-radius:2px}
.cf-type-badge{display:inline-block;padding:1px 6px;border-radius:2px;font-family:var(--font-mono);font-size:8px;color:var(--faint);border:1px solid var(--border);text-transform:uppercase;letter-spacing:0.08em;margin-left:4px}


/* ── MOBILE LAYOUT ─────────────────────────────────────────── */
.mobile-shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.mobile-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 14px;height:52px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;gap:10px}
.mobile-topbar-title{font-family:var(--font-serif);font-size:1rem;color:var(--gold);letter-spacing:0.06em;white-space:nowrap}
.mobile-topbar select{background:var(--card2);border:1px solid var(--border2);color:var(--text);font-family:var(--font-serif);font-size:12px;padding:4px 6px;border-radius:3px;max-width:130px}
.mobile-content{flex:1;overflow:hidden;display:flex;flex-direction:column}
.mobile-bottom-nav{display:flex;background:var(--surface);border-top:1px solid var(--border);flex-shrink:0;height:58px}
.mobile-nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;color:var(--muted);transition:color 0.15s;border:none;background:transparent;padding:0;font-family:var(--font-mono);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;border-top:2px solid transparent}
.mobile-nav-btn:hover{color:var(--text)}
.mobile-nav-btn.active{color:var(--gold-light);border-top-color:var(--gold)}
.mobile-nav-btn-icon{font-size:18px;line-height:1}
/* tighter mobile page body */
.mobile-content .page-header{padding:12px 14px 10px}
.mobile-content .page-body{padding:12px 14px}
.mobile-content h1{font-size:1.1rem}
/* stack grids to single column */
.mobile-content .field-row.grid-2,
.mobile-content .field-row.grid-3,
.mobile-content .field-row.grid-4,
.mobile-content .field-row.grid-6{grid-template-columns:1fr}
/* ability scores — 3 col on mobile */
.mobile-content .field-row.grid-6{grid-template-columns:repeat(3,1fr)}
/* character cards — single col */
.mobile-content .party-grid{grid-template-columns:1fr !important}
/* world/story cards — single col */
.mobile-content [style*="minmax(260px"],[style*="minmax(280px"]{grid-template-columns:1fr}
/* tab bars — scrollable */
.mobile-content .tab-bar{overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch}
.mobile-content .tab-bar::-webkit-scrollbar{display:none}
.mobile-content .char-tabs{overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch}
.mobile-content .char-tabs::-webkit-scrollbar{display:none}
/* modal full screen on mobile */
.mobile-content .modal-overlay .modal{width:100%;max-width:100%;max-height:100vh;border-radius:0;margin:0}
/* combat panel — single col */
.mobile-content .combat-panel{grid-template-columns:1fr !important}
/* search dropdown narrower */
.mobile-content .search-dropdown{max-height:300px}
/* layout toggle button */
.layout-toggle-btn{background:transparent;border:1px solid var(--border2);color:var(--muted);font-family:var(--font-mono);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;border-radius:2px;padding:4px 8px;cursor:pointer;transition:all 0.15s;white-space:nowrap}
.layout-toggle-btn:hover{border-color:var(--gold-dim);color:var(--gold-light)}
/* card grids collapse to 1 col on mobile */
.mobile-content .card-grid{grid-template-columns:1fr !important}
/* ability score grid stays 3-col on mobile */
.mobile-content .field-row.grid-6{grid-template-columns:repeat(3,1fr) !important}
/* combat panel stacks */
.mobile-content .combat-panel{grid-template-columns:1fr !important}
/* character modal full-screen on mobile */
.mobile-shell .modal-overlay > div{width:100vw !important;max-width:100vw !important;height:100vh !important;max-height:100vh !important;border-radius:0 !important;margin:0 !important}
/* relationship web sidebar stacks on mobile */
.mobile-content [style*="gridTemplateColumns:"1fr 280px""]{grid-template-columns:1fr !important}
/* influence bar table scrolls on mobile */
.mobile-content table{font-size:10px}
.mobile-content .faction-matrix-header,.mobile-content .faction-matrix-cell{padding:4px;min-width:60px}
/* tighter cards on mobile */
.mobile-content .npc-card{padding:12px}
.mobile-content .card{padding:14px}
.mobile-content .card-sm{padding:10px}

/* Search highlight */
@keyframes searchPulse{0%{box-shadow:0 0 0 0 rgba(201,146,58,0),background:var(--card)}15%{box-shadow:0 0 0 3px rgba(201,146,58,0.7),0 0 20px rgba(201,146,58,0.3);background:rgba(201,146,58,0.12)}55%{box-shadow:0 0 0 2px rgba(201,146,58,0.35);background:rgba(201,146,58,0.06)}100%{box-shadow:0 0 0 0 rgba(201,146,58,0);background:var(--card)}}
.search-highlight{animation:searchPulse 2s ease-out 1 forwards;border-color:var(--gold) !important}
/* PHASE 2 - Global Search */
.search-wrap{position:relative;padding:10px 14px;border-bottom:1px solid var(--border)}
.search-wrap input{background:var(--card);border-color:var(--border2);font-size:12px;padding:7px 10px 7px 32px}
.search-wrap .search-icon{position:absolute;left:24px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none}
.search-dropdown{position:absolute;left:10px;right:10px;top:calc(100% - 2px);background:var(--card);border:1px solid var(--border2);border-top:none;border-radius:0 0 4px 4px;z-index:200;max-height:420px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.5)}
.search-group-label{font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);padding:8px 14px 4px;background:var(--surface);position:sticky;top:0}
.search-result{padding:8px 14px;cursor:pointer;border-bottom:1px solid rgba(46,37,24,0.4);transition:background 0.1s}
.search-result:hover,.search-result.focused{background:rgba(201,146,58,0.08)}
.search-result-name{font-size:13px;color:var(--text)}
.search-result-excerpt{font-size:11px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* PHASE 2 - Relationship Web */
.rel-graph-wrap{background:var(--card);border:1px solid var(--border);border-radius:3px;overflow:hidden;position:relative}
.rel-graph-controls{position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:10}
.rel-node{cursor:grab;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))}
.rel-node:active{cursor:grabbing}
.rel-node-popup{position:absolute;background:var(--card);border:1px solid var(--gold-dim);border-radius:3px;padding:14px;min-width:200px;z-index:20;box-shadow:0 4px 16px rgba(0,0,0,0.6)}
/* PHASE 2 - Faction Influence */
.influence-bar-wrap{background:var(--card2);border-radius:2px;height:14px;overflow:hidden;flex:1}
.influence-bar{height:100%;border-radius:2px;transition:width 0.4s}
.faction-matrix-cell{padding:8px;text-align:center;cursor:pointer;border:1px solid var(--border);transition:background 0.15s;font-family:var(--font-mono);font-size:9px;letter-spacing:0.05em;text-transform:uppercase}
.faction-matrix-cell:hover{background:rgba(201,146,58,0.1)}
.faction-matrix-header{padding:8px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);text-align:center;border:1px solid var(--border);background:var(--surface)}
`;

// ============================================================
// AUTOSAVE HOOK
// ============================================================
function useAutosave(data) {
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { saveData(data); setSaved(true); setTimeout(() => setSaved(false), 1500); }, 500);
    return () => clearTimeout(timer.current);
  }, [data]);
  return saved;
}

// ============================================================
// DICE ROLLER
// ============================================================
function rollDie(sides) { return Math.floor(Math.random() * sides) + 1; }
function rollDice(count, sides) { let t=0; for(let i=0;i<count;i++) t+=rollDie(sides); return t; }

// ============================================================
// COMPONENTS
// ============================================================

function Field({ label, children, style }) {
  return <div className="field" style={style}><label>{label}</label>{children}</div>;
}

function StatBox({ label, value, color }) {
  return (
    <div className="stat-box">
      <div className="stat-val" style={color?{color}:{}}>{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={wide?{maxWidth:900}:{}}>
        <div className="modal-header">
          <h2 style={{margin:0}}>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}


// ============================================================
// VIEW / EDIT MODAL SYSTEM
// ============================================================

function normaliseEntity(entity) {
  return { ...entity, customFields: entity.customFields || [], hiddenFields: entity.hiddenFields || [] };
}

function ViewField({ label, value, dm }) {
  const empty = <span className="view-field-empty">—</span>;
  if (dm) return (
    <div className="dm-view-field">
      <div className="view-field-label">🔒 {label}</div>
      {value ? <div className="view-field-value">{value}</div> : empty}
    </div>
  );
  return (
    <div className="view-field">
      <div className="view-field-label">{label}</div>
      {value ? <div className="view-field-value">{value}</div> : empty}
    </div>
  );
}


// ============================================================
// CUSTOM FIELD TYPE SYSTEM
// ============================================================
const FIELD_TYPES = [
  { value: "text",      label: "Short text",     icon: "T"  },
  { value: "textarea",  label: "Long text",       icon: "¶"  },
  { value: "number",    label: "Number",          icon: "#"  },
  { value: "rating",    label: "Rating (stars)",  icon: "★"  },
  { value: "checkbox",  label: "Checkbox",        icon: "☑"  },
  { value: "date",      label: "Date",            icon: "📅"  },
  { value: "dropdown",  label: "Dropdown",        icon: "▾"  },
  { value: "tags",      label: "Multi-tag",       icon: "🏷"  },
  { value: "separator", label: "Section header",  icon: "—"  },
  { value: "url",       label: "URL / Link",      icon: "🔗"  },
  { value: "dice",      label: "Dice expression", icon: "⚄"  },
  { value: "progress",  label: "Progress bar",    icon: "▮"  },
  { value: "color",     label: "Color swatch",    icon: "🎨"  },
];

// Parse a dice expression like "2d6+3" and roll it
function rollDice(expr) {
  const clean = String(expr).trim().toLowerCase();
  let total = 0;
  const parts = clean.replace(/\s/g, "").split(/(?=[+-])/);
  for (const part of parts) {
    const d = part.match(/^([+-]?\d*)d(\d+)$/);
    if (d) {
      const n = parseInt(d[1]) || 1;
      const sides = parseInt(d[2]);
      for (let i = 0; i < Math.abs(n); i++) total += (n < 0 ? -1 : 1) * (Math.floor(Math.random() * sides) + 1);
    } else {
      total += parseInt(part) || 0;
    }
  }
  return total;
}

// Render a field value in VIEW mode
function renderFieldView(f) {
  if (f.type === "separator") return (
    <div className="cf-separator"><span className="cf-separator-label">{f.label || "Section"}</span></div>
  );
  const hasValue = f.value !== "" && f.value !== null && f.value !== undefined;
  return (
    <div className="view-field" key={f.id}>
      <div className="view-field-label">{f.label}</div>
      <div className="view-field-value">
        {f.type === "rating" && (
          <span className="cf-rating">
            {[1,2,3,4,5].map(i => <span key={i} className={`cf-star${(parseInt(f.value)||0)>=i?" lit":""}`}>★</span>)}
          </span>
        )}
        {f.type === "checkbox" && (
          <span style={{fontSize:16}}>{f.value ? "☑ Yes" : "☐ No"}</span>
        )}
        {f.type === "color" && hasValue && (
          <span style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{display:"inline-block",width:20,height:20,background:f.value,borderRadius:3,border:"1px solid var(--border2)"}}/>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)"}}>{f.value}</span>
          </span>
        )}
        {f.type === "tags" && (
          <div className="cf-tag-wrap">
            {(Array.isArray(f.value) ? f.value : (f.value ? f.value.split(",").map(t=>t.trim()).filter(Boolean) : [])).map((t,i)=>(
              <span key={i} className="cf-tag-chip">{t}</span>
            ))}
          </div>
        )}
        {f.type === "progress" && (
          <div className="cf-progress-wrap">
            <div className="cf-progress-bar">
              <div className="cf-progress-fill" style={{width:`${Math.min(100,((parseInt(f.value)||0)/(parseInt(f.meta?.max)||10))*100)}%`}}/>
            </div>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)"}}>{parseInt(f.value)||0}/{parseInt(f.meta?.max)||10}</span>
          </div>
        )}
        {f.type === "url" && hasValue && (
          <a href={f.value} target="_blank" rel="noopener noreferrer" className="cf-url-link">{f.label || f.value}</a>
        )}
        {f.type === "dice" && hasValue && (
          <DiceViewField f={f}/>
        )}
        {["text","textarea","number","dropdown","date"].includes(f.type) && (
          hasValue ? <span>{String(f.value)}</span> : <span className="view-field-empty">—</span>
        )}
      </div>
    </div>
  );
}

// Dice field in view mode (needs local state for roll result)
function DiceViewField({ f }) {
  const [result, setResult] = useState(null);
  return (
    <div className="cf-dice-wrap">
      <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--text)"}}>{f.value}</span>
      <button className="cf-dice-roll-btn" onClick={() => setResult(rollDice(f.value))}>Roll</button>
      {result !== null && <span className="cf-dice-result">{result}</span>}
    </div>
  );
}

// Render a field input in EDIT mode
function FieldInput({ f, onUpdate, onMeta }) {
  if (f.type === "separator") return (
    <div>
      <input value={f.label} onChange={e => onUpdate("label", e.target.value)}
        placeholder="Section heading…"
        style={{width:"100%",fontFamily:"var(--font-mono)",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",background:"transparent",border:"none",borderBottom:"1px solid var(--border)",color:"var(--gold-dim)",padding:"2px 0"}}/>
    </div>
  );
  if (f.type === "text")     return <input value={f.value||""} onChange={e=>onUpdate("value",e.target.value)} style={{width:"100%"}}/>;
  if (f.type === "textarea") return <textarea value={f.value||""} rows={3} onChange={e=>onUpdate("value",e.target.value)} style={{width:"100%",resize:"vertical"}}/>;
  if (f.type === "number")   return <input type="number" value={f.value||""} onChange={e=>onUpdate("value",e.target.value)} style={{width:"100%"}}/>;
  if (f.type === "date")     return <input type="date" value={f.value||""} onChange={e=>onUpdate("value",e.target.value)} style={{width:"100%"}}/>;
  if (f.type === "url")      return <input type="url" value={f.value||""} onChange={e=>onUpdate("value",e.target.value)} placeholder="https://…" style={{width:"100%"}}/>;
  if (f.type === "checkbox") return (
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
      <input type="checkbox" checked={!!f.value} onChange={e=>onUpdate("value",e.target.checked)} style={{width:16,height:16}}/>
      <span style={{fontSize:13,color:"var(--text)"}}>{f.value ? "Yes" : "No"}</span>
    </label>
  );
  if (f.type === "rating") return (
    <div className="cf-rating">
      {[1,2,3,4,5].map(i=>(
        <span key={i} className={`cf-star${(parseInt(f.value)||0)>=i?" lit":""}`}
          onClick={()=>onUpdate("value", i === parseInt(f.value) ? 0 : i)}>★</span>
      ))}
      <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--faint)",marginLeft:4}}>{parseInt(f.value)||0}/5</span>
    </div>
  );
  if (f.type === "color") return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div className="cf-color-swatch-wrap">
        <div className="cf-color-swatch" style={{background:f.value||"#c9923a"}}>
          <input type="color" value={f.value||"#c9923a"} onChange={e=>onUpdate("value",e.target.value)}/>
        </div>
      </div>
      <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)"}}>{f.value||"#c9923a"}</span>
    </div>
  );
  if (f.type === "progress") {
    const cur = parseInt(f.value)||0;
    const max = parseInt(f.meta?.max)||10;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <div className="cf-progress-wrap">
          <div className="cf-progress-bar">
            <div className="cf-progress-fill" style={{width:`${Math.min(100,(cur/max)*100)}%`}}/>
          </div>
          <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)",minWidth:50}}>{cur}/{max}</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button className="btn-ghost btn-sm" onClick={()=>onUpdate("value",Math.max(0,cur-1))}>−</button>
          <input type="range" min={0} max={max} value={cur} onChange={e=>onUpdate("value",parseInt(e.target.value))} style={{flex:1}}/>
          <button className="btn-ghost btn-sm" onClick={()=>onUpdate("value",Math.min(max,cur+1))}>+</button>
          <span style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--faint)"}}>max:</span>
          <input type="number" value={max} min={1} max={100} onChange={e=>onMeta("max",parseInt(e.target.value)||10)} style={{width:40,textAlign:"center"}}/>
        </div>
      </div>
    );
  }
  if (f.type === "dice") return (
    <DiceEditField f={f} onUpdate={onUpdate}/>
  );
  if (f.type === "dropdown") return (
    <DropdownEditField f={f} onUpdate={onUpdate} onMeta={onMeta}/>
  );
  if (f.type === "tags") return (
    <TagsEditField f={f} onUpdate={onUpdate} onMeta={onMeta}/>
  );
  return <input value={f.value||""} onChange={e=>onUpdate("value",e.target.value)} style={{width:"100%"}}/>;
}

function DiceEditField({ f, onUpdate }) {
  const [result, setResult] = useState(null);
  return (
    <div className="cf-dice-wrap">
      <input value={f.value||""} onChange={e=>{onUpdate("value",e.target.value);setResult(null);}}
        placeholder="e.g. 2d6+3" style={{flex:1,fontFamily:"var(--font-mono)"}}/>
      <button className="cf-dice-roll-btn" onClick={()=>setResult(rollDice(f.value))}>Roll</button>
      {result !== null && <span className="cf-dice-result">{result}</span>}
    </div>
  );
}

function DropdownEditField({ f, onUpdate, onMeta }) {
  const options = Array.isArray(f.meta?.options) ? f.meta.options : [];
  const [newOpt, setNewOpt] = useState("");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <select value={f.value||""} onChange={e=>onUpdate("value",e.target.value)} style={{width:"100%"}}>
        <option value="">— Select —</option>
        {options.map((o,i)=><option key={i} value={o}>{o}</option>)}
      </select>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
        {options.map((o,i)=>(
          <span key={i} style={{display:"flex",alignItems:"center",gap:3,padding:"1px 6px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:2,fontSize:10,fontFamily:"var(--font-mono)"}}>
            {o}
            <span style={{cursor:"pointer",color:"var(--faint)",fontSize:9}} onClick={()=>onMeta("options",options.filter((_,j)=>j!==i))}>✕</span>
          </span>
        ))}
        <input value={newOpt} onChange={e=>setNewOpt(e.target.value)} placeholder="Add option…"
          style={{width:100,fontSize:10}} onKeyDown={e=>{if(e.key==="Enter"&&newOpt.trim()){onMeta("options",[...options,newOpt.trim()]);setNewOpt("");}}}/>
        <button className="btn-ghost btn-sm" style={{fontSize:9}} onClick={()=>{if(newOpt.trim()){onMeta("options",[...options,newOpt.trim()]);setNewOpt("");}}}>+</button>
      </div>
    </div>
  );
}

function TagsEditField({ f, onUpdate, onMeta }) {
  const tags = Array.isArray(f.value) ? f.value : (f.value ? f.value.split(",").map(t=>t.trim()).filter(Boolean) : []);
  const presets = Array.isArray(f.meta?.presets) ? f.meta.presets : [];
  const [newTag, setNewTag] = useState("");
  function addTag(t) {
    const clean = t.trim();
    if (clean && !tags.includes(clean)) onUpdate("value", [...tags, clean]);
  }
  function removeTag(t) { onUpdate("value", tags.filter(x=>x!==t)); }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div className="cf-tag-wrap">
        {tags.map((t,i)=>(
          <span key={i} className="cf-tag-chip">{t}<span className="rm" onClick={()=>removeTag(t)}>✕</span></span>
        ))}
        <input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="Add tag…"
          style={{minWidth:80,flex:1,fontSize:11}} onKeyDown={e=>{if(e.key==="Enter"&&newTag.trim()){addTag(newTag);setNewTag("");}}}/>
      </div>
      {presets.length > 0 && (
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {presets.filter(p=>!tags.includes(p)).map((p,i)=>(
            <button key={i} className="btn-ghost btn-sm" style={{fontSize:9}} onClick={()=>addTag(p)}>{p}</button>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        <span style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--faint)"}}>preset tags:</span>
        <input value={(f.meta?.presets||[]).join(", ")} onChange={e=>onMeta("presets",e.target.value.split(",").map(t=>t.trim()).filter(Boolean))}
          placeholder="Option1, Option2, …" style={{flex:1,fontSize:10,fontFamily:"var(--font-mono)"}}/>
      </div>
    </div>
  );
}

function CustomFieldsEditor({ entity, onChange }) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");
  const [showHidden, setShowHidden] = useState(false);

  const customFields = entity.customFields || [];
  const hiddenFields = entity.hiddenFields || [];

  function addField() {
    if (!newLabel.trim() && newType !== "separator") return;
    const label = newType === "separator" ? (newLabel.trim() || "Section") : newLabel.trim();
    const field = { id: `cf_${Date.now()}`, label, type: newType, value: newType === "checkbox" ? false : newType === "rating" ? 0 : "", meta: {} };
    onChange({ ...entity, customFields: [...customFields, field] });
    setNewLabel(""); setAdding(false);
  }
  function removeCustomField(id) {
    onChange({ ...entity, customFields: customFields.filter(f => f.id !== id) });
  }
  function updateCustomField(id, value) {
    onChange({ ...entity, customFields: customFields.map(f => f.id === id ? { ...f, value } : f) });
  }
  function renameCustomField(id, label) {
    onChange({ ...entity, customFields: customFields.map(f => f.id === id ? { ...f, label } : f) });
  }
  function metaCustomField(id, key, val) {
    onChange({ ...entity, customFields: customFields.map(f => f.id === id ? { ...f, meta: { ...f.meta, [key]: val } } : f) });
  }
  function restoreDefault(key) {
    onChange({ ...entity, hiddenFields: hiddenFields.filter(k => k !== key) });
  }

  const fields = customFields;
  const onUpdate = updateCustomField;
  const onRename = renameCustomField;
  const onRemove = removeCustomField;
  const onMetaUpdate = metaCustomField;

  return (
    <div className="custom-fields-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 11, color: "var(--gold-dim)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Custom Fields</div>
        <div style={{ display: "flex", gap: 6 }}>
          {hiddenFields.length > 0 && (
            <button className="hidden-fields-toggle" onClick={() => setShowHidden(h => !h)}>
              {showHidden ? "Hide" : `Restore ${hiddenFields.length} hidden`}
            </button>
          )}
          <button className="btn-ghost btn-sm" onClick={() => setAdding(a => !a)}>+ Add Field</button>
        </div>
      </div>

      {showHidden && hiddenFields.length > 0 && (
        <div style={{ marginBottom: 12, padding: "8px 10px", background: "var(--card2)", borderRadius: 3 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--faint)", textTransform: "uppercase", marginBottom: 6 }}>Hidden Default Fields</div>
          {hiddenFields.map(k => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{k}</span>
              <button className="btn-ghost btn-sm" style={{ fontSize: 9 }} onClick={() => restoreDefault(k)}>Restore</button>
            </div>
          ))}
        </div>
      )}

      {fields.map(f => {
        if (f.type === "separator") return (
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
            <div style={{flex:1}}>
              <FieldInput f={f} onUpdate={(k,v)=>k==="label"?onRename(f.id,v):onUpdate(f.id,v)} onMeta={(k,v)=>onMetaUpdate(f.id,k,v)}/>
            </div>
            <button className="btn-danger btn-sm" style={{flexShrink:0}} onClick={()=>onRemove(f.id)}>✕</button>
          </div>
        );
        return (
          <div key={f.id} className="custom-field-row">
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                <input value={f.label} onChange={e=>onRename(f.id,e.target.value)}
                  style={{fontSize:10,fontFamily:"var(--font-mono)",flex:1,textTransform:"uppercase",letterSpacing:"0.1em",background:"transparent",border:"none",borderBottom:"1px solid var(--border)",color:"var(--muted)",padding:"2px 0"}}
                  placeholder="Field name"/>
                <span className="cf-type-badge">{FIELD_TYPES.find(t=>t.value===f.type)?.icon||"T"} {f.type}</span>
              </div>
              <FieldInput f={f} onUpdate={(k,v)=>onUpdate(f.id,v)} onMeta={(k,v)=>onMetaUpdate(f.id,k,v)}/>
            </div>
            <button className="btn-danger btn-sm" style={{marginTop:20,flexShrink:0}} onClick={()=>onRemove(f.id)}>✕</button>
          </div>
        );
      })}

      {adding && (
        <div style={{ padding: "10px", background: "var(--card2)", borderRadius: 3, border: "1px solid var(--border2)", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Field name…" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && addField()}/>
            <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: 150 }}>
              {FIELD_TYPES.map(t=>(
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary btn-sm" onClick={addField}>Add</button>
            <button className="btn-ghost btn-sm" onClick={() => { setAdding(false); setNewLabel(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewEditModal({ title, entity, onClose, onDelete, onUpdate, deleteLabel = "Delete", renderView, renderEdit, initialMode = "view" }) {
  const [mode, setMode] = useState(initialMode);
  const norm = normaliseEntity(entity);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 900, display: "flex", flexDirection: "column", maxHeight: "88vh", padding: 0 }}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-mode-bar">
          <div className="mode-toggle-btn">
            <button className={mode === "view" ? "active" : ""} onClick={() => setMode("view")}>👁 View</button>
            <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>✏ Edit</button>
          </div>
          {mode === "edit" && (
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button className="btn-danger btn-sm" onClick={onDelete}>{deleteLabel}</button>
              <button className="btn-primary btn-sm" onClick={onClose}>Done</button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {mode === "view"
            ? <div className="view-body">{renderView(norm)}</div>
            : <div className="edit-body">{renderEdit(norm, onUpdate)}<CustomFieldsEditor entity={norm} onChange={onUpdate}/></div>
          }
        </div>
      </div>
    </div>
  );
}


// ── TAB FIELD MANAGER ────────────────────────────────────────────────────────
// Normalises tabConfig on a char (backwards compat with chars saved before this feature)
const TABS_LIST = ["core","combat","skills","inventory","spells","features","notes"];
function getTabCfg(char, tabName) {
  const tc = char.tabConfig || {};
  return { hidden: tc[tabName]?.hidden || [], custom: tc[tabName]?.custom || [] };
}
function setTabCfg(char, tabName, cfg) {
  const tc = JSON.parse(JSON.stringify(char.tabConfig || {}));
  TABS_LIST.forEach(t => { if (!tc[t]) tc[t] = {hidden:[],custom:[]}; });
  tc[tabName] = cfg;
  return { ...char, tabConfig: tc };
}

// HF = HideableField: wraps a Field with a hide button in edit mode, hides entirely when in hidden list
function HF({ label, fieldKey, hidden, onHide, children }) {
  if (hidden.includes(fieldKey)) return null;
  return (
    <Field label={<span style={{display:"flex",alignItems:"center",gap:4}}>
      {label}
      <button className="field-hide-btn" onClick={() => onHide(fieldKey)}>hide</button>
    </span>}>
      {children}
    </Field>
  );
}

// Per-tab custom fields manager (used inside edit sections)
function TabCustomFields({ char, tabName, onChange }) {
  const cfg = getTabCfg(char, tabName);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");
  const [showHidden, setShowHidden] = useState(false);

  function hide(key) {
    onChange(setTabCfg(char, tabName, { ...cfg, hidden: [...cfg.hidden, key] }));
  }
  function restore(key) {
    onChange(setTabCfg(char, tabName, { ...cfg, hidden: cfg.hidden.filter(k => k !== key) }));
  }
  function addCustom() {
    if (!newLabel.trim() && newType !== "separator") return;
    const label = newType === "separator" ? (newLabel.trim() || "Section") : newLabel.trim();
    const field = { id: `cf_${Date.now()}`, label, type: newType, value: newType === "checkbox" ? false : newType === "rating" ? 0 : "", meta: {} };
    onChange(setTabCfg(char, tabName, { ...cfg, custom: [...cfg.custom, field] }));
    setNewLabel(""); setAdding(false);
  }
  function updateCustom(id, value) {
    onChange(setTabCfg(char, tabName, { ...cfg, custom: cfg.custom.map(f => f.id === id ? { ...f, value } : f) }));
  }
  function renameCustom(id, label) {
    onChange(setTabCfg(char, tabName, { ...cfg, custom: cfg.custom.map(f => f.id === id ? { ...f, label } : f) }));
  }
  function removeCustom(id) {
    onChange(setTabCfg(char, tabName, { ...cfg, custom: cfg.custom.filter(f => f.id !== id) }));
  }
  function metaCustom(id, key, val) {
    onChange(setTabCfg(char, tabName, { ...cfg, custom: cfg.custom.map(f => f.id === id ? { ...f, meta: { ...f.meta, [key]: val } } : f) }));
  }

  return (
    <div className="custom-fields-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 11, color: "var(--gold-dim)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Custom Fields</div>
        <div style={{ display: "flex", gap: 6 }}>
          {cfg.hidden.length > 0 && (
            <button className="hidden-fields-toggle" onClick={() => setShowHidden(h => !h)}>
              {showHidden ? "Hide" : `Restore ${cfg.hidden.length} hidden`}
            </button>
          )}
          <button className="btn-ghost btn-sm" onClick={() => setAdding(a => !a)}>+ Add Field</button>
        </div>
      </div>

      {showHidden && cfg.hidden.length > 0 && (
        <div style={{ marginBottom: 12, padding: "8px 10px", background: "var(--card2)", borderRadius: 3 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--faint)", textTransform: "uppercase", marginBottom: 6 }}>Hidden Default Fields</div>
          {cfg.hidden.map(k => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{k}</span>
              <button className="btn-ghost btn-sm" style={{ fontSize: 9 }} onClick={() => restore(k)}>Restore</button>
            </div>
          ))}
        </div>
      )}

      {cfg.custom.map(f => {
        if (f.type === "separator") return (
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
            <div style={{flex:1}}>
              <FieldInput f={f} onUpdate={(k,v)=>k==="label"?renameCustom(f.id,v):updateCustom(f.id,v)} onMeta={(k,v)=>metaCustom(f.id,k,v)}/>
            </div>
            <button className="btn-danger btn-sm" style={{flexShrink:0}} onClick={()=>removeCustom(f.id)}>✕</button>
          </div>
        );
        return (
          <div key={f.id} className="custom-field-row">
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                <input value={f.label} onChange={e=>renameCustom(f.id,e.target.value)}
                  style={{fontSize:10,fontFamily:"var(--font-mono)",flex:1,textTransform:"uppercase",letterSpacing:"0.1em",background:"transparent",border:"none",borderBottom:"1px solid var(--border)",color:"var(--muted)",padding:"2px 0"}}
                  placeholder="Field name"/>
                <span className="cf-type-badge">{FIELD_TYPES.find(t=>t.value===f.type)?.icon||"T"} {f.type}</span>
              </div>
              <FieldInput f={f} onUpdate={(k,v)=>updateCustom(f.id,v)} onMeta={(k,v)=>metaCustom(f.id,k,v)}/>
            </div>
            <button className="btn-danger btn-sm" style={{marginTop:20,flexShrink:0}} onClick={()=>removeCustom(f.id)}>✕</button>
          </div>
        );
      })}

      {adding && (
        <div style={{ padding: "10px", background: "var(--card2)", borderRadius: 3, border: "1px solid var(--border2)", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Field name…" style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && addCustom()}/>
            <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: 150 }}>
              {FIELD_TYPES.map(t=>(
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-primary btn-sm" onClick={addCustom}>Add</button>
            <button className="btn-ghost btn-sm" onClick={() => { setAdding(false); setNewLabel(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHARACTER SHEET
// ============================================================
function CharacterSheet({ char, onChange, initialMode = "view" }) {
  const [tab, setTab] = useState("core");
  const [mode, setMode] = useState(initialMode);
  const pb = profBonus(char.level || 1);

  function update(path, value) {
    const parts = path.split(".");
    const next = JSON.parse(JSON.stringify(char));
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length-1]] = value;
    onChange(next);
  }

  function updateAbility(ab, val) {
    const v = Math.max(1, Math.min(30, parseInt(val)||10));
    onChange({...char, abilities:{...char.abilities,[ab]:v}});
  }

  const TABS = ["core","combat","skills","inventory","spells","features","notes"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Mode bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 20px",background:"var(--card2)",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <div className="mode-toggle-btn">
          <button className={mode==="view"?"active":""} onClick={()=>setMode("view")}>👁 View</button>
          <button className={mode==="edit"?"active":""} onClick={()=>setMode("edit")}>✏ Edit</button>
        </div>
        {mode==="view" && <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--faint)",letterSpacing:"0.1em"}}>Read-only — click Edit to make changes</span>}
        {mode==="edit" && <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--gold-dim)",letterSpacing:"0.1em"}}>Editing mode — changes save automatically</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {char.customStatsMode && <span className="custom-mode-badge">Custom Stats</span>}
          {mode==="edit" && (
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontFamily:"var(--font-mono)",fontSize:10,color:"var(--muted)",userSelect:"none"}}>
              <input type="checkbox" checked={!!char.customStatsMode}
                onChange={e=>onChange({...char,customStatsMode:e.target.checked})}
                style={{accentColor:"#9b72cf"}}/>
              Custom Stats Mode
            </label>
          )}
        </div>
      </div>
      <div className="char-tabs">
        {TABS.map(t => <button key={t} className={`char-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t}</button>)}
      </div>
      <div className="page-body">
        {tab==="core" && <CoreTab char={char} update={update} updateAbility={updateAbility} pb={pb} readOnly={mode==="view"} onChange={onChange}/>}
        {tab==="combat" && <CombatStatsTab char={char} update={update} pb={pb} readOnly={mode==="view"} onChange={onChange}/>}
        {tab==="skills" && <SkillsTab char={char} update={update} pb={pb} readOnly={mode==="view"} onChange={onChange}/>}
        {tab==="inventory" && <InventoryTab char={char} onChange={onChange} readOnly={mode==="view"}/>}
        {tab==="spells" && <SpellsTab char={char} onChange={onChange} readOnly={mode==="view"}/>}
        {tab==="features" && <FeaturesTab char={char} onChange={onChange} readOnly={mode==="view"}/>}
        {tab==="notes" && <NotesTab char={char} update={update} readOnly={mode==="view"} onChange={onChange}/>}
      </div>
    </div>
  );
}


// ============================================================
// CUSTOM STATS BLOCK (Option E — non-D&D mode)
// ============================================================
// formula: "dnd" = (score-10)/2 floored | "raw" = score as-is | "pct" = show as percentage
function calcStatMod(stat) {
  const v = parseFloat(stat.value) || 0;
  if (stat.formula === "dnd") return Math.floor((v - 10) / 2);
  if (stat.formula === "pct") return null; // no modifier shown
  return null; // "raw" — value is the modifier/score itself, no derived mod
}

function CustomStatsBlock({ char, onChange, readOnly }) {
  const stats = char.customStats || [];

  function addStat() {
    const s = { id: `cs_${Date.now()}`, name: "New Stat", value: 10, formula: "dnd" };
    onChange({ ...char, customStats: [...stats, s] });
  }
  function updateStat(id, field, val) {
    onChange({ ...char, customStats: stats.map(s => s.id === id ? { ...s, [field]: val } : s) });
  }
  function removeStat(id) {
    onChange({ ...char, customStats: stats.filter(s => s.id !== id) });
  }

  // VIEW MODE
  if (readOnly) return (
    <div>
      <div className="view-section-title">Stats</div>
      {stats.length === 0 && <div className="list-empty">No custom stats defined.</div>}
      <div className="custom-stats-grid">
        {stats.map(s => {
          const m = calcStatMod(s);
          return (
            <div key={s.id} className="custom-stat-box">
              <div className="custom-stat-box-name">{s.name}</div>
              <div className="custom-stat-box-val">
                {s.formula === "dnd" ? fmtMod(m) : String(s.value)}{s.formula === "pct" ? "%" : ""}
              </div>
              {s.formula === "dnd" && (
                <div className="custom-stat-box-sub">{s.value}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // EDIT MODE
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Custom Stats</h3>
        <button className="btn-ghost btn-sm" onClick={addStat}>+ Add Stat</button>
      </div>
      {stats.length === 0 && (
        <div className="list-empty" style={{ marginBottom: 10 }}>
          No stats yet — click + Add Stat to begin.
        </div>
      )}
      {stats.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 32px", gap: 8, marginBottom: 6 }}>
            {["Stat Name", "Value", "Formula", ""].map((h, i) => (
              <label key={i} style={{ margin: 0, fontSize: 9, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</label>
            ))}
          </div>
          {stats.map(s => {
            const m = calcStatMod(s);
            return (
              <div key={s.id} className="custom-stat-row">
                <input
                  value={s.name}
                  onChange={e => updateStat(s.id, "name", e.target.value)}
                  style={{ fontFamily: "var(--font-serif)", fontSize: 13 }}
                  placeholder="Stat name"
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    value={s.value}
                    onChange={e => updateStat(s.id, "value", parseFloat(e.target.value) || 0)}
                    style={{ textAlign: "center", width: "100%" }}
                  />
                </div>
                <select
                  className="formula-select"
                  value={s.formula}
                  onChange={e => updateStat(s.id, "formula", e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="dnd">D&D mod (÷2−5)</option>
                  <option value="raw">Raw value</option>
                  <option value="pct">Percentage %</option>
                </select>
                <button className="btn-danger btn-sm" onClick={() => removeStat(s.id)}>✕</button>
              </div>
            );
          })}
          <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--faint)", lineHeight: 1.7 }}>
            <strong>D&D mod</strong>: shows modifier like +2 (score 14) · <strong>Raw</strong>: score displayed as-is · <strong>%</strong>: appends % sign
          </div>
        </div>
      )}
    </div>
  );
}

function CoreTab({ char, update, updateAbility, pb, readOnly, onChange }) {
  const cfg = getTabCfg(char, "core");
  const H = cfg.hidden;
  function hide(k) { onChange(setTabCfg(char, "core", { ...cfg, hidden: [...H, k] })); }
  if (readOnly) return (
    <div>
      {!H.includes("identity") && <><div className="view-section-title">Identity</div>
      <div className="view-grid">
        {!H.includes("name") && <ViewField label="Name" value={char.name}/>}
        {!H.includes("playerName") && <ViewField label="Player" value={char.playerName}/>}
        {!H.includes("race") && <ViewField label="Race" value={char.race}/>}
        {!H.includes("charClass") && <ViewField label="Class" value={char.charClass}/>}
        {!H.includes("subclass") && <ViewField label="Subclass" value={char.subclass}/>}
        {!H.includes("level") && <ViewField label="Level" value={String(char.level)}/>}
        {!H.includes("background") && <ViewField label="Background" value={char.background}/>}
        {!H.includes("alignment") && <ViewField label="Alignment" value={char.alignment}/>}
        {!H.includes("xp") && <ViewField label="XP" value={(char.xp||0).toLocaleString()}/>}
      </div></>}
      {!H.includes("hp") && <><div className="view-section-title">Hit Points</div>
      <div className="view-grid">
        <ViewField label="Current HP" value={String(char.hp.current)}/>
        <ViewField label="Max HP" value={String(char.hp.max)}/>
        {char.hp.temp > 0 && <ViewField label="Temp HP" value={String(char.hp.temp)}/>}
        {!H.includes("hitDice") && <ViewField label="Hit Dice" value={char.hitDice.type}/>}
      </div></>}
      {!H.includes("abilities") && (!char.customStatsMode ? (
        <><div className="view-section-title">Ability Scores</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:16}}>
          {ABILITIES.map(ab=>{const m=Math.floor((char.abilities[ab]-10)/2);return(<div key={ab} style={{textAlign:"center",background:"var(--card2)",padding:"10px 4px",borderRadius:3}}><div style={{fontFamily:"var(--font-mono)",fontSize:8,color:"var(--faint)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{ab}</div><div style={{fontFamily:"var(--font-serif)",fontSize:20,color:"var(--gold-light)"}}>{m>=0?"+"+m:m}</div><div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--muted)"}}>{char.abilities[ab]}</div></div>);})}
        </div></>
      ) : (
        <CustomStatsBlock char={char} onChange={onChange} readOnly={true}/>
      ))}
      {!H.includes("conditions") && char.conditions?.length>0 && <><div className="view-section-title">Conditions</div><div>{char.conditions.map(c=><span key={c} className="condition-chip">{c}</span>)}</div></>}
      {cfg.custom.map(f=>renderFieldView(f))}
    </div>
  );
  return (
    <div>
      {/* Identity */}
      {!H.includes("identity") && <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h3 style={{margin:0}}>Identity</h3><button className="field-hide-btn" onClick={()=>hide("identity")}>hide section</button></div>
        <div className="field-row grid-3">
          <HF label="Character Name" fieldKey="name" hidden={H} onHide={hide}><input value={char.name} onChange={e=>update("name",e.target.value)}/></HF>
          <HF label="Player Name" fieldKey="playerName" hidden={H} onHide={hide}><input value={char.playerName} onChange={e=>update("playerName",e.target.value)}/></HF>
          <HF label="Level" fieldKey="level" hidden={H} onHide={hide}><input type="number" min="1" max="20" value={char.level} onChange={e=>update("level",parseInt(e.target.value)||1)}/></HF>
        </div>
        <div className="field-row grid-3">
          <HF label="Race" fieldKey="race" hidden={H} onHide={hide}><input value={char.race} onChange={e=>update("race",e.target.value)}/></HF>
          <HF label="Class" fieldKey="charClass" hidden={H} onHide={hide}><input value={char.charClass} onChange={e=>update("charClass",e.target.value)}/></HF>
          <HF label="Subclass" fieldKey="subclass" hidden={H} onHide={hide}><input value={char.subclass} onChange={e=>update("subclass",e.target.value)}/></HF>
        </div>
        <div className="field-row grid-3">
          <HF label="Background" fieldKey="background" hidden={H} onHide={hide}><input value={char.background} onChange={e=>update("background",e.target.value)}/></HF>
          <HF label="Alignment" fieldKey="alignment" hidden={H} onHide={hide}><select value={char.alignment} onChange={e=>update("alignment",e.target.value)}>{ALIGNMENTS.map(a=><option key={a}>{a}</option>)}</select></HF>
          <HF label="XP" fieldKey="xp" hidden={H} onHide={hide}><input type="number" min="0" value={char.xp} onChange={e=>update("xp",parseInt(e.target.value)||0)}/></HF>
        </div>
      </div>}

      {/* Health */}
      <div className="card">
        <h3>Health</h3>
        <div className="field-row" style={{gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr"}}>
          <div>
            <label>Current HP</label>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button className="btn-ghost btn-sm" onClick={()=>update("hp.current",Math.max(0,char.hp.current-1))}>−</button>
              <input type="number" value={char.hp.current} style={{textAlign:"center"}} onChange={e=>update("hp.current",parseInt(e.target.value)||0)}/>
              <button className="btn-ghost btn-sm" onClick={()=>update("hp.current",Math.min(char.hp.max+char.hp.temp,char.hp.current+1))}>+</button>
            </div>
          </div>
          <Field label="Max HP"><input type="number" min="0" value={char.hp.max} onChange={e=>update("hp.max",parseInt(e.target.value)||0)}/></Field>
          <Field label="Temp HP"><input type="number" min="0" value={char.hp.temp} onChange={e=>update("hp.temp",parseInt(e.target.value)||0)}/></Field>
          <Field label="Hit Die"><input value={char.hitDice.type} onChange={e=>update("hitDice.type",e.target.value)} placeholder="d8"/></Field>
          <Field label="Remaining"><input type="number" min="0" max={char.level} value={char.hitDice.remaining} onChange={e=>update("hitDice.remaining",parseInt(e.target.value)||0)}/></Field>
        </div>
        {/* HP bar */}
        <div style={{background:"var(--card2)",borderRadius:3,height:8,margin:"8px 0 12px",overflow:"hidden"}}>
          <div style={{height:"100%",background:char.hp.current/char.hp.max>0.5?"var(--green)":char.hp.current/char.hp.max>0.25?"var(--gold)":"var(--red)",width:`${Math.min(100,(char.hp.current/Math.max(1,char.hp.max))*100)}%`,transition:"width 0.3s,background 0.3s"}}/>
        </div>
        {/* Death saves */}
        <div style={{display:"flex",gap:24}}>
          <div className="death-save-row"><span style={{color:"var(--green)"}}>Successes</span>{[0,1,2].map(i=><input key={i} type="checkbox" checked={char.deathSaves.successes[i]} onChange={e=>{const a=[...char.deathSaves.successes];a[i]=e.target.checked;update("deathSaves.successes",a)}}/>)}</div>
          <div className="death-save-row"><span style={{color:"var(--red)"}}>Failures</span>{[0,1,2].map(i=><input key={i} type="checkbox" checked={char.deathSaves.failures[i]} onChange={e=>{const a=[...char.deathSaves.failures];a[i]=e.target.checked;update("deathSaves.failures",a)}}/>)}</div>
        </div>
      </div>

      {/* Ability Scores — D&D or Custom */}
      {!char.customStatsMode ? (
        <div className="card">
          <h3>Ability Scores — Proficiency Bonus: {fmtMod(pb)}</h3>
          <div className="field-row grid-6">
            {ABILITIES.map(ab=>(
              <div key={ab} className="ability-box">
                <span className="ability-label">{ab}</span>
                <div className="ability-mod">{fmtMod(mod(char.abilities[ab]))}</div>
                <input type="number" className="ability-score-input" min="1" max="30" value={char.abilities[ab]} onChange={e=>updateAbility(ab,e.target.value)}/>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CustomStatsBlock char={char} onChange={onChange} readOnly={false}/>
      )}

      {/* Conditions */}
      {!H.includes("conditions") && <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h3 style={{margin:0}}>Active Conditions</h3><button className="field-hide-btn" onClick={()=>hide("conditions")}>hide section</button></div>
        <div style={{marginBottom:8}}>
          {char.conditions && char.conditions.map(c=>(
            <span key={c} className="condition-chip">{c} <span style={{cursor:"pointer",marginLeft:4}} onClick={()=>onChange&&onChange({...char,conditions:char.conditions.filter(x=>x!==c)})}>✕</span></span>
          ))}
          {(!char.conditions||char.conditions.length===0)&&<span style={{color:"var(--faint)",fontSize:13,fontStyle:"italic"}}>No active conditions</span>}
        </div>
        <select onChange={e=>{if(e.target.value&&(!char.conditions||!char.conditions.includes(e.target.value))){const nc=[...(char.conditions||[]),e.target.value];update("conditions",nc)}e.target.value=""}}>
          <option value="">+ Add condition...</option>
          {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>}
      <TabCustomFields char={char} tabName="core" onChange={onChange}/>
    </div>
  );
}

function CombatStatsTab({ char, update, pb, readOnly, onChange }) {
  const cfg = getTabCfg(char, "combat");
  const H = cfg.hidden;
  function hide(k) { onChange(setTabCfg(char, "combat", { ...cfg, hidden: [...H, k] })); }
  const dexMod = mod(char.abilities.DEX);
  if (readOnly) return (
    <div>
      {!H.includes("stats") && <><div className="view-section-title">Combat Stats</div>
      <div className="view-grid">
        {!H.includes("ac") && <ViewField label="Armor Class" value={String(char.ac)}/>}
        {!H.includes("initiative") && !char.customStatsMode && <ViewField label="Initiative" value={(dexMod>=0?"+":"")+dexMod}/>}
        {!H.includes("speed") && <ViewField label="Speed" value={`${char.speed} ft`}/>}
        <ViewField label="Proficiency Bonus" value={`+${pb}`}/>
        {!H.includes("spellDC") && char.spellSaveDC>0 && <ViewField label="Spell Save DC" value={String(char.spellSaveDC)}/>}
      </div></>}
      {!H.includes("saves") && !char.customStatsMode && <><div className="view-section-title">Saving Throws</div>
      <div className="view-grid">
        {ABILITIES.map(ab=>{const prof=char.saves[ab]?.proficient;const m=Math.floor((char.abilities[ab]-10)/2)+(prof?pb:0);return <ViewField key={ab} label={ABILITY_FULL[ab]} value={(m>=0?"+":"")+m+(prof?" (prof)":"")}/>;})}
      </div></>}
      {!H.includes("attacks") && char.attacks?.length>0 && <><div className="view-section-title">Attacks</div>{char.attacks.map((a,i)=><div key={i} style={{display:"flex",gap:16,padding:"6px 0",borderBottom:"1px solid var(--border)"}}><span style={{flex:1,fontFamily:"var(--font-serif)",fontSize:13}}>{a.name}</span><span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gold-light)"}}>{a.bonus}</span><span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)"}}>{a.damage}</span></div>)}</>}
      {cfg.custom.map(f=>renderFieldView(f))}
    </div>
  );
  const intMod = mod(char.abilities.INT);
  const wisMod = mod(char.abilities.WIS);
  const saves = ABILITIES.map(ab=>({ab, total: mod(char.abilities[ab])+(char.saves[ab]?.proficient?pb:0)}));

  return (
    <div>
      {!H.includes("stats") && <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h3 style={{margin:0}}>Combat Stats</h3><button className="field-hide-btn" onClick={()=>hide("stats")}>hide section</button></div>
        <div className="field-row" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
          <div className="stat-box"><div className="stat-val">{char.ac}</div><div className="stat-lbl">Armor Class</div></div>
          {!char.customStatsMode && <div className="stat-box"><div className="stat-val">{fmtMod(dexMod)}</div><div className="stat-lbl">Initiative</div></div>}
          <div className="stat-box"><div className="stat-val">{char.speed} ft</div><div className="stat-lbl">Speed</div></div>
          <div className="stat-box"><div className="stat-val">{10+wisMod+pb}</div><div className="stat-lbl">Pass. Perception</div></div>
          <div className="stat-box"><div className="stat-val">{char.spellSaveDC||8+pb+intMod}</div><div className="stat-lbl">Spell Save DC</div></div>
        </div>
        <div className="field-row grid-3" style={{marginTop:16}}>
          <HF label="Armor Class" fieldKey="ac" hidden={H} onHide={hide}><input type="number" value={char.ac} onChange={e=>update("ac",parseInt(e.target.value)||10)}/></HF>
          <HF label="Speed (ft)" fieldKey="speed" hidden={H} onHide={hide}><input type="number" value={char.speed} onChange={e=>update("speed",parseInt(e.target.value)||30)}/></HF>
          <HF label="Custom Spell DC" fieldKey="spellDC" hidden={H} onHide={hide}><input type="number" value={char.spellSaveDC} onChange={e=>update("spellSaveDC",parseInt(e.target.value)||0)}/></HF>
        </div>
      </div>}

      {!H.includes("saves") && !char.customStatsMode && <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h3 style={{margin:0}}>Saving Throws</h3><button className="field-hide-btn" onClick={()=>hide("saves")}>hide section</button></div>
        <div className="field-row grid-3">
          {ABILITIES.map(ab=>{
            const prof = char.saves[ab]?.proficient;
            const total = mod(char.abilities[ab])+(prof?pb:0);
            return (
              <div key={ab} style={{display:"flex",alignItems:"center",gap:8,background:"var(--card2)",border:"1px solid var(--border2)",padding:"8px 12px",borderRadius:3}}>
                <input type="checkbox" checked={prof} onChange={e=>{const s={...char.saves,[ab]:{proficient:e.target.checked}};update("saves",s)}}/>
                <span style={{flex:1,fontSize:13}}>{ABILITY_FULL[ab]}</span>
                <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--gold-light)"}}>{fmtMod(total)}</span>
              </div>
            );
          })}
        </div>
      </div>}
      {char.customStatsMode && <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <h3 style={{margin:0}}>Saving Throws / Defenses</h3>
          <span className="custom-mode-badge">Custom</span>
        </div>
        <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--faint)",marginBottom:8}}>Add saving throws as custom fields below using the Custom Fields section.</div>
      </div>}
      <TabCustomFields char={char} tabName="combat" onChange={onChange}/>
    </div>
  );
}

function SkillsTab({ char, update, pb, readOnly, onChange }) {
  const cfg = getTabCfg(char, "skills");
  const H = cfg.hidden;
  function hide(k) { onChange(setTabCfg(char, "skills", { ...cfg, hidden: [...H, k] })); }
  if (readOnly) return (
    <div>
      {!char.customStatsMode && !H.includes("skills") && <><div className="view-section-title">Skills</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
        {SKILLS_DATA.filter(sk=>!H.includes(sk.name)).map(sk=>{
          const base=Math.floor((char.abilities[sk.ability]-10)/2);
          const prof=char.skills[sk.name]?.proficient;
          const exp=char.skills[sk.name]?.expertise;
          const total=base+(prof?pb:0)+(exp?pb:0);
          return (<div key={sk.name} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px",background:prof||exp?"rgba(201,146,58,0.05)":"transparent",borderRadius:2}}>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gold-light)",width:28,textAlign:"right"}}>{total>=0?"+":""}{total}</span>
            <span style={{fontSize:12,color:prof||exp?"var(--text)":"var(--muted)",flex:1}}>{sk.name}</span>
            <span style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--faint)"}}>{sk.ability}</span>
            {exp&&<span style={{fontSize:9,color:"var(--teal)"}}>EXP</span>}
            {prof&&!exp&&<span style={{fontSize:9,color:"var(--gold-dim)"}}>PROF</span>}
          </div>);
        })}
      </div></>}
      {cfg.custom.map(f=>renderFieldView(f))}
    </div>
  );
  return (
    <div>
      {!char.customStatsMode && !H.includes("skills") && <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h3 style={{margin:0}}>Skills</h3><button className="field-hide-btn" onClick={()=>hide("skills")}>hide all</button></div>
        {SKILLS_DATA.map(sk=>{
          if (H.includes(sk.name)) return null;
          const prof = char.skills[sk.name]?.proficient;
          const exp = char.skills[sk.name]?.expertise;
          const abilMod = mod(char.abilities[sk.ability]);
          const bonus = abilMod + (exp ? pb*2 : prof ? pb : 0);
          return (
            <div key={sk.name} className="skill-row" style={{display:"flex",alignItems:"center",gap:6}}>
              <input type="checkbox" checked={prof} title="Proficient" onChange={e=>{const s={...char.skills,[sk.name]:{...char.skills[sk.name],proficient:e.target.checked}};update("skills",s)}}/>
              <input type="checkbox" checked={exp} title="Expertise" style={{accentColor:"var(--teal)"}} onChange={e=>{const s={...char.skills,[sk.name]:{...char.skills[sk.name],expertise:e.target.checked}};update("skills",s)}}/>
              <span className="skill-name" style={{flex:1}}>{sk.name}</span>
              <span className="skill-ability">{sk.ability}</span>
              <span className="skill-bonus">{fmtMod(bonus)}</span>
              <button className="field-hide-btn" style={{marginLeft:4}} onClick={()=>hide(sk.name)}>hide</button>
            </div>
          );
        })}
        <div style={{marginTop:10,fontSize:11,color:"var(--faint)",fontFamily:"var(--font-mono)"}}>☐ = proficient &nbsp; ☐ teal = expertise</div>
      </div>}
      {char.customStatsMode && <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <h3 style={{margin:0}}>Skills / Abilities</h3>
          <span className="custom-mode-badge">Custom</span>
        </div>
        <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--faint)"}}>Use the Custom Fields section below to add skills, abilities, or any system-specific stats for this character.</div>
      </div>}
      <TabCustomFields char={char} tabName="skills" onChange={onChange}/>
      <TabCustomFields char={char} tabName="inventory" onChange={onChange}/>
    </div>
  );
}

function InventoryTab({ char, onChange, readOnly }) {
  const [invTab, setInvTab] = useState("carried");
  function addItem() {
    const item = {id:`item_${Date.now()}`,name:"",qty:1,weight:0,notes:"",slot:invTab};
    onChange({...char,inventory:[...char.inventory,item]});
  }
  function updateItem(id,field,val) {
    onChange({...char,inventory:char.inventory.map(i=>i.id===id?{...i,[field]:val}:i)});
  }
  function removeItem(id) { onChange({...char,inventory:char.inventory.filter(i=>i.id!==id)}); }
  const items = char.inventory.filter(i=>i.slot===invTab);
  const totalWeight = char.inventory.filter(i=>i.slot!=="stored").reduce((s,i)=>s+(parseFloat(i.weight)||0)*(parseInt(i.qty)||1),0);
  const gpTotal = (char.currency.pp*10)+(char.currency.gp)+(char.currency.ep*0.5)+(char.currency.sp*0.1)+(char.currency.cp*0.01);

  return (
    <div>
      <div className="card" style={{marginBottom:12}}>
        <h3>Currency — Total: {gpTotal.toFixed(1)} GP</h3>
        <div className="field-row" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
          {["pp","gp","ep","sp","cp"].map(c=>(
            <div key={c} className="currency-box">
              <span className={`currency-label currency-${c}`}>{c.toUpperCase()}</span>
              <input type="number" min="0" value={char.currency[c]} style={{textAlign:"center"}} onChange={e=>onChange({...char,currency:{...char.currency,[c]:parseInt(e.target.value)||0}})}/>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div className="tab-bar" style={{margin:0,border:"none"}}>
            {["equipped","carried","stored"].map(t=><button key={t} className={`tab${invTab===t?" active":""}`} onClick={()=>setInvTab(t)}>{t}</button>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)"}}>Carry weight: {totalWeight.toFixed(1)} lbs</span>
            <button className="btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
        </div>
        {items.length===0 ? <div className="list-empty">No items in {invTab}</div> : (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 60px 70px 1fr 32px",gap:8,marginBottom:8}}>
              {["Item","Qty","Weight","Notes",""].map((h,i)=><label key={i} style={{margin:0}}>{h}</label>)}
            </div>
            {items.map(item=>(
              <div key={item.id} className="inv-row">
                <input value={item.name} placeholder="Item name" onChange={e=>updateItem(item.id,"name",e.target.value)}/>
                <input type="number" min="1" value={item.qty} onChange={e=>updateItem(item.id,"qty",parseInt(e.target.value)||1)}/>
                <input type="number" min="0" step="0.1" value={item.weight} onChange={e=>updateItem(item.id,"weight",parseFloat(e.target.value)||0)}/>
                <input value={item.notes} placeholder="Notes" onChange={e=>updateItem(item.id,"notes",e.target.value)}/>
                <button className="btn-danger btn-sm" onClick={()=>removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <TabCustomFields char={char} tabName="spells" onChange={onChange}/>
    </div>
  );
}

function SpellsTab({ char, onChange, readOnly }) {
  function updateSlot(lvl,field,val) {
    const slots = char.spellSlots.map(s=>s.level===lvl?{...s,[field]:val}:s);
    onChange({...char,spellSlots:slots});
  }
  function addSpell() {
    const sp = {id:`sp_${Date.now()}`,name:"",level:0,school:"Evocation",concentration:false,prepared:false,notes:""};
    onChange({...char,spells:[...char.spells,sp]});
  }
  function updateSpell(id,field,val) { onChange({...char,spells:char.spells.map(s=>s.id===id?{...s,[field]:val}:s)}); }
  function removeSpell(id) { onChange({...char,spells:char.spells.filter(s=>s.id!==id)}); }
  const usedSlots = char.spellSlots.filter(s=>s.max>0);

  return (
    <div>
      {usedSlots.length > 0 && (
        <div className="card" style={{marginBottom:12}}>
          <h3>Spell Slots</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:8}}>
            {char.spellSlots.filter(s=>s.max>0).map(slot=>(
              <div key={slot.level} className="spell-slot-box">
                <label style={{margin:0,marginBottom:4}}>Level {slot.level}</label>
                <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:4}}>
                  <input type="number" min="0" max="9" value={slot.used} style={{width:36,textAlign:"center"}} onChange={e=>updateSlot(slot.level,"used",parseInt(e.target.value)||0)}/>
                  <span style={{color:"var(--muted)",alignSelf:"center"}}>/</span>
                  <input type="number" min="0" max="9" value={slot.max} style={{width:36,textAlign:"center"}} onChange={e=>updateSlot(slot.level,"max",parseInt(e.target.value)||0)}/>
                </div>
                <div className="slot-pips">
                  {Array.from({length:slot.max},(_,i)=>(<div key={i} className={`slot-pip ${i<slot.used?"used":"available"}`} onClick={()=>updateSlot(slot.level,"used",i<slot.used?slot.used-1:slot.used+1)}/>))}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,display:"flex",gap:8}}>
            <label style={{margin:0,alignSelf:"center",color:"var(--muted)"}}>Set max for level:</label>
            {char.spellSlots.filter(s=>s.max===0).slice(0,5).map(slot=>(
              <button key={slot.level} className="btn-ghost btn-sm" onClick={()=>updateSlot(slot.level,"max",1)}>+L{slot.level}</button>
            ))}
          </div>
        </div>
      )}
      {usedSlots.length === 0 && (
        <div className="card" style={{marginBottom:12}}>
          <h3>Spell Slots</h3>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {char.spellSlots.map(slot=>(
              <button key={slot.level} className="btn-ghost btn-sm" onClick={()=>updateSlot(slot.level,"max",1)}>Enable Level {slot.level}</button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3 style={{margin:0}}>Spells Known / Prepared</h3>
          <button className="btn-ghost btn-sm" onClick={addSpell}>+ Add Spell</button>
        </div>
        {char.spells.length===0 ? <div className="list-empty">No spells added</div> : (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"40px 1fr 100px 80px 32px",gap:8,marginBottom:8}}>
              {["Lvl","Name","School","Flags",""].map((h,i)=><label key={i} style={{margin:0}}>{h}</label>)}
            </div>
            {char.spells.map(sp=>(
              <div key={sp.id} className="spell-row">
                <input type="number" min="0" max="9" value={sp.level} style={{textAlign:"center",padding:"4px"}} onChange={e=>updateSpell(sp.id,"level",parseInt(e.target.value)||0)}/>
                <input value={sp.name} placeholder="Spell name" onChange={e=>updateSpell(sp.id,"name",e.target.value)}/>
                <select value={sp.school} onChange={e=>updateSpell(sp.id,"school",e.target.value)} style={{fontSize:12}}>
                  {SPELL_SCHOOLS.map(s=><option key={s}>{s}</option>)}
                </select>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <label style={{margin:0,display:"flex",alignItems:"center",gap:3,fontSize:10,cursor:"pointer"}}>
                    <input type="checkbox" checked={sp.concentration} onChange={e=>updateSpell(sp.id,"concentration",e.target.checked)}/> C
                  </label>
                  <label style={{margin:0,display:"flex",alignItems:"center",gap:3,fontSize:10,cursor:"pointer"}}>
                    <input type="checkbox" checked={sp.prepared} onChange={e=>updateSpell(sp.id,"prepared",e.target.checked)}/> P
                  </label>
                </div>
                <button className="btn-danger btn-sm" onClick={()=>removeSpell(sp.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <TabCustomFields char={char} tabName="features" onChange={onChange}/>
    </div>
  );
}

function FeaturesTab({ char, onChange, readOnly }) {
  const cfg = getTabCfg(char, "features");
  const H = cfg.hidden;
  if (readOnly) return (
    <div>
      {(char.features||[]).length===0 && <div className="list-empty">No features added yet.</div>}
      {(char.features||[]).map(f=>(
        <div key={f.id} style={{marginBottom:14,padding:"12px 14px",background:"var(--card2)",borderRadius:3}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontFamily:"var(--font-serif)",fontSize:14,color:"var(--gold-light)"}}>{f.name||"Unnamed Feature"}</span>
            {f.source&&<span className="tag" style={{fontSize:9}}>{f.source}</span>}
          </div>
          {f.description&&<div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{f.description}</div>}
          {f.uses!=null&&f.uses>0&&<div style={{marginTop:6,fontFamily:"var(--font-mono)",fontSize:10,color:"var(--faint)"}}>Uses: {f.usedCount||0}/{f.uses}</div>}
        </div>
      ))}
    </div>
  );
  function add() {
    onChange({...char,features:[...char.features,{id:`feat_${Date.now()}`,name:"",source:"",description:""}]});
  }
  function update(id,field,val) { onChange({...char,features:char.features.map(f=>f.id===id?{...f,[field]:val}:f)}); }
  function remove(id) { onChange({...char,features:char.features.filter(f=>f.id!==id)}); }
  return (
    <div>
      <div className="section-header">
        <h2>Features, Traits & Feats</h2>
        <button className="btn-ghost btn-sm" onClick={add}>+ Add Feature</button>
      </div>
      {char.features.length===0 ? <div className="list-empty">No features added yet</div> : char.features.map(f=>(
        <div key={f.id} className="card" style={{marginBottom:10}}>
          <div className="field-row grid-2">
            <Field label="Feature Name"><input value={f.name} onChange={e=>update(f.id,"name",e.target.value)}/></Field>
            <Field label="Source (Class / Race / Feat)"><input value={f.source} onChange={e=>update(f.id,"source",e.target.value)}/></Field>
          </div>
          <Field label="Description"><textarea value={f.description} rows={3} onChange={e=>update(f.id,"description",e.target.value)}/></Field>
          <button className="btn-danger btn-sm" onClick={()=>remove(f.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function NotesTab({ char, update, readOnly, onChange }) {
  const cfg = getTabCfg(char, "notes");
  const H = cfg.hidden;
  function hide(k) { onChange(setTabCfg(char, "notes", { ...cfg, hidden: [...H, k] })); }
  if (readOnly) return (
    <div>
      {!H.includes("personality") && <ViewField label="Personality Traits" value={char.personality}/>}
      {!H.includes("ideals") && <ViewField label="Ideals" value={char.ideals}/>}
      {!H.includes("bonds") && <ViewField label="Bonds" value={char.bonds}/>}
      {!H.includes("flaws") && <ViewField label="Flaws" value={char.flaws}/>}
      {!H.includes("backstory") && <ViewField label="Backstory" value={char.backstory}/>}
      {!H.includes("dmNotes") && char.dmNotes && <ViewField label="DM Notes" value={char.dmNotes} dm/>}
      {cfg.custom.map(f=>renderFieldView(f))}
    </div>
  );
  return (
    <div>
      <div className="field-row grid-2">
        <HF label="Personality Traits" fieldKey="personality" hidden={H} onHide={hide}><textarea value={char.personality} rows={4} onChange={e=>update("personality",e.target.value)}/></HF>
        <HF label="Ideals" fieldKey="ideals" hidden={H} onHide={hide}><textarea value={char.ideals} rows={4} onChange={e=>update("ideals",e.target.value)}/></HF>
        <HF label="Bonds" fieldKey="bonds" hidden={H} onHide={hide}><textarea value={char.bonds} rows={4} onChange={e=>update("bonds",e.target.value)}/></HF>
        <HF label="Flaws" fieldKey="flaws" hidden={H} onHide={hide}><textarea value={char.flaws} rows={4} onChange={e=>update("flaws",e.target.value)}/></HF>
      </div>
      <HF label="Backstory" fieldKey="backstory" hidden={H} onHide={hide}><textarea value={char.backstory} rows={6} onChange={e=>update("backstory",e.target.value)}/></HF>
      {!H.includes("dmNotes") && <div className="dm-notes-field">
        <Field label={<span>🔒 DM Notes (Private) <button className="field-hide-btn" onClick={()=>hide("dmNotes")}>hide</button></span>}><textarea value={char.dmNotes} rows={5} onChange={e=>update("dmNotes",e.target.value)} placeholder="Private DM notes — your players never see this..."/></Field>
      </div>}
      <TabCustomFields char={char} tabName="notes" onChange={onChange}/>
    </div>
  );
}

// ============================================================
// PARTY PAGE
// ============================================================
function PartyPage({ campaign, onChange, navTarget }) {
  const [editingId, setEditingId] = useState(null);
  const [newId, setNewId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  // Search navigation: open character modal and highlight
  useEffect(() => {
    if (navTarget?.page === "party" && navTarget?.itemId) {
      setEditingId(navTarget.itemId);
      setHighlightId(navTarget.itemId);
      const t = setTimeout(() => setHighlightId(null), 2200);
      return () => clearTimeout(t);
    }
  }, [navTarget]);

  function addChar() {
    const c = defaultCharacter(`char_${Date.now()}`);
    c.name = `Character ${campaign.characters.length + 1}`;
    c.playerName = `Player ${campaign.characters.length + 1}`;
    const updated = { ...campaign, characters: [...campaign.characters, c] };
    onChange(updated);
    setEditingId(c.id); setNewId(c.id);
  }
  function updateChar(updated) {
    // Use functional updater to avoid stale closure — always reads latest campaign state
    onChange(prev => ({
      ...prev,
      characters: prev.characters.map(c => c.id === updated.id ? updated : c)
    }));
  }
  function removeChar(id) {
    onChange({ ...campaign, characters: campaign.characters.filter(c => c.id !== id) });
    setEditingId(null);
  }

  const editingChar = editingId ? campaign.characters.find(c => c.id === editingId) : null;

  // HP colour
  function hpColor(cur, max) {
    const pct = max > 0 ? cur / max : 0;
    return pct > 0.5 ? "#5ab85a" : pct > 0.25 ? "#c9923a" : "#c44040";
  }
  // Ability modifier
  function abilMod(score) { return Math.floor((score - 10) / 2); }
  function fmtM(n) { return n >= 0 ? `+${n}` : `${n}`; }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div className="page-header">
        <h1>⚔ The Party</h1>
        <button className="btn-primary" onClick={addChar}>+ Add Character</button>
      </div>

      {/* Card grid */}
      <div className="page-body">
        {campaign.characters.length === 0 ? (
          <div className="list-empty" style={{ padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚔</div>
            <p>No characters yet.<br />Add your first party member to begin.</p>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={addChar}>+ Add Character</button>
          </div>
        ) : (
          <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {campaign.characters.map(c => {
              const pb = profBonus(c.level || 1);
              const hpPct = c.hp.max > 0 ? Math.min(1, c.hp.current / c.hp.max) : 0;
              const color = hpColor(c.hp.current, c.hp.max);
              const isHL = highlightId === c.id;
              return (
                <div
                  id={`card-${c.id}`}
                  key={c.id}
                  className={`npc-card${isHL ? " search-highlight" : ""}`}
                  onClick={() => setEditingId(c.id)}
                  style={{ cursor: "pointer", position: "relative", padding: "18px 18px 14px" }}
                >
                  {/* Name + class badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--gold-light)", lineHeight: 1.2 }}>{c.name || "Unnamed"}</div>
                      {c.playerName && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>Player: {c.playerName}</div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                      <span className="tag tag-gold" style={{ fontSize: 9 }}>Lvl {c.level}</span>
                    </div>
                  </div>

                  {/* Race · Class · Subclass */}
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                    {[c.race, c.charClass, c.subclass].filter(Boolean).join(" · ") || <span style={{ fontStyle: "italic", color: "var(--faint)" }}>No class set</span>}
                  </div>

                  {/* HP bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>HP</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color }}>
                        {c.hp.current} / {c.hp.max}{c.hp.temp > 0 ? ` (+${c.hp.temp})` : ""}
                      </span>
                    </div>
                    <div style={{ background: "var(--card2)", borderRadius: 3, height: 7, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${hpPct * 100}%`, background: color, borderRadius: 3, transition: "width 0.3s, background 0.3s" }} />
                    </div>
                  </div>

                  {/* Ability score row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 10 }}>
                    {ABILITIES.map(ab => (
                      <div key={ab} style={{ background: "var(--card2)", borderRadius: 2, padding: "5px 2px", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{ab}</div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--gold-light)", lineHeight: 1.2 }}>{fmtM(abilMod(c.abilities[ab]))}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{c.abilities[ab]}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[["AC", c.ac], ["Init", fmtM(abilMod(c.abilities.DEX))], ["Speed", `${c.speed}ft`]].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: "var(--card2)", borderRadius: 2, padding: "5px 4px", textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--text)" }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Conditions */}
                  {c.conditions && c.conditions.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      {c.conditions.slice(0, 4).map(con => (
                        <span key={con} className="condition-chip" style={{ fontSize: 8, padding: "1px 6px" }}>{con}</span>
                      ))}
                      {c.conditions.length > 4 && <span style={{ fontSize: 10, color: "var(--faint)", marginLeft: 4 }}>+{c.conditions.length - 4}</span>}
                    </div>
                  )}

                  {/* Footer: alignment + XP */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 10, color: "var(--faint)", fontFamily: "var(--font-mono)" }}>{c.alignment || "—"}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{(c.xp || 0).toLocaleString()} XP</span>
                  </div>

                  {/* Dead overlay */}
                  {c.deathSaves?.failures?.filter(Boolean).length >= 3 && (
                    <div style={{ position: "absolute", top: 10, right: 10, fontSize: 16 }}>💀</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Character sheet modal */}
      {editingChar && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingId(null)}>
          <div style={{
            background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 4,
            width: "95vw", maxWidth: 860, height: "88vh",
            display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0 }}>{editingChar.name || "Character"}</h2>
                {editingChar.charClass && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                    {editingChar.race} {editingChar.charClass} {editingChar.level}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn-danger btn-sm" onClick={() => removeChar(editingChar.id)}>Delete</button>
                <button className="close-btn" style={{ fontSize: 22 }} onClick={() => { setEditingId(null); setNewId(null); }}>✕</button>
              </div>
            </div>
            {/* Character sheet fills the rest */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <CharacterSheet key={editingChar.id} char={editingChar} onChange={updateChar} initialMode={newId === editingChar.id ? "edit" : "view"}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WORLD PAGE
// ============================================================
function WorldPage({ campaign, onChange, navTarget }) {
  const [section, setSection] = useState("npcs");
  const [editingId, setEditingId] = useState(null);
  const [newId, setNewId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  // Navigate to correct sub-section, highlight card, scroll into view — no modal
  useEffect(() => {
    if (navTarget?.page==="world" && navTarget?.subSection && navTarget?.itemId) {
      setSection(navTarget.subSection);
      setEditingId(null); // close any open modal
      setHighlightId(navTarget.itemId);
      // Scroll highlighted card into view after render
      setTimeout(() => {
        const el = document.getElementById(`card-${navTarget.itemId}`);
        if (el) el.scrollIntoView({ behavior:"smooth", block:"center" });
      }, 80);
      const t = setTimeout(() => setHighlightId(null), 2200);
      return () => clearTimeout(t);
    }
  }, [navTarget]);
  const [search, setSearch] = useState("");

  function addNPC() {
    const n = defaultNPC(`npc_${Date.now()}`);
    onChange(prev=>({...prev,npcs:[...prev.npcs,n]}));
    setEditingId(n.id); setNewId(n.id);
  }
  function updateNPC(updated) { onChange(prev=>({...prev,npcs:prev.npcs.map(n=>n.id===updated.id?updated:n)})); }
  function removeNPC(id) { onChange({...campaign,npcs:campaign.npcs.filter(n=>n.id!==id)}); setEditingId(null); }

  function addLocation() {
    const l = defaultLocation(`loc_${Date.now()}`);
    onChange(prev=>({...prev,locations:[...prev.locations,l]}));
    setEditingId(l.id); setNewId(l.id);
  }
  function updateLocation(updated) { onChange(prev=>({...prev,locations:prev.locations.map(l=>l.id===updated.id?updated:l)})); }
  function removeLocation(id) { onChange({...campaign,locations:campaign.locations.filter(l=>l.id!==id)}); setEditingId(null); }

  function addFaction() {
    const f = defaultFaction(`fac_${Date.now()}`);
    onChange(prev=>({...prev,factions:[...prev.factions,f]}));
    setEditingId(f.id); setNewId(f.id);
  }
  function updateFaction(updated) { onChange(prev=>({...prev,factions:prev.factions.map(f=>f.id===updated.id?updated:f)})); }
  function removeFaction(id) { onChange({...campaign,factions:campaign.factions.filter(f=>f.id!==id)}); setEditingId(null); }

  function addLore() {
    const l = defaultLore(`lore_${Date.now()}`);
    onChange(prev=>({...prev,lore:[...prev.lore,l]}));
    setEditingId(l.id); setNewId(l.id);
  }
  function updateLore(updated) { onChange(prev=>({...prev,lore:prev.lore.map(l=>l.id===updated.id?updated:l)})); }
  function removeLore(id) { onChange({...campaign,lore:campaign.lore.filter(l=>l.id!==id)}); setEditingId(null); }

  const editingNPC = editingId ? campaign.npcs.find(n=>n.id===editingId) : null;
  const editingLoc = editingId ? campaign.locations.find(l=>l.id===editingId) : null;
  const editingFac = editingId ? campaign.factions.find(f=>f.id===editingId) : null;
  const editingLoreItem = editingId ? campaign.lore.find(l=>l.id===editingId) : null;

  const ATTITUDE_COLORS = {Friendly:"var(--green)",Neutral:"var(--muted)",Hostile:"var(--red)",Unknown:"var(--faint)"};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="page-header">
        <h1>🗺 The World</h1>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{width:180}}/>
          {section==="npcs"&&<button className="btn-primary" onClick={addNPC}>+ NPC</button>}
          {section==="locations"&&<button className="btn-primary" onClick={addLocation}>+ Location</button>}
          {section==="factions"&&<button className="btn-primary" onClick={addFaction}>+ Faction</button>}
          {section==="lore"&&<button className="btn-primary" onClick={addLore}>+ Lore Entry</button>}
        </div>
      </div>
      <div className="tab-bar" style={{padding:"0 28px",background:"var(--surface)",margin:0,flexShrink:0}}>
        {["npcs","locations","factions","lore","relationships","influence"].map(s=><button key={s} className={`tab${section===s?" active":""}`} onClick={()=>{setSection(s);setEditingId(null)}}>{s}</button>)}
      </div>
      <div className="page-body">
        {section==="npcs" && (
          <>
            <div className="card-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {campaign.npcs.filter(n=>!search||n.name.toLowerCase().includes(search.toLowerCase())).map(npc=>(
                <div id={`card-${npc.id}`} key={npc.id} className={`npc-card${highlightId===npc.id?" search-highlight":""}`} onClick={()=>setEditingId(npc.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <h3>{npc.name}</h3>
                    <span className="tag" style={{color:ATTITUDE_COLORS[npc.attitude]||"var(--muted)"}}>{npc.attitude}</span>
                  </div>
                  {npc.race&&npc.occupation&&<div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{npc.race} · {npc.occupation}</div>}
                  {npc.location&&<div style={{fontSize:12,color:"var(--faint)",marginTop:2}}>📍 {npc.location}</div>}
                  <div style={{marginTop:6}}><span className={`tag badge-${npc.status?.toLowerCase()||"unknown"}`}>{npc.status||"Unknown"}</span></div>
                </div>
              ))}
              {campaign.npcs.length===0&&<div className="list-empty" style={{gridColumn:"1/-1"}}>No NPCs yet. Add your first character to the world.</div>}
            </div>
            {editingNPC && (
              <ViewEditModal
                title={editingNPC.name || "New NPC"}
                entity={editingNPC}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeNPC(editingNPC.id)}
                onUpdate={updateNPC}
                deleteLabel="Delete NPC"
                initialMode={newId === editingNPC.id ? "edit" : "view"}
                renderView={(e, hide) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="view-grid">
                      {!H.includes("race") && <ViewField label="Race" value={e.race}/>}
                      {!H.includes("occupation") && <ViewField label="Occupation" value={e.occupation}/>}
                      {!H.includes("location") && <ViewField label="Location" value={e.location}/>}
                      {!H.includes("age") && <ViewField label="Age" value={e.age}/>}
                      {!H.includes("status") && <ViewField label="Status" value={e.status}/>}
                      {!H.includes("attitude") && <ViewField label="Attitude" value={e.attitude}/>}
                    </div>
                    {!H.includes("description") && <ViewField label="Physical Description" value={e.description}/>}
                    <div className="view-grid-2">
                      {!H.includes("personality") && <ViewField label="Personality" value={e.personality}/>}
                      {!H.includes("motivation") && <ViewField label="Motivation / Goal" value={e.motivation}/>}
                    </div>
                    {!H.includes("history") && <ViewField label="History with Party" value={e.history}/>}
                    {!H.includes("secret") && <ViewField label="Secret" value={e.secret} dm/>}
                    {!H.includes("dmNotes") && <ViewField label="DM Notes" value={e.dmNotes} dm/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-3">
                      <Field label="Name"><input value={e.name} onChange={ev=>upd({...e,name:ev.target.value})}/></Field>
                      {!H.includes("race") ? <Field label={<span>Race <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"race"]})}>hide</button></span>}><input value={e.race} onChange={ev=>upd({...e,race:ev.target.value})}/></Field> : null}
                      {!H.includes("occupation") ? <Field label={<span>Occupation <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"occupation"]})}>hide</button></span>}><input value={e.occupation} onChange={ev=>upd({...e,occupation:ev.target.value})}/></Field> : null}
                    </div>
                    <div className="field-row grid-3">
                      {!H.includes("location") ? <Field label={<span>Location <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"location"]})}>hide</button></span>}><input value={e.location} onChange={ev=>upd({...e,location:ev.target.value})}/></Field> : null}
                      {!H.includes("age") ? <Field label={<span>Age <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"age"]})}>hide</button></span>}><input value={e.age} onChange={ev=>upd({...e,age:ev.target.value})}/></Field> : null}
                      {!H.includes("status") ? <Field label={<span>Status <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"status"]})}>hide</button></span>}><select value={e.status} onChange={ev=>upd({...e,status:ev.target.value})}>{["Alive","Dead","Unknown","Missing"].map(s=><option key={s}>{s}</option>)}</select></Field> : null}
                    </div>
                    {!H.includes("attitude") ? <Field label={<span>Attitude Toward Party <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"attitude"]})}>hide</button></span>}><select value={e.attitude} onChange={ev=>upd({...e,attitude:ev.target.value})}>{["Friendly","Neutral","Hostile","Unknown"].map(s=><option key={s}>{s}</option>)}</select></Field> : null}
                    {!H.includes("description") ? <Field label={<span>Physical Description <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"description"]})}>hide</button></span>}><textarea value={e.description} rows={2} onChange={ev=>upd({...e,description:ev.target.value})}/></Field> : null}
                    <div className="field-row grid-3">
                      {!H.includes("personality") ? <Field label={<span>Personality <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"personality"]})}>hide</button></span>}><textarea value={e.personality} rows={3} onChange={ev=>upd({...e,personality:ev.target.value})}/></Field> : null}
                      {!H.includes("motivation") ? <Field label={<span>Motivation / Goal <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"motivation"]})}>hide</button></span>}><textarea value={e.motivation} rows={3} onChange={ev=>upd({...e,motivation:ev.target.value})}/></Field> : null}
                      {!H.includes("secret") ? <div className="dm-notes-field"><Field label={<span>🔒 Secret <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"secret"]})}>hide</button></span>}><textarea value={e.secret} rows={3} onChange={ev=>upd({...e,secret:ev.target.value})}/></Field></div> : null}
                    </div>
                    {!H.includes("history") ? <Field label={<span>History with Party <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"history"]})}>hide</button></span>}><textarea value={e.history} rows={3} onChange={ev=>upd({...e,history:ev.target.value})}/></Field> : null}
                    {!H.includes("dmNotes") ? <div className="dm-notes-field"><Field label={<span>🔒 DM Notes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"dmNotes"]})}>hide</button></span>}><textarea value={e.dmNotes} rows={3} onChange={ev=>upd({...e,dmNotes:ev.target.value})}/></Field></div> : null}
                  </>);
                }}
              />
            )}
          </>
        )}

        {section==="locations" && (
          <>
            <div className="card-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {campaign.locations.filter(l=>!search||l.name.toLowerCase().includes(search.toLowerCase())).map(loc=>(
                <div id={`card-${loc.id}`} key={loc.id} className={`npc-card${highlightId===loc.id?" search-highlight":""}`} onClick={()=>setEditingId(loc.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <h3>{loc.name}</h3>
                    <span className="tag">{loc.type}</span>
                  </div>
                  {loc.region&&<div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>{loc.region}</div>}
                  {loc.atmosphere&&<div style={{fontSize:12,color:"var(--faint)",marginTop:4,fontStyle:"italic"}}>"{loc.atmosphere}"</div>}
                  <div style={{marginTop:6}}><span className="tag">{loc.status}</span></div>
                </div>
              ))}
              {campaign.locations.length===0&&<div className="list-empty" style={{gridColumn:"1/-1"}}>No locations yet.</div>}
            </div>
            {editingLoc && (
              <ViewEditModal
                title={editingLoc.name || "New Location"}
                entity={editingLoc}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeLocation(editingLoc.id)}
                onUpdate={updateLocation}
                deleteLabel="Delete Location"
                initialMode={newId === editingLoc.id ? "edit" : "view"}
                renderView={(e) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="view-grid">
                      {!H.includes("type") && <ViewField label="Type" value={e.type}/>}
                      {!H.includes("status") && <ViewField label="Status" value={e.status}/>}
                      {!H.includes("region") && <ViewField label="Region" value={e.region}/>}
                      {!H.includes("population") && <ViewField label="Population" value={e.population}/>}
                    </div>
                    {!H.includes("atmosphere") && e.atmosphere && <div style={{fontStyle:"italic",color:"var(--muted)",marginBottom:14,fontSize:14}}>"{e.atmosphere}"</div>}
                    {!H.includes("description") && <ViewField label="Description" value={e.description}/>}
                    {!H.includes("history") && <ViewField label="History" value={e.history}/>}
                    {!H.includes("hooks") && <ViewField label="Plot Hooks" value={e.hooks}/>}
                    {!H.includes("secrets") && <ViewField label="Secrets" value={e.secrets} dm/>}
                    {!H.includes("dmNotes") && <ViewField label="DM Notes" value={e.dmNotes} dm/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-3">
                      <Field label="Name"><input value={e.name} onChange={ev=>upd({...e,name:ev.target.value})}/></Field>
                      {!H.includes("type") ? <Field label={<span>Type <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"type"]})}>hide</button></span>}><select value={e.type} onChange={ev=>upd({...e,type:ev.target.value})}>{["City","Town","Village","Dungeon","Wilderness","Ruin","Temple","Keep","Tavern","Other"].map(t=><option key={t}>{t}</option>)}</select></Field> : null}
                      {!H.includes("status") ? <Field label={<span>Status <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"status"]})}>hide</button></span>}><select value={e.status} onChange={ev=>upd({...e,status:ev.target.value})}>{["Visited","Known","Rumored","Undiscovered","Destroyed"].map(s=><option key={s}>{s}</option>)}</select></Field> : null}
                    </div>
                    <div className="field-row grid-2">
                      {!H.includes("region") ? <Field label={<span>Region <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"region"]})}>hide</button></span>}><input value={e.region} onChange={ev=>upd({...e,region:ev.target.value})}/></Field> : null}
                      {!H.includes("population") ? <Field label={<span>Population / Size <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"population"]})}>hide</button></span>}><input value={e.population} onChange={ev=>upd({...e,population:ev.target.value})}/></Field> : null}
                    </div>
                    {!H.includes("atmosphere") ? <Field label={<span>Atmosphere / Vibe <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"atmosphere"]})}>hide</button></span>}><input value={e.atmosphere} onChange={ev=>upd({...e,atmosphere:ev.target.value})}/></Field> : null}
                    {!H.includes("description") ? <Field label={<span>Description <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"description"]})}>hide</button></span>}><textarea value={e.description} rows={4} onChange={ev=>upd({...e,description:ev.target.value})}/></Field> : null}
                    {!H.includes("history") ? <Field label={<span>History <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"history"]})}>hide</button></span>}><textarea value={e.history} rows={3} onChange={ev=>upd({...e,history:ev.target.value})}/></Field> : null}
                    {!H.includes("hooks") ? <Field label={<span>Plot Hooks <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"hooks"]})}>hide</button></span>}><textarea value={e.hooks} rows={3} onChange={ev=>upd({...e,hooks:ev.target.value})}/></Field> : null}
                    {!H.includes("secrets") ? <div className="dm-notes-field"><Field label={<span>🔒 Secrets <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"secrets"]})}>hide</button></span>}><textarea value={e.secrets} rows={3} onChange={ev=>upd({...e,secrets:ev.target.value})}/></Field></div> : null}
                    {!H.includes("dmNotes") ? <div className="dm-notes-field"><Field label={<span>🔒 DM Notes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"dmNotes"]})}>hide</button></span>}><textarea value={e.dmNotes} rows={3} onChange={ev=>upd({...e,dmNotes:ev.target.value})}/></Field></div> : null}
                  </>);
                }}
              />
            )}
          </>
        )}

        {section==="factions" && (
          <>
            <div className="card-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {campaign.factions.filter(f=>!search||f.name.toLowerCase().includes(search.toLowerCase())).map(fac=>(
                <div id={`card-${fac.id}`} key={fac.id} className={`npc-card${highlightId===fac.id?" search-highlight":""}`} onClick={()=>setEditingId(fac.id)}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <h3>{fac.name}</h3>
                    <span className="tag">{fac.powerLevel}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>{fac.type}</div>
                  {fac.goals&&<div style={{fontSize:13,color:"var(--text)",marginTop:8,fontStyle:"italic"}}>"{fac.goals.slice(0,80)}{fac.goals.length>80?"...":""}"</div>}
                  <div style={{marginTop:8}}><span className="tag" style={{color:ATTITUDE_COLORS[fac.attitude]}}>{fac.attitude}</span></div>
                </div>
              ))}
              {campaign.factions.length===0&&<div className="list-empty" style={{gridColumn:"1/-1"}}>No factions yet.</div>}
            </div>
            {editingFac && (
              <ViewEditModal
                title={editingFac.name || "New Faction"}
                entity={editingFac}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeFaction(editingFac.id)}
                onUpdate={updateFaction}
                deleteLabel="Delete Faction"
                initialMode={newId === editingFac.id ? "edit" : "view"}
                renderView={(e) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="view-grid">
                      {!H.includes("type") && <ViewField label="Type" value={e.type}/>}
                      {!H.includes("powerLevel") && <ViewField label="Power Level" value={e.powerLevel}/>}
                      {!H.includes("attitude") && <ViewField label="Attitude" value={e.attitude}/>}
                      {!H.includes("influenceScore") && <ViewField label="Influence" value={`${e.influenceScore ?? 50}/100`}/>}
                    </div>
                    {!H.includes("goals") && <ViewField label="Goals" value={e.goals}/>}
                    {!H.includes("methods") && <ViewField label="Methods" value={e.methods}/>}
                    {!H.includes("resources") && <ViewField label="Resources & Assets" value={e.resources}/>}
                    {!H.includes("notes") && <ViewField label="Notes" value={e.notes}/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-3">
                      <Field label="Name"><input value={e.name} onChange={ev=>upd({...e,name:ev.target.value})}/></Field>
                      {!H.includes("type") ? <Field label={<span>Type <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"type"]})}>hide</button></span>}><select value={e.type} onChange={ev=>upd({...e,type:ev.target.value})}>{["Guild","Cult","Government","Military","Criminal","Religious","Merchant","Arcane","Other"].map(t=><option key={t}>{t}</option>)}</select></Field> : null}
                      {!H.includes("powerLevel") ? <Field label={<span>Power Level <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"powerLevel"]})}>hide</button></span>}><select value={e.powerLevel} onChange={ev=>upd({...e,powerLevel:ev.target.value})}>{["Local","Regional","National","Global","Planar"].map(p=><option key={p}>{p}</option>)}</select></Field> : null}
                    </div>
                    {!H.includes("attitude") ? <Field label={<span>Attitude Toward Party <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"attitude"]})}>hide</button></span>}><select value={e.attitude} onChange={ev=>upd({...e,attitude:ev.target.value})}>{["Friendly","Neutral","Hostile","Unknown"].map(a=><option key={a}>{a}</option>)}</select></Field> : null}
                    {!H.includes("goals") ? <Field label={<span>Goals <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"goals"]})}>hide</button></span>}><textarea value={e.goals} rows={3} onChange={ev=>upd({...e,goals:ev.target.value})}/></Field> : null}
                    {!H.includes("methods") ? <Field label={<span>Methods <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"methods"]})}>hide</button></span>}><textarea value={e.methods} rows={3} onChange={ev=>upd({...e,methods:ev.target.value})}/></Field> : null}
                    {!H.includes("resources") ? <Field label={<span>Resources & Assets <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"resources"]})}>hide</button></span>}><textarea value={e.resources} rows={3} onChange={ev=>upd({...e,resources:ev.target.value})}/></Field> : null}
                    {!H.includes("notes") ? <Field label={<span>Notes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"notes"]})}>hide</button></span>}><textarea value={e.notes} rows={3} onChange={ev=>upd({...e,notes:ev.target.value})}/></Field> : null}
                  </>);
                }}
              />
            )}
          </>
        )}

        {section==="lore" && (
          <>
            <div className="card-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {campaign.lore.filter(l=>!search||l.name.toLowerCase().includes(search.toLowerCase())).map(entry=>(
                <div id={`card-${entry.id}`} key={entry.id} className={`npc-card${highlightId===entry.id?" search-highlight":""}`} onClick={()=>setEditingId(entry.id)}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <h3>{entry.name}</h3>
                    <span className="tag">{entry.category}</span>
                  </div>
                  {entry.content&&<div style={{fontSize:13,color:"var(--muted)",marginTop:8}}>{entry.content.slice(0,100)}{entry.content.length>100?"...":""}</div>}
                </div>
              ))}
              {campaign.lore.length===0&&<div className="list-empty" style={{gridColumn:"1/-1"}}>No lore entries yet. Capture your history, gods, magic systems, and more.</div>}
            </div>
            {editingLoreItem && (
              <ViewEditModal
                title={editingLoreItem.name || "New Lore Entry"}
                entity={editingLoreItem}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeLore(editingLoreItem.id)}
                onUpdate={updateLore}
                deleteLabel="Delete Entry"
                initialMode={newId === editingLoreItem.id ? "edit" : "view"}
                renderView={(e) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    {!H.includes("category") && <div style={{marginBottom:14}}><span className="tag">{e.category}</span></div>}
                    {!H.includes("content") && <ViewField label="Content" value={e.content}/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-2">
                      <Field label="Title"><input value={e.name} onChange={ev=>upd({...e,name:ev.target.value})}/></Field>
                      {!H.includes("category") ? <Field label={<span>Category <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"category"]})}>hide</button></span>}><select value={e.category} onChange={ev=>upd({...e,category:ev.target.value})}>{["History","Religion","Magic","Geography","Culture","Language","Prophecy","Event","Item","Other"].map(c=><option key={c}>{c}</option>)}</select></Field> : null}
                    </div>
                    {!H.includes("content") ? <Field label={<span>Content <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"content"]})}>hide</button></span>}><textarea value={e.content} rows={10} onChange={ev=>upd({...e,content:ev.target.value})}/></Field> : null}
                  </>);
                }}
              />
            )}
          </>
        )}
      {section==="relationships" && (
          <RelationshipWeb campaign={campaign} onChange={onChange}/>
        )}

        {section==="influence" && (
          <FactionInfluence campaign={campaign} onChange={onChange}/>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STORY PAGE
// ============================================================
function StoryPage({ campaign, onChange, navTarget }) {
  const [section, setSection] = useState("sessions");
  const [editingId, setEditingId] = useState(null);
  const [newId, setNewId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (navTarget?.page==="story" && navTarget?.subSection && navTarget?.itemId) {
      setSection(navTarget.subSection);
      setEditingId(null); // close any open modal
      setHighlightId(navTarget.itemId);
      setTimeout(() => {
        const el = document.getElementById(`card-${navTarget.itemId}`);
        if (el) el.scrollIntoView({ behavior:"smooth", block:"center" });
      }, 80);
      const t = setTimeout(() => setHighlightId(null), 2200);
      return () => clearTimeout(t);
    }
  }, [navTarget]);

  function addSession() {
    const s = defaultSession(`sess_${Date.now()}`);
    s.number = campaign.sessions.length+1;
    onChange(prev=>({...prev,sessions:[...prev.sessions,s]}));
    setEditingId(s.id); setNewId(s.id);
  }
  function updateSession(updated) { onChange(prev=>({...prev,sessions:prev.sessions.map(s=>s.id===updated.id?updated:s)})); }
  function removeSession(id) { onChange({...campaign,sessions:campaign.sessions.filter(s=>s.id!==id)}); setEditingId(null); }

  function addQuest() {
    const q = defaultQuest(`quest_${Date.now()}`);
    onChange(prev=>({...prev,quests:[...prev.quests,q]}));
    setEditingId(q.id); setNewId(q.id);
  }
  function updateQuest(updated) { onChange(prev=>({...prev,quests:prev.quests.map(q=>q.id===updated.id?updated:q)})); }
  function removeQuest(id) { onChange({...campaign,quests:campaign.quests.filter(q=>q.id!==id)}); setEditingId(null); }

  function addThread() {
    const t = defaultPlotThread(`thread_${Date.now()}`);
    onChange(prev=>({...prev,plotThreads:[...prev.plotThreads,t]}));
    setEditingId(t.id); setNewId(t.id);
  }
  function updateThread(updated) { onChange(prev=>({...prev,plotThreads:prev.plotThreads.map(t=>t.id===updated.id?updated:t)})); }
  function removeThread(id) { onChange({...campaign,plotThreads:campaign.plotThreads.filter(t=>t.id!==id)}); setEditingId(null); }

  const editingSession = editingId ? campaign.sessions.find(s=>s.id===editingId) : null;
  const editingQuest = editingId ? campaign.quests.find(q=>q.id===editingId) : null;
  const editingThread = editingId ? campaign.plotThreads.find(t=>t.id===editingId) : null;

  const STATUS_COLORS = {Active:"var(--gold)",Completed:"var(--green)",Failed:"var(--red)",Dormant:"var(--muted)"};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="page-header">
        <h1>📜 The Story</h1>
        <div style={{display:"flex",gap:8}}>
          {section==="sessions"&&<button className="btn-primary" onClick={addSession}>+ New Session</button>}
          {section==="quests"&&<button className="btn-primary" onClick={addQuest}>+ New Quest</button>}
          {section==="threads"&&<button className="btn-primary" onClick={addThread}>+ New Thread</button>}
        </div>
      </div>
      <div className="tab-bar" style={{padding:"0 28px",background:"var(--surface)",margin:0,flexShrink:0}}>
        {["sessions","quests","threads"].map(s=><button key={s} className={`tab${section===s?" active":""}`} onClick={()=>{setSection(s);setEditingId(null)}}>{s}</button>)}
      </div>
      <div className="page-body">
        {section==="sessions" && (
          <>
            {campaign.sessions.length===0 && <div className="list-empty">No sessions logged yet. Start your adventure!</div>}
            {[...campaign.sessions].reverse().map(sess=>(
              <div id={`card-${sess.id}`} key={sess.id} className={`session-card${highlightId===sess.id?" search-highlight":""}`} onClick={()=>setEditingId(sess.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontFamily:"var(--font-serif)",fontSize:13,color:"var(--gold)"}}>Session {sess.number}</span>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)",marginLeft:12}}>{sess.date}</span>
                    {sess.inWorldDate&&<span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--faint)",marginLeft:12}}>⚔ {sess.inWorldDate}</span>}
                  </div>
                  {sess.xpAwarded>0&&<span className="tag tag-gold">{sess.xpAwarded} XP</span>}
                </div>
                {sess.summary&&<div style={{fontSize:14,color:"var(--muted)",marginTop:8,lineHeight:1.5}}>{sess.summary.slice(0,120)}{sess.summary.length>120?"...":""}</div>}
                {sess.cliffhanger&&<div style={{fontSize:13,color:"var(--red)",marginTop:6,fontStyle:"italic"}}>⚡ {sess.cliffhanger.slice(0,80)}</div>}
              </div>
            ))}
            {editingSession && (
              <ViewEditModal
                title={`Session ${editingSession.number} — ${editingSession.date}`}
                entity={editingSession}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeSession(editingSession.id)}
                onUpdate={updateSession}
                deleteLabel="Delete Session"
                initialMode={newId === editingSession.id ? "edit" : "view"}
                renderView={(e) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="view-grid">
                      <ViewField label="Session #" value={String(e.number)}/>
                      {!H.includes("date") && <ViewField label="Real Date" value={e.date}/>}
                      {!H.includes("inWorldDate") && <ViewField label="In-World Date" value={e.inWorldDate}/>}
                      {!H.includes("xpAwarded") && <ViewField label="XP Awarded" value={e.xpAwarded > 0 ? String(e.xpAwarded) : null}/>}
                      {!H.includes("playersPresent") && <ViewField label="Players Present" value={e.playersPresent}/>}
                    </div>
                    {!H.includes("summary") && <ViewField label="Summary" value={e.summary}/>}
                    <div className="view-grid-2">
                      {!H.includes("keyEvents") && <ViewField label="Key Events" value={e.keyEvents}/>}
                      {!H.includes("npcsEncountered") && <ViewField label="NPCs Encountered" value={e.npcsEncountered}/>}
                      {!H.includes("locationsVisited") && <ViewField label="Locations Visited" value={e.locationsVisited}/>}
                      {!H.includes("lootDistributed") && <ViewField label="Loot Distributed" value={e.lootDistributed}/>}
                    </div>
                    {!H.includes("cliffhanger") && e.cliffhanger && <div style={{color:"var(--red)",fontStyle:"italic",marginBottom:14}}>⚡ {e.cliffhanger}</div>}
                    {!H.includes("prepNotes") && <ViewField label="Prep Notes" value={e.prepNotes} dm/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-4">
                      <Field label="Session #"><input type="number" value={e.number} onChange={ev=>upd({...e,number:parseInt(ev.target.value)||1})}/></Field>
                      {!H.includes("date") ? <Field label={<span>Real Date <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"date"]})}>hide</button></span>}><input type="date" value={e.date} onChange={ev=>upd({...e,date:ev.target.value})}/></Field> : null}
                      {!H.includes("inWorldDate") ? <Field label={<span>In-World Date <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"inWorldDate"]})}>hide</button></span>}><input value={e.inWorldDate} onChange={ev=>upd({...e,inWorldDate:ev.target.value})}/></Field> : null}
                      {!H.includes("xpAwarded") ? <Field label={<span>XP Awarded <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"xpAwarded"]})}>hide</button></span>}><input type="number" value={e.xpAwarded} onChange={ev=>upd({...e,xpAwarded:parseInt(ev.target.value)||0})}/></Field> : null}
                    </div>
                    {!H.includes("playersPresent") ? <Field label={<span>Players Present <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"playersPresent"]})}>hide</button></span>}><input value={e.playersPresent} onChange={ev=>upd({...e,playersPresent:ev.target.value})}/></Field> : null}
                    {!H.includes("summary") ? <Field label={<span>Session Summary <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"summary"]})}>hide</button></span>}><textarea value={e.summary} rows={4} onChange={ev=>upd({...e,summary:ev.target.value})}/></Field> : null}
                    <div className="field-row grid-2">
                      {!H.includes("keyEvents") ? <Field label={<span>Key Events <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"keyEvents"]})}>hide</button></span>}><textarea value={e.keyEvents} rows={4} onChange={ev=>upd({...e,keyEvents:ev.target.value})}/></Field> : null}
                      {!H.includes("npcsEncountered") ? <Field label={<span>NPCs Encountered <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"npcsEncountered"]})}>hide</button></span>}><textarea value={e.npcsEncountered} rows={4} onChange={ev=>upd({...e,npcsEncountered:ev.target.value})}/></Field> : null}
                      {!H.includes("locationsVisited") ? <Field label={<span>Locations Visited <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"locationsVisited"]})}>hide</button></span>}><textarea value={e.locationsVisited} rows={3} onChange={ev=>upd({...e,locationsVisited:ev.target.value})}/></Field> : null}
                      {!H.includes("lootDistributed") ? <Field label={<span>Loot Distributed <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"lootDistributed"]})}>hide</button></span>}><textarea value={e.lootDistributed} rows={3} onChange={ev=>upd({...e,lootDistributed:ev.target.value})}/></Field> : null}
                    </div>
                    {!H.includes("cliffhanger") ? <Field label={<span>⚡ Cliffhanger <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"cliffhanger"]})}>hide</button></span>}><textarea value={e.cliffhanger} rows={2} onChange={ev=>upd({...e,cliffhanger:ev.target.value})}/></Field> : null}
                    {!H.includes("prepNotes") ? <div className="dm-notes-field"><Field label={<span>🔒 Prep Notes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"prepNotes"]})}>hide</button></span>}><textarea value={e.prepNotes} rows={4} onChange={ev=>upd({...e,prepNotes:ev.target.value})}/></Field></div> : null}
                  </>);
                }}
              />
            )}
          </>
        )}

        {section==="quests" && (
          <>
            {campaign.quests.length===0&&<div className="list-empty">No quests yet. What does the party seek?</div>}
            {campaign.quests.map(q=>(
              <div id={`card-${q.id}`} key={q.id} className={`session-card${highlightId===q.id?" search-highlight":""}`} onClick={()=>setEditingId(q.id)}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <strong style={{fontFamily:"var(--font-serif)",fontSize:15}}>{q.name}</strong>
                  <span className="tag" style={{color:STATUS_COLORS[q.status]}}>{q.status}</span>
                </div>
                {q.giver&&<div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Given by: {q.giver}</div>}
                {q.objective&&<div style={{fontSize:13,color:"var(--text)",marginTop:6}}>{q.objective.slice(0,100)}</div>}
              </div>
            ))}
                        {editingQuest && (
              <ViewEditModal
                title={editingQuest.name || "New Quest"}
                entity={editingQuest}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeQuest(editingQuest.id)}
                onUpdate={updateQuest}
                deleteLabel="Delete Quest"
                initialMode={newId === editingQuest.id ? "edit" : "view"}
                renderView={(e) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="view-grid">
                      {!H.includes("giver") && <ViewField label="Quest Giver" value={e.giver}/>}
                      {!H.includes("status") && <ViewField label="Status" value={e.status}/>}
                      {!H.includes("reward") && <ViewField label="Reward" value={e.reward}/>}
                    </div>
                    {!H.includes("objective") && <ViewField label="Objective" value={e.objective}/>}
                    {!H.includes("stakes") && <ViewField label="Stakes" value={e.stakes}/>}
                    {!H.includes("progress") && <ViewField label="Progress Notes" value={e.progress}/>}
                    {!H.includes("dmNotes") && <ViewField label="DM Notes" value={e.dmNotes} dm/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-3">
                      <Field label="Quest Name"><input value={e.name} onChange={ev=>upd({...e,name:ev.target.value})}/></Field>
                      {!H.includes("giver") ? <Field label={<span>Quest Giver <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"giver"]})}>hide</button></span>}><input value={e.giver} onChange={ev=>upd({...e,giver:ev.target.value})}/></Field> : null}
                      {!H.includes("status") ? <Field label={<span>Status <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"status"]})}>hide</button></span>}><select value={e.status} onChange={ev=>upd({...e,status:ev.target.value})}>{["Active","Completed","Failed","Unknown to Party","Abandoned"].map(s=><option key={s}>{s}</option>)}</select></Field> : null}
                    </div>
                    {!H.includes("objective") ? <Field label={<span>Objective <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"objective"]})}>hide</button></span>}><textarea value={e.objective} rows={3} onChange={ev=>upd({...e,objective:ev.target.value})}/></Field> : null}
                    {!H.includes("stakes") ? <Field label={<span>Stakes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"stakes"]})}>hide</button></span>}><textarea value={e.stakes} rows={3} onChange={ev=>upd({...e,stakes:ev.target.value})}/></Field> : null}
                    {!H.includes("progress") ? <Field label={<span>Progress Notes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"progress"]})}>hide</button></span>}><textarea value={e.progress} rows={3} onChange={ev=>upd({...e,progress:ev.target.value})}/></Field> : null}
                    <div className="field-row grid-2">
                      {!H.includes("reward") ? <Field label={<span>Reward <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"reward"]})}>hide</button></span>}><textarea value={e.reward} rows={2} onChange={ev=>upd({...e,reward:ev.target.value})}/></Field> : null}
                      {!H.includes("dmNotes") ? <div className="dm-notes-field"><Field label={<span>🔒 DM Notes <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"dmNotes"]})}>hide</button></span>}><textarea value={e.dmNotes} rows={2} onChange={ev=>upd({...e,dmNotes:ev.target.value})}/></Field></div> : null}
                    </div>
                  </>);
                }}
              />
            )}
          </>
        )}

        {section==="threads" && (
          <>
            {campaign.plotThreads.length===0&&<div className="list-empty">No plot threads yet. What mysteries lurk?</div>}
            {campaign.plotThreads.map(t=>(
              <div id={`card-${t.id}`} key={t.id} className={`session-card${highlightId===t.id?" search-highlight":""}`} onClick={()=>setEditingId(t.id)}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <strong style={{fontFamily:"var(--font-serif)",fontSize:15}}>{t.name}</strong>
                  <span className="tag" style={{color:STATUS_COLORS[t.status]}}>{t.status}</span>
                </div>
                {t.cluesFound&&<div style={{fontSize:13,color:"var(--muted)",marginTop:6}}>{t.cluesFound.slice(0,100)}</div>}
              </div>
            ))}
            {editingThread && (
              <ViewEditModal
                title={editingThread.name || "New Plot Thread"}
                entity={editingThread}
                onClose={() => { setEditingId(null); setNewId(null); }}
                onDelete={() => removeThread(editingThread.id)}
                onUpdate={updateThread}
                deleteLabel="Delete Thread"
                initialMode={newId === editingThread.id ? "edit" : "view"}
                renderView={(e) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="view-grid">
                      {!H.includes("status") && <ViewField label="Status" value={e.status}/>}
                    </div>
                    {!H.includes("cluesFound") && <ViewField label="Clues Found" value={e.cluesFound}/>}
                    {!H.includes("cluesMissed") && <ViewField label="Clues Missed" value={e.cluesMissed}/>}
                    {!H.includes("truth") && <ViewField label="The Truth (DM Only)" value={e.truth} dm/>}
                    {(e.customFields||[]).map(f=>renderFieldView(f))}
                  </>);
                }}
                renderEdit={(e, upd) => {
                  const H = e.hiddenFields || [];
                  return (<>
                    <div className="field-row grid-2">
                      <Field label="Thread Name"><input value={e.name} onChange={ev=>upd({...e,name:ev.target.value})}/></Field>
                      {!H.includes("status") ? <Field label={<span>Status <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"status"]})}>hide</button></span>}><select value={e.status} onChange={ev=>upd({...e,status:ev.target.value})}>{["Active","Resolved","Dormant","Abandoned"].map(s=><option key={s}>{s}</option>)}</select></Field> : null}
                    </div>
                    {!H.includes("cluesFound") ? <Field label={<span>Clues the Party Has Found <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"cluesFound"]})}>hide</button></span>}><textarea value={e.cluesFound} rows={4} onChange={ev=>upd({...e,cluesFound:ev.target.value})}/></Field> : null}
                    {!H.includes("cluesMissed") ? <Field label={<span>Clues They've Missed <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"cluesMissed"]})}>hide</button></span>}><textarea value={e.cluesMissed} rows={3} onChange={ev=>upd({...e,cluesMissed:ev.target.value})}/></Field> : null}
                    {!H.includes("truth") ? <div className="dm-notes-field"><Field label={<span>🔒 The Truth (DM Only) <button className="field-hide-btn" onClick={()=>upd({...e,hiddenFields:[...H,"truth"]})}>hide</button></span>}><textarea value={e.truth} rows={4} onChange={ev=>upd({...e,truth:ev.target.value})}/></Field></div> : null}
                  </>);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TABLE (LIVE SESSION) PAGE
// ============================================================
function TablePage({ campaign, onChange }) {
  const [diceResult, setDiceResult] = useState(null);
  const [diceHistory, setDiceHistory] = useState([]);
  const [initiative, setInitiative] = useState(campaign.initiative || []);
  const [activeTurn, setActiveTurn] = useState(0);
  const [sessionNotes, setSessionNotes] = useState(campaign.sessionNotes||"");
  const [newCombatant, setNewCombatant] = useState({name:"",initiative:0,hp:10,maxHp:10,type:"enemy"});

  function syncInitiative(init) {
    setInitiative(init);
    onChange({...campaign,initiative:init});
  }

  function roll(count,sides,mod=0) {
    let total=0; let rolls=[];
    for(let i=0;i<count;i++){const r=rollDie(sides);total+=r;rolls.push(r);}
    total+=mod;
    const label=`${count}d${sides}${mod>0?`+${mod}`:mod<0?`${mod}`:""}`;
    const result={label,rolls,mod,total,time:new Date().toLocaleTimeString()};
    setDiceResult(result);
    setDiceHistory(h=>[result,...h.slice(0,9)]);
    return total;
  }

  function addCombatant() {
    if(!newCombatant.name) return;
    const c={...newCombatant,id:`comb_${Date.now()}`,conditions:[]};
    syncInitiative([...initiative,c].sort((a,b)=>b.initiative-a.initiative));
    setNewCombatant({name:"",initiative:0,hp:10,maxHp:10,type:"enemy"});
  }

  function updateCombatantHP(id,delta) {
    syncInitiative(initiative.map(c=>c.id===id?{...c,hp:Math.max(0,Math.min(c.maxHp,c.hp+delta))}:c));
  }

  function removeCombatant(id) { syncInitiative(initiative.filter(c=>c.id!==id)); }
  function nextTurn() { setActiveTurn(t=>(t+1)%Math.max(1,initiative.length)); }
  function clearCombat() { syncInitiative([]); setActiveTurn(0); }

  const DICE = [{l:"d4",s:4},{l:"d6",s:6},{l:"d8",s:8},{l:"d10",s:10},{l:"d12",s:12},{l:"d20",s:20},{l:"d100",s:100}];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="page-header">
        <h1>⚡ The Table</h1>
        <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)"}}>Live Session Mode</span>
      </div>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
          {/* Initiative tracker */}
          <div>
            <div className="section-header">
              <h2>Initiative Tracker</h2>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-primary" onClick={nextTurn}>Next Turn →</button>
                <button className="btn-danger btn-sm" onClick={clearCombat}>Clear</button>
              </div>
            </div>
            {/* Add combatant */}
            <div className="card-sm" style={{marginBottom:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 70px 70px 70px 80px auto",gap:8,alignItems:"end"}}>
                <Field label="Name" style={{margin:0}}><input value={newCombatant.name} placeholder="Name..." onChange={e=>setNewCombatant({...newCombatant,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addCombatant()}/></Field>
                <Field label="Init" style={{margin:0}}><input type="number" value={newCombatant.initiative} onChange={e=>setNewCombatant({...newCombatant,initiative:parseInt(e.target.value)||0})}/></Field>
                <Field label="HP" style={{margin:0}}><input type="number" value={newCombatant.hp} onChange={e=>setNewCombatant({...newCombatant,hp:parseInt(e.target.value)||0,maxHp:parseInt(e.target.value)||0})}/></Field>
                <Field label="Type" style={{margin:0}}>
                  <select value={newCombatant.type} onChange={e=>setNewCombatant({...newCombatant,type:e.target.value})}>
                    <option value="player">Player</option>
                    <option value="ally">Ally</option>
                    <option value="enemy">Enemy</option>
                  </select>
                </Field>
                <div/>
                <button className="btn-primary" onClick={addCombatant} style={{alignSelf:"flex-end",marginBottom:1}}>Add</button>
              </div>
            </div>

            {initiative.length===0 && <div className="list-empty">Add combatants to begin tracking initiative.</div>}
            {initiative.map((c,i)=>{
              const typeColor = c.type==="player"?"var(--teal)":c.type==="ally"?"var(--green)":"var(--red)";
              return (
                <div key={c.id} className={`initiative-row${i===activeTurn?" active-turn":""}`}>
                  <span className="init-order">{c.initiative}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:14,color:i===activeTurn?"var(--gold-light)":"var(--text)"}}>{c.name}</span>
                      <span style={{fontFamily:"var(--font-mono)",fontSize:9,padding:"1px 6px",background:`${typeColor}20`,color:typeColor,border:`1px solid ${typeColor}40`,borderRadius:2,textTransform:"uppercase",letterSpacing:"0.1em"}}>{c.type}</span>
                    </div>
                    {c.conditions&&c.conditions.length>0&&<div style={{marginTop:4}}>{c.conditions.map(cond=><span key={cond} className="condition-chip">{cond}</span>)}</div>}
                  </div>
                  <div className="init-hp">
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <button className="btn-ghost btn-sm" onClick={()=>updateCombatantHP(c.id,-1)}>−</button>
                      <span style={{color:c.hp/c.maxHp>0.5?"var(--green)":c.hp/c.maxHp>0.25?"var(--gold)":"var(--red)",fontFamily:"var(--font-mono)",fontSize:13}}>{c.hp}/{c.maxHp}</span>
                      <button className="btn-ghost btn-sm" onClick={()=>updateCombatantHP(c.id,+1)}>+</button>
                    </div>
                  </div>
                  <button className="btn-danger btn-sm" onClick={()=>removeCombatant(c.id)}>✕</button>
                </div>
              );
            })}

            <hr className="divider"/>
            <h3>Quick Session Notes</h3>
            <textarea value={sessionNotes} rows={6} placeholder="Scratch pad for mid-session notes..." onChange={e=>{setSessionNotes(e.target.value);onChange({...campaign,sessionNotes:e.target.value})}}/>
          </div>

          {/* Dice roller */}
          <div>
            <div className="section-header"><h2>Dice Roller</h2></div>
            <div className="card" style={{textAlign:"center",marginBottom:12}}>
              {diceResult ? (
                <>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)",marginBottom:4}}>{diceResult.label}</div>
                  <div className="dice-result">{diceResult.total}</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--faint)"}}>
                    [{diceResult.rolls.join(", ")}]{diceResult.mod!==0?` ${diceResult.mod>0?"+":""}${diceResult.mod}`:""}
                  </div>
                </>
              ) : (
                <div style={{color:"var(--faint)",padding:"24px 0",fontStyle:"italic"}}>Roll a die...</div>
              )}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
              {DICE.map(d=>(
                <button key={d.l} className="btn-ghost" style={{padding:"12px 4px",fontSize:12}} onClick={()=>roll(1,d.s)}>{d.l}</button>
              ))}
              <button className="btn-ghost" style={{padding:"12px 4px",fontSize:11}} onClick={()=>roll(2,6)}>2d6</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
              <button className="btn-ghost" onClick={()=>roll(1,20,0)} style={{background:"rgba(201,146,58,0.1)",borderColor:"var(--gold-dim)",color:"var(--gold-light)"}}>Advantage (2d20H)</button>
              <button className="btn-ghost" onClick={()=>{const a=rollDie(20),b=rollDie(20);const result={label:"Disadvantage",rolls:[a,b],mod:0,total:Math.min(a,b),time:new Date().toLocaleTimeString()};setDiceResult(result);setDiceHistory(h=>[result,...h.slice(0,9)])}} style={{background:"rgba(196,64,64,0.1)",borderColor:"rgba(196,64,64,0.3)",color:"var(--red)"}}>Disadvantage (2d20L)</button>
            </div>
            {diceHistory.length>0&&(
              <div className="card-sm">
                <h3>History</h3>
                <div className="dice-history">
                  {diceHistory.map((r,i)=>(
                    <div key={i} style={{padding:"2px 0",color:i===0?"var(--text)":"var(--faint)"}}>
                      {r.label}: <strong style={{color:i===0?"var(--gold-light)":"var(--muted)"}}>{r.total}</strong>
                      <span style={{float:"right",fontSize:10}}>{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VAULT PAGE
// ============================================================
function VaultPage({ campaign, onChange }) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="page-header"><h1>🏛 The Vault</h1></div>
      <div className="page-body">
        <div className="card">
          <h3>House Rules</h3>
          <textarea value={campaign.houseRules||""} rows={10} placeholder="Document your house rules, custom mechanics, and campaign-specific rules here..." onChange={e=>onChange({...campaign,houseRules:e.target.value})}/>
        </div>
        <div className="card" style={{marginTop:12}}>
          <div style={{color:"var(--muted)",fontStyle:"italic",fontSize:14,lineHeight:1.7}}>
            <strong style={{color:"var(--gold)",fontStyle:"normal"}}>Coming in next version:</strong>
            <ul style={{marginTop:8,paddingLeft:20}}>
              {["Homebrew items & magic items with full stat blocks","Custom monsters & stat blocks","Homebrew spells","Random encounter tables","Custom treasure tables","Campaign timeline / calendar","Relationship web (visual NPC connections)"].map(i=><li key={i} style={{marginBottom:6}}>{i}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PHASE 2 — GLOBAL SEARCH
// ============================================================
function GlobalSearch({ campaign, onNavigate }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  function fuzzy(text, query) {
    if (!text || !query) return false;
    return text.toLowerCase().includes(query.toLowerCase());
  }
  function excerpt(text, query) {
    if (!text) return "";
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return text.slice(0, 60);
    const start = Math.max(0, i - 20);
    return (start > 0 ? "…" : "") + text.slice(start, start + 80) + (start + 80 < text.length ? "…" : "");
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(() => {
      const r = [];
      // Characters
      (campaign.characters || []).forEach(c => {
        if (fuzzy(c.name, q) || fuzzy(c.playerName, q) || fuzzy(c.race, q) || fuzzy(c.charClass, q)) {
          r.push({ group:"Characters", name: c.name, excerpt: `${c.race} ${c.charClass} — Player: ${c.playerName}`, action:()=>onNavigate("party", null, c.id) });
        }
      });
      // NPCs
      (campaign.npcs || []).forEach(n => {
        if (fuzzy(n.name, q) || fuzzy(n.description, q) || fuzzy(n.location, q) || fuzzy(n.motivation, q) || fuzzy(n.personality, q)) {
          r.push({ group:"NPCs", name: n.name, excerpt: excerpt(n.description || n.motivation || n.location, q), action:()=>onNavigate("world","npcs",n.id) });
        }
      });
      // Locations
      (campaign.locations || []).forEach(l => {
        if (fuzzy(l.name, q) || fuzzy(l.description, q) || fuzzy(l.region, q) || fuzzy(l.atmosphere, q)) {
          r.push({ group:"Locations", name: l.name, excerpt: excerpt(l.atmosphere || l.description || l.region, q), action:()=>onNavigate("world","locations",l.id) });
        }
      });
      // Factions
      (campaign.factions || []).forEach(f => {
        if (fuzzy(f.name, q) || fuzzy(f.goals, q) || fuzzy(f.methods, q)) {
          r.push({ group:"Factions", name: f.name, excerpt: excerpt(f.goals, q), action:()=>onNavigate("world","factions",f.id) });
        }
      });
      // Lore
      (campaign.lore || []).forEach(l => {
        if (fuzzy(l.name, q) || fuzzy(l.content, q)) {
          r.push({ group:"Lore", name: l.name, excerpt: excerpt(l.content, q), action:()=>onNavigate("world","lore",l.id) });
        }
      });
      // Sessions
      (campaign.sessions || []).forEach(s => {
        if (fuzzy(s.summary, q) || fuzzy(s.keyEvents, q) || fuzzy(s.npcsEncountered, q)) {
          r.push({ group:"Sessions", name: `Session ${s.number} — ${s.date}`, excerpt: excerpt(s.summary || s.keyEvents, q), action:()=>onNavigate("story","sessions",s.id) });
        }
      });
      // Quests
      (campaign.quests || []).forEach(qst => {
        if (fuzzy(qst.name, q) || fuzzy(qst.objective, q) || fuzzy(qst.giver, q)) {
          r.push({ group:"Quests", name: qst.name, excerpt: excerpt(qst.objective, q), action:()=>onNavigate("story","quests",qst.id) });
        }
      });
      // Plot Threads
      (campaign.plotThreads || []).forEach(t => {
        if (fuzzy(t.name, q) || fuzzy(t.cluesFound, q) || fuzzy(t.truth, q)) {
          r.push({ group:"Threads", name: t.name, excerpt: excerpt(t.cluesFound, q), action:()=>onNavigate("story","threads",t.id) });
        }
      });
      setResults(r.slice(0, 40));
      setFocusIdx(0);
      setOpen(r.length > 0);
    }, 200);
    return () => clearTimeout(timerRef.current);
  }, [q, campaign]);

  function handleKey(e) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx(i => Math.min(i+1, results.length-1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocusIdx(i => Math.max(i-1, 0)); }
    if (e.key === "Enter" && results[focusIdx]) { results[focusIdx].action(); setQ(""); setOpen(false); }
    if (e.key === "Escape") { setQ(""); setOpen(false); }
  }

  // Group results
  const grouped = {};
  results.forEach(r => { if (!grouped[r.group]) grouped[r.group] = []; grouped[r.group].push(r); });
  let flatIdx = 0;

  return (
    <div className="search-wrap">
      <span className="search-icon">⌕</span>
      <input
        ref={inputRef}
        value={q}
        placeholder="Search everything..."
        onChange={e => setQ(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => q && results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="search-dropdown">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="search-group-label">{group}</div>
              {items.map(item => {
                const idx = flatIdx++;
                return (
                  <div key={idx} className={`search-result${focusIdx === idx ? " focused" : ""}`}
                    onMouseDown={() => { item.action(); setQ(""); setOpen(false); }}>
                    <div className="search-result-name">{item.name}</div>
                    {item.excerpt && <div className="search-result-excerpt">{item.excerpt}</div>}
                  </div>
                );
              })}
            </div>
          ))}
          {results.length === 0 && <div style={{padding:"16px",color:"var(--faint)",fontStyle:"italic",fontSize:13}}>No results for "{q}"</div>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PHASE 2 — NPC RELATIONSHIP WEB (SVG Force Graph)
// ============================================================
function RelationshipWeb({ campaign, onChange }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const nodesRef = useRef([]);
  const animRef = useRef(null);
  const runningRef = useRef(false);

  const npcs = campaign.npcs || [];

  const edges = [];
  npcs.forEach(npc => {
    (npc.npcRelationships || []).forEach(rel => {
      if (npcs.find(n => n.id === rel.targetId))
        edges.push({ source: npc.id, target: rel.targetId, label: rel.label, notes: rel.notes, ownerId: npc.id, relId: rel.id });
    });
  });

  function calcDefaultPositions() {
    const el = containerRef.current;
    const W = el ? el.clientWidth : 700;
    const H = el ? el.clientHeight : 500;
    const count = Math.max(1, npcs.length);
    return npcs.map((npc, i) => ({
      id: npc.id,
      x: W/2 + Math.cos(i * 2*Math.PI/count - Math.PI/2) * Math.min(W,H) * 0.33,
      y: H/2 + Math.sin(i * 2*Math.PI/count - Math.PI/2) * Math.min(W,H) * 0.33,
      vx: 0, vy: 0
    }));
  }

  // Sync nodes when NPC list changes (add new, keep existing positions)
  useEffect(() => {
    setNodes(prev => {
      const map = {};
      prev.forEach(n => { map[n.id] = n; });
      const defaults = calcDefaultPositions();
      const next = npcs.map((npc, i) => map[npc.id] || defaults[i]);
      nodesRef.current = next;
      return next;
    });
  }, [npcs.length]);

  function runSim(initialNodes) {
    runningRef.current = true;
    let fn = initialNodes.map(n => ({...n}));
    let iter = 0;
    function tick() {
      if (!runningRef.current || iter++ > 320) return;
      const el = containerRef.current;
      const W = el ? el.clientWidth : 700, H = el ? el.clientHeight : 500;
      const REPEL = 5500, DAMP = 0.80, ELEN = 190, SPRING = 0.045, GRAV = 0.007;
      for (let i = 0; i < fn.length; i++) {
        let fx = 0, fy = 0;
        for (let j = 0; j < fn.length; j++) {
          if (i===j) continue;
          const dx=fn[i].x-fn[j].x, dy=fn[i].y-fn[j].y;
          const d2=Math.max(1,dx*dx+dy*dy), d=Math.sqrt(d2);
          fx+=(dx/d)*REPEL/d2; fy+=(dy/d)*REPEL/d2;
        }
        edges.forEach(e => {
          const oid = e.source===fn[i].id ? e.target : e.target===fn[i].id ? e.source : null;
          if (!oid) return;
          const o = fn.find(n=>n.id===oid); if (!o) return;
          const dx=o.x-fn[i].x, dy=o.y-fn[i].y, d=Math.max(1,Math.sqrt(dx*dx+dy*dy));
          fx+=(dx/d)*(d-ELEN)*SPRING; fy+=(dy/d)*(d-ELEN)*SPRING;
        });
        fx+=(W/2-fn[i].x)*GRAV; fy+=(H/2-fn[i].y)*GRAV;
        fn[i].vx=(fn[i].vx+fx)*DAMP; fn[i].vy=(fn[i].vy+fy)*DAMP;
        fn[i].x=Math.max(55,Math.min(W-55,fn[i].x+fn[i].vx));
        fn[i].y=Math.max(55,Math.min(H-55,fn[i].y+fn[i].vy));
      }
      nodesRef.current=[...fn];
      setNodes([...fn]);
      animRef.current=requestAnimationFrame(tick);
    }
    animRef.current=requestAnimationFrame(tick);
  }

  useEffect(() => {
    if (nodesRef.current.length===0) return;
    runSim(nodesRef.current);
    return () => { runningRef.current=false; cancelAnimationFrame(animRef.current); };
  }, [npcs.length, edges.length]);

  function resetLayout() {
    runningRef.current=false; cancelAnimationFrame(animRef.current);
    setZoom(1); setPan({x:0,y:0});
    const fresh = calcDefaultPositions();
    nodesRef.current=fresh; setNodes(fresh);
    setTimeout(()=>runSim(fresh), 30);
  }

  function startDrag(e, nodeId) {
    e.stopPropagation();
    runningRef.current=false; cancelAnimationFrame(animRef.current);
    const svg=svgRef.current, pt=svg.createSVGPoint();
    function onMove(ev) {
      pt.x=ev.clientX; pt.y=ev.clientY;
      const sp=pt.matrixTransform(svg.getScreenCTM().inverse());
      const nx=(sp.x-pan.x)/zoom, ny=(sp.y-pan.y)/zoom;
      nodesRef.current=nodesRef.current.map(n=>n.id===nodeId?{...n,x:nx,y:ny,vx:0,vy:0}:n);
      setNodes([...nodesRef.current]);
    }
    function onUp() { window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); }
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp);
  }

  function nodeColor(att) {
    return att==="Friendly"?"#5ab85a":att==="Hostile"?"#c44040":att==="Unknown"?"#6a6050":"#c9923a";
  }
  function nodeR(npc) {
    const out=(npc.npcRelationships||[]).length;
    const inn=edges.filter(e=>e.target===npc.id).length;
    return Math.min(40,22+(out+inn)*2);
  }

  function addRelationship(npcId, targetId, label) {
    const rel={id:`rel_${Date.now()}`,targetId,label,notes:""};
    onChange(prev=>({...prev,npcs:prev.npcs.map(n=>n.id===npcId?{...n,npcRelationships:[...(n.npcRelationships||[]),rel]}:n)}));
  }
  function removeRelationship(npcId, relId) {
    onChange(prev=>({...prev,npcs:prev.npcs.map(n=>n.id===npcId?{...n,npcRelationships:(n.npcRelationships||[]).filter(r=>r.id!==relId)}:n)}));
  }

  const selectedNpc = selectedId ? npcs.find(n=>n.id===selectedId) : null;

  if (npcs.length===0) return (
    <div className="list-empty" style={{padding:60}}>
      <div style={{fontSize:32,marginBottom:12}}>🕸</div>
      <p>Add NPCs in the NPCs tab first, then come back here to map their relationships.</p>
    </div>
  );

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",height:"calc(100vh - 180px)"}}>

      {/* ── GRAPH CANVAS ── */}
      <div ref={containerRef} style={{position:"relative",background:"#0a0806",overflow:"hidden"}}>

        {/* Dot-grid background */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#1e1810"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)"/>
        </svg>

        {/* Zoom controls */}
        <div style={{position:"absolute",top:12,right:12,display:"flex",gap:5,zIndex:10}}>
          <button className="btn-ghost btn-sm" onClick={()=>setZoom(z=>Math.min(2.5,+(z+0.15).toFixed(2)))}>+</button>
          <button className="btn-ghost btn-sm" onClick={()=>setZoom(z=>Math.max(0.3,+(z-0.15).toFixed(2)))}>−</button>
          <button className="btn-ghost btn-sm" onClick={resetLayout} title="Reset positions to default layout">⟳</button>
          <span style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--faint)",alignSelf:"center",paddingLeft:2}}>{Math.round(zoom*100)}%</span>
        </div>

        {/* Attitude legend */}
        <div style={{position:"absolute",bottom:10,left:12,display:"flex",gap:"6px 14px",flexWrap:"wrap",pointerEvents:"none",zIndex:5}}>
          {[["Friendly","#5ab85a"],["Neutral","#c9923a"],["Hostile","#c44040"],["Unknown","#6a6050"]].map(([l,c])=>(
            <span key={l} style={{display:"flex",alignItems:"center",gap:4,fontFamily:"var(--font-mono)",fontSize:9,color:c,textTransform:"uppercase",letterSpacing:"0.08em"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:c,opacity:0.8,display:"inline-block"}}/>
              {l}
            </span>
          ))}
        </div>

        <svg ref={svgRef} width="100%" height="100%" style={{display:"block",minHeight:480}} onClick={()=>setSelectedId(null)}>
          <defs>
            {REL_TYPES.map(t=>{
              const c=REL_COLORS[t]||"#8a7a60";
              const k=t.replace(/[^a-z]/gi,"");
              return [
                <marker key={"m"+k} id={"m"+k} markerWidth="9" markerHeight="9" refX="24" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={c} opacity="0.55"/>
                </marker>,
                <marker key={"mh"+k} id={"mh"+k} markerWidth="9" markerHeight="9" refX="24" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={c} opacity="1"/>
                </marker>
              ];
            })}
            <filter id="softglow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="strongglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* ── EDGES ── */}
            {edges.map((e,i) => {
              const s=nodes.find(n=>n.id===e.source), t=nodes.find(n=>n.id===e.target);
              if (!s||!t) return null;
              const color=REL_COLORS[e.label]||"#8a7a60";
              const isHov=hoveredEdge===i;
              const isRelated=selectedId&&(e.source===selectedId||e.target===selectedId);
              const dimmed=selectedId&&!isRelated;
              // Perpendicular offset to separate parallel edges
              const dx=t.x-s.x, dy=t.y-s.y, len=Math.max(1,Math.sqrt(dx*dx+dy*dy));
              const px=-dy/len*5, py=dx/len*5;
              const mx=(s.x+t.x)/2+px, my=(s.y+t.y)/2+py;
              const mk=(isHov||isRelated)?"mh"+e.label.replace(/[^a-z]/gi,""):"m"+e.label.replace(/[^a-z]/gi,"");
              const sw=isHov||isRelated?2.5:1.5;
              const so=isHov||isRelated?0.85:dimmed?0.04:0.35;
              const dash=e.label==="Unknown"?"6 4":e.label==="Rival"?"3 3":undefined;

              return (
                <g key={i} style={{cursor:"pointer"}} opacity={dimmed?0.05:1}
                  onMouseEnter={()=>setHoveredEdge(i)} onMouseLeave={()=>setHoveredEdge(null)}>
                  {/* fat invisible hit area */}
                  <line x1={s.x+px} y1={s.y+py} x2={t.x+px} y2={t.y+py} stroke="transparent" strokeWidth={16}/>
                  {/* glow layer when active */}
                  {(isHov||isRelated)&&(
                    <line x1={s.x+px} y1={s.y+py} x2={t.x+px} y2={t.y+py}
                      stroke={color} strokeWidth={6} strokeOpacity={0.12}/>
                  )}
                  {/* main line */}
                  <line x1={s.x+px} y1={s.y+py} x2={t.x+px} y2={t.y+py}
                    stroke={color} strokeWidth={sw} strokeOpacity={so}
                    strokeDasharray={dash}
                    markerEnd={`url(#${mk})`}
                    filter={(isHov||isRelated)?"url(#softglow)":undefined}/>
                  {/* label pill on hover or when related to selected node */}
                  {(isHov||isRelated) ? (
                    <g>
                      <rect x={mx-28} y={my-11} width={56} height={17} rx={8}
                        fill="#0a0806" stroke={color} strokeWidth={1} strokeOpacity={0.8}/>
                      <text x={mx} y={my+2} fill={color} fontSize={8.5} textAnchor="middle"
                        fontFamily="JetBrains Mono,monospace" fontWeight="500" letterSpacing="0.05em">{e.label}</text>
                    </g>
                  ) : !dimmed && (
                    <text x={mx} y={my-6} fill={color} fontSize={8} textAnchor="middle"
                      fontFamily="JetBrains Mono,monospace" opacity={0.4}>{e.label}</text>
                  )}
                </g>
              );
            })}

            {/* ── NODES ── */}
            {nodes.map(node => {
              const npc=npcs.find(n=>n.id===node.id); if (!npc) return null;
              const color=nodeColor(npc.attitude);
              const r=nodeR(npc);
              const isSel=selectedId===npc.id;
              const hasRels=(npc.npcRelationships||[]).length>0||edges.some(e=>e.target===npc.id);
              const connectedToSel=selectedId&&(edges.some(e=>(e.source===selectedId&&e.target===npc.id)||(e.target===selectedId&&e.source===npc.id)));
              const dimmed=selectedId&&!isSel&&!connectedToSel;
              const nameLines = npc.name.length>11 ? [npc.name.slice(0,11), npc.name.slice(11,22)+(npc.name.length>22?"…":"")] : [npc.name];

              return (
                <g key={node.id} style={{cursor:"grab"}} opacity={dimmed?0.15:1}
                  transform={`translate(${node.x},${node.y})`}
                  onMouseDown={ev=>startDrag(ev,node.id)}
                  onClick={ev=>{ev.stopPropagation();setSelectedId(isSel?null:npc.id);}}>

                  {/* selection ring */}
                  {isSel&&<circle r={r+10} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.25} strokeDasharray="5 3"/>}

                  {/* drop shadow */}
                  <circle r={r+1} fill="rgba(0,0,0,0.45)" cx={2} cy={3}/>

                  {/* outer glow fill */}
                  <circle r={r} fill={color} fillOpacity={isSel?0.28:0.1}
                    stroke={color} strokeWidth={isSel?2.5:1.5}
                    filter={isSel?"url(#strongglow)":hasRels?"url(#softglow)":undefined}/>

                  {/* inner ring */}
                  <circle r={r*0.52} fill={color} fillOpacity={0.09} stroke={color} strokeWidth={0.5} strokeOpacity={0.3}/>

                  {/* status badges */}
                  {npc.status==="Dead"&&<text y={-r-5} fontSize={12} textAnchor="middle">💀</text>}
                  {npc.status==="Missing"&&<text y={-r-5} fontSize={12} textAnchor="middle">❓</text>}

                  {/* name text — two lines if long */}
                  {nameLines.length===2 ? (
                    <>
                      <text y={-4} fill={color} fontSize={10} textAnchor="middle" fontFamily="Cinzel,serif" fontWeight="600">{nameLines[0]}</text>
                      <text y={8}  fill={color} fontSize={10} textAnchor="middle" fontFamily="Cinzel,serif" fontWeight="600">{nameLines[1]}</text>
                    </>
                  ):(
                    <text y={4} fill={color} fontSize={11} textAnchor="middle" fontFamily="Cinzel,serif" fontWeight="600">{nameLines[0]}</text>
                  )}

                  {/* subtitle */}
                  {(npc.race||npc.occupation)&&(
                    <text y={r+13} fill={color} fontSize={8} textAnchor="middle"
                      fontFamily="JetBrains Mono,monospace" opacity={0.45} style={{letterSpacing:"0.06em"}}>
                      {(npc.race||npc.occupation).slice(0,14).toUpperCase()}
                    </text>
                  )}

                  {/* relationship count badge */}
                  {hasRels&&!isSel&&(()=>{
                    const cnt=(npc.npcRelationships||[]).length+edges.filter(e=>e.target===npc.id).length;
                    return (
                      <g transform={`translate(${r-1},${-r+1})`}>
                        <circle r={8} fill={color} opacity={0.9}/>
                        <text y={3.5} fontSize={8.5} textAnchor="middle" fill="#0a0806" fontFamily="JetBrains Mono,monospace" fontWeight="700">{cnt}</text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ── SIDEBAR ── */}
      <div style={{background:"var(--surface)",borderLeft:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {selectedNpc ? (
          /* ── SELECTED NPC DETAIL ── */
          <div style={{flex:1,overflow:"auto",padding:"16px 14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:15,color:"var(--gold-light)",lineHeight:1.3}}>{selectedNpc.name}</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--muted)",marginTop:3}}>
                  {[selectedNpc.race,selectedNpc.occupation,selectedNpc.status].filter(Boolean).join(" · ")}
                </div>
              </div>
              <button className="close-btn" style={{marginLeft:8,flexShrink:0}} onClick={()=>setSelectedId(null)}>✕</button>
            </div>
            {selectedNpc.location&&<div style={{fontSize:11,color:"var(--faint)",marginBottom:8}}>📍 {selectedNpc.location}</div>}
            {selectedNpc.personality&&<div style={{fontSize:12,color:"var(--muted)",fontStyle:"italic",marginBottom:10,lineHeight:1.5,borderLeft:"2px solid var(--border2)",paddingLeft:8}}>"{selectedNpc.personality}"</div>}

            <hr className="divider" style={{margin:"10px 0"}}/>
            <h3 style={{marginBottom:8}}>Relationships</h3>

            {/* Outgoing rels */}
            {(selectedNpc.npcRelationships||[]).map(rel=>{
              const tgt=npcs.find(n=>n.id===rel.targetId); if (!tgt) return null;
              const c=REL_COLORS[rel.label]||"#8a7a60";
              return (
                <div key={rel.id} style={{display:"flex",alignItems:"stretch",gap:0,marginBottom:6,borderRadius:3,overflow:"hidden",border:`1px solid ${c}28`}}>
                  <div style={{width:3,background:c,flexShrink:0}}/>
                  <div style={{flex:1,padding:"6px 8px",background:"var(--card)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,color:"var(--text)"}}>{tgt.name}</span>
                      <button className="btn-danger btn-sm" style={{padding:"1px 6px",fontSize:9}} onClick={()=>removeRelationship(selectedNpc.id,rel.id)}>✕</button>
                    </div>
                    <div style={{fontSize:10,color:c,fontFamily:"var(--font-mono)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:1}}>{rel.label}</div>
                    {rel.notes&&<div style={{fontSize:11,color:"var(--muted)",marginTop:3,fontStyle:"italic"}}>{rel.notes}</div>}
                  </div>
                </div>
              );
            })}

            {/* Incoming rels */}
            {edges.filter(e=>e.target===selectedNpc.id).map((e,i)=>{
              const src=npcs.find(n=>n.id===e.source); if (!src) return null;
              const c=REL_COLORS[e.label]||"#8a7a60";
              return (
                <div key={`in-${i}`} style={{display:"flex",alignItems:"stretch",gap:0,marginBottom:6,borderRadius:3,overflow:"hidden",border:`1px solid ${c}18`,opacity:0.7}}>
                  <div style={{width:3,background:c,opacity:0.5,flexShrink:0}}/>
                  <div style={{flex:1,padding:"6px 8px",background:"var(--card2)"}}>
                    <div style={{fontSize:13,color:"var(--muted)"}}>{src.name} <span style={{color:"var(--faint)",fontSize:10}}>→ this NPC</span></div>
                    <div style={{fontSize:10,color:c,fontFamily:"var(--font-mono)",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:1}}>{e.label}</div>
                  </div>
                </div>
              );
            })}

            {(selectedNpc.npcRelationships||[]).length===0&&edges.filter(e=>e.target===selectedNpc.id).length===0&&(
              <div style={{fontSize:12,color:"var(--faint)",fontStyle:"italic",marginBottom:12}}>No relationships yet.</div>
            )}

            <hr className="divider" style={{margin:"10px 0"}}/>
            <h3 style={{marginBottom:8}}>Add Relationship</h3>
            <AddRelationshipRow npc={selectedNpc} npcs={npcs} onAdd={(tid,lbl)=>addRelationship(selectedNpc.id,tid,lbl)}/>
          </div>

        ) : (
          /* ── NPC LIST ── */
          <div style={{flex:1,overflow:"auto"}}>
            <div style={{padding:"12px 14px 8px",borderBottom:"1px solid var(--border)"}}>
              <h3 style={{margin:0}}>All NPCs</h3>
              <div style={{fontSize:10,color:"var(--faint)",marginTop:3,fontFamily:"var(--font-mono)"}}>Click a node to manage relationships</div>
            </div>
            {npcs.map(npc=>{
              const c=nodeColor(npc.attitude);
              const cnt=(npc.npcRelationships||[]).length+edges.filter(e=>e.target===npc.id).length;
              return (
                <div key={npc.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid rgba(46,37,24,0.35)",transition:"background 0.12s"}}
                  onClick={()=>setSelectedId(npc.id)}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(201,146,58,0.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:9,height:9,borderRadius:"50%",background:c,flexShrink:0,boxShadow:`0 0 5px ${c}55`}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{npc.name}</div>
                    {(npc.race||npc.occupation)&&<div style={{fontSize:9,color:"var(--faint)",fontFamily:"var(--font-mono)",marginTop:1,textTransform:"uppercase",letterSpacing:"0.06em"}}>{(npc.race||"")+(npc.race&&npc.occupation?" · ":""+(npc.occupation||""))}</div>}
                  </div>
                  {cnt>0&&<span style={{fontFamily:"var(--font-mono)",fontSize:9,color:c,background:`${c}18`,border:`1px solid ${c}30`,borderRadius:10,padding:"1px 7px",flexShrink:0}}>{cnt}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Relationship type legend */}
        <div style={{padding:"9px 14px",borderTop:"1px solid var(--border)",flexShrink:0}}>
          <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--faint)",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:5}}>Types</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px"}}>
            {REL_TYPES.map(t=>(
              <span key={t} style={{fontSize:9,fontFamily:"var(--font-mono)",color:REL_COLORS[t]||"#8a7a60",display:"flex",alignItems:"center",gap:3}}>
                <span style={{width:5,height:5,background:REL_COLORS[t]||"#8a7a60",borderRadius:1,display:"inline-block",flexShrink:0}}/>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddRelationshipRow({ npc, npcs, onAdd }) {
  const [targetId, setTargetId] = useState("");
  const [label, setLabel] = useState("Ally");
  const others = npcs.filter(n=>n.id!==npc.id);
  return (
    <div style={{display:"flex",gap:4,marginTop:4}}>
      <select value={targetId} onChange={e=>setTargetId(e.target.value)} style={{fontSize:11,padding:"3px 6px",flex:1}}>
        <option value="">+ Link to...</option>
        {others.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}
      </select>
      <select value={label} onChange={e=>setLabel(e.target.value)} style={{fontSize:11,padding:"3px 6px",width:80}}>
        {REL_TYPES.map(t=><option key={t}>{t}</option>)}
      </select>
      <button className="btn-primary btn-sm" onClick={()=>{if(targetId){onAdd(targetId,label);setTargetId("");}}} style={{padding:"3px 8px"}}>+</button>
    </div>
  );
}

// ============================================================
// PHASE 2 — FACTION INFLUENCE TRACKER
// ============================================================
function FactionInfluence({ campaign, onChange }) {
  const [editingCell, setEditingCell] = useState(null);
  const factions = campaign.factions || [];
  const relations = campaign.factionRelations || {};

  function relKey(a,b) { return [a,b].sort().join("||"); }
  function getRel(aId,bId) { return relations[relKey(aId,bId)] || {type:"Unknown",notes:""}; }
  function setRel(aId,bId,type,notes) {
    const k = relKey(aId,bId);
    onChange(prev => ({...prev, factionRelations:{...prev.factionRelations,[k]:{type,notes}}}));
  }
  function updateInfluence(id,score) {
    onChange(prev => ({...prev, factions:prev.factions.map(f=>f.id===id?{...f,influenceScore:score}:f)}));
  }

  const attitudeColor = a => a==="Friendly"?"var(--green)":a==="Hostile"?"var(--red)":"var(--gold)";
  const sorted = [...factions].sort((a,b)=>(b.influenceScore||50)-(a.influenceScore||50));

  if (factions.length === 0) return (
    <div className="list-empty" style={{padding:60}}>
      <div style={{fontSize:32,marginBottom:12}}>⚑</div>
      <p>Add factions in the Factions tab first, then track their influence and relationships here.</p>
    </div>
  );

  return (
    <div>
      {/* Leaderboard */}
      <div className="card" style={{marginBottom:16}}>
        <h3>Influence Leaderboard</h3>
        {sorted.map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:160,fontFamily:"var(--font-serif)",fontSize:13,color:"var(--text)",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
            <div className="influence-bar-wrap">
              <div className="influence-bar" style={{width:`${f.influenceScore||50}%`, background:attitudeColor(f.attitude)+"aa"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,width:120,flexShrink:0}}>
              <input type="range" min="0" max="100" value={f.influenceScore||50}
                style={{flex:1,accentColor:"var(--gold)",cursor:"pointer"}}
                onChange={e=>updateInfluence(f.id,parseInt(e.target.value))}/>
              <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--gold-light)",width:28,textAlign:"right"}}>{f.influenceScore||50}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Relationship Matrix */}
      {factions.length >= 2 && (
        <div className="card">
          <h3>Faction Relationship Matrix</h3>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",minWidth:400}}>
              <thead>
                <tr>
                  <th className="faction-matrix-header" style={{minWidth:100}}></th>
                  {factions.map(f=>(
                    <th key={f.id} className="faction-matrix-header" style={{minWidth:90,maxWidth:90}}>
                      <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:86,color:"var(--gold-light)"}}>{f.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {factions.map(rowF=>(
                  <tr key={rowF.id}>
                    <td className="faction-matrix-header" style={{textAlign:"right",color:"var(--gold-light)",maxWidth:100}}>
                      <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rowF.name}</div>
                    </td>
                    {factions.map(colF=>{
                      if (rowF.id === colF.id) return (
                        <td key={colF.id} className="faction-matrix-cell" style={{background:"var(--surface)",color:"var(--faint)"}}>—</td>
                      );
                      const rel = getRel(rowF.id, colF.id);
                      const color = FAC_REL_COLORS[rel.type] || "#4a3e2a";
                      return (
                        <td key={colF.id} className="faction-matrix-cell"
                          style={{color, background:`${color}18`}}
                          onClick={()=>setEditingCell({aId:rowF.id,bId:colF.id,aName:rowF.name,bName:colF.name})}>
                          {rel.type}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:8,display:"flex",gap:12,flexWrap:"wrap"}}>
            {Object.entries(FAC_REL_COLORS).map(([t,c])=>(
              <span key={t} style={{fontSize:10,fontFamily:"var(--font-mono)",color:c,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:8,height:8,background:c,borderRadius:1,display:"inline-block"}}/>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cell editor modal */}
      {editingCell && (()=>{
        const rel = getRel(editingCell.aId, editingCell.bId);
        return (
          <Modal title={`${editingCell.aName} ↔ ${editingCell.bName}`} onClose={()=>setEditingCell(null)}>
            <Field label="Relationship Type">
              <select value={rel.type} onChange={e=>setRel(editingCell.aId,editingCell.bId,e.target.value,rel.notes)}>
                {FAC_REL_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Notes">
              <textarea value={rel.notes||""} rows={4} placeholder="Details about this relationship..."
                onChange={e=>setRel(editingCell.aId,editingCell.bId,rel.type,e.target.value)}/>
            </Field>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
              <button className="btn-primary" onClick={()=>setEditingCell(null)}>Done</button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
function App() {
  const [data, setData] = useState(() => loadData() || defaultAppData());
  const [page, setPage] = useState("party");
  const saved = useAutosave(data);
  const [isMobile, setIsMobile] = useState(() => {
    try { return localStorage.getItem("gm_logbook_mobile") === "1"; } catch { return false; }
  });
  function toggleMobile() {
    setIsMobile(m => {
      const next = !m;
      try { localStorage.setItem("gm_logbook_mobile", next ? "1" : "0"); } catch {}
      return next;
    });
  }

  const campaign = data.campaigns.find(c=>c.id===data.activeCampaignId) || data.campaigns[0];

  function updateCampaign(updatedOrFn) {
    if (typeof updatedOrFn === "function") {
      setData(d => {
        const campaign = d.campaigns.find(c => c.id === d.activeCampaignId) || d.campaigns[0];
        const updated = updatedOrFn(campaign);
        return { ...d, campaigns: d.campaigns.map(c => c.id === updated.id ? updated : c) };
      });
    } else {
      setData(d=>({...d,campaigns:d.campaigns.map(c=>c.id===updatedOrFn.id?updatedOrFn:c)}));
    }
  }

  function addCampaign() {
    const c = defaultCampaign(`camp_${Date.now()}`);
    c.name = `Campaign ${data.campaigns.length+1}`;
    setData(d=>({...d,campaigns:[...d.campaigns,c],activeCampaignId:c.id}));
    setPage("party");
  }

  const [navTarget, setNavTarget] = useState(null);

  function handleNavigate(section, subSection, itemId) {
    setPage(section);
    // Pass structured target so pages can deep-navigate and highlight
    setNavTarget({ page: section, subSection, itemId, ts: Date.now() });
  }

  const NAV = [
    {id:"party",icon:"⚔",label:"The Party"},
    {id:"world",icon:"🗺",label:"The World"},
    {id:"story",icon:"📜",label:"The Story"},
    {id:"vault",icon:"🏛",label:"The Vault"},
    {id:"table",icon:"⚡",label:"The Table"},
  ];

  const pageContent = (
    <>
      {page==="party" && <PartyPage campaign={campaign} onChange={updateCampaign} navTarget={navTarget}/>}
      {page==="world" && <WorldPage campaign={campaign} onChange={updateCampaign} navTarget={navTarget}/>}
      {page==="story" && <StoryPage campaign={campaign} onChange={updateCampaign} navTarget={navTarget}/>}
      {page==="vault" && <VaultPage campaign={campaign} onChange={updateCampaign}/>}
      {page==="table" && <TablePage campaign={campaign} onChange={updateCampaign}/>}
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {isMobile ? (
        /* ═══════════════════════════════════════
           MOBILE LAYOUT
           ═══════════════════════════════════════ */
        <div className="mobile-shell">
          {/* Top bar */}
          <div className="mobile-topbar">
            <span className="mobile-topbar-title">⚔ GM Logbook</span>
            <select value={campaign.id} onChange={e=>setData(d=>({...d,activeCampaignId:e.target.value}))}>
              {data.campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
              <div className={`saved-indicator${saved?" show":""}`} style={{fontSize:9}}>✓</div>
              <button className="layout-toggle-btn" onClick={toggleMobile} title="Switch to desktop layout">🖥 Desktop</button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{flexShrink:0}}>
            <GlobalSearch campaign={campaign} onNavigate={(s,ss,id)=>{handleNavigate(s,ss,id);}}/>
          </div>

          {/* Page content */}
          <div className="mobile-content main-content">
            {pageContent}
          </div>

          {/* Bottom navigation */}
          <div className="mobile-bottom-nav">
            {NAV.map(n=>(
              <button key={n.id} className={`mobile-nav-btn${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
                <span className="mobile-nav-btn-icon">{n.icon}</span>
                <span>{n.label.replace("The ","")}</span>
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ═══════════════════════════════════════
           DESKTOP LAYOUT
           ═══════════════════════════════════════ */
        <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-logo">
              <span style={{fontSize:18}}>⚔</span>
              <span>GM Logbook</span>
            </div>

            {/* Campaign switcher */}
            <div className="campaign-switcher">
              <label>Campaign</label>
              <select value={campaign.id} onChange={e=>setData(d=>({...d,activeCampaignId:e.target.value}))}>
                {data.campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button className="btn-ghost btn-sm" style={{marginTop:6,width:"100%"}} onClick={addCampaign}>+ New Campaign</button>
            </div>

            {/* Global Search */}
            <GlobalSearch campaign={campaign} onNavigate={handleNavigate}/>

            {/* Nav */}
            <div className="nav-section scroll-area">
              {NAV.map(n=>(
                <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
                  <span className="nav-item-icon">{n.icon}</span>
                  <span>{n.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom */}
            <div style={{padding:"12px 16px",borderTop:"1px solid var(--border)",marginTop:"auto"}}>
              <div className={`saved-indicator${saved?" show":""}`}>✓ Saved</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--faint)",marginTop:4,letterSpacing:"0.1em",marginBottom:8}}>Phase 2 · All data stored locally</div>
              <button className="layout-toggle-btn" style={{width:"100%"}} onClick={toggleMobile} title="Switch to mobile layout">📱 Mobile View</button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="main-content">
            {pageContent}
          </div>
        </div>
      )}
    </>
  );
}
