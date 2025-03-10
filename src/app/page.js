"use client"

import React, { useEffect, useState } from 'react'
import Image from "next/image"
import LoginPage from "./(auth)/login/page"
import { useRouter } from 'next/navigation'
import appwriteService from '@/services/appwriteService'

export default function Home() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await appwriteService.getCurrentUser()
        if (user) {
          // User is logged in, redirect to dashboard
          router.push('/dashboard')
        }
      } catch (error) {
        console.log('No active session found:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [router])

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-700">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  // If not logged in, show the LoginPage
  return (
    <div>
      <LoginPage />
    </div>
  )
}