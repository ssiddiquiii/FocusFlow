import { BookOpen, Settings } from 'lucide-react';

export const navigationItems = [
  { name: 'Dashboard', path: '/', icon: BookOpen },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export function isNavigationActive(pathname, path) {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}
