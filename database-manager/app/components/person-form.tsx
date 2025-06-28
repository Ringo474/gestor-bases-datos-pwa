"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"

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

interface PersonFormProps {
  person?: Person | null
  customFields: CustomField[]
  onSubmit: (personData: Omit<Person, "id" | "edad" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function PersonForm({ person, customFields, onSubmit, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    domicilio: "",
    telefono: "",
    email: "",
    customFields: {} as Record<string, any>,
  })

  const [calculatedAge, setCalculatedAge] = useState<number>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (person) {
      setFormData({
        dni: person.dni,
        nombre: person.nombre,
        apellido: person.apellido,
        fechaNacimiento: person.fechaNacimiento,
        domicilio: person.domicilio || "",
        telefono: person.telefono || "",
        email: person.email || "",
        customFields: person.customFields || {},
      })
      setCalculatedAge(person.edad)
    } else {
      setFormData({
        dni: "",
        nombre: "",
        apellido: "",
        fechaNacimiento: "",
        domicilio: "",
        telefono: "",
        email: "",
        customFields: {},
      })
      setCalculatedAge(0)
    }
  }, [person])

  // Calcular edad en tiempo real cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const today = new Date()
      const birth = new Date(formData.fechaNacimiento)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      setCalculatedAge(age >= 0 ? age : 0)
    } else {
      setCalculatedAge(0)
    }
  }, [formData.fechaNacimiento])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar DNI
    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es obligatorio"
    } else if (!/^\d+$/.test(formData.dni)) {
      newErrors.dni = "El DNI debe contener solo números enteros"
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria"
    } else {
      const birthDate = new Date(formData.fechaNacimiento)
      const today = new Date()
      if (birthDate > today) {
        newErrors.fechaNacimiento = "La fecha de nacimiento no puede ser futura"
      }
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido"
    }

    // Validar campos personalizados requeridos
    customFields.forEach((field) => {
      if (field.required && !formData.customFields[field.id]) {
        newErrors[`custom_${field.id}`] = `${field.name} es obligatorio`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value,
      },
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos obligatorios básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Información Personal Básica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dni">DNI * (solo números)</Label>
              <Input
                id="dni"
                type="text"
                value={formData.dni}
                onChange={(e) => {
                  // Solo permitir números enteros
                  const value = e.target.value.replace(/\D/g, "")
                  setFormData((prev) => ({ ...prev, dni: value }))
                }}
                placeholder="12345678"
                className={errors.dni ? "border-red-500" : ""}
              />
              {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni}</p>}
            </div>

            <div>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fechaNacimiento: e.target.value }))}
                  className={`flex-1 ${errors.fechaNacimiento ? "border-red-500" : ""}`}
                />
                {calculatedAge > 0 && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{calculatedAge} años</span>
                  </Badge>
                )}
              </div>
              {errors.fechaNacimiento && <p className="text-sm text-red-500 mt-1">{errors.fechaNacimiento}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Juan"
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData((prev) => ({ ...prev, apellido: e.target.value }))}
                placeholder="Pérez"
                className={errors.apellido ? "border-red-500" : ""}
              />
              {errors.apellido && <p className="text-sm text-red-500 mt-1">{errors.apellido}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos de contacto predefinidos */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="domicilio">Domicilio</Label>
            <Input
              id="domicilio"
              type="text"
              value={formData.domicilio}
              onChange={(e) => setFormData((prev) => ({ ...prev, domicilio: e.target.value }))}
              placeholder="Calle, Número, Ciudad"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="ejemplo@correo.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos personalizados adicionales */}
      {customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional Personalizada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={`custom_${field.id}`}>
                      {field.name} {field.required && "*"}
                    </Label>

                    {field.type === "text" && (
                      <Input
                        id={`custom_${field.id}`}
                        type="text"
                        value={formData.customFields[field.id] || ""}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        className={errors[`custom_${field.id}`] ? "border-red-500" : ""}
                      />
                    )}

                    {field.type === "number" && (
                      <Input
                        id={`custom_${field.id}`}
                        type="text"
                        value={formData.customFields[field.id] || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
                            handleCustomFieldChange(field.id, value)
                          }
                        }}
                        placeholder="0.00"
                        className={errors[`custom_${field.id}`] ? "border-red-500" : ""}
                      />
                    )}

                    {field.type === "date" && (
                      <Input
                        id={`custom_${field.id}`}
                        type="date"
                        value={formData.customFields[field.id] || ""}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        className={errors[`custom_${field.id}`] ? "border-red-500" : ""}
                      />
                    )}

                    {field.type === "boolean" && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch
                          id={`custom_${field.id}`}
                          checked={formData.customFields[field.id] || false}
                          onCheckedChange={(checked) => handleCustomFieldChange(field.id, checked)}
                        />
                        <Label htmlFor={`custom_${field.id}`} className="text-sm">
                          {formData.customFields[field.id] ? "SÍ" : "NO"}
                        </Label>
                      </div>
                    )}

                    {errors[`custom_${field.id}`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`custom_${field.id}`]}</p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{person ? "Actualizar" : "Agregar"} Persona</Button>
      </div>
    </form>
  )
}
