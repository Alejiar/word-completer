export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      configuracion: {
        Row: {
          clave: string
          descripcion: string | null
          id: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          clave: string
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          clave?: string
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      ingresos: {
        Row: {
          created_at: string | null
          espacio: string
          estado: string
          fecha_entrada: string
          id: string
          numero_casco: string | null
          placa: string
          ticket_code: string
          tipo_cobro: string
          tipo_vehiculo: string
        }
        Insert: {
          created_at?: string | null
          espacio: string
          estado?: string
          fecha_entrada?: string
          id?: string
          numero_casco?: string | null
          placa: string
          ticket_code: string
          tipo_cobro?: string
          tipo_vehiculo: string
        }
        Update: {
          created_at?: string | null
          espacio?: string
          estado?: string
          fecha_entrada?: string
          id?: string
          numero_casco?: string | null
          placa?: string
          ticket_code?: string
          tipo_cobro?: string
          tipo_vehiculo?: string
        }
        Relationships: []
      }
      mensualidad_pagos: {
        Row: {
          anio_pagado: number
          created_at: string | null
          fecha_pago: string
          id: string
          mensualidad_id: string
          mes_pagado: number
          monto: number
        }
        Insert: {
          anio_pagado: number
          created_at?: string | null
          fecha_pago?: string
          id?: string
          mensualidad_id: string
          mes_pagado: number
          monto: number
        }
        Update: {
          anio_pagado?: number
          created_at?: string | null
          fecha_pago?: string
          id?: string
          mensualidad_id?: string
          mes_pagado?: number
          monto?: number
        }
        Relationships: [
          {
            foreignKeyName: "mensualidad_pagos_mensualidad_id_fkey"
            columns: ["mensualidad_id"]
            isOneToOne: false
            referencedRelation: "mensualidades"
            referencedColumns: ["id"]
          },
        ]
      }
      mensualidades: {
        Row: {
          created_at: string | null
          dia_corte: number
          estado: string
          fecha_inicio: string
          id: string
          nombre_cliente: string
          placa: string
          precio: number
          telefono: string | null
          tipo_vehiculo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dia_corte?: number
          estado?: string
          fecha_inicio: string
          id?: string
          nombre_cliente: string
          placa: string
          precio?: number
          telefono?: string | null
          tipo_vehiculo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dia_corte?: number
          estado?: string
          fecha_inicio?: string
          id?: string
          nombre_cliente?: string
          placa?: string
          precio?: number
          telefono?: string | null
          tipo_vehiculo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pagos: {
        Row: {
          convenio: boolean
          created_at: string | null
          descuento: number
          estado: string
          fecha_pago: string
          id: string
          mensualidad_pago_id: string | null
          metodo_pago: string
          placa: string
          salida_id: string | null
          subtotal: number
          tipo_cobro: string
          tipo_vehiculo: string
          total: number
        }
        Insert: {
          convenio?: boolean
          created_at?: string | null
          descuento?: number
          estado?: string
          fecha_pago?: string
          id?: string
          mensualidad_pago_id?: string | null
          metodo_pago?: string
          placa: string
          salida_id?: string | null
          subtotal?: number
          tipo_cobro: string
          tipo_vehiculo: string
          total?: number
        }
        Update: {
          convenio?: boolean
          created_at?: string | null
          descuento?: number
          estado?: string
          fecha_pago?: string
          id?: string
          mensualidad_pago_id?: string | null
          metodo_pago?: string
          placa?: string
          salida_id?: string | null
          subtotal?: number
          tipo_cobro?: string
          tipo_vehiculo?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_mensualidad_pago"
            columns: ["mensualidad_pago_id"]
            isOneToOne: false
            referencedRelation: "mensualidad_pagos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_salida_id_fkey"
            columns: ["salida_id"]
            isOneToOne: false
            referencedRelation: "salidas"
            referencedColumns: ["id"]
          },
        ]
      }
      salidas: {
        Row: {
          convenio: boolean
          created_at: string | null
          descuento: number
          duracion_minutos: number
          fecha_entrada: string
          fecha_salida: string
          id: string
          ingreso_id: string
          placa: string
          subtotal: number
          tipo_cobro: string
          tipo_vehiculo: string
          total: number
        }
        Insert: {
          convenio?: boolean
          created_at?: string | null
          descuento?: number
          duracion_minutos?: number
          fecha_entrada: string
          fecha_salida?: string
          id?: string
          ingreso_id: string
          placa: string
          subtotal?: number
          tipo_cobro: string
          tipo_vehiculo: string
          total?: number
        }
        Update: {
          convenio?: boolean
          created_at?: string | null
          descuento?: number
          duracion_minutos?: number
          fecha_entrada?: string
          fecha_salida?: string
          id?: string
          ingreso_id?: string
          placa?: string
          subtotal?: number
          tipo_cobro?: string
          tipo_vehiculo?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "salidas_ingreso_id_fkey"
            columns: ["ingreso_id"]
            isOneToOne: false
            referencedRelation: "ingresos"
            referencedColumns: ["id"]
          },
        ]
      }
      tarifas: {
        Row: {
          id: string
          precio: number
          tipo_cobro: string
          tipo_vehiculo: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          precio?: number
          tipo_cobro: string
          tipo_vehiculo: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          precio?: number
          tipo_cobro?: string
          tipo_vehiculo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vehiculos: {
        Row: {
          created_at: string | null
          id: string
          placa: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          placa: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          placa?: string
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
