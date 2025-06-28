"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Verificar si es iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.navigator.standalone

    if (isIOS && !isInStandaloneMode) {
      setShowInstallPrompt(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("installPromptDismissed", "true")
  }

  // No mostrar si ya está instalada o si fue descartada
  if (isInstalled || !showInstallPrompt) {
    return null
  }

  // Verificar si fue descartada anteriormente
  if (typeof window !== "undefined" && localStorage.getItem("installPromptDismissed")) {
    return null
  }

  const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-blue-200 bg-blue-50 md:max-w-md md:left-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg text-blue-900">Instalar App</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Instala la aplicación en tu dispositivo para un acceso más rápido y funcionalidad offline
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <div className="space-y-2">
            <p className="text-sm text-blue-800">Para instalar en iOS:</p>
            <ol className="text-xs text-blue-700 space-y-1 ml-4">
              <li>1. Toca el botón "Compartir" ⬆️</li>
              <li>2. Selecciona "Agregar a pantalla de inicio"</li>
              <li>3. Toca "Agregar"</li>
            </ol>
          </div>
        ) : (
          <Button onClick={handleInstallClick} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Instalar Aplicación
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
