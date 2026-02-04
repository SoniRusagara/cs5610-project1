const projects = [
    {
      title: "AIbnb (SwiftUI + AI Voice Assistant)",
      description:
        "Airbnb-style iOS app featuring an AI voice assistant pipeline (mic → ASR → LLM → TTS).",
      tags: ["mobile"],
      link: "https://github.com/SoniRusagara/AIbnbClone",
    },
    {
      title: "Context-Aware RAG System",
      description:
        "Research-oriented retrieval-augmented generation prototype exploring document ingestion, vector search, and contextual querying. Repository is currently private due to ongoing research work.",
      tags: ["ai", "backend"],
      link: "https://github.com/SoniRusagara/context-aware-rag",
    },
    {
      title: "Better! App (iOS + Firebase + Apple Health)",
      description:
        "Group iOS fitness challenge app using Swift, where users challenge friends in step-count competitions. Integrated with Apple Health plus Firebase Auth/Realtime DB.",
      tags: ["mobile", "school"],
      link: "https://github.com/isabelcuddihy/BetterApp",
    },
  ];
  
  let activeTag = "all";
  
  function matchesFilters(project, searchText) {
    const text = (searchText || "").toLowerCase().trim();
  
    const matchesSearch =
      project.title.toLowerCase().includes(text) ||
      project.description.toLowerCase().includes(text);
  
    const matchesTag = activeTag === "all" || project.tags.includes(activeTag);
  
    return matchesSearch && matchesTag;
  }
  
  function renderProjects(searchText) {
    const grid = document.querySelector("#projectsGrid");
    if (!grid) return;
  
    const filtered = projects.filter((p) => matchesFilters(p, searchText));
  
    if (filtered.length === 0) {
      grid.innerHTML = `<p class="muted">No projects match your search/filter.</p>`;
      return;
    }
  
    grid.innerHTML = filtered
      .map(
        (p) => `
          <article class="card">
            <h3>${p.title}</h3>
            <p class="muted">${p.description}</p>
            <a href="${p.link}" target="_blank" rel="noopener noreferrer">Open</a>
            <ul class="card__tags">
              ${p.tags.map((t) => `<li class="tag">${t}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }
  
  function setActiveButton(buttons, activeBtn) {
    buttons.forEach((b) => b.classList.remove("is-active"));
    activeBtn.classList.add("is-active");
  }
  
  function wireUpFilters() {
    const searchEl = document.querySelector("#search");
    const buttons = Array.from(document.querySelectorAll(".filter-button"));
    const grid = document.querySelector("#projectsGrid");
    if (!searchEl || !grid || buttons.length === 0) return;
  

    const defaultBtn = buttons.find((b) => b.dataset.tag === "all") || buttons[0];
    activeTag = defaultBtn.dataset.tag || "all";
    setActiveButton(buttons, defaultBtn);
  
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTag = btn.dataset.tag || "all";
  
        setActiveButton(buttons, btn);

        renderProjects(searchEl.value);
      });
    });
  
    searchEl.addEventListener("input", () => renderProjects(searchEl.value));
    renderProjects("");
  }
  
  wireUpFilters();
  
