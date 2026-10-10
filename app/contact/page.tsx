// TEMPORARY DEMO PAGE
// Replace placeholder phone, email, office hours, and location details with
// information confirmed by Favour Int'l School.
// The contact form is a visual demo only and does not send messages.

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-emerald-800 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">
            Favour Int&apos;l School, Masaka
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            We welcome enquiries from parents, guardians, and members of our
            school community.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-amber-300/70 bg-amber-100/10 px-3 py-1 text-sm text-amber-100">
            Temporary contact details — confirmation pending
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-2">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">
              School Information
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              Contact details will be updated after the school confirms its
              official phone number, email address, and office hours.
            </p>
          </div>

          <div className="space-y-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">School Address</h3>
              <p className="mt-2 text-slate-600">Riverside, Masaka</p>
              <p className="mt-1 text-sm text-amber-800">
                Address details supplied so far; exact map location not yet
                confirmed.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Phone / WhatsApp</h3>
              <p className="mt-2 text-slate-600">
                Official number to be provided by the school.
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Temporary placeholder — no number published.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Email Address</h3>
              <p className="mt-2 text-slate-600">
                Official school email to be confirmed.
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Temporary placeholder — no email published.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Office Hours</h3>
              <p className="mt-2 text-slate-600">
                To be confirmed by the school.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-900">
            Send an Enquiry
          </h2>
          <p className="mt-2 leading-7 text-slate-600">
            This sample form shows the planned contact experience. It is not
            connected to a message service yet, so do not enter or submit real
            personal information.
          </p>

          <form className="mt-6 space-y-5">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-700">
                Parent&apos;s or Guardian&apos;s Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Example: Amina Musa"
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                placeholder="Phone number"
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium text-slate-700">
                Enquiry Topic
              </label>
              <select
                id="contact-subject"
                name="subject"
                disabled
                defaultValue=""
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
              >
                <option value="">Select an enquiry topic</option>
                <option value="admissions">Admissions</option>
                <option value="academics">Academics</option>
                <option value="general">General enquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                placeholder="Write your enquiry here"
                disabled
                className="w-full resize-y rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-slate-300 px-5 py-3 font-semibold text-slate-600"
            >
              Contact form setup pending
            </button>
            <p className="text-sm text-slate-500">
              Developer note: connect this form to a secure backend and test
              message delivery before enabling it.
            </p>
          </form>
        </section>
      </div>

      <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-6 pb-12">
        <Link
          href="/admissions"
          className="rounded-lg border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          Admissions
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
    </main>
  );
}
