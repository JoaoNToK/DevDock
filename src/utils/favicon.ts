import { TimerStatus, TimerMode } from '@/hooks/usePomodoroTimer';

/**
 * Dynamically updates the browser favicon using SVG Data URLs to reflect timer state
 */
export function updateDynamicFavicon(status: TimerStatus, mode: TimerMode) {
  if (typeof window === 'undefined') return;

  let color = '#6366f1'; // Default Indigo

  if (status === 'paused') {
    color = '#f59e0b'; // Amber for Paused
  } else if (status === 'finished') {
    color = '#ef4444'; // Red for Finished
  } else if (status === 'running') {
    if (mode === 'shortBreak') color = '#10b981'; // Emerald
    else if (mode === 'longBreak') color = '#06b6d4'; // Cyan
    else if (mode === 'stopwatch') color = '#a855f7'; // Purple for Stopwatch
    else color = '#6366f1'; // Indigo for Focus
  } else if (mode === 'stopwatch') {
    color = '#a855f7'; // Purple for Stopwatch
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${color}" />
      <circle cx="16" cy="16" r="6" fill="#ffffff" />
    </svg>
  `;

  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = svgUrl;
}
