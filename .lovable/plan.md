

# SoundSuite M5/M7/W7 Size Category Logic

## Problem
`soundbar` keyword maps everything to L, but SoundSuite models M5 and M7 should be S, W7 should be M. Other soundbars remain L.

## Change

### `supabase/functions/ben-extract-images/index.ts`
Modify `detectProductCategory` to check for SoundSuite model-specific keywords **before** the generic map lookup:

```typescript
function detectProductCategory(url: string): SizeCategory {
  const lower = url.toLowerCase();
  
  // SoundSuite special cases: check before generic soundbar match
  if (lower.includes('soundsuite') || lower.includes('sound-suite') || lower.includes('sound_suite')) {
    if (lower.includes('m5') || lower.includes('m7')) return 'S';
    if (lower.includes('w7')) return 'M';
    // Other SoundSuite models → L (same as soundbar default)
  }
  
  for (const [keyword, size] of Object.entries(PRODUCT_SIZE_MAP)) {
    if (lower.includes(keyword)) return size;
  }
  return 'M';
}
```

No other files need changes. Edge function will be redeployed automatically.

