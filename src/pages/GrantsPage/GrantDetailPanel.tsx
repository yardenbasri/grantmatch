import {
  Box,
  Chip,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import type { CriteriaCatalogEntry, Grant } from '../../api/grants'
import { formatCurrency, formatDate, formatNumber } from '../../utils/format'
import { opportunityTypeLabels, statusLabels } from '../../utils/grantLabels'

interface GrantDetailPanelProps {
  grant: Grant | null
  criteriaCatalog: Map<string, CriteriaCatalogEntry>
  onClose: () => void
}

function formatCriterionValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ')
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}

export function GrantDetailPanel({ grant, criteriaCatalog, onClose }: GrantDetailPanelProps) {
  return (
    <Drawer anchor="left" open={grant !== null} onClose={onClose}>
      {grant && (
        <Box sx={{ width: 420, p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {grant.title}
          </Typography>

          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemText primary="גוף מפרסם" secondary={grant.publishing_body} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="סוג המענק"
                secondary={opportunityTypeLabels[grant.opportunity_type]}
              />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="סכום מקסימלי" secondary={formatCurrency(grant.max_amount)} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="מועד אחרון" secondary={formatDate(grant.deadline)} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="סטטוס"
                secondary={
                  <Chip
                    label={statusLabels[grant.status]}
                    size="small"
                    color={grant.status === 'open' ? 'success' : 'default'}
                  />
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
            {grant.source_url && (
              <ListItem disableGutters>
                <ListItemText
                  primary="מקור"
                  secondary={
                    <Link href={grant.source_url} target="_blank" rel="noopener noreferrer">
                      {grant.source_url}
                    </Link>
                  }
                />
              </ListItem>
            )}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" component="h3" gutterBottom>
            קריטריוני זכאות
          </Typography>

          <List dense disablePadding>
            {Object.entries(grant.eligibility_criteria).map(([key, value]) => {
              const catalogEntry = criteriaCatalog.get(key)

              if (!catalogEntry) {
                return (
                  <ListItem key={key} disableGutters sx={{ alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <span>{key}</span>
                          <Chip label="לא מזוהה" size="small" color="error" variant="outlined" />
                        </Box>
                      }
                      secondary={formatCriterionValue(value)}
                    />
                  </ListItem>
                )
              }

              return (
                <ListItem key={key} disableGutters sx={{ alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <span>{catalogEntry.label_he}</span>
                        {!catalogEntry.is_automatic && (
                          <Chip label="דורש בדיקה ידנית" size="small" color="warning" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={formatCriterionValue(value)}
                  />
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}
    </Drawer>
  )
}
