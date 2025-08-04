// 파일 경로: src/components/ui/error-boundary.tsx
'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">오류가 발생했습니다</div>
          <p className="text-muted-foreground max-w-md">
            예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-sm text-left bg-gray-100 p-4 rounded">
              <summary>오류 상세 정보</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </details>
          )}
          <Button onClick={this.handleReset}>다시 시도</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
