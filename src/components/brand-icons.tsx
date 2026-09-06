// Set de íconos en línea (SVG) para la landing pública. Se usan en vez de
// emoji a propósito: un emoji se ve distinto en cada teléfono/SO y en este
// proyecto ya tuvimos un problema de un emoji roto en WhatsApp — para una
// página que se quiere mostrar como pieza de portfolio, mejor un ícono
// vectorial consistente en cualquier pantalla.

type IconProps = { className?: string };

const base = "h-5 w-5";

export function CarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3 13.5 4.6 8.8A2 2 0 0 1 6.5 7.5h11a2 2 0 0 1 1.9 1.3l1.6 4.7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2.5" y="13.5" width="19" height="5.5" rx="1.5" />
      <circle cx="7" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </svg>
  );
}

export function WheatIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 21V9" strokeLinecap="round" />
      <path d="M12 9c-2-.5-3-2-3-4 2 0 3.5 1 4 3M12 9c2-.5 3-2 3-4-2 0-3.5 1-4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13c-2-.5-3-2-3-4 2 0 3.5 1 4 3M12 13c2-.5 3-2 3-4-2 0-3.5 1-4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21h6" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StoreIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 9.5 5 4h14l1 5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9.5a2.3 2.3 0 0 0 4.4 1 2.3 2.3 0 0 0 4.4 0 2.3 2.3 0 0 0 4.4 0 2.3 2.3 0 0 0 4.4-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 11v8.5a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FactoryIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3 20.5V13l5 3.2V13l5 3.2V10l6 3.8v6.7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 13.5V8.5l2.5 2V8.5L22 10.5v3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20.5h19" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldHeartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 3.5 19 6v5.5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15s-3-1.9-3-4.1c0-1.2.9-2 1.9-2 .5 0 1 .2 1.1.6.1-.4.6-.6 1.1-.6 1 0 1.9.8 1.9 2 0 2.2-3 4.1-3 4.1Z" />
    </svg>
  );
}

export function HardHatIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 17a8 8 0 0 1 16 0" strokeLinecap="round" />
      <path d="M12 8V5" strokeLinecap="round" />
      <path d="M3 17h18v1.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlaneIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3 12.5 21 5l-6.5 8.5L21 19l-9-4-3.5 3.5-.7-3.8L3 12.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z" />
      <path d="M12 2C6.5 2 2 6.4 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.4A9.9 9.9 0 0 0 12 22c5.5 0 10-4.4 10-10S17.5 2 12 2Zm0 18.2c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 20.2 12c0 4.6-3.7 8.2-8.2 8.2Z" />
    </svg>
  );
}

export function InstagramIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21.9v-8.4h2.8l.4-3.3h-3.2V8c0-.9.3-1.6 1.7-1.6h1.7V3.4C16.6 3.3 15.5 3.2 14.3 3.2c-2.7 0-4.6 1.6-4.6 4.6v2.4H7v3.3h2.7v8.4Z" />
    </svg>
  );
}

export function MailIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M9 15 15 9" strokeLinecap="round" />
      <path d="M11 6.5 12.4 5a4 4 0 1 1 5.6 5.6L16.5 12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 17.5 11.6 19a4 4 0 1 1-5.6-5.6L7.5 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
