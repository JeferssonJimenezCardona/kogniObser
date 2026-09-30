export type MocStage =
  | 'Discovery'
  | 'Propuesta'
  | 'Negociación'
  | 'Conversión'
  | 'En Standby'
  | 'Perdida';

export type IndustrySector =
  | 'Oil & Gas'
  | 'Financiero & Fintech'
  | 'Energía & Utilities'
  | 'Minería & Metales'
  | 'Salud & Pharma'
  | 'Retail & Consumo'
  | 'Logística & Puertos'
  | 'Telecomunicaciones & Tech';

export type RelationshipLevel =
  | 'Sin contacto'
  | 'Contactado'
  | 'Relación inicial'
  | 'Relación activa'
  | 'Sponsor';

export type OpportunityType =
  | 'Nueva cuenta'
  | 'Cliente actual'
  | 'Upsell'
  | 'Cross-sell'
  | 'Renovación'
  | 'Licitación';

export type CompanyCategory =
  | 'Partner'
  | 'Cliente - Emegia'
  | 'Cliente Kognia';

export const COMPANY_CATEGORIES: CompanyCategory[] = [
  'Partner',
  'Cliente - Emegia',
  'Cliente Kognia',
];

export type ProjectContractType =
  | 'Proyecto Cerrado / Llave en mano'
  | 'Fee Mensual / Retainer'
  | 'Time & Materials / Bolsas de horas'
  | 'Staff Augmentation'
  | 'Por Consumos'
  | 'Por Tiers';

export type PriorityLevel = 'Alta' | 'Media' | 'Baja';

export interface CommercialCommitment {
  id: string;
  description: string;
  dueDate: string;
  assignee: string;
  completed: boolean;
}

export interface QuotationExcelRow {
  id: string;
  concept: string; // Entregable / Concepto
  category: 'Setup / Arquitectura' | 'Licencias & Plataforma' | 'Desarrollo & IA' | 'Soporte & Cloud' | 'Consultoría';
  qty: number; // Cantidad / Horas / Licencias
  unitPrice: number; // Tarifa / Valor unitario
  total: number; // qty * unitPrice (Fórmula)
}

export interface OpportunityQuotation {
  id: string;
  code: string; // e.g. COT-2026-01-A
  title: string; // e.g. Propuesta Base o Fase 1
  setupPrice: number; // Precio de Setup / Implementación Inicial
  salePrice: number; // Precio de Venta / Fee o Total
  currency: string;
  discountPct?: number; // Descuento Comercial (%)
  taxPct?: number; // Impuestos / IVA (%)
  totalPrice: number; // Formula automática: (setupPrice + salePrice) * (1 - discount/100) * (1 + tax/100)
  status: 'Borrador' | 'Enviada' | 'En Negociación' | 'Aprobada' | 'Rechazada';
  validUntil: string;
  description: string;
  commercialConditions: string;
  excelRows?: QuotationExcelRow[]; // Filas editables del modelo de costos Excel
  attachedFileName?: string;
  attachedFileSize?: string;
  attachedFileDate?: string;
  isPrimary?: boolean;
}

export interface SubOpportunity {
  id: string;
  code: string; // e.g. OPP-01
  opportunityName: string; // Nombre de la oportunidad (Obligatorio)
  description: string; // Descripción / necesidad
  solutionProducts: string[]; // Producto / solución o línea de negocio
  projectType: ProjectContractType; // Tipo de proyecto / contrato
  stage: MocStage; // Etapa del pipeline / Estado
  probability: number; // Probabilidad de cierre (%)
  currency: string; // Moneda (USD, COP, EUR, MXN)
  estimatedValue: number; // Valor estimado (TCV - Total Contract Value)
  estimatedValueUsd?: number;
  mrr: number; // Valor recurrente mensual (MRR)
  expectedCloseDate: string; // Fecha estimada de cierre
  startDate?: string; // Fecha inicio estimada
  durationMonths?: number; // Duración estimada (meses)
  priority: PriorityLevel; // Prioridad
  owner: string; // Responsable comercial / Owner
  techLead?: string; // Preventa técnica asignada
  quotations?: OpportunityQuotation[]; // Cotizaciones vinculadas a esta oportunidad
  isPrimary?: boolean;
}

export interface ClientOpportunity {
  id: string;
  code: string; // ID automático (ej: OPP-2026-01)
  createdAt: string;
  updatedAt: string;

  // 1. Empresa, mercado y origen
  companyName: string; // Razón Social / Empresa (Obligatorio)
  companyCategory?: CompanyCategory; // 'Partner' | 'Cliente - Emegia' | 'Cliente Kognia'
  taxId: string; // NIT / Tax ID
  country: string; // País (Lista)
  city: string; // Ciudad (Dependiente de país)
  industry: IndustrySector; // Mercado / Sector
  subsector: string; // Subsector (ej. Upstream, Banca, Seguros, EPS)
  leadSource: string; // Procedencia / Lead Source (Referido, Outbound, Evento, Alianza, Inbound, Licitación)
  leadSourceDetail: string; // Detalle de procedencia
  accountType?: 'Nueva cuenta' | 'Cliente actual'; // Opcional / Deprecado
  associatedPartner: string; // Partner asociado (AWS, Azure, Google Cloud, Databricks, etc.)
  associatedPartners?: string[]; // Lista múltiple de partners asociados (Checklist)

  // 2. Contactos (Enterprise)
  contactName: string; // Contacto principal (Obligatorio)
  contactRole: string; // Cargo (Obligatorio)
  contactEmail: string; // Email (Obligatorio)
  contactPhone: string; // Teléfono
  economicBuyer: string; // Decisor económico
  economicBuyerRole: string; // Cargo del decisor
  internalSponsor: string; // Sponsor interno
  technicalInfluencer: string; // Influenciador técnico
  relationshipLevel: RelationshipLevel; // Nivel de relación

  // 3. Oportunidad comercial (Múltiples Oportunidades por Cliente)
  opportunities?: SubOpportunity[]; // Lista de oportunidades asociadas al cliente
  opportunityName: string; // Nombre de la oportunidad principal (Obligatorio)
  description: string; // Descripción / necesidad (Obligatorio)
  solutionProducts: string[]; // Producto / solución o línea de negocio
  projectType: ProjectContractType; // Tipo de proyecto / contrato
  stage: MocStage; // Etapa del pipeline / Estado
  probability: number; // Probabilidad de cierre (%)
  currency: string; // Moneda (USD, COP, EUR, MXN)
  estimatedValue: number; // Valor estimado (TCV - Total Contract Value)
  estimatedValueUsd?: number; // Compatibilidad
  mrr: number; // Valor recurrente mensual (MRR)
  expectedCloseDate: string; // Fecha estimada de cierre
  startDate?: string; // Fecha inicio estimada
  durationMonths?: number; // Duración estimada (meses)
  priority: PriorityLevel; // Prioridad
  owner: string; // Responsable comercial / Owner
  techLead?: string; // Preventa técnica asignada

  // 4. Próxima Acción Comercial / Compromisos (Tipo Check)
  nextAction: string; // Descripción compromiso principal
  nextActionDone: boolean; // Tipo Check (completado / pendiente)
  nextActionDate: string; // Fecha compromiso
  nextActionAssignee?: string; // Responsable
  commitments: CommercialCommitment[]; // Lista detallada de compromisos tipo check

  // 5. Cotizaciones Enterprise (Múltiples Cotizaciones con Excel y Fórmulas)
  quotations?: OpportunityQuotation[];
  quoteCode?: string;
  quoteSetupPrice?: number;
  quoteSalePrice?: number;
  quoteCurrency?: string;
  quoteDescription?: string;
  quoteCommercialConditions?: string;
  quoteStatus?: 'Borrador' | 'Enviada' | 'En Negociación' | 'Aprobada' | 'Rechazada';
  quoteValidUntil?: string;
  quoteAttachedFileName?: string;
  quoteAttachedFileSize?: string;
  quoteAttachedFileDate?: string;
}

// -------------------------------------------------------------
// Proyectos y Capacidad Mensual (Estructura de la Imagen)
// -------------------------------------------------------------
export type TaskStatus = 'Por Iniciar' | 'En Curso' | 'En Revisión' | 'Atrasado' | 'Completado';

export interface ActivityTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityAssignee {
  id: string;
  person: string;
  role: string;
  percent: number;
}

export interface ProjectActivity {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  client: string; // Lista desplegable
  industry?: IndustrySector;
  activityTitle: string;
  taskDetails: string;
  tasks: ActivityTask[]; // Checklist interactivo
  assignedPerson: string;
  assignedRole: string;
  allocationPercent: number; // % promedio de asignación
  assignees?: ActivityAssignee[]; // Uno o más colaboradores con su respectivo %
  progressPercent: number; // % de avance (0% = Pendiente, 1-99% = En Curso, 100% = Completado)
  status: TaskStatus;
  startDate: string;
  endDate: string;
  additionalDate?: string; // Fecha adicional / Hito de revisión
  estimatedHours: number;
  loggedHours: number;
  activeMonths: string[]; // e.g. ["2026-10", "2026-11"]
}

export interface CollaboratorMonthData {
  monthKey: string;
  monthLabel: string;
  assignedHours: number;
  totalPercent: number;
  availableHours: number;
  availablePercent: number;
  isOverload: boolean;
  isLimit: boolean;
  overloadPercent: number;
  activities: {
    code: string;
    title: string;
    client: string;
    hours: number;
    allocationPercent: number;
    status: TaskStatus;
  }[];
}

export interface CollaboratorCapacity {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarLetter: string;
  avatarColor: string;
  workSchedule: string; // e.g. "Semana LV - Dia"
  workingDays: number; // e.g. 22 días
  monthlyAvailableHours: number; // e.g. 186h
  monthlyAllocations: Record<string, CollaboratorMonthData>;
}

export const COUNTRIES = [
  'Colombia',
  'México',
  'Perú',
  'Chile',
  'Estados Unidos',
  'Panamá',
  'Brasil',
  'España',
];

export const COUNTRY_CITIES: Record<string, string[]> = {
  Colombia: ['Bogotá', 'Medellín', 'Barrancabermeja', 'Cali', 'Barranquilla', 'Cartagena'],
  México: ['Ciudad de México', 'Monterrey', 'Guadalajara', 'Querétaro'],
  Perú: ['Lima', 'Arequipa', 'Trujillo'],
  Chile: ['Santiago', 'Antofagasta', 'Valparaíso'],
  'Estados Unidos': ['Houston, TX', 'Miami, FL', 'Austin, TX', 'New York, NY'],
  Panamá: ['Ciudad de Panamá'],
  Brasil: ['São Paulo', 'Río de Janeiro'],
  España: ['Madrid', 'Barcelona', 'Valencia'],
};

export const SECTORS: IndustrySector[] = [
  'Oil & Gas',
  'Financiero & Fintech',
  'Energía & Utilities',
  'Minería & Metales',
  'Salud & Pharma',
  'Retail & Consumo',
  'Logística & Puertos',
  'Telecomunicaciones & Tech',
];

export const SUBSECTORS: Record<string, string[]> = {
  'Oil & Gas': ['Upstream & Exploración', 'Midstream & Transporte de Gas', 'Downstream & Refinación', 'Servicios Petroleros'],
  'Financiero & Fintech': ['Banca Corporativa', 'Banca Retail & Pymes', 'Fintech & Medios de Pago', 'Seguros Generales & Vida'],
  'Energía & Utilities': ['Generación Térmica', 'Generación Renovable', 'Transmisión & Distribución', 'Agua & Saneamiento'],
  'Minería & Metales': ['Cobre & Concentrados', 'Oro & Metales Preciosos', 'Carbón Térmico', 'Fundición & Logística'],
  'Salud & Pharma': ['Prestación Hospitalaria / Clínicas', 'Aseguramiento / EPS', 'Farmacéutica & Distribución'],
  'Retail & Consumo': ['Supermercados & Grandes Superficies', 'E-commerce & Omnicanalidad', 'Alimentos & Bebidas'],
  'Logística & Puertos': ['Operadores Portuarios', 'Transporte de Carga Pesada', 'Centros de Distribución'],
  'Telecomunicaciones & Tech': ['Operadores Móviles & Fibra', 'Data Centers & Nube', 'SaaS B2B'],
};

export const LEAD_SOURCES = [
  'Referido C-Level / Junta',
  'Outbound Ejecutivo',
  'Evento / Congreso Sectorial',
  'Alianza con Partner Cloud',
  'Inbound / Web Corporativa',
  'Licitación Privada / RFP',
];

export const PARTNERS = [
  'Directo / Sin Partner',
  'AWS (Amazon Web Services)',
  'Microsoft Azure',
  'Google Cloud',
  'Databricks',
  'Snowflake',
  'Cisco / Rockwell Automation',
  'Integrador Regional',
];

export const CLIENT_COMPANIES = [
  'Keralty',
  'Enlace Operativo',
  'Telepizza',
];

export const SOLUTION_PRODUCTS = [
  'VOXI',
  'CHARLI',
  'SIDEKI',
];

export const CONTRACT_TYPES: ProjectContractType[] = [
  'Proyecto Cerrado / Llave en mano',
  'Fee Mensual / Retainer',
  'Time & Materials / Bolsas de horas',
  'Staff Augmentation',
  'Por Consumos',
  'Por Tiers',
];

export const STAGES: MocStage[] = [
  'Discovery',
  'Propuesta',
  'Negociación',
  'Conversión',
];

export const OWNERS = [
  'Camila Restrepo',
  'Santiago Mendoza',
  'Laura Villamizar',
  'Andrés Echeverri',
];

export const TECH_LEADS = [
  'Mateo Londoño',
  'Daniela Pineda',
  'Luis Pardo Fonseca',
  'Alejandro Giraldo Loaiza',
  'Andres Galindo Garcia',
  'Juan Esteban Grateron Nuñez',
];

export const INITIAL_CLIENTS: ClientOpportunity[] = [
  {
    id: 'moc-1',
    code: 'OPP-2026-01',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-29',
    companyName: 'Keralty',
    companyCategory: 'Cliente Kognia',
    taxId: '800.198.423-1',
    country: 'Colombia',
    city: 'Bogotá',
    industry: 'Salud & Pharma',
    subsector: 'Servicios de Salud & Clínicas',
    leadSource: 'Referido C-Level / Junta',
    leadSourceDetail: 'Comité de Innovación y Transformación Digital Keralty',
    accountType: 'Cliente actual',
    associatedPartner: 'AWS (Amazon Web Services)',
    contactName: 'Dra. Carolina Méndez',
    contactRole: 'Directora de Transformación Digital & Analítica',
    contactEmail: 'cmendez@keralty.com',
    contactPhone: '+57 310 982 4410',
    economicBuyer: 'Dr. Roberto Esguerra',
    economicBuyerRole: 'Vicepresidente de Operaciones Clínicas',
    internalSponsor: 'Dra. Carolina Méndez',
    technicalInfluencer: 'Mateo Londoño (Kognia)',
    relationshipLevel: 'Relación activa',
    opportunityName: 'Plataforma de IA & Analítica Predictiva en Salud',
    description: 'Modelos predictivos de ocupación de camas de urgencias, triaje asistido y optimización de asignación de especialistas en clínicas.',
    solutionProducts: ['VOXI', 'CHARLI'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    estimatedValue: 285000,
    estimatedValueUsd: 285000,
    currency: 'USD',
    mrr: 14000,
    expectedCloseDate: '2026-10-25',
    startDate: '2026-11-01',
    durationMonths: 12,
    priority: 'Alta',
    stage: 'Conversión',
    probability: 100,
    owner: 'Camila Restrepo',
    techLead: 'Mateo Londoño',
    nextAction: 'Kick-off Sprint 1 e integración de conectores FHIR con sistemas hospitalarios',
    nextActionDone: true,
    nextActionDate: '2026-10-05',
    nextActionAssignee: 'Camila Restrepo',
    commitments: [
      {
        id: 'com-1-1',
        description: 'Entrega de arquitectura de seguridad y cumplimiento de normatividad en datos de salud',
        dueDate: '2026-10-02',
        assignee: 'Juan Esteban Grateron Nuñez',
        completed: true,
      },
      {
        id: 'com-1-2',
        description: 'Kick-off técnico con el equipo de infraestructura de Keralty',
        dueDate: '2026-10-08',
        assignee: 'Camila Restrepo',
        completed: true,
      },
    ],
  },
  {
    id: 'moc-2',
    code: 'OPP-2026-02',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-28',
    companyName: 'Enlace Operativo',
    companyCategory: 'Cliente - Emegia',
    taxId: '900.512.784-8',
    country: 'Colombia',
    city: 'Medellín',
    industry: 'Financiero & Fintech',
    subsector: 'Operador de Información & Liquidación PILA',
    leadSource: 'Referido C-Level / Junta',
    leadSourceDetail: 'Alianza Estratégica Sector Financiero y Seguridad Social',
    accountType: 'Cliente actual',
    associatedPartner: 'Microsoft Azure',
    contactName: 'Alejandro Valderrama',
    contactRole: 'Gerente de Tecnología & Operaciones',
    contactEmail: 'a.valderrama@enlaceoperativo.com',
    contactPhone: '+57 312 405 1199',
    economicBuyer: 'Dra. Patricia Salamanca',
    economicBuyerRole: 'Vicepresidenta Corporativa',
    internalSponsor: 'Alejandro Valderrama',
    technicalInfluencer: 'Daniela Pineda',
    relationshipLevel: 'Sponsor',
    opportunityName: 'Automatización & Motor de Liquidación de Seguridad Social',
    description: 'Modernización del pipeline de liquidación masiva de planillas PILA, validación de reglas de negocio en alta concurrencia y reconciliación bancaria.',
    solutionProducts: ['CHARLI', 'SIDEKI'],
    projectType: 'Fee Mensual / Retainer',
    estimatedValue: 210000,
    estimatedValueUsd: 210000,
    currency: 'USD',
    mrr: 17500,
    expectedCloseDate: '2026-11-15',
    startDate: '2026-11-20',
    durationMonths: 12,
    priority: 'Alta',
    stage: 'Negociación',
    probability: 80,
    owner: 'Santiago Mendoza',
    techLead: 'Daniela Pineda',
    nextAction: 'Demostración de PoC de throughput para 2M de registros por hora',
    nextActionDone: true,
    nextActionDate: '2026-10-10',
    nextActionAssignee: 'Daniela Pineda',
    commitments: [
      {
        id: 'com-2-1',
        description: 'Demostración de benchmarks de procesamiento de planillas',
        dueDate: '2026-10-05',
        assignee: 'Daniela Pineda',
        completed: true,
      },
      {
        id: 'com-2-2',
        description: 'Entrega de propuesta económica y acuerdos de nivel de servicio (SLA)',
        dueDate: '2026-10-14',
        assignee: 'Santiago Mendoza',
        completed: false,
      },
    ],
  },
  {
    id: 'moc-3',
    code: 'OPP-2026-03',
    createdAt: '2026-07-10',
    updatedAt: '2026-09-25',
    companyName: 'Telepizza',
    companyCategory: 'Partner',
    taxId: '890.312.901-2',
    country: 'Colombia',
    city: 'Bogotá',
    industry: 'Retail & Consumo',
    subsector: 'Quick Service Restaurants & Logística',
    leadSource: 'Alianza con Partner Cloud',
    leadSourceDetail: 'Iniciativa de Optimización Logística y Experiencia Omnicanal',
    accountType: 'Nueva cuenta',
    associatedPartner: 'Google Cloud',
    contactName: 'Ing. Javier Miró Quesada',
    contactRole: 'Director de Logística & Cadena de Suministro',
    contactEmail: 'jmiro@telepizza.com',
    contactPhone: '+57 318 640 2218',
    economicBuyer: 'Rodrigo Holguín',
    economicBuyerRole: 'Managing Director Retail',
    internalSponsor: 'Ing. Javier Miró Quesada',
    technicalInfluencer: 'Luis Pardo Fonseca',
    relationshipLevel: 'Relación activa',
    opportunityName: 'Motor de Despacho Dinámico & Ruteo Inteligente',
    description: 'Algoritmos de optimización de tiempos de entrega, predicción de demanda por punto de venta y asignación dinámica de repartidores.',
    solutionProducts: ['VOXI', 'SIDEKI'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    estimatedValue: 195000,
    estimatedValueUsd: 195000,
    currency: 'USD',
    mrr: 12500,
    expectedCloseDate: '2026-11-30',
    startDate: '2026-12-05',
    durationMonths: 10,
    priority: 'Media',
    stage: 'Propuesta',
    probability: 60,
    owner: 'Laura Villamizar',
    techLead: 'Luis Pardo Fonseca',
    nextAction: 'Presentación de simulación de despacho en 20 tiendas del área metropolitana',
    nextActionDone: false,
    nextActionDate: '2026-10-18',
    nextActionAssignee: 'Luis Pardo Fonseca',
    commitments: [
      {
        id: 'com-3-1',
        description: 'Entrega de modelo de optimización de rutas con datos de prueba',
        dueDate: '2026-10-10',
        assignee: 'Luis Pardo Fonseca',
        completed: true,
      },
      {
        id: 'com-3-2',
        description: 'Taller de integración con los sistemas POS y delivery de Telepizza',
        dueDate: '2026-10-18',
        assignee: 'Laura Villamizar',
        completed: false,
      },
    ],
  },
];

export const MONTH_COLUMNS = [
  { key: '2026-10', label: 'Octubre 2026', short: 'Oct 26' },
  { key: '2026-11', label: 'Noviembre 2026', short: 'Nov 26' },
  { key: '2026-12', label: 'Diciembre 2026', short: 'Dic 26' },
  { key: '2027-01', label: 'Enero 2027', short: 'Ene 27' },
  { key: '2027-02', label: 'Febrero 2027', short: 'Feb 27' },
  { key: '2027-03', label: 'Marzo 2027', short: 'Mar 27' },
];

export const INITIAL_COLLABORATORS: CollaboratorCapacity[] = [
  {
    id: 'col-1',
    name: 'Alejandro Giraldo Loaiza',
    role: 'Mid Full Stack Engineer',
    department: 'Tecnología e Innovación',
    avatarLetter: 'A',
    avatarColor: '#07B1C5',
    workSchedule: 'Semana LV - Dia',
    workingDays: 22,
    monthlyAvailableHours: 186,
    monthlyAllocations: {
      '2026-10': {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        assignedHours: 150,
        totalPercent: 81,
        availableHours: 36,
        availablePercent: 19,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-05', title: 'Gemelo Digital Molienda SAG', client: 'Telepizza', hours: 90, allocationPercent: 48, status: 'En Curso' },
          { code: 'ACT-07', title: 'Frontend Componentes de Telemetría', client: 'Keralty', hours: 60, allocationPercent: 33, status: 'Por Iniciar' },
        ],
      },
      '2026-11': {
        monthKey: '2026-11',
        monthLabel: 'Noviembre 2026',
        assignedHours: 160,
        totalPercent: 86,
        availableHours: 26,
        availablePercent: 14,
        isOverload: false,
        isLimit: true,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-05', title: 'Gemelo Digital Molienda SAG', client: 'Telepizza', hours: 100, allocationPercent: 54, status: 'En Curso' },
          { code: 'ACT-07', title: 'Frontend Componentes de Telemetría', client: 'Keralty', hours: 60, allocationPercent: 32, status: 'En Curso' },
        ],
      },
      '2026-12': {
        monthKey: '2026-12',
        monthLabel: 'Diciembre 2026',
        assignedHours: 110,
        totalPercent: 59,
        availableHours: 76,
        availablePercent: 41,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-05', title: 'Gemelo Digital Molienda SAG', client: 'Telepizza', hours: 70, allocationPercent: 38, status: 'En Revisión' },
          { code: 'ACT-07', title: 'Pruebas Integrales UI', client: 'Keralty', hours: 40, allocationPercent: 21, status: 'Por Iniciar' },
        ],
      },
      '2027-01': {
        monthKey: '2027-01',
        monthLabel: 'Enero 2027',
        assignedHours: 60,
        totalPercent: 32,
        availableHours: 126,
        availablePercent: 68,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-08', title: 'Soporte y Garantía Post-Lanzamiento', client: 'Keralty', hours: 60, allocationPercent: 32, status: 'Por Iniciar' },
        ],
      },
      '2027-02': {
        monthKey: '2027-02',
        monthLabel: 'Febrero 2027',
        assignedHours: 40,
        totalPercent: 21,
        availableHours: 146,
        availablePercent: 79,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-09', title: 'Bolsa Soporte Molienda', client: 'Telepizza', hours: 40, allocationPercent: 21, status: 'Por Iniciar' },
        ],
      },
      '2027-03': {
        monthKey: '2027-03',
        monthLabel: 'Marzo 2027',
        assignedHours: 0,
        totalPercent: 0,
        availableHours: 186,
        availablePercent: 100,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
    },
  },
  {
    id: 'col-2',
    name: 'Andres Galindo Garcia',
    role: 'Delivery Manager (Business & Client Solutions)',
    department: 'Tecnología e Innovación',
    avatarLetter: 'A',
    avatarColor: '#2F7F61',
    workSchedule: 'Semana LV - Dia',
    workingDays: 22,
    monthlyAvailableHours: 186,
    monthlyAllocations: {
      '2026-10': {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        assignedHours: 145,
        totalPercent: 78,
        availableHours: 41,
        availablePercent: 22,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-03', title: 'Scoring <90ms Delivery & Scrum', client: 'Enlace Operativo', hours: 85, allocationPercent: 46, status: 'En Curso' },
          { code: 'ACT-04', title: 'Despacho Predictivo Coordinación', client: 'Telepizza', hours: 60, allocationPercent: 32, status: 'En Curso' },
        ],
      },
      '2026-11': {
        monthKey: '2026-11',
        monthLabel: 'Noviembre 2026',
        assignedHours: 155,
        totalPercent: 83,
        availableHours: 31,
        availablePercent: 17,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-03', title: 'Scoring <90ms Delivery & Scrum', client: 'Enlace Operativo', hours: 95, allocationPercent: 51, status: 'En Curso' },
          { code: 'ACT-04', title: 'Despacho Predictivo Coordinación', client: 'Telepizza', hours: 60, allocationPercent: 32, status: 'En Curso' },
        ],
      },
      '2026-12': {
        monthKey: '2026-12',
        monthLabel: 'Diciembre 2026',
        assignedHours: 100,
        totalPercent: 54,
        availableHours: 86,
        availablePercent: 46,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-03', title: 'Cierre Proyecto Scoring Enlace Operativo', client: 'Enlace Operativo', hours: 60, allocationPercent: 32, status: 'En Revisión' },
          { code: 'ACT-04', title: 'Entrega Fase 1 Despacho Telepizza', client: 'Telepizza', hours: 40, allocationPercent: 22, status: 'En Revisión' },
        ],
      },
      '2027-01': {
        monthKey: '2027-01',
        monthLabel: 'Enero 2027',
        assignedHours: 50,
        totalPercent: 27,
        availableHours: 136,
        availablePercent: 73,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-10', title: 'Kickoff Gestión Gasoductos Norte', client: 'Enlace Operativo', hours: 50, allocationPercent: 27, status: 'Por Iniciar' },
        ],
      },
      '2027-02': {
        monthKey: '2027-02',
        monthLabel: 'Febrero 2027',
        assignedHours: 80,
        totalPercent: 43,
        availableHours: 106,
        availablePercent: 57,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-10', title: 'Seguimiento Proyecto Gasoductos', client: 'Enlace Operativo', hours: 80, allocationPercent: 43, status: 'Por Iniciar' },
        ],
      },
      '2027-03': {
        monthKey: '2027-03',
        monthLabel: 'Marzo 2027',
        assignedHours: 80,
        totalPercent: 43,
        availableHours: 106,
        availablePercent: 57,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-10', title: 'Seguimiento Proyecto Gasoductos', client: 'Enlace Operativo', hours: 80, allocationPercent: 43, status: 'Por Iniciar' },
        ],
      },
    },
  },
  {
    id: 'col-3',
    name: 'Luis Pardo Fonseca',
    role: 'CEO & Principal Architect',
    department: 'Dirección General & Estrategia',
    avatarLetter: 'L',
    avatarColor: '#0F2942',
    workSchedule: 'Semana LV - Dia',
    workingDays: 22,
    monthlyAvailableHours: 186,
    monthlyAllocations: {
      '2026-10': {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        assignedHours: 54,
        totalPercent: 29,
        availableHours: 132,
        availablePercent: 71,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-01', title: 'Comité Arquitectura SCADA Pozos', client: 'Keralty', hours: 24, allocationPercent: 13, status: 'En Curso' },
          { code: 'ACT-04', title: 'Validación Modelo Estocástico', client: 'Telepizza', hours: 30, allocationPercent: 16, status: 'En Curso' },
        ],
      },
      '2026-11': {
        monthKey: '2026-11',
        monthLabel: 'Noviembre 2026',
        assignedHours: 40,
        totalPercent: 22,
        availableHours: 146,
        availablePercent: 78,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-01', title: 'Homologación Seguridad Industrial', client: 'Keralty', hours: 20, allocationPercent: 11, status: 'En Curso' },
          { code: 'ACT-04', title: 'Cierre Algorítmico XM', client: 'Telepizza', hours: 20, allocationPercent: 11, status: 'En Curso' },
        ],
      },
      '2026-12': {
        monthKey: '2026-12',
        monthLabel: 'Diciembre 2026',
        assignedHours: 25,
        totalPercent: 13,
        availableHours: 161,
        availablePercent: 87,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-06', title: 'Revisión Arquitectura Gasoductos', client: 'Enlace Operativo', hours: 25, allocationPercent: 13, status: 'Por Iniciar' },
        ],
      },
      '2027-01': {
        monthKey: '2027-01',
        monthLabel: 'Enero 2027',
        assignedHours: 20,
        totalPercent: 11,
        availableHours: 166,
        availablePercent: 89,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-06', title: 'Advisory Técnico C-Level', client: 'Enlace Operativo', hours: 20, allocationPercent: 11, status: 'Por Iniciar' },
        ],
      },
      '2027-02': {
        monthKey: '2027-02',
        monthLabel: 'Febrero 2027',
        assignedHours: 20,
        totalPercent: 11,
        availableHours: 166,
        availablePercent: 89,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
      '2027-03': {
        monthKey: '2027-03',
        monthLabel: 'Marzo 2027',
        assignedHours: 0,
        totalPercent: 0,
        availableHours: 186,
        availablePercent: 100,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
    },
  },
  {
    id: 'col-4',
    name: 'Juan Esteban Grateron Nuñez',
    role: 'AI Security & Tech Operations Manager',
    department: 'Tecnología e Innovación',
    avatarLetter: 'J',
    avatarColor: '#D97706',
    workSchedule: 'Semana LV - Dia',
    workingDays: 22,
    monthlyAvailableHours: 186,
    monthlyAllocations: {
      '2026-10': {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        assignedHours: 120,
        totalPercent: 65,
        availableHours: 66,
        availablePercent: 35,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-03', title: 'Hardening PCI-DSS Scoring Davinci', client: 'Enlace Operativo', hours: 70, allocationPercent: 38, status: 'En Curso' },
          { code: 'ACT-01', title: 'Certificación Ciberseguridad IoT', client: 'Keralty', hours: 50, allocationPercent: 27, status: 'En Curso' },
        ],
      },
      '2026-11': {
        monthKey: '2026-11',
        monthLabel: 'Noviembre 2026',
        assignedHours: 130,
        totalPercent: 70,
        availableHours: 56,
        availablePercent: 30,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-03', title: 'Validación Forense y Encriptación', client: 'Enlace Operativo', hours: 80, allocationPercent: 43, status: 'En Curso' },
          { code: 'ACT-01', title: 'Penetration Testing SCADA', client: 'Keralty', hours: 50, allocationPercent: 27, status: 'En Curso' },
        ],
      },
      '2026-12': {
        monthKey: '2026-12',
        monthLabel: 'Diciembre 2026',
        assignedHours: 80,
        totalPercent: 43,
        availableHours: 106,
        availablePercent: 57,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-03', title: 'Dictamen de Ciberseguridad Bancaria', client: 'Enlace Operativo', hours: 80, allocationPercent: 43, status: 'En Revisión' },
        ],
      },
      '2027-01': {
        monthKey: '2027-01',
        monthLabel: 'Enero 2027',
        assignedHours: 60,
        totalPercent: 32,
        availableHours: 126,
        availablePercent: 68,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-11', title: 'Arquitectura Segura Gasoductos', client: 'Enlace Operativo', hours: 60, allocationPercent: 32, status: 'Por Iniciar' },
        ],
      },
      '2027-02': {
        monthKey: '2027-02',
        monthLabel: 'Febrero 2027',
        assignedHours: 60,
        totalPercent: 32,
        availableHours: 126,
        availablePercent: 68,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
      '2027-03': {
        monthKey: '2027-03',
        monthLabel: 'Marzo 2027',
        assignedHours: 0,
        totalPercent: 0,
        availableHours: 186,
        availablePercent: 100,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
    },
  },
  {
    id: 'col-5',
    name: 'Mateo Londoño',
    role: 'Principal Solutions Architect',
    department: 'Tecnología e Innovación',
    avatarLetter: 'M',
    avatarColor: '#07B1C5',
    workSchedule: 'Semana LV - Dia',
    workingDays: 22,
    monthlyAvailableHours: 186,
    monthlyAllocations: {
      '2026-10': {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        assignedHours: 200,
        totalPercent: 108,
        availableHours: 0,
        availablePercent: 0,
        isOverload: true,
        isLimit: false,
        overloadPercent: 8,
        activities: [
          { code: 'ACT-01', title: 'Arquitectura Ingesta Edge SCADA', client: 'Keralty', hours: 80, allocationPercent: 43, status: 'En Curso' },
          { code: 'ACT-03', title: 'Pipeline Scoring <90ms', client: 'Enlace Operativo', hours: 80, allocationPercent: 43, status: 'En Curso' },
          { code: 'ACT-06', title: 'Sizing Databricks Clústeres', client: 'Enlace Operativo', hours: 40, allocationPercent: 22, status: 'En Curso' },
        ],
      },
      '2026-11': {
        monthKey: '2026-11',
        monthLabel: 'Noviembre 2026',
        assignedHours: 186,
        totalPercent: 100,
        availableHours: 0,
        availablePercent: 0,
        isOverload: false,
        isLimit: true,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-01', title: 'Pruebas Edge en Campo', client: 'Keralty', hours: 93, allocationPercent: 50, status: 'En Curso' },
          { code: 'ACT-03', title: 'Load Testing Scoring Rust', client: 'Enlace Operativo', hours: 93, allocationPercent: 50, status: 'En Curso' },
        ],
      },
      '2026-12': {
        monthKey: '2026-12',
        monthLabel: 'Diciembre 2026',
        assignedHours: 130,
        totalPercent: 70,
        availableHours: 56,
        availablePercent: 30,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-01', title: 'Handover Operativo Pozos', client: 'Keralty', hours: 65, allocationPercent: 35, status: 'En Revisión' },
          { code: 'ACT-03', title: 'Puesta en Marcha Scoring', client: 'Enlace Operativo', hours: 65, allocationPercent: 35, status: 'En Revisión' },
        ],
      },
      '2027-01': {
        monthKey: '2027-01',
        monthLabel: 'Enero 2027',
        assignedHours: 70,
        totalPercent: 38,
        availableHours: 116,
        availablePercent: 62,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-12', title: 'Preventa y Arquitectura Nueva', client: 'Keralty', hours: 70, allocationPercent: 38, status: 'Por Iniciar' },
        ],
      },
      '2027-02': {
        monthKey: '2027-02',
        monthLabel: 'Febrero 2027',
        assignedHours: 80,
        totalPercent: 43,
        availableHours: 106,
        availablePercent: 57,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
      '2027-03': {
        monthKey: '2027-03',
        monthLabel: 'Marzo 2027',
        assignedHours: 40,
        totalPercent: 22,
        availableHours: 146,
        availablePercent: 78,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
    },
  },
  {
    id: 'col-6',
    name: 'Daniela Pineda',
    role: 'Senior MLOps & Data Engineer',
    department: 'Tecnología e Innovación',
    avatarLetter: 'D',
    avatarColor: '#2F7F61',
    workSchedule: 'Semana LV - Dia',
    workingDays: 22,
    monthlyAvailableHours: 186,
    monthlyAllocations: {
      '2026-10': {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        assignedHours: 195,
        totalPercent: 105,
        availableHours: 0,
        availablePercent: 0,
        isOverload: true,
        isLimit: false,
        overloadPercent: 5,
        activities: [
          { code: 'ACT-02', title: 'Modelo Predictivo Cavitación Pozos', client: 'Keralty', hours: 100, allocationPercent: 54, status: 'En Curso' },
          { code: 'ACT-03', title: 'Feature Store Bancario en Tiempo Real', client: 'Enlace Operativo', hours: 95, allocationPercent: 51, status: 'En Curso' },
        ],
      },
      '2026-11': {
        monthKey: '2026-11',
        monthLabel: 'Noviembre 2026',
        assignedHours: 175,
        totalPercent: 94,
        availableHours: 11,
        availablePercent: 6,
        isOverload: false,
        isLimit: true,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-02', title: 'Fine-Tuning Detección Desgaste', client: 'Keralty', hours: 95, allocationPercent: 51, status: 'En Curso' },
          { code: 'ACT-03', title: 'Calibración Inferencia <90ms', client: 'Enlace Operativo', hours: 80, allocationPercent: 43, status: 'En Curso' },
        ],
      },
      '2026-12': {
        monthKey: '2026-12',
        monthLabel: 'Diciembre 2026',
        assignedHours: 110,
        totalPercent: 59,
        availableHours: 76,
        availablePercent: 41,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-02', title: 'Despliegue Modelo Producción', client: 'Keralty', hours: 60, allocationPercent: 32, status: 'En Revisión' },
          { code: 'ACT-03', title: 'Validación Falsa Alarma Score', client: 'Enlace Operativo', hours: 50, allocationPercent: 27, status: 'En Revisión' },
        ],
      },
      '2027-01': {
        monthKey: '2027-01',
        monthLabel: 'Enero 2027',
        assignedHours: 70,
        totalPercent: 38,
        availableHours: 116,
        availablePercent: 62,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-13', title: 'Modelos de Grafos Fraude', client: 'Keralty', hours: 70, allocationPercent: 38, status: 'Por Iniciar' },
        ],
      },
      '2027-02': {
        monthKey: '2027-02',
        monthLabel: 'Febrero 2027',
        assignedHours: 90,
        totalPercent: 48,
        availableHours: 96,
        availablePercent: 52,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [
          { code: 'ACT-13', title: 'Modelos de Grafos Fraude', client: 'Keralty', hours: 90, allocationPercent: 48, status: 'Por Iniciar' },
        ],
      },
      '2027-03': {
        monthKey: '2027-03',
        monthLabel: 'Marzo 2027',
        assignedHours: 0,
        totalPercent: 0,
        availableHours: 186,
        availablePercent: 100,
        isOverload: false,
        isLimit: false,
        overloadPercent: 0,
        activities: [],
      },
    },
  },
];

export const INITIAL_ACTIVITIES: ProjectActivity[] = [
  {
    id: 'act-101',
    code: 'ACT-01',
    projectId: 'prj-1',
    projectName: 'Plataforma de IA & Analítica Predictiva en Salud',
    client: 'Keralty',
    activityTitle: 'Arquitectura de Ingesta & Conectividad Clínica Keralty',
    taskDetails: 'Configuración de gateways industriales OPC-UA y buffer local MQTT para pozos de difícil conectividad.',
    tasks: [
      { id: 't-101-1', title: 'Configurar gateways industriales OPC-UA en 12 pozos piloto', completed: true },
      { id: 't-101-2', title: 'Buffer local MQTT y sincronización edge-to-cloud', completed: true },
      { id: 't-101-3', title: 'Pruebas de tolerancia a desconexión satelital', completed: false },
    ],
    assignedPerson: 'Luis Pardo Fonseca',
    assignedRole: 'CEO & Principal Architect',
    allocationPercent: 25,
    assignees: [
      { id: 'as-101-1', person: 'Luis Pardo Fonseca', role: 'CEO & Principal Architect', percent: 20 },
      { id: 'as-101-2', person: 'Daniela Pineda', role: 'Senior MLOps & Data Engineer', percent: 30 },
    ],
    progressPercent: 65,
    status: 'En Curso',
    startDate: '2026-09-01',
    endDate: '2026-11-15',
    additionalDate: '2026-10-25',
    estimatedHours: 24,
    loggedHours: 18,
    activeMonths: ['2026-10', '2026-11'],
  },
  {
    id: 'act-102',
    code: 'ACT-02',
    projectId: 'prj-1',
    projectName: 'Plataforma de IA & Analítica Predictiva en Salud',
    client: 'Keralty',
    activityTitle: 'Modelado Predictivo de Ocupación Hospitalaria & Urgencias',
    taskDetails: 'Entrenamiento de modelos con histórico de vibración y temperatura en turbomaquinaria.',
    tasks: [
      { id: 't-102-1', title: 'Limpieza y extracción de telemetría de vibración (2024-2026)', completed: true },
      { id: 't-102-2', title: 'Entrenamiento de algoritmos no supervisados de anomalías', completed: true },
      { id: 't-102-3', title: 'Despliegue del modelo en contenedor Triton sobre EKS', completed: false },
    ],
    assignedPerson: 'Daniela Pineda',
    assignedRole: 'Senior MLOps & Data Engineer',
    allocationPercent: 54,
    assignees: [
      { id: 'as-102-1', person: 'Daniela Pineda', role: 'Senior MLOps & Data Engineer', percent: 54 },
    ],
    progressPercent: 70,
    status: 'En Curso',
    startDate: '2026-10-01',
    endDate: '2026-12-20',
    additionalDate: '2026-11-10',
    estimatedHours: 100,
    loggedHours: 35,
    activeMonths: ['2026-10', '2026-11', '2026-12'],
  },
  {
    id: 'act-201',
    code: 'ACT-03',
    projectId: 'prj-2',
    projectName: 'Automatización & Motor de Liquidación de Seguridad Social',
    client: 'Enlace Operativo',
    activityTitle: 'Pipeline de Procesamiento de Planillas PILA en Tiempo Real',
    taskDetails: 'Orquestación de microservicios Rust/Go para cálculo de variables financieras en caliente sobre Lakehouse.',
    tasks: [
      { id: 't-201-1', title: 'Diseño de microservicio Rust de cálculo de features', completed: true },
      { id: 't-201-2', title: 'Integración con caché en memoria Redis Enterprise', completed: true },
      { id: 't-201-3', title: 'Prueba de carga con 10,000 req/seg en sandbox bancario', completed: false },
    ],
    assignedPerson: 'Mateo Londoño',
    assignedRole: 'Principal Solutions Architect',
    allocationPercent: 40,
    assignees: [
      { id: 'as-201-1', person: 'Mateo Londoño', role: 'Principal Solutions Architect', percent: 45 },
      { id: 'as-201-2', person: 'Andres Galindo Garcia', role: 'Delivery Manager', percent: 35 },
    ],
    progressPercent: 75,
    status: 'En Curso',
    startDate: '2026-09-20',
    endDate: '2026-12-10',
    additionalDate: '2026-11-05',
    estimatedHours: 80,
    loggedHours: 40,
    activeMonths: ['2026-10', '2026-11', '2026-12'],
  },
  {
    id: 'act-202',
    code: 'ACT-04',
    projectId: 'prj-3',
    projectName: 'Automatización & Motor de Liquidación de Seguridad Social',
    client: 'Enlace Operativo',
    activityTitle: 'Validación Automática de Aportes & Dispersión Bancaria',
    taskDetails: 'Formulación estocástica y modelo de programación no lineal para maximizar margen marginal en mercado mayorista.',
    tasks: [
      { id: 't-202-1', title: 'Modelo estocástico de precios de gas y agua XM', completed: true },
      { id: 't-202-2', title: 'Curvas de rendimiento térmico de turbinas de ciclo combinado', completed: true },
      { id: 't-202-3', title: 'Integración con despacho automático SCADA', completed: true },
    ],
    assignedPerson: 'Andres Galindo Garcia',
    assignedRole: 'Delivery Manager',
    allocationPercent: 32,
    assignees: [
      { id: 'as-202-1', person: 'Andres Galindo Garcia', role: 'Delivery Manager', percent: 32 },
    ],
    progressPercent: 100,
    status: 'Completado',
    startDate: '2026-09-25',
    endDate: '2026-12-15',
    additionalDate: '2026-10-12',
    estimatedHours: 60,
    loggedHours: 60,
    activeMonths: ['2026-10', '2026-11', '2026-12'],
  },
  {
    id: 'act-301',
    code: 'ACT-05',
    projectId: 'prj-4',
    projectName: 'Motor de Despacho Dinámico & Ruteo Inteligente',
    client: 'Telepizza',
    activityTitle: 'Simulador de Tiempos de Entrega & Asignación de Repartidores',
    taskDetails: 'Modelado fenomenológico del circuito de chancado y molienda autógena con retroalimentación en línea.',
    tasks: [
      { id: 't-301-1', title: 'Recolección de señales de potencia y granulometría', completed: false },
      { id: 't-301-2', title: 'Construcción del modelo matemático de desgaste de bolas', completed: false },
    ],
    assignedPerson: 'Alejandro Giraldo Loaiza',
    assignedRole: 'Mid Full Stack Engineer',
    allocationPercent: 35,
    assignees: [
      { id: 'as-301-1', person: 'Alejandro Giraldo Loaiza', role: 'Mid Full Stack Engineer', percent: 48 },
      { id: 'as-301-2', person: 'Mateo Londoño', role: 'Principal Solutions Architect', percent: 22 },
    ],
    progressPercent: 0,
    status: 'Por Iniciar',
    startDate: '2026-10-01',
    endDate: '2026-12-30',
    additionalDate: '2026-11-30',
    estimatedHours: 90,
    loggedHours: 0,
    activeMonths: ['2026-10', '2026-11', '2026-12'],
  },
  {
    id: 'act-401',
    code: 'ACT-06',
    projectId: 'prj-5',
    projectName: 'Motor de Despacho Dinámico & Ruteo Inteligente',
    client: 'Telepizza',
    activityTitle: 'Calibración de Algoritmo de Tiempos & Tracking de Tiendas',
    taskDetails: 'Análisis de pulsos de presión transitoria con sensores IoT acústicos en tramos de 80km.',
    tasks: [
      { id: 't-401-1', title: 'Calibración de transductores piezorresistivos', completed: true },
      { id: 't-401-2', title: 'Adquisición de firmas de presión en válvulas de bloqueo', completed: false },
      { id: 't-401-3', title: 'Entregable de reporte de desbalance volumétrico', completed: false },
    ],
    assignedPerson: 'Mateo Londoño',
    assignedRole: 'Principal Solutions Architect',
    allocationPercent: 35,
    assignees: [
      { id: 'as-401-1', person: 'Mateo Londoño', role: 'Principal Solutions Architect', percent: 35 },
    ],
    progressPercent: 30,
    status: 'Atrasado',
    startDate: '2026-08-15',
    endDate: '2026-09-25',
    additionalDate: '2026-09-20',
    estimatedHours: 85,
    loggedHours: 45,
    activeMonths: ['2026-09', '2026-10'],
  },
];
