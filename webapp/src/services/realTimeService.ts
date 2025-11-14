export interface RealTimeConnection {
  id: number;
  company_id: number;
  connection_type: 'websocket' | 'sse' | 'webhook';
  name: string;
  description?: string;
  endpoint_url: string;
  auth_config: {
    type: 'none' | 'bearer' | 'api_key' | 'custom';
    token?: string;
    api_key?: string;
    headers?: Record<string, string>;
  };
  connection_status: 'connected' | 'disconnected' | 'error' | 'connecting';
  last_connected_at?: string | null;
  last_error?: string | null;
  reconnect_config: {
    enabled: boolean;
    max_retries: number;
    retry_delay: number;
    backoff_strategy: 'linear' | 'exponential';
  };
  message_stats: {
    total_sent: number;
    total_received: number;
    total_errors: number;
    last_message_at?: string | null;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealTimeMessage {
  id: number;
  connection_id: number;
  message_type: 'notification' | 'update' | 'alert' | 'system' | 'data_sync';
  event_type: string;
  payload: Record<string, any>;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'retrying';
  retry_count: number;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RealTimeEvent {
  id: number;
  connection_id: number;
  event_name: string;
  event_data: Record<string, any>;
  source: 'user_action' | 'system_event' | 'external_webhook' | 'scheduled_job';
  target_users?: number[] | null;
  target_roles?: string[] | null;
  target_departments?: string[] | null;
  is_broadcast: boolean;
  processed_at?: string | null;
  created_at: string;
}

export interface RealTimeSubscription {
  id: number;
  connection_id: number;
  user_id: number;
  event_types: string[];
  delivery_config: {
    immediate: boolean;
    batch_size?: number;
    batch_delay?: number;
    digest_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };
  notification_config: {
    email: boolean;
    in_app: boolean;
    push: boolean;
    sms: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class RealTimeService {
  private readonly STORAGE_KEY = 'realtime_connections';
  private readonly MESSAGES_KEY = 'realtime_messages';
  private readonly EVENTS_KEY = 'realtime_events';
  private readonly SUBSCRIPTIONS_KEY = 'realtime_subscriptions';

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  async getConnections(companyId: number): Promise<RealTimeConnection[]> {
    await this.seedMockData();
    const connections = this.getStoredData<RealTimeConnection>(this.STORAGE_KEY);
    return connections.filter(c => c.company_id === companyId);
  }

  async getConnection(id: number): Promise<RealTimeConnection | null> {
    const connections = await this.getConnections(1);
    return connections.find(c => c.id === id) || null;
  }

  async createConnection(data: Omit<RealTimeConnection, 'id' | 'created_at' | 'updated_at' | 'connection_status' | 'last_connected_at' | 'last_error' | 'message_stats'>): Promise<RealTimeConnection> {
    const connection: RealTimeConnection = {
      ...data,
      id: this.generateId(),
      connection_status: 'disconnected',
      last_connected_at: null,
      last_error: null,
      message_stats: {
        total_sent: 0,
        total_received: 0,
        total_errors: 0,
        last_message_at: null
      },
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const connections = await this.getConnections(data.company_id);
    connections.push(connection);
    this.setStoredData(this.STORAGE_KEY, connections);

    return connection;
  }

  async updateConnection(id: number, data: Partial<RealTimeConnection>): Promise<RealTimeConnection | null> {
    const connections = await this.getConnections(1);
    const index = connections.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    connections[index] = {
      ...connections[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.STORAGE_KEY, connections);
    return connections[index];
  }

  async deleteConnection(id: number): Promise<boolean> {
    const connections = await this.getConnections(1);
    const filtered = connections.filter(c => c.id !== id);
    
    if (filtered.length === connections.length) return false;
    
    this.setStoredData(this.STORAGE_KEY, filtered);
    return true;
  }

  async testConnection(id: number): Promise<boolean> {
    const connection = await this.getConnection(id);
    if (!connection) return false;

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isSuccess = Math.random() > 0.2; // 80% success rate
    const status = isSuccess ? 'connected' : 'error';
    
    await this.updateConnection(id, { 
      connection_status: status,
      last_connected_at: isSuccess ? this.getCurrentTimestamp() : connection.last_connected_at,
      last_error: isSuccess ? null : 'Connection test failed'
    });

    return isSuccess;
  }

  async connect(id: number): Promise<boolean> {
    const connection = await this.getConnection(id);
    if (!connection) return false;

    await this.updateConnection(id, { 
      connection_status: 'connecting'
    });

    // Simulate connection establishment
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isSuccess = Math.random() > 0.15; // 85% success rate
    const status = isSuccess ? 'connected' : 'error';
    
    await this.updateConnection(id, { 
      connection_status: status,
      last_connected_at: isSuccess ? this.getCurrentTimestamp() : connection.last_connected_at,
      last_error: isSuccess ? null : 'Failed to establish connection'
    });

    return isSuccess;
  }

  async disconnect(id: number): Promise<boolean> {
    const connection = await this.getConnection(id);
    if (!connection) return false;

    await this.updateConnection(id, { 
      connection_status: 'disconnected'
    });

    return true;
  }

  // Message methods
  async getMessages(connectionId: number, limit = 100): Promise<RealTimeMessage[]> {
    await this.seedMockMessages();
    const messages = this.getStoredData<RealTimeMessage>(this.MESSAGES_KEY);
    return messages
      .filter(m => m.connection_id === connectionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  async sendMessage(data: Omit<RealTimeMessage, 'id' | 'created_at' | 'updated_at' | 'retry_count' | 'status'>): Promise<RealTimeMessage> {
    const message: RealTimeMessage = {
      ...data,
      id: this.generateId(),
      status: 'pending',
      retry_count: 0,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const messages = this.getStoredData<RealTimeMessage>(this.MESSAGES_KEY);
    messages.push(message);
    this.setStoredData(this.MESSAGES_KEY, messages);

    // Simulate message sending
    setTimeout(async () => {
      await this.updateMessage(message.id, {
        status: Math.random() > 0.1 ? 'sent' : 'failed',
        error_message: Math.random() > 0.1 ? null : 'Failed to deliver message'
      });

      // Update connection stats
      const connection = await this.getConnection(data.connection_id);
      if (connection) {
        await this.updateConnection(data.connection_id, {
          message_stats: {
            ...connection.message_stats,
            total_sent: connection.message_stats.total_sent + 1,
            total_errors: connection.message_stats.total_errors + (Math.random() > 0.1 ? 0 : 1),
            last_message_at: this.getCurrentTimestamp()
          }
        });
      }
    }, 500);

    return message;
  }

  async updateMessage(id: number, data: Partial<RealTimeMessage>): Promise<RealTimeMessage | null> {
    const messages = this.getStoredData<RealTimeMessage>(this.MESSAGES_KEY);
    const index = messages.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    messages[index] = {
      ...messages[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.MESSAGES_KEY, messages);
    return messages[index];
  }

  // Event methods
  async getEvents(connectionId: number, limit = 50): Promise<RealTimeEvent[]> {
    await this.seedMockEvents();
    const events = this.getStoredData<RealTimeEvent>(this.EVENTS_KEY);
    return events
      .filter(e => e.connection_id === connectionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  async createEvent(data: Omit<RealTimeEvent, 'id' | 'created_at' | 'processed_at'>): Promise<RealTimeEvent> {
    const event: RealTimeEvent = {
      ...data,
      id: this.generateId(),
      processed_at: null,
      created_at: this.getCurrentTimestamp()
    };

    const events = this.getStoredData<RealTimeEvent>(this.EVENTS_KEY);
    events.push(event);
    this.setStoredData(this.EVENTS_KEY, events);

    // Simulate event processing
    setTimeout(async () => {
      await this.processEvent(event.id);
    }, 100);

    return event;
  }

  async processEvent(eventId: number): Promise<boolean> {
    const events = this.getStoredData<RealTimeEvent>(this.EVENTS_KEY);
    const event = events.find(e => e.id === eventId);
    
    if (!event) return false;

    // Simulate event processing
    await new Promise(resolve => setTimeout(resolve, 500));

    events[events.indexOf(event)] = {
      ...event,
      processed_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.EVENTS_KEY, events);

    // Send notification to subscribers
    await this.notifySubscribers(event);

    return true;
  }

  async notifySubscribers(event: RealTimeEvent): Promise<void> {
    const subscriptions = await this.getSubscriptions(event.connection_id);
    const relevantSubscriptions = subscriptions.filter(sub => 
      sub.is_active && sub.event_types.includes(event.event_name)
    );

    for (const subscription of relevantSubscriptions) {
      await this.sendMessage({
        connection_id: event.connection_id,
        message_type: 'notification',
        event_type: event.event_name,
        payload: event.event_data,
        direction: 'outbound'
      });
    }
  }

  // Subscription methods
  async getSubscriptions(connectionId: number): Promise<RealTimeSubscription[]> {
    await this.seedMockSubscriptions();
    const subscriptions = this.getStoredData<RealTimeSubscription>(this.SUBSCRIPTIONS_KEY);
    return subscriptions.filter(s => s.connection_id === connectionId);
  }

  async createSubscription(data: Omit<RealTimeSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<RealTimeSubscription> {
    const subscription: RealTimeSubscription = {
      ...data,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const subscriptions = await this.getSubscriptions(data.connection_id);
    subscriptions.push(subscription);
    this.setStoredData(this.SUBSCRIPTIONS_KEY, subscriptions);

    return subscription;
  }

  async updateSubscription(id: number, data: Partial<RealTimeSubscription>): Promise<RealTimeSubscription | null> {
    const subscriptions = this.getStoredData<RealTimeSubscription>(this.SUBSCRIPTIONS_KEY);
    const index = subscriptions.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    subscriptions[index] = {
      ...subscriptions[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.SUBSCRIPTIONS_KEY, subscriptions);
    return subscriptions[index];
  }

  // Broadcasting methods
  async broadcastEvent(connectionId: number, eventName: string, eventData: Record<string, any>): Promise<RealTimeEvent> {
    return this.createEvent({
      connection_id: connectionId,
      event_name: eventName,
      event_data: eventData,
      source: 'system_event',
      is_broadcast: true,
      target_users: null,
      target_roles: null,
      target_departments: null
    });
  }

  async sendNotification(connectionId: number, notificationType: string, data: Record<string, any>, targets?: {
    users?: number[];
    roles?: string[];
    departments?: string[];
  }): Promise<RealTimeEvent> {
    return this.createEvent({
      connection_id: connectionId,
      event_name: notificationType,
      event_data: data,
      source: 'system_event',
      is_broadcast: !targets,
      target_users: targets?.users || null,
      target_roles: targets?.roles || null,
      target_departments: targets?.departments || null
    });
  }

  // Helper methods
  private getStoredData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
    }
  }

  private async seedMockData(): Promise<void> {
    const existing = this.getStoredData<RealTimeConnection>(this.STORAGE_KEY);
    if (existing.length > 0) return;

    const mockConnections: RealTimeConnection[] = [
      {
        id: 1,
        company_id: 1,
        connection_type: 'websocket',
        name: 'Main WebSocket Connection',
        description: 'Primary real-time connection for live updates',
        endpoint_url: 'wss://api.mpsone.com/ws',
        auth_config: {
          type: 'bearer',
          token: 'ws_bearer_token_123'
        },
        connection_status: 'connected',
        last_connected_at: new Date(Date.now() - 300000).toISOString(),
        last_error: null,
        reconnect_config: {
          enabled: true,
          max_retries: 5,
          retry_delay: 30,
          backoff_strategy: 'exponential'
        },
        message_stats: {
          total_sent: 1250,
          total_received: 1180,
          total_errors: 15,
          last_message_at: new Date(Date.now() - 60000).toISOString()
        },
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        updated_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 2,
        company_id: 1,
        connection_type: 'sse',
        name: 'Server-Sent Events',
        description: 'Event stream for notifications and updates',
        endpoint_url: 'https://api.mpsone.com/events',
        auth_config: {
          type: 'api_key',
          api_key: 'sse_api_key_456'
        },
        connection_status: 'connected',
        last_connected_at: new Date(Date.now() - 1800000).toISOString(),
        last_error: null,
        reconnect_config: {
          enabled: true,
          max_retries: 3,
          retry_delay: 60,
          backoff_strategy: 'linear'
        },
        message_stats: {
          total_sent: 0,
          total_received: 3420,
          total_errors: 8,
          last_message_at: new Date(Date.now() - 120000).toISOString()
        },
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 3,
        company_id: 1,
        connection_type: 'webhook',
        name: 'External Webhook Receiver',
        description: 'Receives webhooks from external systems',
        endpoint_url: 'https://api.mpsone.com/webhooks/receive',
        auth_config: {
          type: 'custom',
          headers: {
            'X-Webhook-Secret': 'webhook_secret_789'
          }
        },
        connection_status: 'disconnected',
        last_connected_at: new Date(Date.now() - 86400000).toISOString(),
        last_error: 'Authentication failed',
        reconnect_config: {
          enabled: false,
          max_retries: 0,
          retry_delay: 0,
          backoff_strategy: 'linear'
        },
        message_stats: {
          total_sent: 0,
          total_received: 150,
          total_errors: 25,
          last_message_at: new Date(Date.now() - 86400000).toISOString()
        },
        is_active: false,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.setStoredData(this.STORAGE_KEY, mockConnections);
  }

  private async seedMockMessages(): Promise<void> {
    const existing = this.getStoredData<RealTimeMessage>(this.MESSAGES_KEY);
    if (existing.length > 0) return;

    const mockMessages: RealTimeMessage[] = [
      {
        id: 1,
        connection_id: 1,
        message_type: 'notification',
        event_type: 'pr.approved',
        payload: {
          pr_id: 123,
          approver: 'John Doe',
          department: 'Procurement'
        },
        direction: 'outbound',
        status: 'sent',
        retry_count: 0,
        created_at: new Date(Date.now() - 300000).toISOString(),
        updated_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 2,
        connection_id: 1,
        message_type: 'update',
        event_type: 'quote.received',
        payload: {
          quote_id: 456,
          supplier: 'ABC Supplies',
          amount: 5000
        },
        direction: 'inbound',
        status: 'delivered',
        retry_count: 0,
        created_at: new Date(Date.now() - 600000).toISOString(),
        updated_at: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 3,
        connection_id: 2,
        message_type: 'alert',
        event_type: 'system.warning',
        payload: {
          message: 'High memory usage detected',
          severity: 'warning',
          threshold: 85
        },
        direction: 'outbound',
        status: 'sent',
        retry_count: 0,
        created_at: new Date(Date.now() - 900000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString()
      }
    ];

    this.setStoredData(this.MESSAGES_KEY, mockMessages);
  }

  private async seedMockEvents(): Promise<void> {
    const existing = this.getStoredData<RealTimeEvent>(this.EVENTS_KEY);
    if (existing.length > 0) return;

    const mockEvents: RealTimeEvent[] = [
      {
        id: 1,
        connection_id: 1,
        event_name: 'pr.created',
        event_data: {
          pr_id: 789,
          creator: 'Jane Smith',
          department: 'Operations',
          total_items: 5
        },
        source: 'user_action',
        target_users: null,
        target_roles: ['PIC Procurement'],
        target_departments: null,
        is_broadcast: false,
        processed_at: new Date(Date.now() - 120000).toISOString(),
        created_at: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: 2,
        connection_id: 1,
        event_name: 'quote.approved',
        event_data: {
          quote_id: 101,
          approver: 'Mike Johnson',
          supplier: 'XYZ Corporation',
          total_amount: 15000
        },
        source: 'user_action',
        target_users: null,
        target_roles: ['PIC Finance'],
        target_departments: ['Finance'],
        is_broadcast: false,
        processed_at: new Date(Date.now() - 300000).toISOString(),
        created_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 3,
        connection_id: 2,
        event_name: 'system.maintenance',
        event_data: {
          message: 'Scheduled maintenance window',
          start_time: '2024-01-20T02:00:00Z',
          end_time: '2024-01-20T04:00:00Z',
          affected_services: ['API', 'Database']
        },
        source: 'system_event',
        target_users: null,
        target_roles: ['Admin'],
        target_departments: null,
        is_broadcast: true,
        processed_at: new Date(Date.now() - 1800000).toISOString(),
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    this.setStoredData(this.EVENTS_KEY, mockEvents);
  }

  private async seedMockSubscriptions(): Promise<void> {
    const existing = this.getStoredData<RealTimeSubscription>(this.SUBSCRIPTIONS_KEY);
    if (existing.length > 0) return;

    const mockSubscriptions: RealTimeSubscription[] = [
      {
        id: 1,
        connection_id: 1,
        user_id: 1,
        event_types: ['pr.created', 'pr.approved', 'pr.rejected'],
        delivery_config: {
          immediate: true,
          batch_size: 10,
          batch_delay: 60,
          digest_frequency: 'immediate'
        },
        notification_config: {
          email: true,
          in_app: true,
          push: true,
          sms: false
        },
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        connection_id: 2,
        user_id: 2,
        event_types: ['system.alert', 'system.warning', 'system.maintenance'],
        delivery_config: {
          immediate: false,
          batch_size: 5,
          batch_delay: 300,
          digest_frequency: 'hourly'
        },
        notification_config: {
          email: true,
          in_app: true,
          push: false,
          sms: false
        },
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];

    this.setStoredData(this.SUBSCRIPTIONS_KEY, mockSubscriptions);
  }
}

export const realTimeService = new RealTimeService();