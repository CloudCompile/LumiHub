type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatTimestamp(): string {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(hours12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`;
}

function log(level: LogLevel, message: string, ...args: unknown[]) {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'error':
      console.error(prefix, message, ...args);
      break;
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    case 'debug':
      console.debug(prefix, message, ...args);
      break;
    default:
      console.log(prefix, message, ...args);
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
};
