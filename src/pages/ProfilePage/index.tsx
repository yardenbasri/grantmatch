import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, CircularProgress, Snackbar, Typography } from '@mui/material'
import { createBusiness, getBusiness, updateBusiness } from '../../api/businesses'
import { getCodes } from '../../api/codes'
import type { CodeValue } from '../../api/codes'
import { getStoredBusinessId, setStoredBusinessId } from '../../utils/storage'
import { businessToFormState, emptyFormState, formStateToPayload } from './formState'
import type { ProfileFormState } from './formState'
import { validateProfileForm } from './validation'
import { ProfileForm } from './ProfileForm'

export function ProfilePage() {
  const [businessId, setBusinessId] = useState<number | null>(null)
  const [industries, setIndustries] = useState<CodeValue[] | null>(null)
  const [regions, setRegions] = useState<CodeValue[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [formState, setFormState] = useState<ProfileFormState>(emptyFormState)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const storedId = getStoredBusinessId()

    Promise.all([
      getCodes('INDUSTRY'),
      getCodes('REGION'),
      storedId ? getBusiness(storedId) : Promise.resolve(null),
    ])
      .then(([industryCodes, regionCodes, business]) => {
        setIndustries(industryCodes)
        setRegions(regionCodes)
        if (business) {
          setBusinessId(business.id)
          setFormState(businessToFormState(business))
        }
      })
      .catch((err: Error) => setLoadError(err.message))
  }, [])

  const errors = useMemo(() => validateProfileForm(formState), [formState])
  const isValid = Object.keys(errors).length === 0

  function handleChange<K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setSubmitted(true)
    if (!isValid) return

    setSaving(true)
    setSaveError(null)
    const payload = formStateToPayload(formState)

    try {
      if (businessId) {
        await updateBusiness(businessId, payload)
      } else {
        const created = await createBusiness(payload)
        setBusinessId(created.id)
        setStoredBusinessId(created.id)
      }
      setSaveSuccess(true)
    } catch (err) {
      setSaveError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const isLoading = !loadError && (industries === null || regions === null)

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        פרופיל עסק
      </Typography>

      {loadError && <Alert severity="error">{loadError}</Alert>}
      {isLoading && <CircularProgress />}

      {!isLoading && industries && regions && (
        <ProfileForm
          state={formState}
          errors={errors}
          showErrors={submitted}
          industries={industries}
          regions={regions}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}

      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        message="הפרופיל נשמר בהצלחה"
      />
    </Box>
  )
}
