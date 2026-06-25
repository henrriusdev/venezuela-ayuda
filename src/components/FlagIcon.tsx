// Venezuelan flag (civil flag: tricolor + 8 white stars), as a rounded icon.
// Used in the header; the same artwork lives in /icon.svg and app/icon.svg for
// the favicon and PWA manifest.
const STARS: Array<[number, number]> = [
  [7, 21.2],
  [12, 22],
  [17, 22.7],
  [21.7, 23.1],
  [26.3, 23.1],
  [31, 22.7],
  [36, 22],
  [41, 21.2],
];

const STAR_PATH =
  "M0,-2.2 0.5,-0.69 2.09,-0.68 0.81,0.26 1.29,1.78 0,0.85 -1.29,1.78 -0.81,0.26 -2.09,-0.68 -0.5,-0.69Z";

export default function FlagIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Bandera de Venezuela"
      className={className}
    >
      <defs>
        <clipPath id="flagRound">
          <rect width="48" height="48" rx="11" />
        </clipPath>
        <path id="flagStar" d={STAR_PATH} />
      </defs>
      <g clipPath="url(#flagRound)">
        <rect width="48" height="16" fill="#ffcc00" />
        <rect y="16" width="48" height="16" fill="#00247d" />
        <rect y="32" width="48" height="16" fill="#cf142b" />
        <g fill="#fff">
          {STARS.map(([x, y], i) => (
            <use key={i} href="#flagStar" x={x} y={y} />
          ))}
        </g>
      </g>
    </svg>
  );
}
