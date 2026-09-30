import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  Kanban as KanbanIcon,
  CalendarRange,
  Users,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowUpDown,
  Filter,
  Percent,
  X,
  Calendar,
  AlertCircle,
  Building2,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  TrendingUp,
  Activity,
  Eye,
} from 'lucide-react';
import {
  ProjectActivity,
  TaskStatus,
  ActivityTask,
  CollaboratorCapacity,
  MONTH_COLUMNS,
  INITIAL_COLLABORATORS,
  CLIENT_COMPANIES,
} from '../data/kogniaData';

interface ProjectsModuleProps {
  activities: ProjectActivity[];
  onAddActivity: (act: ProjectActivity) => void;
  onEditActivity: (act: ProjectActivity) => void;
  onDeleteActivity: (activityId: string) => void;
  onUpdateActivityStatus: (activityId: string, nextStatus: TaskStatus) => void;
  onUpdateAllocation: (activityId: string, newPercent: number) => void;
}

type ProjectViewTab = 'tabla' | 'kanban' | 'gantt' | 'capacidad';

const STATUSES: TaskStatus[] = [
  'Por Iniciar',
  'En Curso',
  'En Revisión',
  'Completado',
];

// Timeline headers for Gantt
const GANTT_START = new Date('2026-08-01T00:00:00').getTime();
const GANTT_END = new Date('2027-03-31T00:00:00').getTime();
const GANTT_MONTH_HEADERS = [
  'Ago 26',
  'Sep 26',
  'Oct 26',
  'Nov 26',
  'Dic 26',
  'Ene 27',
  'Feb 27',
  'Mar 27',
];

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onUpdateActivityStatus,
  onUpdateAllocation,
}) => {
  const [activeTab, setActiveTab] = useState<ProjectViewTab>('tabla');

  // Shared Filters for Tabla, Kanban, and Gantt
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('Todos');
  const [filterClient, setFilterClient] = useState('Todos');
  const [filterPerson, setFilterPerson] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterMonth, setFilterMonth] = useState('Todos');

  // Filters for Capacidad
  const [capacityMonthFilter, setCapacityMonthFilter] = useState<string>('todos');
  const [capacityAlertFilter, setCapacityAlertFilter] = useState<
    'todos' | 'sobrecarga' | 'limite' | 'disponible'
  >('todos');
  const [capacitySearch, setCapacitySearch] = useState('');
  const [capacitySortMode, setCapacitySortMode] = useState<'desc' | 'asc' | 'name'>('desc');

  // Collaborators capacity live state
  const [collaborators, setCollaborators] = useState<CollaboratorCapacity[]>(INITIAL_COLLABORATORS);

  // Modal State (Create or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    projectName: 'Plataforma IoT & Telemetría en Pozos Upstream',
    client: CLIENT_COMPANIES[0] || 'PetroAndina Exploración & Refinación',
    activityTitle: '',
    taskDetails: '',
    assignedPerson: 'Mateo Londoño',
    allocationPercent: 40,
    progressPercent: 0,
    status: 'Por Iniciar' as TaskStatus,
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    additionalDate: '2026-11-20',
    estimatedHours: 120,
    activeMonths: ['2026-10', '2026-11'],
    tasks: [
      { id: 't-new-1', title: 'Planificación de entregables y arquitectura', completed: false },
      { id: 't-new-2', title: 'Ejecución técnica e integración', completed: false },
      { id: 't-new-3', title: 'Validación en ambiente de pruebas', completed: false },
    ] as ActivityTask[],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCollaboratorForDetail, setSelectedCollaboratorForDetail] = useState<CollaboratorCapacity | null>(null);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingActivityId(null);
    setFormData(initialFormState);
    setNewTaskInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (act: ProjectActivity) => {
    setEditingActivityId(act.id);
    setFormData({
      projectName: act.projectName,
      client: act.client,
      activityTitle: act.activityTitle,
      taskDetails: act.taskDetails || '',
      assignedPerson: act.assignedPerson,
      allocationPercent: act.allocationPercent,
      progressPercent: act.progressPercent ?? (act.status === 'Completado' ? 100 : act.status === 'Por Iniciar' ? 0 : 50),
      status: act.status,
      startDate: act.startDate,
      endDate: act.endDate,
      additionalDate: act.additionalDate || '',
      estimatedHours: act.estimatedHours,
      activeMonths: act.activeMonths || ['2026-10'],
      tasks: act.tasks?.length
        ? act.tasks
        : [
            { id: `t-def-1`, title: 'Diseño e inicio de entregables', completed: (act.progressPercent || 0) > 0 },
            { id: `t-def-2`, title: 'Implementación técnica', completed: (act.progressPercent || 0) >= 50 },
            { id: `t-def-3`, title: 'Cierre y entrega al cliente', completed: (act.progressPercent || 0) === 100 },
          ],
    });
    setNewTaskInput('');
    setIsModalOpen(true);
  };

  // Calculate Status from Progress %
  const getStatusFromProgress = (progress: number): TaskStatus => {
    if (progress <= 0) return 'Por Iniciar';
    if (progress >= 100) return 'Completado';
    return 'En Curso';
  };

  // Form Progress change handler (auto updates status)
  const handleProgressChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    setFormData((prev) => ({
      ...prev,
      progressPercent: clamped,
      status: getStatusFromProgress(clamped),
    }));
  };

  // Form Status change handler (auto updates progress)
  const handleStatusChange = (newSt: TaskStatus) => {
    let newProg = formData.progressPercent;
    if (newSt === 'Completado') newProg = 100;
    else if (newSt === 'Por Iniciar') newProg = 0;
    else if (newProg === 0 || newProg === 100) newProg = 50;

    setFormData((prev) => ({
      ...prev,
      status: newSt,
      progressPercent: newProg,
    }));
  };

  // Add task to checklist in form
  const handleAddTaskToForm = () => {
    if (!newTaskInput.trim()) return;
    const newTask: ActivityTask = {
      id: `t-${Date.now()}`,
      title: newTaskInput.trim(),
      completed: false,
    };
    const updatedTasks = [...formData.tasks, newTask];
    // recalculate progress if there are tasks
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const autoProgress = Math.round((completedCount / updatedTasks.length) * 100);

    setFormData((prev) => ({
      ...prev,
      tasks: updatedTasks,
      progressPercent: autoProgress,
      status: getStatusFromProgress(autoProgress),
    }));
    setNewTaskInput('');
  };

  // Toggle task in form
  const handleToggleTaskInForm = (taskId: string) => {
    const updatedTasks = formData.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const autoProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;

    setFormData((prev) => ({
      ...prev,
      tasks: updatedTasks,
      progressPercent: autoProgress,
      status: getStatusFromProgress(autoProgress),
    }));
  };

  // Remove task from form
  const handleRemoveTaskFromForm = (taskId: string) => {
    const updatedTasks = formData.tasks.filter((t) => t.id !== taskId);
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const autoProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;

    setFormData((prev) => ({
      ...prev,
      tasks: updatedTasks,
      progressPercent: autoProgress,
      status: getStatusFromProgress(autoProgress),
    }));
  };

  // Quick toggle task directly from the Table view
  const handleQuickToggleTableTask = (activity: ProjectActivity, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTasks = (activity.tasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const autoProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
    const newStatus = getStatusFromProgress(autoProgress);

    const updatedAct: ProjectActivity = {
      ...activity,
      tasks: updatedTasks,
      progressPercent: autoProgress,
      status: newStatus,
    };
    onEditActivity(updatedAct);
  };

  // Save (Create or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activityTitle.trim()) return;

    const personObj = collaborators.find((m) => m.name === formData.assignedPerson);

    if (editingActivityId) {
      const existing = activities.find((a) => a.id === editingActivityId);
      const updated: ProjectActivity = {
        id: editingActivityId,
        code: existing?.code || `ACT-${String(activities.length).padStart(2, '0')}`,
        projectId: existing?.projectId || `prj-${Date.now()}`,
        projectName: formData.projectName,
        client: formData.client,
        activityTitle: formData.activityTitle.trim(),
        taskDetails: formData.taskDetails.trim() || formData.tasks.map((t) => t.title).join(' · '),
        tasks: formData.tasks,
        assignedPerson: formData.assignedPerson,
        assignedRole: personObj?.role || existing?.assignedRole || 'Technical Specialist',
        allocationPercent: Number(formData.allocationPercent) || 30,
        progressPercent: Number(formData.progressPercent) || 0,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        additionalDate: formData.additionalDate,
        estimatedHours: Number(formData.estimatedHours) || 100,
        loggedHours: existing?.loggedHours || 0,
        activeMonths: formData.activeMonths,
      };
      onEditActivity(updated);
    } else {
      const nextCode = `ACT-${String(activities.length + 1).padStart(2, '0')}`;
      const created: ProjectActivity = {
        id: `act-${Date.now()}`,
        code: nextCode,
        projectId: `prj-${Date.now()}`,
        projectName: formData.projectName,
        client: formData.client,
        activityTitle: formData.activityTitle.trim(),
        taskDetails: formData.taskDetails.trim() || formData.tasks.map((t) => t.title).join(' · '),
        tasks: formData.tasks,
        assignedPerson: formData.assignedPerson,
        assignedRole: personObj?.role || 'Technical Specialist',
        allocationPercent: Number(formData.allocationPercent) || 30,
        progressPercent: Number(formData.progressPercent) || 0,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        additionalDate: formData.additionalDate,
        estimatedHours: Number(formData.estimatedHours) || 120,
        loggedHours: 0,
        activeMonths: formData.activeMonths,
      };
      onAddActivity(created);
    }

    setIsModalOpen(false);
  };

  // Delete activity confirmation
  const handleConfirmDelete = (actId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onDeleteActivity(actId);
    setDeleteConfirmId(null);
    if (isModalOpen && editingActivityId === actId) {
      setIsModalOpen(false);
    }
  };

  // Unique lists for filtering
  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.projectName)));
  }, [activities]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.client)));
  }, [activities]);

  const uniquePeople = useMemo(() => {
    return Array.from(new Set(collaborators.map((c) => c.name)));
  }, [collaborators]);

  // Filtered activities (Shared across Tabla, Kanban, and Gantt)
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchProj = filterProject === 'Todos' || act.projectName === filterProject;
      const matchClient = filterClient === 'Todos' || act.client === filterClient;
      const matchPerson = filterPerson === 'Todos' || act.assignedPerson === filterPerson;
      const matchStatus = filterStatus === 'Todos' || act.status === filterStatus;
      const matchMonth =
        filterMonth === 'Todos' || (act.activeMonths && act.activeMonths.includes(filterMonth));

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        act.activityTitle.toLowerCase().includes(q) ||
        act.code.toLowerCase().includes(q) ||
        act.client.toLowerCase().includes(q) ||
        act.assignedPerson.toLowerCase().includes(q) ||
        (act.taskDetails && act.taskDetails.toLowerCase().includes(q));

      return matchProj && matchClient && matchPerson && matchStatus && matchMonth && matchSearch;
    });
  }, [activities, filterProject, filterClient, filterPerson, filterStatus, filterMonth, searchQuery]);

  // Global Average Progress Calculation
  const averageProgress = useMemo(() => {
    if (filteredActivities.length === 0) return 0;
    const total = filteredActivities.reduce((acc, a) => acc + (a.progressPercent || 0), 0);
    return Math.round(total / filteredActivities.length);
  }, [filteredActivities]);

  const completedActivitiesCount = useMemo(() => {
    return filteredActivities.filter((a) => a.status === 'Completado' || a.progressPercent === 100).length;
  }, [filteredActivities]);

  // Visible Month Columns based on Filter (todos, year-2026, year-2027, or specific month)
  const visibleMonthColumns = useMemo(() => {
    if (capacityMonthFilter === 'todos') {
      return MONTH_COLUMNS;
    }
    if (capacityMonthFilter === 'year-2026') {
      return MONTH_COLUMNS.filter((m) => m.key.startsWith('2026'));
    }
    if (capacityMonthFilter === 'year-2027') {
      return MONTH_COLUMNS.filter((m) => m.key.startsWith('2027'));
    }
    return MONTH_COLUMNS.filter((m) => m.key === capacityMonthFilter);
  }, [capacityMonthFilter]);

  // Dynamic Average Allocation per Collaborator for the currently visible/filtered period
  const getColDynamicAvg = (col: CollaboratorCapacity) => {
    const months = visibleMonthColumns;
    if (months.length === 0) return 0;
    const sum = months.reduce((acc, m) => {
      const val = col.monthlyAllocations[m.key]?.totalPercent || 0;
      return acc + val;
    }, 0);
    return Math.round(sum / months.length);
  };

  // Capacity filtering
  const filteredCapacityCollaborators = useMemo(() => {
    return collaborators.filter((col) => {
      const q = capacitySearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        col.name.toLowerCase().includes(q) ||
        col.role.toLowerCase().includes(q) ||
        col.department.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (capacityAlertFilter === 'todos') return true;

      const activeMonthsData = visibleMonthColumns
        .map((m) => col.monthlyAllocations[m.key])
        .filter(Boolean);

      if (activeMonthsData.length === 0) return true;

      if (capacityAlertFilter === 'sobrecarga') {
        return activeMonthsData.some((m) => m.isOverload);
      }
      if (capacityAlertFilter === 'limite') {
        return activeMonthsData.some((m) => m.isLimit);
      }
      if (capacityAlertFilter === 'disponible') {
        return activeMonthsData.some((m) => m.availablePercent >= 15);
      }

      return true;
    });
  }, [collaborators, capacitySearch, capacityAlertFilter, visibleMonthColumns]);

  // Overall Team Capacity KPI Metrics (Promedio Dinámico y Alertas según filtro activo)
  const capacityMetrics = useMemo(() => {
    if (collaborators.length === 0) {
      return {
        avgAllocation: 0,
        overloadCount: 0,
        limitCount: 0,
        availableCount: 0,
        totalHours: 0,
        assignedHours: 0,
      };
    }

    let totalAllocSum = 0;
    let totalAssignedHoursSum = 0;
    let totalAvailableHoursSum = 0;
    let overloadCount = 0;
    let limitCount = 0;
    let availableCount = 0;

    collaborators.forEach((col) => {
      const colAvg = getColDynamicAvg(col);
      totalAllocSum += colAvg;

      const activeMonthsData = visibleMonthColumns
        .map((m) => col.monthlyAllocations[m.key])
        .filter(Boolean);

      activeMonthsData.forEach((m) => {
        totalAssignedHoursSum += m.assignedHours || 0;
        totalAvailableHoursSum += m.availableHours || 186;
      });

      if (activeMonthsData.some((m) => m.isOverload)) overloadCount++;
      else if (activeMonthsData.some((m) => m.isLimit)) limitCount++;
      else availableCount++;
    });

    const avgAllocation = Math.round(totalAllocSum / (collaborators.length || 1));
    return {
      avgAllocation,
      overloadCount,
      limitCount,
      availableCount,
      totalHours: totalAvailableHoursSum,
      assignedHours: totalAssignedHoursSum,
    };
  }, [collaborators, visibleMonthColumns]);

  // Sorted Collaborators by Allocation (Mayor a Menor Carga por defecto / Menor a Mayor / Nombre)
  const sortedCapacityCollaborators = useMemo(() => {
    const list = [...filteredCapacityCollaborators];
    if (capacitySortMode === 'desc') {
      return list.sort((a, b) => getColDynamicAvg(b) - getColDynamicAvg(a));
    } else if (capacitySortMode === 'asc') {
      return list.sort((a, b) => getColDynamicAvg(a) - getColDynamicAvg(b));
    } else {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredCapacityCollaborators, capacitySortMode, visibleMonthColumns]);

  return (
    <div className="space-y-3.5 p-4 sm:p-5 max-w-[1700px] mx-auto">
      {/* =====================================================================
          SUB-NAVIGATION TABS (PROYECTOS)
      ===================================================================== */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-[#0F2942]/10 pb-3">
        <div>
          <h1 className="font-mono-tech text-base font-bold uppercase tracking-wider text-[#0F2942]">
            PROYECTOS
          </h1>
          <p className="font-mono-tech text-[10px] text-[#181B1E]/60">
            Control de Actividades, Checklist de Tareas, Fechas &amp; Matriz Mensual
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
            Tabla
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-[#0F2942]/70 hover:text-[#0F2942]'
            }`}
          >
            <KanbanIcon className="h-3 w-3" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'gantt'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-[#0F2942]/70 hover:text-[#0F2942]'
            }`}
          >
            <CalendarRange className="h-3 w-3" />
            Gantt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capacidad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'capacidad'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-[#0F2942]/70 hover:text-[#0F2942]'
            }`}
          >
            <Users className="h-3 w-3" />
            Capacidad Mensual
          </button>
        </div>
      </div>

      {/* =====================================================================
          EXECUTIVE PROGRESS BANNER: PROMEDIO TOTAL DE AVANCE (%)
      ===================================================================== */}
      {activeTab !== 'capacidad' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white border border-[#0F2942]/10 p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2942] text-white font-mono-tech">
              <TrendingUp className="h-5 w-5 text-[#07B1C5]" />
            </div>
            <div>
              <div className="font-mono-tech text-[10px] uppercase text-[#181B1E]/60 font-semibold">
                Avance Promedio Global de Actividades
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-tech text-2xl font-bold text-[#0F2942]">
                  {averageProgress}%
                </span>
                <span className="font-mono-tech text-xs text-[#2F7F61] font-semibold">
                  {completedActivitiesCount} de {filteredActivities.length} actividades completadas (100%)
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-1">
            <div className="flex justify-between font-mono-tech text-[10px] text-[#181B1E]/60">
              <span>Progreso de Ejecución</span>
              <span className="font-bold text-[#0F2942]">{averageProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#F3F0EB] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0F2942] via-[#07B1C5] to-[#2F7F61] transition-all duration-500"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TOOLBAR COMPLETA CON TODOS LOS FILTROS (TABLA Y GANTT)
      ===================================================================== */}
      {activeTab !== 'capacidad' && (
        <div className="flex flex-col gap-2.5 rounded-xl bg-white border border-[#0F2942]/10 p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#181B1E]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar actividad, tarea..."
                className="w-full rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 pl-7 pr-2.5 py-1 text-xs text-[#181B1E] focus:border-[#07B1C5] focus:outline-none"
              />
            </div>

            {/* Filter by Project */}
            <div className="flex items-center gap-1">
              <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Proyecto:</span>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="Todos">Todos</option>
                {uniqueProjects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Client (Dropdown) */}
            <div className="flex items-center gap-1">
              <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Cliente:</span>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="Todos">Todos</option>
                {uniqueClients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Person */}
            <div className="flex items-center gap-1">
              <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Asignado:</span>
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                {uniquePeople.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1">
              <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Estado:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Month */}
            <div className="flex items-center gap-1">
              <span className="font-mono-tech text-[10px] text-[#181B1E]/60">Mes:</span>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1 text-xs text-[#0F2942] font-medium focus:border-[#07B1C5] focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                {MONTH_COLUMNS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-[#07B1C5]" />
            <span>Registrar Actividad</span>
          </button>
        </div>
      )}

      {/* =====================================================================
          1. TABLA (ACTIVIDADES, TAREAS CHECKLIST, CLIENTE DROPDOWN, % AVANCE)
      ===================================================================== */}
      {activeTab === 'tabla' && (
        <div className="rounded-xl bg-white border border-[#0F2942]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 font-mono-tech text-[10px] text-[#0F2942]/70 uppercase">
                  <th className="py-2.5 pl-4 pr-2 font-medium">Cód.</th>
                  <th className="px-2.5 py-2.5 font-medium">Actividad &amp; Proyecto</th>
                  <th className="px-2.5 py-2.5 font-medium">Cliente (Cuenta)</th>
                  <th className="px-2.5 py-2.5 font-medium">A Quién Asigno</th>
                  <th className="px-2.5 py-2.5 font-medium text-center">% Asignación</th>
                  <th className="px-2.5 py-2.5 font-medium text-center w-[130px]">% Avance</th>
                  <th className="px-2.5 py-2.5 font-medium">Fechas &amp; Fecha Entrega</th>
                  <th className="px-2.5 py-2.5 font-medium text-center">Estado</th>
                  <th className="py-2.5 pl-2 pr-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F2942]/8 text-[11px]">
                {filteredActivities.map((act) => {
                  const isDone = act.status === 'Completado' || act.progressPercent === 100;
                  const isPending = act.progressPercent === 0;

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-[#F3F0EB]/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenEdit(act)}
                    >
                      {/* Code */}
                      <td className="py-2.5 pl-4 pr-2 font-mono-tech text-[10px] font-bold text-[#0F2942] whitespace-nowrap">
                        {act.code}
                      </td>

                      {/* Title & Project (NO SECTOR) */}
                      <td className="px-2.5 py-2.5 max-w-[240px]">
                        <div className="font-semibold text-xs text-[#0F2942] truncate">
                          {act.activityTitle}
                        </div>
                        <div className="font-mono-tech text-[9px] text-[#181B1E]/60 truncate mt-0.5">
                          {act.projectName}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-2.5 py-2.5 max-w-[190px] whitespace-nowrap">
                        <div className="font-medium text-[11px] text-[#0F2942] truncate">
                          {act.client}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="px-2.5 py-2.5 whitespace-nowrap">
                        <div className="font-semibold text-[11px] text-[#0F2942] truncate">
                          {act.assignedPerson}
                        </div>
                        <div className="font-mono-tech text-[9px] text-[#181B1E]/55">
                          {act.assignedRole}
                        </div>
                      </td>

                      {/* % Asignación */}
                      <td className="px-2.5 py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1 rounded bg-[#0F2942]/5 border border-[#0F2942]/10 px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAllocation(act.id, Math.max(5, act.allocationPercent - 5))
                            }
                            className="h-4 w-4 rounded bg-white text-[10px] font-bold text-[#0F2942] hover:bg-[#0F2942] hover:text-white transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono-tech text-[10px] font-bold text-[#0F2942]">
                            {act.allocationPercent}%
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAllocation(act.id, Math.min(100, act.allocationPercent + 5))
                            }
                            className="h-4 w-4 rounded bg-white text-[10px] font-bold text-[#0F2942] hover:bg-[#0F2942] hover:text-white transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* % Avance (0% = Pendiente, 1-99% = En Curso, 100% = Completado) */}
                      <td className="px-2.5 py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono-tech text-[10px]">
                            <span
                              className={`font-bold ${
                                isDone
                                  ? 'text-[#2F7F61]'
                                  : isPending
                                  ? 'text-[#181B1E]/50'
                                  : 'text-[#07B1C5]'
                              }`}
                            >
                              {act.progressPercent || 0}%
                            </span>
                            <span className="text-[8px] opacity-60">
                              {isDone ? 'Hecho' : isPending ? 'Pendiente' : 'En proceso'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#F3F0EB] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${act.progressPercent || 0}%`,
                                backgroundColor: isDone
                                  ? '#2F7F61'
                                  : isPending
                                  ? '#CBD5E1'
                                  : '#07B1C5',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Dates & Fecha Entrega */}
                      <td className="px-2.5 py-2.5 font-mono-tech text-[9px] text-[#181B1E]/70 whitespace-nowrap">
                        <div>
                          {act.startDate} → <span className="font-semibold">{act.endDate}</span> (Fin Plan)
                        </div>
                        {act.additionalDate && (
                          <div className="text-[#07B1C5] font-semibold mt-0.5">
                            Fecha Entrega: {act.additionalDate}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-2.5 py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={act.status}
                          onChange={(e) =>
                            onUpdateActivityStatus(act.id, e.target.value as TaskStatus)
                          }
                          className={`rounded border px-2 py-0.5 font-mono-tech text-[10px] font-medium transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-[#2F7F61]/12 border-[#2F7F61]/40 text-[#2F7F61]'
                              : act.status === 'En Curso'
                              ? 'bg-[#07B1C5]/15 border-[#07B1C5]/40 text-[#0F2942]'
                              : 'bg-[#0F2942]/6 border-[#0F2942]/15 text-[#0F2942]'
                          }`}
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions (Editar, Eliminar) */}
                      <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(act)}
                            className="p-1 rounded text-[#0F2942] hover:bg-[#0F2942]/10 transition-colors cursor-pointer"
                            title="Modificar / Editar actividad"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleConfirmDelete(act.id, e)}
                            className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar actividad"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center font-mono-tech text-xs text-[#181B1E]/40">
                      No se encontraron actividades con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. KANBAN (CON CHECKLIST, AVANCE Y ACCIÓN DE EDITAR/ELIMINAR)
      ===================================================================== */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
          {STATUSES.map((status, colIdx) => {
            const colActs = filteredActivities.filter((a) => a.status === status);
            return (
              <div
                key={status}
                className="rounded-xl bg-white border border-[#0F2942]/10 p-3 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          status === 'Completado'
                            ? '#2F7F61'
                            : status === 'En Curso'
                            ? '#07B1C5'
                            : '#0F2942',
                      }}
                    />
                    <h3 className="text-xs font-bold text-[#0F2942]">{status}</h3>
                  </div>
                  <span className="font-mono-tech text-[10px] text-[#0F2942]/55">
                    {colActs.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colActs.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-lg bg-[#F3F0EB]/30 border border-[#0F2942]/10 p-2.5 space-y-2 hover:border-[#0F2942]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between font-mono-tech text-[9px] text-[#0F2942]/60">
                        <span>{act.code}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(act)}
                            className="hover:text-[#07B1C5] cursor-pointer"
                            title="Editar actividad"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(act.id)}
                            className="hover:text-red-600 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-[#0F2942] leading-snug">
                          {act.activityTitle}
                        </h4>
                        <div className="font-mono-tech text-[9px] text-[#07B1C5] font-medium mt-0.5">
                          {act.client}
                        </div>
                      </div>

                      {/* Progress Bar in Kanban */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between font-mono-tech text-[9px]">
                          <span className="text-[#181B1E]/60">Avance</span>
                          <span className="font-bold text-[#0F2942]">{act.progressPercent || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white overflow-hidden border border-[#0F2942]/10">
                          <div
                            className="h-full rounded-full bg-[#07B1C5]"
                            style={{ width: `${act.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded bg-white border border-[#0F2942]/8 p-1.5 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold text-[10px] text-[#0F2942] truncate">
                            {act.assignedPerson}
                          </div>
                          {act.additionalDate && (
                            <div className="font-mono-tech text-[8px] text-[#07B1C5]">
                              Entrega: {act.additionalDate}
                            </div>
                          )}
                        </div>
                        <div className="font-mono-tech text-[10px] font-bold text-[#07B1C5] bg-[#07B1C5]/10 px-1.5 py-0.2 rounded">
                          {act.allocationPercent}%
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-[#0F2942]/8 flex items-center justify-between font-mono-tech text-[9px] text-[#181B1E]/50">
                        <span>{act.startDate}</span>
                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => onUpdateActivityStatus(act.id, STATUSES[colIdx - 1])}
                              className="p-0.5 rounded hover:bg-white text-[#0F2942] cursor-pointer"
                              title="Mover al estado anterior"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                          )}
                          {colIdx < STATUSES.length - 1 && (
                            <button
                              type="button"
                              onClick={() => onUpdateActivityStatus(act.id, STATUSES[colIdx + 1])}
                              className="p-0.5 rounded hover:bg-white text-[#0F2942] cursor-pointer"
                              title="Avanzar al siguiente estado"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colActs.length === 0 && (
                    <div className="rounded border border-dashed border-[#0F2942]/15 py-5 text-center font-mono-tech text-[10px] text-[#181B1E]/40">
                      Sin actividades
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          3. GANTT (FILTRADO EN TIEMPO REAL CON LOS MISMOS FILTROS)
      ===================================================================== */}
      {activeTab === 'gantt' && (
        <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#0F2942]/10 pb-2">
            <div>
              <h2 className="text-xs font-bold text-[#0F2942]">Cronograma Gantt Maestro (Filtrable)</h2>
              <p className="font-mono-tech text-[10px] text-[#181B1E]/60">
                Mostrando {filteredActivities.length} actividades filtradas por proyecto, cliente y estado
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono-tech text-[10px]">
              <span className="flex items-center gap-1 text-[#0F2942]">
                <span className="h-2 w-2 rounded-xs bg-[#0F2942]" />
                En Planificación / Curso
              </span>
              <span className="flex items-center gap-1 text-[#2F7F61]">
                <span className="h-2 w-2 rounded-xs bg-[#2F7F61]" />
                Completado (100%)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Timeline Month Headers */}
              <div className="grid grid-cols-12 border-b border-[#0F2942]/10 pb-1.5 font-mono-tech text-[10px] text-[#0F2942]/70 font-bold uppercase">
                <div className="col-span-4 pl-2">Actividad / Cliente</div>
                <div className="col-span-8 grid grid-cols-8 text-center border-l border-[#0F2942]/10">
                  {GANTT_MONTH_HEADERS.map((m) => (
                    <div key={m} className="px-1 truncate">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Gantt Bars */}
              <div className="divide-y divide-[#0F2942]/8">
                {filteredActivities.map((act) => {
                  const sTime = new Date(act.startDate).getTime();
                  const eTime = new Date(act.endDate).getTime();
                  const totalSpan = GANTT_END - GANTT_START;
                  const left = Math.max(0, Math.min(100, ((sTime - GANTT_START) / totalSpan) * 100));
                  const right = Math.max(0, Math.min(100, ((eTime - GANTT_START) / totalSpan) * 100));
                  const width = Math.max(5, right - left);
                  const isDone = act.status === 'Completado' || act.progressPercent === 100;

                  return (
                    <div
                      key={act.id}
                      className="grid grid-cols-12 items-center py-2.5 hover:bg-[#F3F0EB]/30 transition-colors"
                    >
                      <div className="col-span-4 pr-3 pl-2 truncate">
                        <div className="flex items-center gap-1 font-mono-tech text-[9px]">
                          <span className="font-semibold text-[#0F2942]">{act.code}</span>
                          <span className="text-[#181B1E]/40">·</span>
                          <span className="font-bold text-[#07B1C5]">{act.client}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#0F2942] truncate">
                          {act.activityTitle}
                        </div>
                        <div className="font-mono-tech text-[9px] text-[#181B1E]/60 truncate">
                          {act.assignedPerson} ({act.startDate} → {act.endDate}) · {act.progressPercent || 0}% avance
                        </div>
                      </div>

                      <div className="col-span-8 relative h-10 flex items-center px-2">
                        <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                          {GANTT_MONTH_HEADERS.map((m) => (
                            <div key={m} className="border-r border-[#0F2942]/[0.05] last:border-r-0" />
                          ))}
                        </div>

                        <div
                          className="relative h-5 rounded overflow-hidden flex items-center justify-between px-2 shadow-xs transition-all cursor-pointer"
                          onClick={() => handleOpenEdit(act)}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: isDone ? '#2F7F61' : '#0F2942',
                          }}
                          title={`Editar: ${act.activityTitle} (${act.progressPercent || 0}% avance)`}
                        >
                          <span className="font-mono-tech text-[9px] text-white font-medium truncate">
                            {act.code} ({act.allocationPercent}%)
                          </span>
                          <span className="font-mono-tech text-[9px] text-[#07B1C5] font-bold">
                            {act.progressPercent || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. CAPACIDAD MENSUAL (DISEÑO EJECUTIVO UNIFICADO & PROMEDIO DINÁMICO)
      ===================================================================== */}
      {activeTab === 'capacidad' && (
        <div className="space-y-3.5">
          {/* Executive Header: Utilización Promedio + Filtros Profesionales Integrados */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs">
            {/* Left: Indicador de Utilización Promedio */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F2942] text-white shadow-xs">
                <TrendingUp className="h-6 w-6 text-[#07B1C5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-[10px] uppercase font-bold text-[#181B1E]/60 tracking-wider">
                    Utilización Promedio del Equipo
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono-tech text-[10px] font-bold ${
                      capacityMetrics.avgAllocation > 95
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : capacityMetrics.avgAllocation > 80
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-[#2F7F61]/10 text-[#2F7F61] border border-[#2F7F61]/20'
                    }`}
                  >
                    {capacityMetrics.avgAllocation > 100
                      ? '🔴 Sobrecarga Global'
                      : capacityMetrics.avgAllocation > 80
                      ? '🟠 Carga Alta'
                      : '🟢 Carga Óptima'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="font-mono-tech text-2xl sm:text-3xl font-bold text-[#0F2942]">
                    {capacityMetrics.avgAllocation}%
                  </span>
                  <span className="font-mono-tech text-[11px] text-[#181B1E]/60">
                    en {visibleMonthColumns.length}{' '}
                    {visibleMonthColumns.length === 1 ? 'mes visualizado' : 'meses visualizados'} ·{' '}
                    {sortedCapacityCollaborators.length} de {collaborators.length} colaboradores
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-48 sm:w-64 rounded-full bg-[#F3F0EB] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityMetrics.avgAllocation > 100
                        ? 'bg-red-500'
                        : capacityMetrics.avgAllocation > 80
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-[#0F2942] to-[#07B1C5]'
                    }`}
                    style={{ width: `${Math.min(100, capacityMetrics.avgAllocation)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Filtros Profesionales (Búsqueda, Periodo/Año/Mes, Nivel de Carga, Orden) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#0F2942]/8">
              {/* Search */}
              <div className="relative w-full sm:w-44">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#181B1E]/40" />
                <input
                  type="text"
                  value={capacitySearch}
                  onChange={(e) => setCapacitySearch(e.target.value)}
                  placeholder="Buscar especialista..."
                  className="w-full rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 pl-8 pr-2.5 py-1.5 text-xs text-[#181B1E] focus:border-[#07B1C5] focus:outline-none"
                />
              </div>

              {/* Period / Year / Month Filter */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60 font-semibold">Periodo:</span>
                <select
                  value={capacityMonthFilter}
                  onChange={(e) => setCapacityMonthFilter(e.target.value)}
                  className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1.5 font-mono-tech text-[11px] font-semibold text-[#0F2942] cursor-pointer focus:border-[#07B1C5] focus:outline-none"
                >
                  <option value="todos">Todos los Meses (Matriz Global)</option>
                  <option value="year-2026">Año 2026 (Octubre - Diciembre)</option>
                  <option value="year-2027">Año 2027 (Enero - Marzo)</option>
                  <optgroup label="Meses Individuales">
                    {MONTH_COLUMNS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Workload Alert Filter */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60 font-semibold">Carga:</span>
                <select
                  value={capacityAlertFilter}
                  onChange={(e) =>
                    setCapacityAlertFilter(
                      e.target.value as 'todos' | 'sobrecarga' | 'limite' | 'disponible'
                    )
                  }
                  className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1.5 font-mono-tech text-[11px] font-semibold text-[#0F2942] cursor-pointer focus:border-[#07B1C5] focus:outline-none"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="sobrecarga">🔴 Sobrecarga (&gt;100%)</option>
                  <option value="limite">🟠 Límite (85-100%)</option>
                  <option value="disponible">🟢 Con Disponibilidad (&gt;15%)</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-1">
                <span className="font-mono-tech text-[10px] text-[#181B1E]/60 font-semibold">Orden:</span>
                <select
                  value={capacitySortMode}
                  onChange={(e) => setCapacitySortMode(e.target.value as 'desc' | 'asc' | 'name')}
                  className="rounded-md border border-[#0F2942]/15 bg-[#F3F0EB]/30 px-2 py-1.5 font-mono-tech text-[11px] font-semibold text-[#0F2942] cursor-pointer focus:border-[#07B1C5] focus:outline-none"
                >
                  <option value="desc">↓ Mayor a Menor Carga</option>
                  <option value="asc">↑ Menor a Mayor Carga</option>
                  <option value="name">Alfabético (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table display */}
          <div className="rounded-xl bg-white border border-[#0F2942]/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0F2942]/10 bg-[#F3F0EB]/60 font-mono-tech text-[10px] text-[#0F2942]/70 uppercase">
                    <th className="py-2.5 pl-4 pr-3 font-medium w-[220px]">Colaborador</th>
                    <th className="px-3 py-2.5 font-medium text-center border-l border-[#0F2942]/8 w-[150px] bg-[#07B1C5]/[0.06]">
                      Promedio Asignación
                    </th>
                    {visibleMonthColumns.map((m) => (
                      <th
                        key={m.key}
                        className="px-3 py-2.5 font-medium text-center border-l border-[#0F2942]/8 min-w-[120px]"
                      >
                        {m.label}
                      </th>
                    ))}
                    <th className="px-4 py-2.5 font-medium text-center border-l border-[#0F2942]/8 w-[150px]">
                      Detalle Proyectos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F2942]/8 text-[11px]">
                  {sortedCapacityCollaborators.map((col) => {
                    const colAvg = getColDynamicAvg(col);
                    const isOverload = colAvg > 100;
                    const isLimit = colAvg >= 85 && colAvg <= 100;

                    return (
                      <tr key={col.id} className="hover:bg-[#F3F0EB]/20 transition-colors">
                        {/* 1. Colaborador */}
                        <td className="py-3 pl-4 pr-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white font-mono-tech shrink-0"
                              style={{ backgroundColor: col.avatarColor || '#0F2942' }}
                            >
                              {col.avatarLetter}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-[#0F2942] truncate">
                                {col.name}
                              </div>
                              <div className="font-mono-tech text-[9px] text-[#181B1E]/60 truncate">
                                {col.role}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Columna Dinámica: Promedio de Asignación por Mes/Año */}
                        <td className="p-3 border-l border-[#0F2942]/8 align-middle text-center bg-[#07B1C5]/[0.02]">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span
                              className={`font-mono-tech text-sm font-bold ${
                                isOverload
                                  ? 'text-red-600'
                                  : isLimit
                                  ? 'text-amber-700'
                                  : 'text-[#0F2942]'
                              }`}
                            >
                              {colAvg}%
                            </span>
                            {isOverload && (
                              <span className="font-mono-tech text-[8.5px] font-bold text-red-700 bg-red-100 px-1 py-0.5 rounded">
                                Sobrecarga
                              </span>
                            )}
                            {isLimit && (
                              <span className="font-mono-tech text-[8.5px] font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">
                                Límite
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 w-full max-w-[100px] mx-auto rounded-full bg-[#0F2942]/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOverload
                                  ? 'bg-red-500'
                                  : isLimit
                                  ? 'bg-amber-500'
                                  : 'bg-[#07B1C5]'
                              }`}
                              style={{ width: `${Math.min(100, colAvg)}%` }}
                            />
                          </div>
                        </td>

                        {/* 3..N. Monthly Matrix Cells */}
                        {visibleMonthColumns.map((m) => {
                          const mData = col.monthlyAllocations[m.key] || {
                            assignedHours: 0,
                            totalPercent: 0,
                            availableHours: 186,
                            availablePercent: 100,
                            isOverload: false,
                            isLimit: false,
                            overloadPercent: 0,
                            activities: [],
                          };

                          return (
                            <td
                              key={m.key}
                              className={`p-3 border-l border-[#0F2942]/8 align-middle text-center ${
                                mData.isOverload
                                  ? 'bg-red-500/[0.04]'
                                  : mData.isLimit
                                  ? 'bg-amber-500/[0.04]'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2 mb-1.5">
                                <span
                                  className={`font-mono-tech text-sm font-bold ${
                                    mData.isOverload
                                      ? 'text-red-600'
                                      : mData.isLimit
                                      ? 'text-amber-700'
                                      : 'text-[#0F2942]'
                                  }`}
                                >
                                  {mData.totalPercent}%
                                </span>

                                {mData.isOverload && (
                                  <span className="font-mono-tech text-[9px] font-bold text-red-700 bg-red-600/10 px-1.5 py-0.5 rounded">
                                    +{mData.overloadPercent}%
                                  </span>
                                )}
                              </div>

                              <div className="h-1.5 w-full max-w-[110px] mx-auto rounded-full bg-[#0F2942]/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, mData.totalPercent)}%`,
                                    backgroundColor: mData.isOverload
                                      ? '#DC2626'
                                      : mData.isLimit
                                      ? '#D97706'
                                      : '#07B1C5',
                                  }}
                                />
                              </div>
                            </td>
                          );
                        })}

                        {/* 4. Detalle Proyectos: SOLO BOTÓN "Ver Detalle" */}
                        <td className="p-3 border-l border-[#0F2942]/8 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedCollaboratorForDetail(col)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] hover:bg-[#07B1C5] hover:text-[#0F2942] text-white px-3 py-1.5 text-[10.5px] font-mono-tech font-bold transition-all shadow-xs cursor-pointer group"
                            title={`Ver detalle completo de proyectos para ${col.name}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-[#07B1C5] group-hover:text-[#0F2942]" />
                            <span>Ver Detalle</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: REGISTRAR / MODIFICAR / EDITAR ACTIVIDAD
      ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#0F2942]/20 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#0F2942]/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#07B1C5]" />
                <h3 className="text-sm font-bold text-[#0F2942]">
                  {editingActivityId ? 'Modificar / Editar Actividad' : 'Registrar Nueva Actividad'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#181B1E]/50 hover:text-[#0F2942] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Activity Title */}
              <div>
                <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                  Nombre de la Actividad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.activityTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, activityTitle: e.target.value })
                  }
                  placeholder="Ej. Arquitectura de Ingesta Edge y Conexión SCADA"
                  className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none"
                />
              </div>

              {/* Project & Client (Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Proyecto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Cliente (Lista Desplegable) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full rounded-md border border-[#0F2942]/20 px-2.5 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                  >
                    {CLIENT_COMPANIES.map((cl) => (
                      <option key={cl} value={cl}>
                        {cl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CHECKLIST DE TAREAS */}
              <div className="rounded-xl bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase">
                    Checklist de Tareas / Subtareas
                  </label>
                  <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold">
                    {formData.tasks.filter((t) => t.completed).length}/{formData.tasks.length} completadas
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {formData.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 rounded bg-white border border-[#0F2942]/10 p-1.5 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTaskInForm(task.id)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-4 w-4 text-[#2F7F61] shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-[#181B1E]/40 shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            task.completed ? 'line-through text-[#2F7F61]/70' : 'text-[#0F2942]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskFromForm(task.id)}
                        className="text-[#181B1E]/40 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Eliminar tarea"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new task to checklist */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#0F2942]/10">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTaskToForm();
                      }
                    }}
                    placeholder="Escribe una nueva tarea y presiona Añadir..."
                    className="flex-1 rounded border border-[#0F2942]/20 bg-white px-2.5 py-1 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTaskToForm}
                    disabled={!newTaskInput.trim()}
                    className="rounded bg-[#0F2942] px-3 py-1 font-mono-tech text-[10px] font-bold text-white hover:bg-[#0F2942]/90 disabled:opacity-50 cursor-pointer"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              {/* % DE AVANCE & ESTADO (SINCRONIZADOS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-white border border-[#0F2942]/10 p-3">
                {/* % Avance slider & input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase">
                      % de Avance <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`font-mono-tech text-xs font-bold ${
                        formData.progressPercent === 100
                          ? 'text-[#2F7F61]'
                          : formData.progressPercent === 0
                          ? 'text-[#181B1E]/50'
                          : 'text-[#07B1C5]'
                      }`}
                    >
                      {formData.progressPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progressPercent}
                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                    className="w-full accent-[#07B1C5] cursor-pointer"
                  />
                  <div className="flex justify-between font-mono-tech text-[8px] text-[#181B1E]/50 mt-1">
                    <span>0% (Pendiente)</span>
                    <span>1-99% (En Proceso)</span>
                    <span>100% (Completado)</span>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Estado de la Actividad
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="w-full rounded-md border border-[#0F2942]/20 px-2.5 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee & Allocation % */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    A Quién Asigno <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.assignedPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedPerson: e.target.value })
                    }
                    className="w-full rounded-md border border-[#0F2942]/20 px-2.5 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none cursor-pointer"
                  >
                    {collaborators.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    % de Asignación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    value={formData.allocationPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allocationPercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs font-mono-tech text-[#0F2942] font-bold focus:border-[#07B1C5] focus:outline-none"
                  />
                </div>
              </div>

              {/* DATES: Inicio, Fin y Fecha Adicional */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Fecha Inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs font-mono-tech text-[#0F2942] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Fecha Fin Plan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs font-mono-tech text-[#0F2942] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Fecha Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.additionalDate}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalDate: e.target.value })
                    }
                    className="w-full rounded-md border border-[#0F2942]/20 px-2 py-1 text-xs font-mono-tech text-[#07B1C5] font-semibold cursor-pointer"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between border-t border-[#0F2942]/10 pt-3">
                {editingActivityId ? (
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(editingActivityId)}
                    className="inline-flex items-center gap-1 rounded text-red-600 hover:text-red-700 font-mono-tech text-xs cursor-pointer p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar Actividad</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-[#0F2942]/20 px-3 py-1.5 font-mono-tech text-xs text-[#0F2942] hover:bg-[#F3F0EB] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-4 py-1.5 font-mono-tech text-xs font-bold text-white hover:bg-[#0F2942]/90 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#07B1C5]" />
                    <span>{editingActivityId ? 'Guardar Cambios' : 'Registrar Actividad'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DETALLE PROYECTOS & ASIGNACIÓN DE TIEMPO DEL COLABORADOR
      ===================================================================== */}
      {selectedCollaboratorForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-[#0F2942]/20 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#0F2942]/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2942] text-white font-mono-tech font-bold text-sm shadow-xs">
                  {selectedCollaboratorForDetail.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0F2942]">
                      {selectedCollaboratorForDetail.name}
                    </h3>
                    <span className="rounded-full bg-[#07B1C5]/15 border border-[#07B1C5]/30 px-2 py-0.5 font-mono-tech text-[9px] font-bold text-[#0F2942]">
                      {selectedCollaboratorForDetail.role}
                    </span>
                  </div>
                  <p className="font-mono-tech text-[10px] text-[#181B1E]/60 mt-0.5">
                    Detalle de proyectos asignados y cronograma de tiempo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCollaboratorForDetail(null)}
                className="rounded-lg p-1.5 text-[#181B1E]/50 hover:bg-[#F3F0EB] hover:text-[#0F2942] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content: List of Projects & Activities with Time and Schedule */}
            <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
              {(() => {
                const assignedActs = activities.filter(
                  (a) => a.assignedPerson === selectedCollaboratorForDetail.name
                );

                if (assignedActs.length === 0) {
                  return (
                    <div className="rounded-xl bg-[#F3F0EB]/50 border border-dashed border-[#0F2942]/20 p-8 text-center">
                      <Briefcase className="h-8 w-8 text-[#0F2942]/30 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-[#0F2942]">
                        No hay proyectos ni actividades asignadas
                      </p>
                      <p className="font-mono-tech text-[10px] text-[#181B1E]/50 mt-1">
                        Este colaborador no tiene carga de trabajo registrada en el periodo actual.
                      </p>
                    </div>
                  );
                }

                return assignedActs.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-[#0F2942]/12 bg-[#F3F0EB]/30 p-3.5 space-y-2.5 transition-all hover:border-[#07B1C5]/40 hover:bg-white"
                  >
                    {/* Top Row: Code, Project Name, Client & Status */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-tech text-[10px] font-bold text-[#07B1C5] bg-[#07B1C5]/10 px-1.5 py-0.5 rounded border border-[#07B1C5]/20">
                            {act.code}
                          </span>
                          <span className="rounded bg-[#0F2942]/8 px-2 py-0.5 font-mono-tech text-[9px] font-semibold text-[#0F2942]">
                            {act.client}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono-tech text-[9px] font-bold ${
                              act.status === 'Completado'
                                ? 'bg-[#2F7F61]/15 text-[#2F7F61] border border-[#2F7F61]/30'
                                : act.status === 'En Curso'
                                ? 'bg-[#07B1C5]/15 text-[#0F2942] border border-[#07B1C5]/30'
                                : act.status === 'En Revisión'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[#181B1E]/10 text-[#181B1E]/60'
                            }`}
                          >
                            {act.status}
                          </span>
                        </div>
                        {/* Project Name (Prominent) */}
                        <h4 className="text-xs font-bold text-[#0F2942] mt-1">
                          {act.projectName}
                        </h4>
                        <p className="text-[11px] text-[#181B1E]/80">
                          {act.activityTitle}
                        </p>
                      </div>

                      {/* Allocation & Progress % */}
                      <div className="text-right font-mono-tech">
                        <div className="text-xs font-bold text-[#0F2942]">
                          {act.allocationPercent}% asignación
                        </div>
                        <div className="text-[10px] text-[#07B1C5] font-bold">
                          {act.progressPercent}% avance
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-[#0F2942]/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          act.progressPercent === 100
                            ? 'bg-[#2F7F61]'
                            : act.progressPercent > 0
                            ? 'bg-[#07B1C5]'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${Math.max(2, act.progressPercent)}%` }}
                      />
                    </div>

                    {/* Time Frame & Timeline Details ("En qué tiempo") */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-lg bg-white border border-[#0F2942]/10 p-2.5 font-mono-tech text-[10px]">
                      <div>
                        <div className="text-[#181B1E]/50 uppercase font-semibold text-[9px]">
                          Periodo / Cronograma
                        </div>
                        <div className="font-bold text-[#0F2942] mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#07B1C5]" />
                          <span>{act.startDate} → {act.endDate}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[#181B1E]/50 uppercase font-semibold text-[9px]">
                          Fecha Entrega
                        </div>
                        <div className="font-bold text-[#07B1C5] mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#07B1C5]" />
                          <span>{act.additionalDate || act.endDate}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[#181B1E]/50 uppercase font-semibold text-[9px]">
                          Meses Activos
                        </div>
                        <div className="font-bold text-[#0F2942] mt-0.5">
                          {act.activeMonths && act.activeMonths.length > 0
                            ? act.activeMonths.join(', ')
                            : 'En curso continuo'}
                        </div>
                      </div>
                    </div>

                    {/* Checklist Tasks preview if any */}
                    {act.tasks && act.tasks.length > 0 && (
                      <div className="pt-1 border-t border-[#0F2942]/8">
                        <span className="font-mono-tech text-[9px] font-bold text-[#0F2942]/70 uppercase">
                          Subtareas / Checklist ({act.tasks.filter((t) => t.completed).length}/{act.tasks.length}):
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {act.tasks.map((t) => (
                            <span
                              key={t.id}
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono-tech text-[8.5px] ${
                                t.completed
                                  ? 'bg-[#2F7F61]/10 text-[#2F7F61] line-through'
                                  : 'bg-[#0F2942]/5 text-[#0F2942]'
                              }`}
                            >
                              <span>{t.completed ? '✓' : '○'}</span>
                              <span className="truncate max-w-[160px]">{t.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-[#0F2942]/10 pt-3">
              <button
                type="button"
                onClick={() => setSelectedCollaboratorForDetail(null)}
                className="rounded-lg bg-[#0F2942] px-4 py-1.5 font-mono-tech text-xs font-bold text-white hover:bg-[#0F2942]/90 transition-all cursor-pointer shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
