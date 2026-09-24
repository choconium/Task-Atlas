(() => {
  // Shares the explorer's language preference so both pages stay in sync.
  const readLanguage = () => {
    try {
      return localStorage.getItem("atlas-lang") === "ja" ? "ja" : "en";
    } catch {
      return "en";
    }
  };
  let language = readLanguage();
  const toggle = document.getElementById("language");

  function render() {
    document.documentElement.lang = language;
    toggle.textContent = language === "en" ? "Japanese" : "English";
    document.title =
      language === "ja" ? "はじめに · Task Atlas" : "Get started · Task Atlas";
    document.querySelectorAll("[data-copy-en]").forEach((node) => {
      const value = node.dataset[language === "ja" ? "copyJa" : "copyEn"];
      if (value) node.textContent = value;
    });
  }

  toggle.addEventListener("click", () => {
    language = language === "en" ? "ja" : "en";
    try {
      localStorage.setItem("atlas-lang", language);
    } catch {
      // The toggle still works for this visit without storage.
    }
    render();
  });

  render();
})();
