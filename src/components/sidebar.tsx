'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Phone, Users, Upload, Settings, BarChart, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Calls',
    href: '/calls',
    icon: Phone,
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: Users,
  },
  {
    title: 'Upload',
    href: '/upload',
    icon: Upload,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      {/* Brand */}
      <div className="h-14 flex items-center border-b px-6">
        <Link href="/" className="flex flex-col">
          <span className="font-bold text-xl leading-none">Pikl</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">QA Assist</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-8 w-16 px-2"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4 mr-1" />
                <span className="text-xs">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 mr-1" />
                <span className="text-xs">Light</span>
              </>
            )}
          </Button>
        </div>

        {/* Version Info */}
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Pikl QA Assistant</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
