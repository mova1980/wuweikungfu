/* ---------------------------------------------------------------------------
 * Jalali (Shamsi) ⇄ Gregorian date utilities — jalaali algorithm (MIT).
 * No external dependency; used for the gallery date picker & display.
 * ------------------------------------------------------------------------- */

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function jalCal(jy: number) {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0, jump = 0, leap = 0, n = 0, i = 0;
  for (i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/** Gregorian → Jalali */
export function toJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const jdn = g2d(gy, gm, gd);
  let jy = d2g(jdn).gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(r.gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

/** Jalali → Gregorian */
export function fromJalali(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const r = jalCal(jy);
  return d2g(g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1);
}

export const J_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

/** days in a jalali month (robust — via day-difference) */
export function jMonthLen(jy: number, jm: number): number {
  const d = (y: number, m: number) => {
    if (m === 12) {
      const a = fromJalali(y, 12, 1);
      const b = fromJalali(y + 1, 1, 1);
      return g2d(b.gy, b.gm, b.gd) - g2d(a.gy, a.gm, a.gd);
    }
    const a = fromJalali(y, m, 1);
    const b = fromJalali(y, m + 1, 1);
    return g2d(b.gy, b.gm, b.gd) - g2d(a.gy, a.gm, a.gd);
  };
  return d(jy, jm);
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const toFaDigits = (s: string | number) => String(s).replace(/\d/g, (d) => FA_DIGITS[+d]);

/** ISO (YYYY-MM-DD) → Jalali parts (null if invalid/empty) */
export function isoToJalali(iso: string): { jy: number; jm: number; jd: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!m) return null;
  return toJalali(+m[1], +m[2], +m[3]);
}

/** ISO → "۲۰ شهریور ۱۴۰۵" (faDigits optional) */
export function formatJalali(iso: string, faNums = true): string {
  const j = isoToJalali(iso);
  if (!j) return "";
  const s = `${j.jd} ${J_MONTHS[j.jm - 1]} ${j.jy}`;
  return faNums ? toFaDigits(s) : s;
}

/** Jalali date → ISO string */
export function jalaliToISO(jy: number, jm: number, jd: number): string {
  const g = fromJalali(jy, jm, jd);
  return `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(2, "0")}`;
}

/** today as ISO */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** weekday index of jalali (jy,jm,1) with Saturday = 0 … Friday = 6 */
export function jMonthStartWeekday(jy: number, jm: number): number {
  const g = fromJalali(jy, jm, 1);
  const jsd = new Date(g.gy, g.gm - 1, g.gd).getDay(); // 0=Sunday
  return (jsd + 1) % 7;
}
