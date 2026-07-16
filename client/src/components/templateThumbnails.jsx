export const TEMPLATES = [
  { key: 'classic',   label: 'Classic',   desc: 'Serif · Traditional' },
  { key: 'modern',    label: 'Modern',    desc: 'Sidebar · Bold' },
  { key: 'minimal',   label: 'Minimal',   desc: 'Editorial · Grid' },
  { key: 'executive', label: 'Executive', desc: 'Elegant · Accent' },
  { key: 'tech',      label: 'Tech',      desc: 'Monospace · Code' },
  { key: 'compact',   label: 'Compact',   desc: 'Dense · 1-Page' },
];

export function ClassicThumb() {
  return (
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="28" height="36" fill="white"/>
      {/* Centred header */}
      <rect x="6" y="3" width="16" height="2.5" rx="0.5" fill="#1a1a1a"/>
      <rect x="8" y="6.5" width="12" height="1" rx="0.5" fill="#aaa"/>
      <rect x="2" y="9" width="24" height="0.5" fill="#aaa"/>
      {/* Section label */}
      <rect x="2" y="11" width="8" height="1" rx="0.3" fill="#888"/>
      <rect x="2" y="13" width="24" height="0.5" fill="#ddd"/>
      {/* Bullets */}
      <rect x="2" y="14.5" width="20" height="1" rx="0.3" fill="#ccc"/>
      <rect x="2" y="16" width="18" height="1" rx="0.3" fill="#ccc"/>
      <rect x="2" y="17.5" width="22" height="1" rx="0.3" fill="#ccc"/>
      {/* Section 2 */}
      <rect x="2" y="20" width="8" height="1" rx="0.3" fill="#888"/>
      <rect x="2" y="21.5" width="24" height="0.5" fill="#ddd"/>
      <rect x="2" y="23" width="16" height="1" rx="0.3" fill="#ccc"/>
      <rect x="2" y="24.5" width="20" height="1" rx="0.3" fill="#ccc"/>
    </svg>
  );
}

export function ModernThumb() {
  return (
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="28" height="36" fill="white"/>
      {/* Dark sidebar */}
      <rect width="9" height="36" fill="#1d00a5"/>
      <rect x="1" y="3" width="7" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
      <rect x="1" y="5.5" width="5" height="1" rx="0.3" fill="white" opacity="0.5"/>
      <rect x="1" y="7" width="6" height="0.8" rx="0.3" fill="white" opacity="0.4"/>
      <rect x="1" y="10" width="4" height="0.7" rx="0.3" fill="#c3c0ff" opacity="0.7"/>
      {[0,1,2,3,4].map(i => <rect key={i} x="1" y={12 + i*2} width={[6,5,7,4,6][i]} height="0.8" rx="0.3" fill="white" opacity="0.25"/>)}
      {/* Main area */}
      <rect x="11" y="3" width="14" height="1.5" rx="0.3" fill="#333"/>
      <rect x="11" y="5.5" width="10" height="1" rx="0.3" fill="#ccc"/>
      <rect x="11" y="8" width="5" height="0.8" rx="0.3" fill="#aaa"/>
      {[0,1,2,3].map(i => <rect key={i} x="11" y={10 + i*2.2} width={[14,12,13,11][i]} height="0.8" rx="0.3" fill="#ddd"/>)}
      <rect x="11" y="19" width="5" height="0.8" rx="0.3" fill="#aaa"/>
      {[0,1,2].map(i => <rect key={i} x="11" y={21 + i*2.2} width={[12,14,10][i]} height="0.8" rx="0.3" fill="#ddd"/>)}
    </svg>
  );
}

export function MinimalThumb() {
  return (
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="28" height="36" fill="white"/>
      {/* Large name */}
      <rect x="2" y="3" width="18" height="3" rx="0.5" fill="#191c1e"/>
      <rect x="2" y="7.5" width="26" height="0.5" fill="#e5e7eb"/>
      {/* Two-col layout */}
      {/* Labels col */}
      <rect x="2" y="10" width="5" height="0.7" rx="0.2" fill="#ccc"/>
      <rect x="2" y="17" width="5" height="0.7" rx="0.2" fill="#ccc"/>
      <rect x="2" y="26" width="5" height="0.7" rx="0.2" fill="#ccc"/>
      {/* Content col */}
      <rect x="10" y="10" width="16" height="1" rx="0.3" fill="#555"/>
      {[0,1,2].map(i => <rect key={i} x="10" y={12.5 + i*2} width={[14,12,15][i]} height="0.8" rx="0.3" fill="#ddd"/>)}
      <rect x="10" y="17" width="14" height="1" rx="0.3" fill="#555"/>
      {[0,1,2].map(i => <rect key={i} x="10" y={19.5 + i*2} width={[12,15,13][i]} height="0.8" rx="0.3" fill="#ddd"/>)}
      <rect x="10" y="26" width="16" height="0.8" rx="0.3" fill="#ddd"/>
      <rect x="10" y="28" width="13" height="0.8" rx="0.3" fill="#ddd"/>
    </svg>
  );
}

export function ExecutiveThumb() {
  return (
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="28" height="36" fill="white"/>
      <rect x="1.5" y="3" width="1.5" height="30" fill="#0f172a" />
      <rect x="5" y="4" width="14" height="2" rx="0.3" fill="#111" />
      <rect x="5" y="7" width="10" height="0.5" fill="#666" />
      <rect x="5" y="11" width="8" height="0.8" rx="0.2" fill="#333" />
      <rect x="5" y="13" width="20" height="0.5" fill="#ddd" />
      <rect x="5" y="14.5" width="18" height="0.8" rx="0.2" fill="#888" />
      <rect x="5" y="16.5" width="20" height="0.8" rx="0.2" fill="#ccc" />
      <rect x="5" y="18" width="16" height="0.8" rx="0.2" fill="#ccc" />
      <rect x="5" y="22" width="8" height="0.8" rx="0.2" fill="#333" />
      <rect x="5" y="24" width="20" height="0.5" fill="#ddd" />
      <rect x="5" y="25.5" width="18" height="0.8" rx="0.2" fill="#888" />
    </svg>
  );
}

export function TechThumb() {
  return (
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="28" height="36" fill="white"/>
      {/* Purple accent header bar */}
      <rect x="0" y="0" width="28" height="5" fill="#6C47FF"/>
      <rect x="2" y="1.5" width="10" height="1.5" rx="0.3" fill="white" opacity="0.9"/>
      <rect x="2" y="3.5" width="7" height="0.8" rx="0.2" fill="white" opacity="0.5"/>
      {/* Two col layout */}
      {/* Left col — skills */}
      <rect x="2" y="7" width="7" height="0.7" rx="0.2" fill="#6C47FF" opacity="0.6"/>
      {[0,1,2,3].map(i => <rect key={i} x="2" y={9 + i*2.2} width={[6,5,7,4][i]} height="1" rx="3" fill="#F4F1FF"/>)}
      <rect x="2" y="20" width="7" height="0.7" rx="0.2" fill="#6C47FF" opacity="0.6"/>
      {[0,1].map(i => <rect key={i} x="2" y={22 + i*2.2} width={[5,6][i]} height="0.7" rx="0.2" fill="#ddd"/>)}
      {/* Right col — experience */}
      <rect x="12" y="7" width="6" height="0.7" rx="0.2" fill="#6C47FF" opacity="0.6"/>
      <rect x="12" y="9" width="14" height="1" rx="0.2" fill="#222"/>
      <rect x="12" y="10.5" width="8" height="0.7" rx="0.2" fill="#6C47FF"/>
      {[0,1,2].map(i => <rect key={i} x="12" y={12.5 + i*2} width={[14,12,13][i]} height="0.7" rx="0.2" fill="#ddd"/>)}
      <rect x="12" y="20" width="6" height="0.7" rx="0.2" fill="#6C47FF" opacity="0.6"/>
      <rect x="12" y="22" width="14" height="0.8" rx="0.2" fill="#333"/>
      {[0,1].map(i => <rect key={i} x="12" y={23.5 + i*2} width={[13,11][i]} height="0.7" rx="0.2" fill="#ddd"/>)}
    </svg>
  );
}

export function CompactThumb() {
  return (
    <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect width="28" height="36" fill="white"/>
      <rect x="3" y="2" width="14" height="2" fill="#111" />
      <rect x="3" y="4.5" width="22" height="0.5" fill="#999" />
      <rect x="3" y="7" width="10" height="1" fill="#444" />
      <rect x="3" y="8.5" width="22" height="1.5" fill="#eee" />
      <rect x="3" y="12" width="10" height="1" fill="#444" />
      <rect x="3" y="13.5" width="22" height="0.5" fill="#ddd" />
      <rect x="3" y="15" width="12" height="0.8" fill="#222" />
      <rect x="20" y="15" width="5" height="0.5" fill="#999" />
      <rect x="3" y="16.5" width="20" height="0.5" fill="#777" />
      <rect x="3" y="18" width="22" height="0.5" fill="#aaa" />
      <rect x="3" y="19" width="18" height="0.5" fill="#aaa" />
      <rect x="3" y="20" width="20" height="0.5" fill="#aaa" />
      <rect x="3" y="23" width="12" height="0.8" fill="#222" />
      <rect x="20" y="23" width="5" height="0.5" fill="#999" />
      <rect x="3" y="24.5" width="20" height="0.5" fill="#777" />
      <rect x="3" y="26" width="19" height="0.5" fill="#aaa" />
      <rect x="3" y="27" width="21" height="0.5" fill="#aaa" />
      <rect x="3" y="30" width="10" height="1" fill="#444" />
      <rect x="3" y="31.5" width="22" height="0.5" fill="#ddd" />
      <rect x="3" y="33" width="22" height="0.8" fill="#222" />
    </svg>
  );
}
