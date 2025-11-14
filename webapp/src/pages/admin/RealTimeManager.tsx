import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useModule } from '../../hooks/useModule';
import { DataTable, Column } from '../../components/UI/DataTable';
import { 
  RealTimeConnection, 
  RealTimeMessage, 
  RealTimeEvent, 
  RealTimeSubscription,
  realTimeService 
} from '../../services/realTimeService';
import { Send, Bell, Link, RefreshCw } from 'lucide-react';

export default function RealTimeManager() {
  const { t } = useI18n();
  const { hasModule } = useModule();
  const [connections, setConnections] = useState<RealTimeConnection[]>([]);
  const [messages, setMessages] = useState<RealTimeMessage[]>([]);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<RealTimeSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');

  useEffect(() => {
    if (hasModule('realtime')) {
      loadData();
    }
  }, [hasModule]);

  const loadData = async () => {
    try {
      setLoading(true);
      const connectionsData = await realTimeService.getConnections(1);
      const activeConnId = connectionsData[0]?.id ?? 1;
      const [messagesData, eventsData, subscriptionsData] = await Promise.all([
        realTimeService.getMessages(activeConnId),
        realTimeService.getEvents(activeConnId),
        realTimeService.getSubscriptions(activeConnId)
      ]);
      
      setConnections(connectionsData);
      setMessages(messagesData);
      setEvents(eventsData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectionColumns: Column<RealTimeConnection>[] = [
    {
      key: 'name',
      header: t('admin.realtime.connection_name'),
      render: (value, row) => <div className="font-medium">{row.name}</div>
    },
    {
      key: 'connection_type',
      header: t('admin.realtime.connection_type'),
      render: (value, row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.connection_type.toUpperCase()}
        </span>
      )
    },
    {
      key: 'connection_status',
      header: t('admin.realtime.status'),
      render: (value, row) => {
        const status = row.connection_status;
        const statusClass = status === 'connected' ? 'bg-green-100 text-green-800' : 
                           status === 'connecting' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {status}
          </span>
        );
      }
    }
  ];

  const messageColumns: Column<RealTimeMessage>[] = [
    { 
      key: 'message_type', 
      header: t('admin.realtime.channel'), 
      render: (value, row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.message_type}
        </span>
      )
    },
    { 
      key: 'payload', 
      header: t('admin.realtime.payload'), 
      render: (value, row) => <div className="text-sm max-w-xs truncate">{JSON.stringify(row.payload)}</div>
    },
    { 
      key: 'created_at', 
      header: t('admin.realtime.timestamp'), 
      render: (value, row) => <div className="text-sm text-gray-500">{new Date(row.created_at).toLocaleString()}</div>
    }
  ];

  const eventColumns: Column<RealTimeEvent>[] = [
    { 
      key: 'event_name', 
      header: t('admin.realtime.event_type'), 
      render: (value, row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.event_name}
        </span>
      )
    },
    { 
      key: 'source', 
      header: t('admin.realtime.source'), 
      render: (value, row) => <div className="text-sm">{row.source}</div>
    },
    { 
      key: 'created_at', 
      header: t('admin.realtime.timestamp'), 
      render: (value, row) => <div className="text-sm text-gray-500">{new Date(row.created_at).toLocaleString()}</div>
    }
  ];

  if (!hasModule('realtime')) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center text-gray-500">
            {t('admin.realtime.module_not_available')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.realtime.title')}</h1>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">{t('admin.realtime.total_connections')}</h3>
            <Link className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{connections.length}</div>
            <div className="text-xs text-gray-500">
              {connections.filter(c => c.connection_status === 'connected').length} {t('admin.realtime.connected')}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">{t('admin.realtime.total_messages')}</h3>
            <Send className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{messages.length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">{t('admin.realtime.total_events')}</h3>
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{events.length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-700">{t('admin.realtime.active_subscriptions')}</h3>
            <Bell className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <div className="text-xs text-gray-500">
              {subscriptions.filter(s => s.is_active).length} {t('admin.realtime.active')}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.realtime.connections')}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.realtime.messages')}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.realtime.events')}
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.realtime.subscriptions')}
            </button>
          </nav>
        </div>

        {activeTab === 'connections' && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">{t('admin.realtime.connections')}</h3>
            </div>
            <div className="p-6">
              <DataTable columns={connectionColumns} data={connections} />
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">{t('admin.realtime.messages')}</h3>
            </div>
            <div className="p-6">
              <DataTable columns={messageColumns} data={messages} />
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">{t('admin.realtime.events')}</h3>
            </div>
            <div className="p-6">
              <DataTable columns={eventColumns} data={events} />
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">{t('admin.realtime.subscriptions')}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">User #{subscription.user_id}</div>
                        <div className="text-sm text-gray-500">{subscription.event_types.join(', ') || 'All events'}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.is_active ? t('admin.realtime.active') : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}