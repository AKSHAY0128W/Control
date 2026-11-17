import React from 'react';

// Status ping dot with optional pulse animation
export function StatusDot({ tone = 'success' }) {
  const isPinging = tone === 'success';
  const colorMap = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    muted: 'bg-muted-foreground'
  };

  return (
    <span className={`relative flex size-2 shrink-0 ${isPinging ? 'after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-success/60' : ''}`}>
      <span className={`relative size-2 rounded-full ${colorMap[tone] || 'bg-success'}`} />
    </span>
  );
}

// Crisp Pill Badge matching Lovable design system
export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    neutral: 'bg-muted text-muted-foreground border-border',
    primary: 'bg-primary/10 text-primary border-primary/20'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold leading-none ${tones[tone] || tones.neutral} ${className}`}>
      {children}
    </span>
  );
}

// Page Header with eyebrow, H1, description and action buttons
export function PageHeader({ eyebrow, title, detail, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {detail && <p className="mt-1.5 text-sm text-muted-foreground">{detail}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// Monospace Coordinate Badge
export function CoordinateBadge({ x, y, z }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs text-foreground">
      <span><i className="mr-1 not-italic text-muted-foreground">X</i>{x}</span>
      <span><i className="mr-1 not-italic text-muted-foreground">Y</i>{y}</span>
      <span><i className="mr-1 not-italic text-muted-foreground">Z</i>{z}</span>
    </div>
  );
}

// 5-Column Metric Card inside BDS Server Banner
export function MetricCard({ label, value, meta, icon: Icon, trend, accent = false }) {
  return (
    <div className="min-w-0 border-b border-border px-4 py-4 first:pl-0 last:pr-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="truncate text-xs font-medium">{label}</span>
        {Icon && <Icon className="size-4 shrink-0" />}
      </div>
      <div className={`mt-3 truncate text-lg font-semibold ${accent ? 'text-success' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span>{meta}</span>
        {trend && (
          <span className="inline-flex items-center text-success">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

// Secondary Stat Card (BDS uptime, Bot workers, Farm chunks, WebSocket)
export function SecondaryCard({ label, value, hint, icon: Icon, tone = 'primary' }) {
  const toneClasses = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
    primary: 'text-primary bg-primary/10'
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className={`flex size-8 items-center justify-center rounded-md ${toneClasses[tone] || toneClasses.primary}`}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-4 text-xl font-semibold font-mono tracking-normal text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

// Section Container Card (for Settings, Security, etc.)
export function SectionCard({ icon: Icon, title, description, children, className = '' }) {
  return (
    <section className={`space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="flex items-start gap-3 border-b border-border pb-4">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// Form Input Field
export function InputField({ label, value, onChange, type = 'text', mono = false, suffix, placeholder = '', readOnly = false, className = '' }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      {label && <span className="text-[11px] font-medium text-muted-foreground">{label}</span>}
      <span className="flex items-center gap-2">
        <input
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${mono ? 'font-mono' : ''}`}
        />
        {suffix && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </span>
    </label>
  );
}

// Clean Accessible Switch Toggle
export function Switch({ checked, onCheckedChange, disabled = false, 'aria-label': ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

// Lovable Shadcn Button
export function Button({
  children,
  variant = 'default', // 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size = 'default',    // 'default' | 'sm' | 'icon'
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  title,
  'aria-label': ariaLabel
}) {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  
  const variants = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground text-foreground"
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    icon: "size-9"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
    >
      {children}
    </button>
  );
}
