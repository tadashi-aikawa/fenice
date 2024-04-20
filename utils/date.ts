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

export function ts2display(ts: string): string {
  const timestamp = Number(ts);

  const now = DateTime.now();
  const posted = DateTime.of(timestamp);

  const dow = toJapaneseDayOfWeek(posted);

  if (posted.equals(now, true)) {
    return `今日 ${posted.displayTimeWithoutSeconds}`;
  }

  if (posted.diffDays(now) === -1) {
    return `昨日 ${posted.displayTimeWithoutSeconds}`;
  }

  return `${posted.displayDate.replaceAll("-", "/")}(${dow}) ${posted.displayTimeWithoutSeconds}`;
}
