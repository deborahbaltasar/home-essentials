import { useState } from "react";
import type { ChecklistItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { Pencil, X, Save, Trash2 } from "lucide-react";

type ItemRowProps = {
  item: ChecklistItem;
  onToggle: (item: ChecklistItem) => void;
  onDelete: (item: ChecklistItem) => void;
  onRename: (item: ChecklistItem, name: string) => void;
  onChangeNecessity: (item: ChecklistItem, level: ChecklistItem["necessityLevel"]) => void;
};

export const ItemRow = ({
  item,
  onToggle,
  onDelete,
  onRename,
  onChangeNecessity,
}: ItemRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.name);
  const { t } = useTranslation();

  const necessityKey =
    item.necessityLevel === "high"
      ? "filters.high"
      : item.necessityLevel === "medium"
      ? "filters.medium"
      : "filters.low";

  const handleSave = () => {
    const name = draftName.trim();
    if (!name) return;
    onRename(item, name);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-start gap-3">
        <Checkbox
          checked={item.done}
          onChange={() => onToggle(item)}
          aria-label={t("misc.markDone")}
        />
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
              <Button size="sm" variant="secondary" onClick={handleSave} aria-label="Salvar item">
                <Save size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-sm font-medium ${item.done ? "line-through text-slate-400" : ""}`}>
                {item.name}
              </p>
              <Badge tone={item.necessityLevel}>{t(necessityKey)}</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={item.necessityLevel}
          onChange={(event) => onChangeNecessity(item, event.target.value as ChecklistItem["necessityLevel"])}
        >
          <option value="high">Muito necessario</option>
          <option value="medium">Medio necessario</option>
          <option value="low">Pouco necessario</option>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing((prev) => !prev)}
          aria-label={isEditing ? t("misc.cancelEdit") : t("misc.editItem")}
        >
          {isEditing ? <X size={16} /> : <Pencil size={16} />}
        </Button>
        <ConfirmDialog
          title={t("misc.removeItem")}
          description={t("misc.removeItemDesc")}
          confirmLabel={t("misc.removeItem")}
          onConfirm={() => onDelete(item)}
          trigger={
            <Button size="sm" variant="ghost" aria-label={t("misc.removeItem")}>
              <Trash2 size={16} />
            </Button>
          }
        />
      </div>
    </div>
  );
};
