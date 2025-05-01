import React from 'react'
import { FeaturesSectionDemo } from './ui/benefitCard'
import {ColourfulText} from "../../src/components/ui/colour-full-text";


type Props = {}

const Benefit = (props: Props) => {
  return (
      <div>
             <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:leading-[60px] text-[#000] font-[700] tracking-tight mt-10">
                            Students get <ColourfulText text="Benefits" /> <br />
                            From this Platform
                        </h1>
          <FeaturesSectionDemo/>
    </div>
  )
}

export default Benefit