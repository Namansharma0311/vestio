import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { api } from "../api/client.js";
import { hapticTap } from "../hooks/useHaptics.js";
import { useCategory } from "../context/CategoryContext.jsx";

const ARTISTS = {
  hindi: [
    { id: "arijit", name: "Arijit Singh", tracks: ["Tum Hi Ho", "Channa Mereya", "Kesariya", "Raabta", "Apna Bana Le"] },
    { id: "shreya", name: "Shreya Ghoshal", tracks: ["Deewani Mastani", "Sunn Raha Hai", "Param Sundari", "Nainowale Ne"] },
    { id: "rahman", name: "A.R. Rahman", tracks: ["Jai Ho", "Kun Faya Kun", "Maa Tujhe Salaam", "Khwaja Mere Khwaja"] },
    { id: "pritam", name: "Pritam", tracks: ["Kesariya", "Raabta", "Subhanallah", "Channa Mereya", "Tera Hone Laga Hoon"] },
    { id: "vishal", name: "Vishal-Shekhar", tracks: ["Nashe Si Chadh Gayi", "Ghungroo", "Swag Se Swagat", "Jai Jai Shiv Shankar"] },
    { id: "sachin", name: "Sachin-Jigar", tracks: ["Apna Bana Le", "Jeena Jeena", "Kamariya", "Milegi Milegi"] },
    { id: "badshah", name: "Badshah", tracks: ["Jugnu", "Paani Paani", "Genda Phool", "Mercy", "DJ Waley Babu"] },
    { id: "king", name: "King", tracks: ["Maan Meri Jaan", "Tu Aake Dekhle", "Sarkaare", "Oops"] },
    { id: "apdhillon", name: "AP Dhillon", tracks: ["Brown Munde", "Excuses", "Summer High", "With You"] },
    { id: "sidhu", name: "Sidhu Moose Wala", tracks: ["295", "The Last Ride", "Same Beef", "So High"] },
    { id: "darshan", name: "Darshan Raval", tracks: ["Chogada", "Kamariya", "Tera Zikr", "Hawa Banke"] },
    { id: "jubin", name: "Jubin Nautiyal", tracks: ["Raataan Lambiyan", "Tujhe Kitna Chahne Lage", "Lut Gaye", "Barsaat Ki Dhun"] },
    { id: "neha", name: "Neha Kakkar", tracks: ["Aankh Marey", "Dilbar", "O Saki Saki", "Garmi", "Kala Chashma"] },
    { id: "tony", name: "Tony Kakkar", tracks: ["Coca Cola", "Dheeme Dheeme", "Bijli", "Kanta Laga"] },
  ],
  english: [
    { id: "billie", name: "Billie Eilish", tracks: ["Birds of a Feather", "Lunch", "Bad Guy", "Happier Than Ever", "What Was I Made For?", "Lovely", "Therefore I Am", "My Future"] },
    { id: "taylor", name: "Taylor Swift", tracks: ["Cruel Summer", "Anti-Hero", "Lover", "Cardigan", "Style", "Blank Space", "Shake It Off", "Wildest Dreams", "Enchanted", "All Too Well"] },
    { id: "olivia", name: "Olivia Rodrigo", tracks: ["Good 4 U", "Vampire", "Drivers License", "Deja Vu", "Traitor", "Brutal"] },
    { id: "sabrina", name: "Sabrina Carpenter", tracks: ["Espresso", "Please Please Please", "Nonsense", "Feather", "Skin"] },
    { id: "dua", name: "Dua Lipa", tracks: ["Houdini", "Levitating", "Dance The Night", "Don't Start Now", "New Rules", "Physical"] },
    { id: "ariana", name: "Ariana Grande", tracks: ["We Can't Be Friends", "Yes, And?", "7 Rings", "Thank U Next", "Positions", "Side To Side"] },
    { id: "weeknd", name: "The Weeknd", tracks: ["Blinding Lights", "Save Your Tears", "Die For You", "Starboy", "One Of The Girls", "Creepin'"] },
    { id: "harry", name: "Harry Styles", tracks: ["As It Was", "Late Night Talking", "Watermelon Sugar", "Golden", "Adore You"] },
    { id: "doja", name: "Doja Cat", tracks: ["Paint The Town Red", "Say So", "Kiss Me More", "Woman", "Need To Know"] },
    { id: "sza", name: "SZA", tracks: ["Kill Bill", "Snooze", "Good Days", "The Weekend", "Love Language"] },
    { id: "lana", name: "Lana Del Rey", tracks: ["Summertime Sadness", "Young And Beautiful", "A&W", "Video Games", "Doin' Time"] },
    { id: "beyonce", name: "Beyonce", tracks: ["Texas Hold 'Em", "Cuff It", "Break My Soul", "Halo", "Crazy In Love"] },
    { id: "miley", name: "Miley Cyrus", tracks: ["Flowers", "Used To Be Young", "Wrecking Ball", "Midnight Sky", "Party In The USA"] },
    { id: "post", name: "Post Malone", tracks: ["Chemical", "I Like You", "Circles", "Sunflower", "Rockstar"] },
    { id: "ed", name: "Ed Sheeran", tracks: ["Shape Of You", "Perfect", "Bad Habits", "Shivers", "Photograph"] },
    { id: "justin", name: "Justin Bieber", tracks: ["Stay", "Peaches", "Ghost", "Sorry", "Love Yourself"] },
    { id: "rihanna", name: "Rihanna", tracks: ["Diamonds", "Umbrella", "Work", "Love On The Brain", "We Found Love"] },
    { id: "coldplay", name: "Coldplay", tracks: ["Yellow", "Fix You", "Viva La Vida", "A Sky Full Of Stars", "My Universe"] },
    { id: "imagine", name: "Imagine Dragons", tracks: ["Believer", "Radioactive", "Enemy", "Thunder", "Demons"] },
    { id: "onerepublic", name: "OneRepublic", tracks: ["Counting Stars", "Apologize", "Secrets", "Good Life", "I Lived"] },
  ],
  kpop: [
    { id: "blackpink", name: "BLACKPINK", type: "group", members: [
      { id: "jennie", name: "Jennie", tracks: ["Solo", "You & Me", "One Of The Girls", "Mantra", "Seoul City"] },
      { id: "lisa", name: "Lisa", tracks: ["Money", "Lalisa", "Rockstar", "New Woman", "Moonlit Floor"] },
      { id: "rose", name: "Rosé", tracks: ["APT.", "On The Ground", "Gone", "Number One Girl", "Toxic Till The End"] },
      { id: "jisoo", name: "Jisoo", tracks: ["Flower", "All Eyes On Me", "Earthquake", "Your Love"] },
    ], groupTracks: ["Pink Venom", "Shut Down", "How You Like That", "Lovesick Girls", "Whistle", "Playing With Fire"] },
    { id: "lesserafim", name: "LE SSERAFIM", type: "group", members: [
      { id: "sakura", name: "Sakura", tracks: ["Lazy"] },
      { id: "chaewon", name: "Chaewon", tracks: ["Antifragile (Chaewon ver.)"] },
      { id: "yunjin", name: "Yunjin", tracks: ["Raise y_our glass", "I ≠ DOLL"] },
      { id: "kazuha", name: "Kazuha", tracks: ["Fearless (Kazuha ver.)"] },
      { id: "eunchae", name: "Eunchae", tracks: ["Fearless (Eunchae ver.)"] },
    ], groupTracks: ["Perfect Night", "Unforgiven", "Antifragile", "Fearless", "Eve, Psyche & The Bluebeard's Wife", "Impurities"] },
    { id: "ive", name: "IVE", type: "group", members: [
      { id: "yujin", name: "An Yujin", tracks: ["Mine"] },
      { id: "gaeul", name: "Gaeul", tracks: ["Either Way (Gaeul ver.)"] },
      { id: "rei", name: "Rei", tracks: ["Either Way (Rei ver.)"] },
      { id: "wonyoung", name: "Jang Wonyoung", tracks: ["Either Way (Wonyoung ver.)"] },
      { id: "liz", name: "Liz", tracks: ["Either Way (Liz ver.)"] },
      { id: "leeseo", name: "Leeseo", tracks: ["Either Way (Leeseo ver.)"] },
    ], groupTracks: ["I AM", "Kitsch", "After LIKE", "Love Dive", "Eleven", "Baddie", "Either Way", "Off The Record", "Heya"] },
    { id: "katseye", name: "KATSEYE", type: "group", members: [
      { id: "sophia", name: "Sophia", tracks: ["Debut (Sophia ver.)"] },
      { id: "lara", name: "Lara", tracks: ["Debut (Lara ver.)"] },
      { id: "yoonchae", name: "Yoonchae", tracks: ["Debut (Yoonchae ver.)"] },
      { id: "megan", name: "Megan", tracks: ["Debut (Megan ver.)"] },
      { id: "daniela", name: "Daniela", tracks: ["Debut (Daniela ver.)"] },
      { id: "manon", name: "Manon", tracks: ["Debut (Manon ver.)"] },
    ], groupTracks: ["Debut", "Touch", "My Way", "Gnarly", "Tonight I Might", "I'm Pretty"] },
  ],
};

const CATEGORY_COLORS = {
  hindi: { dot: "#C47A3A", name: "Hindi", label: "HIN" },
  english: { dot: "#5B7FA5", name: "English", label: "ENG" },
  kpop: { dot: "#9B7DB8", name: "K-Pop", label: "KPOP" },
};

function getArtistCategory(artistId) {
  for (const [cat, artists] of Object.entries(ARTISTS)) {
    const found = artists.some(a => a.id === artistId);
    if (found) return cat;
    const group = artists.find(a => a.type === "group" && a.members?.some(m => m.id === artistId));
    if (group) return cat;
  }
  return "english";
}

function getCategoryDot(category) {
  return CATEGORY_COLORS[category]?.dot || "#5B7FA5";
}

const STORY_LAYOUTS = [
  { id: "layout-1", name: "Clean Minimal", description: "Outfit center, song bottom, clean typography", icon: "format_align_center", structure: ["Outfit photo (center)", "Song title + artist (bottom)", "Minimal text overlay"], vibe: "Clean Girl / Quiet Luxury" },
  { id: "layout-2", name: "Split Screen", description: "Outfit left, lyrics/mood right", icon: "view_sidebar", structure: ["Outfit (60% left)", "Lyrics snippet / mood quote (40% right)", "Song tag bottom"], vibe: "Dark Academia / K-pop Idol" },
  { id: "layout-3", name: "Carousel Teaser", description: "3-frame: detail → full fit → song", icon: "view_carousel", structure: ["Frame 1: Close-up detail", "Frame 2: Full outfit", "Frame 3: Song cover + 'Tap for sound'"], vibe: "Y2K / Dopamine / K-pop" },
  { id: "layout-4", name: "Polaroid Stack", description: "Stacked polaroids with song as caption", icon: "photo_library", structure: ["3-4 polaroid-style outfit shots", "Song title as handwritten caption", "Date stamp aesthetic"], vibe: "Coastal Grandmother / Dreamy" },
  { id: "layout-5", name: "Magazine Spread", description: "Editorial layout with pull quotes", icon: "menu_book", structure: ["Large hero outfit image", "Pull quote from lyrics", "Song credit in editorial type"], vibe: "Main Character / Editorial" },
  { id: "layout-6", name: "Reel Cover Style", description: "Vertical 9:16 optimized for Reels/Shorts", icon: "smartphone", structure: ["Top: Trend name badge", "Center: Outfit in motion", "Bottom: Song title + 'Sound on'"], vibe: "Viral / Reels / TikTok" },
];

const WEARABLE_ANGLES = [
  { id: "angle-1", name: "Full Length Mirror", description: "Head-to-toe, shows proportions", icon: "fullscreen", bestFor: ["Full outfits", "Silhouette", "Layering"], tip: "Stand 45° angle, weight on back leg" },
  { id: "angle-2", name: "Upper Body Focus", description: "Waist up — tops, jewelry, outerwear", icon: "crop_portrait", bestFor: ["Tops", "Blazers", "Necklaces", "Earrings"], tip: "Slight chin down, shoulders relaxed" },
  { id: "angle-3", name: "Detail Close-up", description: "Texture, fabric, accessories", icon: "zoom_in", bestFor: ["Handbags", "Shoes", "Rings", "Texture"], tip: "Tap to focus, natural light from window" },
  { id: "angle-4", name: "Seated / Cafe", description: "Relaxed, lifestyle vibe", icon: "chair", bestFor: ["Cozy fits", "Layering", "Bottoms + shoes"], tip: "Cross ankles, lean slightly forward" },
  { id: "angle-5", name: "Walking / Motion", description: "Dynamic, shows fabric movement", icon: "directions_walk", bestFor: ["Dresses", "Coats", "Wide legs", "Reels"], tip: "Burst mode, walk toward camera" },
  { id: "angle-6", name: "Flat Lay", description: "Outfit laid out aesthetically", icon: "grid_view", bestFor: ["Planning", "Accessories", "Color story"], tip: "Neutral background, add coffee/book/flowers" },
  { id: "angle-7", name: "Over-the-Shoulder", description: "Back details, hair, outerwear", icon: "flip_camera_android", bestFor: ["Backless tops", "Hoodies", "Capes", "Hair"], tip: "Look back over one shoulder" },
  { id: "angle-8", name: "Low Angle (Hero)", description: "Legs look longer, powerful stance", icon: "camera_alt", bestFor: ["High-waisted", "Boots", "Long coats"], tip: "Phone at knee height, tilt up slightly" },
];

const FILTERS = [
  { id: "filter-1", name: "Clean & Bright", css: "brightness(1.1) contrast(1.05) saturate(1.1)", vibe: "Clean Girl / Minimal / Light Mode", bestFor: ["Neutrals", "Whites", "Pastels", "Daytime"], icon: "wb_sunny" },
  { id: "filter-2", name: "Moody Film", css: "contrast(1.2) brightness(0.9) saturate(0.9) sepia(0.1)", vibe: "Dark Academia / Moody / Evening", bestFor: ["Blacks", "Deep tones", "Layering", "Night"], icon: "nightlight_round" },
  { id: "filter-3", name: "K-Pop Gloss", css: "brightness(1.15) contrast(1.1) saturate(1.25) hue-rotate(-5deg)", vibe: "K-Pop / Idol / High Energy", bestFor: ["Bold colors", "Stage fits", "Glossy fabrics"], icon: "auto_awesome" },
  { id: "filter-4", name: "Vintage Film", css: "sepia(0.2) contrast(1.1) brightness(0.95) saturate(0.85) grayscale(0.05)", vibe: "Y2K / Nostalgia / Retro", bestFor: ["Denim", "Vintage pieces", "Film aesthetic"], icon: "movie_filter" },
  { id: "filter-5", name: "Dreamy Pastel", css: "brightness(1.1) contrast(0.9) saturate(0.95) hue-rotate(10deg) opacity(0.95)", vibe: "Coastal Grandmother / Dreamy / Soft", bestFor: ["Linens", "Pastels", "Soft textures", "Morning light"], icon: "filter_frames" },
  { id: "filter-6", name: "High Contrast B&W", css: "grayscale(1) contrast(1.3) brightness(1.05)", vibe: "Editorial / Minimalist / Artistic", bestFor: ["Silhouettes", "Architecture", "Texture", "Statement pieces"], icon: "filter_b_and_w" },
  { id: "filter-7", name: "Golden Hour", css: "sepia(0.3) brightness(1.1) saturate(1.15) hue-rotate(-15deg)", vibe: "Sunset / Warm / Romantic", bestFor: ["Warm tones", "Gold jewelry", "Evening fits", "Date night"], icon: "wb_twilight" },
  { id: "filter-8", name: "Cyber Neon", css: "contrast(1.2) saturate(1.4) hue-rotate(180deg) brightness(1.05)", vibe: "Y2K / Cyber / Rave / Dopamine", bestFor: ["Neons", "Metallics", "Statement pieces", "Night out"], icon: "neon_mode" },
];

/* ─── Music image fetcher (proxied through backend) ─── */
const IMAGE_CACHE_VERSION = 2;
const imageCache = {};

(function clearStaleImageCache() {
  try {
    const v = parseInt(localStorage.getItem("vestio_music_img_ver") || "0", 10);
    if (v < IMAGE_CACHE_VERSION) {
      localStorage.removeItem("vestio_music_images");
      localStorage.setItem("vestio_music_img_ver", String(IMAGE_CACHE_VERSION));
    }
  } catch {}
})();

async function fetchMusicImage(query, type = "artist") {
  const cacheKey = `${type}:${query}`;
  if (imageCache[cacheKey] !== undefined) return imageCache[cacheKey];
  try {
    const base = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${base}/api/music/search?q=${encodeURIComponent(query)}&type=${type}`);
    const data = await res.json();
    const url = data.url || null;
    imageCache[cacheKey] = url;
    return url;
  } catch {
    imageCache[cacheKey] = null;
    return null;
  }
}

function useMusicImages(artists, extraTracks) {
  const [images, setImages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vestio_music_images") || "{}"); } catch { return {}; }
  });

  const getArtistImage = useCallback((name) => images[`artist:${name}`] || null, [images]);
  const getTrackImage = useCallback((query) => images[`track:${query}`] || null, [images]);

  function mergeImages(newData) {
    setImages(prev => {
      const merged = { ...prev, ...newData };
      try { localStorage.setItem("vestio_music_images", JSON.stringify(merged)); } catch {}
      return merged;
    });
  }

  async function fetchOnDemand(key, query, type) {
    if (key in imageCache) return imageCache[key];
    const url = await fetchMusicImage(query, type);
    if (url) mergeImages({ [key]: url });
    return url;
  }

  const fetchTrackImage = useCallback((trackName, artistName) => {
    const cleanArtist = artistName.split("(")[0].trim();
    const key = `track:${trackName} ${cleanArtist}`;
    if (images[key] !== undefined) return;
    fetchOnDemand(key, `${trackName} ${cleanArtist}`, "track");
  }, []);

  const fetchArtistImage = useCallback((name) => {
    const key = `artist:${name}`;
    if (images[key] !== undefined) return;
    fetchOnDemand(key, name, "artist");
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const toFetch = [];
      artists.forEach(a => {
        const key = `artist:${a.name}`;
        if (!(key in images)) toFetch.push({ key, query: a.name, type: "artist" });
        if (a.type === "group") {
          a.members?.forEach(m => {
            const mk = `artist:${m.name}`;
            if (!(mk in images)) toFetch.push({ key: mk, query: m.name, type: "artist" });
          });
        }
      });
      if (extraTracks) {
        extraTracks.forEach(t => {
          const cleanArtist = t.artist.split("(")[0].trim();
          const key = `track:${t.track} ${cleanArtist}`;
          if (!(key in images)) toFetch.push({ key, query: `${t.track} ${cleanArtist}`, type: "track" });
        });
      }
      for (let i = 0; i < toFetch.length && !cancelled; i += 6) {
        const batch = toFetch.slice(i, i + 6);
        const results = {};
        await Promise.allSettled(batch.map(async (item) => {
          const url = await fetchMusicImage(item.query, item.type);
          if (url) results[item.key] = url;
        }));
        if (!cancelled && Object.keys(results).length > 0) mergeImages(results);
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  return { getArtistImage, getTrackImage, fetchTrackImage, fetchArtistImage, images };
}

function Icon({ name, size = 20, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={{ fontSize: size, fontFamily: "'Material Symbols Outlined'", fontWeight: "normal", fontStyle: "normal", lineHeight: 1 }}
    >
      {name}
    </span>
  );
}

function CategoryDot({ category, active, onClick }) {
  const color = CATEGORY_COLORS[category].dot;
  return (
    <button
      onClick={() => onClick(category)}
      className={`relative w-11 h-11 rounded-full transition-all flex items-center justify-center ${active ? "scale-110" : "opacity-60 hover:opacity-100"}`}
      style={{
        background: active ? color : "var(--c-surface)",
        boxShadow: active ? `0 0 0 2px ${color}40, 0 2px 8px ${color}20` : "none",
        border: `2px solid ${active ? color : "var(--c-border)"}`,
      }}
      aria-label={CATEGORY_COLORS[category].label}
    >
      <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-white text-[9px] font-display font-700"
        style={{ background: color, width: 18, height: 18 }}>
        {CATEGORY_COLORS[category].label.charAt(0)}
      </span>
    </button>
  );
}

function ArtistCard({ artist, category, onSelect, isGroup, getArtistImage, fetchArtistImage }) {
  const trackCount = isGroup
    ? (artist.groupTracks?.length || 0) + (artist.members?.reduce((sum, m) => sum + (m.tracks?.length || 0), 0) || 0)
    : artist.tracks?.length || 0;
  const memberCount = isGroup ? (artist.members?.length || 0) : null;
  const color = CATEGORY_COLORS[category].dot;
  const photo = getArtistImage(artist.name);

  useEffect(() => { fetchArtistImage(artist.name); }, [artist.name]);

  return (
    <div
      onClick={() => { hapticTap("light"); onSelect(artist); }}
      className="hangtag p-4 cursor-pointer hover:ring-2 hover:ring-moss/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ border: `2px solid ${color}30` }}>
          {photo ? (
            <img src={photo} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-display font-700 text-lg"
              style={{ background: color }}>
              {isGroup ? artist.name.charAt(0) : artist.name.split(" ")[0].charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-800 text-sm truncate">{artist.name}</p>
          <p className="text-[11px] text-muted uppercase tracking-wide">
            {isGroup ? `${memberCount} members · ${trackCount} tracks` : `${trackCount} tracks`}
          </p>
        </div>
        <Icon name="chevron_right" size={18} className="text-muted" />
      </div>
      {isGroup && artist.members && (
        <div className="flex flex-wrap gap-1 mt-2">
          {artist.members.slice(0, 4).map((m) => (
            <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-tag border border-line bg-canvas/50">
              {m.name}
            </span>
          ))}
          {artist.members.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-tag border border-line text-muted">
              +{artist.members.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TrackCard({ track, artistName, onSelect, category, getTrackImage, fetchTrackImage }) {
  const color = CATEGORY_COLORS[category]?.dot || "var(--c-accent)";
  const cleanArtist = artistName.split("(")[0].trim();
  const albumArt = getTrackImage(`${track} ${cleanArtist}`);

  useEffect(() => { fetchTrackImage(track, artistName); }, [track, artistName]);

  return (
    <div
      onClick={() => { hapticTap("light"); onSelect({ track, artist: artistName }); }}
      className="flex items-center gap-3 p-3 rounded-tag bg-surface border border-line cursor-pointer hover:bg-canvas hover:border-moss/30 transition-all"
    >
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: color + "18" }}>
        {albumArt ? (
          <img src={albumArt} alt={track} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Icon name="music_note" size={18} style={{ color }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-600 text-sm truncate">{track}</p>
        <p className="text-[11px] text-muted">{artistName}</p>
      </div>
      <a
        href={`spotify:search:track:${encodeURIComponent(track)} artist:${encodeURIComponent(artistName)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-1 text-[10px] font-display font-600 uppercase tracking-wide rounded-tag border border-line bg-canvas/50 shrink-0 flex items-center gap-1 hover:bg-canvas transition-colors"
      >
        <Icon name="play_arrow" size={14} /> Play
      </a>
    </div>
  );
}

function AccordionSection({ title, icon, isOpen, onToggle, children }) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hangtag transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--c-accent)" }}>
            <Icon name={icon} size={18} />
          </div>
          <h3 className="font-display font-800 text-base">{title}</h3>
        </div>
        <Icon name={isOpen ? "expand_less" : "expand_more"} size={24} className="text-muted" />
      </button>
      {isOpen && (
        <div className="hangtag px-4 pt-2 pb-4 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
}

function LayoutCard({ layout, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(layout.id)}
      className={`hangtag p-3 text-left transition-all ${selected ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
      style={{ ringColor: selected ? "var(--c-accent)" : "transparent" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon name={layout.icon} size={20} className="text-moss" />
        <p className="font-display font-800 text-sm">{layout.name}</p>
      </div>
      <p className="text-xs text-muted mb-2">{layout.description}</p>
      <p className="text-[10px] font-display font-600 uppercase tracking-wide text-muted">
        Vibe: {layout.vibe}
      </p>
    </button>
  );
}

function AngleCard({ angle, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(angle.id)}
      className={`hangtag p-3 text-left transition-all ${selected ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
      style={{ ringColor: selected ? "var(--c-accent)" : "transparent" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon name={angle.icon} size={18} className="text-moss" />
        <p className="font-display font-800 text-sm">{angle.name}</p>
      </div>
      <p className="text-xs text-muted mb-2">{angle.description}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {angle.bestFor.map((b) => (
          <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-tag border border-line bg-canvas/50">
            {b}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] italic text-muted">
        <Icon name="lightbulb" size={12} />
        <span>{angle.tip}</span>
      </div>
    </button>
  );
}

function FilterCard({ filter, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(filter.id)}
      className={`hangtag p-3 text-left transition-all relative overflow-hidden ${selected ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
      style={{ ringColor: selected ? "var(--c-accent)" : "transparent" }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon name={filter.icon} size={16} className="text-moss" />
          <p className="font-display font-800 text-sm">{filter.name}</p>
        </div>
        <p className="text-xs text-muted mb-2">{filter.vibe}</p>
        <div className="flex flex-wrap gap-1">
          {filter.bestFor.map((b) => (
            <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-tag border border-line bg-surface/80">
              {b}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

function TrendingCarousel({ onTrackSelect, userCategories }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trending, setTrending] = useState({ us: [], in: [] });
  const [region, setRegion] = useState("us");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const base = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${base}/api/music/trending`);
        const data = await res.json();
        if (!cancelled) {
          setTrending({ us: data.us || [], in: data.in || [] });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const songs = trending[region] || [];
  const total = songs.length;

  useEffect(() => {
    if (total === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [total]);

  useEffect(() => { setCurrentIndex(0); }, [region]);

  if (loading) {
    return (
      <div className="hangtag p-4 overflow-hidden mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--c-accent)" }}>
            <Icon name="trending_up" size={16} className="text-white" />
          </div>
          <h3 className="font-display font-800 text-base">Trending Now</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-muted text-sm">
          <Icon name="hourglass_top" size={20} className="animate-spin mr-2" /> Loading charts...
        </div>
      </div>
    );
  }

  if (total === 0) return null;
  const current = songs[currentIndex % total];

  return (
    <div className="hangtag p-4 overflow-hidden mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--c-accent)" }}>
            <Icon name="trending_up" size={16} className="text-white" />
          </div>
          <h3 className="font-display font-800 text-base">Trending Now</h3>
          <div className="flex gap-1 ml-2">
            {["us", "in"].map((r) => (
              <button key={r} onClick={() => setRegion(r)}
                className={`px-2 py-0.5 text-[10px] font-display font-600 uppercase tracking-wide rounded-tag border transition-all ${region === r ? "bg-moss text-white border-moss" : "border-line text-muted hover:border-moss/50"}`}>
                {r === "us" ? "US" : "India"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted font-display font-600 mr-1">{currentIndex + 1}/{total}</span>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + total) % total)}
            className="p-1 rounded-full hover:bg-canvas transition-colors"
          >
            <Icon name="chevron_left" size={20} className="text-muted" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % total)}
            className="p-1 rounded-full hover:bg-canvas transition-colors"
          >
            <Icon name="chevron_right" size={20} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-5 mb-5">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-moss/20">
          {current.artwork ? (
            <img src={current.artwork} alt={current.track} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--c-surface)" }}>
              <Icon name="album" size={40} className="text-muted" />
            </div>
          )}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] font-display font-700 text-white"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            #{currentIndex + 1}
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-2 py-0.5 rounded-tag border border-line bg-canvas/50 uppercase tracking-wide font-display font-600 text-muted">
              {region === "us" ? "US CHART" : "INDIA CHART"}
            </span>
            {current.genre && (
              <span className="text-[10px] px-2 py-0.5 rounded-tag border border-line text-muted font-display font-600">
                {current.genre}
              </span>
            )}
          </div>
          <p className="font-display font-800 text-lg truncate mb-1">{current.track}</p>
          <p className="text-sm text-muted mb-2 truncate">{current.artist}</p>
          <div className="flex items-center gap-3 mt-3">
            {current.url ? (
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-display font-600 uppercase tracking-wide rounded-tag text-white shrink-0 flex items-center gap-1"
                style={{ background: "var(--c-accent)" }}
              >
                <Icon name="play_arrow" size={16} /> Listen
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 overflow-hidden">
        {songs.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-moss" : "w-1.5 bg-line hover:bg-moss/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  const categories = [
    { key: "hindi", label: "Hindi", artists: ARTISTS.hindi.map(a => a.name) },
    { key: "english", label: "English", artists: ARTISTS.english.map(a => a.name) },
    { key: "kpop", label: "K-Pop", artists: ARTISTS.kpop.filter(a => a.type === "group").map(a => a.name) },
  ];

  if (step === 0) {
    return (
      <div className="max-w-md mx-auto text-center p-8 hangtag">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--c-accent)" }}>
          <Icon name="auto_awesome" size={28} className="text-white" />
        </div>
        <h1 className="font-display font-800 text-3xl mb-2">Welcome to Kuchupuchu</h1>
        <p className="text-muted text-sm mb-8">Music-powered outfit inspiration</p>
        <button
          onClick={() => setStep(1)}
          className="w-full py-3 rounded-tag font-display font-700 uppercase tracking-wide text-white"
          style={{ background: "var(--c-accent)" }}
        >
          Get Started
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto p-6 hangtag">
        <h2 className="font-display font-800 text-2xl mb-2 text-center">What's your vibe?</h2>
        <p className="text-muted text-sm text-center mb-6">Pick your favorite music categories</p>
        <div className="flex justify-center gap-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategories(prev => prev.includes(cat.key) ? prev.filter(c => c !== cat.key) : [...prev, cat.key])}
              className={`relative w-20 h-20 rounded-2xl transition-all flex flex-col items-center justify-center ${selectedCategories.includes(cat.key) ? "scale-110" : "opacity-60 hover:opacity-100"}`}
              style={{
                background: selectedCategories.includes(cat.key) ? CATEGORY_COLORS[cat.key].dot : "var(--c-surface)",
                border: `2px solid ${selectedCategories.includes(cat.key) ? CATEGORY_COLORS[cat.key].dot : "var(--c-border)"}`,
                color: selectedCategories.includes(cat.key) ? "white" : "var(--c-ink)",
              }}
            >
              <span className="text-3xl font-display font-800">{cat.key === "kpop" ? "K" : cat.key === "english" ? "E" : "H"}</span>
              <span className="text-xs font-display font-600 uppercase">{cat.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => selectedCategories.length > 0 && setStep(2)}
          disabled={selectedCategories.length === 0}
          className="w-full py-3 rounded-tag font-display font-700 uppercase tracking-wide text-white"
          style={{ background: selectedCategories.length > 0 ? "var(--c-accent)" : "var(--c-border)", opacity: selectedCategories.length > 0 ? 1 : 0.5 }}
        >
          Next: Pick Artists
        </button>
      </div>
    );
  }

  if (step === 2) {
    const allArtists = selectedCategories.flatMap(cat => ARTISTS[cat] || []);
    return (
      <div className="max-w-md mx-auto p-6 hangtag">
        <h2 className="font-display font-800 text-2xl mb-2 text-center">Pick your favorite artists</h2>
        <p className="text-muted text-sm text-center mb-6">Select 3+ for best recommendations</p>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {allArtists.map((artist) => {
            const cat = getArtistCategory(artist.id);
            return (
              <button
                key={`${artist.id}-${artist.type || "solo"}`}
                onClick={() => setSelectedArtists(prev => prev.includes(artist.id) ? prev.filter(a => a !== artist.id) : [...prev, artist.id])}
                className={`w-full flex items-center gap-3 p-3 rounded-tag border transition-all ${selectedArtists.includes(artist.id) ? "ring-2" : ""}`}
                style={{
                  borderColor: selectedArtists.includes(artist.id) ? getCategoryDot(getArtistCategory(artist.id)) : "var(--c-border)",
                  ringColor: getCategoryDot(getArtistCategory(artist.id)),
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-700"
                  style={{ background: getCategoryDot(getArtistCategory(artist.id)) }}>
                  {artist.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display font-700 text-sm">{artist.name}</p>
                  <p className="text-[11px] text-muted">{artist.type === "group" ? `${artist.members?.length} members` : "Solo artist"}</p>
                </div>
                <Icon name={selectedArtists.includes(artist.id) ? "check_circle" : "circle"} size={24} className="text-moss" />
              </button>
            );
          })}
        </div>
        <button
          onClick={() => selectedArtists.length >= 3 && onComplete(selectedCategories, selectedArtists)}
          disabled={selectedArtists.length < 3}
          className="w-full py-3 rounded-tag font-display font-700 uppercase tracking-wide text-white mt-6"
          style={{ background: selectedArtists.length >= 3 ? "var(--c-accent)" : "var(--c-border)", opacity: selectedArtists.length >= 3 ? 1 : 0.5 }}
        >
          {selectedArtists.length >= 3 ? "Finish Setup" : `Pick ${3 - selectedArtists.length} more artists`}
        </button>
      </div>
    );
  }

  return null;
}

export default function AIRecommendations() {
  const { activeCategory, setActiveCategory, initialised } = useCategory();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState("layout-1");
  const [selectedAngle, setSelectedAngle] = useState("angle-1");
  const [selectedFilter, setSelectedFilter] = useState("filter-1");
  const [openSections, setOpenSections] = useState({ layouts: false, angles: false, filters: false });
  const [userPrefs, setUserPrefs] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vestio_ai_prefs") || "{}");
      return !saved.categories?.length;
    } catch { return true; }
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!initialised) return;
    const saved = localStorage.getItem("vestio_ai_prefs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserPrefs(parsed);
        if (parsed.categories?.length) setActiveCategory(parsed.categories[0]);
        if (parsed.selectedLayout) setSelectedLayout(parsed.selectedLayout);
        if (parsed.selectedAngle) setSelectedAngle(parsed.selectedAngle);
        if (parsed.selectedFilter) setSelectedFilter(parsed.selectedFilter);
        if (parsed.selectedTrack) setSelectedTrack(parsed.selectedTrack);
      } catch (e) {}
    } else {
      setShowOnboarding(true);
    }
  }, [initialised]);

  const allArtists = useMemo(() => Object.values(ARTISTS).flat(), []);
  const { getArtistImage, getTrackImage, fetchTrackImage, fetchArtistImage } = useMusicImages(allArtists, []);

  function persistPrefs(extra) {
    const existing = JSON.parse(localStorage.getItem("vestio_ai_prefs") || "{}");
    localStorage.setItem("vestio_ai_prefs", JSON.stringify({ ...existing, ...extra }));
  }

  function handleOnboardingComplete(categories, artists) {
    const prefs = { categories, artists, onboardedAt: Date.now() };
    localStorage.setItem("vestio_ai_prefs", JSON.stringify(prefs));
    setUserPrefs(prefs);
    setShowOnboarding(false);
    setActiveCategory(categories[0]);
  }

  function handleArtistSelect(artist) {
    setSelectedArtist(artist);
    setSelectedTrack(null);
  }

  function handleTrackSelect(data) {
    setSelectedTrack(data);
    persistPrefs({ selectedTrack: data });
  }

  function handleBackToArtists() {
    setSelectedArtist(null);
    setSelectedTrack(null);
  }

  function handleSetLayout(id) { setSelectedLayout(id); persistPrefs({ selectedLayout: id }); }
  function handleSetAngle(id) { setSelectedAngle(id); persistPrefs({ selectedAngle: id }); }
  function handleSetFilter(id) { setSelectedFilter(id); persistPrefs({ selectedFilter: id }); }
  function toggleSection(section) { setOpenSections(prev => ({ ...prev, [section]: !prev[section] })); }

  function handleReset() {
    setSelectedTrack(null);
    setSelectedLayout("layout-1");
    setSelectedAngle("angle-1");
    setSelectedFilter("filter-1");
    setSearchQuery("");
    persistPrefs({ selectedTrack: null, selectedLayout: "layout-1", selectedAngle: "angle-1", selectedFilter: "filter-1" });
  }

  const currentArtists = useMemo(() => ARTISTS[activeCategory] || [], [activeCategory]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return currentArtists;
    const q = searchQuery.toLowerCase();
    return currentArtists.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.tracks?.some(t => t.toLowerCase().includes(q)) ||
      a.members?.some(m => m.name.toLowerCase().includes(q) || m.tracks?.some(t => t.toLowerCase().includes(q)))
    );
  }, [currentArtists, searchQuery]);

  const allTracks = useMemo(() => {
    const tracks = [];
    Object.values(ARTISTS).flat().forEach(artist => {
      if (artist.type === "group") {
        artist.groupTracks?.forEach(t => tracks.push({ track: t, artist: artist.name, category: getArtistCategory(artist.id) }));
        artist.members?.forEach(m => m.tracks?.forEach(t => tracks.push({ track: t, artist: `${m.name} (${artist.name})`, category: getArtistCategory(m.id) })));
      } else {
        artist.tracks?.forEach(t => tracks.push({ track: t, artist: artist.name, category: getArtistCategory(artist.id) }));
      }
    });
    return tracks;
  }, []);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTracks.filter(t => t.track.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
  }, [allTracks, searchQuery]);

  const handleSearchCategory = useCallback((cat) => {
    setActiveCategory(cat);
    setSelectedArtist(null);
    setSearchQuery("");
  }, []);

  if (showOnboarding || !userPrefs?.categories?.length) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} userPrefs={userPrefs} />;
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen relative pb-32">
      <div className="flex flex-col items-center justify-between mb-8 gap-4">
        <div className="text-center">
          <h1 className="font-display font-800 text-4xl">Kuchupuchu</h1>
          <p className="text-muted text-sm mt-1">Music-powered outfit ideas</p>
        </div>
      </div>

      <TrendingCarousel userCategories={userPrefs?.categories || ["english"]} />

      <div className="h-6" />

      {!selectedArtist ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArtists.map((artist, i) => (
            <ArtistCard
              key={`${activeCategory}-${i}`}
              artist={artist}
              category={activeCategory}
              onSelect={handleArtistSelect}
              isGroup={activeCategory === "kpop"}
              getArtistImage={getArtistImage}
              fetchArtistImage={fetchArtistImage}
            />
          ))}
          {filteredArtists.length === 0 && searchQuery && (
            <div className="col-span-full hangtag p-8 text-center">
              <Icon name="search_off" size={48} className="mx-auto text-muted mb-4" />
              <p className="font-display font-700 text-lg">No artists found</p>
              <p className="text-sm text-muted mt-1">Try a different search</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={handleBackToArtists} className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-2">
            <Icon name="arrow_back" size={18} /> Back to artists
          </button>

          {selectedArtist && (
            <>
              <div className="hangtag p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${getCategoryDot(activeCategory)}30` }}>
                    {getArtistImage(selectedArtist.name) ? (
                      <img src={getArtistImage(selectedArtist.name)} alt={selectedArtist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-display font-700 text-xl"
                        style={{ background: getCategoryDot(activeCategory) }}>
                        {selectedArtist.group ? selectedArtist.group.charAt(0) : selectedArtist.name?.split(" ")[0]?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-display font-800 text-xl">{selectedArtist.group || selectedArtist.name || "Unknown Artist"}</p>
                    <p className="text-sm text-muted">
                      {selectedArtist.group
                        ? `${selectedArtist.members?.length || 0} members · ${selectedArtist.groupTracks?.length || 0} group tracks`
                        : `${selectedArtist.tracks?.length || 0} tracks`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hangtag p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-800 text-base">Tracks</h3>
                  <span className="text-xs text-muted uppercase tracking-wide font-display font-600">
                    {(selectedArtist.group
                      ? (selectedArtist.groupTracks?.length || 0) + (selectedArtist.members?.reduce((sum, m) => sum + (m.tracks?.length || 0), 0) || 0)
                      : selectedArtist.tracks?.length || 0)} tracks
                  </span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(selectedArtist.group
                    ? [...(selectedArtist.groupTracks || []), ...selectedArtist.members.flatMap(m => m.tracks || [])]
                    : (selectedArtist.tracks || [])
                  ).map((track, i) => (
                    <TrackCard
                      key={`${selectedArtist.group || selectedArtist.name}-${i}`}
                      track={track}
                      artistName={selectedArtist.group || selectedArtist.name}
                      onSelect={handleTrackSelect}
                      category={activeCategory}
                      getTrackImage={getTrackImage}
                      fetchTrackImage={fetchTrackImage}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="h-8" />

      <AccordionSection title="Story Layouts" icon="auto_awesome" isOpen={openSections.layouts} onToggle={() => toggleSection("layouts")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STORY_LAYOUTS.map((layout) => (
            <LayoutCard key={layout.id} layout={layout} selected={selectedLayout === layout.id} onSelect={handleSetLayout} />
          ))}
        </div>
        <div className="mt-4 p-3 rounded-tag bg-surface border border-line">
          <p className="font-display font-600 text-sm mb-2">Selected: {STORY_LAYOUTS.find(l => l.id === selectedLayout)?.name}</p>
          <p className="text-sm text-muted">{STORY_LAYOUTS.find(l => l.id === selectedLayout)?.description}</p>
          <div className="mt-2 text-[11px] text-muted">
            Structure: {STORY_LAYOUTS.find(l => l.id === selectedLayout)?.structure.join(" → ")}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Photo Angles" icon="camera_alt" isOpen={openSections.angles} onToggle={() => toggleSection("angles")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WEARABLE_ANGLES.map((angle) => (
            <AngleCard key={angle.id} angle={angle} selected={selectedAngle === angle.id} onSelect={handleSetAngle} />
          ))}
        </div>
        <div className="mt-4 p-3 rounded-tag bg-surface border border-line">
          <p className="font-display font-600 text-sm mb-2">Selected: {WEARABLE_ANGLES.find(a => a.id === selectedAngle)?.name}</p>
          <p className="text-sm text-muted">{WEARABLE_ANGLES.find(a => a.id === selectedAngle)?.description}</p>
          <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
            <Icon name="lightbulb" size={12} /> {WEARABLE_ANGLES.find(a => a.id === selectedAngle)?.tip}
          </p>
        </div>
      </AccordionSection>

      <AccordionSection title="Photo Filters" icon="photo_filter" isOpen={openSections.filters} onToggle={() => toggleSection("filters")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FILTERS.map((filter) => (
            <FilterCard key={filter.id} filter={filter} selected={selectedFilter === filter.id} onSelect={handleSetFilter} />
          ))}
        </div>
        <div className="mt-4 p-3 rounded-tag bg-surface border border-line">
          <p className="font-display font-600 text-sm mb-2">Selected: {FILTERS.find(f => f.id === selectedFilter)?.name}</p>
          <p className="text-sm text-muted">{FILTERS.find(f => f.id === selectedFilter)?.vibe}</p>
          <p className="text-[11px] text-muted mt-1">Best for: {FILTERS.find(f => f.id === selectedFilter)?.bestFor.join(", ")}</p>
        </div>
      </AccordionSection>

      {selectedTrack && (
        <div className="mt-6 hangtag p-6 text-center">
          <p className="font-display font-700 text-xl mb-2">Ready to create?</p>
          <p className="text-sm text-muted mb-4">Pick your layout, angle & filter — then post!</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1"><Icon name="music_note" size={12} /> {selectedTrack.track}</span>
            <span className="flex items-center gap-1"><Icon name="auto_awesome" size={12} /> {STORY_LAYOUTS.find(l => l.id === selectedLayout)?.name}</span>
            <span className="flex items-center gap-1"><Icon name="camera_alt" size={12} /> {WEARABLE_ANGLES.find(a => a.id === selectedAngle)?.name}</span>
            <span className="flex items-center gap-1"><Icon name="photo_filter" size={12} /> {FILTERS.find(f => f.id === selectedFilter)?.name}</span>
          </div>
          <button onClick={handleReset} className="mt-4 px-4 py-2 rounded-tag border border-line font-display font-600 uppercase tracking-wide text-sm hover:bg-canvas transition-colors">
            <Icon name="refresh" size={14} className="mr-1" /> Reset
          </button>
        </div>
      )}

      {/* Open Instagram Stories */}
      <div className="mt-8 mb-24 hangtag p-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)" }}>
          <Icon name="camera" size={28} className="text-white" />
        </div>
        <h3 className="font-display font-800 text-lg mb-1">Post your story</h3>
        <p className="text-sm text-muted mb-5">Open Instagram Stories with your look</p>
        <button
          onClick={() => {
            const isAndroid = /android/i.test(navigator.userAgent);
            if (isAndroid) {
              window.location.href = "intent://camera#Intent;package=com.instagram.android;end";
            } else {
              window.open("instagram://camera", "_blank");
            }
          }}
          className="w-full py-3 rounded-tag font-display font-700 uppercase tracking-wide text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "var(--c-accent)" }}
        >
          <Icon name="open_in_new" size={18} /> Open Instagram Stories
</button>
      </div>
    </div>
  );
}
