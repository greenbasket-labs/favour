import Link from "next/link";

const sections = [
  { title: "About Our School", description: "Our story, mission and values", href: "/about", icon: "✦" },
  { title: "Academics", description: "Classes, learning and curriculum", href: "/academics", icon: "▤" },
  { title: "News & Announcements", description: "School updates and important notices", href: "/news", icon: "◷" },
  { title: "Admissions", description: "How to apply and contact the school", href: "/admissions", icon: "✓" },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#f7faf8", color: "#18352b" }}>
      {/* TEMPORARY DEMO HOMEPAGE. Replace sample copy and stock photo with owner-approved
          information and an authorised school photo before launch. Some navigation pages are planned. */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e9e3", padding: "16px 24px" }}>
        <nav style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, color: "#176344" }}>
            <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "#eaf4ee", fontSize: 25 }}>✦</span>
            <span style={{ display: "grid", gap: 3 }}>
              <strong style={{ fontSize: 18, lineHeight: 1.2 }}>Favour Int&apos;l School, Masaka</strong>
              <span style={{ color: "#66786e", fontSize: 12 }}>Learning • Character • Excellence</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
            <Link href="/" style={{ color: "#176344", fontWeight: 700 }}>Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/academics">Academics</Link>
            <Link href="/admissions">Admissions</Link>
            <Link href="/news">News &amp; Events</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/login" style={{ background: "#176344", color: "#fff", padding: "10px 14px", borderRadius: 9, fontWeight: 700 }}>Portal Login</Link>
          </div>
        </nav>
      </header>

      <section style={{ background: "linear-gradient(120deg, #123f30 0%, #176344 58%, #2b8060 100%)", color: "#fff", overflow: "hidden" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", alignItems: "center", gap: 42 }}>
          <div>
            <p style={{ margin: "0 0 18px", color: "#c8ead7", fontSize: 12, fontWeight: 800, letterSpacing: ".14em" }}>WELCOME TO FAVOUR INT&apos;L SCHOOL, MASAKA</p>
            <h1 style={{ margin: "0 0 22px", maxWidth: 650, fontSize: "clamp(38px, 5vw, 62px)", lineHeight: 1.08, letterSpacing: "-.04em" }}>Building Bright Futures Through Quality Education</h1>
            <p style={{ margin: "0 0 28px", maxWidth: 560, color: "#e3f2e9", fontSize: 18, lineHeight: 1.8 }}>A welcoming place where learners can grow in knowledge, character and confidence.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/about" style={{ display: "inline-flex", padding: "13px 18px", borderRadius: 9, background: "#fff", color: "#123f30", fontWeight: 700 }}>Discover Our School</Link>
              <Link href="/login" style={{ display: "inline-flex", padding: "13px 18px", borderRadius: 9, border: "1px solid #b7d8c5", color: "#fff", fontWeight: 700 }}>Parent / Student Portal</Link>
            </div>
            <p style={{ margin: "22px 0 0", color: "#c8ead7", fontSize: 12 }}>TEMPORARY DEMONSTRATION CONTENT — pending approval by the school owner.</p>
          </div>
          <div>
            {/* TEMPORARY STOCK PHOTO: Replace with a photo supplied or authorised by the school. */}
            <div style={{ border: "5px solid rgba(255,255,255,.18)", borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.2)" }}>
              <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85" alt="Temporary demonstration photo of a school learning environment" style={{ display: "block", width: "100%", minHeight: 320, maxHeight: 460, objectFit: "cover" }} />
            </div>
            <p style={{ margin: "10px 0 0", color: "#d5e8dc", fontSize: 11 }}>Temporary stock photograph — to be replaced with an approved school photograph.</p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "58px 24px 72px" }}>
        <div style={{ maxWidth: 680, marginBottom: 28 }}>
          <p style={{ color: "#23805b", fontWeight: 800, margin: "0 0 10px", fontSize: 12, letterSpacing: ".14em" }}>GET TO KNOW US</p>
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(30px, 4vw, 42px)", letterSpacing: "-.03em" }}>Explore Favour Int&apos;l School</h2>
          <p style={{ margin: 0, color: "#66786e", lineHeight: 1.8 }}>TEMPORARY INTRODUCTION: Discover our school, learning approach, admissions information and community updates.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
          {sections.map((section) => (
            <Link key={section.title} href={section.href} style={{ display: "block", background: "#fff", border: "1px solid #e0e9e3", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(18,63,48,.04)" }}>
              <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: "#eaf4ee", color: "#176344", fontSize: 23, marginBottom: 18 }}>{section.icon}</span>
              <h3 style={{ margin: "0 0 9px", color: "#18352b", fontSize: 20 }}>{section.title}</h3>
              <p style={{ margin: 0, color: "#66786e", lineHeight: 1.7, fontSize: 14 }}>{section.description}</p>
              <span style={{ display: "inline-block", marginTop: 18, color: "#176344", fontWeight: 700, fontSize: 13 }}>Explore more →</span>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ background: "#123f30", color: "#fff", padding: "26px 24px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div><strong>Favour Int&apos;l School, Masaka</strong><p style={{ margin: "7px 0 0", color: "#d5e8dc", fontSize: 13 }}>Riverside, Masaka</p></div>
          <p style={{ margin: 0, color: "#d5e8dc", fontSize: 12, alignSelf: "end" }}>© {new Date().getFullYear()} Favour Int&apos;l School, Masaka · Temporary demonstration website</p>
        </div>
      </footer>
    </main>
  );
}
