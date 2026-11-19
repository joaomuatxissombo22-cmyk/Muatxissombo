import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Ocorreu um erro inesperado na aplicação.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught ErrorBoundary exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let parsedDetails: Record<string, unknown> | null = null;
      try {
        parsedDetails = JSON.parse(this.state.errorMessage);
      } catch {
        parsedDetails = null;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-semibold text-slate-900">
                Alerta de Operação na Plataforma
              </h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Ocorreu uma restrição de segurança ou falha de comunicação ao processar o seu pedido.
            </p>
            {parsedDetails ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs font-mono-tabular text-slate-700 space-y-1 overflow-x-auto">
                <div>Operação: {String(parsedDetails.operationType || 'N/A')}</div>
                <div>Caminho: {String(parsedDetails.path || 'N/A')}</div>
                <div>Detalhe: {String(parsedDetails.error || '')}</div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs font-mono-tabular text-slate-700">
                {this.state.errorMessage}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B5ED7] text-white text-sm font-medium rounded-lg hover:bg-[#094bb0] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Plataforma
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
