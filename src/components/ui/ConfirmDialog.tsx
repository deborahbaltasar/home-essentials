import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  trigger: React.ReactNode;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  trigger,
  onConfirm,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const label = confirmLabel ?? t("misc.confirm");
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-soft">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-slate-500">
            {description}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">{t("misc.cancel")}</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="danger" onClick={onConfirm}>
                {label}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
