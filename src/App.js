import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import CategorySection from './components/CategorySection/CategorySection';
import ArticleView from './components/ArticleView/ArticleView';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';
import Footer from './components/Footer/Footer';
import ChatButton from './components/ChatButton/ChatButton';
import articles, { categoryOrder } from './data/articles';
import './App.css';

const APP_HELP_EXCLUDED = new Set();

const APP_HELP_NOTES = {
  users: 'standardAndTeamOnly',
  crew: 'standardAndTeamOnly'
};

const APP_HELP_PAGES = [
  { slug: 'availability', shortLabel: 'Avail', enTitle: 'Availability', esTitle: 'Disponibilidad' },
  { slug: 'clients', shortLabel: 'Client', enTitle: 'Clients', esTitle: 'Clientes' },
  { slug: 'crew', shortLabel: 'Crew', enTitle: 'Crew', esTitle: 'Equipo' },
  { slug: 'dashboard', shortLabel: 'Dash', enTitle: 'Dashboard', esTitle: 'Panel' },
  { slug: 'estimates', shortLabel: 'Est', enTitle: 'Estimates', esTitle: 'Presupuestos' },
  { slug: 'inbox', shortLabel: 'Inbox', enTitle: 'Inbox', esTitle: 'Bandeja' },
  { slug: 'invoices', shortLabel: 'Inv', enTitle: 'Invoices', esTitle: 'Facturas' },
  { slug: 'jobs', shortLabel: 'Jobs', enTitle: 'Jobs', esTitle: 'Trabajos' },
  { slug: 'map', shortLabel: 'Map', enTitle: 'Map', esTitle: 'Mapa' },
  { slug: 'products', shortLabel: 'Prod', enTitle: 'Products', esTitle: 'Productos' },
  { slug: 'profile', shortLabel: 'Prof', enTitle: 'Profile', esTitle: 'Perfil' },
  { slug: 'scheduler', shortLabel: 'Appt', enTitle: 'Scheduler', esTitle: 'Citas' },
  { slug: 'checklist', shortLabel: 'Check', enTitle: 'Checklists', esTitle: 'Listas' },
  { slug: 'inventory-groups', shortLabel: 'Group', enTitle: 'Groups', esTitle: 'Grupos' },
  { slug: 'inventory-manufacturers', shortLabel: 'Mfg', enTitle: 'Manufacturers', esTitle: 'Fabricantes' },
  { slug: 'inventory-products', shortLabel: 'InvP', enTitle: 'Products', esTitle: 'Productos' },
  { slug: 'inventory-services', shortLabel: 'InvS', enTitle: 'Services', esTitle: 'Servicios' },
  { slug: 'inventory-vendors', shortLabel: 'Vend', enTitle: 'Vendors', esTitle: 'Proveedores' },
  { slug: 'services', shortLabel: 'Svc', enTitle: 'Services', esTitle: 'Servicios' },
  { slug: 'settings', shortLabel: 'Set', enTitle: 'Settings', esTitle: 'Configuraciones' },
  { slug: 'users', shortLabel: 'User', enTitle: 'Users', esTitle: 'Usuarios' }
];

const APP_HELP_PAGE_MAP = new Map(
  APP_HELP_PAGES.map(page => [
    page.slug,
    {
      id: `app-help-${page.slug}`,
      slug: page.slug,
      noteKey: APP_HELP_NOTES[page.slug] || null,
      contentPath: {
        en: `/en/${page.slug}.html`,
        es: `/es/${page.slug}.html`
      },
      en: {
        title: page.enTitle,
        category: 'Help & Support',
        overview: page.enTitle
      },
      es: {
        title: page.esTitle,
        category: 'Ayuda y Soporte',
        overview: page.esTitle
      },
      shortLabel: page.shortLabel
    }
  ])
);

function HomePage() {
  const { getLocalized } = useLanguage();
  const navigate = useNavigate();

  const categoryGroups = useMemo(() => {
    const grouped = {};
    articles.forEach(article => {
      const enCat = article.en.category;
      if (!grouped[enCat]) grouped[enCat] = [];
      grouped[enCat].push(article);
    });
    return categoryOrder
      .filter(cat => grouped[cat])
      .map(cat => ({
        key: cat,
        label: getLocalized({ en: { text: cat }, es: { text: articles.find(a => a.en.category === cat)?.es.category || cat } }).text,
        articles: grouped[cat]
      }));
  }, [getLocalized]);

  const handleSelectArticle = (article) => {
    navigate(`/articles/${article.id}`);
  };

  return (
    <>
      <SearchBar onSelectArticle={handleSelectArticle} />
      <div className="app__categories-grid">
        {categoryGroups.map(group => (
          <CategorySection
            key={group.key}
            category={group.label}
            articles={group.articles}
            onSelectArticle={handleSelectArticle}
          />
        ))}
      </div>
    </>
  );
}

function AppHelpPage() {
  const { t, getLocalized } = useLanguage();
  const navigate = useNavigate();

  const appHelpArticles = useMemo(() => {
    return APP_HELP_PAGES
      .filter(page => !APP_HELP_EXCLUDED.has(page.slug))
      .map(page => {
        const article = APP_HELP_PAGE_MAP.get(page.slug);
        return {
          ...article,
          localized: getLocalized(article)
        };
      })
      .sort((a, b) => a.localized.title.localeCompare(b.localized.title));
  }, [getLocalized]);

  return (
    <section className="app-help">
      <div className="app-help__topbar">
        <img
          src="/brand/logo-18.png"
          alt="Direct Home Service"
          className="app-help__logo"
        />
        <a
          className="app-help__knowledgebase-link"
          href="https://knowledgebase.directhomeservice.com"
          target="_blank"
          rel="noreferrer"
        >
          {t.viewKnowledgebase}
        </a>
      </div>
      <h1 className="app-help__title">{t.appHelpTitle}</h1>

      <div className="app-help__grid" role="list">
        {appHelpArticles.map(article => (
          <button
            key={article.slug}
            type="button"
            className="app-help__tile"
            onClick={() => navigate(`/app-help/articles/${article.slug}`)}
          >
            <span className="app-help__tile-title">{article.localized.title}</span>
            {article.noteKey && (
              <span className="app-help__tile-note">{t[article.noteKey]}</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function ArticlePage({ backTo = '/', backLabel }) {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
        <h2>Article not found</h2>
        <p>The article you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate(backTo)}
          style={{
            marginTop: '16px', padding: '10px 24px', background: '#2E3192',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif', fontSize: '14px'
          }}
        >
          {backLabel || t.backButton}
        </button>
      </div>
    );
  }

  return (
    <ArticleView
      article={article}
      onBack={() => navigate(backTo)}
      backLabel={backLabel || t.backButton}
    />
  );
}

function AppHelpArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const article = articleId ? APP_HELP_PAGE_MAP.get(articleId) : null;

  if (!article) {
    return <ArticlePage backTo="/app-help" backLabel={t.backToAppHelp} />;
  }

  return (
    <ArticleView
      article={article}
      onBack={() => navigate('/app-help')}
      backLabel={t.backToAppHelp}
    />
  );
}

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAppHelpRoute = location.pathname === '/app-help' || location.pathname.startsWith('/app-help/articles/');

  return (
    <div className={`app ${isAppHelpRoute ? 'app--app-help' : ''}`}>
      <div className={`app__container ${isAppHelpRoute ? 'app__container--app-help' : ''}`}>
        {!isAppHelpRoute && <Header onLogoClick={() => navigate('/')} />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles/:articleId" element={<ArticlePage />} />
          <Route path="/app-help" element={<AppHelpPage />} />
          <Route path="/app-help/articles/:articleId" element={<AppHelpArticlePage />} />
        </Routes>
        {!isAppHelpRoute && <Footer />}
      </div>
      <LanguageSwitcher />
      {!isAppHelpRoute && <ChatButton />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </LanguageProvider>
  );
}
