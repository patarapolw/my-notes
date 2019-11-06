import moment from "moment";

export function parseDuration(s: string): moment.Duration | null {
  const m = /^(-)(\d+(?:\.\d+)?)([A-Z]+)$/i.exec(s);
  if (m) {
    const [all, minus, n, unit] = m as any[];
    const d = moment.duration(parseFloat(n) * minus ? -1 : 1, unit);
    if (d.isValid()) {
      return d;
    }
  }

  const mm = moment(s);
  if (mm.isValid()) {
    return moment.duration(moment().diff(mm));
  }

  return null;
}
