import { useEffect, useMemo, useState } from "react";

const getUserName = (entry) =>
  entry?.userName ||
  entry?.UserName ||
  entry?.user?.name ||
  entry?.user?.fullName ||
  entry?.borrowerName ||
  entry?.BorrowerName ||
  entry?.borrowerId ||
  entry?.BorrowerId ||
  "Okänd användare";

const getItemName = (entry) => entry?.itemName || entry?.ItemName || "Okänt item";
const getItemId = (entry) => entry?.itemId ?? entry?.ItemId ?? null;
const getTotalLoans = (entry) => entry?.totalLoans ?? entry?.TotalLoans ?? 0;
const getLateReturns = (entry) => entry?.lateReturns ?? entry?.LateReturns ?? 0;

const formatDateTime = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeLoanPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getLoanState = (loan) => {
  const dueAt = loan?.dueAt ? new Date(loan.dueAt) : null;
  const returnedAt = loan?.returnedAt ? new Date(loan.returnedAt) : null;
  const now = new Date();

  if (returnedAt) {
    if (dueAt && returnedAt > dueAt) {
      return {
        label: "Återlämnad sent",
        className: "status-late",
        extra: `Borde återlämnats: ${formatDateTime(loan?.dueAt)}`,
      };
    }

    return {
      label: "Återlämnad i tid",
      className: "status-ok",
      extra: `Återlämnad: ${formatDateTime(loan?.returnedAt)}`,
    };
  }

  if (dueAt && now > dueAt) {
    return {
      label: "Försenad",
      className: "status-late",
      extra: `Borde återlämnats: ${formatDateTime(loan?.dueAt)}`,
    };
  }

  return {
    label: "Aktiv",
    className: "status-ok",
    extra: `Förväntad återlämning: ${formatDateTime(loan?.dueAt)}`,
  };
};

function StatsCards({ data }) {
  const [groupBy, setGroupBy] = useState("item");
  const [selectedValue, setSelectedValue] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const [selectedCard, setSelectedCard] = useState(null);
  const [loanDetails, setLoanDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const selectableValues = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return [
      ...new Set(
        data.map((entry) => (groupBy === "user" ? getUserName(entry) : getItemName(entry))),
      ),
    ]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "sv", { sensitivity: "base" }));
  }, [data, groupBy]);

  useEffect(() => {
    setSelectedValue("all");
  }, [groupBy]);

  useEffect(() => {
    if (!selectedCard) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedCard(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCard]);

  const visibleRows = useMemo(() => {
    if (!Array.isArray(data)) return [];

    if (selectedValue === "all") {
      return [...data];
    }

    return data.filter((entry) => {
      const value = groupBy === "user" ? getUserName(entry) : getItemName(entry);
      return value === selectedValue;
    });
  }, [data, groupBy, selectedValue]);

  const visibleCards = useMemo(() => {
    const groupedItems = new Map();

    visibleRows.forEach((entry) => {
      const itemId = getItemId(entry);
      const key = itemId !== null ? String(itemId) : getItemName(entry);

      if (!groupedItems.has(key)) {
        groupedItems.set(key, {
          id: entry?.id ?? entry?.Id ?? key,
          itemId,
          itemName: getItemName(entry),
          totalLoans: 0,
          lateReturns: 0,
          users: new Set(),
        });
      }

      const current = groupedItems.get(key);
      current.totalLoans += getTotalLoans(entry);
      current.lateReturns += getLateReturns(entry);
      current.users.add(getUserName(entry));
    });

    const cards = Array.from(groupedItems.values()).map((item) => ({
      id: item.id,
      itemId: item.itemId,
      itemName: item.itemName,
      totalLoans: item.totalLoans,
      lateReturns: item.lateReturns,
      userCount: item.users.size,
    }));

    cards.sort((a, b) =>
      a.itemName.localeCompare(b.itemName, "sv", { sensitivity: "base" }),
    );

    return sortOrder === "desc" ? cards.reverse() : cards;
  }, [visibleRows, sortOrder]);

  const openDetails = async (card) => {
    setSelectedCard(card);
    setDetailsLoading(true);
    setDetailsError("");
    setLoanDetails([]);

    if (card.itemId === null || card.itemId === undefined) {
      setDetailsError("Det saknas ItemId för detta kort, så lånedetaljer kan inte hämtas.");
      setDetailsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5125/api/loans?itemId=${encodeURIComponent(card.itemId)}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizeLoanPayload(payload).sort(
        (a, b) => new Date(b?.loanedAt || 0) - new Date(a?.loanedAt || 0),
      );

      setLoanDetails(normalized);
    } catch (error) {
      console.error("Fel vid hämtning av lånedetaljer:", error);
      setDetailsError("Kunde inte hämta lånedetaljer från Loans-tabellen just nu.");
    } finally {
      setDetailsLoading(false);
    }
  };

  if (visibleCards.length === 0) {
    return <p>Ingen statistik att visa i korten.</p>;
  }

  return (
    <>
      <div className="cards-toolbar">
        <label className="cards-control">
          <span>Visa efter</span>
          <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
            <option value="item">Item</option>
            <option value="user">Användare</option>
          </select>
        </label>

        <label className="cards-control">
          <span>Välj i listan</span>
          <select
            value={selectedValue}
            onChange={(event) => setSelectedValue(event.target.value)}
          >
            <option value="all">Alla</option>
            {selectableValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="cards-control">
          <span>Ordning</span>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="asc">A-Ö</option>
            <option value="desc">Ö-A</option>
          </select>
        </label>
      </div>

      <section className="stats-grid">
        {visibleCards.map((item, index) => (
          <button
            type="button"
            className={`stat-card stat-card-button ${item.lateReturns > 0 ? "late-card" : "normal-card"}`}
            key={item.id ?? `${item.itemName}-${index}`}
            onClick={() => openDetails(item)}
          >
            <h3>{item.itemName}</h3>
            <p>
              Antal användare: <span className="badge">{item.userCount}</span>
            </p>
            <p>
              Totalt antal lån: <span className="badge">{item.totalLoans}</span>
            </p>
            <p>
              Totalt sena återlämningar: <span className="badge late">{item.lateReturns}</span>
            </p>
            <p className={item.lateReturns > 0 ? "status status-late" : "status status-ok"}>
              {item.lateReturns > 0 ? "Har sena återlämningar" : "Inga sena återlämningar"}
            </p>
          </button>
        ))}
      </section>

      {selectedCard && (
        <div className="overlay-backdrop" onClick={() => setSelectedCard(null)}>
          <section
            className="overlay-card"
            role="dialog"
            aria-modal="true"
            aria-label={`Lånedetaljer för ${selectedCard.itemName}`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="overlay-header">
              <div>
                <h3>{selectedCard.itemName}</h3>
                <p>Detaljer från Loans-tabellen</p>
              </div>
              <button
                type="button"
                className="overlay-close"
                onClick={() => setSelectedCard(null)}
                aria-label="Stäng"
              >
                ×
              </button>
            </header>

            {detailsLoading && <p className="overlay-message">Hämtar lånedetaljer...</p>}

            {!detailsLoading && detailsError && (
              <p className="overlay-message overlay-error">{detailsError}</p>
            )}

            {!detailsLoading && !detailsError && loanDetails.length === 0 && (
              <p className="overlay-message">
                Inga lånerader hittades för detta item i Loans-tabellen.
              </p>
            )}

            {!detailsLoading && !detailsError && loanDetails.length > 0 && (
              <div className="overlay-loan-list">
                {loanDetails.map((loan) => {
                  const state = getLoanState(loan);
                  return (
                    <article className="overlay-loan-row" key={loan?.id}>
                      <div className="overlay-loan-top">
                        <strong>{loan?.borrowerId || "Okänd användare"}</strong>
                        <span className={`status ${state.className}`}>{state.label}</span>
                      </div>

                      <p>
                        Lånades: <strong>{formatDateTime(loan?.loanedAt)}</strong>
                      </p>
                      <p>{state.extra}</p>
                      {loan?.returnedAt && <p>Faktiskt återlämnad: {formatDateTime(loan.returnedAt)}</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default StatsCards;