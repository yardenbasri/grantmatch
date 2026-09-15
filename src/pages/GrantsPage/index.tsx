import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { getCriteriaCatalog, getGrants } from '../../api/grants'
import type { CriteriaCatalogEntry, Grant } from '../../api/grants'
import type { GrantStatus } from '../../api/database.types'
import { GrantsFilters } from './GrantsFilters'
import { GrantsTable } from './GrantsTable'
import { GrantDetailPanel } from './GrantDetailPanel'

export function GrantsPage() {
  const [grants, setGrants] = useState<Grant[] | null>(null)
  const [criteriaCatalog, setCriteriaCatalog] = useState<CriteriaCatalogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<GrantStatus | 'all'>('all')
  const [publishingBodyFilter, setPublishingBodyFilter] = useState<string>('all')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)

  useEffect(() => {
    Promise.all([getGrants(), getCriteriaCatalog()])
      .then(([grantsData, criteriaData]) => {
        setGrants(grantsData)
        setCriteriaCatalog(criteriaData)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const criteriaCatalogMap = useMemo(
    () => new Map((criteriaCatalog ?? []).map((entry) => [entry.criterion_key, entry])),
    [criteriaCatalog],
  )

  const publishingBodies = useMemo(
    () => [...new Set((grants ?? []).map((grant) => grant.publishing_body))].sort(),
    [grants],
  )

  const filteredGrants = useMemo(() => {
    if (!grants) return []
    return grants.filter((grant) => {
      if (statusFilter !== 'all' && grant.status !== statusFilter) return false
      if (publishingBodyFilter !== 'all' && grant.publishing_body !== publishingBodyFilter) {
        return false
      }
      if (search && !grant.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [grants, statusFilter, publishingBodyFilter, search])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        קטלוג מענקים
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {!error && !grants && <CircularProgress />}

      {grants && (
        <>
          <GrantsFilters
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            publishingBody={publishingBodyFilter}
            onPublishingBodyChange={setPublishingBodyFilter}
            publishingBodies={publishingBodies}
          />
          <GrantsTable grants={filteredGrants} onRowClick={setSelectedGrant} />
          <GrantDetailPanel
            grant={selectedGrant}
            criteriaCatalog={criteriaCatalogMap}
            onClose={() => setSelectedGrant(null)}
          />
        </>
      )}
    </Box>
  )
}
