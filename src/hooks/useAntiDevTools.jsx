import { useEffect } from "react";

export default function useAntiDevTools() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => e.preventDefault();

    // Block common DevTools shortcuts
    const handleKeyDown = (e) => {
      console.log(e.key);
      if (
        e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) || (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        alert("Unauthorized Activity Found!");
      }
    };

    // Detect if DevTools is open
    const detectDevTools = () => {
      if (
        window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160
      ) {
        alert("Unauthorized Activity Found!");
        window.location.href = "/"; 
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    const interval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);
}
