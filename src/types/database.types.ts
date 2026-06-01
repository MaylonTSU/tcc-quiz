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
      alternativas: {
        Row: {
          correta: boolean
          created_at: string
          id: string
          questao_id: string
          texto: string
          updated_at: string
        }
        Insert: {
          correta?: boolean
          created_at?: string
          id?: string
          questao_id: string
          texto: string
          updated_at?: string
        }
        Update: {
          correta?: boolean
          created_at?: string
          id?: string
          questao_id?: string
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alternativas_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "banco_questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      banco_questoes: {
        Row: {
          ativa: boolean
          created_at: string
          disciplina_id: string
          enunciado: string
          explicacao: string | null
          id: string
          nivel_dificuldade: string
          pontos: number
          professor_id: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          disciplina_id: string
          enunciado: string
          explicacao?: string | null
          id?: string
          nivel_dificuldade?: string
          pontos?: number
          professor_id?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          disciplina_id?: string
          enunciado?: string
          explicacao?: string | null
          id?: string
          nivel_dificuldade?: string
          pontos?: number
          professor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banco_questoes_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banco_questoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinas: {
        Row: {
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome_completo: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome_completo: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome_completo?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questoes: {
        Row: {
          id: string
          ordem: number
          questao_id: string
          quiz_id: string
        }
        Insert: {
          id?: string
          ordem?: number
          questao_id: string
          quiz_id: string
        }
        Update: {
          id?: string
          ordem?: number
          questao_id?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "banco_questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questoes_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          ativo: boolean
          codigo_acesso: string
          created_at: string
          disciplina_id: string
          id: string
          liberar_gabarito: boolean | null
          professor_id: string
          quantidade_questoes: number
          tempo_limite_segundos: number | null
          tipo_criacao: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo_acesso: string
          created_at?: string
          disciplina_id: string
          id?: string
          liberar_gabarito?: boolean | null
          professor_id: string
          quantidade_questoes?: number
          tempo_limite_segundos?: number | null
          tipo_criacao?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo_acesso?: string
          created_at?: string
          disciplina_id?: string
          id?: string
          liberar_gabarito?: boolean | null
          professor_id?: string
          quantidade_questoes?: number
          tempo_limite_segundos?: number | null
          tipo_criacao?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking: {
        Row: {
          acertos_totais: number
          aluno_id: string
          id: string
          pontuacao_total: number
          quizzes_respondidos: number
          updated_at: string
        }
        Insert: {
          acertos_totais?: number
          aluno_id: string
          id?: string
          pontuacao_total?: number
          quizzes_respondidos?: number
          updated_at?: string
        }
        Update: {
          acertos_totais?: number
          aluno_id?: string
          id?: string
          pontuacao_total?: number
          quizzes_respondidos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas: {
        Row: {
          acertou: boolean
          alternativa_id: string
          created_at: string
          id: string
          pontos_obtidos: number
          questao_id: string
          tentativa_id: string
        }
        Insert: {
          acertou?: boolean
          alternativa_id: string
          created_at?: string
          id?: string
          pontos_obtidos?: number
          questao_id: string
          tentativa_id: string
        }
        Update: {
          acertou?: boolean
          alternativa_id?: string
          created_at?: string
          id?: string
          pontos_obtidos?: number
          questao_id?: string
          tentativa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_alternativa_id_fkey"
            columns: ["alternativa_id"]
            isOneToOne: false
            referencedRelation: "alternativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "banco_questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_tentativa_id_fkey"
            columns: ["tentativa_id"]
            isOneToOne: false
            referencedRelation: "tentativas"
            referencedColumns: ["id"]
          },
        ]
      }
      tentativas: {
        Row: {
          aluno_id: string
          created_at: string
          finalizada: boolean
          finished_at: string | null
          id: string
          pontuacao_total: number
          quiz_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          finalizada?: boolean
          finished_at?: string | null
          id?: string
          pontuacao_total?: number
          quiz_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          finalizada?: boolean
          finished_at?: string | null
          id?: string
          pontuacao_total?: number
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tentativas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tentativas_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finalizar_tentativa: { Args: { p_tentativa_id: string }; Returns: Json }
      registrar_resposta: {
        Args: {
          p_alternativa_id: string
          p_questao_id: string
          p_tempo_resposta?: number
          p_tentativa_id: string
        }
        Returns: Json
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
