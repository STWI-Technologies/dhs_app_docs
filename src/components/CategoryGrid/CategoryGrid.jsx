import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../LanguageSwitcher/LanguageContext';
import styles from './CategoryGrid.module.css';

const CategoryGrid = ({ categories = [], onCategoryClick }) => {
  const { language } = useLanguage();

  // Default categories if none provided
  const defaultCategories = [
    {
      id: 'core-operations',
      title: { en: 'Core Operations', es: 'Operaciones Principales' },
      articles: [
        { 
          id: '460823', 
          url: 'https://directhomeservice.ladesk.com/460823-Users',
          title: { en: 'Users Management', es: 'Gestión de Usuarios' }
        },
        { 
          id: '586913', 
          url: 'https://directhomeservice.ladesk.com/586913-Crews',
          title: { en: 'Crews Management', es: 'Gestión de Equipos' }
        },
        { 
          id: '431361', 
          url: 'https://directhomeservice.ladesk.com/431361-Jobs',
          title: { en: 'Jobs Management', es: 'Gestión de Trabajos' }
        },
        { 
          id: '270481', 
          url: 'https://directhomeservice.ladesk.com/270481-Availability',
          title: { en: 'Availability Management', es: 'Gestión de Disponibilidad' }
        }
      ],
      icon: '⚙️'
    },
    {
      id: 'customer-management',
      title: { en: 'Customer Management', es: 'Gestión de Clientes' },
      articles: [
        { 
          id: '831098', 
          url: 'https://directhomeservice.ladesk.com/831098-Clients',
          title: { en: 'Clients Management', es: 'Gestión de Clientes' }
        },
        { 
          id: '919387', 
          url: 'https://directhomeservice.ladesk.com/919387-Estimates',
          title: { en: 'Estimates', es: 'Presupuestos' }
        },
        { 
          id: '804099', 
          url: 'https://directhomeservice.ladesk.com/804099-Invoices',
          title: { en: 'Invoices', es: 'Facturas' }
        }
      ],
      icon: '👥'
    },
    {
      id: 'services-products',
      title: { en: 'Services & Products', es: 'Servicios y Productos' },
      articles: [
        { 
          id: '219493', 
          url: 'https://directhomeservice.ladesk.com/219493-Services',
          title: { en: 'Services Catalog', es: 'Catálogo de Servicios' }
        },
        { 
          id: '807691', 
          url: 'https://directhomeservice.ladesk.com/807691-Products',
          title: { en: 'Products Catalog', es: 'Catálogo de Productos' }
        }
      ],
      icon: '🛠️'
    },
    {
      id: 'reports-analytics',
      title: { en: 'Reports & Analytics', es: 'Informes y Análisis' },
      articles: [
        { 
          id: '722264', 
          url: 'https://directhomeservice.ladesk.com/722264-Reports',
          title: { en: 'Reports Overview', es: 'Resumen de Informes' }
        },
        { 
          id: '131021', 
          url: 'https://directhomeservice.ladesk.com/131021-Work-Order-Reports',
          title: { en: 'Work Order Reports', es: 'Informes de Órdenes de Trabajo' }
        },
        { 
          id: '182200', 
          url: 'https://directhomeservice.ladesk.com/182200-Technician-Performance',
          title: { en: 'Technician Performance', es: 'Rendimiento de Técnicos' }
        },
        { 
          id: '296554', 
          url: 'https://directhomeservice.ladesk.com/296554-Customer-Reports',
          title: { en: 'Customer Reports', es: 'Informes de Clientes' }
        }
      ],
      icon: '📊'
    },
    {
      id: 'financial-reports',
      title: { en: 'Financial Reports', es: 'Informes Financieros' },
      articles: [
        { 
          id: '724970', 
          url: 'https://directhomeservice.ladesk.com/724970-Financial-Reports',
          title: { en: 'Financial Reports', es: 'Informes Financieros' }
        },
        { 
          id: '318626', 
          url: 'https://directhomeservice.ladesk.com/318626-Time-and-Labor-Report',
          title: { en: 'Time and Labor Report', es: 'Informe de Tiempo y Mano de Obra' }
        }
      ],
      icon: '💰'
    },
    {
      id: 'operations-compliance',
      title: { en: 'Operations & Compliance', es: 'Operaciones y Cumplimiento' },
      articles: [
        { 
          id: '927404', 
          url: 'https://directhomeservice.ladesk.com/927404-Scheduling--Dispatch-Reports',
          title: { en: 'Scheduling & Dispatch Reports', es: 'Informes de Programación y Despacho' }
        },
        { 
          id: '977125', 
          url: 'https://directhomeservice.ladesk.com/977125-Compliance-and-Safety-Reports',
          title: { en: 'Compliance and Safety Reports', es: 'Informes de Cumplimiento y Seguridad' }
        }
      ],
      icon: '📋'
    }
  ];

  const categoriesToRender = categories.length > 0 ? categories : defaultCategories;

  const handleArticleClick = (article, categoryId) => {
    if (onCategoryClick) {
      onCategoryClick(article, categoryId);
    }
  };

  const getLocalizedText = (textObj) => {
    if (typeof textObj === 'string') return textObj;
    return textObj[language] || textObj.en || textObj;
  };

  return (
    <div className={styles.categoriesGrid}>
      {categoriesToRender.map((category) => (
        <div key={category.id} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>
            {category.icon && (
              <span className={styles.categoryIcon} aria-hidden="true">
                {category.icon}
              </span>
            )}
            {getLocalizedText(category.title)}
            <span className={styles.articleCount} aria-label={`${category.articles.length} articles`}>
              ({category.articles.length})
            </span>
          </h2>
          
          {category.description && (
            <p className={styles.categoryDescription}>
              {getLocalizedText(category.description)}
            </p>
          )}

          <ul className={styles.articleList} role="list">
            {category.articles.map((article) => (
              <li key={article.id} className={styles.articleListItem}>
                <a
                  href={article.url}
                  className={styles.articleLink}
                  onClick={(e) => {
                    if (onCategoryClick) {
                      e.preventDefault();
                      handleArticleClick(article, category.id);
                    }
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read article: ${getLocalizedText(article.title)}`}
                >
                  <span className={styles.articleLinkText}>
                    {getLocalizedText(article.title)}
                  </span>
                  {article.isNew && (
                    <span className={styles.newBadge} aria-label="New article">
                      New
                    </span>
                  )}
                  {article.isUpdated && (
                    <span className={styles.updatedBadge} aria-label="Recently updated">
                      Updated
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          {category.viewAllUrl && (
            <a
              href={category.viewAllUrl}
              className={styles.viewAllLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {language === 'es' ? 'Ver todos los artículos' : 'View all articles'} →
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

CategoryGrid.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        es: PropTypes.string
      })
    ]).isRequired,
    description: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        en: PropTypes.string,
        es: PropTypes.string
      })
    ]),
    icon: PropTypes.string,
    articles: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          en: PropTypes.string,
          es: PropTypes.string
        })
      ]).isRequired,
      isNew: PropTypes.bool,
      isUpdated: PropTypes.bool
    })).isRequired,
    viewAllUrl: PropTypes.string
  })),
  onCategoryClick: PropTypes.func
};

export default CategoryGrid;