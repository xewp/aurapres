import React from 'react'

/**
 * Renders an AI asset's JSON content cleanly in the UI
 * instead of raw stringified JSON.
 */
export default function AssetViewer({ content }) {
  if (!content) {
    return <p className="text-gray-500 italic">No content available.</p>
  }

  // Format camelCase keys to Title Case
  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div className="space-y-6 text-sm text-gray-300">
      {Object.entries(content).map(([key, value]) => {
        const title = formatKey(key)

        if (typeof value === 'string') {
          return (
            <div key={key}>
              <h4 className="text-white font-medium mb-1">{title}</h4>
              <p className="whitespace-pre-wrap leading-relaxed">{value}</p>
            </div>
          )
        }

        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <h4 className="text-white font-medium mb-2">{title}</h4>
              <ul className="list-disc list-inside space-y-2">
                {value.map((item, index) => {
                  if (typeof item === 'string') {
                    return <li key={index} className="pl-2">{item}</li>
                  }
                  if (typeof item === 'object' && item !== null) {
                    // For arrays of objects (like outline sections, shorts hooks)
                    return (
                      <li key={index} className="mb-4 list-none bg-[#12121A] p-4 rounded-lg border border-gray-800">
                        {Object.entries(item).map(([subKey, subVal]) => (
                          <div key={subKey} className="mb-2 last:mb-0">
                            <span className="text-gray-400 font-medium mr-2">{formatKey(subKey)}:</span>
                            <span className="text-gray-200">{typeof subVal === 'string' ? subVal : JSON.stringify(subVal)}</span>
                          </div>
                        ))}
                      </li>
                    )
                  }
                  return <li key={index}>{JSON.stringify(item)}</li>
                })}
              </ul>
            </div>
          )
        }

        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key}>
              <h4 className="text-white font-medium mb-2">{title}</h4>
              <div className="bg-[#12121A] p-4 rounded-lg border border-gray-800">
                {Object.entries(value).map(([subKey, subVal]) => (
                  <div key={subKey} className="mb-2 last:mb-0 flex items-start">
                    <span className="text-gray-400 font-medium mr-2 min-w-32">{formatKey(subKey)}:</span>
                    <span className="text-gray-200 flex-1">{typeof subVal === 'string' ? subVal : JSON.stringify(subVal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
