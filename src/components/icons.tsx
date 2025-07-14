import type { SVGProps } from "react";

export function SegamentLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="hsl(var(--primary))" opacity="0.6" />
      <path d="M2 17l10 5 10-5" stroke="hsl(var(--primary))" />
      <path d="M2 12l10 5 10-5" stroke="hsl(var(--primary))" />
    </svg>
  );
}

export function ChunithmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <title>Chunithm</title>
        <path d="M12 12c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5z" />
        <path d="M12 2v10" />
        <path d="M5.23 7.82L12 12l6.77-4.18" />
        <path d="M18.77 7.82L12 12l-6.77-4.18" />
        <path d="M2 12h20" />
    </svg>
  );
}

export function MaimaiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Maimai</title>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="22" y1="12" x2="20" y2="12" />
      <line x1="4" y1="12" x2="2" y2="12" />
      <line x1="18.36" y1="5.64" x2="17.07" y2="6.93" />
      <line x1="6.93" y1="17.07" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="18.36" x2="17.07" y2="17.07" />
      <line x1="6.93" y1="6.93" x2="5.64" y2="5.64" />
    </svg>
  );
}
