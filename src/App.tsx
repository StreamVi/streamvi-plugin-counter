import './App.css'
import { SettingsPage } from './features/settings/SettingsPage'
import { ViewerWidget } from './features/viewers/ViewerWidget'

function App() {
  return window.location.pathname.startsWith('/obs') ? <ViewerWidget /> : <SettingsPage />
}

export default App
