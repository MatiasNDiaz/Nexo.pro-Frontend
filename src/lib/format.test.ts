import { describe, expect, it } from "vitest";
import { dayKey, formatDayHeading, formatListDate, formatTime } from "./format";

// 4 de noviembre de 2026, 10:00 en Córdoba (UTC-3).
const NOW = new Date("2026-11-04T13:00:00Z");

describe("fechas del chat (hora de Córdoba)", () => {
  it("usa el día de Córdoba aunque en UTC ya sea otro día", () => {
    // 23:30 del 3 en Córdoba = 02:30 del 4 en UTC.
    expect(dayKey("2026-11-04T02:30:00Z")).toBe("2026-11-03");
    expect(formatTime("2026-11-04T02:30:00Z")).toBe("23:30");
  });

  it("lista: hora si es de hoy, Ayer, día y mes, o con año si es de otro año", () => {
    expect(formatListDate("2026-11-04T12:05:00Z", NOW)).toBe("09:05");
    expect(formatListDate("2026-11-04T02:30:00Z", NOW)).toBe("Ayer");
    expect(formatListDate("2026-10-20T15:00:00Z", NOW)).toMatch(/^20 oct$/);
    expect(formatListDate("2025-12-20T15:00:00Z", NOW)).toMatch(/^20 dic 2025$/);
  });

  it("separadores de día: Hoy, Ayer y el día de la semana", () => {
    expect(formatDayHeading("2026-11-04T11:00:00Z", NOW)).toBe("Hoy");
    expect(formatDayHeading("2026-11-03T15:00:00Z", NOW)).toBe("Ayer");
    expect(formatDayHeading("2026-11-02T15:00:00Z", NOW)).toMatch(/^lunes, 2 de noviembre$/);
  });
});
