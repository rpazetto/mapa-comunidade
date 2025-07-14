'use client'

import React, { useState } from 'react'
import { Shield, Smartphone, Copy, Check, AlertCircle } from 'lucide-react'

interface TwoFactorSetupProps {
  onClose?: () => void
  onSuccess?: () => void
}

export default function TwoFactorSetup({ onClose, onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Passo 1: Gerar QR Code
  const generateQRCode = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/2fa-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code')
      }
      
      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep('verify')
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar 2FA')
    } finally {
      setLoading(false)
    }
  }

  // Passo 2: Verificar código e ativar
  const activateTwoFactor = async () => {
    if (verificationCode.length !== 6) {
      setError('Digite um código de 6 dígitos')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/2fa-setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Código inválido')
      }
      
      setStep('complete')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao ativar 2FA')
    } finally {
      setLoading(false)
    }
  }

  // Copiar código para clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Download dos códigos de backup
  const downloadBackupCodes = () => {
    const content = `CÓDIGOS DE BACKUP - MAPA COMUNIDADE
================================================
IMPORTANTE: Guarde estes códigos em local seguro!
Cada código pode ser usado apenas uma vez.
================================================

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

================================================
Gerado em: ${new Date().toLocaleString('pt-BR')}
================================================`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mapa-comunidade-backup-codes.txt'
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold">Configurar Autenticação em 2 Fatores</h2>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Proteja sua conta com 2FA
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  A autenticação em dois fatores adiciona uma camada extra de segurança 
                  à sua conta, exigindo um código do seu celular além da senha.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Você vai precisar:</h4>
                <ul className="space-y-1 text-blue-800">
                  <li>• Um smartphone com Google Authenticator ou similar</li>
                  <li>• Cerca de 2 minutos para configuração</li>
                  <li>• Um local seguro para guardar códigos de backup</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={generateQRCode}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Gerando...' : 'Começar Configuração'}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="w-full text-gray-600 hover:text-gray-800 py-2"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Passo 1: Escaneie o QR Code
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  {qrCode && (
                    <img 
                      src={qrCode} 
                      alt="QR Code para 2FA" 
                      className="mx-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Abra o Google Authenticator e escaneie este código
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Não consegue escanear? Digite manualmente:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                    {secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secret)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copiedCode === secret ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Passo 2: Digite o código de verificação
                </h3>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  autoComplete="one-time-code"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Digite o código de 6 dígitos do seu app autenticador
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={activateTwoFactor}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Ativando...' : 'Ativar 2FA'}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  2FA Ativado com Sucesso!
                </h3>
                <p className="text-gray-600">
                  Sua conta agora está protegida com autenticação em dois fatores
                </p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-900 mb-3">
                  ⚠️ IMPORTANTE: Salve seus códigos de backup
                </h4>
                <p className="text-sm text-yellow-800 mb-4">
                  Use estes códigos caso perca acesso ao seu dispositivo. 
                  Cada código pode ser usado apenas uma vez.
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white p-2 rounded border border-yellow-300 font-mono text-sm flex items-center justify-between"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedCode === code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={downloadBackupCodes}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Baixar Códigos de Backup
                </button>
              </div>

              <button
                onClick={onClose || (() => window.location.reload())}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
