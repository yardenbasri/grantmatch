import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HelpIcon from '@mui/icons-material/Help'
import InfoIcon from '@mui/icons-material/Info'
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import type { CriterionDetail } from '../../api/database.types'
import { colors } from '../../theme'

function CriterionIcon({ criterion }: { criterion: CriterionDetail }) {
  if (!criterion.is_automatic) return <InfoIcon sx={{ color: colors.info }} />
  if (criterion.is_met === true) return <CheckCircleIcon sx={{ color: colors.success }} />
  if (criterion.is_met === false) return <CancelIcon sx={{ color: colors.error }} />
  return <HelpIcon sx={{ color: colors.warning }} />
}

export function CriteriaDetailList({ criteria }: { criteria: CriterionDetail[] }) {
  return (
    <List dense disablePadding>
      {criteria.map((criterion) => (
        <ListItem key={criterion.key} disableGutters sx={{ alignItems: 'flex-start' }}>
          <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
            <CriterionIcon criterion={criterion} />
          </ListItemIcon>
          <ListItemText
            primary={criterion.label}
            secondary={
              <>
                {criterion.required && (
                  <Typography component="span" variant="body2" display="block">
                    נדרש: {criterion.required}
                    {criterion.actual !== null && ` · בפועל: ${criterion.actual}`}
                  </Typography>
                )}
                {!criterion.is_automatic && !criterion.gap && (
                  <Typography component="span" variant="body2" display="block">
                    קריטריון הדורש בדיקה ידנית
                  </Typography>
                )}
                {criterion.gap && (
                  <Typography
                    component="span"
                    variant="body2"
                    display="block"
                    sx={{ color: colors.warning }}
                  >
                    {criterion.gap}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  )
}
