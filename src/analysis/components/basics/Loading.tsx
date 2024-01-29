import { LoadingOverlay } from '@mantine/core';

export interface LoadingProps {
    isLoading: boolean;
}
const Loading = (props:LoadingProps ) => {


    return (

        <LoadingOverlay visible={props.isLoading} zIndex={1000 } overlayBlur={2} />



    );
};

export default Loading;
