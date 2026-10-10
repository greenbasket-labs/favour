// TEMPORARY DEMO PAGE
// News items, event examples, and notices below are illustrative only.
// Replace with school-approved announcements, real dates, and confirmed details before publication.

import Link from "next/link";

const demoNews = [
  {
    category: "School News",
    title: "Welcome to Our School News Page",
    description:
      "This sample announcement demonstrates where approved school updates and important news will appear.",
    dateLabel: "Example announcement",
  },
  {
    category: "Learning",
    title: "Celebrating Learning and Progress",
    description:
      "Use this space for confirmed updates about classroom activities, learning projects, and student achievements.",
    dateLabel: "Example announcement",
  },
];

const demoEvents = [
  {
    title: "School Community Day",
    description:
      "A sample event card for a school gathering or community activity.",
    dateLabel: "Date to be confirmed",
  },
  {
    title: "Sports and Activities Day",
    description:
      "A sample listing for sports, games, and other school activities.",
    dateLabel: "Date to be confirmed",
  },
  {
    title: "Parents and Teachers Meeting",
    description:
      "A sample listing for a future meeting with parents and guardians.",
    dateLabel: "Date to be confirmed",
  },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-emerald-800 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Favour Int&apos;l School, Masaka
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            News &amp; Events
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            School updates, community announcements, and activities for
            students, parents, and guardians.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-amber-300/70 bg-amber-100/10 px-3 py-1 text-sm text-amber-100">
            Temporary demonstration content — not official school announcements
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-emerald-900">
              Latest News
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              Example news cards showing where school-approved updates will
              appear. These are placeholders, not real announcements.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {demoNews.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-emerald-700">
                  {item.category}
                </p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {item.description}
                </p>
                <p className="mt-5 text-sm text-slate-500">{item.dateLabel}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-emerald-900">
              Upcoming Events
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              The example events below have no confirmed dates. Replace them
              with the school&apos;s actual calendar before publishing.
            </p>
          </div>
          <div className="space-y-4">
            {demoEvents.map((event) => (
              <article
                key={event.title}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {event.title}
                  </h3>
                  <p className="mt-2 leading-6 text-slate-600">
                    {event.description}
                  </p>
                </div>
                <span className="shrink-0 self-start rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800 sm:self-center">
                  {event.dateLabel}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-emerald-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-900">
            School Notices
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            This section is reserved for important notices to parents,
            guardians, and students. Add only verified information approved by
            the school, such as term dates, meeting notices, or changes to the
            school schedule.
          </p>
          <p className="mt-3 text-sm font-medium text-amber-800">
            Demo placeholder: no current official notices have been supplied.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-6">
          <Link
            href="/about"
            className="rounded-lg border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            About Our School
          </Link>
          <Link
            href="/academics"
            className="rounded-lg border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            Academics
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          School address: Riverside, Masaka
        </p>
      </div>
    </main>
  );
}
