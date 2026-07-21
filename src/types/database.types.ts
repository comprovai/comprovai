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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atendimentos_humanos: {
        Row: {
          criado_em: string
          empresa_id: string | null
          id: string
          origem: string
          pagina: string | null
          resumo: string
          status: string
          transcricao: Json
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          empresa_id?: string | null
          id?: string
          origem: string
          pagina?: string | null
          resumo: string
          status?: string
          transcricao: Json
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          empresa_id?: string | null
          id?: string
          origem?: string
          pagina?: string | null
          resumo?: string
          status?: string
          transcricao?: Json
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_humanos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_humanos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_despesa: {
        Row: {
          empresa_id: string
          id: string
          limite_valor: number | null
          nome: string
        }
        Insert: {
          empresa_id: string
          id?: string
          limite_valor?: number | null
          nome: string
        }
        Update: {
          empresa_id?: string
          id?: string
          limite_valor?: number | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_despesa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cnpj: string | null
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          cnpj?: string | null
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          cnpj?: string | null
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      comprovantes: {
        Row: {
          criado_em: string
          despesa_id: string
          extraido_ia: Json | null
          id: string
          url_arquivo: string
        }
        Insert: {
          criado_em?: string
          despesa_id: string
          extraido_ia?: Json | null
          id?: string
          url_arquivo: string
        }
        Update: {
          criado_em?: string
          despesa_id?: string
          extraido_ia?: Json | null
          id?: string
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "comprovantes_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_bancarios_empresa: {
        Row: {
          agencia: string | null
          banco: string | null
          chave_pix: string | null
          conta: string | null
          empresa_id: string
          id: string
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          chave_pix?: string | null
          conta?: string | null
          empresa_id: string
          id?: string
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          chave_pix?: string | null
          conta?: string | null
          empresa_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_bancarios_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          aprovado_em: string | null
          aprovador_id: string | null
          atualizado_em: string
          categoria_id: string | null
          cliente_id: string | null
          colaborador_id: string
          confirmado_colaborador: boolean
          criado_em: string
          criado_offline: boolean
          data_despesa: string
          data_pagamento: string | null
          empresa_id: string
          fornecedor: string | null
          id: string
          motivo_reprovacao: string | null
          origem_ia: Json | null
          projeto_id: string | null
          status: string
          sync_status: string
          tipo: string
          valor: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          atualizado_em?: string
          categoria_id?: string | null
          cliente_id?: string | null
          colaborador_id: string
          confirmado_colaborador?: boolean
          criado_em?: string
          criado_offline?: boolean
          data_despesa: string
          data_pagamento?: string | null
          empresa_id: string
          fornecedor?: string | null
          id?: string
          motivo_reprovacao?: string | null
          origem_ia?: Json | null
          projeto_id?: string | null
          status?: string
          sync_status?: string
          tipo: string
          valor: number
        }
        Update: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          atualizado_em?: string
          categoria_id?: string | null
          cliente_id?: string | null
          colaborador_id?: string
          confirmado_colaborador?: boolean
          criado_em?: string
          criado_offline?: boolean
          data_despesa?: string
          data_pagamento?: string | null
          empresa_id?: string
          fornecedor?: string | null
          id?: string
          motivo_reprovacao?: string | null
          origem_ia?: Json | null
          projeto_id?: string | null
          status?: string
          sync_status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_despesa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_exclusoes: {
        Row: {
          colaborador_id: string
          criado_em: string
          despesa_id: string
          empresa_id: string
          excluido_por: string
          excluido_por_role: string
          id: string
          status_no_momento: string
          valor: number
        }
        Insert: {
          colaborador_id: string
          criado_em?: string
          despesa_id: string
          empresa_id: string
          excluido_por: string
          excluido_por_role: string
          id?: string
          status_no_momento: string
          valor: number
        }
        Update: {
          colaborador_id?: string
          criado_em?: string
          despesa_id?: string
          empresa_id?: string
          excluido_por?: string
          excluido_por_role?: string
          id?: string
          status_no_momento?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_exclusoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_exclusoes_excluido_por_fkey"
            columns: ["excluido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_gerados: {
        Row: {
          assinatura_ip: string | null
          assinatura_timestamp: string | null
          assinatura_url: string | null
          assinatura_user_agent: string | null
          cliente_id: string | null
          colaborador_id: string | null
          criado_em: string
          criado_por: string
          data_emissao: string
          destinatario_tipo: string
          empresa_id: string
          id: string
          numero: string
          pdf_url: string | null
          status: string
          tipo_documento: string
          valor_total: number
        }
        Insert: {
          assinatura_ip?: string | null
          assinatura_timestamp?: string | null
          assinatura_url?: string | null
          assinatura_user_agent?: string | null
          cliente_id?: string | null
          colaborador_id?: string | null
          criado_em?: string
          criado_por: string
          data_emissao?: string
          destinatario_tipo: string
          empresa_id: string
          id?: string
          numero: string
          pdf_url?: string | null
          status?: string
          tipo_documento: string
          valor_total: number
        }
        Update: {
          assinatura_ip?: string | null
          assinatura_timestamp?: string | null
          assinatura_url?: string | null
          assinatura_user_agent?: string | null
          cliente_id?: string | null
          colaborador_id?: string | null
          criado_em?: string
          criado_por?: string
          data_emissao?: string
          destinatario_tipo?: string
          empresa_id?: string
          id?: string
          numero?: string
          pdf_url?: string | null
          status?: string
          tipo_documento?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_gerados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_gerados_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_gerados_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_gerados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_gerados_itens: {
        Row: {
          despesa_id: string
          documento_gerado_id: string
          id: string
        }
        Insert: {
          despesa_id: string
          documento_gerado_id: string
          id?: string
        }
        Update: {
          despesa_id?: string
          documento_gerado_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_gerados_itens_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_gerados_itens_documento_gerado_id_fkey"
            columns: ["documento_gerado_id"]
            isOneToOne: false
            referencedRelation: "documentos_gerados"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_numeracao: {
        Row: {
          ano: number
          empresa_id: string
          tipo_documento: string
          ultimo_numero: number
        }
        Insert: {
          ano: number
          empresa_id: string
          tipo_documento: string
          ultimo_numero?: number
        }
        Update: {
          ano?: number
          empresa_id?: string
          tipo_documento?: string
          ultimo_numero?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_numeracao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          criado_em: string
          dominio_email: string
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          criado_em?: string
          dominio_email: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          criado_em?: string
          dominio_email?: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      historico_aprovacao: {
        Row: {
          acao: string
          criado_em: string
          despesa_id: string
          id: string
          observacao: string | null
          usuario_id: string
        }
        Insert: {
          acao: string
          criado_em?: string
          despesa_id: string
          id?: string
          observacao?: string | null
          usuario_id: string
        }
        Update: {
          acao?: string
          criado_em?: string
          despesa_id?: string
          id?: string
          observacao?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_aprovacao_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_aprovacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          criado_em: string
          email: string
          empresa: string
          id: string
          mensagem: string | null
          nome: string
          telefone: string | null
        }
        Insert: {
          criado_em?: string
          email: string
          empresa: string
          id?: string
          mensagem?: string | null
          nome: string
          telefone?: string | null
        }
        Update: {
          criado_em?: string
          email?: string
          empresa?: string
          id?: string
          mensagem?: string | null
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      projetos_propostas: {
        Row: {
          ativo: boolean
          cliente_id: string | null
          codigo: string | null
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          cliente_id?: string | null
          codigo?: string | null
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          cliente_id?: string | null
          codigo?: string | null
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          criado_em: string
          email: string
          empresa_id: string
          gestor_id: string | null
          id: string
          nome: string
          role: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          email: string
          empresa_id: string
          gestor_id?: string | null
          id: string
          nome: string
          role: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          email?: string
          empresa_id?: string
          gestor_id?: string | null
          id?: string
          nome?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_empresa_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      proximo_numero_documento: {
        Args: { p_ano: number; p_empresa_id: string; p_tipo_documento: string }
        Returns: number
      }
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
