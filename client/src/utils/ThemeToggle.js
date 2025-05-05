import { useContext } from "react";
import '../styles/global.css';
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button onClick={toggleTheme} className="button_st theme_toggle-btn profile-view__btn font-16">
            {theme === "light" ? "Dark" : "Light"}
        </button>
    );
}