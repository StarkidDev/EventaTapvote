'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Navigation } from '@/components/layout/Navigation'
import toast from 'react-hot-toast'

export default function OrganizerSetup() {
  const [organizationName, setOrganizationName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organizationName) {
      toast.error('Please enter your organization name')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('organizers')
        .insert({
          user_id: user.id,
          organization_name: organizationName,
          phone: phone || null,
        })

      if (error) throw error

      toast.success('Organizer profile created successfully!')
      router.push('/organizer/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create organizer profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Complete Your Organizer Profile
          </h1>
          
          <p className="text-gray-600 mb-8">
            Before you can create events, we need some information about your organization.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event Masters Ltd."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This name will be displayed on all your events
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="+233 XX XXX XXXX"
              />
              <p className="mt-1 text-sm text-gray-500">
                For important updates about your events
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Important Information
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your organizer account is pending approval</li>
                <li>• You can create events immediately, but they won't be visible until approved</li>
                <li>• Platform commission is {process.env.NEXT_PUBLIC_PLATFORM_COMMISSION || '10'}% on all earnings</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Create Profile
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}