import { HardwareInfo, HardwareType, WeaponInfo, WeaponType } from './types';

export const WEAPONS: Record<WeaponType, WeaponInfo> = {
  ruler: {
    id: 'ruler',
    name: '塑膠三角板',
    subname: '入門設計必備神器',
    desc: '攻速快、距離短，普攻第三下能揮出小型銳利風壓。每個設計系學生的起點。',
    baseDamage: 18,
    attackSpeed: 0.18,
    range: 65,
    color: '#38bdf8',
  },
  compass: {
    id: 'compass',
    name: '德制圓規與製圖儀器',
    subname: '第一關菁英怪掉落',
    desc: '中距離高速突刺型精密武器，具有極高暴擊率，對幾何與圖學怪物傷害額外 +30%！',
    baseDamage: 32,
    attackSpeed: 0.22,
    range: 95,
    color: '#fbbf24',
  },
  marker: {
    id: 'marker',
    name: '雙頭麥克筆',
    subname: '第二關菁英怪掉落',
    desc: '揮舞時在地面空中留下絢爛墨水軌跡持續灼傷敵人。長按可蓄力潑灑大範圍高彩度顏料波！',
    baseDamage: 42,
    attackSpeed: 0.25,
    range: 85,
    color: '#f43f5e',
  },
  stylus: {
    id: 'stylus',
    name: '感壓繪圖筆',
    subname: '第三關菁英怪掉落・終極神兵',
    desc: '真實模擬 8192 階筆壓感應！按住攻擊鍵蓄力，釋放出從凌厲細線到毀天滅地的巨型書法劍氣！',
    baseDamage: 65,
    attackSpeed: 0.3,
    range: 120,
    color: '#a855f7',
  },
};

export const HARDWARE: Record<HardwareType, HardwareInfo> = {
  mouse: {
    id: 'mouse',
    name: '無線電競滑鼠',
    subname: '超低延遲微動開關',
    desc: '提升移動速度 +35%，衝刺距離大幅增加 +50%，閃避冷卻時間減少 40%！',
    iconName: 'Mouse',
    color: '#22c55e',
  },
  ram: {
    id: 'ram',
    name: '32GB 雙通道記憶體',
    subname: '海量快取・多工不卡頓',
    desc: '大幅縮短出招與攻擊後硬直時間，並完全免疫紅色報錯蟲與延遲造成的「硬直凍結」！',
    iconName: 'Cpu',
    color: '#3b82f6',
  },
  monitor: {
    id: 'monitor',
    name: '高色域校色螢幕',
    subname: '看穿一切圖層幻象',
    desc: '看穿透明隱藏平台！並在 BOSS 與菁英怪釋放致命大招前，精準透視顯現地面紅色預警框！',
    iconName: 'Monitor',
    color: '#eab308',
  },
  gpu: {
    id: 'gpu',
    name: 'RTX 5090 旗艦顯卡',
    subname: '算力天花板・光追全開',
    desc: '每 10 秒自動生成一道「光線追蹤全效護盾」，抵擋一次致命傷害（含最終 BOSS 全螢幕大招）！所有攻擊附帶炫彩粒子爆發，傷害 +50%！',
    iconName: 'Zap',
    color: '#ec4899',
  },
};

export interface BestiaryEntry {
  id: string;
  name: string;
  category: '小怪' | '大怪' | 'BOSS';
  hp: string;
  damage: string;
  desc: string;
  mechanic: string;
  weakness: string;
}

export const BESTIARY_DATA: BestiaryEntry[] = [
  {
    id: 'quiz_paper',
    name: '隨堂小考卷',
    category: '小怪',
    hp: '20',
    damage: '10',
    desc: '長著紙張翅膀在空中撲騰的突擊小考，數量繁多且專趁學生打瞌睡時襲擊。',
    mechanic: '直線飄浮衝撞玩家，血量極低，一擊必殺。',
    weakness: '塑膠三角板普攻即可一刀消滅。',
  },
  {
    id: 'midterm_paper',
    name: '期中考卷',
    category: '小怪',
    hp: '40',
    damage: '15',
    desc: '被折成紙飛機造型的期中考卷，帶著老師嚴厲的紅色墨水。',
    mechanic: '會進行俯衝襲擊，或從遠處發射「紅字大叉叉 (✗)」飛行道具。',
    weakness: '看準俯衝軌跡跳躍踩踏或二段跳反切。',
  },
  {
    id: 'draft_paper_ball',
    name: '退件草稿團',
    category: '小怪',
    hp: '45',
    damage: '15',
    desc: '被教授退件無數次後揉成一團的廢紙球，充滿了怨念與挫折。',
    mechanic: '在地面以極快速度滾動撞擊，有一定防禦力。',
    weakness: '從上方下墜踩踏或用重武器連擊打破平衡。',
  },
  {
    id: 'syntax_bug',
    name: '紅色報錯蟲 (Syntax Bug)',
    category: '小怪',
    hp: '60',
    damage: '20',
    desc: '帶著紅色驚嘆號（!）的機械甲蟲，程式碼少了一個分號時就會成群滋生。',
    mechanic: '碰觸到玩家會導致「硬直 (Freeze)」1 秒，無法移動。',
    weakness: '裝備 32GB 雙通道記憶體可免疫硬直，或用中遠距離武器先發制人。',
  },
  {
    id: 'infinite_loop_slime',
    name: '無限迴圈史萊姆',
    category: '小怪',
    hp: '80',
    damage: '20',
    desc: '身上閃爍著綠色「∞」無限符號的程式史萊姆，記憶體洩漏的具象化。',
    mechanic: '被擊倒後若未在 3 秒內被重擊擊飛，會在原地「重新編譯」滿血復活！',
    weakness: '倒地時使用第三段連擊或蓄力攻擊徹底擊碎編譯佇列。',
  },
  {
    id: 'golden_ratio',
    name: '黃金比例螺線怪',
    category: '大怪',
    hp: '250',
    damage: '20',
    desc: '來自《造型美學》的邊角料，身體由完美的費波那契螺旋貝殼構成。',
    mechanic: '高速旋轉衝撞，並周期性射出圓形與三角形幾何彈幕。擊敗掉落【德制圓規儀器】。',
    weakness: '旋轉後的散熱冷卻空檔為破綻，繞背猛攻。',
  },
  {
    id: 'cmyk_slime',
    name: 'CMYK 溢色史萊姆',
    category: '大怪',
    hp: '400',
    damage: '25',
    desc: '來自《色彩學》的顏料怪胎，由青、洋紅、黃、黑四色原色劇烈翻騰混合。',
    mechanic: '受傷會分裂並在地面留下泥沼，踩中會減速。擊敗掉落【雙頭麥克筆】與【校色螢幕】。',
    weakness: '利用跳躍避開地面色偏泥沼，在空中輸出。',
  },
  {
    id: 'bsod_golem',
    name: '算圖死當魔像 (BSOD Golem)',
    category: '大怪',
    hp: '650',
    damage: '35',
    desc: '由過熱發紅的散熱風扇、藍色當機畫面（BSOD）與電源線組成的重裝泰坦。',
    mechanic: '噴射高溫熱風並重踏地面產生當機震盪波。擊敗掉落【感壓繪圖筆】與【RTX 5090】！',
    weakness: '重踏前有明顯蓄力動作，起跳躲過地裂震盪波。',
  },
  {
    id: 'boss_aesthetic',
    name: '律動與平衡之靈・美學妖精',
    category: 'BOSS',
    hp: '600',
    damage: '25',
    desc: '第一關守護者，追求絕對「對稱與形式美」的古典精靈，身旁伴隨兩座大理石巨柱。',
    mechanic: '召喚對稱石柱從兩側夾擊玩家，並投射平衡光球。打破單邊石柱會使其陷入 3 秒眩暈！',
    weakness: '集中火力擊破單側柱子打破對稱性，趁其硬直瘋狂爆擊。',
  },
  {
    id: 'boss_color',
    name: '三原色幻象師・色相魔導',
    category: 'BOSS',
    hp: '950',
    damage: '30',
    desc: '第二關守護者，雜耍彩色光球的魔導士，能夠隨心所欲改寫空間色溫與背景色盤。',
    mechanic: '寒色背景時地面結冰極度打滑；暖色背景時天空降下燃燒顏料流星雨！',
    weakness: '觀察法杖色彩切換走位節奏，寒色時靠衝刺穩定身軀，暖色時尋找空隙穿梭。',
  },
  {
    id: 'boss_deadline',
    name: '專題總評審・死線魔神',
    category: 'BOSS',
    hp: '1500',
    damage: '40',
    desc: '最終魔王！巨大機械時鐘與評分表的威嚴結合體，手持剪除專案的改稿大剪刀與當掉大印章！',
    mechanic: '一階段發射「修改意見」滿天紅字並重砸當掉印章；血量 40% 進入二階段暴走，釋放全螢幕大招「檔案未儲存」毀滅打擊！',
    weakness: '裝備 RTX 5090 開啟光線追蹤護盾硬扛全螢幕滅團技，趁散熱口全開時施展繪圖筆終極一擊！',
  },
];
