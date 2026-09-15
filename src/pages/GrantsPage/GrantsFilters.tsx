import { Box, MenuItem, TextField } from '@mui/material'
import type { GrantStatus } from '../../api/database.types'
import { statusLabels } from '../../utils/grantLabels'

interface GrantsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: GrantStatus | 'all'
  onStatusChange: (value: GrantStatus | 'all') => void
  publishingBody: string | 'all'
  onPublishingBodyChange: (value: string) => void
  publishingBodies: string[]
}

export function GrantsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  publishingBody,
  onPublishingBodyChange,
  publishingBodies,
}: GrantsFiltersProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        label="חיפוש לפי כותרת"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 220 }}
      />
      <TextField
        select
        size="small"
        label="גוף מפרסם"
        value={publishingBody}
        onChange={(e) => onPublishingBodyChange(e.target.value)}
        sx={{ minWidth: 220 }}
      >
        <MenuItem value="all">הכל</MenuItem>
        {publishingBodies.map((body) => (
          <MenuItem key={body} value={body}>
            {body}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="סטטוס"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as GrantStatus | 'all')}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="all">הכל</MenuItem>
        {Object.entries(statusLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}
