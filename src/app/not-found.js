export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#fbbf24'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '400px',
        padding: '40px 20px'
      }}>
        <p style={{
          fontSize: '72px',
          color: '#047857',
          margin: '0 0 20px 0',
          fontWeight: 'bold',
          lineHeight: '1'
        }}>
          404
        </p>
        <p style={{
          fontSize: '18px',
          color: '#000',
          margin: '0 0 8px 0',
          fontWeight: '500'
        }}>
          Page not found
        </p>
        <p style={{
          fontSize: '14px',
          color: '#000',
          margin: '0 0 30px 0',
          lineHeight: '1.4',
          opacity: '0.8'
        }}>
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/" 
          style={{ 
            color: '#047857', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            padding: '10px 20px',
            border: '2px solid #047857',
            borderRadius: '9999px',
            display: 'inline-block',
            backgroundColor: 'transparent'
          }}
        >
          Go to homepage
        </a>
      </div>
    </div>
  );
}