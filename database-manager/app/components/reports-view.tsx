"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Eye, Users, BarChart3, FileText } from "lucide-react"

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

interface ReportsViewProps {
  persons: Person[]
  customFields: CustomField[]
  databaseName: string
}

export function ReportsView({ persons, customFields, databaseName }: ReportsViewProps) {
  const [reportType, setReportType] = useState<"individual" | "collective">("collective")
  const [selectedPerson, setSelectedPerson] = useState<string>("")

  // Función para formatear fechas correctamente sin problemas de zona horaria
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

  const generateIndividualReport = (person: Person) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reporte Individual - ${person.nombre} ${person.apellido}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section h3 { 
            background-color: #f5f5f5; 
            padding: 10px;
            margin: 0 0 15px 0;
            border-left: 4px solid #007bff;
          }
          .field { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
          }
          .field:last-child { 
            border-bottom: none; 
          }
          .label { 
            font-weight: bold; 
            color: #333; 
          }
          .value { 
            color: #666; 
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${databaseName}</h1>
          <h2>Reporte Individual</h2>
          <p>Generado el ${new Date().toLocaleDateString("es-AR")} a las ${new Date().toLocaleTimeString("es-AR")}</p>
        </div>
        
        <div class="section">
          <h3>Información Personal</h3>
          <div class="field">
            <span class="label">Nombre Completo:</span>
            <span class="value">${person.nombre} ${person.apellido}</span>
          </div>
          <div class="field">
            <span class="label">DNI:</span>
            <span class="value">${person.dni}</span>
          </div>
          <div class="field">
            <span class="label">Fecha de Nacimiento:</span>
            <span class="value">${formatDateCorrectly(person.fechaNacimiento)}</span>
          </div>
          <div class="field">
            <span class="label">Edad:</span>
            <span class="value">${person.edad} años</span>
          </div>
        </div>
        
        <div class="section">
          <h3>Información de Contacto</h3>
          <div class="field">
            <span class="label">Domicilio:</span>
            <span class="value">${person.domicilio || "-"}</span>
          </div>
          <div class="field">
            <span class="label">Teléfono:</span>
            <span class="value">${person.telefono || "-"}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${person.email || "-"}</span>
          </div>
        </div>
        
        ${
          customFields.length > 0
            ? `
        <div class="section">
          <h3>Información Adicional</h3>
          ${customFields
            .map(
              (field) => `
            <div class="field">
              <span class="label">${field.name}:</span>
              <span class="value">${formatCustomFieldValue(field, person.customFields[field.id])}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }
        
        <div class="section">
          <h3>Metadatos</h3>
          <div class="field">
            <span class="label">Fecha de Registro:</span>
            <span class="value">${new Date(person.createdAt).toLocaleDateString("es-AR")} ${new Date(person.createdAt).toLocaleTimeString("es-AR")}</span>
          </div>
          <div class="field">
            <span class="label">Última Actualización:</span>
            <span class="value">${new Date(person.updatedAt).toLocaleDateString("es-AR")} ${new Date(person.updatedAt).toLocaleTimeString("es-AR")}</span>
          </div>
        </div>
      </body>
    </html>
  `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const generateCollectiveReport = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reporte Colectivo - ${databaseName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 10px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            font-size: 9px;
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .summary { 
            background-color: #e3f2fd; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
          }
          @media print {
            body { margin: 0; font-size: 8px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${databaseName}</h1>
          <h2>Reporte Colectivo</h2>
          <p>Generado el ${new Date().toLocaleDateString("es-AR")} a las ${new Date().toLocaleTimeString("es-AR")}</p>
        </div>
        
        <div class="summary">
          <h3>Resumen</h3>
          <p><strong>Total de Personas:</strong> ${persons.length}</p>
          <p><strong>Edad Promedio:</strong> ${persons.length > 0 ? (persons.reduce((sum, p) => sum + p.edad, 0) / persons.length).toFixed(1) : 0} años</p>
          <p><strong>Rango de Edades:</strong> ${persons.length > 0 ? Math.min(...persons.map((p) => p.edad)) : 0} - ${persons.length > 0 ? Math.max(...persons.map((p) => p.edad)) : 0} años</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>F. Nac.</th>
              <th>Edad</th>
              <th>Domicilio</th>
              <th>Teléfono</th>
              <th>Email</th>
              ${customFields.map((field) => `<th>${field.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${persons
              .map(
                (person) => `
              <tr>
                <td>${person.dni}</td>
                <td>${person.nombre}</td>
                <td>${person.apellido}</td>
                <td>${formatDateCorrectly(person.fechaNacimiento)}</td>
                <td>${person.edad}</td>
                <td>${person.domicilio || "-"}</td>
                <td>${person.telefono || "-"}</td>
                <td>${person.email || "-"}</td>
                ${customFields
                  .map(
                    (field) => `
                  <td>${formatCustomFieldValue(field, person.customFields[field.id])}</td>
                `,
                  )
                  .join("")}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const previewReport = () => {
    if (reportType === "individual" && selectedPerson) {
      const person = persons.find((p) => p.id === selectedPerson)
      if (person) {
        generateIndividualReport(person)
      }
    } else if (reportType === "collective") {
      generateCollectiveReport()
    }
  }

  const getAgeStatistics = () => {
    if (persons.length === 0) return null

    const ages = persons.map((p) => p.edad)
    const average = ages.reduce((sum, age) => sum + age, 0) / ages.length
    const min = Math.min(...ages)
    const max = Math.max(...ages)

    return { average: average.toFixed(1), min, max }
  }

  const stats = getAgeStatistics()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Generador de Reportes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{persons.length}</div>
                    <div className="text-sm text-gray-500">Total Personas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {stats && (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold">{stats.average}</div>
                        <div className="text-sm text-gray-500">Edad Promedio</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">
                          {stats.min} - {stats.max}
                        </div>
                        <div className="text-sm text-gray-500">Rango Edades</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="reportType">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={(value: "individual" | "collective") => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collective">Reporte Colectivo (Todas las personas)</SelectItem>
                  <SelectItem value="individual">Reporte Individual (Una persona)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "individual" && (
              <div>
                <label htmlFor="personSelect">Seleccionar Persona</label>
                <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.nombre} {person.apellido} - DNI: {person.dni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={previewReport}
                disabled={reportType === "individual" && !selectedPerson}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              <Button
                onClick={previewReport}
                disabled={reportType === "individual" && !selectedPerson}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
