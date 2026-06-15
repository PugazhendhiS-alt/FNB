import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  UserPlusIcon, BuildingStorefrontIcon, BuildingOffice2Icon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

const ACTIONS = [
  { path: '/users', label: 'Add User', icon: UserPlusIcon, roles: ['SUPERADMIN'] },
  { path: '/restaurants', label: 'Add Restaurant', icon: BuildingStorefrontIcon, roles: ['SUPERADMIN', 'BUILDING_MANAGER'] },
  { path: '/buildings', label: 'Add Building', icon: BuildingOffice2Icon, roles: ['SUPERADMIN'] },
  { path: '/menu', label: 'Add Menu Item', icon: PlusCircleIcon, roles: ['SUPERADMIN', 'RESTAURANT_MANAGER'] },
];

function QuickActionsBar() {
  const navigate = useNavigate();
  const { currentRole } = useRole();

  const visible = ACTIONS.filter(a => a.roles.includes(currentRole));
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {visible.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            title={action.label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(QuickActionsBar);
