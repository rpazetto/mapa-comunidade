'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Lock, Smartphone, ChevronRight, AlertCircle } from 'lucide-react'
import TwoFactorSetup from '@/app/components/TwoFactorSetup'
import { useRouter } from 'next/navigation'

export default function SecurityPage() {
  const [showSetup, setShowSetup] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar status do 2FA
  useEffect(() => {
    checkTwoFactorStatus()
  }, [])

  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-2fa-status')
      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupComplete = () => {
    setTwoFactorEnabled(true)
    setShowSetup(false)
    checkTwoFactorStatus()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Configurações de Segurança
              </h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Card 2FA */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Autenticação em Dois Fatores (2FA)
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Adicione uma camada extra de segurança à sua conta com códigos temporários
                  </p>
                  
                  {twoFactorEnabled ? (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">2FA Ativado</span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>2FA não configurado - Sua conta está vulnerável</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setShowSetup(true)}
                disabled={twoFactorEnabled}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  twoFactorEnabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {twoFactorEnabled ? 'Configurado' : 'Configurar'}
              </button>
            </div>
          </div>
        </div>

        {/* Outras opções de segurança */}
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y">
            {/* Alterar senha */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Alterar Senha</h3>
                    <p className="text-sm text-gray-600">
                      Última alteração: há 30 dias
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Sessões ativas */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Smartphone className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sessões Ativas</h3>
                    <p className="text-sm text-gray-600">
                      1 dispositivo conectado
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Setup 2FA */}
      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TwoFactorSetup
              onClose={() => setShowSetup(false)}
              onSuccess={handleSetupComplete}
            />
          </div>
        </div>
      )}
    </div>
  )
}
