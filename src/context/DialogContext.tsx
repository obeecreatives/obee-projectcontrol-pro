import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import {
  AlertTriangle,
  Trash2,
  HelpCircle,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  appName?: string; // defaults to 'obeecreatives'
  icon?: 'trash' | 'warning' | 'info' | 'help' | 'shield';
}

export interface AlertOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: DialogVariant;
  appName?: string;
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
  isAlertOnly?: boolean;
  resolve?: (value: boolean) => void;
}

interface DialogContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    message: '',
  });

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (typeof options === 'string') {
        const isDeleteAction =
          options.toLowerCase().includes('hapus') ||
          options.toLowerCase().includes('delete') ||
          options.toLowerCase().includes('reset');

        setDialog({
          isOpen: true,
          title: isDeleteAction ? 'Konfirmasi Penghapusan' : 'Konfirmasi Tindakan',
          message: options,
          confirmLabel: isDeleteAction ? 'Ya, Lanjutkan' : 'Ya, Setuju',
          cancelLabel: 'Batal',
          variant: isDeleteAction ? 'danger' : 'warning',
          appName: 'obeecreatives',
          isAlertOnly: false,
          resolve,
        });
      } else {
        setDialog({
          isOpen: true,
          title: options.title || (options.variant === 'danger' ? 'Konfirmasi Penghapusan' : 'Konfirmasi'),
          message: options.message,
          confirmLabel: options.confirmLabel || (options.variant === 'danger' ? 'Ya, Hapus' : 'Ya, Lanjutkan'),
          cancelLabel: options.cancelLabel || 'Batal',
          variant: options.variant || 'danger',
          appName: options.appName || 'obeecreatives',
          icon: options.icon,
          isAlertOnly: false,
          resolve,
        });
      }
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (typeof options === 'string') {
        const isError =
          options.toLowerCase().includes('gagal') ||
          options.toLowerCase().includes('tidak boleh') ||
          options.toLowerCase().includes('wajib') ||
          options.toLowerCase().includes('terlebih dahulu');

        setDialog({
          isOpen: true,
          title: isError ? 'Pemberitahuan Sistem' : 'Informasi Sistem',
          message: options,
          confirmLabel: 'Mengerti',
          variant: isError ? 'warning' : 'info',
          appName: 'obeecreatives',
          isAlertOnly: true,
          resolve: () => resolve(),
        });
      } else {
        setDialog({
          isOpen: true,
          title: options.title || 'Pemberitahuan Sistem',
          message: options.message,
          confirmLabel: options.confirmLabel || 'Mengerti',
          variant: options.variant || 'info',
          appName: options.appName || 'obeecreatives',
          isAlertOnly: true,
          resolve: () => resolve(),
        });
      }
    });
  }, []);

  const handleClose = (result: boolean) => {
    const res = dialog.resolve;
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (res) {
      res(result);
    }
  };

  const titleId = useId();
  const descId = useId();

  // Variant aesthetics
  const getVariantStyles = () => {
    switch (dialog.variant) {
      case 'danger':
        return {
          headerBg: 'from-rose-500/15 via-red-500/5 to-transparent',
          iconBg: 'bg-rose-500/15 text-rose-500 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40',
          confirmBtn: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-500/25 border-rose-500/30',
          badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300',
          IconComponent: dialog.icon === 'shield' ? ShieldAlert : Trash2,
        };
      case 'warning':
        return {
          headerBg: 'from-amber-500/15 via-orange-500/5 to-transparent',
          iconBg: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40',
          confirmBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 border-amber-500/30',
          badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300',
          IconComponent: AlertTriangle,
        };
      case 'success':
        return {
          headerBg: 'from-emerald-500/15 via-teal-500/5 to-transparent',
          iconBg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40',
          confirmBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 border-emerald-500/30',
          badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300',
          IconComponent: CheckCircle2,
        };
      case 'info':
      default:
        return {
          headerBg: 'from-indigo-500/15 via-blue-500/5 to-transparent',
          iconBg: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/40',
          confirmBtn: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25 border-indigo-500/30',
          badge: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300',
          IconComponent: Info,
        };
    }
  };

  const style = getVariantStyles();
  const Icon = style.IconComponent;
  const appDisplayName = dialog.appName || 'obeecreatives';

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Centered Modern Modal Dialog */}
      {dialog.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          {/* Backdrop with heavy blur */}
          <div
            onClick={() => handleClose(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/30 overflow-hidden z-10 transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient ambient header */}
            <div className={`h-24 bg-gradient-to-b ${style.headerBg} relative flex items-start justify-between px-6 pt-5`}>
              {/* App Identity Tag: obeecreatives says */}
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-100 font-mono">
                    {appDisplayName} <span className="font-normal text-slate-500 dark:text-slate-400">says</span>
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6 pt-0 relative">
              {/* Floating Icon avatar */}
              <div className="relative -mt-10 mb-4 flex items-center justify-between">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-md ${style.iconBg}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${style.badge}`}>
                  {dialog.variant === 'danger' ? 'Peringatan' : dialog.variant === 'warning' ? 'Perhatian' : 'Sistem'}
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-2 mb-6">
                <h3
                  id={titleId}
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
                >
                  {dialog.title}
                </h3>
                <div
                  id={descId}
                  className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80"
                >
                  {dialog.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {!dialog.isAlertOnly && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98]"
                  >
                    {dialog.cancelLabel || 'Batal'}
                  </button>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={() => handleClose(true)}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-[0.98] ${style.confirmBtn}`}
                >
                  {dialog.confirmLabel || 'Ya, Lanjutkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a DialogProvider');
  }
  return context;
};
