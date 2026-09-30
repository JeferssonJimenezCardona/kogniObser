import React from 'react';
import {
  Users,
  Briefcase,
  Settings,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
} from 'lucide-react';
import { KogniaLogo } from './KogniaLogo';

export type MainModuleId = 'moc' | 'proyectos' | 'administracion';

interface SidebarProps {
  activeModule: MainModuleId;
  onSelectModule: (module: MainModuleId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
}) => {
  const handleSelect = (id: MainModuleId) => {
    onSelectModule(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-30 bg-[#0F2942]/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col kognia-sidebar-mesh text-white border-r border-white/8 transition-all duration-300 ease-in-out lg:static ${
          isOpenMobile ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsedDesktop ? 'lg:w-0 lg:overflow-hidden lg:border-r-0 lg:p-0' : 'lg:w-[260px]'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-white/8">
          <button
            type="button"
            onClick={() => handleSelect('moc')}
            className="text-left focus:outline-none group cursor-pointer"
          >
            <KogniaLogo className="h-7.5 transition-opacity group-hover:opacity-90" variant="white" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapseDesktop}
            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Ocultar menú lateral"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          {/* MÓDULOS DE GESTIÓN */}
          <div>
            <div className="px-3 pb-2 font-mono-tech text-[10px] tracking-[0.14em] text-white/40 uppercase">
              Módulos
            </div>
            <nav className="space-y-1.5" aria-label="Módulos de Gestión">
              {/* MOC */}
              <button
                type="button"
                onClick={() => handleSelect('moc')}
                className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer ${
                  activeModule === 'moc'
                    ? 'bg-[#0F2942]/95 border border-[#07B1C5]/70 shadow-[0_0_20px_-6px_rgba(7,177,197,0.35)]'
                    : 'border border-transparent hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      activeModule === 'moc'
                        ? 'bg-[#07B1C5]/20 text-[#07B1C5]'
                        : 'bg-white/[0.04] text-white/65 group-hover:text-white'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold tracking-tight text-white truncate">
                      MOC
                    </div>
                    <div className="font-mono-tech text-[10px] text-white/50 truncate">
                      Clientes &amp; Pipeline
                    </div>
                  </div>
                </div>

                {activeModule === 'moc' ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#07B1C5]" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
                )}
              </button>

              {/* Proyectos */}
              <button
                type="button"
                onClick={() => handleSelect('proyectos')}
                className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer ${
                  activeModule === 'proyectos'
                    ? 'bg-[#0F2942]/95 border border-[#07B1C5]/70 shadow-[0_0_20px_-6px_rgba(7,177,197,0.35)]'
                    : 'border border-transparent hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      activeModule === 'proyectos'
                        ? 'bg-[#07B1C5]/20 text-[#07B1C5]'
                        : 'bg-white/[0.04] text-white/65 group-hover:text-white'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold tracking-tight text-white truncate">
                      Proyectos
                    </div>
                    <div className="font-mono-tech text-[10px] text-white/50 truncate">
                      Actividades &amp; Capacidad
                    </div>
                  </div>
                </div>

                {activeModule === 'proyectos' ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#07B1C5]" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
                )}
              </button>
            </nav>
          </div>

          {/* ADICIONAL (ADMINISTRACIÓN) */}
          <div className="pt-2 border-t border-white/8">
            <div className="px-3 pb-2 font-mono-tech text-[10px] tracking-[0.14em] text-white/40 uppercase">
              Administración
            </div>
            <nav aria-label="Módulo Adicional">
              <button
                type="button"
                onClick={() => handleSelect('administracion')}
                className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer ${
                  activeModule === 'administracion'
                    ? 'bg-[#0F2942]/95 border border-[#07B1C5]/70 shadow-[0_0_20px_-6px_rgba(7,177,197,0.35)]'
                    : 'border border-transparent hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      activeModule === 'administracion'
                        ? 'bg-[#07B1C5]/20 text-[#07B1C5]'
                        : 'bg-white/[0.04] text-white/65 group-hover:text-white'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold tracking-tight text-white truncate">
                      Administración
                    </div>
                    <div className="font-mono-tech text-[10px] text-white/50 truncate">
                      MOC, Proyectos &amp; Roles
                    </div>
                  </div>
                </div>

                {activeModule === 'administracion' ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#07B1C5]" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white/80 truncate">
              Kognia Enterprise
            </div>
            <div className="font-mono-tech text-[9px] text-white/40 truncate">
              Sistema Activo
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono-tech text-[9px] text-[#2F7F61] bg-[#2F7F61]/15 px-1.5 py-0.5 rounded">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>v2.6</span>
          </div>
        </div>
      </aside>
    </>
  );
};

