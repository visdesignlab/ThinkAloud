import {MeanVisProps} from '../../types';
import {useChartDimensions} from '../../../public/cleveland/hooks/useChartDimensions';
import {Box, Text} from '@mantine/core';
import * as d3 from 'd3';
import {IconArrowLeft} from '@tabler/icons-react';
import {toDisplayData} from '../../utils';

const chartSettings = {
    marginBottom: 30,
    marginLeft: 30,
    marginTop: 0,
    marginRight: 30,
    width: 300,
    height: 100,
};
export default function MeanVis(props: MeanVisProps){
    const {stats, trialName} = props;
    const {min, max, mean, mid} = stats;
    console.log(props,'vis props');

    //igo
    const [ref, dms] = useChartDimensions(chartSettings);

    const xScale = d3.scaleLinear().domain([min,max]).range([0, dms.boundedWidth]);

    return (
        trialName&&trialName.length>0 ?
            <div ref={ref}>
            <svg width={dms.width} height={dms.height}>
                <g
                    transform={`translate(${[dms.marginLeft, dms.marginTop].join(',')})`}
                >
                    <line x1={xScale(min)} y1={50} x2={xScale(max)} y2={50} stroke="currentColor"/>
                    <line x1={xScale(min)} y1={30} x2={xScale(min)} y2={70} stroke="currentColor"/>
                    <text x={xScale(min) - 10} y="25">{toDisplayData(min)}</text>
                    <line x1={xScale(max)} y1={30} x2={xScale(max)} y2={70} stroke="currentColor"/>
                    <text x={xScale(max) - 10} y="25">{toDisplayData(max)}</text>

                    {/*mean*/}
                    <line x1={xScale(mean)} y1={30} x2={xScale(mean)} y2={70} stroke="red"/>
                    {/*mid*/}
                    <circle cx={xScale(mid)} cy={60} r={5} fill="red">
                            <title>Median:{mid}</title>
                    </circle>


                </g>
            </svg></div>:<Box>
            <IconArrowLeft size={20}/>
            <Text size={30} span>Select a trial</Text>
            </Box>
    );

}
