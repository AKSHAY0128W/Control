import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

// Status dot indicator
export function StatusDot({ tone = 'success' }) {
  const toneClass =
    tone === 'success' ? 'is-success'
      : tone === 'warning' ? 'is-warning'
        : tone === 'danger' ? 'is-danger'
          : 'is-muted';

  return <span className={`cc-dot ${toneClass}`} aria-hidden="true" />;
}

// Reusable StatusBadge (also exported as Badge for backward compatibility)
export function StatusBadge({ children, tone = 'neutral', className = '' }) {
  const toneClass =
    tone === 'success' ? 'is-success'
      : tone === 'warning' ? 'is-warning'
        : tone === 'danger' ? 'is-danger'
          : tone === 'primary' ? 'is-primary'
            : 'is-neutral';

  return (
    <span className={`cc-badge ${toneClass} ${className}`}>
      {children}
    </span>
  );
}
export const Badge = StatusBadge;

// Page Header with eyebrow, title, description and actions
export function PageHeader({ eyebrow, title, detail, actions }) {
  return (
    <div className="cc-page-header">
      <div>
        {eyebrow && <p className="cc-eyebrow">{eyebrow}</p>}
        <h1 className="cc-page-title">{title}</h1>
        {detail && <p className="cc-page-detail">{detail}</p>}
      </div>
      {actions && <div className="cc-page-actions">{actions}</div>}
    </div>
  );
}

// Monospace Coordinate Badge
export function CoordinateBadge({ x, y, z }) {
  return (
    <div className="cc-coords">
      <span><i>X</i>{x}</span>
      <span><i>Y</i>{y}</span>
      <span><i>Z</i>{z}</span>
    </div>
  );
}

// Metric Cell inside BDS Server Banner
export function MetricCard({ label, value, meta, icon: Icon, trend, accent = false }) {
  return (
    <div className="cc-metric-cell">
      <div className="cc-metric-top">
        <span className="cc-truncate">{label}</span>
        {Icon && <Icon size={15} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />}
      </div>
      <div className={`cc-metric-val cc-truncate ${accent ? 'is-accent' : ''}`}>
        {value}
      </div>
      <div className="cc-metric-meta">
        <span className="cc-truncate">{meta}</span>
        {trend && <span style={{ color: 'var(--success)', fontWeight: 600 }}>{trend}</span>}
      </div>
    </div>
  );
}

// Reusable StatCard (also exported as SecondaryCard for compatibility)
export function StatCard({ label, value, hint, icon: Icon, tone = 'primary' }) {
  const toneClass =
    tone === 'success' ? 'is-success'
      : tone === 'warning' ? 'is-warning'
        : tone === 'danger' ? 'is-danger'
          : '';

  return (
    <div className="cc-stat-card">
      {Icon && (
        <div className={`cc-icon-box ${toneClass}`}>
          <Icon size={18} />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="cc-stat-label cc-truncate">{label}</p>
        <p className="cc-stat-value cc-truncate">{value}</p>
        {hint && <p className="cc-stat-hint cc-truncate">{hint}</p>}
      </div>
    </div>
  );
}
export const SecondaryCard = StatCard;

// Section Card Container
export function SectionCard({ icon: Icon, title, description, actions, children }) {
  return (
    <section className="cc-card">
      <div className="cc-section-header">
        <div className="cc-section-title-row">
          {Icon && (
            <div className="cc-icon-box">
              <Icon size={17} />
            </div>
          )}
          <div>
            <h2 className="cc-section-title">{title}</h2>
            {description && <p className="cc-section-desc">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className="cc-section-body">{children}</div>
    </section>
  );
}

// Form Input Field
export function InputField({ label, value, onChange, placeholder, type = 'text', suffix, mono = false, disabled = false }) {
  return (
    <label className="cc-field">
      <span className="cc-field-label">{label}</span>
      <div className="cc-input-wrap">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`cc-input ${mono ? 'cc-mono' : ''}`}
          style={suffix ? { paddingRight: '64px' } : undefined}
        />
        {suffix && <span className="cc-input-suffix">{suffix}</span>}
      </div>
    </label>
  );
}

// Accessible Switch Toggle
export function Switch({ checked, onCheckedChange, 'aria-label': ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={`cc-switch ${checked ? 'is-checked' : ''}`}
    >
      <span className="cc-switch-thumb" />
    </button>
  );
}

// Reusable Button
export function Button({ children, variant = 'default', size = 'default', className = '', onClick, type = 'button', disabled = false, title, 'aria-label': ariaLabel }) {
  const variantClass =
    variant === 'outline' ? 'cc-btn-outline'
      : variant === 'ghost' ? 'cc-btn-ghost'
        : variant === 'destructive' ? 'cc-btn-danger'
          : 'cc-btn-primary';

  const sizeClass =
    size === 'sm' ? 'cc-btn-sm'
      : size === 'icon' ? 'cc-btn-icon'
        : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`cc-btn ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
}

// Empty State Component
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="cc-state-box">
      {Icon && <Icon size={34} style={{ margin: '0 auto', color: 'var(--text-muted)', opacity: 0.65 }} />}
      <h3 className="cc-state-title">{title}</h3>
      {description && <p className="cc-state-desc">{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// Loading State Component
export function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="cc-state-box">
      <Loader2 size={28} style={{ margin: '0 auto', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
      <p className="cc-state-desc" style={{ marginTop: 10 }}>{message}</p>
    </div>
  );
}

// Responsive Table Container
export function ResponsiveTable({ columns, children, footer }) {
  return (
    <div className="cc-table-wrap">
      <table className="cc-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {footer && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '10px 16px', fontSize: 11, color: 'var(--text-muted)' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// Reusable Confirm Dialog
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'destructive', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="cc-modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="cc-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className={`cc-icon-box ${tone === 'destructive' ? 'is-danger' : 'is-warning'}`}>
            <AlertTriangle size={18} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant={tone} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
