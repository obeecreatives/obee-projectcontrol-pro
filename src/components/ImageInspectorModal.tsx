import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  X,
  Image as ImageIcon,
  Move,
  Info,
} from 'lucide-react';
import { extractGoogleDriveFileId } from '../utils/imageUtils';

interface ImageInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  originalUrl?: string;
  title?: string;
  klien?: string;
  status?: string;
  date?: string;
  assetLabel?: string;
}

export const ImageInspectorModal: React.FC<ImageInspectorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  originalUrl,
  title,
  klien,
  status,
  date,
  assetLabel,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // If this is a Google Drive image, we can fetch high-res version (w1600) for crystal clear inspecting
  const highResUrl = React.useMemo(() => {
    const raw = originalUrl || imageUrl;
    const fileId = extractGoogleDriveFileId(raw);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
    }
    return imageUrl;
  }, [imageUrl, originalUrl]);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsLoading(true);
      // Prevent background scrolling while inspector is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, Number((prev + 0.35).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, Number((prev - 0.35).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Double click toggles between 1x and 2x zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) {
      handleResetZoom();
    } else {
      setZoom(2.2);
    }
  };

  // Mouse wheel scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const next = Math.max(1, Math.min(4, Number((prev + delta).toFixed(2))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Dragging to pan around the image when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile/tablet pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Quick download helper
  const handleDownload = async () => {
    try {
      const res = await fetch(highResUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanTitle = (title || 'konten-aset').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${cleanTitle}-preview.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback
      window.open(originalUrl || imageUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/92 backdrop-blur-md select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Navigation & Toolbar Bar */}
      <div
        className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-950/90 border-b border-slate-800 text-white z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Metadata info */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[50%] sm:max-w-[40%]">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[280px]">
                {title || 'Pratinjau Detail Aset'}
              </h4>
              {klien && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium shrink-0">
                  {klien}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              {status && (
                <span className="text-emerald-400 font-medium">● {status}</span>
              )}
              {date && <span>📅 {date}</span>}
              {assetLabel && (
                <span className="hidden md:inline px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {assetLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Interactive Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 shadow-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className={`p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer ${
              zoom <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800'
            }`}
            title="Perkecil (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer min-w-[52px] text-center"
            title="Klik untuk reset ke 100% (0)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className={`p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer ${
              zoom >= 4 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800'
            }`}
            title="Perbesar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          <button
            type="button"
            onClick={handleResetZoom}
            className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              zoom === 1 ? 'opacity-50' : ''
            }`}
            title="Reset ke Ukuran Pas Layar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Unduh file gambar ini"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Unduh</span>
          </button>

          {(originalUrl || imageUrl) && (
            <a
              href={originalUrl || imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Buka tautan file asli di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Buka Asli</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-red-600/80 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer ml-1"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 flex items-center justify-center overflow-hidden ${
          zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        onClick={(e) => {
          // If clicked in empty background stage, close modal
          if (e.target === e.currentTarget && zoom === 1) {
            onClose();
          }
        }}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 z-0">
            <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Memuat resolusi tinggi...</span>
          </div>
        )}

        {/* Active Inspecting Image */}
        <img
          src={highResUrl}
          alt={title || 'Smart Image Inspector'}
          draggable={false}
          onDoubleClick={handleDoubleClick}
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            setIsLoading(false);
            // Fallback to basic imageUrl if high-res failed
            if (e.currentTarget.src !== imageUrl) {
              e.currentTarget.src = imageUrl;
            }
          }}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            transformOrigin: 'center center',
          }}
          className="max-h-[82vh] max-w-[92vw] w-auto object-contain rounded-lg shadow-2xl user-select-none pointer-events-auto"
        />

        {/* Zoom guidance banner when zoomed in */}
        {zoom > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-lg pointer-events-none animate-fadeIn">
            <Move className="w-3 h-3 text-red-400" />
            <span>Mode Telusur: Geser mouse untuk menjelajah detail • Klik 2x untuk reset</span>
          </div>
        )}
      </div>

      {/* Bottom Hint Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-950/90 border-t border-slate-800/80 text-[11px] text-slate-400 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="hidden sm:inline">
            Tips Admin: Klik 2x atau scroll roda mouse untuk zoom. Geser kursor untuk inspeksi detail foto/poster.
          </span>
          <span className="sm:hidden">
            Scroll atau cubit untuk zoom. Geser untuk inspeksi.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
            Esc: Tutup | +/-: Zoom | 0: Reset
          </span>
          <span className="text-slate-500 font-mono text-[10px]">
            Smart Image Inspector
          </span>
        </div>
      </div>
    </div>
  );
};
