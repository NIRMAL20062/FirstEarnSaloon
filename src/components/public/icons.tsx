/**
 * Small hand-rolled stroke icons for the public salon page. Kept local
 * instead of pulling in an icon package — this page only needs a handful.
 */

type IconProps = { className?: string };

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8v4.25l2.75 1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M12 21s-6.75-6.13-6.75-11.25a6.75 6.75 0 0 1 13.5 0C18.75 14.87 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.75" r="2.25" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M8 4.5H5.5A1.5 1.5 0 0 0 4 6c0 7.732 6.268 14 14 14a1.5 1.5 0 0 0 1.5-1.5V16l-4-1.5-1.5 1.5a10.5 10.5 0 0 1-5.5-5.5L10 9 8.5 5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M4 12a8 8 0 1 1 3.5 6.6L4 20l1.3-3.6A7.96 7.96 0 0 1 4 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="m11.5 4 7 7a1.5 1.5 0 0 1 0 2.12l-5.38 5.38a1.5 1.5 0 0 1-2.12 0l-7-7V5.5A1.5 1.5 0 0 1 5.5 4h6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.25" cy="8.25" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ScissorsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="6" cy="6.5" r="2.25" />
      <circle cx="6" cy="17.5" r="2.25" />
      <path d="M7.7 8 19 19M19 5 7.7 16" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
