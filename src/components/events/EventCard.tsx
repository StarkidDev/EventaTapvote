import Link from 'next/link'
import Image from 'next/image'
import { Calendar, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string | null
    banner_url: string | null
    vote_price: number
    start_date: string
    end_date: string
    total_votes: number
    organizers: {
      organization_name: string
    } | null
  }
}

export function EventCard({ event }: EventCardProps) {
  const isActive = new Date(event.end_date) > new Date()
  
  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
        {event.banner_url ? (
          <div className="relative h-48 bg-gray-200">
            <Image
              src={event.banner_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {event.title}
          </h3>
          
          {event.organizers && (
            <p className="text-sm text-gray-500 mb-3">
              by {event.organizers.organization_name}
            </p>
          )}
          
          {event.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {isActive ? 'Ends' : 'Ended'} {formatDate(event.end_date)}
              </span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>{formatCurrency(event.vote_price)} per vote</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {event.total_votes} {event.total_votes === 1 ? 'vote' : 'votes'}
            </span>
            
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Active' : 'Ended'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}