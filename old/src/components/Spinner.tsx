import { Spinner, SpinnerProps } from "@chakra-ui/react";

export default function SpinnerITM({ color = 'itm.1000', ...props }: SpinnerProps) {
    return (
        <Spinner color={color} {...props}/>
    );
}