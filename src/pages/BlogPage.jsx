import { useEffect } from "react";
import { Icon, I } from "../lib/icons.jsx";
import { BLOG_POSTS } from "../lib/blogPosts.js";

function useMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content");
    if (meta) meta.setAttribute("content", description);
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc != null) meta.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}

const css = (accent) => `
*{box-sizing:border-box}
body{margin:0}
.lp{font-family:'Plus Jakarta Sans',sans-serif;background:#08080F;color:#EEEDF5;min-height:100vh;-webkit-font-smoothing:antialiased}
.lp-nav{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;max-width:1100px;margin:0 auto}
.lp-logo{display:flex;align-items:center;gap:0.6rem;font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:0.08em;background:linear-gradient(135deg,${accent.a1},${accent.a2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer}
.lp-logo-ph{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${accent.a1},${accent.a2});display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lp-btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.85rem;border:none;border-radius:10px;padding:0.7rem 1.3rem;cursor:pointer;transition:all .15s}
.lp-btn-ghost{background:#ffffff10;color:#EEEDF5;border:1px solid #ffffff18}
.lp-btn-ghost:hover{border-color:#ffffff35}
.lp-btn-pri{background:linear-gradient(135deg,${accent.a1},${accent.a2});color:#fff;box-shadow:0 8px 24px -8px ${accent.a1}80}
.blog-section{max-width:760px;margin:0 auto;padding:2.5rem 1.5rem 5rem}
.blog-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,6vw,3.2rem);letter-spacing:0.02em;margin-bottom:0.5rem}
.blog-sub{color:#8A8AA2;font-size:1rem;margin-bottom:2.5rem}
.blog-list{display:flex;flex-direction:column;gap:1.1rem}
.blog-card{background:#15151F;border:1px solid #ffffff10;border-radius:18px;padding:1.5rem;cursor:pointer;transition:border-color .2s,transform .2s}
.blog-card:hover{border-color:#ffffff28;transform:translateY(-2px)}
.blog-card-date{font-size:0.72rem;color:#8A8AA2;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.4rem}
.blog-card h2{font-size:1.2rem;margin:0 0 0.5rem}
.blog-card p{font-size:0.88rem;color:#8A8AA2;line-height:1.6;margin:0}
.blog-post-date{font-size:0.78rem;color:#8A8AA2;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.75rem}
.blog-body{font-size:0.95rem;line-height:1.85;color:#C7C7DA;white-space:pre-line}
.blog-body h2{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.02em;color:#EEEDF5;margin:2rem 0 0.75rem;white-space:normal}
.lp-foot{text-align:center;padding:2.5rem 1.5rem;color:#5A5A72;font-size:0.8rem;border-top:1px solid #ffffff0D;margin-top:1rem}
`;

function renderBody(content) {
  return content
    .trim()
    .split("\n\n")
    .map((block, i) => {
      if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
      if (block.startsWith("- ")) {
        const items = block.split("\n").map((l) => l.replace(/^-\s*/, ""));
        return (
          <ul key={i} style={{ margin: "0.5rem 0 1rem", paddingLeft: "1.3rem" }}>
            {items.map((it, j) => <li key={j} style={{ marginBottom: "0.35rem" }}>{it}</li>)}
          </ul>
        );
      }
      return <p key={i} style={{ margin: "0 0 1.1rem" }}>{block}</p>;
    });
}

function NavBar({ accent, onHome, onLogin, onRegister }) {
  return (
    <nav className="lp-nav">
      <div className="lp-logo" onClick={onHome}>
        <div className="lp-logo-ph"><svg width="18" height="18" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M 18 80 Q 18 48 48 48 Q 78 48 78 16" stroke="white" strokeWidth="7" strokeLinecap="round"/><circle cx="78" cy="16" r="13" fill="#F5C842"/><circle cx="78" cy="16" r="5" fill="#E8490F"/><circle cx="18" cy="80" r="13" fill="#1A1A1A" stroke="white" strokeWidth="2"/><path d="M 22 74.5 A 6.5 6.5 0 1 0 22 85.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/><line x1="11" y1="78" x2="20" y2="78" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="11" y1="82" x2="20" y2="82" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg></div>
        FlotaRentable
      </div>
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button className="lp-btn lp-btn-ghost" onClick={onLogin}>Acceder</button>
        <button className="lp-btn lp-btn-pri" onClick={onRegister}>Empezar gratis</button>
      </div>
    </nav>
  );
}

export function BlogPage({ accent, onHome, onLogin, onRegister, onOpenPost }) {
  useMeta(
    "Blog de FlotaRentable — Consejos para transportistas y empresas de flota",
    "Artículos sobre rentabilidad por kilómetro, ITV, fiscalidad y gestión de gastos para transportistas y empresas de transporte por carretera."
  );
  return (
    <div className="lp">
      <style>{css(accent)}</style>
      <NavBar accent={accent} onHome={onHome} onLogin={onLogin} onRegister={onRegister} />
      <section className="blog-section">
        <h1 className="blog-h1">Blog de FlotaRentable</h1>
        <p className="blog-sub">Consejos, normativa y trucos para transportistas y empresas de flota.</p>
        <div className="blog-list">
          {BLOG_POSTS.map((p) => (
            <div className="blog-card" key={p.slug} onClick={() => onOpenPost(p.slug)}>
              <div className="blog-card-date">{new Date(p.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</div>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="lp-foot">© {new Date().getFullYear()} FlotaRentable · Hecho para el transporte por carretera en España</footer>
    </div>
  );
}

export function BlogPostPage({ slug, accent, onHome, onLogin, onRegister, onBack, onOpenPost }) {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  useMeta(
    post ? `${post.title} — FlotaRentable` : "Artículo no encontrado — FlotaRentable",
    post ? post.description : "El artículo que buscas no existe."
  );
  if (!post) {
    return (
      <div className="lp">
        <style>{css(accent)}</style>
        <NavBar accent={accent} onHome={onHome} onLogin={onLogin} onRegister={onRegister} />
        <section className="blog-section">
          <h1 className="blog-h1">Artículo no encontrado</h1>
          <button className="lp-btn lp-btn-ghost" onClick={onBack}><Icon d={I.arrow} size={14} color="#EEEDF5" />Volver al blog</button>
        </section>
      </div>
    );
  }
  return (
    <div className="lp">
      <style>{css(accent)}</style>
      <NavBar accent={accent} onHome={onHome} onLogin={onLogin} onRegister={onRegister} />
      <section className="blog-section">
        <button className="lp-btn lp-btn-ghost" style={{ marginBottom: "1.5rem" }} onClick={onBack}>← Volver al blog</button>
        <h1 className="blog-h1">{post.title}</h1>
        <div className="blog-post-date">{new Date(post.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</div>
        <div className="blog-body">{renderBody(post.content)}</div>
        <div style={{ marginTop: "2.5rem", padding: "1.5rem", background: "#15151F", border: "1px solid #ffffff10", borderRadius: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 700, marginBottom: "0.75rem" }}>¿Quieres controlar la rentabilidad de tu flota?</div>
          <button className="lp-btn lp-btn-pri" onClick={onRegister}>Empezar 7 días gratis</button>
        </div>
        <div style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", letterSpacing: "0.02em", marginBottom: "1rem" }}>Sigue leyendo</h2>
          <div className="blog-list">
            {BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2).map((p) => (
              <div className="blog-card" key={p.slug} onClick={() => onOpenPost(p.slug)}>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="lp-foot">© {new Date().getFullYear()} FlotaRentable · Hecho para el transporte por carretera en España</footer>
    </div>
  );
}
