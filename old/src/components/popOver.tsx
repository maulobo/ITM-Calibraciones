'use client'
import { QuestionIcon } from "@chakra-ui/icons"
import { Icon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "@chakra-ui/react"
import React from "react"
type Props = {
  content: {
      body: string,
      title?: string
    },
    trigger?: React.ReactNode,
    footer?: React.ReactNode

}

export const ItmPopover = (props:Props) => {
    const { content, trigger, footer } = props
    return (
      <Popover
        placement='bottom'
        closeOnBlur={false}
      >
        <PopoverTrigger>
            {trigger ?? <Icon ml={2} cursor={"pointer"} as={QuestionIcon}  color={"itm.1000"} />}
        </PopoverTrigger>
        
        <PopoverContent color='white' bg='itm.1000' borderColor='itm.1000'>
          
          <PopoverHeader textAlign={"left"} pt={4} fontWeight='bold' border='0'>
            {content.title}
          </PopoverHeader>

          <PopoverArrow bg='itm.1000' />

          <PopoverCloseButton />

          <PopoverBody textAlign={"left"} fontWeight="light" style={{ textTransform: 'lowercase' }}>
            {content.body}
          </PopoverBody>

          <PopoverFooter
            border='0'
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            pb={4}
            >
            {footer}
        </PopoverFooter>

        </PopoverContent>
      </Popover>
    )
  }