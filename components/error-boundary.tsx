"use client"

import { Component, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Configuration Error
              </CardTitle>
              <CardDescription>There's an issue with the app configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {this.state.error?.message?.includes("supabaseUrl") ||
                  this.state.error?.message?.includes("SUPABASE_URL") ? (
                    <>
                      <strong>Missing Supabase Configuration</strong>
                      <br />
                      Please ensure you have set up your environment variables:
                      <ul className="mt-2 ml-4 list-disc">
                        <li>NEXT_PUBLIC_SUPABASE_URL</li>
                        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                      </ul>
                      <p className="mt-2 text-sm">Check your .env.local file or deployment environment variables.</p>
                    </>
                  ) : (
                    this.state.error?.message || "An unexpected error occurred"
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
