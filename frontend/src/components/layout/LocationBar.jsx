import { useAuth } from '../../context/AuthContext';
import { BuildingOffice2Icon, HomeModernIcon } from '@heroicons/react/24/outline';

export default function LocationBar() {
  const { user } = useAuth();
  if (!user || user.role === 'CUSTOMER' || user.isSuperadmin) return null;

  return (
    <div className="px-3 sm:px-4 lg:px-6 pt-0 pb-1">
      <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {user.building && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
            <BuildingOffice2Icon className="w-3 h-3" />
            {user.building.name}
          </span>
        )}
        {user.restaurant && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
            <HomeModernIcon className="w-3 h-3" />
            {user.restaurant.name}
          </span>
        )}
      </div>
    </div>
  );
}
