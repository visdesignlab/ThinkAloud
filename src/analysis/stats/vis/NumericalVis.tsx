import {NumericalVisProps} from '../../types';
import {useChartDimensions} from '../../../public/cleveland/hooks/useChartDimensions';
import * as d3 from 'd3';
import {NumericAxisHWithTick} from './NumericAxisHWithTick';


const chartSettings = {
    marginBottom: 30,
    marginLeft: 5,
    marginTop: 0,
    marginRight: 30,
    width: 300,
    height: 80,
};
export default function NumericalVis(props: NumericalVisProps){
    const visWidth = 250;
    const { trialName, max,min, data} = props;

    const [ref, dms] = useChartDimensions(chartSettings);

    const getYlocation = () => {
        const statsMap = new Map<number,number>();
        const yOffset: number[] = [];
        data.forEach((d)=>{
            if(statsMap.has(d)){
                yOffset.push(statsMap.get(d)!);
                statsMap.set(d,statsMap.get(d)!+1);
            }else{
                statsMap.set(d,1);
                yOffset.push(0);
            }
        });
        return yOffset;
    };
    const yOffset = getYlocation();

    const xScale = d3.scaleLinear().domain([min,max]).range([0, visWidth]);

    return (
        <>
            {
        trialName&&trialName.length>0 &&
            <div ref={ref}>
                <svg width={dms.width} height={dms.height}>
                    <g
                        transform={`translate(${[dms.marginLeft, dms.boundedHeight].join(',')})`}
                    >
                        <NumericAxisHWithTick domain={xScale.domain()} range={xScale.range()} withTick={true} tickLen={2} />


                    </g>
                    <g
                        transform={`translate(${[dms.marginLeft, dms.marginTop].join(',')})`}
                    >


                        {
                            data.map((d,i)=>{
                                return <circle cx={xScale(d)} cy={-yOffset[i]*2} r={3} fill="lightgreen"/>;
                            })
                        }

                    </g>
                </svg>

            </div>
            }
        </>
    );

}
