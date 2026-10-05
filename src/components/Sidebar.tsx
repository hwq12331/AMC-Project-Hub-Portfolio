import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  ShoppingCart, 
  Users, 
  ClipboardCheck, 
  Building2,
  KeyRound
} from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
  { name: 'HR & Safety', href: '/hr', icon: Users },
  { name: 'QA/QC', href: '/qa', icon: ClipboardCheck },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Gate Pass', href: '/gate-pass', icon: KeyRound },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-gray-900">
      <div className="flex h-16 items-center px-4">
        <h1 className={cn(
          "font-bold text-white transition-all duration-300",
          isCollapsed ? "text-sm" : "text-xl"
        )}>
          {isCollapsed ? "AMC" : "AMC Project Hub"}
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )
            }
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon
              className="h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
