import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  BarChart3,
  Plus,
  Search,
  SlidersHorizontal,
  DollarSign,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Briefcase,
  UserCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  X,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Tag,
  Trash2,
  Edit3,
  PieChart,
  FileSpreadsheet,
  Upload,
  Download,
  Paperclip,
} from 'lucide-react';
import {
  ClientOpportunity,
  MocStage,
  IndustrySector,
  CommercialCommitment,
  COUNTRIES,
  COUNTRY_CITIES,
  SECTORS,
  SUBSECTORS,
  LEAD_SOURCES,
  PARTNERS,
  SOLUTION_PRODUCTS,
  CONTRACT_TYPES,
  STAGES,
  OWNERS,
  TECH_LEADS,
  RelationshipLevel,
  ProjectContractType,
  PriorityLevel,
} from '../data/kogniaData';

interface MocModuleProps {
  clients: ClientOpportunity[];
  onSaveClient: (client: ClientOpportunity, isNew: boolean) => void;
  onQuickChangeStage: (clientId: string, newStage: MocStage) => void;
}

type MocSubTab = 'tabla' | 'dashboard';

export const MocModule: React.FC<MocModuleProps> = ({
  clients,
  onSaveClient,
  onQuickChangeStage,
}) => {
  const [activeTab, setActiveTab] = useState<MocSubTab>('tabla');

  // Form Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formSection, setFormSection] = useState<
    'empresa' | 'contactos' | 'oportunidad' | 'compromisos' | 'cotizacion'
  >('empresa');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Filters for Table
  const [tableSearch, setTableSearch] = useState('');
  const [tableSector, setTableSector] = useState('Todos');
  const [tableStage, setTableStage] = useState('Todos');
  const [tableCountry, setTableCountry] = useState('Todos');

  // Filters for Dashboard Gerencial
  const [dashCountry, setDashCountry] = useState('Todos');
  const [dashStage, setDashStage] = useState('Todos');
  const [dashOwner, setDashOwner] = useState('Todos');
  const [dashSector, setDashSector] = useState('Todos');

  // Currency formatter
  const formatCurrency = (val: number, cur: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur || 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Default Form State
  const getInitialFormData = (): Omit<ClientOpportunity, 'id' | 'createdAt' | 'updatedAt'> => ({
    code: `OPP-2026-${String(clients.length + 1).padStart(2, '0')}`,
    companyName: '',
    taxId: '',
    country: 'Colombia',
    city: 'Bogotá',
    industry: 'Oil & Gas',
    subsector: 'Upstream & Exploración',
    leadSource: 'Referido C-Level / Junta',
    leadSourceDetail: '',
    accountType: 'Nueva cuenta',
    associatedPartner: 'AWS (Amazon Web Services)',
    associatedPartners: ['AWS (Amazon Web Services)'],
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    economicBuyer: '',
    economicBuyerRole: '',
    internalSponsor: '',
    technicalInfluencer: '',
    relationshipLevel: 'Relación activa',
    opportunityName: '',
    description: '',
    solutionProducts: ['VOXI', 'CHARLI'],
    projectType: 'Proyecto Cerrado / Llave en mano',
    stage: 'Discovery',
    probability: 40,
    currency: 'USD',
    estimatedValue: 150000,
    estimatedValueUsd: 150000,
    mrr: 8000,
    expectedCloseDate: '2026-11-30',
    startDate: '2026-12-01',
    durationMonths: 12,
    priority: 'Alta',
    owner: 'Camila Restrepo',
    techLead: 'Mateo Londoño',
    nextAction: 'Reunión de levantamiento técnico inicial',
    nextActionDone: false,
    nextActionDate: '2026-10-15',
    nextActionAssignee: 'Camila Restrepo',
    commitments: [
      {
        id: `com-init-${Date.now()}`,
        description: 'Reunión de levantamiento técnico inicial con el cliente',
        dueDate: '2026-10-15',
        assignee: 'Camila Restrepo',
        completed: false,
      },
    ],
    // 5. Cotización Enterprise
    quoteCode: `COT-2026-${String(clients.length + 1).padStart(2, '0')}`,
    quoteSetupPrice: 35000,
    quoteSalePrice: 150000,
    quoteCurrency: 'USD',
    quoteDescription: 'Implementación integral de plataforma empresarial, configuración de arquitectura en nube y despliegue de modelos analíticos.',
    quoteCommercialConditions: 'Forma de pago: 40% anticipo a la firma de contrato, 30% contra entrega de PoC en staging, 30% contra acta de entrega final. Validez de la oferta: 30 días calendario.',
    quoteStatus: 'Borrador' as const,
    quoteValidUntil: '2026-11-30',
    quoteAttachedFileName: '',
    quoteAttachedFileSize: '',
    quoteAttachedFileDate: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // New commitment input inside the form
  const [newCommitmentDesc, setNewCommitmentDesc] = useState('');
  const [newCommitmentDate, setNewCommitmentDate] = useState('2026-10-20');
  const [newCommitmentAssignee, setNewCommitmentAssignee] = useState('Camila Restrepo');

  // Edit existing commitment state
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);
  const [editingCommitmentDesc, setEditingCommitmentDesc] = useState('');
  const [editingCommitmentDate, setEditingCommitmentDate] = useState('2026-10-25');
  const [editingCommitmentAssignee, setEditingCommitmentAssignee] = useState('Camila Restrepo');

  // Donut view mode state ('etapa' | 'sector')
  const [donutViewMode, setDonutViewMode] = useState<'etapa' | 'sector'>('etapa');

  // Handle open New Client
  const handleOpenNew = () => {
    setEditingClientId(null);
    setFormData(getInitialFormData());
    setFormSection('empresa');
    setSaveToast(null);
    setIsFormOpen(true);
  };

  // Handle open Edit Client
  const handleOpenEdit = (c: ClientOpportunity) => {
    setEditingClientId(c.id);
    const existingPartners = c.associatedPartners && c.associatedPartners.length > 0
      ? c.associatedPartners
      : c.associatedPartner
      ? c.associatedPartner.split(', ')
      : ['AWS (Amazon Web Services)'];

    setFormData({
      code: c.code,
      companyName: c.companyName,
      taxId: c.taxId || '',
      country: c.country || 'Colombia',
      city: c.city || 'Bogotá',
      industry: c.industry || 'Oil & Gas',
      subsector: c.subsector || '',
      leadSource: c.leadSource || 'Referido C-Level / Junta',
      leadSourceDetail: c.leadSourceDetail || '',
      accountType: c.accountType || 'Nueva cuenta',
      associatedPartner: c.associatedPartner || existingPartners.join(', '),
      associatedPartners: existingPartners,
      contactName: c.contactName || '',
      contactRole: c.contactRole || '',
      contactEmail: c.contactEmail || '',
      contactPhone: c.contactPhone || '',
      economicBuyer: c.economicBuyer || '',
      economicBuyerRole: c.economicBuyerRole || '',
      internalSponsor: c.internalSponsor || '',
      technicalInfluencer: c.technicalInfluencer || '',
      relationshipLevel: c.relationshipLevel || 'Relación activa',
      opportunityName: c.opportunityName,
      description: c.description || '',
      solutionProducts: c.solutionProducts?.length ? c.solutionProducts : ['VOXI', 'CHARLI'],
      projectType: c.projectType || 'Proyecto Cerrado / Llave en mano',
      stage: c.stage,
      probability: c.probability ?? 50,
      currency: c.currency || 'USD',
      estimatedValue: c.estimatedValue ?? c.estimatedValueUsd ?? 0,
      estimatedValueUsd: c.estimatedValue ?? c.estimatedValueUsd ?? 0,
      mrr: c.mrr || 0,
      expectedCloseDate: c.expectedCloseDate || '2026-11-30',
      startDate: c.startDate || '',
      durationMonths: c.durationMonths || 12,
      priority: c.priority || 'Alta',
      owner: c.owner || 'Camila Restrepo',
      techLead: c.techLead || 'Mateo Londoño',
      nextAction: c.nextAction || '',
      nextActionDone: Boolean(c.nextActionDone),
      nextActionDate: c.nextActionDate || '',
      nextActionAssignee: c.nextActionAssignee || c.owner || 'Camila Restrepo',
      commitments: c.commitments?.length
        ? c.commitments
        : [
            {
              id: `com-${Date.now()}`,
              description: c.nextAction || 'Seguimiento comercial',
              dueDate: c.nextActionDate || '2026-10-15',
              assignee: c.owner || 'Camila Restrepo',
              completed: Boolean(c.nextActionDone),
            },
          ],
      // 5. Cotización
      quoteCode: c.quoteCode || `COT-2026-${c.code.replace('OPP-2026-', '')}`,
      quoteSetupPrice: c.quoteSetupPrice ?? 35000,
      quoteSalePrice: c.quoteSalePrice ?? (c.estimatedValue || 150000),
      quoteCurrency: c.quoteCurrency || c.currency || 'USD',
      quoteDescription: c.quoteDescription || c.description || 'Implementación técnica y despliegue de arquitectura enterprise.',
      quoteCommercialConditions: c.quoteCommercialConditions || 'Forma de pago: 40% anticipo, 30% hito intermedio, 30% entrega final. Validez: 30 días.',
      quoteStatus: c.quoteStatus || (c.stage === 'Conversión' ? 'Aprobada' : c.stage === 'Negociación' ? 'En Negociación' : 'Enviada'),
      quoteValidUntil: c.quoteValidUntil || '2026-11-30',
      quoteAttachedFileName: c.quoteAttachedFileName || '',
      quoteAttachedFileSize: c.quoteAttachedFileSize || '',
      quoteAttachedFileDate: c.quoteAttachedFileDate || '',
    });
    setFormSection('empresa');
    setSaveToast(null);
    setIsFormOpen(true);
  };

  // Toggle Next Action Checkbox directly in the Table
  const handleToggleTableActionCheck = (c: ClientOpportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDone = !c.nextActionDone;
    const updatedCommitments = (c.commitments || []).map((com, idx) =>
      idx === 0 ? { ...com, completed: updatedDone } : com
    );
    const updated: ClientOpportunity = {
      ...c,
      nextActionDone: updatedDone,
      commitments: updatedCommitments,
      updatedAt: '2026-09-29',
    };
    onSaveClient(updated, false);
  };

  // Form Save
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setFormSection('empresa');
      setSaveToast('Ingresa la Razón Social / Empresa para continuar.');
      return;
    }
    if (!formData.contactName.trim() || !formData.contactEmail.trim()) {
      setFormSection('contactos');
      setSaveToast('Ingresa el Contacto Principal y su Email.');
      return;
    }
    if (!formData.opportunityName.trim()) {
      setFormSection('oportunidad');
      setSaveToast('Ingresa el Nombre de la Oportunidad Comercial.');
      return;
    }

    const isNew = !editingClientId;
    const clientRecord: ClientOpportunity = {
      id: isNew ? `moc-${Date.now()}` : editingClientId,
      code: formData.code,
      createdAt: isNew ? '2026-09-29' : clients.find((c) => c.id === editingClientId)?.createdAt || '2026-09-29',
      updatedAt: '2026-09-29',
      ...formData,
      estimatedValue: Number(formData.estimatedValue) || 0,
      estimatedValueUsd: Number(formData.estimatedValue) || 0,
      mrr: Number(formData.mrr) || 0,
      probability: Number(formData.probability) || 0,
    };

    onSaveClient(clientRecord, isNew);
    setSaveToast(`Oportunidad "${clientRecord.companyName}" guardada correctamente.`);
    setTimeout(() => {
      setIsFormOpen(false);
      setSaveToast(null);
    }, 600);
  };

  // Add commitment in the form
  const handleAddCommitment = () => {
    if (!newCommitmentDesc.trim()) return;
    const newCom: CommercialCommitment = {
      id: `com-${Date.now()}`,
      description: newCommitmentDesc.trim(),
      dueDate: newCommitmentDate,
      assignee: newCommitmentAssignee,
      completed: false,
    };
    const updated = [...formData.commitments, newCom];
    setFormData((prev) => ({
      ...prev,
      commitments: updated,
      nextAction: prev.nextAction || newCom.description,
      nextActionDate: prev.nextActionDate || newCom.dueDate,
      nextActionAssignee: prev.nextActionAssignee || newCom.assignee,
    }));
    setNewCommitmentDesc('');
  };

  // Toggle commitment in the form
  const handleToggleFormCommitment = (comId: string) => {
    const updated = formData.commitments.map((com) =>
      com.id === comId ? { ...com, completed: !com.completed } : com
    );
    // Sync first commitment with nextActionDone
    const firstCom = updated[0];
    setFormData((prev) => ({
      ...prev,
      commitments: updated,
      nextActionDone: firstCom ? firstCom.completed : prev.nextActionDone,
    }));
  };

  // Remove commitment
  const handleRemoveCommitment = (comId: string) => {
    setFormData((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c) => c.id !== comId),
    }));
    if (editingCommitmentId === comId) {
      setEditingCommitmentId(null);
    }
  };

  // Start editing commitment
  const handleStartEditCommitment = (com: CommercialCommitment) => {
    setEditingCommitmentId(com.id);
    setEditingCommitmentDesc(com.description);
    setEditingCommitmentDate(com.dueDate);
    setEditingCommitmentAssignee(com.assignee);
  };

  // Save edited commitment
  const handleSaveEditCommitment = () => {
    if (!editingCommitmentId || !editingCommitmentDesc.trim()) return;
    setFormData((prev) => {
      const updated = prev.commitments.map((c) =>
        c.id === editingCommitmentId
          ? {
              ...c,
              description: editingCommitmentDesc.trim(),
              dueDate: editingCommitmentDate,
              assignee: editingCommitmentAssignee,
            }
          : c
      );
      const first = updated[0];
      return {
        ...prev,
        commitments: updated,
        nextAction: first ? first.description : prev.nextAction,
        nextActionDate: first ? first.dueDate : prev.nextActionDate,
        nextActionAssignee: first ? first.assignee : prev.nextActionAssignee,
      };
    });
    setEditingCommitmentId(null);
  };

  // Cancel edit commitment
  const handleCancelEditCommitment = () => {
    setEditingCommitmentId(null);
  };

  // Filtered clients for Table View
  const filteredTableClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSector = tableSector === 'Todos' || c.industry === tableSector;
      const matchStage = tableStage === 'Todos' || c.stage === tableStage;
      const matchCountry = tableCountry === 'Todos' || c.country === tableCountry;
      const q = tableSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.opportunityName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q);
      return matchSector && matchStage && matchCountry && matchSearch;
    });
  }, [clients, tableSector, tableStage, tableCountry, tableSearch]);

  // Filtered clients for Dashboard View
  const filteredDashClients = useMemo(() => {
    return clients.filter((c) => {
      const matchCountry = dashCountry === 'Todos' || c.country === dashCountry;
      const matchStage = dashStage === 'Todos' || c.stage === dashStage;
      const matchOwner = dashOwner === 'Todos' || c.owner === dashOwner;
      const matchSector = dashSector === 'Todos' || c.industry === dashSector;
      return matchCountry && matchStage && matchOwner && matchSector;
    });
  }, [clients, dashCountry, dashStage, dashOwner, dashSector]);

  // Dashboard Aggregates (Strictly managerial, NO forecast ponderado card!)
  const dashMetrics = useMemo(() => {
    const list = filteredDashClients;
    const totalPipeline = list.reduce(
      (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
      0
    );
    const wonList = list.filter((c) => c.stage === 'Conversión' || c.stage === 'Ganada (Cliente Activo)');
    const wonValue = wonList.reduce(
      (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
      0
    );
    const winRate = list.length > 0 ? Math.round((wonList.length / list.length) * 100) : 0;
    const avgTicket = list.length > 0 ? Math.round(totalPipeline / list.length) : 0;
    const totalMrr = list.reduce((acc, c) => acc + (c.mrr || 0), 0);
    const newAccountsCount = list.filter((c) => c.accountType === 'Nueva cuenta').length;
    const newAccountsShare = list.length > 0 ? Math.round((newAccountsCount / list.length) * 100) : 0;

    // Breakdown by Country
    const countriesPresent = Array.from(new Set(list.map((c) => c.country || 'Colombia')));
    const byCountry = countriesPresent
      .map((country) => {
        const countryDeals = list.filter((c) => (c.country || 'Colombia') === country);
        const val = countryDeals.reduce(
          (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
          0
        );
        const pct = totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0;
        return { country, count: countryDeals.length, value: val, pct };
      })
      .sort((a, b) => b.value - a.value);

    // Breakdown by Stage / Funnel
    const byStage = STAGES.map((st) => {
      const stageDeals = list.filter((c) => c.stage === st);
      const val = stageDeals.reduce(
        (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
        0
      );
      const pct = totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0;
      return { stage: st, count: stageDeals.length, value: val, pct };
    }).filter((s) => s.count > 0 || s.stage === 'Conversión');

    // Dedicated Super Embudo Stages (Sequential Progression: Discovery -> Propuesta -> Negociación -> Conversión)
    const funnelStageKeys: MocStage[] = [
      'Discovery',
      'Propuesta',
      'Negociación',
      'Conversión',
    ];

    const superFunnel = funnelStageKeys.map((st, idx) => {
      const stageDeals = list.filter((c) => c.stage === st);
      const val = stageDeals.reduce(
        (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
        0
      );
      const pct = totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0;
      return {
        step: idx + 1,
        stage: st,
        count: stageDeals.length,
        value: val,
        pct,
        deals: stageDeals,
      };
    });

    const standbyDeals = list.filter((c) => c.stage === 'En Standby');
    const standbyValue = standbyDeals.reduce(
      (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
      0
    );

    const lostDeals = list.filter((c) => c.stage === 'Perdida');
    const lostValue = lostDeals.reduce(
      (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
      0
    );

    // Breakdown by Owner
    const ownersPresent = Array.from(new Set(list.map((c) => c.owner)));
    const byOwner = ownersPresent
      .map((owner) => {
        const deals = list.filter((c) => c.owner === owner);
        const val = deals.reduce(
          (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
          0
        );
        const won = deals.filter((c) => c.stage === 'Conversión' || c.stage === 'Ganada (Cliente Activo)').length;
        const pct = totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0;
        return { owner, count: deals.length, value: val, won, pct };
      })
      .sort((a, b) => b.value - a.value);

    // Breakdown by Sector
    const sectorsPresent = Array.from(new Set(list.map((c) => c.industry)));
    const bySector = sectorsPresent
      .map((sector) => {
        const deals = list.filter((c) => c.industry === sector);
        const val = deals.reduce(
          (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
          0
        );
        const pct = totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0;
        return { sector, count: deals.length, value: val, pct };
      })
      .sort((a, b) => b.value - a.value);

    // Breakdown by Lead Source
    const sourcesPresent = Array.from(new Set(list.map((c) => c.leadSource || 'Referido')));
    const bySource = sourcesPresent
      .map((src) => {
        const deals = list.filter((c) => (c.leadSource || 'Referido') === src);
        const val = deals.reduce(
          (acc, c) => acc + (c.estimatedValue || c.estimatedValueUsd || 0),
          0
        );
        const pct = totalPipeline > 0 ? Math.round((val / totalPipeline) * 100) : 0;
        return { source: src, count: deals.length, value: val, pct };
      })
      .sort((a, b) => b.value - a.value);

    return {
      totalPipeline,
      wonValue,
      winRate,
      avgTicket,
      totalMrr,
      newAccountsCount,
      newAccountsShare,
      dealsCount: list.length,
      wonDealsCount: wonList.length,
      byCountry,
      byStage,
      byOwner,
      bySector,
      bySource,
      superFunnel,
      standbyDeals,
      standbyValue,
      lostDeals,
      lostValue,
    };
  }, [filteredDashClients]);

  // Stage badge color helper
  const getStageBadgeStyle = (stage: MocStage) => {
    switch (stage) {
      case 'Conversión':
      case 'Ganada (Cliente Activo)':
        return 'bg-[#2F7F61]/15 text-[#2F7F61] border-[#2F7F61]/30';
      case 'Negociación':
      case 'Comité de Riesgos & Negociación':
        return 'bg-[#07B1C5]/15 text-[#0F2942] border-[#07B1C5]/40 font-semibold';
      case 'Propuesta':
      case 'Propuesta Técnica & Alcance':
        return 'bg-blue-500/10 text-blue-800 border-blue-300';
      case 'Discovery':
      case 'Calificación & Discovery':
        return 'bg-amber-500/10 text-amber-800 border-amber-300';
      case 'En Standby':
        return 'bg-purple-500/10 text-purple-800 border-purple-300';
      case 'Perdida':
        return 'bg-red-500/10 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-3.5 p-4 sm:p-5 max-w-[1700px] mx-auto">
      {/* =====================================================================
          SUB-NAVIGATION TABS (MOC)
      ===================================================================== */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-[#0F2942]/10 pb-3">
        <div>
          <h1 className="font-mono-tech text-base font-bold uppercase tracking-wider text-[#0F2942]">
            MOC
          </h1>
          <p className="font-mono-tech text-[10px] text-[#181B1E]/60">
            Maestro de Cuentas, Oportunidades &amp; Pipeline Comercial
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-white border border-[#0F2942]/10 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tabla')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'tabla'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-[#0F2942]/70 hover:text-[#0F2942]'
            }`}
          >
            <TableIcon className="h-3 w-3" />
            Tabla de Oportunidades
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-[#0F2942]/70 hover:text-[#0F2942]'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            Dashboard Gerencial
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: TABLA DE OPORTUNIDADES (DIRECTA, SIN KPI BANNER ARRIBA)
      ===================================================================== */}
      {activeTab === 'tabla' && (
        <div className="space-y-3">
          {/* Table Toolbar & Filters */}
          <div className="flex flex-col gap-2.5 rounded-xl bg-white border border-[#0F2942]/10 p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#181B1E]/40" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Buscar empresa, oportunidad..."
                  className="w-full rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 pl-7 pr-2.5 py-1 text-xs text-[#181B1E] focus:border-[#07B1C5] focus:outline-none"
                />
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">País:</span>
                <select
                  value={tableCountry}
                  onChange={(e) => setTableCountry(e.target.value)}
                  className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector Filter */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Sector:</span>
                <select
                  value={tableSector}
                  onChange={(e) => setTableSector(e.target.value)}
                  className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Filter */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Estado:</span>
                <select
                  value={tableStage}
                  onChange={(e) => setTableStage(e.target.value)}
                  className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  {STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* "+ Registrar Oportunidad" button */}
            <button
              type="button"
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5 text-[#07B1C5]" />
              <span>Registrar Oportunidad</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="rounded-xl bg-white border border-[#0F2942]/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 font-mono-tech text-[10px] text-[#0F2942]/70 uppercase">
                    <th className="py-2.5 pl-4 pr-2 font-medium">Cód.</th>
                    <th className="px-2.5 py-2.5 font-medium">Empresa &amp; Ubicación</th>
                    <th className="px-2.5 py-2.5 font-medium">Oportunidad &amp; Solución</th>
                    <th className="px-2.5 py-2.5 font-medium">Contactos Clave</th>
                    <th className="px-2.5 py-2.5 font-medium text-right">Valor Estimado &amp; Plazo</th>
                    <th className="px-2.5 py-2.5 font-medium">Estado</th>
                    <th className="px-2.5 py-2.5 font-medium">Responsable</th>
                    <th className="py-2.5 pl-2 pr-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F2942]/8 text-[11px]">
                  {filteredTableClients.map((client) => {
                    const estVal = client.estimatedValue ?? client.estimatedValueUsd ?? 0;
                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-[#F3F0EB]/40 transition-colors group cursor-pointer"
                        onClick={() => handleOpenEdit(client)}
                      >
                        {/* Code */}
                        <td className="py-2.5 pl-4 pr-2 font-mono-tech text-[10px] font-bold text-[#0F2942] whitespace-nowrap">
                          {client.code}
                        </td>

                        {/* Company & Country */}
                        <td className="px-2.5 py-2.5 max-w-[200px]">
                          <div className="font-semibold text-xs text-[#0F2942] truncate">
                            {client.companyName}
                          </div>
                          <div className="flex items-center gap-1 font-mono-tech text-[9px] text-[#181B1E]/60 truncate mt-0.5">
                            <MapPin className="h-2.5 w-2.5 text-[#07B1C5] shrink-0" />
                            <span>
                              {client.city}, {client.country}
                            </span>
                            <span className="text-[#181B1E]/30">·</span>
                            <span className="text-[#0F2942]/70 font-medium">{client.industry}</span>
                          </div>
                        </td>

                        {/* Opportunity & Scope */}
                        <td className="px-2.5 py-2.5 max-w-[240px]">
                          <div className="font-medium text-[11px] text-[#0F2942] truncate">
                            {client.opportunityName}
                          </div>
                          <div className="font-mono-tech text-[9px] text-[#181B1E]/55 truncate mt-0.5">
                            {client.solutionProducts?.join(', ') || client.projectType}
                          </div>
                        </td>

                        {/* Contacts */}
                        <td className="px-2.5 py-2.5 max-w-[170px] whitespace-nowrap">
                          <div className="font-semibold text-[11px] text-[#0F2942] truncate">
                            {client.contactName}
                          </div>
                          <div className="font-mono-tech text-[9px] text-[#181B1E]/55 truncate">
                            {client.contactRole}
                          </div>
                          {client.economicBuyer && (
                            <div className="font-mono-tech text-[8px] text-[#07B1C5] truncate">
                              Decisor: {client.economicBuyer}
                            </div>
                          )}
                        </td>

                        {/* Estimated Value & Duration */}
                        <td className="px-2.5 py-2.5 text-right whitespace-nowrap font-mono-tech">
                          <div className="font-bold text-xs text-[#0F2942]">
                            {formatCurrency(estVal, client.currency)}
                          </div>
                          <div className="font-mono-tech text-[9px] text-[#07B1C5] font-bold mt-0.5">
                            ⏱ {client.durationMonths || 12} meses
                          </div>
                        </td>

                        {/* Stage Quick Change */}
                        <td className="px-2.5 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={client.stage}
                            onChange={(e) =>
                              onQuickChangeStage(client.id, e.target.value as MocStage)
                            }
                            className={`rounded-md border px-2 py-0.5 font-mono-tech text-[10px] font-medium transition-colors cursor-pointer ${getStageBadgeStyle(
                              client.stage
                            )}`}
                          >
                            {STAGES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <div className="font-mono-tech text-[9px] text-[#181B1E]/50 mt-0.5 pl-1">
                            {client.probability}% prob.
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-2.5 py-2.5 whitespace-nowrap">
                          <div className="font-medium text-[11px] text-[#0F2942]">
                            {client.owner}
                          </div>
                          {client.techLead && (
                            <div className="font-mono-tech text-[8px] text-[#181B1E]/50">
                              Pre: {client.techLead}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            className="inline-flex items-center gap-1 rounded bg-[#0F2942]/5 hover:bg-[#0F2942] hover:text-white px-2 py-1 text-[10px] font-mono-tech font-semibold text-[#0F2942] transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Ver / Editar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTableClients.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center font-mono-tech text-xs text-[#181B1E]/40">
                        No se encontraron oportunidades con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: DASHBOARD GERENCIAL (MÉTRICAS PURAS & FILTROS DESAGREGADOS)
      ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Dashboard Executive Filter Bar */}
          <div className="flex flex-col gap-2 rounded-xl bg-white border border-[#0F2942]/10 p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#07B1C5]" />
              <span className="font-mono-tech text-xs font-bold text-[#0F2942]">
                Filtros Gerenciales:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Country */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">País:</span>
                <select
                  value={dashCountry}
                  onChange={(e) => setDashCountry(e.target.value)}
                  className="rounded border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-0.5 font-mono-tech text-[11px] text-[#0F2942] cursor-pointer"
                >
                  <option value="Todos">Todos los países</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Estado:</span>
                <select
                  value={dashStage}
                  onChange={(e) => setDashStage(e.target.value)}
                  className="rounded border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-0.5 font-mono-tech text-[11px] text-[#0F2942] cursor-pointer"
                >
                  <option value="Todos">Todos los estados</option>
                  {STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Sector:</span>
                <select
                  value={dashSector}
                  onChange={(e) => setDashSector(e.target.value)}
                  className="rounded border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-0.5 font-mono-tech text-[11px] text-[#0F2942] cursor-pointer"
                >
                  <option value="Todos">Todos los sectores</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Responsable:</span>
                <select
                  value={dashOwner}
                  onChange={(e) => setDashOwner(e.target.value)}
                  className="rounded border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-0.5 font-mono-tech text-[11px] text-[#0F2942] cursor-pointer"
                >
                  <option value="Todos">Todos los owners</option>
                  {OWNERS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset filters */}
              {(dashCountry !== 'Todos' || dashStage !== 'Todos' || dashOwner !== 'Todos' || dashSector !== 'Todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setDashCountry('Todos');
                    setDashStage('Todos');
                    setDashOwner('Todos');
                    setDashSector('Todos');
                  }}
                  className="flex items-center gap-1 text-[10px] font-mono-tech text-red-600 hover:underline pl-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Gerencial Metrics Summary Cards (Strictly No Forecast Ponderado, No MRR Proyectado) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-3.5 shadow-xs">
              <div className="font-mono-tech text-[10px] text-[#181B1E]/55 uppercase">PIPELINE TOTAL</div>
              <div className="font-mono-tech text-xl font-bold text-[#0F2942] mt-0.5">
                {formatCurrency(dashMetrics.totalPipeline)}
              </div>
              <div className="font-mono-tech text-[10px] text-[#181B1E]/60 mt-1">
                {dashMetrics.dealsCount} oportunidades activas
              </div>
            </div>

            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-3.5 shadow-xs">
              <div className="font-mono-tech text-[10px] text-[#181B1E]/55 uppercase">VALOR GANADO</div>
              <div className="font-mono-tech text-xl font-bold text-[#2F7F61] mt-0.5">
                {formatCurrency(dashMetrics.wonValue)}
              </div>
              <div className="font-mono-tech text-[10px] text-[#2F7F61] mt-1">
                {dashMetrics.wonDealsCount} cuentas cerradas ({dashMetrics.winRate}% win rate)
              </div>
            </div>

            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-3.5 shadow-xs">
              <div className="font-mono-tech text-[10px] text-[#181B1E]/55 uppercase">TICKET PROMEDIO</div>
              <div className="font-mono-tech text-xl font-bold text-[#0F2942] mt-0.5">
                {formatCurrency(dashMetrics.avgTicket)}
              </div>
              <div className="font-mono-tech text-[10px] text-[#07B1C5] mt-1">
                Por oportunidad B2B
              </div>
            </div>
          </div>

          {/* =====================================================================
              1. PRINCIPAL / HERO: SÚPER EMBUDO DE VENTAS & CONVERSIÓN DE PIPELINE
          ===================================================================== */}
          <div className="rounded-xl bg-white border border-[#0F2942]/10 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#0F2942]/8 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F2942] text-white shadow-xs">
                    <TrendingUp className="h-4 w-4 text-[#07B1C5]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F2942] tracking-tight">
                    Funnel de Conversión
                  </h3>
                </div>
                <p className="font-mono-tech text-[10.5px] text-[#181B1E]/65 mt-0.5 pl-9">
                  Discovery → Propuesta → Negociación → Conversión
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono-tech text-[10px]">
                <span className="rounded-md bg-[#2F7F61]/10 border border-[#2F7F61]/25 px-2.5 py-1 text-[#2F7F61] font-bold">
                  ★ Win Rate: {dashMetrics.winRate}%
                </span>
                <span className="rounded-md bg-[#0F2942]/6 border border-[#0F2942]/10 px-2.5 py-1 text-[#0F2942] font-semibold">
                  {dashMetrics.dealsCount} cuentas activas
                </span>
              </div>
            </div>

            {/* Graphic Funnel Canvas & Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
              {/* Left Column: Symmetrical, High-Legibility Vector SVG Funnel (Zero Overlap Guaranteed) */}
              <div className="lg:col-span-6 rounded-xl bg-gradient-to-b from-[#F3F0EB]/80 via-[#F3F0EB]/30 to-white border border-[#0F2942]/12 p-4 flex flex-col items-center justify-center shadow-xs">
                <div className="flex items-center justify-between w-full mb-3 px-1">
                  <div className="flex items-center gap-1.5 font-mono-tech text-xs font-bold text-[#0F2942] uppercase tracking-wider">
                    <Layers className="h-4 w-4 text-[#07B1C5]" />
                    <span>Embudo de Conversión B2B</span>
                  </div>
                  <span className="font-mono-tech text-xs text-[#07B1C5] font-bold">
                    Pipeline: {formatCurrency(dashMetrics.totalPipeline)}
                  </span>
                </div>

                {/* SVG Visual Funnel with 4 Perfectly Symmetrical Cascading Geometric Trapezoids */}
                <div className="w-full max-w-[500px]">
                  <svg
                    viewBox="0 0 520 435"
                    className="w-full h-auto drop-shadow-md select-none"
                    style={{ filter: 'drop-shadow(0 6px 16px rgba(15, 41, 66, 0.08))' }}
                  >
                    <defs>
                      <linearGradient id="funnelTier1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0F2942" />
                        <stop offset="100%" stopColor="#1B4269" />
                      </linearGradient>
                      <linearGradient id="funnelTier2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1B4269" />
                        <stop offset="100%" stopColor="#0C6B86" />
                      </linearGradient>
                      <linearGradient id="funnelTier3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0C6B86" />
                        <stop offset="100%" stopColor="#07B1C5" />
                      </linearGradient>
                      <linearGradient id="funnelTier4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#07B1C5" />
                        <stop offset="100%" stopColor="#2F7F61" />
                      </linearGradient>
                    </defs>

                    {/* FASE 1: Discovery (y: 10 to 86, height 76px) */}
                    <g className="cursor-pointer group/t1" onClick={() => setDashStage('Discovery')}>
                      <polygon
                        points="10,10 510,10 470,86 50,86"
                        fill="url(#funnelTier1)"
                        stroke="#0F2942"
                        strokeWidth="1.5"
                        className="transition-all duration-200 group-hover/t1:brightness-115"
                      />
                      <line x1="14" y1="12" x2="506" y2="12" stroke="#07B1C5" strokeWidth="2" strokeOpacity="0.6" />
                      <text x="260" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.6">
                        1. DISCOVERY
                      </text>
                      <text x="260" y="55" textAnchor="middle" fill="#07B1C5" fontSize="16" fontWeight="800" fontFamily="DM Mono, monospace">
                        {formatCurrency(dashMetrics.superFunnel[0]?.value || 0)}
                      </text>
                      <text x="260" y="73" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="700" fontFamily="DM Mono, monospace">
                        {dashMetrics.superFunnel[0]?.count || 0} oportunidades · {dashMetrics.superFunnel[0]?.pct}% del pipeline
                      </text>
                    </g>

                    {/* Transition 1 -> 2 connector badge (y: 98) */}
                    <g transform="translate(260, 98)">
                      <rect x="-70" y="-10" width="140" height="20" rx="10" fill="#0F2942" stroke="#07B1C5" strokeWidth="1" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#07B1C5" fontSize="9" fontWeight="800" fontFamily="DM Mono, monospace">
                        ↓ 75% AVANCE DE FASE
                      </text>
                    </g>

                    {/* FASE 2: Propuesta (y: 112 to 188, height 76px) */}
                    <g className="cursor-pointer group/t2" onClick={() => setDashStage('Propuesta')}>
                      <polygon
                        points="50,112 470,112 425,188 95,188"
                        fill="url(#funnelTier2)"
                        stroke="#0C6B86"
                        strokeWidth="1.5"
                        className="transition-all duration-200 group-hover/t2:brightness-115"
                      />
                      <line x1="54" y1="114" x2="466" y2="114" stroke="#07B1C5" strokeWidth="2" strokeOpacity="0.6" />
                      <text x="260" y="134" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.6">
                        2. PROPUESTA
                      </text>
                      <text x="260" y="157" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="800" fontFamily="DM Mono, monospace">
                        {formatCurrency(dashMetrics.superFunnel[1]?.value || 0)}
                      </text>
                      <text x="260" y="175" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="700" fontFamily="DM Mono, monospace">
                        {dashMetrics.superFunnel[1]?.count || 0} oportunidades · {dashMetrics.superFunnel[1]?.pct}% del pipeline
                      </text>
                    </g>

                    {/* Transition 2 -> 3 connector badge (y: 200) */}
                    <g transform="translate(260, 200)">
                      <rect x="-70" y="-10" width="140" height="20" rx="10" fill="#0F2942" stroke="#07B1C5" strokeWidth="1" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#07B1C5" fontSize="9" fontWeight="800" fontFamily="DM Mono, monospace">
                        ↓ 80% TASA DE PASO
                      </text>
                    </g>

                    {/* FASE 3: Negociación (y: 214 to 290, height 76px) */}
                    <g className="cursor-pointer group/t3" onClick={() => setDashStage('Negociación')}>
                      <polygon
                        points="95,214 425,214 375,290 145,290"
                        fill="url(#funnelTier3)"
                        stroke="#07B1C5"
                        strokeWidth="1.5"
                        className="transition-all duration-200 group-hover/t3:brightness-115"
                      />
                      <line x1="99" y1="216" x2="421" y2="216" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
                      <text x="260" y="236" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.5">
                        3. NEGOCIACIÓN
                      </text>
                      <text x="260" y="259" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="800" fontFamily="DM Mono, monospace">
                        {formatCurrency(dashMetrics.superFunnel[2]?.value || 0)}
                      </text>
                      <text x="260" y="277" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="DM Mono, monospace">
                        {dashMetrics.superFunnel[2]?.count || 0} oportunidades · {dashMetrics.superFunnel[2]?.pct}% del pipeline
                      </text>
                    </g>

                    {/* Transition 3 -> 4 connector badge (y: 302) */}
                    <g transform="translate(260, 302)">
                      <rect x="-70" y="-10" width="140" height="20" rx="10" fill="#0F2942" stroke="#2F7F61" strokeWidth="1" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#2F7F61" fontSize="9" fontWeight="800" fontFamily="DM Mono, monospace">
                        ↓ 88% CIERRE EFECTIVO
                      </text>
                    </g>

                    {/* FASE 4: Conversión (y: 316 to 392, height 76px) */}
                    <g className="cursor-pointer group/t4" onClick={() => setDashStage('Conversión')}>
                      <polygon
                        points="145,316 375,316 330,392 190,392"
                        fill="url(#funnelTier4)"
                        stroke="#2F7F61"
                        strokeWidth="1.5"
                        className="transition-all duration-200 group-hover/t4:brightness-115"
                      />
                      <line x1="149" y1="318" x2="371" y2="318" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
                      <text x="260" y="338" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.5">
                        4. CONVERSIÓN
                      </text>
                      <text x="260" y="361" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="800" fontFamily="DM Mono, monospace">
                        {formatCurrency(dashMetrics.superFunnel[3]?.value || 0)}
                      </text>
                      <text x="260" y="379" textAnchor="middle" fill="#E2E8F0" fontSize="9.5" fontWeight="700" fontFamily="DM Mono, monospace">
                        {dashMetrics.superFunnel[3]?.count || 0} cuentas ganadas · {dashMetrics.superFunnel[3]?.pct}% del pipeline
                      </text>
                    </g>

                    {/* Final Win Rate Badge (y: 414) */}
                    <g transform="translate(260, 414)">
                      <rect x="-95" y="-10" width="190" height="20" rx="10" fill="#2F7F61" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="DM Mono, monospace">
                        ★ {dashMetrics.winRate}% WIN RATE CORPORATIVO
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Right Column: Stage Breakdown & Detailed List of Clients & Projects */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#0F2942]/10">
                  <div>
                    <span className="font-mono-tech text-xs uppercase font-bold text-[#0F2942]">
                      Clientes &amp; Proyectos por Fase del Funnel
                    </span>
                    <p className="font-mono-tech text-[9.5px] text-[#181B1E]/60 mt-0.5">
                      Desglose de cada cuenta con su Cliente, Proyecto, Monto, Duración y Responsable
                    </p>
                  </div>
                  {dashStage !== 'Todos' && (
                    <button
                      type="button"
                      onClick={() => setDashStage('Todos')}
                      className="font-mono-tech text-[9px] text-[#07B1C5] font-bold underline hover:text-[#0F2942] cursor-pointer"
                    >
                      Ver todas las fases
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {dashMetrics.superFunnel.map((step) => {
                    const isWon = step.stage === 'Conversión' || step.stage === 'Ganada (Cliente Activo)';
                    const isSelected = dashStage === step.stage;
                    const stageDisplayName =
                      step.step === 1
                        ? '1. Discovery'
                        : step.step === 2
                        ? '2. Propuesta'
                        : step.step === 3
                        ? '3. Negociación'
                        : '4. Conversión';

                    return (
                      <div
                        key={step.stage}
                        onClick={() => setDashStage(isSelected ? 'Todos' : step.stage)}
                        className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#07B1C5]/10 border-[#07B1C5] shadow-xs ring-1 ring-[#07B1C5]'
                            : isWon
                            ? 'bg-[#2F7F61]/[0.05] border-[#2F7F61]/30 hover:border-[#2F7F61]'
                            : 'bg-white border-[#0F2942]/10 hover:border-[#07B1C5]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                isWon
                                  ? 'bg-[#2F7F61]'
                                  : step.step === 3
                                  ? 'bg-[#07B1C5]'
                                  : step.step === 2
                                  ? 'bg-[#1B4269]'
                                  : 'bg-[#0F2942]'
                              }`}
                            />
                            <span className="font-bold text-xs text-[#0F2942]">
                              {stageDisplayName}
                            </span>
                          </div>
                          <div className="font-mono-tech text-xs font-bold text-[#0F2942]">
                            {formatCurrency(step.value)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between font-mono-tech text-[9.5px] text-[#181B1E]/65 mb-2.5">
                          <span>
                            {step.count} {step.count === 1 ? 'oportunidad' : 'oportunidades'} · <strong className="text-[#07B1C5]">{step.pct}% del total</strong>
                          </span>
                          <span className="font-bold text-[#2F7F61]">
                            {step.step === 1 ? '75% avance' : step.step === 2 ? '80% avance' : step.step === 3 ? '88% cierre' : '100% Ganada'}
                          </span>
                        </div>

                        {/* List of Clients & Project Names ("Nombre del Proyecto y Cliente") */}
                        {step.deals.length > 0 ? (
                          <div className="space-y-2 pt-2 border-t border-[#0F2942]/8">
                            {step.deals.map((d) => (
                              <div
                                key={d.id}
                                className="rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/10 p-2.5 space-y-1 hover:bg-white hover:border-[#07B1C5]/30 transition-all shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <Building2 className="h-3.5 w-3.5 text-[#07B1C5] shrink-0" />
                                      <span className="font-bold text-xs text-[#0F2942] truncate">
                                        {d.companyName}
                                      </span>
                                    </div>
                                    <div className="font-semibold text-[11px] text-[#0F2942]/90 truncate mt-0.5 pl-5">
                                      💼 <span className="text-[#07B1C5] font-bold">Proyecto:</span> {d.opportunityName}
                                    </div>
                                  </div>
                                  <div className="text-right font-mono-tech shrink-0">
                                    <div className="font-bold text-xs text-[#07B1C5]">
                                      {formatCurrency(d.estimatedValue || d.estimatedValueUsd || 0)}
                                    </div>
                                    <div className="text-[9.5px] text-[#181B1E]/60 font-semibold">
                                      ⏱ {d.durationMonths || 12} meses
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between font-mono-tech text-[9px] text-[#181B1E]/65 pl-5 pt-1 border-t border-[#0F2942]/6">
                                  <span>👤 Líder: <strong>{d.owner}</strong></span>
                                  <span className="text-[#0F2942]/70 font-semibold">🏷️ {d.industry}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="font-mono-tech text-[9.5px] text-[#181B1E]/40 italic pt-1.5 border-t border-[#0F2942]/6">
                            Sin proyectos ni clientes registrados en esta fase
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Funnel Extra States Bar (Standby & Perdidas) */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-2.5 font-mono-tech text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-[#0F2942] font-semibold">
                    En Standby:{' '}
                    <span className="text-amber-700 font-bold">
                      {dashMetrics.standbyDeals.length} deals ({formatCurrency(dashMetrics.standbyValue)})
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-[#0F2942] font-semibold">
                    Oportunidades Perdidas:{' '}
                    <span className="text-red-700 font-bold">
                      {dashMetrics.lostDeals.length} deals ({formatCurrency(dashMetrics.lostValue)})
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-[#181B1E]/60">
                Pipeline Total Depurado: <strong className="text-[#0F2942] font-bold">{formatCurrency(dashMetrics.totalPipeline)}</strong>
              </div>
            </div>
          </div>

          {/* =====================================================================
              2. DESAGREGADOS EN DIAGRAMAS CIRCULARES (DONUT CHARTS) CON ETIQUETAS
          ===================================================================== */}
          <div className="space-y-4">
            {/* Bloque 1: Diagrama Circular por Mercado / Sector Estratégico */}
            {(() => {
              const sectorColors = [
                '#0F2942',
                '#07B1C5',
                '#2F7F61',
                '#1B4269',
                '#D97706',
                '#8B5CF6',
                '#EC4899',
                '#10B981',
              ];

              const totalVal = dashMetrics.bySector.reduce((acc, s) => acc + s.value, 0);
              const totalCount = dashMetrics.bySector.reduce((acc, s) => acc + s.count, 0);
              const radius = 38;
              const circumference = 2 * Math.PI * radius;
              let accumulatedPct = 0;

              return (
                <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2F7F61]/15 text-[#2F7F61]">
                        <Building2 className="h-3.5 w-3.5 text-[#2F7F61]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F2942]">
                          Mercado
                        </h3>
                        <p className="font-mono-tech text-[9.5px] text-[#181B1E]/60">
                          Desglose por sector con cantidad (#), porcentaje (%) y valor total
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                      {totalCount} Oportunidades
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
                    {/* Donut Canvas */}
                    <div className="lg:col-span-4 flex items-center justify-center">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none drop-shadow-xs">
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F0EB" strokeWidth="13" />
                          {dashMetrics.bySector.map((sec, idx) => {
                            if (sec.pct <= 0) return null;
                            const color = sectorColors[idx % sectorColors.length];
                            const dashLength = (sec.pct / 100) * circumference;
                            const dashGap = circumference - dashLength;
                            const offset = -((accumulatedPct / 100) * circumference);
                            accumulatedPct += sec.pct;

                            return (
                              <circle
                                key={sec.sector}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={color}
                                strokeWidth="13"
                                strokeDasharray={`${dashLength} ${dashGap}`}
                                strokeDashoffset={offset}
                                className="transition-all duration-300 hover:opacity-90"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="font-mono-tech text-xs font-bold text-[#0F2942]">
                            {totalCount} DEALS
                          </span>
                          <span className="font-mono-tech text-[10px] text-[#2F7F61] font-bold">
                            {formatCurrency(totalVal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags / Chips Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dashMetrics.bySector.map((sec, idx) => {
                        const color = sectorColors[idx % sectorColors.length];
                        return (
                          <div
                            key={sec.sector}
                            className="rounded-lg border border-[#0F2942]/10 bg-[#F3F0EB]/30 p-2 space-y-1 hover:bg-white transition-all shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-bold text-[#0F2942] truncate">{sec.sector}</span>
                              </div>
                              <span className="font-mono-tech font-extrabold text-[#07B1C5] text-xs">
                                {sec.pct}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-mono-tech text-[9.5px] text-[#181B1E]/60 pt-0.5 border-t border-[#0F2942]/6">
                              <span><strong>{sec.count}</strong> {sec.count === 1 ? 'deal' : 'deals'}</span>
                              <span className="font-bold text-[#0F2942]">{formatCurrency(sec.value)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bloque 2: País */}
            {(() => {
              const countryColors = [
                '#07B1C5',
                '#0F2942',
                '#2F7F61',
                '#1B4269',
                '#D97706',
                '#8B5CF6',
              ];

              const totalVal = dashMetrics.byCountry.reduce((acc, c) => acc + c.value, 0);
              const totalCount = dashMetrics.byCountry.reduce((acc, c) => acc + c.count, 0);
              const radius = 38;
              const circumference = 2 * Math.PI * radius;
              let accumulatedPct = 0;

              return (
                <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#07B1C5]/15 text-[#0F2942]">
                        <MapPin className="h-3.5 w-3.5 text-[#07B1C5]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F2942]">
                          País
                        </h3>
                        <p className="font-mono-tech text-[9.5px] text-[#181B1E]/60">
                          Presencia territorial en Colombia, Chile, México, Perú, etc.
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                      {dashMetrics.byCountry.length} Países Activos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
                    {/* Donut Canvas */}
                    <div className="lg:col-span-4 flex items-center justify-center">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none drop-shadow-xs">
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F0EB" strokeWidth="13" />
                          {dashMetrics.byCountry.map((item, idx) => {
                            if (item.pct <= 0) return null;
                            const color = countryColors[idx % countryColors.length];
                            const dashLength = (item.pct / 100) * circumference;
                            const dashGap = circumference - dashLength;
                            const offset = -((accumulatedPct / 100) * circumference);
                            accumulatedPct += item.pct;

                            return (
                              <circle
                                key={item.country}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={color}
                                strokeWidth="13"
                                strokeDasharray={`${dashLength} ${dashGap}`}
                                strokeDashoffset={offset}
                                className="transition-all duration-300 hover:opacity-90"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="font-mono-tech text-xs font-bold text-[#0F2942]">
                            {totalCount} CUENTAS
                          </span>
                          <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                            {formatCurrency(totalVal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags / Chips Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dashMetrics.byCountry.map((item, idx) => {
                        const color = countryColors[idx % countryColors.length];
                        return (
                          <div
                            key={item.country}
                            className="rounded-lg border border-[#0F2942]/10 bg-[#F3F0EB]/30 p-2 space-y-1 hover:bg-white transition-all shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-bold text-[#0F2942] truncate">{item.country}</span>
                              </div>
                              <span className="font-mono-tech font-extrabold text-[#07B1C5] text-xs">
                                {item.pct}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-mono-tech text-[9.5px] text-[#181B1E]/60 pt-0.5 border-t border-[#0F2942]/6">
                              <span><strong>{item.count}</strong> {item.count === 1 ? 'cuenta' : 'cuentas'}</span>
                              <span className="font-bold text-[#0F2942]">{formatCurrency(item.value)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bloque 3: Responsable */}
            {(() => {
              const ownerColors = [
                '#0F2942',
                '#2F7F61',
                '#07B1C5',
                '#D97706',
                '#8B5CF6',
                '#1B4269',
              ];

              const totalVal = dashMetrics.byOwner.reduce((acc, o) => acc + o.value, 0);
              const totalCount = dashMetrics.byOwner.reduce((acc, o) => acc + o.count, 0);
              const radius = 38;
              const circumference = 2 * Math.PI * radius;
              let accumulatedPct = 0;

              return (
                <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F2942]/10 text-[#0F2942]">
                        <UserCheck className="h-3.5 w-3.5 text-[#0F2942]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F2942]">
                          Responsable
                        </h3>
                        <p className="font-mono-tech text-[9.5px] text-[#181B1E]/60">
                          Volumen gestionado y cierres por ejecutivo de cuenta
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                      Desempeño Individual
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
                    {/* Donut Canvas */}
                    <div className="lg:col-span-4 flex items-center justify-center">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none drop-shadow-xs">
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F3F0EB" strokeWidth="13" />
                          {dashMetrics.byOwner.map((item, idx) => {
                            if (item.pct <= 0) return null;
                            const color = ownerColors[idx % ownerColors.length];
                            const dashLength = (item.pct / 100) * circumference;
                            const dashGap = circumference - dashLength;
                            const offset = -((accumulatedPct / 100) * circumference);
                            accumulatedPct += item.pct;

                            return (
                              <circle
                                key={item.owner}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={color}
                                strokeWidth="13"
                                strokeDasharray={`${dashLength} ${dashGap}`}
                                strokeDashoffset={offset}
                                className="transition-all duration-300 hover:opacity-90"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="font-mono-tech text-xs font-bold text-[#0F2942]">
                            {totalCount} DEALS
                          </span>
                          <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                            {formatCurrency(totalVal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags / Chips Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dashMetrics.byOwner.map((item, idx) => {
                        const color = ownerColors[idx % ownerColors.length];
                        return (
                          <div
                            key={item.owner}
                            className="rounded-lg border border-[#0F2942]/10 bg-[#F3F0EB]/30 p-2 space-y-1 hover:bg-white transition-all shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-bold text-[#0F2942] truncate">{item.owner}</span>
                              </div>
                              <span className="font-mono-tech font-extrabold text-[#07B1C5] text-xs">
                                {item.pct}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-mono-tech text-[9.5px] text-[#181B1E]/60 pt-0.5 border-t border-[#0F2942]/6">
                              <span>
                                <strong>{item.count}</strong> {item.count === 1 ? 'deal' : 'deals'}
                                {item.won > 0 && <strong className="text-[#2F7F61] ml-1">({item.won} ganadas)</strong>}
                              </span>
                              <span className="font-bold text-[#0F2942]">{formatCurrency(item.value)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* =====================================================================
          FORMULARIO EN PANTALLA ULTRA PROFESIONAL (DRAWER / MODAL)
      ===================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-[#0F2942]/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0F2942] text-[10px] font-bold text-white font-mono-tech">
                  {formData.code.replace('OPP-2026-', '')}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2942]">
                    {editingClientId ? `Ficha Enterprise: ${formData.companyName}` : 'Nueva Oportunidad'}
                  </h2>
                  <div className="flex items-center gap-2 font-mono-tech text-[10px] text-[#181B1E]/60">
                    <span>{formData.code}</span>
                    <span>·</span>
                    <span>{formData.accountType}</span>
                    <span>·</span>
                    <span className="text-[#07B1C5] font-semibold">{formatCurrency(formData.estimatedValue, formData.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg p-1.5 text-[#181B1E]/60 hover:bg-[#0F2942]/10 hover:text-[#0F2942] transition-colors cursor-pointer"
                  title="Cerrar formulario"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Step / Section Navigation */}
            <div className="grid grid-cols-5 border-b border-[#0F2942]/10 bg-white font-mono-tech text-[11px]">
              <button
                type="button"
                onClick={() => setFormSection('empresa')}
                className={`py-2 px-2 text-center border-b-2 font-semibold transition-colors cursor-pointer truncate ${
                  formSection === 'empresa'
                    ? 'border-[#07B1C5] text-[#0F2942] bg-[#07B1C5]/5'
                    : 'border-transparent text-[#181B1E]/60 hover:text-[#0F2942]'
                }`}
              >
                1. Empresa &amp; Origen
              </button>
              <button
                type="button"
                onClick={() => setFormSection('contactos')}
                className={`py-2 px-2 text-center border-b-2 font-semibold transition-colors cursor-pointer truncate ${
                  formSection === 'contactos'
                    ? 'border-[#07B1C5] text-[#0F2942] bg-[#07B1C5]/5'
                    : 'border-transparent text-[#181B1E]/60 hover:text-[#0F2942]'
                }`}
              >
                2. Contactos
              </button>
              <button
                type="button"
                onClick={() => setFormSection('oportunidad')}
                className={`py-2 px-2 text-center border-b-2 font-semibold transition-colors cursor-pointer truncate ${
                  formSection === 'oportunidad'
                    ? 'border-[#07B1C5] text-[#0F2942] bg-[#07B1C5]/5'
                    : 'border-transparent text-[#181B1E]/60 hover:text-[#0F2942]'
                }`}
              >
                3. Oportunidad
              </button>
              <button
                type="button"
                onClick={() => setFormSection('compromisos')}
                className={`py-2 px-2 text-center border-b-2 font-semibold transition-colors cursor-pointer truncate ${
                  formSection === 'compromisos'
                    ? 'border-[#07B1C5] text-[#0F2942] bg-[#07B1C5]/5'
                    : 'border-transparent text-[#181B1E]/60 hover:text-[#0F2942]'
                }`}
              >
                4. Check list
              </button>
              <button
                type="button"
                onClick={() => setFormSection('cotizacion')}
                className={`py-2 px-2 text-center border-b-2 font-semibold transition-colors cursor-pointer truncate flex items-center justify-center gap-1 ${
                  formSection === 'cotizacion'
                    ? 'border-[#07B1C5] text-[#0F2942] bg-[#07B1C5]/5'
                    : 'border-transparent text-[#181B1E]/60 hover:text-[#0F2942]'
                }`}
              >
                <FileSpreadsheet className="h-3 w-3 text-[#07B1C5]" />
                <span>5. Cotización</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {saveToast && (
                <div className="rounded-lg bg-[#2F7F61]/15 border border-[#2F7F61]/30 p-2.5 text-xs text-[#2F7F61] font-semibold flex items-center justify-between">
                  <span>{saveToast}</span>
                  <button type="button" onClick={() => setSaveToast(null)} className="cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SECTION 1: EMPRESA, MERCADO Y ORIGEN
              ------------------------------------------------------------- */}
              {formSection === 'empresa' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Razón Social */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Razón Social / Empresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Ej. PetroAndina Exploración & Refinación"
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none"
                      />
                    </div>

                    {/* NIT / Tax ID */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        NIT / Tax ID
                      </label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        placeholder="Ej. 800.198.423-1"
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none font-mono-tech"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* País */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        País <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => {
                          const newCountry = e.target.value;
                          const cities = COUNTRY_CITIES[newCountry] || [];
                          setFormData({
                            ...formData,
                            country: newCountry,
                            city: cities[0] || 'Bogotá',
                          });
                        }}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ciudad */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Ciudad (Dependiente)
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {(COUNTRY_CITIES[formData.country] || ['Bogotá']).map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Sector */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Mercado / Sector <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => {
                          const newInd = e.target.value as IndustrySector;
                          const subs = SUBSECTORS[newInd] || [];
                          setFormData({
                            ...formData,
                            industry: newInd,
                            subsector: subs[0] || '',
                          });
                        }}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subsector */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Subsector Especializado
                      </label>
                      <select
                        value={formData.subsector}
                        onChange={(e) => setFormData({ ...formData, subsector: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {(SUBSECTORS[formData.industry] || []).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Procedencia */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Procedencia / Lead Source <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.leadSource}
                        onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {LEAD_SOURCES.map((src) => (
                          <option key={src} value={src}>
                            {src}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Detalle procedencia */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Detalle de Procedencia
                      </label>
                      <input
                        type="text"
                        value={formData.leadSourceDetail}
                        onChange={(e) => setFormData({ ...formData, leadSourceDetail: e.target.value })}
                        placeholder="Ej. Nombre del evento o quién refirió"
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                      />
                    </div>

                    {/* Cuenta Nueva / Existente */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Cuenta Nueva / Existente <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, accountType: 'Nueva cuenta' })}
                          className={`flex-1 py-1 text-center font-mono-tech text-[10px] font-bold rounded border cursor-pointer ${
                            formData.accountType === 'Nueva cuenta'
                              ? 'bg-[#0F2942] text-white border-[#0F2942]'
                              : 'bg-white text-[#0F2942] border-[#0F2942]/20 hover:bg-[#F3F0EB]'
                          }`}
                        >
                          Nueva cuenta
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, accountType: 'Cliente actual' })}
                          className={`flex-1 py-1 text-center font-mono-tech text-[10px] font-bold rounded border cursor-pointer ${
                            formData.accountType === 'Cliente actual'
                              ? 'bg-[#2F7F61] text-white border-[#2F7F61]'
                              : 'bg-white text-[#0F2942] border-[#0F2942]/20 hover:bg-[#F3F0EB]'
                          }`}
                        >
                          Cliente actual
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Partner Tecnológico Asociado (Tipo Check Múltiple) */}
                  <div className="rounded-xl bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase">
                        Partner Tecnológico Asociado (Selección Múltiple tipo Check)
                      </label>
                      <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                        {(formData.associatedPartners || []).length} seleccionados
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {PARTNERS.map((p) => {
                        const isChecked = (formData.associatedPartners || []).includes(p);
                        return (
                          <label
                            key={p}
                            className={`flex items-center gap-2 rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-white border-[#07B1C5] text-[#0F2942] font-semibold shadow-2xs'
                                : 'bg-white/60 border-[#0F2942]/10 text-[#0F2942]/70 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const current = formData.associatedPartners || [];
                                const next = isChecked
                                  ? current.filter((item) => item !== p)
                                  : [...current, p];
                                setFormData({
                                  ...formData,
                                  associatedPartners: next,
                                  associatedPartner: next.join(', ') || 'Directo / Sin Partner',
                                });
                              }}
                              className="accent-[#07B1C5] h-3.5 w-3.5 cursor-pointer"
                            />
                            <span className="text-[11px] leading-tight">{p}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SECTION 2: CONTACTOS & STAKEHOLDERS (ENTERPRISE)
              ------------------------------------------------------------- */}
              {formSection === 'contactos' && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/10 p-3 space-y-3">
                    <span className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase tracking-wider">
                      Contacto Principal (Operativo / Directo)
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Nombre Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          placeholder="Ej. Ing. Carlos Hernando Duque"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Cargo / Rol <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contactRole}
                          onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                          placeholder="Ej. Gerente General de Operaciones"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Email Corporativo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.contactEmail}
                          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                          placeholder="cduque@empresa.com"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-mono-tech focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Teléfono / Móvil
                        </label>
                        <input
                          type="text"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          placeholder="+57 310 982 4410"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-mono-tech focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white border border-[#0F2942]/10 p-3 space-y-3">
                    <span className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase tracking-wider">
                      Stakeholders &amp; Decisores Enterprise
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Decisor Económico (Budget Owner)
                        </label>
                        <input
                          type="text"
                          value={formData.economicBuyer}
                          onChange={(e) => setFormData({ ...formData, economicBuyer: e.target.value })}
                          placeholder="Ej. Dra. Patricia Salamanca"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Cargo del Decisor
                        </label>
                        <input
                          type="text"
                          value={formData.economicBuyerRole}
                          onChange={(e) => setFormData({ ...formData, economicBuyerRole: e.target.value })}
                          placeholder="Ej. VP de Finanzas & Abastecimiento"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Sponsor Interno (Champion)
                        </label>
                        <input
                          type="text"
                          value={formData.internalSponsor}
                          onChange={(e) => setFormData({ ...formData, internalSponsor: e.target.value })}
                          placeholder="Ej. Nombre del sponsor"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-tech text-[10px] text-[#181B1E]/60 uppercase mb-1">
                          Influenciador Técnico / Evaluador
                        </label>
                        <input
                          type="text"
                          value={formData.technicalInfluencer}
                          onChange={(e) => setFormData({ ...formData, technicalInfluencer: e.target.value })}
                          placeholder="Ej. Arquitecto de Datos o TI"
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Nivel de Relación con la Cuenta
                      </label>
                      <select
                        value={formData.relationshipLevel}
                        onChange={(e) => setFormData({ ...formData, relationshipLevel: e.target.value as RelationshipLevel })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        <option value="Sin contacto">Sin contacto</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Relación inicial">Relación inicial</option>
                        <option value="Relación activa">Relación activa</option>
                        <option value="Sponsor">Sponsor</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SECTION 3: OPORTUNIDAD COMERCIAL
              ------------------------------------------------------------- */}
              {formSection === 'oportunidad' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Nombre de la Oportunidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.opportunityName}
                        onChange={(e) => setFormData({ ...formData, opportunityName: e.target.value })}
                        placeholder="Ej. Telemetría IoT en Pozos & Mantenimiento Predictivo"
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        ID Automático
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.code}
                        className="w-full rounded-md border border-[#0F2942]/10 bg-[#F3F0EB]/60 px-3 py-1.5 text-xs font-mono-tech text-[#0F2942] font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Descripción / necesidad */}
                  <div>
                    <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                      Descripción / Necesidad Comercial &amp; Técnica <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalla el alcance, reto del negocio y arquitectura esperada..."
                      className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                    />
                  </div>

                  {/* Producto / Solución (Lista desplegable con multiselección VOXI, CHARLI, SIDEKI) */}
                  <div className="relative">
                    <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                      Línea de Negocio / Solución Kognia <span className="text-red-500">*</span> (Seleccionar uno o varios)
                    </label>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                        className="w-full flex items-center justify-between rounded-md border border-[#0F2942]/20 bg-white px-3 py-2 text-xs text-[#0F2942] font-medium hover:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        <span className="truncate">
                          {formData.solutionProducts.length > 0
                            ? formData.solutionProducts.join(', ')
                            : 'Selecciona soluciones (VOXI, CHARLI, SIDEKI...)'}
                        </span>
                        <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold shrink-0 ml-2">
                          {formData.solutionProducts.length} seleccionados ▼
                        </span>
                      </button>

                      {/* Selected product badges */}
                      {formData.solutionProducts.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.solutionProducts.map((p) => (
                            <span
                              key={p}
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono-tech text-[10px] font-semibold ${
                                p === 'VOXI' || p === 'CHARLI' || p === 'SIDEKI'
                                  ? 'bg-[#07B1C5]/15 text-[#0F2942] border border-[#07B1C5]/40'
                                  : 'bg-[#0F2942]/10 text-[#0F2942] border border-[#0F2942]/15'
                              }`}
                            >
                              <span>{p}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    solutionProducts: formData.solutionProducts.filter((item) => item !== p),
                                  })
                                }
                                className="hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dropdown Menu */}
                      {isProductDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white border border-[#0F2942]/20 shadow-xl p-2 space-y-1">
                          <div className="px-2 py-1 font-mono-tech text-[9px] font-bold text-[#07B1C5] uppercase tracking-wider border-b border-[#0F2942]/10">
                            ★ Productos Core IA Kognia Labs
                          </div>
                          {['VOXI', 'CHARLI', 'SIDEKI'].map((prod) => {
                            const checked = formData.solutionProducts.includes(prod);
                            return (
                              <label
                                key={prod}
                                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-[#F3F0EB] cursor-pointer text-xs font-semibold text-[#0F2942]"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        solutionProducts: formData.solutionProducts.filter((p) => p !== prod),
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        solutionProducts: [...formData.solutionProducts, prod],
                                      });
                                    }
                                  }}
                                  className="accent-[#07B1C5] h-3.5 w-3.5"
                                />
                                <span className="font-mono-tech text-xs text-[#0F2942] font-bold">{prod}</span>
                                <span className="font-mono-tech text-[9px] text-[#181B1E]/50">
                                  {prod === 'VOXI'
                                    ? '(Agente de Voz Conversacional)'
                                    : prod === 'CHARLI'
                                    ? '(Chatbot & Asistente Cognitivo)'
                                    : '(Copiloto Operacional & IA)'}
                                </span>
                              </label>
                            );
                          })}

                          <div className="px-2 py-1 font-mono-tech text-[9px] font-bold text-[#0F2942]/60 uppercase tracking-wider border-t border-b border-[#0F2942]/10 mt-1">
                            Soluciones de Plataforma &amp; Datos
                          </div>
                          {SOLUTION_PRODUCTS.filter((p) => !['VOXI', 'CHARLI', 'SIDEKI'].includes(p)).map((prod) => {
                            const checked = formData.solutionProducts.includes(prod);
                            return (
                              <label
                                key={prod}
                                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-[#F3F0EB] cursor-pointer text-xs text-[#0F2942]"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        solutionProducts: formData.solutionProducts.filter((p) => p !== prod),
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        solutionProducts: [...formData.solutionProducts, prod],
                                      });
                                    }
                                  }}
                                  className="accent-[#07B1C5] h-3.5 w-3.5"
                                />
                                <span>{prod}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Tipo de Contrato */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Tipo de Contrato <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectContractType })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {CONTRACT_TYPES.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad de Meses del Contrato */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Duración (Meses de Contrato) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          step="1"
                          required
                          value={formData.durationMonths || 12}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              durationMonths: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs font-mono-tech font-bold text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                          placeholder="12"
                        />
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono-tech text-[10px] text-[#181B1E]/50 font-semibold">
                          meses
                        </span>
                      </div>
                    </div>

                    {/* Estado / Etapa */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Etapa del Pipeline / Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.stage}
                        onChange={(e) => {
                          const newSt = e.target.value as MocStage;
                          setFormData({
                            ...formData,
                            stage: newSt,
                            probability: newSt === 'Conversión' || newSt === 'Ganada (Cliente Activo)' ? 100 : newSt === 'Perdida' ? 0 : formData.probability,
                          });
                        }}
                        className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Probabilidad */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase">
                          Probabilidad de Cierre
                        </label>
                        <span className="font-mono-tech text-xs font-bold text-[#07B1C5]">
                          {formData.probability}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                        className="w-full accent-[#07B1C5] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Financial Fields */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-3">
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Moneda
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 bg-white px-2 py-1 text-xs text-[#0F2942] font-bold cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="COP">COP ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="MXN">MXN ($)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Valor Estimado (TCV Total) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono-tech text-xs font-bold text-[#181B1E]/40">
                          {formData.currency}
                        </span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1000"
                          value={formData.estimatedValue}
                          onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                          className="w-full rounded-md border border-[#0F2942]/20 bg-white pl-12 pr-3 py-1 text-xs font-mono-tech text-[#0F2942] font-bold focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    {/* Fecha Cierre */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Fecha Cierre Estimada <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.expectedCloseDate}
                        onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs text-[#0F2942] font-mono-tech focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Fecha Inicio */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Fecha Inicio Estimada
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs text-[#0F2942] font-mono-tech focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Responsable */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Responsable Comercial <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.owner}
                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {OWNERS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preventa */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Preventa Técnica Asignada
                      </label>
                      <select
                        value={formData.techLead}
                        onChange={(e) => setFormData({ ...formData, techLead: e.target.value })}
                        className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        {TECH_LEADS.map((tl) => (
                          <option key={tl} value={tl}>
                            {tl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SECTION 4: CHECK LIST & COMPROMISOS COMERCIALES
              ------------------------------------------------------------- */}
              {formSection === 'compromisos' && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-[#07B1C5]" />
                        <h3 className="font-mono-tech text-xs font-bold text-[#0F2942] uppercase">
                          Check list
                        </h3>
                      </div>
                      <span className="font-mono-tech text-[10px] text-[#181B1E]/60">
                        {formData.commitments.filter((c) => c.completed).length} de {formData.commitments.length} tareas completadas
                      </span>
                    </div>

                    {/* Existing Commitments Check List */}
                    <div className="space-y-2">
                      {formData.commitments.map((com, idx) => (
                        <div
                          key={com.id}
                          className={`rounded-lg border p-2.5 transition-colors ${
                            com.completed
                              ? 'bg-[#2F7F61]/10 border-[#2F7F61]/30 text-[#2F7F61]'
                              : 'bg-white border-[#0F2942]/15 text-[#0F2942]'
                          }`}
                        >
                          {editingCommitmentId === com.id ? (
                            /* Inline Edit Mode */
                            <div className="space-y-2">
                              <div className="font-mono-tech text-[10px] font-bold text-[#07B1C5] uppercase">
                                Editando Tarea del Check list:
                              </div>
                              <input
                                type="text"
                                value={editingCommitmentDesc}
                                onChange={(e) => setEditingCommitmentDesc(e.target.value)}
                                className="w-full rounded border border-[#07B1C5] px-2.5 py-1 text-xs text-[#0F2942] font-medium bg-white focus:outline-none"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-mono-tech text-[9px] text-[#181B1E]/60 uppercase mb-0.5">
                                    Fecha Límite
                                  </label>
                                  <input
                                    type="date"
                                    value={editingCommitmentDate}
                                    onChange={(e) => setEditingCommitmentDate(e.target.value)}
                                    className="w-full rounded border border-[#0F2942]/20 px-2 py-1 text-xs font-mono-tech text-[#0F2942] bg-white cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className="block font-mono-tech text-[9px] text-[#181B1E]/60 uppercase mb-0.5">
                                    Responsable
                                  </label>
                                  <select
                                    value={editingCommitmentAssignee}
                                    onChange={(e) => setEditingCommitmentAssignee(e.target.value)}
                                    className="w-full rounded border border-[#0F2942]/20 px-2 py-1 text-xs text-[#0F2942] bg-white cursor-pointer"
                                  >
                                    {OWNERS.map((o) => (
                                      <option key={o} value={o}>
                                        {o}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleCancelEditCommitment}
                                  className="rounded px-2.5 py-1 font-mono-tech text-[10px] text-[#181B1E]/60 hover:bg-[#0F2942]/5 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveEditCommitment}
                                  className="rounded bg-[#0F2942] text-white px-3 py-1 font-mono-tech text-[10px] font-bold hover:bg-[#07B1C5] hover:text-[#0F2942] transition-colors cursor-pointer"
                                >
                                  Guardar Cambios
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Normal View Mode */
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFormCommitment(com.id)}
                                  className="mt-0.5 cursor-pointer text-[#0F2942] hover:text-[#07B1C5] transition-colors"
                                >
                                  {com.completed ? (
                                    <CheckSquare className="h-4 w-4 text-[#2F7F61]" />
                                  ) : (
                                    <Square className="h-4 w-4 text-[#181B1E]/40" />
                                  )}
                                </button>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-xs ${
                                      com.completed ? 'line-through text-[#2F7F61]/80' : 'font-semibold text-[#0F2942]'
                                    }`}
                                  >
                                    {com.description}
                                  </p>
                                  <div className="flex items-center gap-2 font-mono-tech text-[9px] text-[#181B1E]/55 mt-0.5">
                                    <span>Fecha: {com.dueDate}</span>
                                    <span>·</span>
                                    <span>Responsable: {com.assignee}</span>
                                    {idx === 0 && (
                                      <span className="rounded bg-[#07B1C5]/15 text-[#0F2942] px-1 font-bold">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCommitment(com)}
                                  className="text-[#181B1E]/50 hover:text-[#07B1C5] p-1 transition-colors cursor-pointer"
                                  title="Editar tarea del check list"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCommitment(com.id)}
                                  className="text-[#181B1E]/40 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                  title="Eliminar tarea del check list"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {formData.commitments.length === 0 && (
                        <div className="text-center py-4 font-mono-tech text-[10px] text-[#181B1E]/50 border border-dashed rounded-lg">
                          No hay tareas en el check list aún. Agrega la primera a continuación.
                        </div>
                      )}
                    </div>

                    {/* Add New Commitment Bar */}
                    <div className="pt-2 border-t border-[#0F2942]/10 space-y-2">
                      <span className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase">
                        + Añadir Tarea al Check list
                      </span>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={newCommitmentDesc}
                            onChange={(e) => setNewCommitmentDesc(e.target.value)}
                            placeholder="Descripción de la tarea o compromiso..."
                            className="w-full rounded-md border border-[#0F2942]/20 bg-white px-2.5 py-1 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            value={newCommitmentDate}
                            onChange={(e) => setNewCommitmentDate(e.target.value)}
                            className="w-full rounded-md border border-[#0F2942]/20 bg-white px-2 py-1 text-xs font-mono-tech text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <select
                            value={newCommitmentAssignee}
                            onChange={(e) => setNewCommitmentAssignee(e.target.value)}
                            className="w-full rounded-md border border-[#0F2942]/20 bg-white px-2 py-1 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                          >
                            {OWNERS.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCommitment}
                        disabled={!newCommitmentDesc.trim()}
                        className="inline-flex items-center gap-1 rounded bg-[#0F2942] px-3.5 py-1 font-mono-tech text-[11px] font-bold text-white hover:bg-[#07B1C5] hover:text-[#0F2942] transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Agregar al Check list</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SECTION 5: COTIZACIÓN ENTERPRISE & PROPUESTA ECONÓMICA
              ------------------------------------------------------------- */}
              {formSection === 'cotizacion' && (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className="rounded-xl bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F2942] text-white">
                        <FileSpreadsheet className="h-5 w-5 text-[#07B1C5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-[#0F2942]">
                          <span>Cotización Oficial: {formData.quoteCode || 'COT-2026-01'}</span>
                          <span className="rounded bg-[#07B1C5]/15 text-[#0F2942] px-1.5 py-0.5 text-[9.5px]">
                            {formData.quoteStatus || 'Borrador'}
                          </span>
                        </div>
                        <p className="font-mono-tech text-[10px] text-[#181B1E]/60 mt-0.5">
                          Presupuesto económico, precios de setup, venta y anexo en Excel
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono-tech text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-[#181B1E]/60 block">Total Cotizado</span>
                        <span className="font-bold text-[#0F2942] text-sm">
                          {formatCurrency(
                            (Number(formData.quoteSetupPrice) || 0) + (Number(formData.quoteSalePrice) || 0),
                            formData.quoteCurrency || formData.currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Precios: Setup y Venta */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Precio de Setup */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Precio de Setup / Implementación <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono-tech text-xs font-bold text-[#181B1E]/40">
                          {formData.quoteCurrency || formData.currency}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={formData.quoteSetupPrice ?? 35000}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quoteSetupPrice: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-md border border-[#0F2942]/20 bg-white pl-12 pr-3 py-1.5 text-xs font-mono-tech text-[#0F2942] font-bold focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <span className="font-mono-tech text-[9px] text-[#181B1E]/50 mt-0.5 block">
                        Costo único de inicio, migración o arquitectura
                      </span>
                    </div>

                    {/* Precio de Venta */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Precio de Venta / Fee o Total <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono-tech text-xs font-bold text-[#181B1E]/40">
                          {formData.quoteCurrency || formData.currency}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.quoteSalePrice ?? formData.estimatedValue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quoteSalePrice: Number(e.target.value),
                              estimatedValue: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-md border border-[#0F2942]/20 bg-white pl-12 pr-3 py-1.5 text-xs font-mono-tech text-[#0F2942] font-bold focus:border-[#07B1C5] focus:outline-none"
                        />
                      </div>
                      <span className="font-mono-tech text-[9px] text-[#181B1E]/50 mt-0.5 block">
                        Valor total de la solución o contrato
                      </span>
                    </div>

                    {/* Estado & Validez */}
                    <div>
                      <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                        Estado de la Cotización
                      </label>
                      <select
                        value={formData.quoteStatus || 'Borrador'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quoteStatus: e.target.value as any,
                          })
                        }
                        className="w-full rounded-md border border-[#0F2942]/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F2942] focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                      >
                        <option value="Borrador">📝 Borrador</option>
                        <option value="Enviada">📤 Enviada al Cliente</option>
                        <option value="En Negociación">🤝 En Negociación</option>
                        <option value="Aprobada">✅ Aprobada</option>
                        <option value="Rechazada">❌ Rechazada</option>
                      </select>
                    </div>
                  </div>

                  {/* Campo de Descripción Detallada */}
                  <div>
                    <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                      Descripción Detallada de la Cotización &amp; Alcance <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.quoteDescription ?? formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quoteDescription: e.target.value,
                        })
                      }
                      placeholder="Describe los entregables, módulos incluidos, licencias, horas estimadas y alcance de la cotización..."
                      className="w-full rounded-md border border-[#0F2942]/20 bg-white px-3 py-2 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                    />
                  </div>

                  {/* Condiciones Comerciales */}
                  <div>
                    <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                      Condiciones Comerciales &amp; Forma de Pago
                    </label>
                    <textarea
                      rows={2}
                      value={formData.quoteCommercialConditions || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quoteCommercialConditions: e.target.value,
                        })
                      }
                      placeholder="Ej. 40% anticipo a la firma, 30% contra PoC, 30% acta final. Validez: 30 días calendario..."
                      className="w-full rounded-md border border-[#0F2942]/20 bg-white px-3 py-2 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                    />
                  </div>

                  {/* Adjuntar Archivo Excel (.xlsx, .xls, .csv) */}
                  <div className="rounded-xl border border-[#0F2942]/15 bg-white p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-[#07B1C5]" />
                        <span className="font-mono-tech text-xs font-bold text-[#0F2942] uppercase">
                          Anexo Económico en Excel
                        </span>
                      </div>
                      <span className="font-mono-tech text-[9.5px] text-[#181B1E]/60">
                        Formatos soportados: .xlsx, .xls, .csv (Máx. 25 MB)
                      </span>
                    </div>

                    {formData.quoteAttachedFileName ? (
                      /* Display Attached File Card */
                      <div className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/80 border border-[#0F2942]/15 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2F7F61] text-white">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0F2942] truncate">
                              {formData.quoteAttachedFileName}
                            </div>
                            <div className="font-mono-tech text-[9.5px] text-[#181B1E]/60">
                              {formData.quoteAttachedFileSize || '240 KB'} · Adjuntado el {formData.quoteAttachedFileDate || '2026-09-29'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const blob = new Blob(
                                [`Cliente,${formData.companyName}\nSetup,${formData.quoteSetupPrice}\nVenta,${formData.quoteSalePrice}\nDescripcion,${formData.quoteDescription}`],
                                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = formData.quoteAttachedFileName || 'Cotizacion.xlsx';
                              a.click();
                            }}
                            className="inline-flex items-center gap-1 rounded bg-[#0F2942]/10 hover:bg-[#0F2942] hover:text-white text-[#0F2942] px-2.5 py-1 text-[10px] font-mono-tech font-bold transition-all cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Descargar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                quoteAttachedFileName: '',
                                quoteAttachedFileSize: '',
                                quoteAttachedFileDate: '',
                              })
                            }
                            className="p-1 text-[#181B1E]/40 hover:text-red-600 transition-colors cursor-pointer"
                            title="Quitar archivo adjunto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag and drop upload zone */
                      <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#0F2942]/20 hover:border-[#07B1C5] bg-[#F3F0EB]/30 hover:bg-[#07B1C5]/5 p-5 text-center transition-all cursor-pointer group">
                        <Upload className="h-6 w-6 text-[#181B1E]/40 group-hover:text-[#07B1C5] transition-colors mb-1.5" />
                        <span className="font-mono-tech text-xs font-bold text-[#0F2942] group-hover:text-[#07B1C5]">
                          Haz clic para adjuntar o arrastra tu archivo Excel aquí
                        </span>
                        <span className="font-mono-tech text-[10px] text-[#181B1E]/50 mt-0.5">
                          Presupuestos, modelos de costos, descomposición de licencias y tarifas
                        </span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const sizeInKB = Math.round(file.size / 1024);
                              setFormData({
                                ...formData,
                                quoteAttachedFileName: file.name,
                                quoteAttachedFileSize: `${sizeInKB} KB`,
                                quoteAttachedFileDate: new Date().toISOString().split('T')[0],
                              });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between border-t border-[#0F2942]/10 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  {formSection !== 'empresa' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formSection === 'cotizacion') setFormSection('compromisos');
                        else if (formSection === 'compromisos') setFormSection('oportunidad');
                        else if (formSection === 'oportunidad') setFormSection('contactos');
                        else if (formSection === 'contactos') setFormSection('empresa');
                      }}
                      className="rounded-lg border border-[#0F2942]/20 px-3 py-1.5 font-mono-tech text-xs text-[#0F2942] hover:bg-[#F3F0EB] transition-colors cursor-pointer"
                    >
                      ← Anterior
                    </button>
                  )}
                  {formSection !== 'cotizacion' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formSection === 'empresa') setFormSection('contactos');
                        else if (formSection === 'contactos') setFormSection('oportunidad');
                        else if (formSection === 'oportunidad') setFormSection('compromisos');
                        else if (formSection === 'compromisos') setFormSection('cotizacion');
                      }}
                      className="rounded-lg bg-[#0F2942]/10 px-3 py-1.5 font-mono-tech text-xs font-semibold text-[#0F2942] hover:bg-[#0F2942]/20 transition-colors cursor-pointer"
                    >
                      Siguiente Sección →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-lg border border-[#0F2942]/20 px-3.5 py-1.5 font-mono-tech text-xs text-[#0F2942] hover:bg-[#F3F0EB] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-4 py-1.5 font-mono-tech text-xs font-bold text-white hover:bg-[#0F2942]/90 shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#07B1C5]" />
                    <span>Guardar Ficha &amp; Cotización</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
