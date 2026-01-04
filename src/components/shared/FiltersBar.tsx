import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTranslation } from "react-i18next";

type FiltersBarProps = {
  statusFilter: string;
  necessityFilter: string;
  sortByStatus: boolean;
  onStatusChange: (value: string) => void;
  onNecessityChange: (value: string) => void;
  onToggleSort: () => void;
};

export const FiltersBar = ({
  statusFilter,
  necessityFilter,
  sortByStatus,
  onStatusChange,
  onNecessityChange,
  onToggleSort,
}: FiltersBarProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
        <option value="all">{t("filters.all")}</option>
        <option value="pending">{t("filters.pending")}</option>
        <option value="done">{t("filters.done")}</option>
      </Select>
      <Select value={necessityFilter} onChange={(event) => onNecessityChange(event.target.value)}>
        <option value="all">{t("filters.allNeeds")}</option>
        <option value="high">{t("filters.high")}</option>
        <option value="medium">{t("filters.medium")}</option>
        <option value="low">{t("filters.low")}</option>
      </Select>
      <Button variant="secondary" size="sm" onClick={onToggleSort}>
        {sortByStatus ? t("filters.sortOn") : t("filters.sortOff")}
      </Button>
    </div>
  );
};
