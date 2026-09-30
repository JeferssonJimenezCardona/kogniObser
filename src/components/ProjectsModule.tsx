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
  User,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import {
  ProjectActivity,
  TaskStatus,
  ActivityTask,
  ActivityAssignee,
  CollaboratorCapacity,
  MONTH_COLUMNS,
  INITIAL_COLLABORATORS,
  CLIENT_COMPANIES,
  BASE_MONTHLY_CAPACITY_HOURS,
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
  'Atrasado',
  'Completado',
];

const CLIENT_DEFAULT_PROJECT: Record<string, string> = {
  'Kognia': 'Arquitectura Core, Automatización & Soluciones Internas Kognia',
  'Keralty': 'Plataforma de IA & Analítica Predictiva en Salud',
  'Enlace Operativo': 'Automatización & Motor de Liquidación de Seguridad Social',
  'Telepizza': 'Motor de Despacho Dinámico & Ruteo Inteligente',
};

// Timeline headers for Gantt
const GANTT_START = new Date('2026-08-01T00:00:00').getTime();
const GANTT_END = new Date('2027-03-31T00:00:00').getTime();
const GANTT_CURRENT_DATE = new Date('2026-09-29T12:00:00').getTime();
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
    projectName: 'Plataforma de IA & Analítica Predictiva en Salud',
    client: CLIENT_COMPANIES[0] || 'Keralty',
    activityTitle: '',
    taskDetails: '',
    assignedPerson: 'Mateo Londoño',
    allocationPercent: 35,
    assignees: [
      { id: 'as-new-1', person: 'Mateo Londoño', role: 'Principal Solutions Architect', percent: 35 },
    ] as ActivityAssignee[],
    progressPercent: 0,
    status: 'Por Iniciar' as TaskStatus,
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    additionalDate: '2026-11-20',
    estimatedHours: 65,
    activeMonths: ['2026-10', '2026-11'],
    tasks: [
      { id: 't-new-1', title: 'Planificación de entregables y arquitectura', completed: false, hours: 20 },
      { id: 't-new-2', title: 'Ejecución técnica e integración', completed: false, hours: 30 },
      { id: 't-new-3', title: 'Validación en ambiente de pruebas', completed: false, hours: 15 },
    ] as ActivityTask[],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskHours, setNewTaskHours] = useState<number | string>(8);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCollaboratorForDetail, setSelectedCollaboratorForDetail] = useState<CollaboratorCapacity | null>(null);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingActivityId(null);
    setFormData({
      ...initialFormState,
      assignees: [
        { id: `as-new-${Date.now()}`, person: 'Mateo Londoño', role: 'Principal Solutions Architect', percent: 35 },
      ],
    });
    setNewTaskInput('');
    setNewTaskHours(8);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (act: ProjectActivity) => {
    setEditingActivityId(act.id);
    const resolvedAssignees: ActivityAssignee[] =
      act.assignees && act.assignees.length > 0
        ? act.assignees.map((as, i) => ({
            id: as.id || `as-edit-${i}-${Date.now()}`,
            person: as.person,
            role: as.role || collaborators.find((c) => c.name === as.person)?.role || 'Technical Specialist',
            percent: as.percent,
          }))
        : [
            {
              id: `as-${Date.now()}`,
              person: act.assignedPerson || 'Mateo Londoño',
              role: act.assignedRole || 'Principal Solutions Architect',
              percent: act.allocationPercent || 35,
            },
          ];

    const avgAllocation = Math.round(
      resolvedAssignees.reduce((acc, a) => acc + (Number(a.percent) || 0), 0) /
        (resolvedAssignees.length || 1)
    );

    setFormData({
      projectName: act.projectName,
      client: act.client,
      activityTitle: act.activityTitle,
      taskDetails: act.taskDetails || '',
      assignedPerson: resolvedAssignees.map((a) => a.person).join(', '),
      allocationPercent: avgAllocation,
      assignees: resolvedAssignees,
      progressPercent: act.progressPercent ?? (act.status === 'Completado' ? 100 : act.status === 'Por Iniciar' ? 0 : 50),
      status: act.status,
      startDate: act.startDate,
      endDate: act.endDate,
      additionalDate: act.additionalDate || '',
      estimatedHours: act.estimatedHours,
      activeMonths: act.activeMonths || ['2026-10'],
      tasks: act.tasks?.length
        ? act.tasks.map((t) => ({ ...t, hours: t.hours ?? 10 }))
        : [
            { id: `t-def-1`, title: 'Diseño e inicio de entregables', completed: (act.progressPercent || 0) > 0, hours: 15 },
            { id: `t-def-2`, title: 'Implementación técnica', completed: (act.progressPercent || 0) >= 50, hours: 25 },
            { id: `t-def-3`, title: 'Cierre y entrega al cliente', completed: (act.progressPercent || 0) === 100, hours: 10 },
          ],
    });
    setNewTaskInput('');
    setNewTaskHours(8);
    setIsModalOpen(true);
  };

  // Assignees management in Form
  const handleAddAssigneeToForm = () => {
    const assignedNames = formData.assignees.map((a) => a.person);
    const available =
      collaborators.find((c) => !assignedNames.includes(c.name)) || collaborators[0];
    const newAssignee: ActivityAssignee = {
      id: `as-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      person: available.name,
      role: available.role,
      percent: 30,
    };
    const updatedAssignees = [...formData.assignees, newAssignee];
    const avg = Math.round(
      updatedAssignees.reduce((acc, a) => acc + (Number(a.percent) || 0), 0) / updatedAssignees.length
    );
    setFormData((prev) => ({
      ...prev,
      assignees: updatedAssignees,
      assignedPerson: updatedAssignees.map((a) => a.person).join(', '),
      allocationPercent: avg,
    }));
  };

  const handleUpdateAssigneeInForm = (id: string, updates: Partial<ActivityAssignee>) => {
    const updatedAssignees = formData.assignees.map((a) => {
      if (a.id !== id) return a;
      const updated = { ...a, ...updates };
      if (updates.person) {
        const found = collaborators.find((c) => c.name === updates.person);
        if (found) updated.role = found.role;
      }
      return updated;
    });
    const avg = Math.round(
      updatedAssignees.reduce((acc, a) => acc + (Number(a.percent) || 0), 0) / (updatedAssignees.length || 1)
    );
    setFormData((prev) => ({
      ...prev,
      assignees: updatedAssignees,
      assignedPerson: updatedAssignees.map((a) => a.person).join(', '),
      allocationPercent: avg,
    }));
  };

  const handleRemoveAssigneeInForm = (id: string) => {
    if (formData.assignees.length <= 1) return;
    const updatedAssignees = formData.assignees.filter((a) => a.id !== id);
    const avg = Math.round(
      updatedAssignees.reduce((acc, a) => acc + (Number(a.percent) || 0), 0) / (updatedAssignees.length || 1)
    );
    setFormData((prev) => ({
      ...prev,
      assignees: updatedAssignees,
      assignedPerson: updatedAssignees.map((a) => a.person).join(', '),
      allocationPercent: avg,
    }));
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
    const hoursNum = Math.max(1, Number(newTaskHours) || 8);
    const newTask: ActivityTask = {
      id: `t-${Date.now()}`,
      title: newTaskInput.trim(),
      completed: false,
      hours: hoursNum,
    };
    const updatedTasks = [...formData.tasks, newTask];
    // recalculate progress if there are tasks
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const autoProgress = Math.round((completedCount / updatedTasks.length) * 100);
    const totalTaskHours = updatedTasks.reduce((acc, t) => acc + (t.hours || 0), 0);

    setFormData((prev) => ({
      ...prev,
      tasks: updatedTasks,
      estimatedHours: totalTaskHours > 0 ? totalTaskHours : prev.estimatedHours,
      progressPercent: autoProgress,
      status: getStatusFromProgress(autoProgress),
    }));
    setNewTaskInput('');
    setNewTaskHours(8);
  };

  // Update task hours in form
  const handleUpdateTaskHoursInForm = (taskId: string, hours: number) => {
    const validHours = Math.max(0, hours || 0);
    const updatedTasks = formData.tasks.map((t) =>
      t.id === taskId ? { ...t, hours: validHours } : t
    );
    const totalTaskHours = updatedTasks.reduce((acc, t) => acc + (t.hours || 0), 0);

    setFormData((prev) => ({
      ...prev,
      tasks: updatedTasks,
      estimatedHours: totalTaskHours > 0 ? totalTaskHours : prev.estimatedHours,
    }));
  };

  // Quick sync: Set allocation % based on task effort hours vs 182h reference
  const handleSyncTasksHoursToAllocation = () => {
    const totalTaskHours = formData.tasks.reduce((acc, t) => acc + (t.hours || 0), 0);
    if (totalTaskHours <= 0) return;
    const computedPercent = Math.min(200, Math.round((totalTaskHours / BASE_MONTHLY_CAPACITY_HOURS) * 100));
    
    // Distribute among assignees or set for single assignee
    const count = formData.assignees.length || 1;
    const perAssignee = Math.max(5, Math.round(computedPercent / count));
    const updatedAssignees = formData.assignees.map((a) => ({
      ...a,
      percent: perAssignee,
    }));

    setFormData((prev) => ({
      ...prev,
      assignees: updatedAssignees,
      allocationPercent: computedPercent,
      estimatedHours: totalTaskHours,
    }));
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
    const totalTaskHours = updatedTasks.reduce((acc, t) => acc + (t.hours || 0), 0);

    setFormData((prev) => ({
      ...prev,
      tasks: updatedTasks,
      estimatedHours: totalTaskHours > 0 ? totalTaskHours : prev.estimatedHours,
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
    if (!formData.projectName.trim()) return;

    const resolvedAssignees =
      formData.assignees && formData.assignees.length > 0
        ? formData.assignees
        : [
            {
              id: `as-${Date.now()}`,
              person: 'Mateo Londoño',
              role: 'Principal Solutions Architect',
              percent: 35,
            },
          ];

    const avgAllocation = Math.round(
      resolvedAssignees.reduce((acc, a) => acc + (Number(a.percent) || 0), 0) /
        resolvedAssignees.length
    );
    const summaryPerson = resolvedAssignees.map((a) => a.person).join(', ');
    const primaryRole =
      resolvedAssignees.length > 1
        ? 'Equipo Multidisciplinario'
        : resolvedAssignees[0]?.role || 'Technical Specialist';
    const resolvedTitle = formData.projectName.trim();

    if (editingActivityId) {
      const existing = activities.find((a) => a.id === editingActivityId);
      const updated: ProjectActivity = {
        id: editingActivityId,
        code: existing?.code || `ACT-${String(activities.length).padStart(2, '0')}`,
        projectId: existing?.projectId || `prj-${Date.now()}`,
        projectName: formData.projectName.trim(),
        client: formData.client,
        activityTitle: resolvedTitle,
        taskDetails: formData.taskDetails.trim() || formData.tasks.map((t) => t.title).join(' · '),
        tasks: formData.tasks,
        assignedPerson: summaryPerson,
        assignedRole: primaryRole,
        allocationPercent: avgAllocation,
        assignees: resolvedAssignees,
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
        projectName: formData.projectName.trim(),
        client: formData.client,
        activityTitle: resolvedTitle,
        taskDetails: formData.taskDetails.trim() || formData.tasks.map((t) => t.title).join(' · '),
        tasks: formData.tasks,
        assignedPerson: summaryPerson,
        assignedRole: primaryRole,
        allocationPercent: avgAllocation,
        assignees: resolvedAssignees,
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
      const matchPerson =
        filterPerson === 'Todos' ||
        act.assignedPerson === filterPerson ||
        (act.assignees && act.assignees.some((as) => as.person === filterPerson));
      const matchStatus = filterStatus === 'Todos' || act.status === filterStatus;
      const matchMonth =
        filterMonth === 'Todos' || (act.activeMonths && act.activeMonths.includes(filterMonth));

      return matchProj && matchClient && matchPerson && matchStatus && matchMonth;
    });
  }, [activities, filterProject, filterClient, filterPerson, filterStatus, filterMonth]);

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

  // Dynamic Average Assigned Hours per Collaborator for the currently visible/filtered period
  const getColDynamicHours = (col: CollaboratorCapacity) => {
    const months = visibleMonthColumns;
    if (months.length === 0) return 0;
    const sum = months.reduce((acc, m) => {
      const val = col.monthlyAllocations[m.key]?.assignedHours || 0;
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
        totalAvailableHoursSum += m.availableHours || BASE_MONTHLY_CAPACITY_HOURS;
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
            Control de Actividades, Checklist de Tareas, Fechas &amp; Capacidad
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
            Capacidad
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

            {(filterProject !== 'Todos' ||
              filterClient !== 'Todos' ||
              filterPerson !== 'Todos' ||
              filterStatus !== 'Todos' ||
              filterMonth !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setFilterProject('Todos');
                  setFilterClient('Todos');
                  setFilterPerson('Todos');
                  setFilterStatus('Todos');
                  setFilterMonth('Todos');
                }}
                className="flex items-center gap-1 font-mono-tech text-[10px] text-[#07B1C5] hover:text-[#0F2942] font-semibold transition-colors cursor-pointer px-1 py-1"
                title="Limpiar filtros"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restablecer</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2942] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2942]/90 transition-colors cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-[#07B1C5]" />
            <span>Registrar Proyecto</span>
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
                  <th className="px-3 py-2.5 font-medium">A Quién Asigno</th>
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
                        {act.tasks && act.tasks.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 font-mono-tech text-[8.5px]">
                            <span className="inline-flex items-center gap-1 font-bold text-[#07B1C5] bg-[#07B1C5]/10 px-1.5 py-0.2 rounded border border-[#07B1C5]/20">
                              <CheckSquare className="h-2.5 w-2.5" />
                              {act.tasks.filter((t) => t.completed).length}/{act.tasks.length} tareas
                            </span>
                            <span className="font-bold text-[#0F2942]/70 bg-[#F3F0EB] px-1.5 py-0.2 rounded border border-[#0F2942]/10">
                              {act.tasks.reduce((sum, t) => sum + (t.hours || 0), 0)}h esfuerzo
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Client */}
                      <td className="px-2.5 py-2.5 max-w-[190px] whitespace-nowrap">
                        <div className="font-medium text-[11px] text-[#0F2942] truncate">
                          {act.client}
                        </div>
                      </td>

                      {/* Assignee (1 o más colaboradores con su respectivo % y horas sobre 182h) */}
                      <td className="px-3 py-2.5">
                        {act.assignees && act.assignees.length > 0 ? (
                          <div className="space-y-1.5">
                            {act.assignees.map((as) => (
                              <div key={as.id} className="flex items-center justify-between gap-2 max-w-[250px]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F2942]/10 text-[9px] font-bold text-[#0F2942]">
                                    {as.person.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <span className="font-semibold text-xs text-[#0F2942] truncate" title={`${as.person} (${as.role})`}>
                                    {as.person}
                                  </span>
                                </div>
                                <div className="shrink-0 flex items-center gap-1 font-mono-tech">
                                  <span
                                    className="text-[10px] font-bold text-[#0F2942] bg-[#F3F0EB] border border-[#0F2942]/15 px-1.5 py-0.5 rounded shadow-2xs"
                                    title={`Asignación individual de ${as.person}: ${as.percent}%`}
                                  >
                                    {as.percent}%
                                  </span>
                                  <span
                                    className="text-[9.5px] font-bold text-[#07B1C5] bg-[#07B1C5]/10 border border-[#07B1C5]/20 px-1 py-0.5 rounded"
                                    title={`${Math.round((as.percent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10} horas asignadas de 182h`}
                                  >
                                    {Math.round((as.percent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-[11px] text-[#0F2942] truncate">
                              {act.assignedPerson}
                            </div>
                            <div className="font-mono-tech text-[9px] text-[#181B1E]/55">
                              {act.assignedRole} · {act.allocationPercent}% ({Math.round((act.allocationPercent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h)
                            </div>
                          </div>
                        )}
                      </td>

                      {/* % Avance (0% = Pendiente, 1-99% = En Curso, 100% = Completado) */}
                      <td className="px-2.5 py-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono-tech text-[10px]">
                            <span
                              className={`font-bold ${
                                isDone
                                  ? 'text-[#2F7F61]'
                                  : act.status === 'Atrasado'
                                  ? 'text-red-600'
                                  : isPending
                                  ? 'text-[#181B1E]/50'
                                  : 'text-[#07B1C5]'
                              }`}
                            >
                              {act.progressPercent || 0}%
                            </span>
                            <span className="text-[8px] opacity-60">
                              {isDone ? 'Hecho' : act.status === 'Atrasado' ? 'Atrasado' : isPending ? 'Pendiente' : 'En proceso'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#F3F0EB] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${act.progressPercent || 0}%`,
                                backgroundColor: isDone
                                  ? '#2F7F61'
                                  : act.status === 'Atrasado'
                                  ? '#EF4444'
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
                              : act.status === 'Atrasado'
                              ? 'bg-red-50 border-red-300 text-red-700 font-bold'
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-start">
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
                            : status === 'Atrasado'
                            ? '#EF4444'
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
                      className={`rounded-lg p-2.5 space-y-2 transition-colors ${
                        status === 'Atrasado'
                          ? 'bg-red-50/40 border-l-4 border-l-red-500 border border-red-200 hover:border-red-400'
                          : 'bg-[#F3F0EB]/30 border border-[#0F2942]/10 hover:border-[#0F2942]/30'
                      }`}
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

                      <div className="rounded bg-white border border-[#0F2942]/8 p-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono-tech text-[8.5px] uppercase font-bold text-[#0F2942]/60">
                            Asignados ({act.assignees?.length || 1})
                          </span>
                          <span className="font-mono-tech text-[9.5px] font-bold text-[#0F2942] bg-[#F3F0EB] border border-[#0F2942]/15 px-1.5 py-0.5 rounded shadow-2xs">
                            {act.allocationPercent}% ({Math.round((act.allocationPercent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h)
                          </span>
                        </div>
                        {act.assignees && act.assignees.length > 0 ? (
                          <div className="space-y-1">
                            {act.assignees.map((as) => (
                              <div key={as.id} className="flex items-center justify-between text-[10px]">
                                <span className="font-semibold text-[#0F2942] truncate max-w-[120px]">
                                  {as.person}
                                </span>
                                <span className="font-mono-tech text-[9px] font-bold text-[#07B1C5] bg-[#07B1C5]/10 border border-[#07B1C5]/20 px-1 py-0.2 rounded">
                                  {as.percent}% · {Math.round((as.percent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="font-semibold text-[10px] text-[#0F2942] truncate">
                            {act.assignedPerson}
                          </div>
                        )}
                        {act.additionalDate && (
                          <div className="font-mono-tech text-[8.5px] text-[#07B1C5] pt-0.5 border-t border-[#0F2942]/6">
                            Entrega: {act.additionalDate}
                          </div>
                        )}
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
          3. GANTT (FILTRADO EN TIEMPO REAL CON LÍNEA ROJA DE FECHA ACTUAL)
      ===================================================================== */}
      {activeTab === 'gantt' && (() => {
        const totalSpan = GANTT_END - GANTT_START;
        const currentDatePercent = Math.max(
          0,
          Math.min(100, ((GANTT_CURRENT_DATE - GANTT_START) / totalSpan) * 100)
        );

        return (
          <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#0F2942]/10 pb-2 gap-2">
              <div>
                <h2 className="text-xs font-bold text-[#0F2942]">Cronograma Gantt Maestro (Filtrable)</h2>
                <p className="font-mono-tech text-[10px] text-[#181B1E]/60">
                  Mostrando {filteredActivities.length} actividades filtradas por proyecto, cliente y estado
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono-tech text-[10px]">
                <span className="flex items-center gap-1.5 text-red-600 font-bold">
                  <span className="h-3 w-0.5 bg-red-600 shadow-xs" />
                  Hoy (Fecha Actual - 29 Sep)
                </span>
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <span className="h-2 w-2 rounded-xs bg-[#EF4444]" />
                  Atrasado
                </span>
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
                <div className="grid grid-cols-12 border-b border-[#0F2942]/10 pb-1.5 font-mono-tech text-[10px] text-[#0F2942]/70 font-bold uppercase relative">
                  <div className="col-span-4 pl-2">Actividad / Cliente</div>
                  <div className="col-span-8 grid grid-cols-8 text-center border-l border-[#0F2942]/10 relative">
                    {/* Línea Roja Vertical de Fecha Actual (Hoy) en el Header */}
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none z-30"
                      style={{ left: `${currentDatePercent}%` }}
                    >
                      <span className="absolute -top-3.5 -translate-x-1/2 bg-red-600 text-white font-mono-tech text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                        HOY (29 Sep)
                      </span>
                      <div className="h-full w-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                    </div>

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
                    const left = Math.max(0, Math.min(100, ((sTime - GANTT_START) / totalSpan) * 100));
                    const right = Math.max(0, Math.min(100, ((eTime - GANTT_START) / totalSpan) * 100));
                    const width = Math.max(5, right - left);
                    const isDone = act.status === 'Completado' || act.progressPercent === 100;
                    const isDelayed = act.status === 'Atrasado';

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
                          {/* Línea Roja Vertical de Fecha Actual (Hoy) en cada fila del Gantt */}
                          <div
                            className="absolute top-0 bottom-0 pointer-events-none z-20 w-[2px] bg-red-500/85 shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                            style={{ left: `${currentDatePercent}%` }}
                          />

                          <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                            {GANTT_MONTH_HEADERS.map((m) => (
                              <div key={m} className="border-r border-[#0F2942]/[0.05] last:border-r-0" />
                            ))}
                          </div>

                          <div
                            className={`relative h-5 rounded overflow-hidden flex items-center justify-between px-2 shadow-xs transition-all cursor-pointer ${
                              isDelayed ? 'ring-1 ring-red-400' : ''
                            }`}
                            onClick={() => handleOpenEdit(act)}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: isDone ? '#2F7F61' : isDelayed ? '#EF4444' : '#0F2942',
                            }}
                            title={`Editar: ${act.activityTitle} (${act.status} - ${act.progressPercent || 0}% avance)`}
                          >
                            <span className="font-mono-tech text-[9px] text-white font-medium truncate flex items-center gap-1">
                              {isDelayed && <AlertTriangle className="h-2.5 w-2.5 text-white shrink-0" />}
                              <span>{act.code} ({act.allocationPercent}% · {Math.round((act.allocationPercent / 100) * BASE_MONTHLY_CAPACITY_HOURS)}h)</span>
                            </span>
                            <span className="font-mono-tech text-[9px] text-white font-bold">
                              {isDelayed ? 'Atrasado' : `${act.progressPercent || 0}%`}
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
        );
      })()}

      {/* =====================================================================
          4. CAPACIDAD MENSUAL (DISEÑO EJECUTIVO UNIFICADO & PROMEDIO DINÁMICO)
      ===================================================================== */}
      {activeTab === 'capacidad' && (
        <div className="space-y-3.5">
          {/* Executive Header: Utilización Promedio & Indicadores de Capacidad */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs">
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
                <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                  <span className="font-mono-tech text-2xl sm:text-3xl font-bold text-[#0F2942]">
                    {capacityMetrics.avgAllocation}%
                  </span>
                  <span className="font-mono-tech text-xs text-[#07B1C5] font-bold">
                    ({capacityMetrics.assignedHours}h de {capacityMetrics.totalHours}h)
                  </span>
                  <span className="font-mono-tech text-[10px] text-[#181B1E]/60">
                    · Base 182h/mes por especialista
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

            {/* Right: Resumen Rápido de Estados (Simétrico y Proporcional) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#0F2942]/8">
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-red-50/70 border border-red-200/80 min-w-[95px]">
                <span className="font-mono-tech text-base font-bold text-red-700">
                  {capacityMetrics.overloadCount}
                </span>
                <span className="font-mono-tech text-[10px] text-red-600 font-semibold tracking-tight">
                  Sobrecarga
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-amber-50/70 border border-amber-200/80 min-w-[95px]">
                <span className="font-mono-tech text-base font-bold text-amber-700">
                  {capacityMetrics.limitCount}
                </span>
                <span className="font-mono-tech text-[10px] text-amber-600 font-semibold tracking-tight">
                  Al Límite
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-[#2F7F61]/10 border border-[#2F7F61]/25 min-w-[95px]">
                <span className="font-mono-tech text-base font-bold text-[#2F7F61]">
                  {capacityMetrics.availableCount}
                </span>
                <span className="font-mono-tech text-[10px] text-[#2F7F61] font-semibold tracking-tight">
                  Con Margen
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-[#0F2942]/5 border border-[#0F2942]/10 min-w-[95px]">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-tech text-base font-bold text-[#0F2942]">
                    {capacityMetrics.assignedHours}h
                  </span>
                  <span className="font-mono-tech text-[9.5px] text-[#181B1E]/60">
                    / {capacityMetrics.totalHours}h
                  </span>
                </div>
                <span className="font-mono-tech text-[10px] text-[#07B1C5] font-bold tracking-tight">
                  {Math.round((capacityMetrics.assignedHours / (capacityMetrics.totalHours || 1)) * 100)}% Ocupado
                </span>
              </div>
            </div>
          </div>

          {/* Symmetrical Dedicated Filters Bar */}
          <div className="rounded-xl bg-white border border-[#0F2942]/10 p-4 shadow-xs space-y-3">
            {/* Toolbar Header: Título + Contador + Botón Limpiar */}
            <div className="flex items-center justify-between border-b border-[#0F2942]/8 pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#07B1C5]" />
                <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#0F2942]">
                  Filtros de Capacidad &amp; Asignación
                </span>
                <span className="inline-flex items-center rounded-full bg-[#0F2942]/5 px-2 py-0.5 font-mono-tech text-[10px] font-semibold text-[#0F2942]">
                  {sortedCapacityCollaborators.length} de {collaborators.length} especialistas visibles
                </span>
              </div>

              {(capacitySearch !== '' ||
                capacityMonthFilter !== 'todos' ||
                capacityAlertFilter !== 'todos' ||
                capacitySortMode !== 'desc') && (
                <button
                  type="button"
                  onClick={() => {
                    setCapacitySearch('');
                    setCapacityMonthFilter('todos');
                    setCapacityAlertFilter('todos');
                    setCapacitySortMode('desc');
                  }}
                  className="flex items-center gap-1.5 font-mono-tech text-[11px] font-semibold text-[#07B1C5] hover:text-[#0F2942] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restablecer Filtros</span>
                </button>
              )}
            </div>

            {/* Symmetrical 4-Column Grid: 4 Filtros Perfectamente Alineados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Búsqueda */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase font-bold text-[#181B1E]/60 tracking-wider">
                  <Search className="h-3.5 w-3.5 text-[#07B1C5]" />
                  <span>Buscar Especialista</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={capacitySearch}
                    onChange={(e) => setCapacitySearch(e.target.value)}
                    placeholder="Nombre o cargo..."
                    className={`w-full h-9 rounded-lg border pl-3 pr-8 py-1.5 text-xs text-[#0F2942] transition-colors focus:outline-none ${
                      capacitySearch.trim() !== ''
                        ? 'border-[#07B1C5] bg-[#07B1C5]/[0.03] focus:border-[#07B1C5]'
                        : 'border-[#0F2942]/15 bg-[#F3F0EB]/30 focus:border-[#07B1C5] focus:bg-white'
                    }`}
                  />
                  {capacitySearch ? (
                    <button
                      type="button"
                      onClick={() => setCapacitySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#181B1E]/40 hover:text-[#0F2942] p-0.5 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#181B1E]/30" />
                  )}
                </div>
              </div>

              {/* 2. Periodo Temporal */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase font-bold text-[#181B1E]/60 tracking-wider">
                  <Calendar className="h-3.5 w-3.5 text-[#07B1C5]" />
                  <span>Periodo Temporal</span>
                </label>
                <select
                  value={capacityMonthFilter}
                  onChange={(e) => setCapacityMonthFilter(e.target.value)}
                  className={`w-full h-9 rounded-lg border px-3 py-1.5 font-mono-tech text-xs font-semibold text-[#0F2942] transition-colors cursor-pointer focus:outline-none ${
                    capacityMonthFilter !== 'todos'
                      ? 'border-[#07B1C5] bg-[#07B1C5]/[0.03] focus:border-[#07B1C5]'
                      : 'border-[#0F2942]/15 bg-[#F3F0EB]/30 focus:border-[#07B1C5] focus:bg-white'
                  }`}
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

              {/* 3. Nivel de Carga */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase font-bold text-[#181B1E]/60 tracking-wider">
                  <Activity className="h-3.5 w-3.5 text-[#07B1C5]" />
                  <span>Nivel de Carga</span>
                </label>
                <select
                  value={capacityAlertFilter}
                  onChange={(e) =>
                    setCapacityAlertFilter(
                      e.target.value as 'todos' | 'sobrecarga' | 'limite' | 'disponible'
                    )
                  }
                  className={`w-full h-9 rounded-lg border px-3 py-1.5 font-mono-tech text-xs font-semibold text-[#0F2942] transition-colors cursor-pointer focus:outline-none ${
                    capacityAlertFilter !== 'todos'
                      ? 'border-[#07B1C5] bg-[#07B1C5]/[0.03] focus:border-[#07B1C5]'
                      : 'border-[#0F2942]/15 bg-[#F3F0EB]/30 focus:border-[#07B1C5] focus:bg-white'
                  }`}
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="sobrecarga">🔴 Sobrecarga (&gt;100%)</option>
                  <option value="limite">🟠 Al Límite (85% - 100%)</option>
                  <option value="disponible">🟢 Con Margen (&lt;85%)</option>
                </select>
              </div>

              {/* 4. Orden de Asignación */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase font-bold text-[#181B1E]/60 tracking-wider">
                  <ArrowUpDown className="h-3.5 w-3.5 text-[#07B1C5]" />
                  <span>Criterio de Orden</span>
                </label>
                <select
                  value={capacitySortMode}
                  onChange={(e) => setCapacitySortMode(e.target.value as 'desc' | 'asc' | 'name')}
                  className={`w-full h-9 rounded-lg border px-3 py-1.5 font-mono-tech text-xs font-semibold text-[#0F2942] transition-colors cursor-pointer focus:outline-none ${
                    capacitySortMode !== 'desc'
                      ? 'border-[#07B1C5] bg-[#07B1C5]/[0.03] focus:border-[#07B1C5]'
                      : 'border-[#0F2942]/15 bg-[#F3F0EB]/30 focus:border-[#07B1C5] focus:bg-white'
                  }`}
                >
                  <option value="desc">↓ Mayor a Menor Carga</option>
                  <option value="asc">↑ Menor a Mayor Carga</option>
                  <option value="name">Alfabético (A - Z)</option>
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
                      Promedio (% / 182h)
                    </th>
                    {visibleMonthColumns.map((m) => (
                      <th
                        key={m.key}
                        className="px-3 py-2.5 font-medium text-center border-l border-[#0F2942]/8 min-w-[130px]"
                      >
                        {m.label} <span className="text-[9px] opacity-70 lowercase">(182h)</span>
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
                    const colHoursAvg = getColDynamicHours(col);
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

                        {/* 2. Columna Dinámica: Promedio de Asignación por Mes/Año (% y Horas Asignadas de 182h) */}
                        <td className="p-3 border-l border-[#0F2942]/8 align-middle text-center bg-[#07B1C5]/[0.02]">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
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
                              <span className="font-mono-tech text-[8.5px] font-bold text-red-700 bg-red-100 px-1 py-0.2 rounded">
                                Sobrecarga
                              </span>
                            )}
                            {isLimit && (
                              <span className="font-mono-tech text-[8.5px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                                Límite
                              </span>
                            )}
                          </div>
                          <div className="font-mono-tech text-[10px] font-bold text-[#07B1C5] mb-1">
                            {colHoursAvg}h <span className="text-[9px] text-[#181B1E]/45 font-normal">/ 182h</span>
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

                        {/* 3..N. Monthly Matrix Cells (% y Horas Asignadas de 182h) */}
                        {visibleMonthColumns.map((m) => {
                          const mData = col.monthlyAllocations[m.key] || {
                            assignedHours: 0,
                            totalPercent: 0,
                            availableHours: BASE_MONTHLY_CAPACITY_HOURS,
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
                              <div className="flex items-center justify-center gap-1.5 mb-0.5">
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
                                  <span className="font-mono-tech text-[8.5px] font-bold text-red-700 bg-red-600/10 px-1 py-0.2 rounded">
                                    +{mData.overloadPercent}%
                                  </span>
                                )}
                              </div>

                              <div className="font-mono-tech text-[10px] text-[#181B1E]/70 font-semibold mb-1">
                                {mData.assignedHours}h <span className="text-[9px] text-[#181B1E]/40 font-normal">/ 182h</span>
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
          MODAL: REGISTRAR / MODIFICAR / EDITAR PROYECTO
      ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#0F2942]/20 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#0F2942]/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#07B1C5]" />
                <h3 className="text-sm font-bold text-[#0F2942]">
                  {editingActivityId ? 'Modificar / Editar Proyecto' : 'Registrar Nuevo Proyecto'}
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
              {/* Project Name & Client (Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Nombre del Proyecto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    placeholder="Ej. Plataforma IoT & Telemetría en Pozos"
                    className="w-full rounded-md border border-[#0F2942]/20 px-3 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase mb-1">
                    Cliente (Lista Desplegable) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.client}
                    onChange={(e) => {
                      const newClient = e.target.value;
                      const suggestedProj = CLIENT_DEFAULT_PROJECT[newClient];
                      setFormData((prev) => ({
                        ...prev,
                        client: newClient,
                        projectName:
                          !prev.projectName ||
                          Object.values(CLIENT_DEFAULT_PROJECT).includes(prev.projectName)
                            ? suggestedProj || prev.projectName
                            : prev.projectName,
                      }));
                    }}
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

              {/* CHECKLIST DE TAREAS & HORAS DE ESFUERZO */}
              {(() => {
                const totalTaskHours = formData.tasks.reduce((acc, t) => acc + (t.hours || 0), 0);
                const completedTaskHours = formData.tasks
                  .filter((t) => t.completed)
                  .reduce((acc, t) => acc + (t.hours || 0), 0);
                const totalCapPercent = ((totalTaskHours / BASE_MONTHLY_CAPACITY_HOURS) * 100).toFixed(1);

                return (
                  <div className="rounded-xl bg-[#F3F0EB]/60 border border-[#0F2942]/10 p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="font-mono-tech text-[10px] font-bold text-[#0F2942] uppercase tracking-wide">
                          Checklist de Tareas / Subtareas
                        </label>
                        <span className="font-mono-tech text-[9.5px] text-[#07B1C5] font-bold bg-[#07B1C5]/10 px-2 py-0.5 rounded border border-[#07B1C5]/20">
                          {formData.tasks.filter((t) => t.completed).length}/{formData.tasks.length} completadas
                        </span>
                      </div>

                      {/* Resumen total de horas y ocupación sobre las 182h */}
                      <div className="flex items-center gap-2 font-mono-tech text-[10px]">
                        <span className="font-bold text-[#0F2942] bg-white border border-[#0F2942]/15 px-2 py-0.5 rounded shadow-2xs">
                          Esfuerzo: <strong className="text-[#07B1C5]">{totalTaskHours}h</strong>{' '}
                          <span className="text-[#181B1E]/50 font-normal">({completedTaskHours}h listas)</span>
                        </span>
                        <span className="text-[#181B1E]/70 font-semibold hidden sm:inline" title="Ocupación sobre la capacidad base de 182 horas mensuales">
                          Ocupa: <strong className="text-[#0F2942]">{totalCapPercent}%</strong> de 182h
                        </span>
                      </div>
                    </div>

                    {/* Sincronización rápida opcional si hay horas de tareas */}
                    {totalTaskHours > 0 && (
                      <div className="flex items-center justify-between gap-2 bg-[#07B1C5]/10 border border-[#07B1C5]/20 px-2.5 py-1.5 rounded-lg text-[10.5px]">
                        <div className="flex items-center gap-1.5 text-[#0F2942] font-mono-tech">
                          <TrendingUp className="h-3.5 w-3.5 text-[#07B1C5] shrink-0" />
                          <span>
                            Total: <strong>{totalTaskHours}h</strong> de esfuerzo = <strong>{totalCapPercent}%</strong> de la capacidad base (182h).
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSyncTasksHoursToAllocation}
                          className="font-mono-tech text-[9.5px] font-bold text-[#0F2942] bg-white hover:bg-[#0F2942] hover:text-white px-2 py-0.5 rounded border border-[#0F2942]/15 transition-colors cursor-pointer shrink-0 shadow-2xs"
                          title="Ajusta el % de asignación para que coincida exactamente con las horas estimadas de las tareas"
                        >
                          Sincronizar a Asignación
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {formData.tasks.map((task) => {
                        const taskHours = task.hours || 0;
                        const taskPercent = ((taskHours / BASE_MONTHLY_CAPACITY_HOURS) * 100).toFixed(1);

                        return (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-2 rounded bg-white border border-[#0F2942]/10 p-1.5 text-xs hover:border-[#07B1C5]/30 transition-colors"
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
                                  task.completed ? 'line-through text-[#2F7F61]/70' : 'text-[#0F2942] font-medium'
                                }`}
                              >
                                {task.title}
                              </span>
                            </button>

                            {/* Horas de esfuerzo individual de la tarea + % de 182h */}
                            <div className="flex items-center gap-1.5 shrink-0 font-mono-tech">
                              <div
                                className="flex items-center gap-1 bg-[#F3F0EB]/70 border border-[#0F2942]/15 rounded px-1.5 py-0.5"
                                title="Horas de esfuerzo estimadas para esta tarea"
                              >
                                <Clock className="h-3 w-3 text-[#07B1C5]" />
                                <input
                                  type="number"
                                  min="0"
                                  max="182"
                                  value={taskHours}
                                  onChange={(e) =>
                                    handleUpdateTaskHoursInForm(task.id, Number(e.target.value))
                                  }
                                  className="w-12 bg-transparent text-right font-bold text-xs text-[#0F2942] focus:outline-none"
                                />
                                <span className="text-[10px] text-[#181B1E]/60 font-semibold">h</span>
                              </div>

                              <span
                                className="font-mono-tech text-[9.5px] font-bold text-[#0F2942]/70 bg-[#0F2942]/5 border border-[#0F2942]/10 px-1.5 py-0.5 rounded shadow-2xs"
                                title={`Esta subtarea representa el ${taskPercent}% de las 182 horas mensuales`}
                              >
                                {taskPercent}%
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveTaskFromForm(task.id)}
                                className="text-[#181B1E]/40 hover:text-red-600 p-0.5 cursor-pointer transition-colors"
                                title="Eliminar tarea"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add new task to checklist with Title & Hours */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-[#0F2942]/10">
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
                        placeholder="Escribe una nueva tarea / subtarea..."
                        className="flex-1 rounded border border-[#0F2942]/20 bg-white px-2.5 py-1 text-xs text-[#0F2942] focus:border-[#07B1C5] focus:outline-none"
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div
                          className="flex items-center gap-1 rounded border border-[#0F2942]/20 bg-white px-2 py-1"
                          title="Cantidad de horas de esfuerzo para la nueva tarea"
                        >
                          <Clock className="h-3 w-3 text-[#07B1C5]" />
                          <input
                            type="number"
                            min="1"
                            max="182"
                            value={newTaskHours}
                            onChange={(e) => setNewTaskHours(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTaskToForm();
                              }
                            }}
                            placeholder="Horas"
                            className="w-14 text-right font-mono-tech text-xs font-bold text-[#0F2942] focus:outline-none"
                          />
                          <span className="font-mono-tech text-[10px] text-[#181B1E]/60 font-semibold">h</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddTaskToForm}
                          disabled={!newTaskInput.trim()}
                          className="rounded bg-[#0F2942] px-3 py-1 font-mono-tech text-[10px] font-bold text-white hover:bg-[#07B1C5] hover:text-[#0F2942] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

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

              {/* =====================================================================
                  A QUIÉN ASIGNO (UNO O MÁS COLABORADORES CON SU RESPECTIVO %)
                  Y CÁLCULO EN TIEMPO REAL DE LA CAPACIDAD MENSUAL
              ===================================================================== */}
              <div className="rounded-xl bg-[#F3F0EB]/50 border border-[#0F2942]/15 p-3.5 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-[#07B1C5] shrink-0" />
                    <label className="font-mono-tech text-[11px] font-bold text-[#0F2942] uppercase tracking-wide">
                      A Quién Asigno <span className="text-red-500">*</span>
                    </label>
                    <span className="font-mono-tech text-[9.5px] text-[#0F2942] font-semibold bg-white border border-[#0F2942]/15 px-2 py-0.5 rounded-full shadow-2xs">
                      {formData.assignees.length} {formData.assignees.length === 1 ? 'persona asignada' : 'personas asignadas'}
                    </span>
                  </div>

                  {/* CAPACIDAD (% Y HORAS SOBRE BASE 182H) */}
                  <div className="flex items-center gap-1.5 bg-[#0F2942] border border-[#0F2942] rounded-lg px-2.5 py-1.5 shadow-xs text-white">
                    <TrendingUp className="h-3.5 w-3.5 text-[#07B1C5]" />
                    <span className="font-mono-tech text-[10px] font-bold uppercase tracking-wider text-white/80">
                      Capacidad:
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-[#07B1C5] bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {formData.allocationPercent}%
                    </span>
                    <span className="font-mono-tech text-xs font-bold text-white">
                      · {Math.round((formData.allocationPercent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h
                    </span>
                    <span className="font-mono-tech text-[9px] text-white/60">
                      / 182h
                    </span>
                  </div>
                </div>

                {/* Lista interactiva de personas asignadas */}
                <div className="space-y-2">
                  {formData.assignees.map((as, index) => (
                    <div
                      key={as.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white border border-[#0F2942]/15 p-2.5 rounded-lg shadow-2xs"
                    >
                      {/* Persona Selector */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono-tech text-[9px] font-bold text-[#0F2942]/70 uppercase">
                            Colaborador #{index + 1}
                          </span>
                          <span className="font-mono-tech text-[9px] text-[#181B1E]/60 truncate max-w-[200px]" title={as.role}>
                            {as.role}
                          </span>
                        </div>
                        <select
                          value={as.person}
                          onChange={(e) =>
                            handleUpdateAssigneeInForm(as.id, { person: e.target.value })
                          }
                          className="w-full rounded-md border border-[#0F2942]/20 px-2.5 py-1.5 text-xs text-[#0F2942] font-semibold focus:border-[#07B1C5] focus:outline-none bg-white cursor-pointer"
                        >
                          {collaborators.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name} — ({c.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Asignación Individual (% y Horas Asignadas de 182h) */}
                      <div className="w-full sm:w-[220px] shrink-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono-tech text-[9px] font-bold text-[#0F2942] uppercase tracking-wide">
                            Asignación
                          </span>
                          <span className="font-mono-tech text-[9.5px] font-bold text-[#07B1C5] bg-[#0F2942]/5 px-1.5 py-0.2 rounded border border-[#0F2942]/10 shadow-2xs">
                            {Math.round((as.percent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h / 182h
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={as.percent}
                            onChange={(e) =>
                              handleUpdateAssigneeInForm(as.id, { percent: Number(e.target.value) })
                            }
                            className="flex-1 accent-[#07B1C5] cursor-pointer"
                          />
                          <div className="relative w-14 shrink-0">
                            <input
                              type="number"
                              min="5"
                              max="100"
                              step="5"
                              value={as.percent}
                              onChange={(e) =>
                                handleUpdateAssigneeInForm(as.id, {
                                  percent: Math.max(5, Math.min(100, Number(e.target.value))),
                                })
                              }
                              className="w-full rounded-md border border-[#0F2942]/20 bg-white pr-4 pl-1.5 py-1 text-center font-mono-tech text-xs font-bold text-[#0F2942] focus:outline-none focus:border-[#07B1C5] shadow-2xs"
                            />
                            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 font-mono-tech text-[10px] font-bold text-[#0F2942]/60">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botón Eliminar Colaborador (si hay más de 1) */}
                      {formData.assignees.length > 1 && (
                        <div className="flex items-center justify-end sm:pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveAssigneeInForm(as.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Quitar colaborador"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Botón para Añadir Otro Colaborador */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddAssigneeToForm}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed border-[#0F2942]/25 bg-white hover:bg-[#F3F0EB] px-3 py-1.5 font-mono-tech text-xs font-bold text-[#0F2942] transition-colors cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-[#07B1C5]" />
                    <span>+ Agregar otro colaborador asignado a este proyecto</span>
                  </button>
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
                    <span>{editingActivityId ? 'Guardar Cambios' : 'Registrar Proyecto'}</span>
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
                          {Math.round((act.allocationPercent / 100) * BASE_MONTHLY_CAPACITY_HOURS * 10) / 10}h de 182h · {act.progressPercent}% avance
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

                    {/* Checklist Tasks preview with hours */}
                    {act.tasks && act.tasks.length > 0 && (
                      <div className="pt-1 border-t border-[#0F2942]/8">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono-tech text-[9px] font-bold text-[#0F2942]/70 uppercase">
                            Subtareas / Checklist ({act.tasks.filter((t) => t.completed).length}/{act.tasks.length} completadas):
                          </span>
                          <span className="font-mono-tech text-[9px] font-bold text-[#07B1C5]">
                            {act.tasks.reduce((sum, t) => sum + (t.hours || 0), 0)}h de esfuerzo total
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
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
                              <span className="truncate max-w-[180px]">{t.title}</span>
                              <strong className="text-[#07B1C5] font-bold">({t.hours || 0}h)</strong>
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
