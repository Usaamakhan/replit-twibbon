export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '20px',
          color: '#202124',
          margin: '0 0 8px 0'
        }}>
          404.
        </p>
        <p style={{
          fontSize: '14px',
          color: '#70757a',
          margin: '0 0 15px 0'
        }}>
          That's an error.
        </p>
        <p style={{
          fontSize: '14px',
          color: '#70757a'
        }}>
          <a href="/" style={{ color: '#1a73e8', textDecoration: 'none' }}>
            Go to homepage
          </a>
        </p>
      </div>
    </div>
  );
}