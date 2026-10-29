/**
 * Inline, render-blocking script that applies the saved theme before first
 * paint, preventing a flash of the wrong theme. Reads the persisted choice and
 * sets data-theme; when none is saved it leaves the attribute off so the OS
 * `prefers-color-scheme` wins (see tokens.css).
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
