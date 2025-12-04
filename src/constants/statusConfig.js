import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Status configuration for lane statuses
 */
export const STATUS_CONFIG = {
  Valid: {
    label: 'Valid',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: CheckCircle
  },
  Warning: {
    label: 'Warning',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: AlertTriangle
  },
  Error: {
    label: 'Error',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle
  }
};

/**
 * Get status configuration by status name
 * @param {string} status - Status name ('Valid', 'Warning', 'Error')
 * @returns {object} - Status configuration object
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.Valid;
}




