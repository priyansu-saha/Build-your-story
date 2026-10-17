const PATHS = {
  me: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" /></>,
  story: <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />,
  projects: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" /></>,
  skills: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  fun: <path d="M4 20l5-13 8 8-13 5zM14 4v2M19 9h2M18 4l-1.5 1.5M20 14l-2-1" />,
  contact: <><circle cx="9" cy="8" r="4" /><path d="M3 20c0-3.3 2.7-6 6-6M17 17.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19 17l2.5 2.5" /></>,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
  pen: <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 4.5a3.5 3.5 0 010 7M22 20c0-2.5-1.5-4.5-4-5.4" /></>,
  right: <path d="M5 12h14M13 6l6 6-6 6" />,
  left: <path d="M19 12H5M11 6l-6 6 6 6" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M6 9l6 6 6-6" />
};
export default function Icon({ name }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{PATHS[name]}</svg>;
}
