import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
}

function ImgLogo({ src, alt, className = 'w-6 h-6' }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(className, 'object-contain rounded-full')}
      loading="lazy"
    />
  );
}

// SVG fallbacks for networks without image files

export function PolygonLogo({ className = 'w-6 h-6' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#8247E5" />
      <path
        d="M21 11.5 16 8.75l-5 2.75v11l5 2.75 5-2.75v-11Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Network Logo mapping (image paths) ───────────────────────────────────────

const CHAIN_IMAGES: Record<string, string> = {
  base: '/images/chains/base.png',
  solana: '/images/chains/solana.png',
  tron: '/images/chains/tron.png',
  ethereum: '/images/chains/ethereum.png',
  arbitrum: '/images/chains/arbitrum.png',
  ton: '/images/chains/ton.png',
  bsc: '/images/chains/bsc.png',
  binance_smart_chain: '/images/chains/bsc.png',
  binance_smart: '/images/chains/bsc.png',
  binancesmartchain: '/images/chains/bsc.png',
  polygon: '/images/chains/polygon.png',
};

// ─── Asset logo mapping ────────────────────────────────────────────────────────

const ASSET_IMAGES: Record<string, string> = {
  USDT: '/images/assets/usdt.png',
  USDC: '/images/assets/usdc.png',
};

// ─── Normalisation ──────────────────────────────────────────────────────────────

function normalizeChain(chain: string): string {
  return chain
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/trc-?20/i, '')
    .replace(/_?chain_?/g, '')
    .replace(/^_+|_+$/g, '');
}

// ─── Components ────────────────────────────────────────────────────────────────

export function ChainLogo({ chain, className = 'w-6 h-6' }: { chain: string; className?: string }) {
  const key = normalizeChain(chain);

  // Prefer image
  const imgSrc = CHAIN_IMAGES[key] ?? CHAIN_IMAGES[key.replace(/_/g, '')];
  if (imgSrc) {
    return <ImgLogo src={imgSrc} alt={chain} className={className} />;
  }

  // Fallback: text initials
  return (
    <div
      className={cn(
        className,
        'rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500',
      )}
    >
      {chain.replace(/[()]/g, '').slice(0, 2).toUpperCase()}
    </div>
  );
}

export function AssetLogo({ symbol, className = 'w-5 h-5' }: { symbol: string; className?: string }) {
  const imgSrc = ASSET_IMAGES[symbol.toUpperCase()];
  if (imgSrc) {
    return <ImgLogo src={imgSrc} alt={symbol} className={className} />;
  }

  // Fallback: coloured circle with first letter
  return (
    <div
      className={cn(
        className,
        'rounded-full flex items-center justify-center text-[10px] font-bold',
        symbol.toUpperCase() === 'USDT' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700',
      )}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
