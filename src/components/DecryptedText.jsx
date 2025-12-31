import { useEffect, useState, useRef } from 'react';

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Removed special chars for cleaner look

const DecryptedText = ({ text, speed = 40, revealDelay = 500, className = "" }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDone, setIsDone] = useState(false);
    const iterations = useRef(0);

    useEffect(() => {
        let interval = null;

        // Reset
        setIsDone(false);
        iterations.current = 0;
        setDisplayText(text.split("").map(() => " ").join("")); // Start empty/hidden

        // Initial delay before revealing
        const startTimeout = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText(prev => {
                    const newText = text.split("").map((letter, index) => {
                        if (index < iterations.current) {
                            return text[index];
                        }
                        // Preserve spaces and newlines so word wrapping works!
                        if (text[index] === ' ' || text[index] === '\n') return text[index];

                        return letters[Math.floor(Math.random() * letters.length)];
                    }).join("");
                    return newText;
                });

                if (iterations.current >= text.length) {
                    setIsDone(true);
                    clearInterval(interval);
                    setDisplayText(text); // Ensure final text is exact
                }

                iterations.current += 1 / 2; // Smoother increment (was 1/3)
            }, speed);
        }, revealDelay);

        return () => {
            clearTimeout(startTimeout);
            if (interval) clearInterval(interval);
        };
    }, [text, speed, revealDelay]);

    return (
        <span className={`${className} transition-opacity duration-300 ${isDone ? 'opacity-100' : 'opacity-80 font-mono text-green-400'}`}>
            {displayText}
        </span>
    );
};

export default DecryptedText;
