import React from 'react'
import {PortableText} from '@portabletext/react'
import EmbedHTML from './EmbedHTML'
import Figure from './Figure'

function SimpleBlockContent(props) {
  const {blocks} = props

  if (!blocks) {
    console.error('Missing blocks')
    return null
  }

  return (
    <PortableText
      value={blocks}
      components={{
        types: {
          embedHTML: EmbedHTML,
          figure: Figure,
        },
      }}
    />
  )
}

export default SimpleBlockContent
