import React, { useState } from 'react';
import { ControlCenterProvider, useControlCenter } from './context/ControlCenterContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginView } from './components/LoginView';
import { ServerSetupView } from './components/ServerSetupView';
import { OverviewView } from './components/OverviewView';
import { BotManager } from './components/BotManager';
import { FarmManager } from './components/FarmManager';
import { ActivityLogView } from './components/ActivityLogView';
import { ConsoleView } from './components/ConsoleView';
import { SettingsView } from './components/SettingsView';
import { SecurityView } from './components/SecurityView';
import { 
  EditCoordinatesModal, 
  CustomTeleportModal, 
  AddBotModal, 
  AddFarmModal, 
  EditFarmModal 
} from './components/Modals';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

function DashboardLayout() {
  const { 
    isAuthenticated, 
    activeTab, 
    theme, 
    lastNotification, 
    setLastNotification,
    settings,
    settingsLoaded
  } = useControlCenter();

  // Responsive sidebar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'addBot' | 'editCoords' | 'customTp' | 'addFarm' | 'editFarm'
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);

  // If not authenticated, render login / register portal
  if (!isAuthenticated) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <LoginView />
      </div>
    );
  }

  // If authenticated but no server IP/world configured yet, show onboarding setup
  if (settingsLoaded && !settings?.bedrock?.host) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <ServerSetupView />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-background text-foreground`}>
      <div className="flex min-h-screen">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto h-screen">
          {/* Top Application Header */}
          <TopHeader 
            isCollapsed={isCollapsed} 
            setIsCollapsed={setIsCollapsed} 
            setIsMobileOpen={setIsMobileOpen} 
          />

          {/* Page Body Container */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1400px] px-4 pt-7 pb-12 sm:px-6 lg:px-8">
              {/* Notification Toast Alert */}
              {lastNotification && (
                <div 
                  className={`mb-6 flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-xs shadow-sm transition-all animate-in fade-in-0 ${
                    lastNotification.type === 'success' || lastNotification.type === 'info'
                      ? 'border-success/20 bg-success/10 text-success'
                      : 'border-warning/25 bg-warning/10 text-warning'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {lastNotification.type === 'success' || lastNotification.type === 'info' ? (
                      <CheckCircle2 className="size-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-4 shrink-0" />
                    )}
                    <span className="font-medium">{lastNotification.text}</span>
                  </div>
                  <button 
                    onClick={() => setLastNotification(null)}
                    aria-label="Dismiss notification"
                    className="flex size-6 items-center justify-center rounded text-current opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              {/* View 1: Overview */}
              {activeTab === 'overview' && (
                <OverviewView />
              )}

              {/* View 2: Bot Manager */}
              {activeTab === 'bots' && (
                <BotManager 
                  onOpenAddBot={() => setActiveModal('addBot')}
                  onOpenEditCoords={(bot) => {
                    setSelectedBot(bot);
                    setActiveModal('editCoords');
                  }}
                  onOpenCustomTeleport={(bot) => {
                    setSelectedBot(bot);
                    setActiveModal('customTp');
                  }}
                />
              )}

              {/* View 3: Farm Loaders */}
              {activeTab === 'farms' && (
                <FarmManager 
                  onOpenAddFarm={() => setActiveModal('addFarm')}
                  onOpenEditFarm={(farm) => {
                    setSelectedFarm(farm);
                    setActiveModal('editFarm');
                  }}
                />
              )}

              {/* View 4: Server Console */}
              {activeTab === 'console' && (
                <ConsoleView />
              )}

              {/* View 5: Audit & Activity */}
              {activeTab === 'activity' && (
                <ActivityLogView />
              )}

              {/* View 6: Settings */}
              {activeTab === 'settings' && (
                <SettingsView />
              )}

              {/* View 7: Security & Auth */}
              {activeTab === 'security' && (
                <SecurityView />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Action Modals */}
      {activeModal === 'addBot' && (
        <AddBotModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'editCoords' && selectedBot && (
        <EditCoordinatesModal 
          bot={selectedBot} 
          onClose={() => { setSelectedBot(null); setActiveModal(null); }} 
        />
      )}

      {activeModal === 'customTp' && selectedBot && (
        <CustomTeleportModal 
          bot={selectedBot} 
          onClose={() => { setSelectedBot(null); setActiveModal(null); }} 
        />
      )}

      {activeModal === 'addFarm' && (
        <AddFarmModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'editFarm' && selectedFarm && (
        <EditFarmModal 
          farm={selectedFarm} 
          onClose={() => { setSelectedFarm(null); setActiveModal(null); }} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ControlCenterProvider>
      <DashboardLayout />
    </ControlCenterProvider>
  );
}
