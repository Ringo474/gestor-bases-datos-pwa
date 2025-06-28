"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Database, Lock, Key, Download, Upload, Edit, Trash2 } from "lucide-react"
import { DatabaseManager } from "./components/database-manager"
import { InstallPrompt } from "./components/install-prompt"
import { useToast } from "@/hooks/use-toast"
import { EditDatabaseForm } from "./components/edit-database-form"

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

export default function HomePage() {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInfo | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
  const [pendingDatabase, setPendingDatabase] = useState<DatabaseInfo | null>(null)
  const [passwordInput, setPasswordInput] = useState("")
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("")
  const { toast } = useToast()

  // Estados adicionales
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showEditDatabaseDialog, setShowEditDatabaseDialog] = useState(false)
  const [editingDatabase, setEditingDatabase] = useState<DatabaseInfo | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Formulario para nueva base de datos
  const [newDatabase, setNewDatabase] = useState({
    name: "",
    description: "",
    password: "",
    editPassword: "",
    recoveryKey: "",
  })

  useEffect(() => {
    loadDatabases()
  }, [])

  const loadDatabases = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("databases")
      if (saved) {
        setDatabases(JSON.parse(saved))
      }
    }
  }

  const saveDatabases = (dbs: DatabaseInfo[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("databases", JSON.stringify(dbs))
    }
    setDatabases(dbs)
  }

  const createDatabase = () => {
    if (!newDatabase.name || !newDatabase.password || !newDatabase.editPassword || !newDatabase.recoveryKey) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const database: DatabaseInfo = {
      id: Date.now().toString(),
      name: newDatabase.name,
      description: newDatabase.description,
      password: newDatabase.password,
      editPassword: newDatabase.editPassword,
      recoveryKey: newDatabase.recoveryKey,
      createdAt: new Date().toISOString(),
      personCount: 0,
    }

    const updatedDatabases = [...databases, database]
    saveDatabases(updatedDatabases)

    // Crear estructura de datos para la base de datos con campos predefinidos
    const defaultCustomFields = [
      {
        id: "domicilio",
        name: "DOMICILIO",
        type: "text" as const,
        required: false,
        order: 0,
      },
      {
        id: "telefono",
        name: "TELÉFONO",
        type: "text" as const,
        required: false,
        order: 1,
      },
      {
        id: "email",
        name: "EMAIL",
        type: "text" as const,
        required: false,
        order: 2,
      },
    ]

    if (typeof window !== "undefined") {
      localStorage.setItem(
        `database_${database.id}`,
        JSON.stringify({
          persons: [],
          customFields: defaultCustomFields,
        }),
      )
    }

    setNewDatabase({
      name: "",
      description: "",
      password: "",
      editPassword: "",
      recoveryKey: "",
    })
    setShowCreateDialog(false)

    toast({
      title: "Base de datos creada",
      description: `La base de datos "${database.name}" ha sido creada exitosamente`,
    })
  }

  const openDatabase = (database: DatabaseInfo) => {
    setPendingDatabase(database)
    setPasswordInput("")
    setShowPasswordDialog(true)
  }

  const verifyPassword = () => {
    if (pendingDatabase && passwordInput === pendingDatabase.password) {
      setSelectedDatabase(pendingDatabase)
      setShowPasswordDialog(false)
      setPendingDatabase(null)
      setPasswordInput("")
    } else if (editingDatabase && passwordInput === editingDatabase.editPassword && pendingAction) {
      setShowPasswordDialog(false)
      pendingAction()
      setPendingAction(null)
      setEditingDatabase(null)
      setPasswordInput("")
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "La contraseña ingresada no es válida",
        variant: "destructive",
      })
    }
  }

  const showRecovery = () => {
    setShowPasswordDialog(false)
    setShowRecoveryDialog(true)
    setRecoveryKeyInput("")
  }

  const verifyRecoveryKey = () => {
    if (pendingDatabase && recoveryKeyInput === pendingDatabase.recoveryKey) {
      toast({
        title: "Contraseñas recuperadas",
        description: `Contraseña de base de datos: ${pendingDatabase.password}\nContraseña de edición: ${pendingDatabase.editPassword}`,
      })
      setShowRecoveryDialog(false)
      setPendingDatabase(null)
      setRecoveryKeyInput("")
    } else {
      toast({
        title: "Palabra clave incorrecta",
        description: "La palabra clave ingresada no es válida",
        variant: "destructive",
      })
    }
  }

  const exportAllData = () => {
    try {
      const allData = {
        databases: databases,
        databaseContents: {} as Record<string, any>,
      }

      // Exportar contenido de cada base de datos
      databases.forEach((db) => {
        if (typeof window !== "undefined") {
          const content = localStorage.getItem(`database_${db.id}`)
          if (content) {
            allData.databaseContents[db.id] = JSON.parse(content)
          }
        }
      })

      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `bases-datos-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportación exitosa",
        description: "Los datos han sido exportados correctamente",
      })
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  const importData = async () => {
    if (!importFile) return

    try {
      const text = await importFile.text()
      const importedData = JSON.parse(text)

      if (!importedData.databases || !importedData.databaseContents) {
        throw new Error("Formato de archivo inválido")
      }

      // Confirmar importación
      const confirmImport = confirm(
        `¿Estás seguro de que deseas importar ${importedData.databases.length} base(s) de datos? Esto puede sobrescribir datos existentes.`,
      )

      if (!confirmImport) return

      // Importar bases de datos
      const existingIds = databases.map((db) => db.id)
      const newDatabases = [...databases]

      importedData.databases.forEach((db: DatabaseInfo) => {
        if (!existingIds.includes(db.id)) {
          newDatabases.push(db)
          // Importar contenido de la base de datos
          if (importedData.databaseContents[db.id] && typeof window !== "undefined") {
            localStorage.setItem(`database_${db.id}`, JSON.stringify(importedData.databaseContents[db.id]))
          }
        }
      })

      saveDatabases(newDatabases)
      setShowImportDialog(false)
      setImportFile(null)

      toast({
        title: "Importación exitosa",
        description: `Se importaron ${importedData.databases.length} base(s) de datos`,
      })
    } catch (error) {
      toast({
        title: "Error al importar",
        description: "El archivo no es válido o está corrupto",
        variant: "destructive",
      })
    }
  }

  const requestDatabaseEdit = (database: DatabaseInfo) => {
    setEditingDatabase(database)
    setPasswordInput("")
    setShowPasswordDialog(true)
    setPendingAction(() => () => {
      setShowEditDatabaseDialog(true)
    })
  }

  const requestDatabaseDelete = (database: DatabaseInfo) => {
    setEditingDatabase(database)
    setPasswordInput("")
    setShowPasswordDialog(true)
    setPendingAction(() => () => {
      if (
        confirm(
          `¿Estás seguro de que deseas eliminar la base de datos "${database.name}"? Esta acción no se puede deshacer.`,
        )
      ) {
        deleteDatabase(database.id)
      }
    })
  }

  const deleteDatabase = (databaseId: string) => {
    const updatedDatabases = databases.filter((db) => db.id !== databaseId)
    saveDatabases(updatedDatabases)
    if (typeof window !== "undefined") {
      localStorage.removeItem(`database_${databaseId}`)
    }

    toast({
      title: "Base de datos eliminada",
      description: "La base de datos ha sido eliminada exitosamente",
    })
  }

  const updateDatabase = (updatedDb: DatabaseInfo) => {
    const updatedDatabases = databases.map((db) => (db.id === updatedDb.id ? updatedDb : db))
    saveDatabases(updatedDatabases)
    setShowEditDatabaseDialog(false)
    setEditingDatabase(null)

    toast({
      title: "Base de datos actualizada",
      description: "Los datos de la base de datos han sido actualizados",
    })
  }

  const updatePersonCount = (databaseId: string, count: number) => {
    const updatedDatabases = databases.map((db) => (db.id === databaseId ? { ...db, personCount: count } : db))
    saveDatabases(updatedDatabases)
  }

  if (selectedDatabase) {
    return (
      <DatabaseManager
        database={selectedDatabase}
        onBack={() => setSelectedDatabase(null)}
        onUpdatePersonCount={updatePersonCount}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestor de Bases de Datos</h1>
          <p className="text-gray-600">Administra múltiples bases de datos de personas de forma segura</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Mis Bases de Datos ({databases.length})</h2>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Datos
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar Datos
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Base de Datos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.map((database) => (
            <Card key={database.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Database className="w-8 h-8 text-blue-600" />
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => requestDatabaseEdit(database)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => requestDatabaseDelete(database)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <CardTitle className="text-lg">{database.name}</CardTitle>
                <CardDescription>{database.description || "Sin descripción"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Personas: {database.personCount}</div>
                  <div>Creada: {new Date(database.createdAt).toLocaleDateString()}</div>
                </div>
                <Button className="w-full mt-4" onClick={() => openDatabase(database)}>
                  Abrir Base de Datos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {databases.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">No hay bases de datos</h3>
            <p className="text-gray-400 mb-6">Crea tu primera base de datos para comenzar</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Base de Datos
            </Button>
          </div>
        )}

        {/* Componente de instalación PWA */}
        <InstallPrompt />

        {/* Dialog de contraseña */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Acceso a Base de Datos</DialogTitle>
              <DialogDescription>Ingresa la contraseña para acceder a "{pendingDatabase?.name}"</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="passwordInput">Contraseña</Label>
                <Input
                  id="passwordInput"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
                  placeholder="Ingresa la contraseña"
                />
              </div>
            </div>
            <DialogFooter className="flex-col space-y-2">
              <div className="flex space-x-2 w-full">
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={verifyPassword} className="flex-1">
                  Acceder
                </Button>
              </div>
              <Button variant="link" onClick={showRecovery} className="text-sm">
                <Key className="w-4 h-4 mr-1" />
                ¿Olvidaste la contraseña?
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de recuperación */}
        <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Recuperar Contraseñas</DialogTitle>
              <DialogDescription>
                Ingresa la palabra clave de recuperación para "{pendingDatabase?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recoveryInput">Palabra Clave</Label>
                <Input
                  id="recoveryInput"
                  value={recoveryKeyInput}
                  onChange={(e) => setRecoveryKeyInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && verifyRecoveryKey()}
                  placeholder="Ingresa la palabra clave"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRecoveryDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={verifyRecoveryKey}>Recuperar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de exportar datos */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Exportar Datos</DialogTitle>
              <DialogDescription>
                Exporta todas tus bases de datos para transferirlas a otro dispositivo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿Qué se exportará?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Todas las bases de datos ({databases.length})</li>
                  <li>• Todas las personas registradas</li>
                  <li>• Campos personalizados</li>
                  <li>• Configuraciones y contraseñas</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  exportAllData()
                  setShowExportDialog(false)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de importar datos */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Importar Datos</DialogTitle>
              <DialogDescription>Importa bases de datos desde otro dispositivo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="importFile">Seleccionar archivo de respaldo</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
              {importFile && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">Archivo seleccionado: {importFile.name}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={importData} disabled={!importFile}>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de editar base de datos */}
        {editingDatabase && (
          <Dialog open={showEditDatabaseDialog} onOpenChange={setShowEditDatabaseDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Base de Datos</DialogTitle>
                <DialogDescription>Modifica la información de "{editingDatabase.name}"</DialogDescription>
              </DialogHeader>
              <EditDatabaseForm
                database={editingDatabase}
                onSave={updateDatabase}
                onCancel={() => {
                  setShowEditDatabaseDialog(false)
                  setEditingDatabase(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog de crear nueva base de datos */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Base de Datos</DialogTitle>
              <DialogDescription>Configura una nueva base de datos con contraseñas de seguridad</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={newDatabase.name}
                  onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
                  placeholder="Ej: Clientes 2024"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newDatabase.description}
                  onChange={(e) => setNewDatabase({ ...newDatabase, description: e.target.value })}
                  placeholder="Descripción opcional"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña de Base de Datos *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newDatabase.password}
                  onChange={(e) => setNewDatabase({ ...newDatabase, password: e.target.value })}
                  placeholder="Para acceder a la base de datos"
                />
              </div>
              <div>
                <Label htmlFor="editPassword">Contraseña de Edición *</Label>
                <Input
                  id="editPassword"
                  type="password"
                  value={newDatabase.editPassword}
                  onChange={(e) => setNewDatabase({ ...newDatabase, editPassword: e.target.value })}
                  placeholder="Para editar/borrar datos"
                />
              </div>
              <div>
                <Label htmlFor="recoveryKey">Palabra Clave de Recuperación *</Label>
                <Input
                  id="recoveryKey"
                  value={newDatabase.recoveryKey}
                  onChange={(e) => setNewDatabase({ ...newDatabase, recoveryKey: e.target.value })}
                  placeholder="Para recuperar contraseñas"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={createDatabase}>Crear Base de Datos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
