import { memo, useState } from 'react';
import { TOKENS } from '@shared/tokens';

function AuthPage({ onLogin, mobile }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const addr = input.trim();
    if (!addr) {
      setError('Enter your Litecoin address');
      return;
    }
    if (addr.length < 26 || addr.length > 62) {
      setError('Invalid address length');
      return;
    }
    setError('');
    onLogin(addr);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: TOKENS.fonts.display,
          fontSize: mobile ? 24 : 32,
          fontWeight: 700,
          color: TOKENS.text.primary,
          letterSpacing: '-0.03em',
          marginBottom: 8,
        }}>
          <span style={{ color: TOKENS.brand.primary }}>LUXX</span>POOL
        </div>
        <div style={{
          fontSize: 14,
          color: TOKENS.text.secondary,
        }}>Enter your Litecoin address to view your dashboard</div>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        maxWidth: 480,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); }}
          placeholder="LTC address (e.g. LhXk7n...)"
          autoFocus
          style={{
            padding: '12px 16px',
            borderRadius: TOKENS.radius.lg,
            border: `1px solid ${error ? TOKENS.brand.danger + '60' : 'rgba(255,255,255,0.1)'}`,
            background: 'rgba(255,255,255,0.03)',
            color: TOKENS.text.primary,
            fontSize: 14,
            fontFamily: TOKENS.fonts.mono,
            outline: 'none',
            width: '100%',
            transition: 'border-color 0.15s ease',
          }}
        />
        {error && (
          <div style={{
            fontSize: 12,
            color: TOKENS.brand.danger,
            marginTop: -4,
          }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            borderRadius: TOKENS.radius.lg,
            border: 'none',
            background: TOKENS.brand.primary,
            color: '#070e28',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: TOKENS.fonts.body,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
            minHeight: 44,
          }}
        >View dashboard</button>
      </form>

      <div style={{
        fontSize: 12,
        color: TOKENS.text.dim,
        textAlign: 'center',
        maxWidth: 360,
        lineHeight: 1.5,
      }}>
        No account needed. Your address is your identity.<br />
        Session is cleared when you close this tab.
      </div>
    </div>
  );
}

export default memo(AuthPage);
