import React from 'react'

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => {
  return (
    <div ref={ref} data-page-root className="bg-background text-white overflow-scroll h-screen ">
      <div className="p-2 md:p-0 max-w-[760px] mx-auto h-full hide-scrollbar">{children}</div>
    </div>
  )
})

export default Page
