import {
  UserGroupIcon,
  UserMultiple02Icon,
  Home01Icon,
  Wrench01Icon,
  Package01Icon,
  Calendar01Icon,
  Estimate01Icon,
  Briefcase04Icon,
  Invoice01Icon,
  Timer02Icon,
  Setting07Icon,
  CheckListIcon,
  AiBrain01Icon,
  Layers01Icon,
  SmartPhone01Icon,
  WarehouseIcon,
  DashboardSquare01Icon,
  CustomerService01Icon,
  Building03Icon,
  Message01Icon,
  UserCircleIcon,
  Login03Icon,
} from 'hugeicons-react';

const articles = [
  {
    id: 'mobile-app',
    icon: SmartPhone01Icon,
    contentPath: {
      en: '/content/mobile-app.html',
      es: '/content/mobile-app-es.html',
    },
    en: {
      title: 'Mobile App',
      category: 'Mobile App',
      overview: 'Run your business from your phone or tablet. Sign in, navigate the app, and manage jobs, appointments, estimates, invoices, clients, your catalog, timesheets, messaging, and the AI Assistant on iOS and Android.'
    },
    es: {
      title: 'Aplicación Móvil',
      category: 'Aplicación Móvil',
      overview: 'Gestione su negocio desde el teléfono o la tableta. Inicie sesión, navegue la app y administre trabajos, citas, presupuestos, facturas, clientes, su catálogo, hojas de tiempo, mensajería y el Asistente de IA en iOS y Android.'
    },
    keywords: ['mobile', 'app', 'móvil', 'aplicación', 'ios', 'android', 'phone', 'teléfono', 'field', 'campo', 'jobs', 'appointments', 'estimates', 'invoices', 'timesheet', 'timer', 'work hub', 'quick add']
  },
  {
    id: 'users-management',
    icon: UserGroupIcon,
    en: {
      title: 'User Management',
      category: 'People & Teams',
      overview: 'Manage user accounts, roles, permissions, and profile settings. Add, edit, enable, and disable users with role-based access control.'
    },
    es: {
      title: 'Gestión de Usuarios',
      category: 'Personas y Equipos',
      overview: 'Administrar cuentas de usuario, roles, permisos y configuración de perfil. Agregar, editar, habilitar y deshabilitar usuarios con control de acceso basado en roles.'
    },
    keywords: ['users', 'usuarios', 'roles', 'admin', 'crew', 'permissions', 'permisos', 'accounts', 'cuentas', 'password', 'profile']
  },
  {
    id: 'crews-management',
    icon: UserMultiple02Icon,
    en: {
      title: 'Crews Management',
      category: 'People & Teams',
      overview: 'Organize your team into crews with leads, colors, and availability. Assign crews to jobs and appointments with customer feedback tracking.'
    },
    es: {
      title: 'Gestión de Equipos',
      category: 'Personas y Equipos',
      overview: 'Organice su equipo en cuadrillas con líderes, colores y disponibilidad. Asigne cuadrillas a trabajos y citas con seguimiento de comentarios de clientes.'
    },
    keywords: ['crews', 'equipos', 'teams', 'lead', 'líder', 'members', 'miembros', 'color', 'availability']
  },
  {
    id: 'clients-management',
    icon: Home01Icon,
    en: {
      title: 'Clients Management',
      category: 'Clients & Properties',
      overview: 'Manage client accounts, properties, billing, and attachments. Import/export clients via CSV, archive and restore, with multi-property support.'
    },
    es: {
      title: 'Gestión de Clientes',
      category: 'Clientes y Propiedades',
      overview: 'Administrar cuentas de clientes, propiedades, facturación y archivos adjuntos. Importar/exportar clientes por CSV, archivar y restaurar, con soporte multi-propiedad.'
    },
    keywords: ['clients', 'clientes', 'properties', 'propiedades', 'billing', 'facturación', 'residential', 'business', 'CSV', 'import', 'export', 'tags']
  },
  {
    id: 'services-management',
    icon: Wrench01Icon,
    en: {
      title: 'Services Management',
      category: 'Services & Products',
      overview: 'Create and manage labor-based service items with pricing, descriptions, and attachments. Import/export services and use them across appointments, estimates, and invoices.'
    },
    es: {
      title: 'Gestión de Servicios',
      category: 'Servicios y Productos',
      overview: 'Crear y administrar servicios basados en mano de obra con precios, descripciones y archivos adjuntos. Importar/exportar servicios y usarlos en citas, presupuestos y facturas.'
    },
    keywords: ['services', 'servicios', 'pricing', 'precios', 'labor', 'mano de obra', 'attachments', 'archivos']
  },
  {
    id: 'products-management',
    icon: Package01Icon,
    en: {
      title: 'Products Management',
      category: 'Services & Products',
      overview: 'Track physical products and materials with inventory management, markup pricing, bulk editing, and CSV import/export capabilities.'
    },
    es: {
      title: 'Gestión de Productos',
      category: 'Servicios y Productos',
      overview: 'Rastrear productos físicos y materiales con gestión de inventario, precios con margen, edición masiva y capacidades de importación/exportación CSV.'
    },
    keywords: ['products', 'productos', 'inventory', 'inventario', 'stock', 'markup', 'margen', 'materials', 'materiales']
  },
  {
    id: 'vendors-manufacturers-groups',
    icon: WarehouseIcon,
    en: {
      title: 'Vendors, Manufacturers & Groups',
      category: 'Services & Products',
      overview: 'Keep track of who you buy from, who makes what you install, and the bundles of items that always go out together. Link vendors and manufacturers to your products, and add a whole group to an estimate in one step.'
    },
    es: {
      title: 'Proveedores, Fabricantes y Grupos',
      category: 'Servicios y Productos',
      overview: 'Lleve el control de a quién le compra, quién fabrica lo que instala y los conjuntos de artículos que siempre van juntos. Vincule proveedores y fabricantes a sus productos, y agregue un grupo completo a un presupuesto en un solo paso.'
    },
    keywords: ['vendors', 'proveedores', 'suppliers', 'manufacturers', 'fabricantes', 'brands', 'marcas', 'groups', 'grupos', 'bundles', 'kits', 'reorder', 'warranty', 'garantía', 'vendor sku', 'inventory', 'inventario']
  },
  {
    id: 'appointments-management',
    icon: Calendar01Icon,
    en: {
      title: 'Appointments Management',
      category: 'Scheduling',
      overview: 'Schedule and manage field service appointments with a 4-step wizard. Track statuses, convert to estimates/jobs/invoices, and use the calendar scheduler.'
    },
    es: {
      title: 'Gestión de Citas',
      category: 'Programación',
      overview: 'Programe y administre citas de servicio de campo con un asistente de 4 pasos. Rastree estados, convierta a presupuestos/trabajos/facturas y use el calendario.'
    },
    keywords: ['appointments', 'citas', 'scheduling', 'programación', 'calendar', 'calendario', 'scheduler', 'status', 'estado']
  },
  {
    id: 'estimates-management',
    icon: Estimate01Icon,
    en: {
      title: 'Estimates Management',
      category: 'Jobs & Estimates',
      overview: 'Create, send, and track service estimates with line items, PDF download, and client delivery via email/SMS. Convert approved estimates to jobs.'
    },
    es: {
      title: 'Gestión de Presupuestos',
      category: 'Trabajos y Presupuestos',
      overview: 'Crear, enviar y rastrear presupuestos de servicio con partidas, descarga PDF y entrega al cliente por email/SMS. Convertir presupuestos aprobados en trabajos.'
    },
    keywords: ['estimates', 'presupuestos', 'quotes', 'cotizaciones', 'PDF', 'send', 'enviar', 'convert', 'convertir']
  },
  {
    id: 'jobs-management',
    icon: Briefcase04Icon,
    en: {
      title: 'Jobs Management',
      category: 'Jobs & Estimates',
      overview: 'Manage work orders from creation to completion with status workflows, checklists, time tracking, crew assignments, and recurring job support.'
    },
    es: {
      title: 'Gestión de Trabajos',
      category: 'Trabajos y Presupuestos',
      overview: 'Administrar órdenes de trabajo desde la creación hasta la finalización con flujos de estado, listas de verificación, seguimiento de tiempo y soporte de trabajos recurrentes.'
    },
    keywords: ['jobs', 'trabajos', 'work orders', 'órdenes', 'status', 'estado', 'checklist', 'recurring', 'recurrente']
  },
  {
    id: 'invoices-management',
    icon: Invoice01Icon,
    en: {
      title: 'Invoices Management',
      category: 'Billing & Time Tracking',
      overview: 'Create, send, and track invoices with payment recording, PDF generation, tax management, and Stripe integration for online payments.'
    },
    es: {
      title: 'Gestión de Facturas',
      category: 'Facturación y Control de Tiempo',
      overview: 'Crear, enviar y rastrear facturas con registro de pagos, generación de PDF, gestión de impuestos e integración con Stripe para pagos en línea.'
    },
    keywords: ['invoices', 'facturas', 'payments', 'pagos', 'PDF', 'tax', 'impuestos', 'Stripe', 'billing']
  },
  {
    id: 'timesheets-management',
    icon: Timer02Icon,
    en: {
      title: 'Timesheets Management',
      category: 'Billing & Time Tracking',
      overview: 'Track working hours with timesheet approval workflows, time entries linked to jobs, and role-based permissions for submission and approval.'
    },
    es: {
      title: 'Gestión de Hojas de Tiempo',
      category: 'Facturación y Control de Tiempo',
      overview: 'Rastrear horas de trabajo con flujos de aprobación de hojas de tiempo, entradas de tiempo vinculadas a trabajos y permisos basados en roles.'
    },
    keywords: ['timesheets', 'hojas de tiempo', 'hours', 'horas', 'approval', 'aprobación', 'clock', 'reloj', 'entries']
  },
  {
    id: 'settings-configuration',
    icon: Setting07Icon,
    en: {
      title: 'Settings & Configuration',
      category: 'Settings',
      overview: 'Configure company settings, user profiles, notifications, business rules, tax rates, payment processing, and dashboard preferences.'
    },
    es: {
      title: 'Configuración y Ajustes',
      category: 'Configuración',
      overview: 'Configurar ajustes de empresa, perfiles de usuario, notificaciones, reglas de negocio, tasas de impuestos, procesamiento de pagos y preferencias del panel.'
    },
    keywords: ['settings', 'configuración', 'account', 'cuenta', 'notifications', 'notificaciones', 'Stripe', 'tax', 'impuestos', 'profile']
  },
  {
    id: 'checklists-management',
    icon: CheckListIcon,
    en: {
      title: 'Checklists Management',
      category: 'Jobs & Estimates',
      overview: 'Create reusable checklist templates with ordered items. Assign checklists to jobs and estimates, duplicate templates, and track completion.'
    },
    es: {
      title: 'Gestión de Listas de Verificación',
      category: 'Trabajos y Presupuestos',
      overview: 'Crear plantillas de listas de verificación reutilizables con elementos ordenados. Asignar listas a trabajos y presupuestos, duplicar plantillas y rastrear el progreso.'
    },
    keywords: ['checklists', 'listas', 'templates', 'plantillas', 'items', 'elementos', 'jobs', 'trabajos']
  },
  {
    id: 'ai-assistant',
    icon: AiBrain01Icon,
    en: {
      title: 'AI Assistant (Web & Mobile)',
      category: 'AI & Automation',
      overview: 'Use the built-in AI Assistant in the DHS web and mobile app to manage your business with natural language. Search, create, update, and delete records by typing or speaking.'
    },
    es: {
      title: 'Asistente IA (Web y Móvil)',
      category: 'IA y Automatización',
      overview: 'Use el Asistente IA integrado en la app web y móvil de DHS para administrar su negocio con lenguaje natural. Busque, cree, actualice y elimine registros escribiendo o hablando.'
    },
    keywords: ['ai', 'assistant', 'asistente', 'web', 'mobile', 'móvil', 'voice', 'voz', 'search', 'buscar', 'create', 'crear', 'natural language']
  },
  {
    id: 'plans-pricing',
    icon: Layers01Icon,
    en: {
      title: 'Plans & App Versions',
      category: 'Getting Started',
      overview: 'DHS comes in two app versions: Solo for independent contractors and Team for businesses with crews. Compare features, communication channels, and find the right fit for your business.'
    },
    es: {
      title: 'Planes y Versiones de la App',
      category: 'Primeros Pasos',
      overview: 'DHS viene en dos versiones: Solo para contratistas independientes y Team para negocios con equipos. Compare características, canales de comunicación y encuentre la opción ideal para su negocio.'
    },
    keywords: ['plans', 'planes', 'solo', 'team', 'equipo', 'enterprise', 'pricing', 'subscription', 'suscripción', 'features', 'comparison']
  },
  {
    id: 'client-getting-started',
    icon: Login03Icon,
    en: {
      title: 'Getting Started with the Client Portal',
      category: 'Client Portal',
      overview: 'How your service provider invites you, setting your password, signing in, magic links, and finding your way around the portal.'
    },
    es: {
      title: 'Primeros Pasos en el Portal del Cliente',
      category: 'Portal del Cliente',
      overview: 'Cómo lo invita su proveedor de servicio, cómo establecer su contraseña, iniciar sesión, los enlaces mágicos y cómo moverse por el portal.'
    },
    keywords: ['portal', 'client', 'cliente', 'invitation', 'invitación', 'sign in', 'iniciar sesión', 'password', 'contraseña', 'magic link', 'enlace']
  },
  {
    id: 'client-dashboard',
    icon: DashboardSquare01Icon,
    en: {
      title: 'Your Dashboard',
      category: 'Client Portal',
      overview: 'What needs you today and what is coming: your totals, open jobs, estimates and invoices, recent messages, and your service providers.'
    },
    es: {
      title: 'Su Panel',
      category: 'Portal del Cliente',
      overview: 'Lo que necesita hoy y lo que viene: sus totales, trabajos abiertos, presupuestos, facturas, mensajes recientes y sus proveedores de servicio.'
    },
    keywords: ['dashboard', 'panel', 'overview', 'resumen', 'totals', 'totales', 'upcoming', 'pendientes']
  },
  {
    id: 'client-request-service',
    icon: CustomerService01Icon,
    en: {
      title: 'Requesting a Service',
      category: 'Client Portal',
      overview: 'Ask a provider for work: choosing them, the property and the service, describing the problem, and giving a preferred and an alternate time.'
    },
    es: {
      title: 'Solicitar un Servicio',
      category: 'Portal del Cliente',
      overview: 'Pida trabajo a un proveedor: elegirlo, la propiedad y el servicio, describir el problema y dar una fecha preferida y una alternativa.'
    },
    keywords: ['request', 'solicitud', 'service request', 'servicio', 'property', 'propiedad', 'schedule', 'horario', 'frequency', 'frecuencia']
  },
  {
    id: 'client-service-providers',
    icon: Building03Icon,
    en: {
      title: 'Service Providers',
      category: 'Client Portal',
      overview: 'The companies you are connected to, what each one does, and everything you have with them in one place.'
    },
    es: {
      title: 'Proveedores de Servicio',
      category: 'Portal del Cliente',
      overview: 'Las empresas con las que está conectado, qué hace cada una y todo lo que tiene con ellas en un solo lugar.'
    },
    keywords: ['service provider', 'proveedor', 'company', 'empresa', 'categories', 'categorías', 'connected', 'conectado']
  },
  {
    id: 'client-appointments',
    icon: Calendar01Icon,
    en: {
      title: 'Appointments',
      category: 'Client Portal',
      overview: 'Visits booked with you: what the list shows, what is inside one, confirming or cancelling, and what a visit turns into.'
    },
    es: {
      title: 'Citas',
      category: 'Portal del Cliente',
      overview: 'Visitas agendadas con usted: qué muestra la lista, qué hay dentro de una, confirmar o cancelar, y en qué se convierte una visita.'
    },
    keywords: ['appointment', 'cita', 'visit', 'visita', 'confirm', 'confirmar', 'cancel', 'cancelar', 'schedule', 'agenda']
  },
  {
    id: 'client-estimates',
    icon: Estimate01Icon,
    en: {
      title: 'Estimates',
      category: 'Client Portal',
      overview: 'Quotes waiting on your answer: reading one line by line, approving it with your signature, rejecting it with a reason, adding a service, and what happens when one expires.'
    },
    es: {
      title: 'Presupuestos',
      category: 'Portal del Cliente',
      overview: 'Presupuestos que esperan su respuesta: leerlo línea por línea, aprobarlo con su firma, rechazarlo con un motivo, agregar un servicio y qué pasa cuando uno vence.'
    },
    keywords: ['estimate', 'presupuesto', 'quote', 'cotización', 'approve', 'aprobar', 'reject', 'rechazar', 'signature', 'firma', 'expired', 'vencido']
  },
  {
    id: 'client-jobs',
    icon: Briefcase04Icon,
    en: {
      title: 'Jobs',
      category: 'Client Portal',
      overview: 'The work itself: following it while it happens, the services and products on it, its invoices and payments, the attachments, and leaving feedback when it is done.'
    },
    es: {
      title: 'Trabajos',
      category: 'Portal del Cliente',
      overview: 'El trabajo en sí: seguirlo mientras ocurre, los servicios y productos, sus facturas y pagos, los adjuntos y dejar su opinión al terminar.'
    },
    keywords: ['job', 'trabajo', 'crew', 'equipo', 'status', 'estado', 'feedback', 'opinión', 'attachments', 'adjuntos', 'payments', 'pagos']
  },
  {
    id: 'client-invoices',
    icon: Invoice01Icon,
    en: {
      title: 'Invoices and Paying',
      category: 'Client Portal',
      overview: 'Your bills: what the list tells you, what is inside an invoice, paying online and why the button is sometimes not there, and getting the PDF.'
    },
    es: {
      title: 'Facturas y Pagos',
      category: 'Portal del Cliente',
      overview: 'Sus facturas: qué le dice la lista, qué hay dentro de una factura, pagar en línea y por qué a veces no aparece el botón, y obtener el PDF.'
    },
    keywords: ['invoice', 'factura', 'pay', 'pagar', 'payment', 'pago', 'balance', 'saldo', 'pdf', 'due date', 'vencimiento']
  },
  {
    id: 'client-inbox',
    icon: Message01Icon,
    en: {
      title: 'Inbox and Messages',
      category: 'Client Portal',
      overview: 'Every conversation with your providers, kept with the estimate, job, invoice or appointment it is about. Starting one, attaching files, and archiving.'
    },
    es: {
      title: 'Bandeja de Entrada y Mensajes',
      category: 'Portal del Cliente',
      overview: 'Cada conversación con sus proveedores, junto al presupuesto, trabajo, factura o cita del que trata. Iniciar una, adjuntar archivos y archivarla.'
    },
    keywords: ['inbox', 'bandeja', 'chat', 'message', 'mensaje', 'conversation', 'conversación', 'attach', 'adjuntar', 'archive', 'archivar']
  },
  {
    id: 'client-profile-settings',
    icon: UserCircleIcon,
    en: {
      title: 'Your Profile and Settings',
      category: 'Client Portal',
      overview: 'Where your own details live: your profile, your properties, when you can be visited, what the portal tells you about, and why the provider can no longer edit your details.'
    },
    es: {
      title: 'Su Perfil y Configuración',
      category: 'Portal del Cliente',
      overview: 'Donde viven sus datos: su perfil, sus propiedades, cuándo puede recibir visitas, de qué le avisa el portal y por qué el proveedor ya no puede editar sus datos.'
    },
    keywords: ['settings', 'configuración', 'profile', 'perfil', 'properties', 'propiedades', 'availability', 'disponibilidad', 'notifications', 'notificaciones', 'privacy', 'privacidad']
  }
];

export const categoryOrder = [
  'Getting Started',
  'Mobile App',
  'People & Teams',
  'Clients & Properties',
  'Services & Products',
  'Scheduling',
  'Jobs & Estimates',
  'Billing & Time Tracking',
  'AI & Automation',
  'Settings',
  // Last on purpose: the client portal is a different audience, and everything
  // in it belongs together rather than mixed into the provider's sections.
  'Client Portal'
];

export default articles;
