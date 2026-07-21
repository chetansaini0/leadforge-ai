/** Build an "Add to Google Calendar" template link (no OAuth required). */
export function googleCalendarUrl(opts: {
  title: string;
  startsAt: Date;
  durationMins: number;
  details?: string;
  location?: string;
}): string {
  const start = toCalStamp(opts.startsAt);
  const end = toCalStamp(new Date(opts.startsAt.getTime() + opts.durationMins * 60_000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toCalStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function providerLocation(provider: string): string {
  switch (provider) {
    case "google_meet":
      return "Google Meet";
    case "zoom":
      return "Zoom";
    case "phone":
      return "Phone call";
    case "in_person":
      return "In person";
    default:
      return "";
  }
}
