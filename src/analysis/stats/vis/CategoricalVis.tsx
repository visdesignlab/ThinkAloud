import {CategoricalVisProps} from '../../types';
import {useChartDimensions} from '../../../public/cleveland/hooks/useChartDimensions';
import * as d3 from 'd3';
import {Bars} from '../../../public/cleveland/chartcomponents/Bars';
import {OrdinalAxisHWithName} from './OrdinalAxisHWithName';
import {NumericalAxisVWithTick} from './NumericalAxisVWithTick';



export default function CategoricalVis(props: CategoricalVisProps){



    const {data, trialName, correctValue} = props;

    const chartSettings = {
        marginBottom: 30,
        marginLeft: 20,
        marginTop: 0,
        marginRight: 30,
        width: 100*data.length,
        height: 300,
    };

    const maxValue = d3.max(data.map((d: { value: number }) => d.value));
    console.log(data,'data in categorical vis');

    // console.log(props,'vis props');

    const [ref, dms] = useChartDimensions(chartSettings);
    console.log(dms.boundedHeight,'dms.boundedHeight');
    const tickLength = 6;
    const xScale = d3
        .scaleBand()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .domain(data.map((d: { name: any }) => d.name))
        .range([0, dms.boundedWidth])
        .padding(0.2);

    const yScale = d3
        .scaleLinear()
        .domain([maxValue || 0, 0])
        .range([0, dms.boundedHeight]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yAxisTickFilter = (ticks: any[]) => {
        return ticks.filter((t, i) => i === 0 || i === ticks.length - 1);
    };



    return (
        <>
            {
                trialName && trialName.length > 0 &&
                <div className="Chart__wrapper" ref={ref} style={{height: 400}}>
                    <svg width={dms.width} height={dms.height}>
                        <g
                            transform={`translate(${[dms.marginLeft, dms.marginTop].join(',')})`}
                        >
                            <g
                                transform={`translate(${[tickLength, dms.boundedHeight].join(
                                    ','
                                )})`}
                            >
                                <OrdinalAxisHWithName domain={xScale.domain()}
                                                      range={xScale.range()}
                                                      withTick={true}
                                                      tickLen={tickLength}
                                                      highlightAnswer={correctValue}
                                />
                            </g>
                            <g transform={`translate(${[0, 0].join(',')})`}>
                                <NumericalAxisVWithTick
                                    domain={yScale.domain()}
                                    range={yScale.range()}
                                    withTick={true}
                                    tickLen={tickLength}
                                    tickFilter={yAxisTickFilter}
                                />
                            </g>
                            <g transform={`translate(${[0, 0].join(',')})`}>
                                <Bars
                                    data={data}
                                    xScale={xScale}
                                    yScale={yScale}
                                    height={dms.boundedHeight}
                                />
                            </g>
                        </g>
                    </svg>
                </div>
            }
        </>
    );

}
