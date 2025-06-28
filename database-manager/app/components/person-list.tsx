"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, User, Hash, MapPin, Phone, Mail } from "lucide-react"

interface Person {
  id: string
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  edad: number
  domicilio: string
  telefono: string
  email: string
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface CustomField {
  id: string
  name: string
  type: "text" | "number" | "date" | "boolean"
  required: boolean
  order: number
}

interface PersonListProps {
  persons: Person[]
  customFields: CustomField[]
  onEdit: (person: Person) => void
  onDelete: (person: Person) => void
}

export function PersonList({ persons, customFields, onEdit, onDelete }: PersonListProps) {
  // Función para formatear fechas correctamente
  const formatDateCorrectly = (dateString: string): string => {
    if (!dateString) return "-"

    // Si la fecha está en formato YYYY-MM-DD, la parseamos directamente
    const parts = dateString.split("-")
    if (parts.length === 3) {
      const year = parts[0]
      const month = parts[1]
      const day = parts[2]
      return `${day}/${month}/${year}`
    }

    // Si no, intentamos con el método tradicional pero ajustando la zona horaria
    try {
      const date = new Date(dateString + "T12:00:00") // Agregamos hora del mediodía para evitar problemas de zona horaria
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const formatCustomFieldValue = (field: CustomField, value: any) => {
    if (value === null || value === undefined || value === "") {
      return "-"
    }

    switch (field.type) {
      case "boolean":
        return value ? "SÍ" : "NO"
      case "date":
        return formatDateCorrectly(value)
      case "number":
        return Number.parseFloat(value).toFixed(2)
      default:
        return value.toString()
    }
  }

  if (persons.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">No hay personas registradas</h3>
          <p className="text-gray-400">Agrega la primera persona para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {persons.map((person) => (
        <Card key={person.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {person.nombre} {person.apellido}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(person)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(person)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Información básica */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Datos Personales</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">DNI:</span>
                    <span className="text-sm font-mono">{person.dni}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">F. Nac.:</span>
                    <span className="text-sm">{formatDateCorrectly(person.fechaNacimiento)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Edad:</span>
                    <Badge variant="secondary">{person.edad} años</Badge>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Contacto</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Domicilio:</span>
                      <p className="text-sm text-gray-600">{person.domicilio || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Teléfono:</span>
                    <span className="text-sm">{person.telefono || "-"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{person.email || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Campos personalizados */}
              {customFields.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Información Adicional</h4>
                  <div className="space-y-2">
                    {customFields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div key={field.id} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{field.name}:</span>
                          <span className="text-sm">
                            {formatCustomFieldValue(field, person.customFields[field.id])}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadatos */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Creado: {new Date(person.createdAt).toLocaleDateString("es-AR")}{" "}
                  {new Date(person.createdAt).toLocaleTimeString("es-AR")}
                </span>
                <span>
                  Actualizado: {new Date(person.updatedAt).toLocaleDateString("es-AR")}{" "}
                  {new Date(person.updatedAt).toLocaleTimeString("es-AR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
