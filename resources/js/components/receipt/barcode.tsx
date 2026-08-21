import React from 'react';

const CODE39_PATTERNS: Record<string, string> = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
    '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
};

interface BarcodeProps {
    value: string;
    height?: number;
    narrowWidth?: number;
    wideWidth?: number;
    className?: string;
    showText?: boolean;
}

export default function Barcode({
    value,
    height = 42,
    narrowWidth = 1.4,
    wideWidth = 3.2,
    className = '',
    showText = true,
}: BarcodeProps) {
    const raw = (value || '00000000').toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '');
    const cleanValue = raw.length > 0 ? raw : '00000000';
    const encodedString = `*${cleanValue}*`;

    let currentX = 0;
    const rects: { x: number; width: number }[] = [];

    for (let c = 0; c < encodedString.length; c++) {
        const char = encodedString[c];
        const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['0'];

        for (let i = 0; i < 9; i++) {
            const isBar = i % 2 === 0;
            const isWide = pattern[i] === '1';
            const width = isWide ? wideWidth : narrowWidth;

            if (isBar) {
                rects.push({ x: currentX, width });
            }
            currentX += width;
        }

        // Inter-character space gap
        currentX += narrowWidth;
    }

    const totalWidth = Math.max(currentX, 100);

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg
                viewBox={`0 0 ${totalWidth} ${height}`}
                width="100%"
                height={height}
                preserveAspectRatio="xMidYMid meet"
                className="max-w-[240px] text-black"
                shapeRendering="crispEdges"
            >
                {rects.map((r, idx) => (
                    <rect key={idx} x={r.x} y={0} width={r.width} height={height} fill="#000000" />
                ))}
            </svg>
            {showText && (
                <div className="mt-1 font-mono text-[11px] font-bold tracking-[0.2em] text-black select-none">
                    {cleanValue}
                </div>
            )}
        </div>
    );
}
