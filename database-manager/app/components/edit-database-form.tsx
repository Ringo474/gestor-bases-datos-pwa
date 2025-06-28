"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface EditDatabaseFormProps {
  database: DatabaseInfo
  onSave: (database: DatabaseInfo) => void
  onCancel: () => void
}

export function EditDatabaseForm({ database, onSave, onCancel }: EditDatabaseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    password: "",
    editPassword: "",
    recoveryKey: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      name: database.name,
      description: database.description,
      password: database.password,
      editPassword: database.editPassword,
      recoveryKey: database.recoveryKey,
    })
  }, [database])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña de base de datos es obligatoria"
    }

    if (!formData.editPassword.trim()) {
      newErrors.editPassword = "La contraseña de edición es obligatoria"
    }

    if (!formData.recoveryKey.trim()) {
      newErrors.recoveryKey = "La palabra clave de recuperación es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const updatedDatabase: DatabaseInfo = {
        ...database,
        ...formData,
      }

      onSave(updatedDatabase)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="editName">Nombre *</Label>
        <Input
          id="editName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nombre de la base de datos"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="editDescription">Descripción</Label>
        <Input
          id="editDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción opcional"
        />
      </div>

      <div>
        <Label htmlFor="editPassword">Contraseña de Base de Datos *</Label>
        <Input
          id="editPassword"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Para acceder a la base de datos"
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
      </div>

      <div>
        <Label htmlFor="editEditPassword">Contraseña de Edición *</Label>
        <Input
          id="editEditPassword"
          type="password"
          value={formData.editPassword}
          onChange={(e) => setFormData({ ...formData, editPassword: e.target.value })}
          placeholder="Para editar/borrar datos"
          className={errors.editPassword ? "border-red-500" : ""}
        />
        {errors.editPassword && <p className="text-sm text-red-500 mt-1">{errors.editPassword}</p>}
      </div>

      <div>
        <Label htmlFor="editRecoveryKey">Palabra Clave de Recuperación *</Label>
        <Input
          id="editRecoveryKey"
          value={formData.recoveryKey}
          onChange={(e) => setFormData({ ...formData, recoveryKey: e.target.value })}
          placeholder="Para recuperar contraseñas"
          className={errors.recoveryKey ? "border-red-500" : ""}
        />
        {errors.recoveryKey && <p className="text-sm text-red-500 mt-1">{errors.recoveryKey}</p>}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar Cambios</Button>
      </div>
    </form>
  )
}
