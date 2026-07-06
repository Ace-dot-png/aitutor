'use client'

const COLOURS = ['#1cdb19', '#121bde', '#d72d02', '#9b59b6', '#e67e22']

export function ColouredResponse({ content }: { content: string }) {
  const hasPoints = content.includes('<point')

  if (!hasPoints) {
    return <p className="text-[#F5F5F5] leading-relaxed">{content}</p>
  }

  const parts = content.split(/(<point index="\d+">[\s\S]*?<\/point>)/)

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        const match = part.match(/<point index="(\d+)">([\s\S]*?)<\/point>/)
        if (match) {
          const index = parseInt(match[1]) - 1
          const colour = COLOURS[index % COLOURS.length]
          return (
            <div
              key={i}
              style={{ borderLeft: `3px solid ${colour}`, paddingLeft: '12px' }}
            >
              <p style={{ color: colour }} className="leading-relaxed">
                {match[2].trim()}
              </p>
            </div>
          )
        }
        if (part.trim()) {
          return (
            <p key={i} className="text-[#F5F5F5] leading-relaxed">
              {part.trim()}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}
