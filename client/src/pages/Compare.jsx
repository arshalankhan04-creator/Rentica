import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import { useCompare } from '../context/CompareContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (p) =>
  p != null ? `₹${Number(p).toLocaleString('en-IN')}` : 'N/A';

const formatKm = (k) =>
  k != null ? `${Number(k).toLocaleString('en-IN')} km` : 'N/A';

const getImageUrl = (listing) => {
  if (!listing?.images || listing.images.length === 0) return null;
  const raw = listing.images[0];
  if (!raw) return null;
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  return `http://localhost:5000/${raw}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Winner logic (only Price / KM / Year — real data fields only) ────────────

const getWinner = (slots, field, better) => {
  const values = slots.map((l) => (l ? l[field] : null));
  const real = values.filter((v) => v != null && typeof v === 'number');
  if (real.length < 2) return null;
  return better === 'lower' ? Math.min(...real) : Math.max(...real);
};

// ─── Comparison Row ───────────────────────────────────────────────────────────

const CompareRow = ({ label, values, icon, winnerValue }) => (
  <div className="grid gap-px" style={{ gridTemplateColumns: `200px repeat(3, 1fr)` }}>
    <div className="flex items-center gap-2.5 px-5 py-4 bg-surface border-r border-border select-none">
      {icon && <span className="text-textSecondary">{icon}</span>}
      <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">{label}</span>
    </div>
    {values.map((val, i) => {
      const raw = val?.raw ?? null;
      const display = val?.display ?? 'N/A';
      const isWinner = winnerValue != null && raw != null && raw === winnerValue;
      return (
        <div
          key={i}
          className={`flex items-center justify-center px-4 py-4 border-r border-border last:border-r-0 text-sm font-semibold transition-colors ${
            isWinner ? 'bg-primary/8 text-primary font-bold' : 'bg-surface text-textPrimary'
          }`}
        >
          <span>{display}</span>
          {isWinner && (
            <span className="ml-1.5 text-[9px] font-bold text-primary bg-primary/15 rounded-full px-1.5 py-0.5 uppercase tracking-wider select-none">
              Best
            </span>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ label, icon }) => (
  <div className="col-span-full flex items-center gap-2 px-5 py-3 bg-background/60 border-y border-border select-none">
    {icon && <span className="text-primary">{icon}</span>}
    <span className="text-[11px] font-bold text-textSecondary uppercase tracking-widest">{label}</span>
  </div>
);

// ─── Vehicle Search Popover ────────────────────────────────────────────────────

const VehicleSearchPopover = ({ onSelect, excludeIds, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/listings', { params: { brand: query.trim(), sort: '-createdAt' } });
      setResults(res.data.filter((l) => !excludeIds.includes(l._id)));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-3 border-b border-border flex gap-2">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by brand (e.g. Toyota, Honda…)"
          className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary/50 transition-colors"
        />
        <Button onClick={handleSearch} variant="primary" size="sm" disabled={loading || !query.trim()} className="font-bold shrink-0">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </Button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {!searched && (
          <div className="py-8 text-center text-xs text-textSecondary font-semibold select-none">
            Type a brand name and press Search
          </div>
        )}
        {searched && results.length === 0 && !loading && (
          <div className="py-8 text-center text-xs text-textSecondary font-semibold select-none">
            No listings found for "{query}"
          </div>
        )}
        {results.map((listing) => {
          const img = getImageUrl(listing);
          return (
            <button
              key={listing._id}
              onClick={() => { onSelect(listing); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background border-b border-border/50 last:border-b-0 transition-colors cursor-pointer bg-transparent text-left"
            >
              <div className="w-12 h-9 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                {img ? (
                  <img src={img} alt={listing.brand} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                    <span className="text-white/30 text-[10px] font-bold uppercase">{listing.brand?.substring(0, 3)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-textPrimary truncate">{listing.year} {listing.brand} {listing.model}</div>
                <div className="text-[11px] text-textSecondary font-semibold mt-0.5">{formatPrice(listing.price)} · {listing.fuelType}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Empty Slot Card ──────────────────────────────────────────────────────────

const EmptySlot = ({ slotIndex, onAdd }) => {
  const [open, setOpen] = useState(false);
  const { slots } = useCompare();
  const excludeIds = slots.filter(Boolean).map((s) => s._id);

  return (
    <div className="relative flex flex-col">
      <div
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-3 h-[200px] border-2 border-dashed border-border/60 rounded-2xl cursor-pointer hover:border-primary/40 hover:bg-primary/3 transition-all group select-none"
      >
        <div className="w-12 h-12 rounded-full bg-muted/60 border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
          <svg className="w-6 h-6 text-textSecondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-textSecondary group-hover:text-primary transition-colors">Add a Car</p>
          <p className="text-[11px] text-textSecondary/60 font-semibold mt-0.5">Click to search and add</p>
        </div>
      </div>
      {open && (
        <VehicleSearchPopover
          excludeIds={excludeIds}
          onSelect={(listing) => { onAdd(slotIndex, listing); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

// ─── Selected Car Header Card ─────────────────────────────────────────────────

const SelectedCarHeader = ({ listing, slotIndex }) => {
  const { removeSlot, setSlot, slots } = useCompare();
  const [open, setOpen] = useState(false);
  const img = getImageUrl(listing);
  const excludeIds = slots.filter(Boolean).map((s) => s._id);

  return (
    <div className="relative flex flex-col">
      <div className="border border-border rounded-2xl overflow-hidden bg-surface shadow-sm">
        <div className="w-full h-[130px] relative overflow-hidden bg-background">
          {img ? (
            <img src={img} alt={listing.brand} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <span className="text-white/20 font-bold text-4xl uppercase tracking-widest select-none">
                {listing.brand?.substring(0, 3)}
              </span>
            </div>
          )}
          <button
            onClick={() => removeSlot(slotIndex)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center hover:bg-danger/80 transition-colors cursor-pointer focus:outline-none"
            aria-label="Remove"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3">
          <h4 className="text-sm font-bold text-textPrimary leading-tight truncate m-0">
            {listing.year} {listing.brand} {listing.model}
          </h4>
          <p className="text-xs text-textSecondary font-semibold mt-1 select-none">
            {listing.fuelType} · {listing.transmission}
          </p>
          <div className="flex gap-2 mt-2.5">
            <Link to={`/listings/${listing._id}`} className="flex-1 no-underline">
              <Button variant="flat" size="sm" fullWidth className="font-bold text-[11px] py-1.5">View Details</Button>
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="px-2 py-1.5 rounded-xl text-[11px] font-bold text-textSecondary hover:text-primary hover:bg-primary/8 border border-border transition-colors cursor-pointer bg-transparent shrink-0"
              title="Replace vehicle"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <VehicleSearchPopover
          excludeIds={excludeIds}
          onSelect={(newListing) => { setSlot(slotIndex, newListing); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

// ─── History Section ──────────────────────────────────────────────────────────

const HistorySection = () => {
  const { history, restoreSession, removeHistoryEntry, clearHistory } = useCompare();

  if (history.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-textPrimary m-0">Comparison History</h2>
          <p className="text-xs text-textSecondary font-semibold mt-1 m-0 select-none">
            Your previous vehicle comparisons — click Restore to revisit any session.
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs font-bold text-danger/70 hover:text-danger bg-transparent border border-dangerBorder/40 hover:border-dangerBorder rounded-xl px-3 py-1.5 transition-colors cursor-pointer shrink-0"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-3">
        {history.map((session, idx) => (
          <div
            key={idx}
            className="border border-border rounded-2xl bg-surface px-5 py-4 flex items-center gap-4 hover:border-border/80 transition-colors"
          >
            {/* Cars in session */}
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              {session.cars.map((car, ci) => {
                const img = getImageUrl(car);
                return (
                  <div key={ci} className="flex items-center gap-2">
                    {ci > 0 && (
                      <span className="text-textSecondary/30 font-bold text-sm select-none">vs</span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-7 rounded-lg overflow-hidden bg-muted border border-border/40 shrink-0">
                        {img ? (
                          <img src={img} alt={car.brand} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                            <span className="text-white/40 text-[8px] font-bold uppercase">{car.brand?.substring(0, 3)}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-textPrimary m-0 truncate leading-tight">
                          {car.year} {car.brand}
                        </p>
                        <p className="text-[10px] text-textSecondary font-semibold m-0 truncate">{car.model}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metadata + actions */}
            <div className="flex items-center gap-3 shrink-0">
              {session.savedAt && (
                <span className="text-[10px] text-textSecondary/60 font-semibold select-none hidden sm:block">
                  {formatDate(session.savedAt)}
                </span>
              )}
              <button
                onClick={() => restoreSession(session)}
                className="text-[11px] font-bold text-primary hover:text-primaryHover bg-primary/8 hover:bg-primary/15 border border-primary/20 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
              >
                Restore
              </button>
              <button
                onClick={() => removeHistoryEntry(idx)}
                className="text-textSecondary/50 hover:text-danger bg-transparent border-none cursor-pointer p-1 rounded-lg hover:bg-dangerLight/30 transition-colors focus:outline-none"
                aria-label="Remove from history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  price: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  km: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V12h6" /><circle cx="12" cy="12" r="10" /></svg>,
  year: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" /></svg>,
  fuel: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 18V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h13a1 1 0 001-1z" /></svg>,
  trans: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M2 12h4m12 0h4" /></svg>,
  trust: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  cond: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>,
  pred: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  risk: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
};

// ─── Main Compare Page ────────────────────────────────────────────────────────

const Compare = () => {
  const { slots, clearAll, setSlot, filledCount } = useCompare();

  const handleAdd = useCallback((index, listing) => setSlot(index, listing), [setSlot]);

  const priceWinner = getWinner(slots, 'price', 'lower');
  const kmWinner    = getWinner(slots, 'kmDriven', 'lower');
  const yearWinner  = getWinner(slots, 'year', 'higher');

  const makeVals = (field, fmt) =>
    slots.map((l) => ({
      raw:     l?.[field] ?? null,
      display: l ? (l[field] != null ? fmt(l[field]) : 'N/A') : '—',
    }));

  const naVals = slots.map((l) => ({ raw: null, display: l ? 'N/A' : '—' }));

  const priceVals = makeVals('price',        formatPrice);
  const kmVals    = makeVals('kmDriven',     formatKm);
  const yearVals  = makeVals('year',         (v) => String(v));
  const fuelVals  = makeVals('fuelType',     (v) => v);
  const transVals = makeVals('transmission', (v) => v);

  const condVals  = slots.map((l) => ({ raw: null, display: l ? (l.conditionScore    != null ? `${l.conditionScore}/100` : 'N/A') : '—' }));
  const trustVals = slots.map((l) => ({ raw: null, display: l ? (l.trustScore        != null ? `${l.trustScore}/100`    : 'N/A') : '—' }));
  const riskVals  = slots.map((l) => ({ raw: null, display: l ? (l.riskFlag          ?? 'N/A')                                  : '—' }));
  const predVals  = slots.map((l) => ({
    raw: null,
    display: l
      ? (l.predictedPriceMin != null && l.predictedPriceMax != null
          ? `${formatPrice(l.predictedPriceMin)} – ${formatPrice(l.predictedPriceMax)}`
          : 'N/A')
      : '—',
  }));

  const showTable = filledCount >= 2;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 select-none">Side-by-Side</p>
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary m-0 leading-tight">Compare Vehicles</h1>
            <p className="text-sm text-textSecondary font-semibold mt-2 select-none">
              Add up to 3 listings to compare specs and pricing side-by-side.
            </p>
          </div>
          {filledCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-bold text-danger hover:text-dangerHover bg-transparent border border-dangerBorder/50 hover:border-dangerBorder rounded-xl px-4 py-2 transition-colors cursor-pointer shrink-0"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Selector Row */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {slots.map((listing, i) =>
            listing ? (
              <SelectedCarHeader key={i} listing={listing} slotIndex={i} />
            ) : (
              <EmptySlot key={i} slotIndex={i} onAdd={handleAdd} />
            )
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {showTable ? (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Column headers */}
            <div className="grid border-b border-border bg-background" style={{ gridTemplateColumns: '200px repeat(3, 1fr)' }}>
              <div className="px-5 py-3.5 flex items-center select-none">
                <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Specification</span>
              </div>
              {slots.map((l, i) => (
                <div key={i} className="px-4 py-3.5 border-l border-border flex items-center justify-center">
                  {l ? (
                    <span className="text-xs font-bold text-textPrimary text-center leading-tight select-none">
                      {l.year} {l.brand} {l.model}
                    </span>
                  ) : (
                    <span className="text-xs text-textSecondary/30 font-semibold select-none">Empty slot</span>
                  )}
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionHeader label="Pricing & Overview" icon={Icon.price} />
            </div>
            <CompareRow label="Asking Price" values={priceVals} icon={Icon.price} winnerValue={priceWinner} />
            <CompareRow label="Year"         values={yearVals}  icon={Icon.year}  winnerValue={yearWinner}  />

            {/* Specs */}
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionHeader label="Specifications" icon={Icon.fuel} />
            </div>
            <CompareRow label="KM Driven"    values={kmVals}    icon={Icon.km}    winnerValue={kmWinner} />
            <CompareRow label="Fuel Type"    values={fuelVals}  icon={Icon.fuel}  winnerValue={null}     />
            <CompareRow label="Transmission" values={transVals} icon={Icon.trans} winnerValue={null}     />

            {/* AI — all N/A, no winner highlight */}
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionHeader label="AI Intelligence" icon={Icon.trust} />
            </div>
            <div className="grid" style={{ gridTemplateColumns: '200px repeat(3, 1fr)' }}>
              <div className="col-span-full px-5 py-2.5 bg-warningLight/30 border-b border-warningBorder/20 select-none">
                <p className="text-[10px] font-bold text-warning/70 m-0">
                  AI fields populate once the ML backend integration is complete.
                </p>
              </div>
            </div>
            <CompareRow label="Trust Score"     values={trustVals} icon={Icon.trust} winnerValue={null} />
            <CompareRow label="Risk Flag"       values={riskVals}  icon={Icon.risk}  winnerValue={null} />
            <CompareRow label="Condition Score" values={condVals}  icon={Icon.cond}  winnerValue={null} />
            <CompareRow label="Predicted Price" values={predVals}  icon={Icon.pred}  winnerValue={null} />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 select-none">
            <div className="w-3 h-3 rounded-sm bg-primary/15 border border-primary/30 shrink-0" />
            <span className="text-[11px] text-textSecondary font-semibold">
              Highlighted cells show best value per row: lowest price, lowest KM driven, newest year
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/50 rounded-2xl bg-surface/50">
            <div className="w-16 h-16 rounded-full bg-muted/60 border border-border flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-textSecondary/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-textPrimary m-0">Add at least 2 vehicles to compare</h3>
            <p className="text-sm text-textSecondary font-semibold mt-2 mb-6 max-w-sm">
              Select vehicles from the slots above, or click Compare on any car card while browsing.
            </p>
            <Link to="/browse" className="no-underline">
              <Button variant="primary" size="md" className="font-bold">Browse Listings</Button>
            </Link>
          </div>
        </div>
      )}

      {/* History Section */}
      <HistorySection />
    </div>
  );
};

export default Compare;
