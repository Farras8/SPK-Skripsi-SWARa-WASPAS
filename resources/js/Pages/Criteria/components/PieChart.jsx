import React from 'react';

const PIE_COLORS = [
    '#6366f1', '#f59e0b', '#10b981', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
    '#ec4899', '#14b8a6',
];

export default function PieChart({ data }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return null;

    let currentAngle = -90;
    const slices = data.map((d, i) => {
        const percentage = d.value / total;
        const angle = percentage * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = 100 + 80 * Math.cos(startRad);
        const y1 = 100 + 80 * Math.sin(startRad);
        const x2 = 100 + 80 * Math.cos(endRad);
        const y2 = 100 + 80 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
            `Z`,
        ].join(' ');

        return (
            <path
                key={i}
                d={pathData}
                fill={PIE_COLORS[i % PIE_COLORS.length]}
                stroke="white"
                strokeWidth="2"
            />
        );
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <svg viewBox="0 0 200 200" className="h-48 w-48">
                {slices}
            </svg>
            <div className="flex flex-wrap justify-center gap-3">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span>{d.label} ({(d.value * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
