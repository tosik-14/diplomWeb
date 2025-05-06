import { useContext } from "react";
import '../styles/global.css';
import { ThemeContext } from "../../context/ThemeContext";

export default function ThemeToggle({ className }) {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button onClick={toggleTheme} className={className}>
            {theme === "light" ? "Dark" : "Light"}
        </button>
    );
}