export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#fafafa'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '400px',
        padding: '40px 20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <p style={{
          fontSize: '72px',
          color: '#202124',
          margin: '0 0 20px 0',
          fontWeight: '300',
          lineHeight: '1'
        }}>
          404
        </p>
        <p style={{
          fontSize: '18px',
          color: '#5f6368',
          margin: '0 0 8px 0',
          fontWeight: '400'
        }}>
          Page not found
        </p>
        <p style={{
          fontSize: '14px',
          color: '#70757a',
          margin: '0 0 30px 0',
          lineHeight: '1.4'
        }}>
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/" 
          style={{ 
            color: '#1a73e8', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            padding: '10px 20px',
            border: '1px solid #dadce0',
            borderRadius: '4px',
            display: 'inline-block',
            backgroundColor: '#f8f9fa'
          }}
        >
          Go to homepage
        </a>
      </div>
    </div>
  );
}