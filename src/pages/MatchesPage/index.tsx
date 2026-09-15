import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Link as MuiLink, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { getMatches, runMatching } from '../../api/matches'
import type { Match } from '../../api/matches'
import { getGrants } from '../../api/grants'
import type { Grant } from '../../api/grants'
import { getStoredBusinessId } from '../../utils/storage'
import { MatchAccordion } from './MatchAccordion'

export function MatchesPage() {
  const businessId = useMemo(() => getStoredBusinessId(), [])

  const [grants, setGrants] = useState<Grant[] | null>(null)
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) return
    Promise.all([getGrants(), getMatches(businessId)])
      .then(([grantsData, matchesData]) => {
        setGrants(grantsData)
        setMatches(matchesData)
      })
      .catch((err: Error) => setLoadError(err.message))
  }, [businessId])

  async function handleRun() {
    if (!businessId) return
    setRunning(true)
    setRunError(null)
    try {
      await runMatching(businessId)
      const [grantsData, matchesData] = await Promise.all([getGrants(), getMatches(businessId)])
      setGrants(grantsData)
      setMatches(matchesData)
    } catch (err) {
      setRunError((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  const grantsById = useMemo(() => new Map((grants ?? []).map((g) => [g.id, g])), [grants])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        התאמות למענקים
      </Typography>

      {!businessId && (
        <Alert severity="info">
          יש ליצור קודם{' '}
          <MuiLink component={RouterLink} to="/profile">
            פרופיל עסק
          </MuiLink>{' '}
          כדי לבדוק התאמה למענקים.
        </Alert>
      )}

      {businessId && (
        <>
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" onClick={handleRun} disabled={running}>
              {running ? 'בודק התאמה...' : 'הרץ בדיקת התאמה'}
            </Button>
          </Box>

          {loadError && <Alert severity="error">{loadError}</Alert>}
          {runError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {runError}
            </Alert>
          )}

          {!loadError && matches === null && <CircularProgress />}

          {matches !== null && matches.length === 0 && (
            <Typography color="text.secondary">
              עדיין אין תוצאות. לחצו על "הרץ בדיקת התאמה" כדי לבדוק מול כל המענקים הקיימים.
            </Typography>
          )}

          {matches !== null && matches.length > 0 && (
            <Stack spacing={1}>
              {matches.map((match) => (
                <MatchAccordion key={match.grant_id} match={match} grant={grantsById.get(match.grant_id)} />
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  )
}
