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
    <div className="tracex-card p-5 mb-5 border-l-4 border-l-[var(--blue-primary)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[var(--border-hi)]">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-[var(--text-primary)] font-semibold' : ''}>
                  {b}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed">
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
