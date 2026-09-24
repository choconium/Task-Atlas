(() => {
  const readLanguage = () => {
    try {
      return localStorage.getItem("atlas-lang") === "ja" ? "ja" : "en";
    } catch {
      return "en";
    }
  };

  let language = readLanguage();
  const toggle = document.getElementById("language");
  const description = document.getElementById("page-description");

  function render() {
    document.documentElement.lang = language;
    document.title = language === "ja" ? "このサイトについて · Task Atlas" : "What's this? · Task Atlas";
    toggle.textContent = language === "ja" ? "English" : "Japanese";
    description.content = language === "ja"
      ? "Physical AI Task Atlasの設計哲学。タスク探索、根拠、不確かさの扱いを紹介します。"
      : "The design philosophy behind Physical AI Task Atlas: task exploration, evidence, and uncertainty.";

    document.querySelectorAll("[data-copy-en]").forEach((node) => {
      const key = language === "ja" ? "copyJa" : "copyEn";
      const value = node.dataset[key];
      if (value) node.textContent = value;
    });
  }

  toggle.addEventListener("click", () => {
    language = language === "en" ? "ja" : "en";
    try {
      localStorage.setItem("atlas-lang", language);
    } catch {
      // Keep the toggle usable for this visit if storage is unavailable.
    }
    render();
  });

  render();
})();
