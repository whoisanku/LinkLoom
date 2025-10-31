

const Page = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background text-white overflow-scroll h-screen ">
      <div className="max-w-[760px] mx-auto h-full hide-scrollbar">{children}</div>
    </div>
  )
}

export default Page

