import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useT } from '@/i18n/i18n'
import { EmptyState } from './EmptyState'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

function ErrorFallback() {
  const t = useT()
  return (
    <EmptyState
      title={t('Algo se marchitó')}
      description={t('Ocurrió un error inesperado. Recarga la página para continuar.')}
      actionLabel={t('Recargar')}
      onAction={() => window.location.reload()}
    />
  )
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
      return <ErrorFallback />
    }
    return this.props.children
  }
}
