"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Users, Settings, FileText, Download, Eye, Search, SortAsc, SortDesc } from "lucide-react"
import { PersonForm } from "./person-form"
import { PersonList } from "./person-list"
import { CustomFieldManager } from "./custom-field-manager"
import { ReportsView } from "./reports-view"
import { useToast } from "@/hooks/use-toast"

interface DatabaseInfo {
  id: string
  name: string
  description: string
  password: string
  editPassword: string
  recoveryKey: string
  createdAt: string
  personCount: number
}

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

interface DatabaseData {
  persons: Person[]
  customFields: CustomField[]
}

interface DatabaseManagerProps {
  database: DatabaseInfo
  onBack: () => void
  onUpdatePersonCount: (databaseId: string, count: number) => void
}

export function DatabaseManager({ database, onBack, onUpdatePersonCount }: DatabaseManagerProps) {
  const [data, setData] = useState<DatabaseData>({ persons: [], customFields: [] })
  const [showPersonForm, setShowPersonForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [pendingAction, setPendingAction] = useState<() => void>(() => {})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("nombre")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [database.id])

  const loadData = () => {
    const saved = localStorage.getItem(`database_${database.id}`)
    if (saved) {
      const parsedData = JSON.parse(saved)
      setData(parsedData)
      onUpdatePersonCount(database.id, parsedData.persons.length)
    }
  }

  const saveData = (newData: DatabaseData) => {
    localStorage.setItem(`database_${database.id}`, JSON.stringify(newData))
    setData(newData)
    onUpdatePersonCount(database.id, newData.persons.length)
  }

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const isDniUnique = (dni: string, excludeId?: string): boolean => {
    return !data.persons.some((person) => person.dni === dni && person.id !== excludeId)
  }

  const addPerson = (personData: Omit<Person, "id" | "edad" | "createdAt" | "updatedAt">) => {
    // Validar que el DNI sea solo números enteros
    if (!/^\d+$/.test(personData.dni)) {
      toast({
        title: "DNI inválido",
        description: "El DNI debe contener solo números enteros",
        variant: "destructive",
      })
      return false
    }

    if (!isDniUnique(personData.dni)) {
      toast({
        title: "DNI duplicado",
        description: "Ya existe una persona con este DNI",
        variant: "destructive",
      })
      return false
    }

    if (data.persons.length >= 2000) {
      toast({
        title: "Límite alcanzado",
        description: "No se pueden agregar más de 2000 personas",
        variant: "destructive",
      })
      return false
    }

    const newPerson: Person = {
      ...personData,
      id: Date.now().toString(),
      edad: calculateAge(personData.fechaNacimiento),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newData = {
      ...data,
      persons: [...data.persons, newPerson],
    }

    saveData(newData)
    toast({
      title: "Persona agregada",
      description: `${newPerson.nombre} ${newPerson.apellido} ha sido agregado exitosamente`,
    })
    return true
  }

  const updatePerson = (personData: Omit<Person, "id" | "edad" | "createdAt" | "updatedAt">) => {
    if (!editingPerson) return false

    // Validar que el DNI sea solo números enteros
    if (!/^\d+$/.test(personData.dni)) {
      toast({
        title: "DNI inválido",
        description: "El DNI debe contener solo números enteros",
        variant: "destructive",
      })
      return false
    }

    if (!isDniUnique(personData.dni, editingPerson.id)) {
      toast({
        title: "DNI duplicado",
        description: "Ya existe una persona con este DNI",
        variant: "destructive",
      })
      return false
    }

    const updatedPerson: Person = {
      ...editingPerson,
      ...personData,
      edad: calculateAge(personData.fechaNacimiento),
      updatedAt: new Date().toISOString(),
    }

    const newData = {
      ...data,
      persons: data.persons.map((p) => (p.id === editingPerson.id ? updatedPerson : p)),
    }

    saveData(newData)
    toast({
      title: "Persona actualizada",
      description: `Los datos de ${updatedPerson.nombre} ${updatedPerson.apellido} han sido actualizados`,
    })
    return true
  }

  const requestEditPermission = (action: () => void) => {
    setPendingAction(() => action)
    setPasswordInput("")
    setShowPasswordDialog(true)
  }

  const verifyEditPassword = () => {
    if (passwordInput === database.editPassword) {
      setShowPasswordDialog(false)
      pendingAction()
      setPendingAction(() => {})
      setPasswordInput("")
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "La contraseña de edición no es válida",
        variant: "destructive",
      })
    }
  }

  const deletePerson = (personId: string) => {
    const newData = {
      ...data,
      persons: data.persons.filter((p) => p.id !== personId),
    }
    saveData(newData)
    toast({
      title: "Persona eliminada",
      description: "La persona ha sido eliminada exitosamente",
    })
  }

  const handleEditPerson = (person: Person) => {
    requestEditPermission(() => {
      setEditingPerson(person)
      setShowPersonForm(true)
    })
  }

  const handleDeletePerson = (person: Person) => {
    requestEditPermission(() => {
      if (confirm(`¿Estás seguro de que deseas eliminar a ${person.nombre} ${person.apellido}?`)) {
        deletePerson(person.id)
      }
    })
  }

  const updateCustomFields = (fields: CustomField[]) => {
    const newData = { ...data, customFields: fields }
    saveData(newData)
  }

  const exportDatabaseData = () => {
    try {
      const exportData = {
        database: database,
        data: data,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${database.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: `Los datos de "${database.name}" han sido exportados`,
      })
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = () => {
    // Crear datos para Excel
    const excelData = data.persons.map((person) => {
      const row: any = {
        DNI: person.dni,
        NOMBRE: person.nombre,
        APELLIDO: person.apellido,
        "FECHA NACIMIENTO": new Date(person.fechaNacimiento).toLocaleDateString(),
        EDAD: person.edad,
        DOMICILIO: person.domicilio || "",
        TELEFONO: person.telefono || "",
        EMAIL: person.email || "",
      }

      // Agregar campos personalizados
      data.customFields.forEach((field) => {
        const value = person.customFields[field.id]
        if (field.type === "boolean") {
          row[field.name] = value ? "SÍ" : "NO"
        } else if (field.type === "date" && value) {
          row[field.name] = new Date(value).toLocaleDateString()
        } else if (field.type === "number" && value) {
          row[field.name] = Number.parseFloat(value).toFixed(2)
        } else {
          row[field.name] = value || ""
        }
      })

      return row
    })

    // Convertir a CSV
    if (excelData.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay personas para exportar",
        variant: "destructive",
      })
      return
    }

    const headers = Object.keys(excelData[0])
    const csvContent = [
      headers.join(","),
      ...excelData.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escapar comillas y envolver en comillas si contiene comas
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${database.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Exportación a Excel exitosa",
      description: `Se exportaron ${excelData.length} personas a formato CSV`,
    })
  }

  const filteredAndSortedPersons = data.persons
    .filter((person) => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        person.dni.toLowerCase().includes(search) ||
        person.nombre.toLowerCase().includes(search) ||
        person.apellido.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => {
      let aValue: any = a[sortField as keyof Person]
      let bValue: any = b[sortField as keyof Person]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{database.name}</h1>
                <p className="text-gray-600">{database.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{data.persons.length}</div>
              <div className="text-sm text-gray-500">de 2000 personas</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="persons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="persons" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Personas</span>
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Campos</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="persons" className="space-y-6">
            {/* Controles de búsqueda y ordenamiento */}
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Personas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por DNI, nombre o apellido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortField} onValueChange={setSortField}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nombre">Nombre</SelectItem>
                        <SelectItem value="apellido">Apellido</SelectItem>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="edad">Edad</SelectItem>
                        <SelectItem value="fechaNacimiento">Fecha Nac.</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    >
                      {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                    <Button onClick={() => setShowPersonForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Persona
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PersonList
              persons={filteredAndSortedPersons}
              customFields={data.customFields}
              onEdit={handleEditPerson}
              onDelete={handleDeletePerson}
            />
          </TabsContent>

          <TabsContent value="fields">
            <CustomFieldManager customFields={data.customFields} onUpdate={updateCustomFields} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsView persons={data.persons} customFields={data.customFields} databaseName={database.name} />
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" onClick={() => exportToExcel()}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar a Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    size="lg"
                    onClick={() => exportDatabaseData()}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Base de Datos Actual
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Previa para Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para agregar/editar persona */}
        <Dialog open={showPersonForm} onOpenChange={setShowPersonForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPerson ? "Editar Persona" : "Agregar Nueva Persona"}</DialogTitle>
            </DialogHeader>
            <PersonForm
              person={editingPerson}
              customFields={data.customFields}
              onSubmit={(personData) => {
                const success = editingPerson ? updatePerson(personData) : addPerson(personData)

                if (success) {
                  setShowPersonForm(false)
                  setEditingPerson(null)
                }
              }}
              onCancel={() => {
                setShowPersonForm(false)
                setEditingPerson(null)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de contraseña para edición */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contraseña de Edición</DialogTitle>
              <DialogDescription>Ingresa la contraseña de edición para continuar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editPasswordInput">Contraseña</Label>
                <Input
                  id="editPasswordInput"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verifyEditPassword()}
                  placeholder="Ingresa la contraseña de edición"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={verifyEditPassword}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
