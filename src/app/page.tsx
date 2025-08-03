import { Navigation } from '@/components/layout/Navigation'
import { EventCard } from '@/components/events/EventCard'
import { createServerComponentClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerComponentClient()
  
  // Fetch active events with their organizers
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      organizers (
        organization_name
      )
    `)
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                Vote for Your Favorites
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-blue-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Support your favorite contestants in various events and competitions. Every vote counts!
              </p>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Active Events</h2>
          
          {events && events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No active events at the moment.</p>
              <p className="text-gray-400 mt-2">Check back later for new voting opportunities!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}