import { memo } from 'react';
import { TOKENS } from '@shared/tokens';

function PublicHeader({ tabs, activeTab, onTabChange, mobile }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: mobile ? '16px 0' : '24px 0',
      borderBottom: `1px solid rgba(255,255,255,0.04)`,
      marginBottom: mobile ? 16 : 24,
      flexWrap: mobile ? 'wrap' : 'nowrap',
      gap: 12,
    }}>
      <div style={{
        fontFamily: TOKENS.fonts.display,
        fontSize: mobile ? 20 : 24,
        fontWeight: 700,
        color: TOKENS.text.primary,
        letterSpacing: '-0.03em',
      }}>
        <span style={{ color: TOKENS.brand.primary }}>LUXX</span>POOL
      </div>

      <nav style={{
        display: 'flex',
        gap: 2,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: TOKENS.radius.lg,
        padding: 3,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: mobile ? '6px 12px' : '8px 16px',
              borderRadius: TOKENS.radius.md,
              border: 'none',
              background: activeTab === t.id ? 'rgba(74,158,255,0.12)' : 'transparent',
              color: activeTab === t.id ? TOKENS.brand.primary : TOKENS.text.secondary,
              cursor: 'pointer',
              fontSize: mobile ? 12 : 13,
              fontWeight: 500,
              fontFamily: TOKENS.fonts.body,
              transition: 'all 0.15s ease',
              minHeight: 36,
            }}
          >{t.label}</button>
        ))}
      </nav>
    </header>
  );
}

export default memo(PublicHeader);
