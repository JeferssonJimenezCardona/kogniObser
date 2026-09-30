import React, { useState } from 'react';
import { Menu, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Sidebar, MainModuleId } from './components/Sidebar';
import { MocModule } from './components/MocModule';
import { ProjectsModule } from './components/ProjectsModule';
import { AdminModule } from './components/AdminModule';
import {
  INITIAL_CLIENTS,
  INITIAL_ACTIVITIES,
  ClientOpportunity,
  ProjectActivity,
  MocStage,
  TaskStatus,
} from './data/kogniaData';

export default function App() {
  const [activeModule, setActiveModule] = useState<MainModuleId>('moc');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);

  // Live state for MOC
  const [clients, setClients] = useState<ClientOpportunity[]>(INITIAL_CLIENTS);

  // Live state for Proyectos (Actividades, Tareas y Asignaciones)
  const [activities, setActivities] = useState<ProjectActivity[]>(INITIAL_ACTIVITIES);

  // Handlers for MOC
  const handleSaveClient = (client: ClientOpportunity, isNew: boolean) => {
    if (isNew) {
      setClients((prev) => [client, ...prev]);
    } else {
      setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    }
  };

  const handleQuickChangeStage = (clientId: string, newStage: MocStage) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              stage: newStage,
              probability:
                newStage === 'Conversión'
                  ? 100
                  : newStage === 'Perdida'
                  ? 0
                  : c.probability,
              updatedAt: '2026-09-29',
            }
          : c
      )
    );
  };

  // Handlers for Proyectos
  const handleAddActivity = (newAct: ProjectActivity) => {
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleEditActivity = (updatedAct: ProjectActivity) => {
    setActivities((prev) => prev.map((a) => (a.id === updatedAct.id ? updatedAct : a)));
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
  };

  const handleUpdateActivityStatus = (activityId: string, nextStatus: TaskStatus) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;
        const progress = nextStatus === 'Completado' ? 100 : nextStatus === 'Por Iniciar' ? 0 : a.progressPercent || 50;
        return { ...a, status: nextStatus, progressPercent: progress };
      })
    );
  };

  const handleUpdateAllocation = (activityId: string, newPercent: number) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, allocationPercent: newPercent } : a))
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F3F0EB] text-[#181B1E]">
      {/* Sidebar with Kognia Logo and Brand System */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsCollapsedDesktop((v) => !v)}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Minimalist Top Utility Bar (Clean, no clutter, no redundant titles) */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#0F2942]/10 bg-[#F3F0EB]/95 px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0F2942]/15 text-[#0F2942] hover:bg-white lg:hidden cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Desktop show/hide modules toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsedDesktop((v) => !v)}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[#0F2942]/15 bg-white/60 px-2.5 py-1 text-[11px] font-mono-tech text-[#0F2942] hover:bg-white transition-colors cursor-pointer"
              title={isCollapsedDesktop ? 'Mostrar menú de módulos' : 'Ocultar menú de módulos'}
            >
              {isCollapsedDesktop ? (
                <>
                  <PanelLeftOpen className="h-3.5 w-3.5 text-[#07B1C5]" />
                  <span>Mostrar Módulos</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-3.5 w-3.5 text-[#0F2942]/70" />
                  <span>Ocultar Módulos</span>
                </>
              )}
            </button>

            {/* Minimal breadcrumb indicator */}
            <span className="font-mono-tech text-[11px] font-bold text-[#0F2942] uppercase tracking-wider pl-1">
              {activeModule === 'moc'
                ? 'MOC'
                : activeModule === 'proyectos'
                ? 'PROYECTOS'
                : activeModule === 'cotizaciones'
                ? 'COTIZACIONES'
                : 'ADMINISTRACIÓN'}
            </span>
          </div>

          {/* Quick switcher if sidebar is hidden */}
          {isCollapsedDesktop && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModule('moc')}
                className={`px-2.5 py-1 rounded-md font-mono-tech text-[11px] transition-colors cursor-pointer ${
                  activeModule === 'moc' ? 'bg-[#0F2942] text-white font-medium' : 'text-[#0F2942]/70 hover:bg-white'
                }`}
              >
                MOC
              </button>
              <button
                type="button"
                onClick={() => setActiveModule('proyectos')}
                className={`px-2.5 py-1 rounded-md font-mono-tech text-[11px] transition-colors cursor-pointer ${
                  activeModule === 'proyectos' ? 'bg-[#0F2942] text-white font-medium' : 'text-[#0F2942]/70 hover:bg-white'
                }`}
              >
                Proyectos
              </button>
              <button
                type="button"
                onClick={() => setActiveModule('administracion')}
                className={`px-2.5 py-1 rounded-md font-mono-tech text-[11px] transition-colors cursor-pointer ${
                  activeModule === 'administracion' ? 'bg-[#0F2942] text-white font-medium' : 'text-[#0F2942]/70 hover:bg-white'
                }`}
              >
                Administración
              </button>
            </div>
          )}
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeModule === 'moc' && (
            <MocModule
              clients={clients}
              onSaveClient={handleSaveClient}
              onQuickChangeStage={handleQuickChangeStage}
            />
          )}

          {activeModule === 'proyectos' && (
            <ProjectsModule
              activities={activities}
              onAddActivity={handleAddActivity}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
              onUpdateActivityStatus={handleUpdateActivityStatus}
              onUpdateAllocation={handleUpdateAllocation}
            />
          )}

          {activeModule === 'administracion' && (
            <AdminModule />
          )}
        </main>
      </div>
    </div>
  );
}
