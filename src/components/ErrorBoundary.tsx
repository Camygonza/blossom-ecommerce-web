import { Component, type ErrorInfo, type ReactNode } from 'react'
import { EmptyState } from './EmptyState'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/** Última red de seguridad: un error de render no deja la pantalla en blanco. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error de render', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <EmptyState
          title="Algo se marchitó"
          description="Ocurrió un error inesperado. Recarga la página para continuar."
          actionLabel="Recargar"
          onAction={() => window.location.reload()}
        />
      )
    }
    return this.props.children
  }
}
