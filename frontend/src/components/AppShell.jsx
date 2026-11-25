import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

/**
 * Persistent chrome for every signed-in page. The old per-page <Navbar />
 * is now provided here once, so pages only render their own content.
 */
export default function AppShell() {
  return (
    <div className="shell">
      <Navbar />
      <main className="shell-main">
        <div className="shell-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
