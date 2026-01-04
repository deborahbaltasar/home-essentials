import React, { createContext, useContext, useMemo, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
};

type ToastContextValue = {
  notify: (message: Omit<ToastMessage, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (message: Omit<ToastMessage, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...message, id }]);
  };

  const value = useMemo(() => ({ notify }), []);

  return (
    <Toast.Provider swipeDirection="right">
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          duration={4000}
          onOpenChange={(open) => {
            if (!open) {
              setToasts((prev) => prev.filter((item) => item.id !== toast.id));
            }
          }}
          className={cn(
            "toast-slide-in flex w-80 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
          )}
        >
          <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600">
            <CheckCircle2 size={16} />
          </div>
          <div className="flex flex-col gap-1">
            <Toast.Title className="text-sm font-semibold text-slate-900">
              {toast.title}
            </Toast.Title>
            {toast.description && (
              <Toast.Description className="text-xs text-slate-500">
                {toast.description}
              </Toast.Description>
            )}
          </div>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed right-6 top-6 z-50 flex flex-col gap-3" />
    </Toast.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
