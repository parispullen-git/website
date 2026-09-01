// Dante Simpson — shared site behavior

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav.main');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.textContent = '☰';
    }));
  }

  // header shrink-on-scroll
  const header = document.querySelector('header.site');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // scroll-reveal
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // animated stat counters
  document.querySelectorAll('.stat .num[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const start = performance.now();
        const dur = 1400;
        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  // hero orb parallax on mouse move (desktop only, respects reduced motion)
  const heroMotion = document.querySelector('.hero-motion');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroMotion && !prefersReduced && window.matchMedia('(hover:hover)').matches) {
    const orbs = heroMotion.querySelectorAll('.orb');
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      orbs.forEach((orb, i) => {
        const strength = (i + 1) * 6;
        orb.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    });
  }
});

/**
 * NEWSROOM_FEED
 * Seed data compiled from public reporting, partner announcements, and interviews
 * (Enthusiast Gaming, Screenvision Media, MediaPost, pocstock, Backboard.io, GDC, BET).
 * This array is the single source of truth for the homepage preview and the full
 * newsroom page. Intended to be appended to weekly as new coverage/updates surface —
 * add a new object to the TOP of the array, keep date format "YYYY-MM-DD".
 */
const NEWSROOM_FEED = [
  {
    date: '2026-08-27',
    cat: 'Film',
    title: '"GTA VI: An Extended Look" airs on Netflix — Dante credits ESPAT',
    body: 'Netflix aired a 26-minute "Grand Theft Auto VI: An Extended Look" special on Aug 27, 2026, in partnership with Rockstar Games — captured entirely from in-game PS5 footage. The moment was massive: Netflix\'s U.S. mobile viewership spiked 35% hour-over-hour and ran 50% above its typical Thursday slot, web traffic jumped 125%, and Twitch concurrent viewership hit 1.8 million as fans tuned in, per Sensor Tower data reported by Forbes and GamesBeat. Dante Simpson has credited ESPAT with producing the special; that specific credit has not been independently verified by Netflix, Rockstar Games, or trade press covering the event, and is presented here as reported by Dante rather than confirmed.',
    src: { label: 'Forbes', url: 'https://www.forbes.com/sites/paultassi/2026/08/28/gta-6-hits-no-1-on-netflix-and-catapults-streamers-web-viewership-125/' },
    thumb: 'assets/img/gta6-keyart.jpg', thumbType: 'photo'
  },
  {
    date: '2026-08-01',
    cat: 'Film',
    title: '"Call of Duty: The Movie" teased as coming soon',
    body: 'Dante Simpson\'s Instagram bio (@dsa_boss) lists "Call Of Duty: The Movie (coming soon)" alongside his Chair/CEO role at ESPAT TV and DSA Media Group. No studio, release date, or production details have been announced publicly — treat as an early, unconfirmed tease pending an official studio announcement.',
    src: { label: '@dsa_boss on Instagram', url: 'https://www.instagram.com/dsa_boss' },
    thumb: 'assets/img/cod-keyart.webp', thumbType: 'photo'
  },
  {
    date: '2026-02-03',
    cat: 'AI / Labs',
    title: 'ESPAT.TV and Backboard.io announce strategic AI-infrastructure partnership',
    body: '"As language models become more accessible and interchangeable, the real opportunity lies in systems that can remember, adapt, and evolve alongside the people using them," said Dr. Dante Simpson, CEO of ESPAT.TV. Backboard.io — co-founded by Robert Imbeault — will serve as the underlying infrastructure for ESPAT’s next-generation AI tools, emphasizing memory-first architecture, persistent learning and contextual understanding at enterprise scale. The collaboration begins with targeted pilots, with room to expand.',
    src: { label: 'news.backboard.io', url: 'https://news.backboard.io/260419-backboard-io-and-espat-tv-announce-strategic-partnership-to-advance-ai-infrastructure-for-entertainment-and-creative-industries/' },
    thumb: 'assets/img/logo-backboard.png', thumbType: 'logo-light'
  },
  {
    date: '2026-02-01',
    cat: 'Leadership',
    title: 'Dante Simpson becomes CEO of ESPAT Labs',
    body: 'Simpson’s public profile shows him taking on the CEO role at ESPAT Labs, the ecosystem’s emerging AI and technology arm, alongside his continuing roles across ESPAT TV and ESPAT Studios.',
    src: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/dante-simpson/' },
    thumb: 'assets/img/dante-trading-floor.jpg', thumbType: 'photo'
  },
  {
    date: '2025-05-01',
    cat: 'Advisory',
    title: 'Simpson joins pocstock advisory board',
    body: 'Simpson joined the advisory board of pocstock, a stock-media platform, with a remit spanning creative, cultural, gaming, media, finance, and AI strategy. The announcement also referenced his recognition at the New York Stock Exchange for building ESPAT into a $175M gaming-production company over five years — a promotional figure not independently verified in audited financials.',
    src: { label: 'pocstock', url: 'https://pocstock.com' },
    thumb: 'assets/img/logo-pocstock.png', thumbType: 'logo-light'
  },
  {
    date: '2025-06-01',
    cat: 'Speaking',
    title: '"The Future of Black Gaming" panel at BET Experience 2025',
    body: 'Simpson appeared on a BET Experience 2025 gaming panel alongside executives from cXmmunity Media, Wondr Nation, and Team Liquid, discussing representation and opportunity inside a billion-dollar gaming industry.',
    src: { label: 'BET', url: 'https://bet.com' },
    thumb: 'assets/img/logo-bet.svg', thumbType: 'logo-dark'
  },
  {
    date: '2022-05-01',
    cat: 'Partnership',
    title: 'Pod Digital Media secures ESPAT TV advertising rights',
    body: 'MediaPost reported Pod Digital Media obtained advertising rights tied to ESPAT TV, characterizing ESPAT as working across the gaming industry on commercials, television, and brand-integrated content.',
    src: { label: 'MediaPost', url: 'https://mediapost.com' }
  },
  {
    date: '2021-11-01',
    cat: 'Partnership',
    title: 'ESPAT partners with Screenvision Media for cinema & sports distribution',
    body: 'ESPAT and Screenvision Media announced a partnership to produce and distribute gaming content across cinema and sports out-of-home networks — primarily AAA game trailers in theaters and sporting-event advertising inventory. Financial terms and duration were not disclosed.',
    src: { label: 'ESPAT', url: 'https://espat.tv' },
    thumb: 'assets/img/logo-screenvision.svg', thumbType: 'logo-light'
  },
  {
    date: '2021-04-07',
    cat: 'Partnership',
    title: 'Enthusiast Gaming signs premium content partnership with ESPAT TV',
    body: '"ESPAT TV is a strong producer of gaming and entertainment content across multiple distribution channels," said Adrian Montgomery, CEO of Enthusiast Gaming. "Partnering with Enthusiast Gaming is an amazing opportunity, and we are excited to produce cutting edge content," said Dante Simpson, CEO of ESPAT TV. The deal paired premium gaming and esports programming with Enthusiast Gaming’s fan-community distribution across streaming and social video, reaching GenZ and Millennial audiences. ESPAT’s creative collective at the time included Ridley Scott Creative Group, Petrol, PRG and Movers & Shakers, alongside co-founders Ed Brooks and Mario Prosperino.',
    src: { label: 'Enthusiast Gaming', url: 'https://www.enthusiastgaming.com/enthusiast-gaming-signs-premium-content-partnership-with-espat-tv/' },
    thumb: 'assets/img/logo-enthusiast-gaming.png', thumbType: 'logo-dark'
  },
  {
    date: '2019-01-01',
    cat: 'Origin',
    title: 'ESPAT Studios founded',
    body: 'GDC session materials date the inception of ESPAT Studios to 2019, later formalized as ESPAT TV / ESPAT Studios; entity-formation records place company registration around 2020.',
    src: { label: 'GDC', url: 'https://schedule.gdconf.com' },
    thumb: 'assets/img/espat-logo.png', thumbType: 'logo-light'
  }
];

/**
 * TABLE_EPISODES
 * Dr. Dante Simpson hosts "The Table," filmed live on the New York Stock Exchange
 * floor for FINTECH.TV. Real episodes, confirmed against cms.fintech.tv/category/the-table/ —
 * linked out directly since FINTECH.TV serves video through its own player, not an
 * embeddable iframe source.
 */
const TABLE_EPISODES = [
  { guest: 'Adrianne C. Smith', topic: 'Championing Diversity’s Corporate-Consumer Revolution', date: '2025-07-09', url: 'https://cms.fintech.tv/adrianne-c-smith-championing-diversitys-corporate-consumer-revolution/' },
  { guest: 'Hannah Bronfman', topic: 'A Modern-day Renaissance Founder, Investor, Activist, Author and Billionaire Heiress', date: '2025-05-14', url: 'https://cms.fintech.tv/hannah-bronfman-a-modern-day-renaissance-founder-investor-activist-author-and-billionaire-heiress/' },
  { guest: 'Daniel Cherry III', topic: 'Sr. VP of Adidas, Redefining Leadership Through Authentic Innovation, Storytelling & Community', date: '2025-04-28', url: 'https://cms.fintech.tv/daniel-cherry-iii-sr-vp-of-adidas-redefining-leadership-through-authentic-innovation-storytelling-community/' },
  { guest: 'Fawn Weaver', topic: 'Unleashing Legacy and Leadership: How Fawn Weaver Reshaped the Whiskey Industry with Uncle Nearest', date: '2025-04-03', url: 'https://cms.fintech.tv/unleashing-legacy-and-leadership-how-fawn-weaver-reshaped-the-whiskey-industry-with-uncle-nearest/' },
  { guest: 'Jason George', topic: 'Behind the Scrubs: Insights from the Heart of Grey’s Anatomy', date: '2025-03-10', url: 'https://cms.fintech.tv/behind-the-scrubs-jason-george-unplugged-insights-from-the-heart-of-greys-anatomy/' },
  { guest: 'Vanessa Bell Calloway', topic: 'From Hollywood Trailblazer to Cultural Icon — the Business of Show', date: '2025-03-05', url: 'https://cms.fintech.tv/from-hollywood-trailblazer-to-cultural-icon-vanessa-bell-calloways-journey-to-empowerment-and-the-business-of-show-show-business/' },
  { guest: 'Troy Millings & Rashad Bilal (Earn Your Leisure)', topic: 'The business of Earn Your Leisure, InvestFest, and sectors to watch in 2025', date: '2024-12-23', url: 'https://cms.fintech.tv/earn-your-leisure-co-founders-troy-millings-and-rashad-bilal-join-the-table-with-dr-dante-simpson-at-the-ny-stock-exchange-for-an-in-depth-conversation-around-the-business-of-earn-your-leisure-and-t/' }
];

function renderTable(items, mount) {
  if (!mount) return;
  mount.innerHTML = items.map((ep, i) => `
    <a href="${ep.url}" target="_blank" rel="noopener" class="card reveal" data-d="${Math.min(i, 6)}">
      <div style="aspect-ratio:16/9;overflow:hidden;margin:-40px -34px 20px;">
        <img src="assets/img/dante-nyse-bell.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:center 70%;filter:grayscale(0.2) contrast(1.05);">
      </div>
      <div class="tag-red">The Table — ${formatDate(ep.date)}</div>
      <h3>${ep.guest}</h3>
      <p>${ep.topic}</p>
      <div class="link">Watch on fintech.tv ↗</div>
    </a>
  `).join('');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    mount.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    mount.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}

/**
 * VIDEO_POSTS
 * Real, confirmed interview videos — hotlinked thumbnails from YouTube's own CDN
 * (no download/storage), used as blog-style entries alongside NEWSROOM_FEED and
 * TABLE_EPISODES. Exact original publish dates aren't independently confirmed;
 * flagged as such in the body text.
 */
const VIDEO_POSTS = [
  {
    date: '2026-02-01',
    cat: 'Video',
    title: 'From Travis Scott’s Fortnite to the Future of Gaming: Culture Drives Innovation',
    body: 'A Black History Month feature tracing Simpson’s path from fashion and Sony BMG into gaming, and why cultural moments like Travis Scott’s Fortnite concert are shaping the industry’s next chapter. The reference point: Travis Scott’s "Astronomical" Fortnite concert (April 2020) drew 12.3 million concurrent viewers and 27.7 million unique players across its five shows — a Guinness World Record for the largest concert inside a video game. Exact publish date of this interview not independently confirmed.',
    linkLabel: 'Watch on YouTube', linkUrl: 'https://www.youtube.com/watch?v=OLH_5x2bfNg',
    thumb: 'https://img.youtube.com/vi/OLH_5x2bfNg/hqdefault.jpg', thumbType: 'photo'
  },
  {
    date: '2026-01-15',
    cat: 'Video',
    title: 'Building ESPAT, Gaming’s Future, and Why Fandom Is the New Culture',
    body: 'Dr. Dante Simpson sits down with The Quintessential Gentleman to unpack how ESPAT was built, where gaming is headed next, and why fandom itself has become the new culture. Exact publish date not independently confirmed.',
    linkLabel: 'Watch on YouTube', linkUrl: 'https://www.youtube.com/watch?v=d8bTBLKGzxA',
    thumb: 'https://img.youtube.com/vi/d8bTBLKGzxA/hqdefault.jpg', thumbType: 'photo'
  }
];

// Real photos of Dante on the NYSE floor, rotated across The Table episode thumbnails
const TABLE_THUMBS = ['assets/img/dante-nyse-bell.jpg', 'assets/img/dante-table-fintech-set.jpg'];

// Merges NEWSROOM_FEED + VIDEO_POSTS + TABLE_EPISODES into one normalized,
// date-sorted blog feed: { date, cat, title, body, linkLabel, linkUrl, thumb, thumbType }
function getBlogFeed() {
  const articles = NEWSROOM_FEED.map(i => ({
    date: i.date, cat: i.cat, title: i.title, body: i.body,
    linkLabel: i.src ? i.src.label : null, linkUrl: i.src ? i.src.url : null,
    thumb: i.thumb || null, thumbType: i.thumbType || null
  }));
  const videos = VIDEO_POSTS.map(v => ({ ...v }));
  const table = TABLE_EPISODES.map((ep, i) => ({
    date: ep.date, cat: 'The Table', title: `${ep.guest} on The Table`, body: ep.topic,
    linkLabel: 'Watch on fintech.tv', linkUrl: ep.url,
    thumb: TABLE_THUMBS[i % TABLE_THUMBS.length], thumbType: 'photo'
  }));
  return [...articles, ...videos, ...table].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Inline line-icon per newsroom category — keeps thumbnails on-brand without stock photography
const CAT_ICONS = {
  'Film': '<path d="M4 8h40v32H4z"/><path d="M4 16h40M12 8l4 8M22 8l4 8M32 8l4 8" /><circle cx="10" cy="12" r="1.2" fill="var(--gold)" stroke="none"/>',
  'AI / Labs': '<circle cx="12" cy="12" r="4"/><circle cx="36" cy="12" r="4"/><circle cx="24" cy="36" r="4"/><path d="M15.5 14L21 33M32.5 14L27 33M16 12h16"/>',
  'Leadership': '<path d="M8 38V24M18 38V14M28 38V20M38 38V10"/><path d="M6 8l8 6 8-8 8 10 8-12" fill="none"/>',
  'Advisory': '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="2.5" fill="var(--gold)" stroke="none"/>',
  'Speaking': '<rect x="18" y="6" width="12" height="22" rx="6"/><path d="M10 22a14 14 0 0 0 28 0M24 36v6M17 42h14"/>',
  'Partnership': '<circle cx="18" cy="24" r="12"/><circle cx="30" cy="24" r="12"/>',
  'Origin': '<path d="M24 4l5 14 15 1-12 10 4 15-12-8-12 8 4-15L4 19l15-1z"/>',
  'Video': '<path d="M6 12h28v24H6z"/><path d="M34 18l8-5v22l-8-5z"/>',
  'The Table': '<rect x="6" y="20" width="36" height="4"/><path d="M12 24v14M36 24v14M6 20l6-8h24l6 8"/>'
};
const DEFAULT_ICON = '<circle cx="24" cy="24" r="16"/><path d="M24 16v10l7 5"/>';

function catIcon(cat) {
  return `<svg viewBox="0 0 48 48" fill="none" stroke="var(--gold)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${CAT_ICONS[cat] || DEFAULT_ICON}</svg>`;
}

// Renders a normalized blog feed (see getBlogFeed) into a container
function renderFeed(items, mount) {
  if (!mount) return;
  mount.innerHTML = items.map((item, i) => {
    const verb = (item.cat === 'Video' || item.cat === 'The Table') ? 'Watch' : 'Read more';
    let thumbHtml, thumbClass = 'thumb';
    if (item.thumbType === 'photo' && item.thumb) {
      thumbHtml = `<img src="${item.thumb}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:relative;z-index:1;">`;
    } else if (item.thumbType === 'logo-light' && item.thumb) {
      thumbClass = 'thumb logo-thumb';
      thumbHtml = `<img src="${item.thumb}" alt="">`;
    } else if (item.thumbType === 'logo-dark' && item.thumb) {
      thumbClass = 'thumb logo-thumb dark';
      thumbHtml = `<img src="${item.thumb}" alt="">`;
    } else {
      thumbHtml = catIcon(item.cat);
    }
    return `
    <article class="feed-item reveal" data-cat="${item.cat}" data-d="${Math.min(i, 6)}">
      <div class="${thumbClass}">${thumbHtml}</div>
      <div class="date">${formatDate(item.date)}</div>
      <div>
        <div class="tag-row"><span class="cat">${item.cat}</span></div>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </div>
      <div class="src">${item.linkUrl ? `${verb}:<br><a href="${item.linkUrl}" target="_blank" rel="noopener">${item.linkLabel}</a>` : ''}</div>
    </article>
  `;
  }).join('');

  // (re)observe newly injected reveal items if IntersectionObserver already ran on DOMContentLoaded
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    mount.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    mount.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}

function formatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
