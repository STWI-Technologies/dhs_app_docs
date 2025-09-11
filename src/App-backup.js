import React, { Suspense, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

// Import i18n configuration
import i18n from './i18n/config';

// Import contexts
import { LanguageProvider } from './contexts/LanguageContext';

// Import routing
import AppRoutes from './routes/AppRoutes';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          fontFamily: 'Poppins, sans-serif',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '600px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#e74c3c',
              marginBottom: '15px'
            }}>
              Something went wrong
            </h1>
            
            <p style={{
              color: '#666',
              fontSize: '16px',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              We're sorry, but something unexpected happened. Please refresh the page or try again later.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 25px',
                  background: 'linear-gradient(135deg, #2E3192 0%, #5158bb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 25px',
                  background: 'transparent',
                  color: '#2E3192',
                  border: '2px solid #2E3192',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                🏠 Go Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '30px',
                textAlign: 'left',
                background: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '10px'
                }}>
                  Error Details (Development Mode)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#666',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component
const AppLoading = () => (
  <div style={{
    fontFamily: 'Poppins, sans-serif',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  }}>
    <div style={{
      textAlign: 'center'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #f3f3f3',
        borderTop: '6px solid #2E3192',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 30px'
      }}></div>
      
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2E3192',
        marginBottom: '10px'
      }}>
        Direct Home Service
      </h2>
      
      <p style={{
        color: '#666',
        fontSize: '16px'
      }}>
        Loading Knowledge Base...
      </p>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  </div>
);

// Language Switcher Component
const LanguageSwitcher = () => {
  const [showSwitcher, setShowSwitcher] = React.useState(false);

  // Show language switcher after a delay to avoid flash
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwitcher(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!showSwitcher) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '25%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: '10px',
      background: 'white',
      padding: '12px 20px',
      borderRadius: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '2px solid #2E3192',
      transition: 'all 0.3s ease'
    }}>
      <a
        href="/en"
        style={{
          padding: '8px 16px',
          border: '2px solid #e0e0e0',
          background: 'white',
          color: '#555',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span className="flag flag-us" style={{
          width: '20px',
          height: '15px',
          borderRadius: '2px',
          display: 'inline-block',
          background: 'linear-gradient(to bottom, #002868 0%, #002868 33%, #ffffff 33%, #ffffff 66%, #bf0a30 66%)'
        }}></span>
        EN
      </a>
      
      <a
        href="/es"
        style={{
          padding: '8px 16px',
          border: '2px solid #e0e0e0',
          background: 'white',
          color: '#555',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span className="flag flag-es" style={{
          width: '20px',
          height: '15px',
          borderRadius: '2px',
          display: 'inline-block',
          background: 'linear-gradient(to bottom, #c60b1e 0%, #c60b1e 33%, #ffc400 33%, #ffc400 66%, #c60b1e 66%)'
        }}></span>
        ES
      </a>
    </div>
  );
};

// Main App Component
const App = () => {
  // Set up global styles
  useEffect(() => {
    // Add global styles to head
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Poppins', sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }
      
      /* Ensure consistent font loading */
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
      
      /* Focus styles for accessibility */
      *:focus {
        outline: 2px solid #2E3192;
        outline-offset: 2px;
      }
      
      /* Responsive design helpers */
      @media (max-width: 768px) {
        body {
          padding: 10px;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Set initial document title
    document.title = 'Direct Home Service - Knowledge Base';
    
    // Set initial language attribute
    document.documentElement.lang = 'en';
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <HashRouter>
          <LanguageProvider>
            <Suspense fallback={<AppLoading />}>
              <div className="app">
                <AppRoutes />
                <LanguageSwitcher />
              </div>
            </Suspense>
          </LanguageProvider>
        </HashRouter>
      </I18nextProvider>
    </ErrorBoundary>
  );
};

export default App;