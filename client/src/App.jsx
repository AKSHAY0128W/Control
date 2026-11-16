import React, { useState } from 'react';
import { ControlCenterProvider, useControlCenter } from './context/ControlCenterContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginView } from './components/LoginView';
import { ServerBanner } from './components/ServerBanner';
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
  SettingsModal, 
  ConsoleCommandModal,
  AddFarmModal,
  EditFarmModal
} from './components/Modals';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

function DashboardLayout() {
  const { isAuthenticated, activeTab, setActiveTab, lastNotification, setLastNotification } = useControlCenter();

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'console' | 'settings' | 'addBot' | 'editCoords' | 'customTp' | 'addFarm' | 'editFarm'
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);

  // If not authenticated, render modern login portal
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="app-shell">
      {/* Modern Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-layout">
        {/* Top App Header with Live Telemetry Indicators */}
        <TopHeader onOpenConsole={() => setActiveTab('console')} />

        <main className="page-body">
          {/* Notification Toast */}
          {lastNotification && (
            <div 
              className={`alert-toast ${lastNotification.type === 'success' ? 'success' : lastNotification.type === 'info' ? 'success' : 'warning'}`}
              style={{ marginBottom: '20px', animation: 'fadeIn 0.2s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {lastNotification.type === 'success' || lastNotification.type === 'info' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span style={{ fontWeight: 500 }}>{lastNotification.text}</span>
              </div>
              <button 
                onClick={() => setLastNotification(null)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ServerBanner />
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
              <FarmManager 
                onOpenAddFarm={() => setActiveModal('addFarm')}
                onOpenEditFarm={(farm) => {
                  setSelectedFarm(farm);
                  setActiveModal('editFarm');
                }}
              />
              <ActivityLogView />
            </div>
          )}

          {/* Tab 2: Bot Manager */}
          {activeTab === 'bots' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            </div>
          )}

          {/* Tab 3: Farm Loaders */}
          {activeTab === 'farms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <FarmManager 
                onOpenAddFarm={() => setActiveModal('addFarm')}
                onOpenEditFarm={(farm) => {
                  setSelectedFarm(farm);
                  setActiveModal('editFarm');
                }}
              />
            </div>
          )}

          {/* Tab 4: Server Console */}
          {activeTab === 'console' && (
            <ConsoleView />
          )}

          {/* Tab 5: Audit & Activity */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ActivityLogView />
            </div>
          )}

          {/* Tab 6: Settings */}
          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {/* Tab 7: Security & Auth */}
          {activeTab === 'security' && (
            <SecurityView />
          )}

          {/* Action Modals */}
          {activeModal === 'console' && (
            <ConsoleCommandModal onClose={() => setActiveModal(null)} />
          )}

          {activeModal === 'settings' && (
            <SettingsModal onClose={() => setActiveModal(null)} />
          )}

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
        </main>
      </div>
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
