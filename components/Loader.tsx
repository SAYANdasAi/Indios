function Loader() {
    return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
                <svg width="400" height="100" viewBox="0 0 400 100" className="[&>text]:animate-stroke">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dc2626" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                        <filter id="rounded">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="rounded" />
                            <feBlend in="SourceGraphic" in2="rounded" />
                        </filter>
                    </defs>
                    {["I", "N", "D", "I", "O", "S"].map((letter, index) => (
                        <text
                            key={index}
                            x={45 + (index * 60)}
                            y="60"
                            fontSize="48"
                            fontFamily="Arial Black, sans-serif"
                            fontWeight="bold"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="2"
                            filter="url(#rounded)"
                            style={{
                                animationDelay: `${index * 0.3}s`,
                            }}
                        >
                            {letter}
                        </text>
                    ))}
                </svg>
            </div>
        </div>
    );
}

export default Loader;