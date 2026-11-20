import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import CompareToast from '../components/CompareToast';

const CompareContext = createContext(null);

const LS_SLOTS   = 'rentica_compare_slots';
const LS_HISTORY = 'rentica_compare_history';
export const MAX_COMPARE = 3;
const MAX_HISTORY = 10;

// Minimal snapshot stored in history — includes all fields the compare table uses.
const toSnapshot = (listing) => ({
  _id:               listing._id,
  brand:             listing.brand,
  model:             listing.model,
  year:              listing.year,
  price:             listing.price,
  kmDriven:          listing.kmDriven,
  fuelType:          listing.fuelType,
  transmission:      listing.transmission,
  images:            listing.images ? [listing.images[0]] : [],
  trustScore:        listing.trustScore        ?? null,
  riskFlag:          listing.riskFlag          ?? null,
  conditionScore:    listing.conditionScore    ?? null,
  predictedPriceMin: listing.predictedPriceMin ?? null,
  predictedPriceMax: listing.predictedPriceMax ?? null,
});

export const CompareProvider = ({ children }) => {
  const [slots,   setSlots]   = useState([null, null, null]);
  const [history, setHistory] = useState([]);
  const [toast,   setToast]   = useState(null); // { type, listing }
  const timerRef = useRef(null);

  // ── Restore from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const savedSlots = JSON.parse(localStorage.getItem(LS_SLOTS) || 'null');
      if (Array.isArray(savedSlots) && savedSlots.length === 3) {
        setSlots(savedSlots);
      }
      const savedHistory = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
      if (Array.isArray(savedHistory)) setHistory(savedHistory);
    } catch (_) {}
  }, []);

  // ── Persist slots whenever they change ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_SLOTS, JSON.stringify(slots));
  }, [slots]);

  // ── Persist history whenever it changes ─────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  }, [history]);

  // ── Toast helpers ────────────────────────────────────────────────────────────
  const showToast = useCallback((info) => {
    setToast(info);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  // ── Core methods ─────────────────────────────────────────────────────────────

  const getId = (item) => (item ? (item._id || item.id || '').toString() : '');

  const isInCompare = useCallback(
    (listingId) => {
      if (!listingId) return false;
      const targetStr = listingId.toString();
      return slots.some((s) => s && getId(s) === targetStr);
    },
    [slots]
  );

  const addToCompare = useCallback((listing) => {
    if (!listing) return 'invalid';
    const targetId = getId(listing);
    // Already present
    if (slots.some((s) => s && getId(s) === targetId)) {
      showToast({ type: 'already_in', listing });
      return 'already_in';
    }
    // Full — reject
    const emptyIdx = slots.findIndex((s) => s === null);
    if (emptyIdx === -1) {
      showToast({ type: 'full', listing });
      return 'full';
    }
    // Add to first empty slot
    setSlots((prev) => {
      const next = [...prev];
      next[emptyIdx] = listing;
      return next;
    });
    showToast({ type: 'added', listing });
    return 'added';
  }, [slots, showToast]);

  const removeFromCompare = useCallback((listingOrId) => {
    if (!listingOrId) return;
    const targetStr = typeof listingOrId === 'object' ? getId(listingOrId) : listingOrId.toString();
    const existingListing = slots.find((s) => s && getId(s) === targetStr);

    setSlots((prev) => prev.map((s) => (s && getId(s) === targetStr ? null : s)));

    const targetListing = (typeof listingOrId === 'object' && listingOrId) ? listingOrId : existingListing;
    if (targetListing) {
      showToast({ type: 'removed', listing: targetListing });
    }
  }, [slots, showToast]);

  const toggleCompare = useCallback((listing) => {
    if (!listing) return;
    const targetId = getId(listing);
    if (slots.some((s) => s && getId(s) === targetId)) {
      removeFromCompare(targetId);
      showToast({ type: 'removed', listing });
    } else {
      addToCompare(listing);
    }
  }, [slots, addToCompare, removeFromCompare, showToast]);

  // Set a specific positional slot (used by Compare page search popover)
  const setSlot = useCallback((index, listing) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = listing;
      return next;
    });
  }, []);

  const removeSlot = useCallback((index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const filled = slots.filter(Boolean);
    if (filled.length >= 2) {
      const session = {
        savedAt: new Date().toISOString(),
        cars: filled.map(toSnapshot),
      };
      setHistory((prev) => [session, ...prev].slice(0, MAX_HISTORY));
    }
    setSlots([null, null, null]);
  }, [slots]);

  // Silently restore a history session into active slots
  const restoreSession = useCallback((session) => {
    const restored = [null, null, null];
    session.cars.forEach((car, i) => {
      if (i < MAX_COMPARE) restored[i] = car;
    });
    setSlots(restored);
  }, []);

  const removeHistoryEntry = useCallback((index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const filledCount = slots.filter(Boolean).length;

  return (
    <CompareContext.Provider value={{
      slots,
      history,
      toast,
      filledCount,
      addToCompare,
      toggleCompare,
      setSlot,
      removeFromCompare,
      removeSlot,
      clearAll,
      dismissToast,
      isInCompare,
      restoreSession,
      removeHistoryEntry,
      clearHistory,
      MAX_COMPARE,
    }}>
      {children}
      {toast && <CompareToast toast={toast} onDismiss={dismissToast} />}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);

