import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const ControlCenterContext = createContext(null);

export function ControlCenterProvider({ children }) {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('smp_auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI Navigation State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bots' | 'farms' | 'console' | 'activity' | 'settings' | 'security'
  const [theme, setTheme] = useState(() => localStorage.getItem('smp_theme') || 'light');

  // Metrics & Data State
  const [serverMetrics, setServerMetrics] = useState({
    online: true,
    motd: 'OUR SMP',
    version: '1.26.61',
    worldName: 'CherryVale SMP',
    playerCount: 0,
    maxPlayers: 10,
    players: [],
    latencyMs: 88,
    restartCount: 0,
    lastCheck: null
  });

  const [bots, setBots] = useState([]);
  const [farms, setFarms] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState({
    pterodactyl: { isConfigured: false, panelUrl: '', serverId: '' },
    autoTeleport: { enabled: true, delaySeconds: 8, distanceThreshold: 10 }
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  // Sync theme attribute to HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth logout event listener
  useEffect(() => {
    const handleLogoutEvent = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('smp_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('smp_auth_logout', handleLogoutEvent);
  }, []);

  // Validate session on mount
  useEffect(() => {
    if (token) {
      api.getMe().then(res => {
        if (res?.success) {
          setUser(res.user);
          localStorage.setItem('smp_user', JSON.stringify(res.user));
        } else {
          setToken(null);
          setUser(null);
          localStorage.removeItem('smp_auth_token');
          localStorage.removeItem('smp_user');
        }
      });
    }
  }, [token]);

  // Initial load of server data
  const loadInitialData = useCallback(async () => {
    try {
      const [statusRes, botsRes, farmsRes, settingsRes, activityRes] = await Promise.all([
        api.getServerStatus(),
        api.getBots(),
        api.getFarms(),
        api.getSettings(),
        api.getActivity(50)
      ]);

      if (statusRes?.success) setServerMetrics(statusRes.data);
      if (botsRes?.success) setBots(botsRes.data);
      if (farmsRes?.success) setFarms(farmsRes.data);
      if (settingsRes?.success) setSettings(settingsRes.data);
      if (activityRes?.success) setActivityLogs(activityRes.data);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  // Live WebSocket Connection
  useEffect(() => {
    if (!token) return;

    loadInitialData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/live`;

    let ws = null;
    let reconnectTimeout = null;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const { type, payload } = JSON.parse(event.data);

            if (type === 'INITIAL_STATE') {
              if (payload.serverMetrics) setServerMetrics(payload.serverMetrics);
              if (payload.bots) setBots(payload.bots);
              if (payload.farms) setFarms(payload.farms);
              if (payload.activityLogs) setActivityLogs(payload.activityLogs);
              if (payload.settings) setSettings(payload.settings);
            } else if (type === 'SERVER_METRICS_UPDATE') {
              setServerMetrics(payload);
            } else if (type === 'BOTS_UPDATE') {
              setBots(payload);
            } else if (type === 'FARMS_UPDATE') {
              setFarms(payload);
            } else if (type === 'SETTINGS_UPDATE') {
              setSettings(payload);
            } else if (type === 'NEW_ACTIVITY_LOG') {
              setActivityLogs(prev => [payload, ...prev].slice(0, 100));
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws.close();
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token, loadInitialData]);

  // Auth Actions
  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res?.success) {
      localStorage.setItem('smp_auth_token', res.token);
      localStorage.setItem('smp_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setLastNotification({ type: 'success', text: `Welcome back, ${res.user.name || res.user.username}!` });
      loadInitialData();
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('smp_auth_token');
    localStorage.removeItem('smp_user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.changePassword(currentPassword, newPassword);
    if (res?.success) {
      setLastNotification({ type: 'success', text: 'Password successfully changed!' });
    }
    return res;
  };

  // Bot & Farm Actions
  const teleportBot = async (botId, customCoords = null) => {
    const res = await api.teleportBot(botId, customCoords);
    if (res?.success) {
      setLastNotification({ type: 'success', text: `Teleport command dispatched for ${botId}!` });
    } else {
      setLastNotification({ type: 'warning', text: res?.error || 'Teleport dispatch failed' });
    }
    const updated = await api.getBots();
    if (updated?.success) setBots(updated.data);
    return res;
  };

  const teleportAllBotsToFarms = async () => {
    for (const bot of bots) {
      await api.teleportBot(bot.id);
    }
    const updated = await api.getBots();
    if (updated?.success) setBots(updated.data);
    setLastNotification({ type: 'success', text: 'Dispatched teleport for all farm bots!' });
  };

  const updateBot = async (botId, data) => {
    const res = await api.updateBot(botId, data);
    if (res?.success) {
      const updated = await api.getBots();
      if (updated?.success) setBots(updated.data);
      setLastNotification({ type: 'success', text: `Bot ${res.data?.name || botId} configuration updated & synced!` });
    }
    return res;
  };

  const toggleBot = async (botId) => {
    const res = await api.toggleBot(botId);
    if (res?.success) {
      const updated = await api.getBots();
      if (updated?.success) setBots(updated.data);
      setLastNotification({
        type: 'info',
        text: `Bot ${res.data?.name || botId} ${res.data?.enabled !== false ? 'started / enabled' : 'paused / stopped'}`
      });
    }
    return res;
  };

  const syncRender = async () => {
    const res = await api.syncRender();
    if (res?.success) {
      setLastNotification({ type: 'success', text: 'Bots synchronized to Render bot service!' });
    } else {
      setLastNotification({ type: 'warning', text: 'Render sync initiated (waiting for container response)' });
    }
    return res;
  };

  const pingRender = async () => {
    return await api.pingRender();
  };

  const deployRender = async () => {
    const res = await api.deployRender();
    if (res?.success) {
      setLastNotification({ type: 'success', text: 'Render redeploy triggered!' });
    } else {
      setLastNotification({ type: 'warning', text: res?.error || 'Deploy trigger failed' });
    }
    return res;
  };

  const registerBot = async (data) => {
    const res = await api.registerBot(data);
    if (res?.success) {
      const updated = await api.getBots();
      if (updated?.success) setBots(updated.data);
      setLastNotification({ type: 'success', text: `Bot ${data.name} registered!` });
    }
    return res;
  };

  const deleteBot = async (botId) => {
    const res = await api.deleteBot(botId);
    if (res?.success) {
      const updated = await api.getBots();
      if (updated?.success) setBots(updated.data);
      setLastNotification({ type: 'info', text: 'Bot removed from manager' });
    }
    return res;
  };

  const updateFarm = async (farmId, data) => {
    const res = await api.updateFarm(farmId, data);
    if (res?.success) {
      const updated = await api.getFarms();
      if (updated?.success) setFarms(updated.data);
    }
    return res;
  };

  const createFarm = async (data) => {
    const res = await api.createFarm(data);
    if (res?.success) {
      const updated = await api.getFarms();
      if (updated?.success) setFarms(updated.data);
      setLastNotification({ type: 'success', text: `Farm ${data.name} added!` });
    }
    return res;
  };

  const deleteFarm = async (farmId) => {
    const res = await api.deleteFarm(farmId);
    if (res?.success) {
      const updated = await api.getFarms();
      if (updated?.success) setFarms(updated.data);
      setLastNotification({ type: 'info', text: 'Farm removed successfully' });
    }
    return res;
  };

  const refreshServer = async () => {
    const res = await api.pollServer();
    if (res?.success) {
      setServerMetrics(res.data);
      setLastNotification({ type: 'info', text: 'Polled live NetherNet server state' });
    }
  };

  const sendConsoleCommand = async (command) => {
    return await api.sendConsoleCommand(command);
  };

  const updateSettings = async (newSettings) => {
    const res = await api.updateSettings(newSettings);
    if (res?.success) {
      const updated = await api.getSettings();
      if (updated?.success) setSettings(updated.data);
      setLastNotification({ type: 'success', text: 'Settings updated successfully' });
    }
    return res;
  };

  return (
    <ControlCenterContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        changePassword,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        serverMetrics,
        bots,
        farms,
        activityLogs,
        settings,
        wsConnected,
        lastNotification,
        setLastNotification,
        teleportBot,
        teleportAllBotsToFarms,
        updateBot,
        toggleBot,
        registerBot,
        addBot: registerBot,
        deleteBot,
        syncRender,
        pingRender,
        deployRender,
        updateFarm,
        createFarm,
        addFarm: createFarm,
        deleteFarm,
        refreshServer,
        sendConsoleCommand,
        updateSettings,
        loadInitialData
      }}
    >
      {children}
    </ControlCenterContext.Provider>
  );
}

export function useControlCenter() {
  const context = useContext(ControlCenterContext);
  if (!context) {
    throw new Error('useControlCenter must be used within ControlCenterProvider');
  }
  return context;
}
