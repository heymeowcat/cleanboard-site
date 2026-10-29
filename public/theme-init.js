// Runs before first paint so a saved theme never flashes the wrong palette.
// Kept as a static file (not bundled) so it can be a synchronous head script
// under the strict `script-src 'self'` CSP.
(function () {
    var root = document.documentElement;
    root.classList.add("js");

    var stored = null;
    try {
        stored = localStorage.getItem("cleanboard-theme");
    } catch (error) {
        stored = null;
    }

    if (stored === "light" || stored === "dark") {
        root.setAttribute("data-theme", stored);
    }

    var dark =
        stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#07130e" : "#f7f4ea");
})();
