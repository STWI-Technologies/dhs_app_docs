import React from 'react';
import kbContent from './data/knowledge-base-content.json';

const KnowledgeBase = () => {
  const [selectedArticle, setSelectedArticle] = React.useState(null);

  if (selectedArticle) {
    return (
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setSelectedArticle(null)}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              background: '#2E3192',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Knowledge Base
          </button>
          
          <h1 style={{ color: '#2E3192', marginBottom: '20px' }}>
            {selectedArticle.title}
          </h1>
          
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              background: '#e8f4f8',
              color: '#2E3192',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              {selectedArticle.category}
            </span>
          </div>

          <div style={{ lineHeight: '1.6' }}>
            <h3 style={{ color: '#2E3192', marginBottom: '15px' }}>Overview</h3>
            <p style={{ marginBottom: '20px' }}>
              {selectedArticle.content.overview}
            </p>

            {selectedArticle.content.keyFeatures && (
              <>
                <h3 style={{ color: '#2E3192', marginBottom: '15px' }}>Key Features</h3>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                  {selectedArticle.content.keyFeatures.map((feature, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            {selectedArticle.keywords && (
              <>
                <h3 style={{ color: '#2E3192', marginBottom: '15px' }}>Keywords</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {selectedArticle.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#f0f0f0',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        color: '#666'
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          background: '#f0f2f8',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <img 
            src="/brand/logo-12.png" 
            alt="Direct Home Service" 
            style={{ height: '60px', marginBottom: '15px' }}
          />
          <h1 style={{
            color: '#2E3192',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '10px'
          }}>
            Direct Home Service
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Customer Service Knowledge Base
          </p>
        </header>

        {/* Knowledge Base Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {/* Group articles by category */}
          {Object.entries(
            kbContent.knowledgeBase.articles.reduce((groups, article) => {
              const category = article.category;
              if (!groups[category]) {
                groups[category] = [];
              }
              groups[category].push(article);
              return groups;
            }, {})
          ).map(([category, articles]) => (
            <div key={category} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}>
              <h2 style={{
                color: '#2E3192',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                {category}
              </h2>
              
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {articles.map((article) => (
                  <li key={article.id} style={{ marginBottom: '12px' }}>
                    <button
                      onClick={() => setSelectedArticle(article)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#555',
                        fontSize: '15px',
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#f8f9fa';
                        e.target.style.color = '#2E3192';
                        e.target.style.paddingLeft = '15px';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#555';
                        e.target.style.paddingLeft = '10px';
                      }}
                    >
                      <span style={{
                        marginRight: '10px',
                        color: '#96FAC2',
                        fontWeight: 'bold'
                      }}>
                        →
                      </span>
                      {article.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          marginTop: '50px',
          padding: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>&copy; 2025 Direct Home Service. All rights reserved.</p>
          <p>Need help? <a href="mailto:support@directhomeservice.com" style={{ color: '#2E3192' }}>Contact Support</a></p>
        </footer>

        {/* Language Switcher */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '25%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#2d2d2d',
          padding: '8px 12px',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          display: 'flex',
          gap: '0'
        }}>
          <button style={{
            padding: '6px 12px',
            border: 'none',
            background: 'transparent',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '400',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '18px',
              height: '13px',
              borderRadius: '2px',
              display: 'inline-block',
              background: 'linear-gradient(to bottom, #002868 0%, #002868 33%, #ffffff 33%, #ffffff 66%, #bf0a30 66%)'
            }}></span>
            English
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  React.useEffect(() => {
    // Set document title
    document.title = 'Direct Home Service - Knowledge Base';
    
    // Add global font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return <KnowledgeBase />;
};

export default App;