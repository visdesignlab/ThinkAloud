import * as d3 from 'd3';
import { useMemo } from 'react';

export const OrdinalAxisHWithName = ({
                                             domain = ['A', 'B', 'C', 'D', 'E'],
                                             range = [10, 100],
                                             withTick = true,
                                             tickLen = 5,
                                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                             tickFilter = (t: any[]) => t,
                                         highlightAnswer = '',
                                         highlightColor = 'green'
                                         }) => {
    const ticks = useMemo(() => {
        const xScale = d3.scaleBand().domain(domain).range(range).padding(0.2);
        return tickFilter(
            domain.map((value) => ({
                value,
                xOffset: (xScale(value) || 0) + xScale.bandwidth() / 2 - 30,
            }))
        );
    }, [domain, range, tickFilter]);
    return (
        <g>
            <path
                d={[
                    'M',
                    range[0],
                    tickLen,
                    'v',
                    -tickLen,
                    'H',
                    range[1],
                    'v',
                    tickLen,
                ].join(' ')}
                fill="none"
                stroke="currentColor"
            />
            {withTick &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ticks.map(({ value, xOffset }: any) => (
                    <g key={value} transform={`translate(${xOffset}, 20)`}>
                        <text key={value} stroke={value==highlightAnswer?highlightColor:'black'}>
                            {value}
                        </text>
                    </g>
                ))}
        </g>
    );
};
