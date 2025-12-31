
const ShinyText = ({ text, disabled = false, speed = 3, className = "" }) => {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={`relative inline-block overflow-hidden ${className}`}
            style={{
                backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                display: 'inline-block',
                color: '#1db954', // Spotify Green base
                WebkitTextFillColor: 'transparent',
                animation: `shine ${speed}s linear infinite`
            }}
        >
            {text}
            <style>
                {`
                @keyframes shine {
                    0% { background-position: 100%; }
                    100% { background-position: -100%; }
                }
            `}
            </style>
        </div>
    );
};

export default ShinyText;
