// TEMPORARY DEMO PAGE
// Replace example academic information with details confirmed by Favour Int'l School.
// Do not treat the example subjects or academic structure below as official school information.

import Link from "next/link";

const sampleSubjects = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Social Studies",
];

export default function AcademicsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-emerald-800 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Favour Int&apos;l School, Masaka
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Academics
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            Supporting learning, building confidence, and helping every learner
            develop the knowledge and skills to grow.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-amber-300/70 bg-amber-100/10 px-3 py-1 text-sm text-amber-100">
            Temporary demonstration content — pending school confirmation
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
        <section>
          <h2 className="text-2xl font-bold text-emerald-900">
            Academic Levels
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            This section will list the classes and academic levels offered by
            the school once the school&apos;s official structure is confirmed.
          </p>
          <div className="mt-5 rounded-xl border border-dashed border-emerald-300 bg-white p-6">
            <p className="font-semibold text-slate-800">
              School class structure to be confirmed
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Demo placeholder. Replace with the actual classes and levels
              offered at Favour Int&apos;l School.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900">
            Teaching &amp; Learning
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Our sample academic overview highlights supportive teaching,
            regular practice, and the development of strong learning habits.
            This wording is for demonstration only and should be reviewed by
            the school before publication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900">
            Example Subjects
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            The subjects below are illustrative examples, not a confirmed
            curriculum for this school.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {sampleSubjects.map((subject) => (
              <li
                key={subject}
                className="rounded-xl border border-slate-200 bg-white px-5 py-4 font-medium shadow-sm"
              >
                {subject}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-emerald-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-900">
            Academic Excellence
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            We aim to present learning in a way that encourages curiosity,
            responsibility, and continuous improvement. Replace this sample
            statement with the school&apos;s approved academic goals and
            activities.
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
