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

export type ProjectContractType =
  | 'Proyecto Cerrado / Llave en mano'
  | 'Fee Mensual / Retainer'
  | 'Time & Materials / Bolsas de horas'
  | 'Staff Augmentation';

export type PriorityLevel = 'Alta' | 'Media' | 'Baja';

export interface CommercialCommitment {
  id: string;
  description: string;
  dueDate: string;
  assignee: string;
  completed: boolean;
}

export interface ClientOpportunity {
  id: string;
  code: string; // ID automático (ej: OPP-2026-01)
  createdAt: string;
  updatedAt: string;

  // 1. Empresa, mercado y origen
  companyName: string; // Razón Social / Empresa (Obligatorio)
  taxId: string; // NIT / Tax ID
  country: string; // País (Lista)
  city: string; // Ciudad (Dependiente de país)
  industry: IndustrySector; // Mercado / Sector
  subsector: string; // Subsector (ej. Upstream, Banca, Seguros, EPS)
  leadSource: string; // Procedencia / Lead Source (Referido, Outbound, Evento, Alianza, Inbound, Licitación)
  leadSourceDetail: string; // Detalle de procedencia
  accountType: 'Nueva cuenta' | 'Cliente actual'; // Cuenta nueva / existente
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

  // 3. Oportunidad comercial
  opportunityName: string; // Nombre de la oportunidad (Obligatorio)
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

  // 5. Cotización Enterprise
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
export type TaskStatus = 'Por Iniciar' | 'En Curso' | 'En Revisión' | 'Completado';

export interface ActivityTask {
  id: string;
  title: string;
  completed: boolean;
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
  allocationPercent: number; // % asignación
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
  'PetroAndina Exploración & Refinación',
  'Banco Davinci Corporativo',
  'TermoEnergía del Valle S.A. E.S.P.',
  'Gasoductos del Norte & Caribe',
  'Consorcio Minero Andino (CMA)',
  'Fiducia & Seguros del Pacífico',
  'Compañía Eléctrica Central',
  'Grupo Nutresa Corporativo',
];

export const SOLUTION_PRODUCTS = [
  'VOXI',
  'CHARLI',
  'SIDEKI',
  'MLOps, Modelos Predictivos & GenAI',
  'Databricks Lakehouse & Analytics',
  'Automatización de Procesos & Control Avanzado',
  'Gobernanza de Datos & PCI-DSS Security',
  'Cloud Architecture & FinOps',
];

export const CONTRACT_TYPES: ProjectContractType[] = [
  'Proyecto Cerrado / Llave en mano',
  'Fee Mensual / Retainer',
  'Time & Materials / Bolsas de horas',
  'Staff Augmentation',
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
    companyName: 'PetroAndina Exploración & Refinación',
    taxId: '800.198.423-1',
    country: 'Colombia',
    city: 'Barrancabermeja',
    industry: 'Oil & Gas',
    subsector: 'Upstream & Exploración',
    leadSource: 'Licitación Privada / RFP',
    leadSourceDetail: 'RFP Upstream Pozos No Convencionales 2026',
    accountType: 'Nueva cuenta',
    associatedPartner: 'AWS (Amazon Web Services)',
    contactName: 'Ing. Carlos Hernando Duque',
    contactRole: 'Gerente General de Operaciones Upstream',
    contactEmail: 'cduque@petroandina-ep.com',
    contactPhone: '+57 310 982 4410',
    economicBuyer: 'Dra. Patricia Salamanca',
    economicBuyerRole: 'VP de Finanzas & Abastecimiento',
    internalSponsor: 'Ing. Carlos Hernando Duque',
    technicalInfluencer: 'Mateo Londoño (Kognia)',
    relationshipLevel: 'Relación activa',
    opportunityName: 'Telemetría IoT en Pozos & Mantenimiento Predictivo',
    description: 'Ingesta IoT de 42 pozos en campo, arquitectura streaming edge-to-cloud y algoritmos predictivos de cavitación y fallas mecánicas.',
    solutionProducts: ['SIDEKI', 'MLOps, Modelos Predictivos & GenAI'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    estimatedValue: 285000,
    estimatedValueUsd: 285000,
    currency: 'USD',
    mrr: 12000,
    expectedCloseDate: '2026-10-25',
    startDate: '2026-11-01',
    durationMonths: 12,
    priority: 'Alta',
    stage: 'Negociación',
    probability: 80,
    owner: 'Camila Restrepo',
    techLead: 'Mateo Londoño',
    nextAction: 'Reunión de homologación de pólizas de cumplimiento con el comité jurídico',
    nextActionDone: false,
    nextActionDate: '2026-10-08',
    nextActionAssignee: 'Camila Restrepo',
    commitments: [
      {
        id: 'com-1-1',
        description: 'Enviar anexos de ciberseguridad y certificaciones ISO 27001',
        dueDate: '2026-10-02',
        assignee: 'Juan Esteban Grateron',
        completed: true,
      },
      {
        id: 'com-1-2',
        description: 'Reunión de homologación de pólizas de cumplimiento con el comité jurídico',
        dueDate: '2026-10-08',
        assignee: 'Camila Restrepo',
        completed: false,
      },
      {
        id: 'com-1-3',
        description: 'Firma de minuta de contrato marco y kickoff preliminar',
        dueDate: '2026-10-25',
        assignee: 'Camila Restrepo',
        completed: false,
      },
    ],
  },
  {
    id: 'moc-2',
    code: 'OPP-2026-02',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-28',
    companyName: 'Banco Davinci Corporativo',
    taxId: '900.512.784-8',
    country: 'Colombia',
    city: 'Bogotá',
    industry: 'Financiero & Fintech',
    subsector: 'Banca Corporativa',
    leadSource: 'Referido C-Level / Junta',
    leadSourceDetail: 'Referencia directa de Miembro de Junta Directiva',
    accountType: 'Cliente actual',
    associatedPartner: 'Databricks',
    contactName: 'Alejandro Valderrama',
    contactRole: 'Chief Risk Officer (CRO)',
    contactEmail: 'a.valderrama@davinci.com',
    contactPhone: '+57 312 405 1199',
    economicBuyer: 'Alejandro Valderrama',
    economicBuyerRole: 'Chief Risk Officer',
    internalSponsor: 'Dr. Fernando Lleras',
    technicalInfluencer: 'Andres Galindo Garcia',
    relationshipLevel: 'Sponsor',
    opportunityName: 'Motor de Decisión Crediticia en Tiempo Real (<90ms)',
    description: 'Modernización del pipeline de riesgo crediticio y scoring dinámico Pymes sobre arquitectura Lakehouse certificada PCI-DSS.',
    solutionProducts: ['Databricks Lakehouse & Analytics', 'MLOps, Modelos Predictivos & GenAI'],
    projectType: 'Fee Mensual / Retainer',
    estimatedValue: 210000,
    estimatedValueUsd: 210000,
    currency: 'USD',
    mrr: 17500,
    expectedCloseDate: '2026-11-15',
    startDate: '2026-11-20',
    durationMonths: 12,
    priority: 'Alta',
    stage: 'Propuesta',
    probability: 65,
    owner: 'Santiago Mendoza',
    techLead: 'Daniela Pineda',
    nextAction: 'Demostración de PoC en sandbox controlado con 500k transacciones',
    nextActionDone: true,
    nextActionDate: '2026-10-05',
    nextActionAssignee: 'Daniela Pineda',
    commitments: [
      {
        id: 'com-2-1',
        description: 'Demostración de PoC en sandbox controlado con 500k transacciones',
        dueDate: '2026-10-05',
        assignee: 'Daniela Pineda',
        completed: true,
      },
      {
        id: 'com-2-2',
        description: 'Entrega de propuesta económica refinada con esquema de licenciamiento Databricks',
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
    companyName: 'TermoEnergía del Valle S.A. E.S.P.',
    taxId: '890.312.901-2',
    country: 'Colombia',
    city: 'Cali',
    industry: 'Energía & Utilities',
    subsector: 'Generación Térmica',
    leadSource: 'Alianza con Partner Cloud',
    leadSourceDetail: 'Alianza Google Cloud Utilities',
    accountType: 'Cliente actual',
    associatedPartner: 'Google Cloud',
    contactName: 'Dra. Marcela Echeverri',
    contactRole: 'Directora de Despacho y Transmisión Eléctrica',
    contactEmail: 'mecheverri@termovalle.com.co',
    contactPhone: '+57 318 640 2218',
    economicBuyer: 'Ing. Rodrigo Holguín',
    economicBuyerRole: 'Presidente Ejecutivo',
    internalSponsor: 'Dra. Marcela Echeverri',
    technicalInfluencer: 'Luis Pardo Fonseca',
    relationshipLevel: 'Relación activa',
    opportunityName: 'Despacho Económico Predictivo & Optimización de Turbinas',
    description: 'Modelo estocástico de optimización térmica y despacho para subasta diaria en el mercado mayorista XM.',
    solutionProducts: ['Automatización de Procesos & Control Avanzado', 'MLOps, Modelos Predictivos & GenAI'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    estimatedValue: 195000,
    estimatedValueUsd: 195000,
    currency: 'USD',
    mrr: 8000,
    expectedCloseDate: '2026-09-15',
    startDate: '2026-09-20',
    durationMonths: 10,
    priority: 'Media',
    stage: 'Conversión',
    probability: 100,
    owner: 'Camila Restrepo',
    techLead: 'Luis Pardo Fonseca',
    nextAction: 'Kick-off Sprint 3 y entrega en ambiente de staging para ingenieros de despacho',
    nextActionDone: false,
    nextActionDate: '2026-10-12',
    nextActionAssignee: 'Luis Pardo Fonseca',
    commitments: [
      {
        id: 'com-3-1',
        description: 'Firma de acta de inicio y aprobación de arquitectura en Google Cloud',
        dueDate: '2026-09-20',
        assignee: 'Camila Restrepo',
        completed: true,
      },
      {
        id: 'com-3-2',
        description: 'Kick-off Sprint 3 y entrega en ambiente de staging para ingenieros de despacho',
        dueDate: '2026-10-12',
        assignee: 'Luis Pardo Fonseca',
        completed: false,
      },
    ],
  },
  {
    id: 'moc-4',
    code: 'OPP-2026-04',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-29',
    companyName: 'Gasoductos del Norte & Caribe',
    taxId: '805.992.110-4',
    country: 'Estados Unidos',
    city: 'Houston, TX',
    industry: 'Oil & Gas',
    subsector: 'Midstream & Transporte de Gas',
    leadSource: 'Outbound Ejecutivo',
    leadSourceDetail: 'Campaña ejecutiva Midstream Integrity USA',
    accountType: 'Nueva cuenta',
    associatedPartner: 'Microsoft Azure',
    contactName: 'Robert Vance',
    contactRole: 'VP of Midstream Asset Integrity',
    contactEmail: 'rvance@gnc-pipeline.com',
    contactPhone: '+1 713 550 4912',
    economicBuyer: 'Robert Vance',
    economicBuyerRole: 'VP of Asset Integrity',
    internalSponsor: 'Sarah Jenkins',
    technicalInfluencer: 'Luis Pardo Fonseca',
    relationshipLevel: 'Contactado',
    opportunityName: 'Detección Automatizada de Fugas por Presión Acústica',
    description: 'Monitoreo de 850 km de troncal de gas mediante fibra óptica acústica y analítica computacional para integridad estructural.',
    solutionProducts: ['VOXI', 'Databricks Lakehouse & Analytics'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    estimatedValue: 340000,
    estimatedValueUsd: 340000,
    currency: 'USD',
    mrr: 15000,
    expectedCloseDate: '2026-12-10',
    startDate: '2027-01-15',
    durationMonths: 14,
    priority: 'Alta',
    stage: 'Discovery',
    probability: 35,
    owner: 'Laura Villamizar',
    techLead: 'Mateo Londoño',
    nextAction: 'Taller virtual de levantamiento de arquitectura de sensores SCADA actuales',
    nextActionDone: false,
    nextActionDate: '2026-10-15',
    nextActionAssignee: 'Laura Villamizar',
    commitments: [
      {
        id: 'com-4-1',
        description: 'Taller virtual de levantamiento de arquitectura de sensores SCADA actuales',
        dueDate: '2026-10-15',
        assignee: 'Laura Villamizar',
        completed: false,
      },
    ],
  },
  {
    id: 'moc-5',
    code: 'OPP-2026-05',
    createdAt: '2026-08-10',
    updatedAt: '2026-09-27',
    companyName: 'Consorcio Minero Andino (CMA)',
    taxId: '901.442.880-9',
    country: 'Perú',
    city: 'Arequipa',
    industry: 'Minería & Metales',
    subsector: 'Cobre & Concentrados',
    leadSource: 'Referido C-Level / Junta',
    leadSourceDetail: 'Alumni Harvard Business School',
    accountType: 'Nueva cuenta',
    associatedPartner: 'AWS (Amazon Web Services)',
    contactName: 'Ing. Rodrigo Benavides',
    contactRole: 'Superintendente de Automatización y Molienda',
    contactEmail: 'rbenavides@cmaperu.pe',
    contactPhone: '+51 984 210 933',
    economicBuyer: 'Ing. Javier Miró Quesada',
    economicBuyerRole: 'Gerente General de Mina',
    internalSponsor: 'Ing. Rodrigo Benavides',
    technicalInfluencer: 'Alejandro Giraldo Loaiza',
    relationshipLevel: 'Relación activa',
    opportunityName: 'Gemelo Digital de Molienda SAG & Control Avanzado',
    description: 'Simulación metalúrgica en tiempo real para optimizar tonelaje procesado y rendimiento de molienda.',
    solutionProducts: ['Automatización de Procesos & Control Avanzado', 'Databricks Lakehouse & Analytics'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    estimatedValue: 220000,
    estimatedValueUsd: 220000,
    currency: 'USD',
    mrr: 10000,
    expectedCloseDate: '2026-11-30',
    startDate: '2026-12-05',
    durationMonths: 12,
    priority: 'Alta',
    stage: 'Propuesta',
    probability: 55,
    owner: 'Santiago Mendoza',
    techLead: 'Alejandro Giraldo Loaiza',
    nextAction: 'Visita técnica a faena minera en Arequipa para muestreo y calibración de telemetría',
    nextActionDone: false,
    nextActionDate: '2026-10-20',
    nextActionAssignee: 'Alejandro Giraldo Loaiza',
    commitments: [
      {
        id: 'com-5-1',
        description: 'Visita técnica a faena minera en Arequipa para calibración de telemetría',
        dueDate: '2026-10-20',
        assignee: 'Alejandro Giraldo Loaiza',
        completed: false,
      },
    ],
  },
  {
    id: 'moc-6',
    code: 'OPP-2026-06',
    createdAt: '2026-08-25',
    updatedAt: '2026-09-26',
    companyName: 'Fiducia & Seguros del Pacífico',
    taxId: '860.119.043-5',
    country: 'Chile',
    city: 'Santiago',
    industry: 'Financiero & Fintech',
    subsector: 'Seguros Generales & Vida',
    leadSource: 'Inbound / Web Corporativa',
    leadSourceDetail: 'Formulario web de contacto corporativo',
    accountType: 'Nueva cuenta',
    associatedPartner: 'Snowflake',
    contactName: 'Catalina Gómez Lira',
    contactRole: 'Gerente de Transformación e Inteligencia de Negocios',
    contactEmail: 'cgomez@fiduciapacifico.cl',
    contactPhone: '+56 9 7712 3301',
    economicBuyer: 'Alonso Hurtado',
    economicBuyerRole: 'Vicepresidente de Operaciones',
    internalSponsor: 'Catalina Gómez Lira',
    technicalInfluencer: 'Luis Pardo Fonseca',
    relationshipLevel: 'Relación inicial',
    opportunityName: 'Detección de Fraude en Siniestros con Grafos & IA',
    description: 'Grafo de conocimiento para identificación de patrones colusivos entre asegurados, talleres y liquidadores.',
    solutionProducts: ['MLOps, Modelos Predictivos & GenAI', 'Databricks Lakehouse & Analytics'],
    projectType: 'Time & Materials / Bolsas de horas',
    estimatedValue: 145000,
    estimatedValueUsd: 145000,
    currency: 'USD',
    mrr: 6500,
    expectedCloseDate: '2027-01-20',
    startDate: '2027-02-01',
    durationMonths: 6,
    priority: 'Media',
    stage: 'Discovery',
    probability: 40,
    owner: 'Laura Villamizar',
    techLead: 'Daniela Pineda',
    nextAction: 'Demo de análisis de grafos y visualización de nodos sospechosos con datos anonimizados',
    nextActionDone: false,
    nextActionDate: '2026-10-18',
    nextActionAssignee: 'Daniela Pineda',
    commitments: [
      {
        id: 'com-6-1',
        description: 'Demo de análisis de grafos y visualización de nodos sospechosos con datos anonimizados',
        dueDate: '2026-10-18',
        assignee: 'Daniela Pineda',
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
          { code: 'ACT-05', title: 'Gemelo Digital Molienda SAG', client: 'Consorcio Minero', hours: 90, allocationPercent: 48, status: 'En Curso' },
          { code: 'ACT-07', title: 'Frontend Componentes de Telemetría', client: 'PetroAndina', hours: 60, allocationPercent: 33, status: 'Por Iniciar' },
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
          { code: 'ACT-05', title: 'Gemelo Digital Molienda SAG', client: 'Consorcio Minero', hours: 100, allocationPercent: 54, status: 'En Curso' },
          { code: 'ACT-07', title: 'Frontend Componentes de Telemetría', client: 'PetroAndina', hours: 60, allocationPercent: 32, status: 'En Curso' },
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
          { code: 'ACT-05', title: 'Gemelo Digital Molienda SAG', client: 'Consorcio Minero', hours: 70, allocationPercent: 38, status: 'En Revisión' },
          { code: 'ACT-07', title: 'Pruebas Integrales UI', client: 'PetroAndina', hours: 40, allocationPercent: 21, status: 'Por Iniciar' },
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
          { code: 'ACT-08', title: 'Soporte y Garantía Post-Lanzamiento', client: 'PetroAndina', hours: 60, allocationPercent: 32, status: 'Por Iniciar' },
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
          { code: 'ACT-09', title: 'Bolsa Soporte Molienda', client: 'Consorcio Minero', hours: 40, allocationPercent: 21, status: 'Por Iniciar' },
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
          { code: 'ACT-03', title: 'Scoring <90ms Delivery & Scrum', client: 'Banco Davinci', hours: 85, allocationPercent: 46, status: 'En Curso' },
          { code: 'ACT-04', title: 'Despacho Predictivo Coordinación', client: 'TermoEnergía', hours: 60, allocationPercent: 32, status: 'En Curso' },
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
          { code: 'ACT-03', title: 'Scoring <90ms Delivery & Scrum', client: 'Banco Davinci', hours: 95, allocationPercent: 51, status: 'En Curso' },
          { code: 'ACT-04', title: 'Despacho Predictivo Coordinación', client: 'TermoEnergía', hours: 60, allocationPercent: 32, status: 'En Curso' },
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
          { code: 'ACT-03', title: 'Cierre Proyecto Scoring Davinci', client: 'Banco Davinci', hours: 60, allocationPercent: 32, status: 'En Revisión' },
          { code: 'ACT-04', title: 'Entrega Fase 1 TermoEnergía', client: 'TermoEnergía', hours: 40, allocationPercent: 22, status: 'En Revisión' },
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
          { code: 'ACT-10', title: 'Kickoff Gestión Gasoductos Norte', client: 'Gasoductos Norte', hours: 50, allocationPercent: 27, status: 'Por Iniciar' },
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
          { code: 'ACT-10', title: 'Seguimiento Proyecto Gasoductos', client: 'Gasoductos Norte', hours: 80, allocationPercent: 43, status: 'Por Iniciar' },
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
          { code: 'ACT-10', title: 'Seguimiento Proyecto Gasoductos', client: 'Gasoductos Norte', hours: 80, allocationPercent: 43, status: 'Por Iniciar' },
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
          { code: 'ACT-01', title: 'Comité Arquitectura SCADA Pozos', client: 'PetroAndina', hours: 24, allocationPercent: 13, status: 'En Curso' },
          { code: 'ACT-04', title: 'Validación Modelo Estocástico', client: 'TermoEnergía', hours: 30, allocationPercent: 16, status: 'En Curso' },
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
          { code: 'ACT-01', title: 'Homologación Seguridad Industrial', client: 'PetroAndina', hours: 20, allocationPercent: 11, status: 'En Curso' },
          { code: 'ACT-04', title: 'Cierre Algorítmico XM', client: 'TermoEnergía', hours: 20, allocationPercent: 11, status: 'En Curso' },
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
          { code: 'ACT-06', title: 'Revisión Arquitectura Gasoductos', client: 'Gasoductos Norte', hours: 25, allocationPercent: 13, status: 'Por Iniciar' },
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
          { code: 'ACT-06', title: 'Advisory Técnico C-Level', client: 'Gasoductos Norte', hours: 20, allocationPercent: 11, status: 'Por Iniciar' },
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
          { code: 'ACT-03', title: 'Hardening PCI-DSS Scoring Davinci', client: 'Banco Davinci', hours: 70, allocationPercent: 38, status: 'En Curso' },
          { code: 'ACT-01', title: 'Certificación Ciberseguridad IoT', client: 'PetroAndina', hours: 50, allocationPercent: 27, status: 'En Curso' },
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
          { code: 'ACT-03', title: 'Auditoría Forense y Encriptación', client: 'Banco Davinci', hours: 80, allocationPercent: 43, status: 'En Curso' },
          { code: 'ACT-01', title: 'Penetration Testing SCADA', client: 'PetroAndina', hours: 50, allocationPercent: 27, status: 'En Curso' },
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
          { code: 'ACT-03', title: 'Dictamen de Ciberseguridad Bancaria', client: 'Banco Davinci', hours: 80, allocationPercent: 43, status: 'En Revisión' },
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
          { code: 'ACT-11', title: 'Arquitectura Segura Gasoductos', client: 'Gasoductos Norte', hours: 60, allocationPercent: 32, status: 'Por Iniciar' },
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
          { code: 'ACT-01', title: 'Arquitectura Ingesta Edge SCADA', client: 'PetroAndina', hours: 80, allocationPercent: 43, status: 'En Curso' },
          { code: 'ACT-03', title: 'Pipeline Scoring <90ms', client: 'Banco Davinci', hours: 80, allocationPercent: 43, status: 'En Curso' },
          { code: 'ACT-06', title: 'Sizing Databricks Clústeres', client: 'Banco Davinci', hours: 40, allocationPercent: 22, status: 'En Curso' },
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
          { code: 'ACT-01', title: 'Pruebas Edge en Campo', client: 'PetroAndina', hours: 93, allocationPercent: 50, status: 'En Curso' },
          { code: 'ACT-03', title: 'Load Testing Scoring Rust', client: 'Banco Davinci', hours: 93, allocationPercent: 50, status: 'En Curso' },
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
          { code: 'ACT-01', title: 'Handover Operativo Pozos', client: 'PetroAndina', hours: 65, allocationPercent: 35, status: 'En Revisión' },
          { code: 'ACT-03', title: 'Puesta en Marcha Scoring', client: 'Banco Davinci', hours: 65, allocationPercent: 35, status: 'En Revisión' },
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
          { code: 'ACT-12', title: 'Preventa y Arquitectura Nueva', client: 'Fiducia Pacífico', hours: 70, allocationPercent: 38, status: 'Por Iniciar' },
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
          { code: 'ACT-02', title: 'Modelo Predictivo Cavitación Pozos', client: 'PetroAndina', hours: 100, allocationPercent: 54, status: 'En Curso' },
          { code: 'ACT-03', title: 'Feature Store Bancario en Tiempo Real', client: 'Banco Davinci', hours: 95, allocationPercent: 51, status: 'En Curso' },
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
          { code: 'ACT-02', title: 'Fine-Tuning Detección Desgaste', client: 'PetroAndina', hours: 95, allocationPercent: 51, status: 'En Curso' },
          { code: 'ACT-03', title: 'Calibración Inferencia <90ms', client: 'Banco Davinci', hours: 80, allocationPercent: 43, status: 'En Curso' },
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
          { code: 'ACT-02', title: 'Despliegue Modelo Producción', client: 'PetroAndina', hours: 60, allocationPercent: 32, status: 'En Revisión' },
          { code: 'ACT-03', title: 'Validación Falsa Alarma Score', client: 'Banco Davinci', hours: 50, allocationPercent: 27, status: 'En Revisión' },
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
          { code: 'ACT-13', title: 'Modelos de Grafos Fraude', client: 'Fiducia Pacífico', hours: 70, allocationPercent: 38, status: 'Por Iniciar' },
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
          { code: 'ACT-13', title: 'Modelos de Grafos Fraude', client: 'Fiducia Pacífico', hours: 90, allocationPercent: 48, status: 'Por Iniciar' },
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
    projectName: 'Plataforma IoT & Telemetría en Pozos Upstream',
    client: 'PetroAndina Exploración & Refinación',
    activityTitle: 'Arquitectura de Ingesta Edge y Conexión SCADA Pozos',
    taskDetails: 'Configuración de gateways industriales OPC-UA y buffer local MQTT para pozos de difícil conectividad.',
    tasks: [
      { id: 't-101-1', title: 'Configurar gateways industriales OPC-UA en 12 pozos piloto', completed: true },
      { id: 't-101-2', title: 'Buffer local MQTT y sincronización edge-to-cloud', completed: true },
      { id: 't-101-3', title: 'Pruebas de tolerancia a desconexión satelital', completed: false },
    ],
    assignedPerson: 'Luis Pardo Fonseca',
    assignedRole: 'CEO & Principal Architect',
    allocationPercent: 13,
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
    projectName: 'Plataforma IoT & Telemetría en Pozos Upstream',
    client: 'PetroAndina Exploración & Refinación',
    activityTitle: 'Modelado Predictivo de Cavitación y Desgaste en Bombas',
    taskDetails: 'Entrenamiento de modelos con histórico de vibración y temperatura en turbomaquinaria.',
    tasks: [
      { id: 't-102-1', title: 'Limpieza y extracción de telemetría de vibración (2024-2026)', completed: true },
      { id: 't-102-2', title: 'Entrenamiento de algoritmos no supervisados de anomalías', completed: true },
      { id: 't-102-3', title: 'Despliegue del modelo en contenedor Triton sobre EKS', completed: false },
    ],
    assignedPerson: 'Daniela Pineda',
    assignedRole: 'Senior MLOps & Data Engineer',
    allocationPercent: 54,
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
    projectName: 'Motor de Riesgo Crediticio en Tiempo Real (<90ms)',
    client: 'Banco Davinci Corporativo',
    activityTitle: 'Pipeline de Scoring Online en Baja Latencia (<90ms)',
    taskDetails: 'Orquestación de microservicios Rust/Go para cálculo de variables financieras en caliente sobre Lakehouse.',
    tasks: [
      { id: 't-201-1', title: 'Diseño de microservicio Rust de cálculo de features', completed: true },
      { id: 't-201-2', title: 'Integración con caché en memoria Redis Enterprise', completed: true },
      { id: 't-201-3', title: 'Prueba de carga con 10,000 req/seg en sandbox bancario', completed: false },
    ],
    assignedPerson: 'Mateo Londoño',
    assignedRole: 'Principal Solutions Architect',
    allocationPercent: 43,
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
    projectName: 'Despacho Económico Predictivo & Turbinas',
    client: 'TermoEnergía del Valle S.A. E.S.P.',
    activityTitle: 'Algoritmo de Optimización Térmica y Subasta Diaria XM',
    taskDetails: 'Formulación estocástica y modelo de programación no lineal para maximizar margen marginal en mercado mayorista.',
    tasks: [
      { id: 't-202-1', title: 'Modelo estocástico de precios de gas y agua XM', completed: true },
      { id: 't-202-2', title: 'Curvas de rendimiento térmico de turbinas de ciclo combinado', completed: true },
      { id: 't-202-3', title: 'Integración con despacho automático SCADA', completed: true },
    ],
    assignedPerson: 'Andres Galindo Garcia',
    assignedRole: 'Delivery Manager',
    allocationPercent: 32,
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
    projectName: 'Gemelo Digital de Molienda SAG & Control Avanzado',
    client: 'Consorcio Minero Andino (CMA)',
    activityTitle: 'Simulador Metalúrgico en Tiempo Real y Telemetría',
    taskDetails: 'Modelado fenomenológico del circuito de chancado y molienda autógena con retroalimentación en línea.',
    tasks: [
      { id: 't-301-1', title: 'Recolección de señales de potencia y granulometría', completed: false },
      { id: 't-301-2', title: 'Construcción del modelo matemático de desgaste de bolas', completed: false },
    ],
    assignedPerson: 'Alejandro Giraldo Loaiza',
    assignedRole: 'Mid Full Stack Engineer',
    allocationPercent: 48,
    progressPercent: 0,
    status: 'Por Iniciar',
    startDate: '2026-10-01',
    endDate: '2026-12-30',
    additionalDate: '2026-11-30',
    estimatedHours: 90,
    loggedHours: 0,
    activeMonths: ['2026-10', '2026-11', '2026-12'],
  },
];
