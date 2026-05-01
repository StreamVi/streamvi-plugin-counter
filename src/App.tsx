import { lazy, Suspense, useEffect } from 'react'
import './App.css'
import { ViewerWidget } from './features/viewers/ViewerWidget'

const SettingsPage = lazy(() =>
  import('./features/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)

function App() {
  const isObsRoute = window.location.pathname.startsWith('/obs')

  useEffect(() => {
    document.documentElement.classList.toggle('is-obs-route', isObsRoute)

    return () => {
      document.documentElement.classList.remove('is-obs-route')
    }
  }, [isObsRoute])

  if (isObsRoute) {
    return <ViewerWidget />
  }

  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  )
}

export default App
