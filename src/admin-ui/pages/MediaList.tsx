import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { mediaService, MediaItem } from '../utils/supabase'
import { Plus as PlusIcon, Search as SearchIcon, Filter as FilterIcon, Download as DownloadIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, SortAsc as SortAscIcon, SortDesc as SortDescIcon, X as XIcon } from 'lucide-react'

const MediaList: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ status: '', type: '', language: '', visibility: '' })
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [orderBy, setOrderBy] = useState({ field: 'publishedAt', direction: 'desc' as 'asc' | 'desc' })
  const itemsPerPage = 10

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setFilters({
      status: params.get('status') || '',
      type: params.get('type') || '',
      language: params.get('language') || '',
      visibility: params.get('visibility') || '',
    })
    const searchFilter = params.get('search')
    if (searchFilter) setSearchQuery(searchFilter)
  }, [location.search])

  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true)
      try {
        const { data, count } = await mediaService.getMediaItems({ ...filters, search: searchQuery }, page, itemsPerPage, orderBy)
        setMediaItems(data)
        setTotalItems(count)
      } catch (e) {
        console.error('Error fetching media items:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchMediaItems()
  }, [filters, searchQuery, page, orderBy])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
    const params = new URLSearchParams(location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    navigate(`/admin-ui/media?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ status: '', type: '', language: '', visibility: '' })
    setSearchQuery('')
    navigate('/admin-ui/media')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    const params = new URLSearchParams(location.search)
    if (searchQuery) params.set('search', searchQuery)
    else params.delete('search')
    navigate(`/admin-ui/media?${params.toString()}`)
  }

  const toggleSelectItem = (id: string) => setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  const toggleSelectAll = () => setSelectedItems(selectedItems.length === mediaItems.length ? [] : mediaItems.map((i) => i.id))

  const exportSelectedToCsv = () => {
    const rows = mediaItems.filter((m) => selectedItems.includes(m.id))
    const header = 'id,title,type,status,visibility,language,publishedAt,updatedAt,createdAt\n'
    const csv = header + rows.map((r) => [r.id, r.title, r.type, r.status, r.visibility, r.language, r.publishedAt, r.updatedAt, r.createdAt].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'media.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const handleSort = (field: 'publishedAt' | 'updatedAt') => setOrderBy((prev) => ({ field, direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc' }))

  return (
    <AppLayout title="Media Library">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/admin-ui/media/new" className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="w-4 h-4 mr-2" /> New Media
            </Link>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className="pl-8 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button className="px-3 py-2 border rounded-md hover:bg-gray-50">Search</button>
            <button type="button" onClick={clearFilters} className="px-3 py-2 text-blue-600 hover:text-blue-800">Reset</button>
          </form>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <select className="border rounded-md px-3 py-2" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="InReview">In Review</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
          <select className="border rounded-md px-3 py-2" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="Article">Article</option>
            <option value="Report">Report</option>
            <option value="Announcement">Announcement</option>
            <option value="Event">Event</option>
            <option value="Podcast">Podcast</option>
          </select>
          <select className="border rounded-md px-3 py-2" value={filters.visibility} onChange={(e) => handleFilterChange('visibility', e.target.value)}>
            <option value="">All Visibility</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          <select className="border rounded-md px-3 py-2" value={filters.language} onChange={(e) => handleFilterChange('language', e.target.value)}>
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex justify-between items-center">
          <span className="text-blue-700 font-medium">{selectedItems.length} items selected</span>
          <button onClick={exportSelectedToCsv} className="text-blue-700 hover:text-blue-800 flex items-center">
            <DownloadIcon className="w-4 h-4 mr-1" /> Export as CSV
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" checked={selectedItems.length === mediaItems.length && mediaItems.length > 0} onChange={toggleSelectAll} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('publishedAt')}>
                  <div className="flex items-center">
                    Published At {orderBy.field === 'publishedAt' && (orderBy.direction === 'desc' ? <SortDescIcon className="h-4 w-4 ml-1" /> : <SortAscIcon className="h-4 w-4 ml-1" />)}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('updatedAt')}>
                  <div className="flex items-center">
                    Updated At {orderBy.field === 'updatedAt' && (orderBy.direction === 'desc' ? <SortDescIcon className="h-4 w-4 ml-1" /> : <SortAscIcon className="h-4 w-4 ml-1" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mediaItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No media items found.</td>
                </tr>
              ) : (
                mediaItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelectItem(item.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin-ui/media/${item.id}`} className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Draft'
                            ? 'bg-gray-100 text-gray-800'
                            : item.status === 'InReview'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.status === 'Scheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : item.status === 'Published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.visibility}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.publishedAt ? new Date(item.publishedAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.updatedAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded disabled:opacity-50">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages} className="px-3 py-1.5 border rounded disabled:opacity-50">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

export default MediaList
