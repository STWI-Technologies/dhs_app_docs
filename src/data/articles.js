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
  WifiDisconnected01Icon,
  WarehouseIcon,
  DashboardSquare01Icon,
  DashboardSpeed02Icon,
  Calendar03Icon,
  MapsLocation01Icon,
  CustomerService01Icon,
  Building03Icon,
  UserCircleIcon,
  Login03Icon,
} from 'hugeicons-react';

const articles = [
  {
    id: 'mobile-app',
    audience: 'provider',
    platforms: ['app'],
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
    id: 'mobile-offline',
    audience: 'provider',
    platforms: ['app'],
    icon: WifiDisconnected01Icon,
    contentPath: {
      en: '/content/mobile-offline.html',
      es: '/content/mobile-offline-es.html',
    },
    en: {
      title: 'Working Offline',
      category: 'Mobile App',
      overview: 'What the mobile app can still do with no signal, entity by entity, how your changes queue and upload on their own, and what to open before you drive out.'
    },
    es: {
      title: 'Trabajar sin Conexión',
      category: 'Aplicación Móvil',
      overview: 'Qué puede seguir haciendo la app móvil sin señal, punto por punto, cómo se encolan y suben solos sus cambios, y qué abrir antes de salir.'
    },
    keywords: ['offline', 'sin conexión', 'sync', 'sincronización', 'queued', 'cola', 'conflict', 'conflicto', 'signal', 'señal', 'field', 'campo', 'unsynced', 'mobile', 'móvil']
  },
  {
    id: 'users-management',
    audience: 'provider',
    platforms: ['web'],
    icon: UserGroupIcon,
    contentPath: {
      en: '/content/users-management.html',
      es: '/content/users-management-es.html',
    },
    en: {
      title: 'User Management',
      category: 'People & Teams',
      overview: 'Everyone who can sign in: adding them with a role, editing profiles, sending a password reset, and turning access off and on. Users are disabled, never deleted, so the work they did stays on the record.'
    },
    es: {
      title: 'Gestión de Usuarios',
      category: 'Personas y Equipos',
      overview: 'Todos los que pueden iniciar sesión: agregarlos con un rol, editar perfiles, enviar un restablecimiento de contraseña y quitar o devolver el acceso. Los usuarios se deshabilitan, nunca se eliminan, así que su trabajo queda en el registro.'
    },
    keywords: ['users', 'usuarios', 'roles', 'admin', 'crew', 'permissions', 'permisos', 'accounts', 'cuentas', 'password', 'profile']
  },
  {
    id: 'crews-management',
    audience: 'provider',
    platforms: ['web'],
    icon: UserMultiple02Icon,
    contentPath: {
      en: '/content/crews-management.html',
      es: '/content/crews-management-es.html',
    },
    en: {
      title: 'Crews Management',
      category: 'People & Teams',
      overview: 'Teams you assign as a unit instead of one technician at a time: members and a lead, a colour that identifies them everywhere, their own working hours, and the ratings clients leave them.'
    },
    es: {
      title: 'Gestión de Equipos',
      category: 'Personas y Equipos',
      overview: 'Equipos que se asignan completos en vez de técnico por técnico: miembros y líder, un color que los identifica en toda la app, su propio horario y las calificaciones que les dejan los clientes.'
    },
    keywords: ['crews', 'equipos', 'teams', 'lead', 'líder', 'members', 'miembros', 'color', 'availability']
  },
  {
    id: 'clients-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Home01Icon,
    contentPath: {
      en: '/content/clients-management.html',
      es: '/content/clients-management-es.html',
    },
    en: {
      title: 'Clients Management',
      category: 'Clients & Properties',
      overview: 'Who you work for: contact and billing details, their properties, their files and the conversation. Invite them to the portal and from then on they maintain their own details.'
    },
    es: {
      title: 'Gestión de Clientes',
      category: 'Clientes y Propiedades',
      overview: 'Para quién trabaja: datos de contacto y facturación, sus propiedades, sus archivos y la conversación. Invítelos al portal y desde ahí ellos mantienen sus propios datos.'
    },
    keywords: ['clients', 'clientes', 'properties', 'propiedades', 'billing', 'facturación', 'residential', 'business', 'CSV', 'import', 'export', 'tags']
  },
  {
    id: 'services-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Wrench01Icon,
    contentPath: {
      en: '/content/services-management.html',
      es: '/content/services-management-es.html',
    },
    en: {
      title: 'Services Management',
      category: 'Services & Products',
      overview: 'The labour you charge for, priced once and picked everywhere else. Rates, what clients can request from your portal, and archiving what you stopped offering without touching the records that used it.'
    },
    es: {
      title: 'Gestión de Servicios',
      category: 'Servicios y Productos',
      overview: 'La mano de obra que cobra, con precio puesto una vez y elegida en todo lo demás. Tarifas, qué pueden pedir los clientes desde su portal, y archivar lo que dejó de ofrecer sin tocar los registros que lo usaron.'
    },
    keywords: ['services', 'servicios', 'pricing', 'precios', 'labor', 'mano de obra', 'attachments', 'archivos']
  },
  {
    id: 'products-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Package01Icon,
    contentPath: {
      en: '/content/products-management.html',
      es: '/content/products-management-es.html',
    },
    en: {
      title: 'Products Management',
      category: 'Services & Products',
      overview: 'What you stock and install: cost, markup and price that work each other out, what is on hand against what is already promised to jobs and quotes, and when to reorder.'
    },
    es: {
      title: 'Gestión de Productos',
      category: 'Servicios y Productos',
      overview: 'Lo que almacena e instala: costo, marcado y precio que se calculan entre ellos, lo que hay contra lo que ya está comprometido a trabajos y cotizaciones, y cuándo reordenar.'
    },
    keywords: ['products', 'productos', 'inventory', 'inventario', 'stock', 'markup', 'margen', 'materials', 'materiales']
  },
  {
    id: 'vendors-manufacturers-groups',
    audience: 'provider',
    platforms: ['web'],
    icon: WarehouseIcon,
    contentPath: {
      en: '/content/vendors-manufacturers-groups.html',
      es: '/content/vendors-manufacturers-groups-es.html',
    },
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
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Calendar01Icon,
    contentPath: {
      en: '/content/appointments-management.html',
      es: '/content/appointments-management-es.html',
    },
    en: {
      title: 'Appointments Management',
      category: 'Scheduling',
      overview: 'The visit before the work: booking it around crew availability, getting the client to confirm, and turning what you found into an estimate, a job or an invoice.'
    },
    es: {
      title: 'Gestión de Citas',
      category: 'Programación',
      overview: 'La visita antes del trabajo: agendarla respetando la disponibilidad del equipo, conseguir que el cliente confirme, y convertir lo que encontró en presupuesto, trabajo o factura.'
    },
    keywords: ['appointments', 'citas', 'scheduling', 'programación', 'calendar', 'calendario', 'scheduler', 'status', 'estado']
  },
  {
    id: 'scheduler',
    audience: 'provider',
    platforms: ['web'],
    icon: Calendar03Icon,
    contentPath: {
      en: '/content/scheduler.html',
      es: '/content/scheduler-es.html',
    },
    en: {
      title: 'Scheduler',
      category: 'Scheduling',
      overview: 'The calendar for everything with a date: day, week, month and list views, a column per crew for dispatching, creating by clicking a slot, dragging to reschedule, and when the calendar refuses a drop.'
    },
    es: {
      title: 'Programador',
      category: 'Programación',
      overview: 'El calendario de todo lo que tiene fecha: vistas de día, semana, mes y lista, una columna por equipo para despachar, crear con un clic en el espacio, arrastrar para reprogramar, y cuándo el calendario rechaza un arrastre.'
    },
    keywords: ['scheduler', 'programador', 'calendar', 'calendario', 'schedule', 'agenda', 'day', 'día', 'week', 'semana', 'month', 'mes', 'drag', 'arrastrar', 'reschedule', 'reprogramar', 'availability', 'disponibilidad', 'override', 'anular', 'crew', 'equipo', 'unassigned', 'sin asignar']
  },
  {
    id: 'map-view',
    audience: 'provider',
    platforms: ['web'],
    icon: MapsLocation01Icon,
    contentPath: {
      en: '/content/map-view.html',
      es: '/content/map-view-es.html',
    },
    en: {
      title: 'Map',
      category: 'Scheduling',
      overview: 'Where the work is: jobs and appointments as pins, grouped when they sit together, filtered by date and crew, and what an empty map is actually telling you.'
    },
    es: {
      title: 'Mapa',
      category: 'Programación',
      overview: 'Dónde está el trabajo: trabajos y citas como marcadores, agrupados cuando quedan juntos, filtrados por fecha y equipo, y qué le está diciendo de verdad un mapa vacío.'
    },
    keywords: ['map', 'mapa', 'location', 'ubicación', 'address', 'dirección', 'pins', 'marcadores', 'route', 'ruta', 'geography', 'geografía', 'property', 'propiedad', 'street view', 'recenter', 'recentrar']
  },
  {
    id: 'estimates-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Estimate01Icon,
    contentPath: {
      en: '/content/estimates-management.html',
      es: '/content/estimates-management-es.html',
    },
    en: {
      title: 'Estimates Management',
      category: 'Jobs & Estimates',
      overview: 'The price before the work: building it from your catalogue, sending it by email or text, finding what is still waiting on a client, renewing what expired, and turning a yes into a job with nothing retyped.'
    },
    es: {
      title: 'Gestión de Presupuestos',
      category: 'Trabajos y Presupuestos',
      overview: 'El precio antes del trabajo: armarlo con su catálogo, enviarlo por correo o mensaje, encontrar lo que sigue esperando al cliente, renovar lo vencido y convertir un sí en trabajo sin recapturar nada.'
    },
    keywords: ['estimates', 'presupuestos', 'quotes', 'cotizaciones', 'PDF', 'send', 'enviar', 'convert', 'convertir']
  },
  {
    id: 'jobs-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Briefcase04Icon,
    contentPath: {
      en: '/content/jobs-management.html',
      es: '/content/jobs-management-es.html',
    },
    en: {
      title: 'Jobs Management',
      category: 'Jobs & Estimates',
      overview: 'Work you have committed to: scheduling it to a crew, following it from en route to completed, recording each visit and its hours, working the checklist, and billing it without retyping.'
    },
    es: {
      title: 'Gestión de Trabajos',
      category: 'Trabajos y Presupuestos',
      overview: 'El trabajo con el que ya se comprometió: agendarlo a un equipo, seguirlo de en camino a completado, registrar cada visita y sus horas, trabajar la lista de verificación y facturarlo sin recapturar.'
    },
    keywords: ['jobs', 'trabajos', 'work orders', 'órdenes', 'status', 'estado', 'checklist', 'recurring', 'recurrente']
  },
  {
    id: 'invoices-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Invoice01Icon,
    contentPath: {
      en: '/content/invoices-management.html',
      es: '/content/invoices-management-es.html',
    },
    en: {
      title: 'Invoices Management',
      category: 'Billing & Time Tracking',
      overview: 'The bill and the money: raising it from a finished job, sending it, seeing whether the client opened it, recording payments including part payments, and chasing what is late.'
    },
    es: {
      title: 'Gestión de Facturas',
      category: 'Facturación y Control de Tiempo',
      overview: 'La cuenta y el dinero: emitirla desde un trabajo terminado, enviarla, ver si el cliente la abrió, registrar pagos incluidos los parciales y perseguir lo atrasado.'
    },
    keywords: ['invoices', 'facturas', 'payments', 'pagos', 'PDF', 'tax', 'impuestos', 'Stripe', 'billing']
  },
  {
    id: 'timesheets-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Timer02Icon,
    contentPath: {
      en: '/content/timesheets-management.html',
      es: '/content/timesheets-management-es.html',
    },
    en: {
      title: 'Timesheets Management',
      category: 'Billing & Time Tracking',
      overview: 'Time collected from visits and timers, split into en route, job, job prep and office. Link loose entries, add what the timers missed, then submit, approve or reject.'
    },
    es: {
      title: 'Gestión de Hojas de Tiempo',
      category: 'Facturación y Control de Tiempo',
      overview: 'El tiempo que llega de las visitas y los temporizadores, separado en trayecto, trabajo, preparación y oficina. Vincule entradas sueltas, agregue lo que faltó y envíe, apruebe o rechace.'
    },
    keywords: ['timesheets', 'hojas de tiempo', 'hours', 'horas', 'approval', 'aprobación', 'clock', 'reloj', 'entries']
  },
  {
    id: 'settings-configuration',
    audience: 'provider',
    platforms: ['web'],
    icon: Setting07Icon,
    contentPath: {
      en: '/content/settings-configuration.html',
      es: '/content/settings-configuration-es.html',
    },
    en: {
      title: 'Settings & Configuration',
      category: 'Settings',
      overview: 'Everything under the avatar menu: account and profile, notifications, security, availability, dashboard, business rules, taking payments, billing and QuickBooks.'
    },
    es: {
      title: 'Configuración y Ajustes',
      category: 'Configuración',
      overview: 'Todo lo que vive bajo el menú del avatar: cuenta y perfil, notificaciones, seguridad, disponibilidad, panel, reglas del negocio, cobros, facturación y QuickBooks.'
    },
    keywords: ['settings', 'configuración', 'account', 'cuenta', 'notifications', 'notificaciones', 'Stripe', 'tax', 'impuestos', 'profile']
  },
  {
    id: 'checklists-management',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: CheckListIcon,
    contentPath: {
      en: '/content/checklists-management.html',
      es: '/content/checklists-management-es.html',
    },
    en: {
      title: 'Checklists Management',
      category: 'Jobs & Estimates',
      overview: 'Reusable lists of steps your crews work through on site. Build one, put it in work order, require a written note where it matters, and attach it to a job.'
    },
    es: {
      title: 'Gestión de Listas de Verificación',
      category: 'Trabajos y Presupuestos',
      overview: 'Listas reutilizables de pasos que el equipo sigue en sitio. Constrúyala, ordénela, exija una nota escrita donde importa y adjúntela a un trabajo.'
    },
    keywords: ['checklists', 'listas', 'templates', 'plantillas', 'items', 'elementos', 'jobs', 'trabajos']
  },
  {
    id: 'ai-assistant',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: AiBrain01Icon,
    contentPath: {
      en: '/content/ai-assistant.html',
      es: '/content/ai-assistant-es.html',
    },
    en: {
      title: 'AI Assistant (Web & Mobile)',
      category: 'AI & Automation',
      overview: 'Ask in plain English or Spanish and it does the work: finding records, creating and updating them, tracking time, reading a photo you send it, and handing you a one-tap link straight into the app.'
    },
    es: {
      title: 'Asistente IA (Web y Móvil)',
      category: 'IA y Automatización',
      overview: 'Pídalo en español o en inglés y lo hace: buscar registros, crearlos y actualizarlos, registrar tiempo, leer una foto que le mande y entregarle un enlace directo a la app.'
    },
    keywords: ['ai', 'assistant', 'asistente', 'web', 'mobile', 'móvil', 'voice', 'voz', 'search', 'buscar', 'create', 'crear', 'natural language']
  },
  {
    id: 'dashboard',
    audience: 'provider',
    platforms: ['web'],
    icon: DashboardSpeed02Icon,
    contentPath: {
      en: '/content/dashboard.html',
      es: '/content/dashboard-es.html',
    },
    en: {
      title: 'Dashboard',
      category: 'Getting Started',
      overview: 'The screen you land on: the four numbers that matter, the calendar, who is waiting on a reply, and what is still open, with every row a shortcut into the record behind it.'
    },
    es: {
      title: 'Panel de Control',
      category: 'Primeros Pasos',
      overview: 'La pantalla en la que usted cae: los cuatro números que importan, el calendario, quién espera respuesta y qué sigue abierto, con cada fila como atajo al registro que tiene detrás.'
    },
    keywords: ['dashboard', 'panel', 'home', 'inicio', 'overview', 'resumen', 'totals', 'totales', 'profit', 'ganancia', 'inbox', 'bandeja', 'upcoming', 'próximos', 'clock', 'reloj', 'timer', 'cronómetro', 'widgets']
  },
  {
    id: 'plans-pricing',
    audience: 'provider',
    platforms: ['web', 'app'],
    icon: Layers01Icon,
    contentPath: {
      en: '/content/plans-pricing.html',
      es: '/content/plans-pricing-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: Login03Icon,
    contentPath: {
      en: '/content/client-getting-started.html',
      es: '/content/client-getting-started-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: DashboardSquare01Icon,
    contentPath: {
      en: '/content/client-dashboard.html',
      es: '/content/client-dashboard-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: CustomerService01Icon,
    contentPath: {
      en: '/content/client-request-service.html',
      es: '/content/client-request-service-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: Building03Icon,
    contentPath: {
      en: '/content/client-service-providers.html',
      es: '/content/client-service-providers-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: Calendar01Icon,
    contentPath: {
      en: '/content/client-appointments.html',
      es: '/content/client-appointments-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: Estimate01Icon,
    contentPath: {
      en: '/content/client-estimates.html',
      es: '/content/client-estimates-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: Briefcase04Icon,
    contentPath: {
      en: '/content/client-jobs.html',
      es: '/content/client-jobs-es.html',
    },
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
    audience: 'client',
    platforms: ['client'],
    icon: Invoice01Icon,
    contentPath: {
      en: '/content/client-invoices.html',
      es: '/content/client-invoices-es.html',
    },
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
    id: 'client-profile-settings',
    audience: 'client',
    platforms: ['client'],
    icon: UserCircleIcon,
    contentPath: {
      en: '/content/client-profile-settings.html',
      es: '/content/client-profile-settings-es.html',
    },
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
