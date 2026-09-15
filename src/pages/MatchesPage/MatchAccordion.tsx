import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { Match } from '../../api/matches'
import type { Grant } from '../../api/grants'
import { matchStatusColors, matchStatusLabels } from '../../utils/matchLabels'
import { CriteriaDetailList } from './CriteriaDetailList'

interface MatchAccordionProps {
  match: Match
  grant: Grant | undefined
}

export function MatchAccordion({ match, grant }: MatchAccordionProps) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: '100%' }}>
          <Chip
            label={matchStatusLabels[match.status]}
            color={matchStatusColors[match.status]}
            size="small"
          />
          <Typography sx={{ fontWeight: 600 }}>{grant?.title ?? `מענק #${match.grant_id}`}</Typography>
          {match.match_score !== null && (
            <Typography variant="body2" color="text.secondary">
              ציון: {match.match_score}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
            {match.match_reason}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <CriteriaDetailList criteria={match.criteria_detail} />
      </AccordionDetails>
    </Accordion>
  )
}
