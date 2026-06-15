import { formatCurrency } from '../../lib/utils';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const FOOD_CATEGORY_STYLES = {
  VEG: { dot: 'bg-green-600', border: 'border-green-600', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Veg' },
  NON_VEG: { dot: 'bg-red-600', border: 'border-red-600', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Non-Veg' },
  VEGAN: { dot: 'bg-emerald-500', border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Vegan' },
};

function FoodCategoryBadge({ foodCategory }) {
  const style = FOOD_CATEGORY_STYLES[foodCategory] || FOOD_CATEGORY_STYLES.VEG;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${style.bg} ${style.border} border`} title={style.label}>
      <span className={`w-2 h-2 rounded-sm ${style.dot}`} />
      <span className="text-[9px] font-semibold uppercase">{style.label === 'Non-Veg' ? 'NV' : style.label === 'Vegan' ? 'VG' : 'V'}</span>
    </span>
  );
}

export default function FoodCard({
  item,
  onEdit, onDelete, onToggleAvailable, onOrder,
  view = 'grid', // 'grid' | 'list'
  isCustomer = false,
}) {
  if (view === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/50 hover:shadow-card-hover transition-all duration-200 group">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex-shrink-0 overflow-hidden relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">
              {item.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute top-1 left-1">
            <FoodCategoryBadge foodCategory={item.foodCategory} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold truncate">{item.name}</h4>
            {item.isPopular && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-medium flex-shrink-0">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{item.category}{item.preparationTime ? ` · ${item.preparationTime} min` : ''}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-primary-600">{formatCurrency(item.price)}</span>
            {isCustomer && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                item.available !== false
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {item.available !== false ? 'Available' : 'Sold Out'}
              </span>
            )}
          </div>
          {!isCustomer && onToggleAvailable && (
            <button
              onClick={() => onToggleAvailable(item)}
              className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors w-full ${
                item.available !== false
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-800'
              }`}
            >
              {item.available !== false ? 'Available' : 'Sold Out'}
            </button>
          )}
        </div>
        {!isCustomer && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {onEdit && <button onClick={() => onEdit(item)} className="btn-ghost-icon"><PencilIcon className="w-4 h-4" /></button>}
            {onDelete && <button onClick={() => onDelete(item)} className="btn-ghost-icon hover:!text-red-500"><TrashIcon className="w-4 h-4" /></button>}
          </div>
        )}
        {isCustomer && onOrder && (
          <button onClick={() => onOrder(item)} className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">
            Add
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800/90 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-300 dark:text-gray-500">{item.name?.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <FoodCategoryBadge foodCategory={item.foodCategory} />
        </div>
        {item.isPopular && (
          <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-semibold shadow-sm">
            Popular
          </span>
        )}
        {item.available === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-bold bg-red-500 px-3 py-1 rounded-lg">Sold Out</span>
          </div>
        )}
        {!isCustomer && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && <button onClick={() => onEdit(item)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"><PencilIcon className="w-3.5 h-3.5 text-gray-700" /></button>}
            {onDelete && <button onClick={() => onDelete(item)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"><TrashIcon className="w-3.5 h-3.5 text-red-500" /></button>}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h4 className="text-sm font-semibold truncate">{item.name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        {item.preparationTime && (
          <p className="text-[10px] text-gray-400 mt-0.5">~{item.preparationTime} min</p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-base font-bold text-primary-600 dark:text-primary-400">{formatCurrency(item.price)}</span>
          {isCustomer && onOrder && item.available !== false && (
            <button
              onClick={() => onOrder(item)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-400 dark:hover:bg-primary-900/60 transition-colors active:scale-95"
            >
              + Add
            </button>
          )}
        </div>
        {!isCustomer && onToggleAvailable && (
          <button
            onClick={() => onToggleAvailable(item)}
            className={`w-full mt-2 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors text-center ${
              item.available !== false
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 border border-red-200 dark:border-red-800'
            }`}
          >
            {item.available !== false ? 'Available' : 'Sold Out'}
          </button>
        )}
      </div>
    </div>
  );
}


