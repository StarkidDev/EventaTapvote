'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Navigation } from '@/components/layout/Navigation'
import toast from 'react-hot-toast'
import { Calendar, DollarSign, Image as ImageIcon } from 'lucide-react'

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [votePrice, setVotePrice] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !votePrice || !startDate || !endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date')
      return
    }

    if (parseFloat(votePrice) <= 0) {
      toast.error('Vote price must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get organizer ID
      const { data: organizer, error: orgError } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (orgError || !organizer) throw new Error('Organizer profile not found')

      let bannerUrl = null

      // Upload banner if provided
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-banners')
          .upload(fileName, bannerFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('event-banners')
          .getPublicUrl(fileName)
        
        bannerUrl = publicUrl
      }

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: organizer.id,
          title,
          description: description || null,
          vote_price: parseFloat(votePrice),
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          banner_url: bannerUrl,
        })
        .select()
        .single()

      if (eventError) throw eventError

      toast.success('Event created successfully!')
      router.push(`/organizer/events/${event.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Event
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Miss Ghana 2024"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Vote for your favorite contestant..."
              />
            </div>

            <div>
              <label htmlFor="banner" className="block text-sm font-medium text-gray-700">
                Event Banner
              </label>
              <div className="mt-1 flex items-center">
                <input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Recommended size: 1200x600px (JPG, PNG)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  End Date *
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="votePrice" className="block text-sm font-medium text-gray-700">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Price per Vote (GHS) *
              </label>
              <input
                id="votePrice"
                type="number"
                step="0.01"
                min="0.01"
                value={votePrice}
                onChange={(e) => setVotePrice(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.00"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Voters will pay this amount for each vote
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Next Steps
              </h3>
              <p className="text-sm text-yellow-700">
                After creating your event, you'll be able to add categories and contestants.
              </p>
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
                Create Event
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}