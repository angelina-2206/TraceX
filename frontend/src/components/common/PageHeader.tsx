import React from 'react';

interface PageHeaderProps {
  breadcrumbs: string[];
  title: string;
  description?: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  description,
  metadata,
  actions,
}) => {
  return (
    <div className="tracex-card p-5 mb-5 border-l-4 border-l-[#164E78] dark:border-l-[#38BDF8]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-400 dark:text-slate-600">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-slate-200 font-semibold' : ''}>
                  {b}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}

          {/* Metadata badges */}
          {metadata && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              {metadata}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
