"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Smartphone, Monitor, Globe, Settings, Share, AlertCircle } from "lucide-react"

export function TutorialGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const toggleStep = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNumber))
    } else {
      setCompletedSteps([...completedSteps, stepNumber])
    }
  }

  const steps = [
    {
      id: 1,
      title: "Crear Iconos de la App",
      description: "Necesitas 2 iconos: uno de 192x192 y otro de 512x512 píxeles",
      icon: <Settings className="w-5 h-5" />,
      difficulty: "Fácil",
      time: "5 minutos",
      details: [
        "Ve a canva.com o cualquier editor de imágenes",
        "Crea un cuadrado de 192x192 píxeles",
        "Diseña tu icono (puede ser simple: DB, una base de datos, etc.)",
        "Guárdalo como 'icon-192.png'",
        "Repite el proceso para 512x512 píxeles como 'icon-512.png'",
        "Coloca ambos archivos en la carpeta 'public' de tu proyecto",
      ],
    },
    {
      id: 2,
      title: "Subir a Internet (Hosting Gratuito)",
      description: "Tu app necesita estar en internet para funcionar como PWA",
      icon: <Globe className="w-5 h-5" />,
      difficulty: "Medio",
      time: "10 minutos",
      details: [
        "Ve a vercel.com y crea una cuenta gratuita",
        "Conecta tu cuenta de GitHub (si no tienes, créala gratis)",
        "Sube tu código a GitHub",
        "En Vercel, haz clic en 'New Project'",
        "Selecciona tu repositorio de GitHub",
        "Vercel automáticamente detectará que es Next.js",
        "Haz clic en 'Deploy' y espera 2-3 minutos",
        "¡Tu app estará online con una URL como: tu-app.vercel.app!",
      ],
    },
    {
      id: 3,
      title: "Instalar en Android",
      description: "Cómo instalar la app en teléfonos Android",
      icon: <Smartphone className="w-5 h-5" />,
      difficulty: "Muy Fácil",
      time: "2 minutos",
      details: [
        "Abre Chrome en tu teléfono Android",
        "Ve a la URL de tu app (ej: tu-app.vercel.app)",
        "Aparecerá automáticamente un banner que dice 'Instalar App'",
        "Toca 'Instalar' o 'Agregar a pantalla de inicio'",
        "¡Listo! La app aparecerá en tu menú como cualquier otra app",
      ],
    },
    {
      id: 4,
      title: "Instalar en iPhone/iPad",
      description: "Cómo instalar la app en dispositivos iOS",
      icon: <Smartphone className="w-5 h-5" />,
      difficulty: "Fácil",
      time: "3 minutos",
      details: [
        "Abre Safari en tu iPhone/iPad",
        "Ve a la URL de tu app",
        "Toca el botón 'Compartir' (cuadrado con flecha hacia arriba)",
        "Busca y toca 'Agregar a pantalla de inicio'",
        "Puedes cambiar el nombre si quieres",
        "Toca 'Agregar'",
        "¡La app aparecerá en tu pantalla de inicio!",
      ],
    },
    {
      id: 5,
      title: "Instalar en PC/Mac",
      description: "Cómo instalar la app en computadoras",
      icon: <Monitor className="w-5 h-5" />,
      difficulty: "Muy Fácil",
      time: "2 minutos",
      details: [
        "Abre Chrome en tu computadora",
        "Ve a la URL de tu app",
        "En la barra de direcciones aparecerá un ícono de 'Instalar'",
        "Haz clic en el ícono de instalar",
        "Confirma la instalación",
        "¡La app se abrirá en su propia ventana como programa independiente!",
      ],
    },
    {
      id: 6,
      title: "Compartir con Otros",
      description: "Cómo otras personas pueden instalar tu app",
      icon: <Share className="w-5 h-5" />,
      difficulty: "Muy Fácil",
      time: "1 minuto",
      details: [
        "Simplemente comparte la URL de tu app",
        "Cualquier persona puede visitarla e instalarla",
        "No necesitan descargar nada de tiendas de apps",
        "Funciona en cualquier dispositivo con navegador web",
        "Las actualizaciones son automáticas",
      ],
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Muy Fácil":
        return "bg-green-100 text-green-800"
      case "Fácil":
        return "bg-blue-100 text-blue-800"
      case "Medio":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Tutorial: Convertir tu App en PWA</h1>
        <p className="text-gray-600">
          Sigue estos pasos para tener tu aplicación funcionando en todos los dispositivos
        </p>
        <div className="mt-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {completedSteps.length} de {steps.length} pasos completados
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id)

          return (
            <Card
              key={step.id}
              className={`transition-all ${isCompleted ? "bg-green-50 border-green-200" : "hover:shadow-md"}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleStep(step.id)} className="p-1">
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </Button>
                    <div className="flex items-center space-x-2">
                      {step.icon}
                      <CardTitle className="text-lg">
                        Paso {step.id}: {step.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getDifficultyColor(step.difficulty)}>{step.difficulty}</Badge>
                    <Badge variant="outline">{step.time}</Badge>
                  </div>
                </div>
                <p className="text-gray-600 ml-9">{step.description}</p>
              </CardHeader>

              <CardContent className="ml-9">
                <div className="space-y-3">
                  {step.details.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sección de ayuda adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            <span>¿Necesitas Ayuda?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            <p>
              <strong>📧 Servicios gratuitos recomendados:</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>
                • <strong>Hosting:</strong> Vercel.com, Netlify.com (gratis)
              </li>
              <li>
                • <strong>Iconos:</strong> Canva.com, Figma.com (gratis)
              </li>
              <li>
                • <strong>Código:</strong> GitHub.com (gratis)
              </li>
            </ul>

            <p className="mt-4">
              <strong>🎯 Consejos importantes:</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Tu app DEBE estar en HTTPS para funcionar como PWA</li>
              <li>• Los iconos deben ser cuadrados y en formato PNG</li>
              <li>• Una vez online, la instalación es automática</li>
              <li>• No necesitas pagar por tiendas de apps</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Progreso */}
      <div className="text-center">
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-600">
          {completedSteps.length === steps.length
            ? "🎉 ¡Felicitaciones! Tu app PWA está lista"
            : `Progreso: ${Math.round((completedSteps.length / steps.length) * 100)}%`}
        </p>
      </div>
    </div>
  )
}
