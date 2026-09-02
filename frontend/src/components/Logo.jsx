export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 6.5h8c1.4 0 2.5 1.1 2.5 2.5v8.5H39c1.4 0 2.5 1.1 2.5 2.5v8c0 1.4-1.1 2.5-2.5 2.5h-8.5V39c0 1.4-1.1 2.5-2.5 2.5h-8c-1.4 0-2.5-1.1-2.5-2.5v-8.5H9c-1.4 0-2.5-1.1-2.5-2.5v-8c0-1.4 1.1-2.5 2.5-2.5h8.5V9c0-1.4 1.1-2.5 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d="M15 33.5 33.5 15" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ compact = false, light = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${light ? 'text-white' : 'text-black'}`}>
      <span className={`grid place-items-center rounded-xl ${compact ? 'h-9 w-9' : 'h-10 w-10'} ${light ? 'bg-white/10 text-white' : 'bg-black text-white'}`}>
        <LogoMark className={compact ? 'h-5 w-5' : 'h-5.5 w-5.5 h-6 w-6'} />
      </span>
      <span className="leading-tight">
        <span className={`block font-bold tracking-tight ${compact ? 'text-sm' : 'text-base'}`}>
          KAAB <span className="font-medium">Medicare</span>
        </span>
        {!compact && (
          <span className={`block text-[11px] ${light ? 'text-white/60' : 'text-gray-500'}`}>
            Clinic Management
          </span>
        )}
      </span>
    </div>
  )
}
