// TEMPORARY DEMO PAGE
// Admission steps, requirements, fees, and policies below are illustrative only.
// Replace them with information officially confirmed by Favour Int'l School before publication.

import Link from "next/link";

const applicationSteps = [
  {
    number: "01",
    title: "Contact the School",
    description:
      "Contact the school office to ask about admission availability and the classes offered.",
  },
  {
    number: "02",
    title: "Confirm Requirements",
    description:
      "Ask the school which documents and information are required for the intended class.",
  },
  {
    number: "03",
    title: "Follow Admission Instructions",
    description:
      "Obtain the official application process and follow the instructions provided by the school.",
  },
];

export default function AdmissionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-emerald-800 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Favour Int&apos;l School, Masaka
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Admissions
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            Thank you for considering Favour Int&apos;l School. This page
            demonstrates how families will find admission information.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-amber-300/70 bg-amber-100/10 px-3 py-1 text-sm text-amber-100">
            Temporary demonstration content — admission details need confirmation
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section>
          <h2 className="text-2xl font-bold text-emerald-900">
            Welcome to Admissions
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Parents and guardians can use this page to learn how to enquire
            about enrolling a child. Please contact the school directly for
            current availability and official admission instructions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900">How to Apply</h2>
          <p className="mt-2 leading-7 text-slate-600">
            The following are general example steps for this demonstration,
            not the school&apos;s confirmed admission procedure.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {applicationSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-bold tracking-widest text-emerald-700">
                  STEP {step.number}
                </p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-900">
            Admission Requirements
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            The school&apos;s official requirements have not yet been provided.
            Contact the school before preparing or submitting documents.
          </p>
          <div className="mt-5 rounded-xl border border-dashed border-amber-400 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">
              Placeholder — requirements to be confirmed
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Add the approved document checklist, age or class eligibility
              rules, assessment requirements, and any other conditions only
              after the school confirms them.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-emerald-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-900">
            Fees and Payment Information
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            No school fees or payment terms have been supplied for this demo.
            Please contact the school for its current, approved fee schedule
            and payment instructions.
          </p>
          <p className="mt-3 text-sm font-semibold text-amber-800">
            Temporary notice: do not treat this page as an official fee
            schedule.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-emerald-900">
            Have an Admission Enquiry?
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Visit the Contact Us page for the school&apos;s currently available
            contact information. Phone number, email, and office hours remain
            unconfirmed.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900"
          >
            Contact the School
          </Link>
        </section>

        <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-6">
          <Link
            href="/academics"
            className="rounded-lg border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
          >
            Academics
          </Link>
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
