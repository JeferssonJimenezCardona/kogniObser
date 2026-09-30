import React, { useState } from 'react';
import {
  Settings,
  Database,
  Briefcase,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Building2,
  Layers,
  Globe,
  Tag,
  Clock,
  UserCheck,
  Sliders,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  SECTORS,
  COUNTRIES,
  PARTNERS,
  SOLUTION_PRODUCTS,
  CONTRACT_TYPES,
  LEAD_SOURCES,
  IndustrySector,
} from '../data/kogniaData';

export type AdminTab = 'moc_fields' | 'project_fields' | 'roles_access';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Gerente Comercial' | 'Director de Proyectos' | 'Preventa Técnica' | 'Consultor';
  status: 'Activo' | 'Inactivo';
  lastLogin: string;
}

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'u-1',
    name: 'Camila Restrepo',
    email: 'crestrepo@kognia.ai',
    role: 'SuperAdmin',
    status: 'Activo',
    lastLogin: '2026-09-29 17:45',
  },
  {
    id: 'u-2',
    name: 'Santiago Mendoza',
    email: 'smendoza@kognia.ai',
    role: 'Gerente Comercial',
    status: 'Activo',
    lastLogin: '2026-09-29 16:20',
  },
  {
    id: 'u-3',
    name: 'Laura Villamizar',
    email: 'lvillamizar@kognia.ai',
    role: 'Gerente Comercial',
    status: 'Activo',
    lastLogin: '2026-09-28 11:10',
  },
  {
    id: 'u-4',
    name: 'Mateo Londoño',
    email: 'mlondono@kognia.ai',
    role: 'Director de Proyectos',
    status: 'Activo',
    lastLogin: '2026-09-29 15:30',
  },
  {
    id: 'u-5',
    name: 'Daniela Pineda',
    email: 'dpineda@kognia.ai',
    role: 'Preventa Técnica',
    status: 'Activo',
    lastLogin: '2026-09-29 14:00',
  },
];

export const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('moc_fields');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // -------------------------------------------------------------
  // TAB 1: CAMPOS DEL MOC
  // -------------------------------------------------------------
  const [sectorsList, setSectorsList] = useState<string[]>(SECTORS);
  const [newSector, setNewSector] = useState('');

  const [partnersList, setPartnersList] = useState<string[]>(PARTNERS);
  const [newPartner, setNewPartner] = useState('');

  const [productsList, setProductsList] = useState<string[]>(SOLUTION_PRODUCTS);
  const [newProduct, setNewProduct] = useState('');

  const [countriesList, setCountriesList] = useState<string[]>(COUNTRIES);
  const [newCountry, setNewCountry] = useState('');

  const [contractsList, setContractsList] = useState<string[]>(CONTRACT_TYPES);
  const [newContract, setNewContract] = useState('');

  const [leadSourcesList, setLeadSourcesList] = useState<string[]>(LEAD_SOURCES);
  const [newLeadSource, setNewLeadSource] = useState('');

  // -------------------------------------------------------------
  // TAB 2: CAMPOS DE PROYECTOS
  // -------------------------------------------------------------
  const [taskStatuses, setTaskStatuses] = useState<{ id: string; name: string; color: string }[]>([
    { id: 'ts-1', name: 'Por Iniciar', color: '#94A3B8' },
    { id: 'ts-2', name: 'En Curso', color: '#07B1C5' },
    { id: 'ts-3', name: 'En Revisión', color: '#D97706' },
    { id: 'ts-4', name: 'Atrasado', color: '#EF4444' },
    { id: 'ts-5', name: 'Completado', color: '#2F7F61' },
  ]);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#07B1C5');

  const [collaboratorRoles, setCollaboratorRoles] = useState<string[]>([
    'Lead Data Architect & PM',
    'Senior MLOps & Platform Engineer',
    'Senior IoT & Streaming Engineer',
    'Data Governance & PCI Lead',
    'Automation & Advanced Control Lead',
  ]);
  const [newRoleName, setNewRoleName] = useState('');

  const [workSchedules, setWorkSchedules] = useState<{ name: string; hours: number; days: number }[]>([
    { name: 'Semana LV - Dia (186h estándar)', hours: 186, days: 22 },
    { name: 'Semana LV - Turno Extendido (200h)', hours: 200, days: 22 },
    { name: 'Turno Rotativo Faena Minera (168h)', hours: 168, days: 14 },
    { name: 'Medio Tiempo / Preventa (93h)', hours: 93, days: 22 },
  ]);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleHours, setNewScheduleHours] = useState(186);

  const [limitThreshold, setLimitThreshold] = useState(85);
  const [overloadThreshold, setOverloadThreshold] = useState(100);

  // -------------------------------------------------------------
  // TAB 3: GESTIÓN DE ROLES Y ACCESOS (RBAC)
  // -------------------------------------------------------------
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserAccount['role']>('Gerente Comercial');
  const [userStatus, setUserStatus] = useState<UserAccount['status']>('Activo');

  const triggerSaveNotification = () => {
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Handlers for MOC fields
  const handleAddSector = () => {
    if (!newSector.trim()) return;
    setSectorsList((prev) => [...prev, newSector.trim()]);
    setNewSector('');
    triggerSaveNotification();
  };

  const handleRemoveSector = (sec: string) => {
    setSectorsList((prev) => prev.filter((s) => s !== sec));
    triggerSaveNotification();
  };

  const handleAddPartner = () => {
    if (!newPartner.trim()) return;
    setPartnersList((prev) => [...prev, newPartner.trim()]);
    setNewPartner('');
    triggerSaveNotification();
  };

  const handleRemovePartner = (item: string) => {
    setPartnersList((prev) => prev.filter((p) => p !== item));
    triggerSaveNotification();
  };

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    setProductsList((prev) => [...prev, newProduct.trim()]);
    setNewProduct('');
    triggerSaveNotification();
  };

  const handleRemoveProduct = (item: string) => {
    setProductsList((prev) => prev.filter((p) => p !== item));
    triggerSaveNotification();
  };

  const handleAddCountry = () => {
    if (!newCountry.trim()) return;
    setCountriesList((prev) => [...prev, newCountry.trim()]);
    setNewCountry('');
    triggerSaveNotification();
  };

  const handleRemoveCountry = (item: string) => {
    setCountriesList((prev) => prev.filter((c) => c !== item));
    triggerSaveNotification();
  };

  const handleAddContract = () => {
    if (!newContract.trim()) return;
    setContractsList((prev) => [...prev, newContract.trim()]);
    setNewContract('');
    triggerSaveNotification();
  };

  const handleRemoveContract = (item: string) => {
    setContractsList((prev) => prev.filter((c) => c !== item));
    triggerSaveNotification();
  };

  const handleAddLeadSource = () => {
    if (!newLeadSource.trim()) return;
    setLeadSourcesList((prev) => [...prev, newLeadSource.trim()]);
    setNewLeadSource('');
    triggerSaveNotification();
  };

  const handleRemoveLeadSource = (item: string) => {
    setLeadSourcesList((prev) => prev.filter((l) => l !== item));
    triggerSaveNotification();
  };

  // Handlers for Project fields
  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    setTaskStatuses((prev) => [
      ...prev,
      { id: `ts-${Date.now()}`, name: newStatusName.trim(), color: newStatusColor },
    ]);
    setNewStatusName('');
    triggerSaveNotification();
  };

  const handleRemoveStatus = (id: string) => {
    setTaskStatuses((prev) => prev.filter((s) => s.id !== id));
    triggerSaveNotification();
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    setCollaboratorRoles((prev) => [...prev, newRoleName.trim()]);
    setNewRoleName('');
    triggerSaveNotification();
  };

  const handleRemoveRole = (r: string) => {
    setCollaboratorRoles((prev) => prev.filter((item) => item !== r));
    triggerSaveNotification();
  };

  const handleAddSchedule = () => {
    if (!newScheduleName.trim()) return;
    setWorkSchedules((prev) => [
      ...prev,
      { name: newScheduleName.trim(), hours: newScheduleHours, days: 22 },
    ]);
    setNewScheduleName('');
    triggerSaveNotification();
  };

  const handleRemoveSchedule = (name: string) => {
    setWorkSchedules((prev) => prev.filter((s) => s.name !== name));
    triggerSaveNotification();
  };

  // Handlers for Users & Roles
  const handleOpenNewUser = () => {
    setEditingUserId(null);
    setUserName('');
    setUserEmail('');
    setUserRole('Gerente Comercial');
    setUserStatus('Activo');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: UserAccount) => {
    setEditingUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserStatus(u.status);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? { ...u, name: userName, email: userEmail, role: userRole, status: userStatus }
            : u
        )
      );
    } else {
      const newUser: UserAccount = {
        id: `u-${Date.now()}`,
        name: userName,
        email: userEmail,
        role: userRole,
        status: userStatus,
        lastLogin: 'Recién Creado',
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setIsUserModalOpen(false);
    triggerSaveNotification();
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    triggerSaveNotification();
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-[#0F2942]/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F2942] text-white shadow-xs">
              <Settings className="h-4 w-4 text-[#07B1C5]" />
            </div>
            <h1 className="font-mono-tech text-base font-bold uppercase tracking-wider text-[#0F2942]">
              Panel de Administración &amp; Parametrización
            </h1>
          </div>
          <p className="font-mono-tech text-[10.5px] text-[#181B1E]/60 mt-0.5 pl-9">
            Configuración global de listas desplegables, catálogos del MOC, variables de proyectos y control de accesos RBAC
          </p>
        </div>

        {saveSuccessNotice && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F7F61]/15 border border-[#2F7F61]/30 px-3 py-1.5 font-mono-tech text-xs font-bold text-[#2F7F61] animate-in fade-in duration-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Parametrización Guardada con Éxito</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs (3 Hojas) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#0F2942]/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('moc_fields')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'moc_fields'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-[#0F2942] border border-[#0F2942]/10 hover:bg-[#F3F0EB]'
          }`}
        >
          <Database className="h-3.5 w-3.5 text-[#07B1C5]" />
          <span>1. Configuración Campos del MOC</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('project_fields')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'project_fields'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-[#0F2942] border border-[#0F2942]/10 hover:bg-[#F3F0EB]'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5 text-[#07B1C5]" />
          <span>2. Configuración Campos de Proyectos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles_access')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'roles_access'
              ? 'bg-[#0F2942] text-white shadow-xs'
              : 'bg-white text-[#0F2942] border border-[#0F2942]/10 hover:bg-[#F3F0EB]'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#07B1C5]" />
          <span>3. Administración &amp; Accesos por Roles</span>
        </button>
      </div>

      {/* =====================================================================
          HOJA 1: CONFIGURACIÓN DE CAMPOS DEL MOC
      ===================================================================== */}
      {activeTab === 'moc_fields' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#0F2942]/5 border border-[#0F2942]/10 p-3.5 text-xs text-[#0F2942] font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#07B1C5]" />
              <span>
                Edita los catálogos de opciones para las fichas de clientes y oportunidades comerciales en el MOC.
              </span>
            </div>
            <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
              6 Catálogos Parametrizables
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* 1. Sectores / Mercados */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Sectores / Mercados Estratégicos ({sectorsList.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  placeholder="Nuevo sector (ej. Agroindustria & Alimentos)..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSector()}
                />
                <button
                  type="button"
                  onClick={handleAddSector}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {sectorsList.map((sec) => (
                  <div
                    key={sec}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <span>{sec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSector(sec)}
                      className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                      title="Eliminar sector"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Partners Tecnológicos */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Partners Tecnológicos Asociados ({partnersList.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPartner}
                  onChange={(e) => setNewPartner(e.target.value)}
                  placeholder="Nuevo partner (ej. NVIDIA AI / IBM)..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                />
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {partnersList.map((p) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePartner(p)}
                      className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                      title="Eliminar partner"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Productos / Soluciones */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Productos &amp; Líneas de Solución ({productsList.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="Nuevo producto (ej. KOGNIA Vision AI)..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {productsList.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(item)}
                      className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Países & Cobertura */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Países de Operación ({countriesList.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder="Nuevo país (ej. Ecuador / Argentina)..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCountry()}
                />
                <button
                  type="button"
                  onClick={handleAddCountry}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {countriesList.map((c) => (
                  <div
                    key={c}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(c)}
                      className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                      title="Eliminar país"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          HOJA 2: CONFIGURACIÓN DE CAMPOS DE PROYECTOS
      ===================================================================== */}
      {activeTab === 'project_fields' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#0F2942]/5 border border-[#0F2942]/10 p-3.5 text-xs text-[#0F2942] font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#07B1C5]" />
              <span>
                Parametriza estados de tareas, roles de consultores, jornadas de trabajo y umbrales de capacidad.
              </span>
            </div>
            <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
              Gestión de Capacidad &amp; Tareas
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* 1. Estados de Tareas */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Estados de Tareas &amp; Actividades ({taskStatuses.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="Nuevo estado (ej. En Validación QA)..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                />
                <input
                  type="color"
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-[#0F2942]/20"
                  title="Color del estado"
                />
                <button
                  type="button"
                  onClick={handleAddStatus}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {taskStatuses.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                      <span>{st.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStatus(st.id)}
                      className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                      title="Eliminar estado"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Roles de Colaboradores */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Roles Técnicos &amp; Consultores ({collaboratorRoles.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nuevo rol (ej. Cloud DevOps Engineer)..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {collaboratorRoles.map((r) => (
                  <div
                    key={r}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(r)}
                      className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                      title="Eliminar rol"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Jornadas Laborales & Horarios Base */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Jornadas &amp; Horas Base Mensuales ({workSchedules.length})
                  </h3>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  placeholder="Nombre de jornada..."
                  className="flex-1 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                />
                <input
                  type="number"
                  value={newScheduleHours}
                  onChange={(e) => setNewScheduleHours(Number(e.target.value))}
                  className="w-20 rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1.5 font-mono-tech text-xs text-[#0F2942]"
                  placeholder="Horas"
                />
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="rounded-md bg-[#0F2942] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {workSchedules.map((ws) => (
                  <div
                    key={ws.name}
                    className="flex items-center justify-between rounded-lg bg-[#F3F0EB]/50 border border-[#0F2942]/8 px-3 py-2 text-xs font-medium text-[#0F2942]"
                  >
                    <span>{ws.name}</span>
                    <div className="flex items-center gap-3 font-mono-tech text-[10px]">
                      <span className="font-bold text-[#07B1C5]">{ws.hours}h / mes</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(ws.name)}
                        className="text-[#181B1E]/40 hover:text-red-600 transition-colors"
                        title="Eliminar jornada"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Umbrales de Alertas de Capacidad */}
            <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#07B1C5]" />
                  <h3 className="text-xs font-bold text-[#0F2942] uppercase">
                    Umbrales de Alerta de Capacidad
                  </h3>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-700">🟠 Alerta de Límite de Asignación:</span>
                    <span className="font-mono-tech font-bold text-[#0F2942]">{limitThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={limitThreshold}
                    onChange={(e) => setLimitThreshold(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-red-700">🔴 Alerta de Sobrecarga Crítica:</span>
                    <span className="font-mono-tech font-bold text-[#0F2942]">{overloadThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="150"
                    value={overloadThreshold}
                    onChange={(e) => setOverloadThreshold(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={triggerSaveNotification}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors shadow-xs"
                  >
                    <Save className="h-3.5 w-3.5 text-[#07B1C5]" />
                    <span>Guardar Umbrales</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          HOJA 3: ADMINISTRACIÓN DE USUARIOS & ACCESOS POR ROLES (RBAC)
      ===================================================================== */}
      {activeTab === 'roles_access' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white border border-[#0F2942]/10 p-3.5 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-[#0F2942]">
                Usuarios del Sistema &amp; Permisos por Rol (RBAC)
              </h2>
              <p className="font-mono-tech text-[10px] text-[#181B1E]/60">
                Control de acceso granular a MOC, Proyectos, Cotizaciones y Administración
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewUser}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5 text-[#07B1C5]" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* User Table */}
          <div className="rounded-xl bg-white border border-[#0F2942]/10 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 font-mono-tech text-[10px] text-[#0F2942]/70 uppercase">
                  <th className="py-2.5 pl-4 pr-2 font-medium">Usuario / Nombre</th>
                  <th className="px-2.5 py-2.5 font-medium">Email Corporativo</th>
                  <th className="px-2.5 py-2.5 font-medium">Rol Asignado</th>
                  <th className="px-2.5 py-2.5 font-medium">Estado</th>
                  <th className="px-2.5 py-2.5 font-medium">Último Acceso</th>
                  <th className="py-2.5 pl-2 pr-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F2942]/8 text-[11px]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F3F0EB]/30 transition-colors">
                    <td className="py-3 pl-4 pr-2 font-bold text-xs text-[#0F2942]">
                      {u.name}
                    </td>
                    <td className="px-2.5 py-3 font-mono-tech text-[10.5px] text-[#181B1E]/70">
                      {u.email}
                    </td>
                    <td className="px-2.5 py-3">
                      <span className="inline-flex items-center rounded-md bg-[#0F2942]/10 border border-[#0F2942]/20 px-2 py-0.5 font-mono-tech text-[10px] font-bold text-[#0F2942]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-2.5 py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono-tech text-[9.5px] font-bold ${
                          u.status === 'Activo'
                            ? 'bg-[#2F7F61]/15 text-[#2F7F61] border border-[#2F7F61]/30'
                            : 'bg-red-500/10 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-2.5 py-3 font-mono-tech text-[10px] text-[#181B1E]/50">
                      {u.lastLogin}
                    </td>
                    <td className="py-3 pl-2 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="rounded p-1 text-[#181B1E]/50 hover:bg-[#0F2942]/10 hover:text-[#0F2942] transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="rounded p-1 text-[#181B1E]/40 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RBAC Matrix Breakdown */}
          <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0F2942] uppercase">
              Matriz de Permisos por Rol
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono-tech border-collapse">
                <thead>
                  <tr className="border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 text-[#0F2942] uppercase font-bold">
                    <th className="p-2">Rol</th>
                    <th className="p-2 text-center">MOC (Ver/Editar)</th>
                    <th className="p-2 text-center">Proyectos (Ver/Editar)</th>
                    <th className="p-2 text-center">Cotizaciones</th>
                    <th className="p-2 text-center">Administración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F2942]/8 text-[#181B1E]">
                  <tr>
                    <td className="p-2 font-bold text-[#0F2942]">SuperAdmin</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total (Lectura/Escritura)</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total (Lectura/Escritura)</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#0F2942]">Gerente Comercial</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total (Lectura/Escritura)</td>
                    <td className="p-2 text-center text-[#07B1C5] font-semibold">👀 Solo Lectura</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total</td>
                    <td className="p-2 text-center text-red-500">✗ Sin Acceso</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#0F2942]">Director de Proyectos</td>
                    <td className="p-2 text-center text-[#07B1C5] font-semibold">👀 Solo Lectura</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Total (Lectura/Escritura)</td>
                    <td className="p-2 text-center text-[#07B1C5] font-semibold">👀 Solo Lectura</td>
                    <td className="p-2 text-center text-red-500">✗ Sin Acceso</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-[#0F2942]">Preventa Técnica</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Preventa</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Asignación</td>
                    <td className="p-2 text-center text-[#2F7F61] font-bold">✓ Crear Cotización</td>
                    <td className="p-2 text-center text-red-500">✗ Sin Acceso</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREAR / EDITAR USUARIO (RBAC)
      ===================================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-md flex flex-col rounded-2xl bg-white border border-[#0F2942]/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#07B1C5]" />
                <h3 className="text-sm font-bold text-[#0F2942]">
                  {editingUserId ? 'Editar Usuario' : 'Nuevo Usuario Corporativo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="rounded p-1 text-[#181B1E]/60 hover:bg-[#0F2942]/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5">
              <div>
                <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej. Andrés Echeverri"
                  className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                  Email Corporativo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="aecheverri@kognia.ai"
                  className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                  Rol en el Sistema
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserAccount['role'])}
                  className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs font-semibold text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Gerente Comercial">Gerente Comercial</option>
                  <option value="Director de Proyectos">Director de Proyectos</option>
                  <option value="Preventa Técnica">Preventa Técnica</option>
                  <option value="Consultor">Consultor / Operador</option>
                </select>
              </div>

              <div>
                <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                  Estado
                </label>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as UserAccount['status'])}
                  className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs font-semibold text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0F2942]/10">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="rounded-lg border border-[#0F2942]/20 px-4 py-1.5 text-xs font-semibold text-[#0F2942]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0F2942] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
