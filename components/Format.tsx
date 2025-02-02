import React from 'react'
import { useEffect, useState, JSX } from 'react'

const Format: React.FC<{ label: string, content: string }> = ({ label, content }) => {
  const [elems, setElems] = useState<JSX.Element[]>([])

  const contentParser = (content: string) => {
    const regex = /(\[|\]|\||[^\[\]\|]+)/g
    const arr = content.match(regex) || []
    const elems = arr.map((part, index) => {
      if (part === '[' || part === ']' || part === '|') {
        return <b key={index + part}>{part}</b>
      } else {
        return <span key={index + part}>{part}</span>
      }
    })
    return elems
  }

  useEffect(() => setElems(contentParser(content)), [content])

  return (
    <div aria-label={label}>
      {elems && elems.map((elem, idx) => (
        <React.Fragment key={idx}>
          {elem}
        </React.Fragment>
      ))}
    </div>
  )
}

export default Format