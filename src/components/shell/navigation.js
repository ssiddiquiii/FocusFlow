import { BookOpen, Settings, Target, WifiOff } from 'lucide-react';

export const navigationItems = [
  { name: 'Dashboard', path: '/', icon: BookOpen },
  { name: 'Practice', path: '/practice', icon: Target },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Offline', path: '/offline', icon: WifiOff }
];

export function isNavigationActive(pathname, path) {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}
