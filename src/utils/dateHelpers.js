// Date and age calculation utilities for project management with color-coded age indicators

// Age thresholds in days for color coding
export const AGE_THRESHOLDS = {
  FRESH: 7,      // Green - less than 1 week
  NORMAL: 30,    // Blue - less than 1 month
  AGING: 90,     // Yellow - less than 3 months
  OLD: 180,      // Orange - less than 6 months
  STALE: Infinity // Red - 6+ months
};

/**
 * Calculate project age in days from creation date
 * @param {Date|string} creationDate - Project creation date
 * @returns {number} Age in days
 */
export const getAgeInDays = (creationDate) => {
  if (!creationDate) return 0;
  
  const created = new Date(creationDate);
  const now = new Date();
  
  // Handle invalid dates
  if (isNaN(created.getTime())) return 0;
  
  const diffTime = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Calculate project age with metadata
 * @param {Date|string} creationDate - Project creation date
 * @returns {Object} Age object with days, category, and display info
 */
export const calculateProjectAge = (creationDate) => {
  const days = getAgeInDays(creationDate);
  
  let category = 'fresh';
  if (days >= AGE_THRESHOLDS.STALE) category = 'stale';
  else if (days >= AGE_THRESHOLDS.OLD) category = 'old';
  else if (days >= AGE_THRESHOLDS.AGING) category = 'aging';
  else if (days >= AGE_THRESHOLDS.NORMAL) category = 'normal';
  
  return {
    days,
    category,
    isNew: days < AGE_THRESHOLDS.FRESH,
    isStale: days >= AGE_THRESHOLDS.OLD
  };
};

/**
 * Format age for human-readable display
 * @param {number} days - Age in days
 * @returns {string} Formatted age string
 */
export const formatAge = (days) => {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
};

/**
 * Get Tailwind CSS color class based on project age
 * @param {string} category - Age category from calculateProjectAge
 * @returns {string} Tailwind CSS color classes
 */
export const getAgeColorClass = (category) => {
  const colorMap = {
    fresh: 'text-green-600 bg-green-50 border-green-200',
    normal: 'text-blue-600 bg-blue-50 border-blue-200',
    aging: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    old: 'text-orange-600 bg-orange-50 border-orange-200',
    stale: 'text-red-600 bg-red-50 border-red-200'
  };
  
  return colorMap[category] || colorMap.normal;
};