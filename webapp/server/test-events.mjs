import { EventSource } from 'eventsource';

const eventSource = new EventSource('http://localhost:3001/bridge/analytics/events');

eventSource.onmessage = (event) => {
  console.log('Event received:', event.data);
};

eventSource.onerror = (error) => {
  console.error('EventSource error:', error);
};

console.log('Connected to analytics events stream...');

// Keep the script running
setTimeout(() => {
  console.log('Closing connection...');
  eventSource.close();
  process.exit(0);
}, 10000);