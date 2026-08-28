/**
 * Bộ icon inline — không request mạng, tô theo currentColor.
 * Nét 1.8 để đọc được ở 16px lẫn 28px mà không cần hai bộ.
 */

const P = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  users: '<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.2"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.87"/><path d="M16.5 3.7a4 4 0 0 1 0 6.6"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>',
  palette: '<path d="M12 21a9 9 0 1 1 9-9c0 1.8-1.5 2.6-3 2.6h-1.6a2 2 0 0 0-1.4 3.4 1.8 1.8 0 0 1-1.3 3z"/><circle cx="7.8" cy="12" r="1"/><circle cx="9.8" cy="8" r="1"/><circle cx="14.2" cy="7.6" r="1"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M9 20.5h6M12 16.5v4"/>',
  smartphone: '<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/>',
  tablet: '<rect x="4.5" y="2.5" width="15" height="19" rx="2.4"/><path d="M11 18.5h2"/>',
  laptop: '<rect x="4" y="4.5" width="16" height="11" rx="1.8"/><path d="M2 18.5h20"/>',
  chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
  chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9.5 7 7 7-7"/>',
  chevronUp: '<path d="m5 14.5 7-7 7 7"/>',
  arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  arrowDownRight: '<path d="M6 6v8a2 2 0 0 0 2 2h10M14 12l4 4-4 4"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.6 2.7L16 9.5"/>',
  circleDashed: '<path d="M12 3a9 9 0 0 1 4.5 1.2M20.4 8a9 9 0 0 1 0 8M16.5 19.8A9 9 0 0 1 7.5 19.8M3.6 16a9 9 0 0 1 0-8M7.5 4.2A9 9 0 0 1 12 3"/>',
  alertTriangle: '<path d="M10.3 4.3 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17.2h.01"/>',
  alertCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.3h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7h.01"/>',
  home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.6V20h13V9.6"/><path d="M9.8 20v-5.6h4.4V20"/>',
  book: '<path d="M4 4.5A2 2 0 0 1 6 2.5h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 18.5v1a2 2 0 0 0 2 2h13v-3.5"/>',
  bookOpen: '<path d="M12 6.5C10.5 5 8.5 4.3 4 4.3v13c4.5 0 6.5.7 8 2.2 1.5-1.5 3.5-2.2 8-2.2v-13c-4.5 0-6.5.7-8 2.2z"/><path d="M12 6.5v13"/>',
  bookmark: '<path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  star: '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.5a7.2 7.2 0 0 1 14.4 0"/>',
  userPlus: '<circle cx="9.5" cy="8" r="3.6"/><path d="M2.8 20.5a6.8 6.8 0 0 1 13.4 0"/><path d="M19 8.5v5M21.5 11h-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1A1.6 1.6 0 0 0 10 3.9v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.3 1.1z"/>',
  bell: '<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>',
  play: '<path d="M7.5 4.8 19 12 7.5 19.2z"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  volume: '<path d="M11 5 6.5 8.7H3v6.6h3.5L11 19z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.2 6.3a8 8 0 0 1 0 11.4"/>',
  refresh: '<path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9L21 9"/><path d="M21 4v5h-5"/><path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3 15"/><path d="M3 20v-5h5"/>',
  edit: '<path d="M12 20h8"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3.6 17.5 4.6-4.4a2 2 0 0 1 2.7 0l6.6 6.2"/>',
  mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 6.5h16"/><path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7"/><path d="M6.5 6.5 7.4 20a1.5 1.5 0 0 0 1.5 1.4h6.2A1.5 1.5 0 0 0 16.6 20l.9-13.5"/>',
  send: '<path d="M21 3 10.5 13.5"/><path d="M21 3l-6.8 18-3.7-7.5L3 9.8z"/>',
  message: '<path d="M20.5 11.8a7.7 7.7 0 0 1-8.3 7.7 8.7 8.7 0 0 1-3.2-.7L3.5 20.5l1.7-5.4a8.5 8.5 0 0 1-.7-3.3 7.7 7.7 0 0 1 7.7-8.3 7.7 7.7 0 0 1 8.3 8.3z"/>',
  shield: '<path d="M12 21.5s7.5-3.5 7.5-9.5V5.8L12 2.8 4.5 5.8v6.2c0 6 7.5 9.5 7.5 9.5z"/>',
  shieldCheck: '<path d="M12 21.5s7.5-3.5 7.5-9.5V5.8L12 2.8 4.5 5.8v6.2c0 6 7.5 9.5 7.5 9.5z"/><path d="m9 11.8 2.2 2.2L15.4 10"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
  download: '<path d="M12 3.5v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4 19.5h16"/>',
  upload: '<path d="M12 15.5v-11"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 19.5h16"/>',
  externalLink: '<path d="M13.5 4h6.5v6.5"/><path d="m20 4-8.5 8.5"/><path d="M18 14.5v4a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  list: '<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
  barChart: '<path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/>',
  trendingUp: '<path d="m3 16.5 6-6 4 4 8-8"/><path d="M16 6.5h5v5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  filter: '<path d="M3.5 5h17l-6.8 8v6l-3.4 1.8V13z"/>',
  moreVertical: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  layers: '<path d="m12 3 9 4.8-9 4.8-9-4.8z"/><path d="m3 12.5 9 4.8 9-4.8"/><path d="m3 17 9 4.8 9-4.8"/>',
  sparkles: '<path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8z"/><path d="M18.5 15.5 19.3 17.7 21.5 18.5 19.3 19.3 18.5 21.5 17.7 19.3 15.5 18.5 17.7 17.7z"/>',
  lightbulb: '<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1 1 1.9v.2h5v-.2c.1-.8.4-1.4 1-1.9A6 6 0 0 0 12 3z"/>',
  handHeart: '<path d="M11 13.5 8.8 11.4a2 2 0 0 1 2.8-2.8l.4.4.4-.4a2 2 0 0 1 2.8 2.8z"/><path d="M3.5 14.5 6 12.6a2 2 0 0 1 1.2-.4H12a1.6 1.6 0 1 1 0 3.2H9.4"/><path d="m3.5 14.5 4.9 5.2a2 2 0 0 0 1.5.6h4.7a2 2 0 0 0 1.4-.6l4-4.2a1.7 1.7 0 0 0-2.4-2.4l-2.6 2.4"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4.5 4.5 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
  megaphone: '<path d="M4 10v4a2 2 0 0 0 2 2h1.5L18 21V3L7.5 8H6a2 2 0 0 0-2 2z"/><path d="M21 10v4"/><path d="M7.5 16v4.5h3"/>',
  gitBranch: '<circle cx="7" cy="5.5" r="2.3"/><circle cx="7" cy="18.5" r="2.3"/><circle cx="17" cy="9.5" r="2.3"/><path d="M7 7.8v8.4"/><path d="M17 11.8a4.5 4.5 0 0 1-4.5 4.5H9.3"/>',
  flag: '<path d="M5 21V4"/><path d="M5 5h11.5l-1.8 3.5L16.5 12H5z"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.6-1.1 7.4 4.5-2.4 4.5 2.4-1.1-7.4"/>',
  fileText: '<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M13.5 3v5.5H19"/><path d="M8.5 13h7M8.5 17h5"/>',
  folder: '<path d="M3.5 6.5A2 2 0 0 1 5.5 4.5h3.6l2 2.5h7.4a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  map: '<path d="m3.5 6.5 5.5-2.5 6 2.5 5.5-2.5v13l-5.5 2.5-6-2.5-5.5 2.5z"/><path d="M9 4v13M15 6.5v13"/>',
  save: '<path d="M5 4.5h11l3 3V18a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18z"/><path d="M8 4.5v5h6v-5"/><path d="M8 19.5v-5h8v5"/>',
  cornerDownRight: '<path d="M5 5v6.5a2 2 0 0 0 2 2h11"/><path d="m14.5 10 4 3.5-4 3.5"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M4.5 15.5A2 2 0 0 1 3.5 14V5.5a2 2 0 0 1 2-2H14a2 2 0 0 1 1.5.7"/>',
  zap: '<path d="M13.5 2.5 4 13.5h7L10.5 21.5 20 10.5h-7z"/>',
  compassRose: '<circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  logOut: '<path d="M9.5 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.5"/><path d="m15.5 16 4-4-4-4"/><path d="M19.5 12H9"/>',
  key: '<circle cx="8" cy="14" r="4.2"/><path d="m11 11 8.5-8.5"/><path d="m16.5 5.5 2.5 2.5"/><path d="m14 8 2.5 2.5"/>',
  crop: '<path d="M6.5 2.5v15h15"/><path d="M2.5 6.5h15v15"/>',
  heartFull: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" fill="currentColor"/>',
  leaf: '<path d="M4 20c0-8 5-13 16-13 0 9-5 13-11 13a5 5 0 0 1-5-5z"/><path d="M9.5 14.5c2.5-2.5 5-3.8 8-4.3"/>',
  flask: '<path d="M9.5 3h5"/><path d="M10.5 3v6.2L5.4 18a2 2 0 0 0 1.7 3h9.8a2 2 0 0 0 1.7-3l-5.1-8.8V3"/><path d="M7.6 14.5h8.8"/>',
  landmark: '<path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M5.5 10.5V19M10 10.5V19M14 10.5V19M18.5 10.5V19"/><path d="M3 21h18"/>',
  laugh: '<circle cx="12" cy="12" r="9"/><path d="M7.6 13.5h8.8a4.4 4.4 0 0 1-8.8 0z"/><path d="M8.6 8.8h.01M15.4 8.8h.01"/>',
  ghost: '<path d="M5 20.5V11a7 7 0 0 1 14 0v9.5l-2.3-1.8-2.3 1.8-2.4-1.8-2.4 1.8-2.3-1.8z"/><path d="M9.5 10.5h.01M14.5 10.5h.01"/>',
  moonStar: '<path d="M19 14.2A7.6 7.6 0 0 1 9.8 5a7.6 7.6 0 1 0 9.2 9.2z"/><path d="m17.5 3 .8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
  tag: '<path d="M20.5 12.3 12.3 20.5a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1 0-2.8L11.7 3.5H19a1.5 1.5 0 0 1 1.5 1.5z"/><circle cx="16" cy="8" r="1.4"/>',
  inbox: '<path d="M3.5 13.5h4l1.5 3h6l1.5-3h4"/><path d="M5.6 5.2 3.5 13.5V18a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4.5L18.4 5.2a2 2 0 0 0-1.9-1.4H7.5a2 2 0 0 0-1.9 1.4z"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  pieChart: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15.5 3.6A9 9 0 0 1 20.4 8.5h-4.9z"/>',
  activity: '<path d="M3 12h4l2.5-7 5 14 2.5-7h4"/>',
  phone: '<path d="M21 16.5v2.6a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.5 19.5 0 0 1-3-8.6A2 2 0 0 1 3.4 3H6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 10.7a16 16 0 0 0 6.2 6.2l1.1-1.1a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
  qrCode: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><path d="M13.5 13.5h3v3h-3zM20.5 13.5v3M17.5 20.5h3M13.5 20.5h1"/>',
  undo: '<path d="M3.5 8.5h9a5.5 5.5 0 0 1 0 11H8"/><path d="m7 4-3.5 4.5L7 13"/>',
  paperclip: '<path d="M20 11.5 12.3 19.2a5 5 0 0 1-7-7l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.8 1.8 0 0 1-2.5-2.5l7.2-7.2"/>',
  link: '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.6 1.6"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1.6-1.6"/>',
  sortDown: '<path d="M7 4v16M7 20l-3-3M7 20l3-3"/><path d="M13 7h8M13 12h6M13 17h4"/>',
  minus: '<path d="M5 12h14"/>',
  userCheck: '<circle cx="9.5" cy="8" r="3.6"/><path d="M2.8 20.5a6.8 6.8 0 0 1 13.4 0"/><path d="m16.5 11.5 2 2 4-4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  wand: '<path d="m4 20 12-12"/><path d="m14 4 1 2.5L17.5 7.5 15 8.5 14 11l-1-2.5L10.5 7.5 13 6.5z"/><path d="m19 13 .7 1.7 1.8.8-1.8.8-.7 1.7-.7-1.7-1.8-.8 1.8-.8z"/>',
};

export const ICON_NAMES = Object.keys(P);

/** Trả về chuỗi SVG. `cls` để gắn class ngoài; icon luôn ẩn với screen reader. */
export function icon(name, cls = '') {
  const body = P[name];
  if (!body) return '';
  /* width/height là thuộc tính chứ không phải style: mọi rule CSS đều thắng được nó,
     nên icon mặc định vừa cỡ chữ và không bao giờ phình ra khi thiếu rule sizing. */
  return `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
     focusable="false" ${cls ? `class="${cls}"` : ''}>${body}</svg>`;
}

/** Sao đặc — dùng cho hiển thị điểm đánh giá, cần fill chứ không phải nét. */
export function starIcon(filled) {
  return `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="${filled ? 'currentColor' : 'none'}"
     stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"
     focusable="false" class="${filled ? '' : 'is-off'}">${P.star}</svg>`;
}
