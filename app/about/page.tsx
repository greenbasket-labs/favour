import Link from "next/link";

const values = [
  {
    title: "Discipline",
    description:
      "We encourage responsibility, positive habits and respect for others in and beyond the classroom.",
  },
  {
    title: "Integrity",
    description:
      "We model honesty, fairness and accountability in learning and in our relationships.",
  },
  {
    title: "Excellence",
    description:
      "We encourage every learner to develop their abilities, work hard and take pride in progress.",
  },
  {
    title: "Respect",
    description:
      "We aim to create a welcoming community where every learner, family and staff member is valued.",
  },
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f7faf8", color: "#18352b" }}>
      {/* TEMPORARY DEMO CONTENT: Replace this copy with information approved by
          the school owner. The statements below are examples, not verified facts. */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e0e9e3",
          padding: "18px 24px",
        }}
      >
        <nav
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ fontWeight: 800, fontSize: 20, color: "#176344" }}>
            Favour Int&apos;l School
          </Link>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/">Home</Link>
            <span aria-current="page" style={{ color: "#176344", fontWeight: 700 }}>
              About Us
            </span>
            <Link href="/login">Portal Login</Link>
          </div>
        </nav>
      </header>

      <section
        style={{
          background: "linear-gradient(135deg, #123f30 0%, #176344 60%, #2b8060 100%)",
          color: "#fff",
          padding: "76px 24px 72px",
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <p
            style={{
              margin: "0 0 14px",
              color: "#c8ead7",
              textTransform: "uppercase",
              letterSpacing: ".14em",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            Learning • Character • Excellence
          </p>
          <h1
            style={{
              maxWidth: 760,
              margin: "0 0 20px",
              fontSize: "clamp(38px, 6vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-.04em",
            }}
          >
            About Favour Int&apos;l School
          </h1>
          <p style={{ maxWidth: 720, margin: 0, color: "#e3f2e9", fontSize: 18, lineHeight: 1.8 }}>
            A welcoming place to learn, grow in confidence and build strong character.
          </p>
          <p style={{ marginTop: 18, color: "#c8ead7", fontSize: 12 }}>
            Temporary demonstration text — pending review by the school owner.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "52px 24px 72px" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <article style={{ background: "#fff", border: "1px solid #e0e9e3", borderRadius: 18, padding: 28 }}>
            <p style={{ color: "#23805b", fontWeight: 800, margin: "0 0 10px", fontSize: 12, letterSpacing: ".12em" }}>
              OUR STORY
            </p>
            <h2 style={{ margin: "0 0 14px", fontSize: 28 }}>A place to discover potential</h2>
            <p style={{ margin: 0, color: "#52665c", lineHeight: 1.8 }}>
              Favour Int&apos;l School is presented here as a learning community focused on helping
              children build knowledge, confidence and good character. We want every learner to
              feel encouraged to ask questions, explore ideas and keep improving.
            </p>
          </article>

          <article style={{ background: "#eaf4ee", border: "1px solid #d7e8dc", borderRadius: 18, padding: 28 }}>
            <p style={{ color: "#23805b", fontWeight: 800, margin: "0 0 10px", fontSize: 12, letterSpacing: ".12em" }}>
              OUR APPROACH
            </p>
            <h2 style={{ margin: "0 0 14px", fontSize: 28 }}>Learning with purpose</h2>
            <p style={{ margin: 0, color: "#52665c", lineHeight: 1.8 }}>
              Our demonstration vision is to show a school experience that balances classroom
              learning with responsibility, creativity, cooperation and care for others.
            </p>
          </article>
        </section>

        <section style={{ marginTop: 48 }}>
          <p style={{ color: "#23805b", fontWeight: 800, margin: "0 0 10px", fontSize: 12, letterSpacing: ".12em" }}>
            WHAT GUIDES US
          </p>
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(30px, 4vw, 42px)", letterSpacing: "-.03em" }}>
            Our mission and vision
          </h2>
          <p style={{ color: "#66786e", margin: "0 0 24px", lineHeight: 1.7 }}>
            Sample statements for this demonstration. The school owner should review and approve
            the final wording.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            <article style={{ background: "#fff", border: "1px solid #e0e9e3", borderRadius: 16, padding: 26 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 22 }}>Our Mission</h3>
              <p style={{ margin: 0, color: "#52665c", lineHeight: 1.8 }}>
                To provide a supportive learning environment where pupils develop knowledge,
                practical skills, confidence and strong moral character.
              </p>
            </article>
            <article style={{ background: "#fff", border: "1px solid #e0e9e3", borderRadius: 16, padding: 26 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 22 }}>Our Vision</h3>
              <p style={{ margin: 0, color: "#52665c", lineHeight: 1.8 }}>
                To nurture capable, thoughtful and responsible learners who are prepared to
                contribute positively to their communities and the wider world.
              </p>
            </article>
          </div>
        </section>

        <section style={{ marginTop: 48 }}>
          <p style={{ color: "#23805b", fontWeight: 800, margin: "0 0 10px", fontSize: 12, letterSpacing: ".12em" }}>
            OUR CORE VALUES
          </p>
          <h2 style={{ margin: "0 0 24px", fontSize: "clamp(30px, 4vw, 42px)", letterSpacing: "-.03em" }}>
            Values that shape our community
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {values.map((value) => (
              <article key={value.title} style={{ background: "#fff", border: "1px solid #e0e9e3", borderRadius: 16, padding: 22 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>{value.title}</h3>
                <p style={{ margin: 0, color: "#52665c", lineHeight: 1.75 }}>{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 52,
            padding: "30px 28px",
            background: "#123f30",
            color: "#fff",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>Be part of our school community</h2>
            <p style={{ margin: 0, color: "#d6e9de", lineHeight: 1.7 }}>
              Contact the school to learn more about admissions and the learning experience.
            </p>
          </div>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              padding: "12px 18px",
              borderRadius: 9,
              background: "#fff",
              color: "#123f30",
              fontWeight: 700,
            }}
          >
            Parent / Student Portal
          </Link>
        </section>

        <footer style={{ paddingTop: 28, color: "#66786e", fontSize: 13 }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Favour Int&apos;l School · Demonstration website content
          </p>
        </footer>
      </div>
    </main>
  );
}
