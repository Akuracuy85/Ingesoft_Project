import React from "react"

interface LoadingProps {
  height?: string
  className?: string
}

const Loading: React.FC<LoadingProps> = ({ height = "h-16", className }) => {
  return (
    <header
      className={`bg-card border-b border-border flex items-center justify-between px-8 ${height} ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </header>
  )
}

export default Loading
