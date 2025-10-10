"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsSidebar() {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Notifications',
      href: '/settings/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      active: true,
    },
    {
      name: 'Account & Security',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      active: false,
      comingSoon: true,
    },
    {
      name: 'Privacy & Data',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      active: false,
      comingSoon: true,
    },
  ];

  const isActive = (href) => {
    if (href === '#') return false;
    return pathname === href;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="h-full bg-white border-r border-gray-200">
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const disabled = item.comingSoon;
              
              if (disabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      Soon
                    </span>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="overflow-x-auto">
          <nav className="flex space-x-2 px-4 py-3" aria-label="Settings navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const disabled = item.comingSoon;
              
              if (disabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 whitespace-nowrap cursor-not-allowed opacity-60 border border-gray-200 rounded-full"
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.name}</span>
                    <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-colors duration-200 ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
