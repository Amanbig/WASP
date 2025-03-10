"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import appwriteService from '@/services/appwriteService'
import { LogOut, User, Settings, FileText } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await appwriteService.getCurrentUser()
        if (!currentUser) {
          router.push('/login')
        } else {
          setUser(currentUser)
        }
      } catch (error) {
        console.log('Failed to fetch user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [router])

  const handleLogout = async () => {
    try {
      await appwriteService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-700">
        <p className="text-white text-lg animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  if (!user) return null

  // Determine avatar source - Google OAuth provides avatar in prefs
  const avatarUrl = user.prefs?.picture || '' // Google OAuth stores avatar in prefs.picture
  const displayName = user.name || user.email.split('@')[0]
  const avatarFallback = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <div className="text-white text-xl font-bold">Dashboard</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-gray-700">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {displayName}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">This is your dashboard. Here you can manage your files and settings.</p>
            </CardContent>
          </Card>

          {/* Menu Elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">View and manage your uploaded files</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Configure your account preferences</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Update your personal information</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}