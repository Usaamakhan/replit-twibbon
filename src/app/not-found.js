export default function NotFound() {
  return (
    <div style={{
      backgroundColor: '#fbbf24',
      color: '#000',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '8rem',
          fontWeight: 'bold',
          color: '#047857',
          lineHeight: '1',
          margin: '0 0 1rem 0'
        }}>
          404
        </h1>
        
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#047857',
          margin: '0 0 1.5rem 0'
        }}>
          Frame Not Found
        </h2>
        
        <p style={{
          fontSize: '1.125rem',
          opacity: 0.9,
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Oops! The page you're looking for seems to have disappeared. 
          Don't worry, let's get you back to creating and sharing amazing frames.
        </p>
        
        <a
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#047857',
            color: '#fff',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontSize: '1.125rem',
            fontWeight: '600',
            textDecoration: 'none',
            border: 'none'
          }}
        >
          🏠 Back Home
        </a>
        
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(4, 120, 87, 0.2)'
        }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.75, marginBottom: '1rem' }}>
            Need help? Here are some popular destinations:
          </p>
          <div>
            <a href="/" style={{ color: '#047857', textDecoration: 'underline', marginRight: '1rem' }}>
              Home
            </a>
            <span style={{ color: 'rgba(4, 120, 87, 0.5)', margin: '0 0.5rem' }}>•</span>
            <a href="/signin" style={{ color: '#047857', textDecoration: 'underline' }}>
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}