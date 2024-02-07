import {CorrectVisProps} from '../../types';
import {useChartDimensions} from '../../../public/cleveland/hooks/useChartDimensions';
import {Group, ScrollArea, Text} from '@mantine/core';
import * as d3 from 'd3';


const chartSettings = {
    marginBottom: 30,
    marginLeft: 1,
    marginTop: 0,
    marginRight: 30,
    width: 300,
    height: 80,
};
export default function CorrectVis(props: CorrectVisProps){
    const visWidth = 250;
    const leftOffset = 30;
    const {correct, incorrect, trialName} = props;
    console.log(correct,'correct');
    console.log(incorrect,'incorrect');
    // console.log(props,'vis props');

    //igo
    const [ref, dms] = useChartDimensions(chartSettings);

    const xScale = d3.scaleLinear().domain([0,1]).range([0, visWidth]);

    return (
        <>
            {
        trialName&&trialName.length>0 &&
            <div ref={ref}>
                <svg width={dms.width} height={dms.height}>
                    <g
                        transform={`translate(${[dms.marginLeft, dms.marginTop].join(',')})`}
                    >
                        <rect x={leftOffset} y="20" width={xScale(correct.length/(correct.length+incorrect.length))} height="30" rx={3} fill="lightgreen"/>
                        <rect x={5+leftOffset+xScale(correct.length/(correct.length+incorrect.length))} y="20"
                              width={xScale(incorrect.length/(correct.length+incorrect.length))}
                              height="30"
                              rx={3}
                              fill="red"/>
                        <text x={leftOffset} y="15">{Math.round(correct.length/(correct.length+incorrect.length) * 100)}%</text>
                        <text x={leftOffset+visWidth-20} y="15">{Math.round(incorrect.length/(correct.length+incorrect.length) * 100)}%</text>
                    </g>
                </svg>
                <Group ml={5}>
                    <ScrollArea style={{ height: 250, width: 150 }}>
                        <Text>Correct</Text>
                        {correct.length>0?correct.map((user) => <Text size={'xs'}>{user}</Text>):<Text size={'xs'}>None</Text>}
                    </ScrollArea>

                    <ScrollArea style={{ height: 250, width: 150  }}>
                        <Text>Incorrect</Text>

                        {incorrect.length>0?incorrect.map((user) => <Text size={'xs'}>{user}</Text>):<Text size={'xs'}>None</Text>}
                    </ScrollArea>


                </Group>
            </div>
            }
        </>
    );

}
