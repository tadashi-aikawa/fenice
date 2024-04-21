import { DateTime } from "owlelia";

function toJapaneseDayOfWeek(dateTime: DateTime): string {
  if (dateTime.isSunday) return "日";
  if (dateTime.isMonday) return "月";
  if (dateTime.isTuesday) return "火";
  if (dateTime.isWednesday) return "水";
  if (dateTime.isThursday) return "木";
  if (dateTime.isFriday) return "金";
  if (dateTime.isSaturday) return "土";
  return "??";
}

export function ts2display(
  ts: string,
  option?: { onlyDate?: boolean },
): string {
  const timestamp = Number(ts);

  const now = DateTime.now();
  const posted = DateTime.of(timestamp);

  const dow = toJapaneseDayOfWeek(posted);

  if (posted.equals(now, true)) {
    return option?.onlyDate
      ? "今日"
      : `今日 ${posted.displayTimeWithoutSeconds}`;
  }

  if (posted.diffDays(now) === -1) {
    return option?.onlyDate
      ? "昨日"
      : `昨日 ${posted.displayTimeWithoutSeconds}`;
  }

  return option?.onlyDate
    ? `${posted.displayDate.replaceAll("-", "/")}(${dow})`
    : `${posted.displayDate.replaceAll("-", "/")}(${dow}) ${posted.displayTimeWithoutSeconds}`;
}

export function ts2Divider(
  ts: string,
  preTs: string | undefined,
): string | null {
  const timestamp = Number(ts);
  const dt = DateTime.of(timestamp);

  const preTimestamp = preTs ? Number(preTs) : undefined;
  if (!preTimestamp) {
    return ts2display(ts, { onlyDate: true });
  }

  const preDt = DateTime.of(preTimestamp);
  if (preDt.day !== dt.day) {
    return ts2display(ts, { onlyDate: true });
  }

  return null;
}
