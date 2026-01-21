import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ButtonCustomProps extends ButtonProps {
  children: ReactNode;
  template: "dark" | "light" | "warning"
}

type Template = {
  bgColor: string;
  color: string;
  borderColor: string;
};

type Templates = {
  [key: string]: Template;
};

export default function ITMButton({ children, onClick, template, ...props }: ButtonCustomProps) {
      const templates: Templates = {
        "dark": {
            bgColor: 'itm.1000',
            color: 'white',
            borderColor: 'white'
        },
        "light": {
            bgColor: 'white',
            color: 'itm.1000',
            borderColor: 'itm.1000'
        },
        "warning": {
          bgColor: 'red.600',
          color: 'white',
          borderColor: 'red.600'
        },
        
    };

    const chosenTemplate = templates[template]


    return (
        <Button
          onClick={ onClick }
          px={3}
          bg={ chosenTemplate.bgColor }
          color={chosenTemplate.color}
          borderColor={ chosenTemplate.borderColor } 
          borderWidth={1} 
          borderStyle="solid"
          rounded={'md'}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          {...props}
          >
          { children }
        </Button>
    );
}