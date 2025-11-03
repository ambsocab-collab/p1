import React from 'react';
import { ActionStatusBadge, StatusSelector } from './ActionStatusBadge';
import { Button } from '../ui';
import {
  formatCurrency,
  getROIDisplay,
  getROIColor,
  getROIBadgeClasses,
  getROILabel,
  getCostVarianceDisplay,
  isOverdue
} from '../../utils/calculations';
import type { CorrectiveAction } from '../../types/database';

interface ActionCardProps {
  action: CorrectiveAction & { evidence?: any[] };
  onViewDetails?: (action: CorrectiveAction) => void;
  onEdit?: (action: CorrectiveAction) => void;
  onDelete?: (action: CorrectiveAction) => void;
  onStatusChange?: (actionId: string, newStatus: string, comment?: string) => Promise<void>;
  showEvidence?: boolean;
  compact?: boolean;
  userId?: string;
  useEnhancedStatusSelector?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
  showEvidence = true,
  compact = false,
  userId,
  useEnhancedStatusSelector = false
}) => {
  const overdue = isOverdue(action);
  const hasActualCost = action.cost_actual !== null && action.cost_actual !== undefined;
  const varianceDisplay = hasActualCost
    ? getCostVarianceDisplay(action.cost_estimated || 0, action.cost_actual || 0)
    : null;

  const statusColor = overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white';

  if (compact) {
    return (
      <div className={`border rounded-lg p-4 ${statusColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {useEnhancedStatusSelector && userId && onStatusChange ? (
                <StatusSelector
                  actionId={action.id}
                  currentStatus={action.status}
                  onStatusChange={(newStatus) => onStatusChange(action.id, newStatus)}
                  userId={userId}
                  disabled={!userId}
                />
              ) : (
                <ActionStatusBadge
                  action={action}
                  interactive={!!onStatusChange}
                  onClick={() => onStatusChange?.(action.id, '')}
                />
              )}
              {overdue && (
                <span className="text-xs text-red-600 font-medium">
                  Overdue since {action.due_date}
                </span>
              )}
            </div>
            <h4 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">
              {action.description}
            </h4>
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>Responsible: {action.responsible || 'Unassigned'}</span>
              <span>Due: {action.due_date || 'No due date'}</span>
              {hasActualCost && (
                <span className={getROIColor(action.roi)}>
                  ROI: {getROIDisplay(action.roi)}
                </span>
              )}
            </div>
          </div>
          <div className="ml-4 flex space-x-2">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(action)}
              >
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 ${statusColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {useEnhancedStatusSelector && userId && onStatusChange ? (
              <StatusSelector
                actionId={action.id}
                currentStatus={action.status}
                onStatusChange={(newStatus) => onStatusChange(action.id, newStatus)}
                userId={userId}
                disabled={!userId}
              />
            ) : (
              <ActionStatusBadge
                action={action}
                interactive={!!onStatusChange}
                onClick={() => onStatusChange?.(action.id, '')}
              />
            )}
            {overdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Overdue
              </span>
            )}
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {action.description}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(action)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(action)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Action Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Responsible Person */}
          <div>
            <dt className="text-sm font-medium text-gray-500">Responsible</dt>
            <dd className="text-sm text-gray-900">
              {action.responsible || 'Not assigned'}
            </dd>
          </div>

          {/* Contact */}
          {action.contact && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact</dt>
              <dd className="text-sm text-gray-900">{action.contact}</dd>
            </div>
          )}

          {/* Due Date */}
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="text-sm text-gray-900">
              {action.due_date ? new Date(action.due_date).toLocaleDateString() : 'No due date'}
            </dd>
          </div>

          {/* Completion Date */}
          {action.completion_date && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed</dt>
              <dd className="text-sm text-gray-900">
                {new Date(action.completion_date).toLocaleDateString()}
              </dd>
            </div>
          )}
        </div>

        {/* Right Column - Cost Information */}
        <div className="space-y-3">
          {/* Estimated Cost */}
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Cost</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrency(action.cost_estimated)}
            </dd>
          </div>

          {/* Actual Cost */}
          {hasActualCost && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Actual Cost</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCurrency(action.cost_actual)}
              </dd>
            </div>
          )}

          {/* Cost Variance */}
          {varianceDisplay && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Cost Variance</dt>
              <dd className={`text-sm font-medium ${
                action.cost_actual! > action.cost_estimated!
                  ? 'text-red-600'
                  : action.cost_actual! < action.cost_estimated!
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}>
                {varianceDisplay}
              </dd>
            </div>
          )}

          {/* ROI */}
          {action.roi !== null && (
            <div>
              <dt className="text-sm font-medium text-gray-500">ROI</dt>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getROIBadgeClasses(action.roi)}`}>
                  {getROILabel(action.roi)}
                </span>
                <span className={`text-sm font-medium ${getROIColor(action.roi)}`}>
                  {getROIDisplay(action.roi)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {action.notes && (
        <div className="mb-4">
          <dt className="text-sm font-medium text-gray-500 mb-1">Notes</dt>
          <dd className="text-sm text-gray-700 bg-gray-50 rounded p-3">
            {action.notes}
          </dd>
        </div>
      )}

      {/* Evidence */}
      {showEvidence && action.evidence && action.evidence.length > 0 && (
        <div className="border-t pt-4">
          <dt className="text-sm font-medium text-gray-500 mb-2">
            Evidence Files ({action.evidence.length})
          </dt>
          <dd className="space-y-2">
            {action.evidence.map((evidence: any) => (
              <div key={evidence.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{evidence.file_name}</span>
                  <span className="text-gray-500">
                    ({(evidence.file_size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(evidence.file_path, '_blank')}
                >
                  Download
                </Button>
              </div>
            ))}
          </dd>
        </div>
      )}

      {/* Footer */}
      {onViewDetails && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => onViewDetails(action)}
            className="w-full"
          >
            View Full Details
          </Button>
        </div>
      )}
    </div>
  );
};

// ActionList Component for displaying multiple actions
export interface ActionListProps {
  actions: (CorrectiveAction & { evidence?: any[] })[];
  onViewDetails?: (action: CorrectiveAction) => void;
  onEdit?: (action: CorrectiveAction) => void;
  onDelete?: (action: CorrectiveAction) => void;
  onStatusChange?: (actionId: string, newStatus: string, comment?: string) => Promise<void>;
  compact?: boolean;
  emptyMessage?: string;
  userId?: string;
  useEnhancedStatusSelector?: boolean;
}

export const ActionList: React.FC<ActionListProps> = ({
  actions,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
  emptyMessage = 'No corrective actions found.',
  userId,
  useEnhancedStatusSelector = false
}) => {
  if (actions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new corrective action.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-6'}>
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          compact={compact}
          userId={userId}
          useEnhancedStatusSelector={useEnhancedStatusSelector}
        />
      ))}
    </div>
  );
};