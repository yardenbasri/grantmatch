import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import type { Grant } from '../../api/grants'
import { formatCurrency, formatDate } from '../../utils/format'
import { statusLabels } from '../../utils/grantLabels'

interface GrantsTableProps {
  grants: Grant[]
  onRowClick: (grant: Grant) => void
}

export function GrantsTable({ grants, onRowClick }: GrantsTableProps) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>כותרת</TableCell>
          <TableCell>גוף מפרסם</TableCell>
          <TableCell>סכום מקסימלי</TableCell>
          <TableCell>מועד אחרון</TableCell>
          <TableCell>סטטוס</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {grants.map((grant) => (
          <TableRow
            key={grant.id}
            hover
            onClick={() => onRowClick(grant)}
            sx={{ cursor: 'pointer' }}
          >
            <TableCell>{grant.title}</TableCell>
            <TableCell>{grant.publishing_body}</TableCell>
            <TableCell>{formatCurrency(grant.max_amount)}</TableCell>
            <TableCell>{formatDate(grant.deadline)}</TableCell>
            <TableCell>
              <Chip
                label={statusLabels[grant.status]}
                color={grant.status === 'open' ? 'success' : 'default'}
                size="small"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
