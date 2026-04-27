// Renders longform body items: paragraphs, headings, lists, callouts, source cites, tables.

function LongformBody({ sections }) {
  return (
    <>
      {sections.map(sec => (
        <section key={sec.id} id={sec.id} className="longform-section">
          <h2>{sec.h}</h2>
          {sec.body.map((item, i) => {
            if (item.p)        return <p key={i}>{item.p}</p>;
            if (item.h3)       return <h3 key={i}>{item.h3}</h3>;
            if (item.ul)       return <ul key={i}>{item.ul.map((li, j) => <li key={j}>{li}</li>)}</ul>;
            if (item.callout)  return (
              <div key={i} className="callout">
                <div className="callout-label">{item.callout.label}</div>
                <p>{item.callout.text}</p>
              </div>
            );
            if (item.source)   return <div key={i} className="source-cite">{item.source}</div>;
            if (item.table)    return (
              <table key={i} className="framework-table">
                <thead><tr>{item.table.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                <tbody>{item.table.rows.map((row, j) => (
                  <tr key={j}>{row.map((c, k) => {
                    if (k === 0) return <td key={k} className="num serif">{c}</td>;
                    if (typeof c === "object") return <td key={k}><div className="arch-name">{c.name}</div><div className="arch-desc">{c.desc}</div></td>;
                    return <td key={k}>{c}</td>;
                  })}</tr>
                ))}</tbody>
              </table>
            );
            if (item.compTable) return (
              <div key={i} className="comparison-wrap">
                <table className="comparison-table">
                  <thead><tr>{item.compTable.head.map((h, j) => <th key={j}>{h}</th>)}</tr></thead>
                  <tbody>{item.compTable.rows.map((row, j) => (
                    <tr key={j}>{row.map((c, k) => <td key={k}>{c}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            );
            return null;
          })}
        </section>
      ))}
    </>
  );
}

function TOC({ items }) {
  return (
    <aside className="longform-toc">
      <div className="toc-title">In dit hoofdstuk</div>
      <ul className="toc-list">
        {items.map(it => <li key={it.id}><a href={`#${it.id}`}>{it.label}</a></li>)}
      </ul>
    </aside>
  );
}

window.LongformBody = LongformBody;
window.TOC = TOC;
