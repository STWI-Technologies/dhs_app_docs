import {
  UserGroupIcon,
  UserMultiple02Icon,
  Home01Icon,
  Wrench01Icon,
  Package01Icon,
  Calendar03Icon,
  Calendar01Icon,
  Estimate01Icon,
  Briefcase04Icon,
  Invoice01Icon,
  Timer02Icon,
  Setting07Icon,
  CheckListIcon,
} from 'hugeicons-react';

const articles = [
  {
    id: 'users-management',
    icon: UserGroupIcon,
    en: {
      title: 'Users Management',
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
    id: 'availability-management',
    icon: Calendar03Icon,
    en: {
      title: 'Availability Management',
      category: 'Scheduling',
      overview: 'Configure business hours globally or per crew with work days, time slots, and exceptions. Manage seasonal schedules and holiday closures.'
    },
    es: {
      title: 'Gestión de Disponibilidad',
      category: 'Programación',
      overview: 'Configure horarios de trabajo globalmente o por cuadrilla con días laborables, franjas horarias y excepciones. Administre horarios estacionales y cierres por festivos.'
    },
    keywords: ['availability', 'disponibilidad', 'schedule', 'horario', 'time slots', 'exceptions', 'excepciones', 'global', 'crew']
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
  }
];

export const categoryOrder = [
  'People & Teams',
  'Clients & Properties',
  'Services & Products',
  'Scheduling',
  'Jobs & Estimates',
  'Billing & Time Tracking',
  'Settings'
];

export default articles;
