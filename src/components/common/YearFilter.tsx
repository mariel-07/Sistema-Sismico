import { Calendar, Filter, RotateCcw, Sparkles } from "lucide-react";

export interface YearFilterProps {
  selectedYear: string; // e.g. "2026", "2019", or "Todos"
  onYearChange: (year: string) => void;
  availableYears?: number[];
  showQuickPills?: boolean;
  itemCount?: number;
  label?: string;
  className?: string;
}

// Generate years from 2026 down to 1960
export const ALL_YEARS: number[] = Array.from(
  { length: 2026 - 1960 + 1 },
  (_, i) => 2026 - i
);

export const DEFAULT_YEAR = "2026";

export function getYearDateRange(year: string): { start?: string; end?: string } {
  if (!year || year === "Todos") return {};
  const y = parseInt(year, 10);
  if (Number.isNaN(y)) return {};
  return {
    start: `${y}-01-01T00:00:00.000Z`,
    end: `${y}-12-31T23:59:59.999Z`,
  };
}

export function filterItemsByYear<T>(
  items: T[],
  getDateString: (item: T) => string | undefined | null,
  year: string
): T[] {
  if (!year || year === "Todos") return items;
  return items.filter((item) => {
    const raw = getDateString(item);
    if (!raw) return false;
    // Extract 4-digit year from ISO string or locale string
    const match = raw.match(/\b(19\d\d|20\d\d)\b/);
    if (match) {
      return match[1] === year;
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getUTCFullYear().toString() === year;
    }
    return false;
  });
}

export default function YearFilter({
  selectedYear,
  onYearChange,
  availableYears = ALL_YEARS,
  showQuickPills = true,
  itemCount,
  label = "Filtrar por año:",
  className = "",
}: YearFilterProps) {
  // Common quick pills to easily jump between current/default 2026, 2025, and high-volume historic years (2019, 2018)
  const quickPills = ["2026", "2025", "2019", "2018", "Todos"];

  return (
    <div className={`year-filter-container ${className}`}>
      <div className="year-filter-header">
        <div className="year-filter-badge">
          <Calendar size={15} />
          <span>{label}</span>
          <strong>{selectedYear === "Todos" ? "Todos los años (1960–2026)" : selectedYear}</strong>
          {selectedYear === "2026" && (
            <span className="year-filter-default-tag" title="Año predeterminado">
              <Sparkles size={11} />
              Predeterminado
            </span>
          )}
        </div>

        <div className="year-filter-controls">
          <div className="year-select-wrapper">
            <Filter size={14} className="year-select-icon" />
            <select
              aria-label="Seleccionar año de los datos"
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="year-filter-select"
            >
              <option value="2026">2026 (Año Predeterminado)</option>
              <option value="Todos">Todos los años (1960 - 2026)</option>
              <optgroup label="Años Recientes">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </optgroup>
              <optgroup label="Catálogo Histórico Principal">
                <option value="2019">2019 (Alta densidad - 565 sismos)</option>
                <option value="2018">2018 (543 sismos)</option>
                <option value="2017">2017 (780 sismos)</option>
                <option value="2016">2016 (946 sismos)</option>
                <option value="2015">2015 (814 sismos)</option>
                <option value="2014">2014 (1,023 sismos)</option>
                <option value="2013">2013 (991 sismos)</option>
                <option value="2012">2012 (757 sismos)</option>
                <option value="2011">2011 (1,022 sismos)</option>
                <option value="2010">2010 (522 sismos)</option>
              </optgroup>
              <optgroup label="Histórico Completo (1960 - 2009)">
                {availableYears
                  .filter((y) => y < 2010)
                  .map((y) => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {selectedYear !== DEFAULT_YEAR && (
            <button
              type="button"
              className="year-filter-reset-btn"
              onClick={() => onYearChange(DEFAULT_YEAR)}
              title="Restablecer a 2026 predeterminado"
            >
              <RotateCcw size={13} />
              <span>2026</span>
            </button>
          )}
        </div>
      </div>

      {showQuickPills && (
        <div className="year-quick-pills">
          <span className="year-pills-label">Accesos rápidos:</span>
          {quickPills.map((pill) => {
            const isActive = selectedYear === pill;
            return (
              <button
                key={pill}
                type="button"
                className={`year-pill-btn ${isActive ? "active" : ""}`}
                onClick={() => onYearChange(pill)}
              >
                {pill === "Todos" ? "Todos los años" : pill}
                {pill === "2026" && <span className="pill-star">★</span>}
              </button>
            );
          })}

          {typeof itemCount === "number" && (
            <span className="year-filter-count-badge">
              {itemCount.toLocaleString("es-PE")} registros
            </span>
          )}
        </div>
      )}

      {selectedYear === "2026" && typeof itemCount === "number" && itemCount === 0 && (
        <div className="year-filter-info-hint">
          <span>
            ℹ️ Mostrando datos de <strong>2026</strong> (0 eventos en la base de datos). Puedes seleccionar <strong>2019</strong>, <strong>2018</strong> o <strong>"Todos los años"</strong> para consultar el catálogo histórico con más de 21,000 registros.
          </span>
        </div>
      )}
    </div>
  );
}
