import { Sidebar } from '@/components/sidebar/sidebar'


export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}