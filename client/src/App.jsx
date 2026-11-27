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
    lastNotification,
    setLastNotification,
    settings,
    settingsLoaded
  } = useControlCenter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  if (settingsLoaded && !settings?.bedrock?.host) {
    return <ServerSetupView />;
  }

  const toastTone =
    lastNotification?.type === 'success' || lastNotification?.type === 'info'
      ? 'is-success'
      : lastNotification?.type === 'error'
        ? 'is-danger'
        : 'is-warning';

  return (
    <div className="cc-shell">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="cc-main-col">
        <TopHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="cc-main-body">
          {lastNotification && (
            <div className={`cc-toast ${toastTone}`} role="status">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {toastTone === 'is-success' ? (
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                ) : (
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                )}
                <span>{lastNotification.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setLastNotification(null)}
                aria-label="Dismiss notification"
                className="cc-btn cc-btn-ghost cc-btn-icon"
                style={{ width: 28, height: 28 }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {activeTab === 'overview' && <OverviewView />}

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

          {activeTab === 'farms' && (
            <FarmManager
              onOpenAddFarm={() => setActiveModal('addFarm')}
              onOpenEditFarm={(farm) => {
                setSelectedFarm(farm);
                setActiveModal('editFarm');
              }}
            />
          )}

          {activeTab === 'console' && <ConsoleView />}
          {activeTab === 'activity' && <ActivityLogView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'security' && <SecurityView />}
        </main>
      </div>

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
