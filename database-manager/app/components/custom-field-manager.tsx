"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CustomField {
  id: string
  name: string
  type: "text" | "number" | "date" | "boolean"
  required: boolean
  order: number
}

interface CustomFieldManagerProps {
  customFields: CustomField[]
  onUpdate: (fields: CustomField[]) => void
}

export function CustomFieldManager({ customFields, onUpdate }: CustomFieldManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "text" as CustomField["type"],
    required: false,
  })
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      name: "",
      type: "text",
      required: false,
    })
    setEditingField(null)
  }

  const openDialog = (field?: CustomField) => {
    if (field) {
      setEditingField(field)
      setFormData({
        name: field.name,
        type: field.type,
        required: field.required,
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const saveField = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del campo es obligatorio",
        variant: "destructive",
      })
      return
    }

    // Verificar que no exista otro campo con el mismo nombre
    const existingField = customFields.find(
      (f) => f.name.toLowerCase() === formData.name.toLowerCase() && f.id !== editingField?.id,
    )

    if (existingField) {
      toast({
        title: "Error",
        description: "Ya existe un campo con ese nombre",
        variant: "destructive",
      })
      return
    }

    let updatedFields: CustomField[]

    if (editingField) {
      // Editar campo existente
      updatedFields = customFields.map((field) => (field.id === editingField.id ? { ...field, ...formData } : field))
      toast({
        title: "Campo actualizado",
        description: `El campo "${formData.name}" ha sido actualizado`,
      })
    } else {
      // Crear nuevo campo
      const newField: CustomField = {
        id: Date.now().toString(),
        ...formData,
        order: customFields.length,
      }
      updatedFields = [...customFields, newField]
      toast({
        title: "Campo creado",
        description: `El campo "${formData.name}" ha sido creado`,
      })
    }

    onUpdate(updatedFields)
    setShowDialog(false)
    resetForm()
  }

  const deleteField = (fieldId: string) => {
    const field = customFields.find((f) => f.id === fieldId)
    if (field && confirm(`¿Estás seguro de que deseas eliminar el campo "${field.name}"?`)) {
      const updatedFields = customFields.filter((f) => f.id !== fieldId)
      onUpdate(updatedFields)
      toast({
        title: "Campo eliminado",
        description: `El campo "${field.name}" ha sido eliminado`,
      })
    }
  }

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const currentIndex = customFields.findIndex((f) => f.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= customFields.length) return

    const updatedFields = [...customFields]
    const [movedField] = updatedFields.splice(currentIndex, 1)
    updatedFields.splice(newIndex, 0, movedField)

    // Actualizar el orden
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index,
    }))

    onUpdate(reorderedFields)
  }

  const getTypeLabel = (type: CustomField["type"]) => {
    switch (type) {
      case "text":
        return "Texto"
      case "number":
        return "Número"
      case "date":
        return "Fecha"
      case "boolean":
        return "Sí/No"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campos Personalizados</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Configura campos adicionales para recopilar información específica
              </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Campo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingField ? "Editar Campo" : "Nuevo Campo"}</DialogTitle>
                  <DialogDescription>
                    {editingField ? "Modifica las propiedades del campo" : "Configura un nuevo campo personalizado"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fieldName">Nombre del Campo</Label>
                    <Input
                      id="fieldName"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Teléfono, Dirección, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldType">Tipo de Campo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: CustomField["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número (con decimales)</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="boolean">Sí/No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="fieldRequired"
                      checked={formData.required}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, required: checked }))}
                    />
                    <Label htmlFor="fieldRequired">Campo obligatorio</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveField}>{editingField ? "Actualizar" : "Crear"} Campo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {customFields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay campos personalizados configurados</p>
              <Button variant="outline" onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Campo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {customFields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{field.name}</div>
                        <div className="text-sm text-gray-500">
                          {getTypeLabel(field.type)}
                          {field.required && " • Obligatorio"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveField(field.id, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveField(field.id, "down")}
                        disabled={index === customFields.length - 1}
                      >
                        ↓
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog(field)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteField(field.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
