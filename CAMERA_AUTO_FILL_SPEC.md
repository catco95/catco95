# LIVE CAMERA AUTO-FILL SPECIFICATION

## Overview
Live camera feature allows users to capture watch images directly from their device camera for instant detail detection.

## Camera Auto-Fill Rules

### MAY Auto-Fill Directly (if clearly visible):
- **Brand** - Logo or text visible
- **Model Family** - Widely recognizable design
- **Dial Colour** - Descriptive only (e.g., "Black", "Blue sunburst")
- **Bezel Type** - Visible style (e.g., "Ceramic insert", "Fluted")
- **Bracelet/Strap Type** - Visible material (e.g., "Metal bracelet", "Leather strap")

### MAY Suggest (confirmation required):
- **Reference Number** - Only if legible on case/dial
- **Approximate Era** - Based on design cues (e.g., "Likely 2010s")
- **Case Material** - Visual estimate only (e.g., "Appears stainless steel")

### Field Labeling:
Each detected field must be marked:
- 🟢 **Detected** - High confidence, clearly visible
- 🟡 **Suggested** - Reasonable inference, needs verification
- 🔴 **Unconfirmed** - Low confidence, user must verify

### NEVER Auto-Fill:
- Authenticity or originality claims
- Hidden details not visible in image
- Exact production year
- Service history
- Condition assessment (requires manual inspection)
- Box & papers presence
- Value or price estimates

## Camera Scan Safety Rule

**PRECISION OVER COMPLETENESS**

If confidence is insufficient:
- ❌ Do NOT auto-fill
- ❌ Do NOT infer
- ❌ Do NOT guess
- ✅ Leave field blank
- ✅ Ask user to input manually

## Confidence Impact

**Critical Rule:**
Auto-filled fields NEVER increase valuation confidence until explicitly confirmed by user.

**Confidence Penalties:**
- Unconfirmed auto-filled fields: **-0.10 to -0.15** confidence reduction
- User-confirmed fields: Penalty removed
- All auto-fills flagged as "Verification required" in risk factors

## Frontend Implementation Requirements

### 1. Camera UI Flow
```
[Upload Image] button → [Use Camera] option
↓
Camera permission request
↓
Live camera feed with capture button
↓
Image captured → Send to /api/detect-watch-details
↓
Display detected fields with confidence badges
↓
User reviews/edits → Confirms → Sends to /api/valuate
```

### 2. UI Components Needed

**Camera Interface:**
- Live camera preview
- "Capture Photo" button
- "Retake" option
- Good lighting indicator
- Focus guide overlay

**Detection Results Display:**
```
Brand: Rolex [🟢 Detected]
Model: Submariner [🟢 Detected]
Dial: Black [🟢 Detected]
Bezel: Ceramic insert [🟢 Detected]
Reference: 126610LN [🟡 Suggested] ← User can edit
Case Material: Stainless steel [🟡 Suggested] ← User can edit
Year: Likely 2020s [🔴 Unconfirmed] ← User must verify
```

**Confirmation Controls:**
- [✓ Confirm All Detected] button
- Individual field edit capability
- [✗ Clear and Retry] option
- [Skip Auto-Fill, Enter Manually] option

### 3. Data Flow

**Step 1: Capture**
```javascript
const imageBlob = await captureFromCamera();
const formData = new FormData();
formData.append('image', imageBlob);
```

**Step 2: Detect**
```javascript
const response = await fetch('/api/detect-watch-details', {
  method: 'POST',
  body: formData
});
const { detected_details } = await response.json();
```

**Step 3: Display & Edit**
```javascript
// Show fields with confidence badges
// Allow user to edit/confirm
const confirmedFields = userReviewAndEdit(detected_details);
```

**Step 4: Valuate**
```javascript
const valuationData = new FormData();
// Add confirmed field values
Object.entries(confirmedFields).forEach(([key, value]) => {
  valuationData.append(key, value.value);
});
// Track which were auto-filled
valuationData.append('auto_filled_fields', 
  JSON.stringify(getAutoFilledFieldNames(confirmedFields))
);
```

## Conservative Safeguards

### Pre-Valuation Checks:
1. ✓ User has reviewed all auto-filled fields
2. ✓ Confidence badges clearly displayed
3. ✓ User explicitly confirmed or edited fields
4. ✓ Warning shown about unconfirmed fields reducing confidence

### Valuation Integration:
- Backend receives list of auto-filled fields
- AI applies confidence penalty for unconfirmed fields
- Risk factors include: "Auto-filled fields pending verification"
- Confidence score reduced by 0.10-0.15 automatically

### User Messaging:
```
⚠️ Auto-Filled Details Detected
Some fields were auto-detected from your image.
Please review and confirm before valuation.

Unconfirmed fields will reduce confidence score.
Edit any incorrect details.
```

## Example Camera Workflow

```
User clicks "Use Camera" 
  ↓
Camera opens with guide: "Center watch in frame, ensure good lighting"
  ↓
User captures image
  ↓
Processing indicator: "Detecting watch details..."
  ↓
Results display:
  Brand: Rolex [🟢 Detected] ✓
  Model: Submariner [🟢 Detected] ✓
  Reference: 116610 [🟡 Suggested] ← User edits to "116610LN"
  Year: [Empty - Low confidence]
  ↓
User reviews, edits, confirms
  ↓
[Continue to Valuation] button enabled
  ↓
Valuation includes edited fields + tracking of auto-fills
```

## API Endpoints

### Detection Endpoint
**POST** `/api/detect-watch-details`

**Request:**
```
multipart/form-data
- image: file (JPEG/PNG from camera)
```

**Response:**
```json
{
  "success": true,
  "detected_details": {
    "brand": {
      "value": "Rolex",
      "confidence": "detected"
    },
    "model": {
      "value": "Submariner",
      "confidence": "detected"
    },
    "dial_description": {
      "value": "Black",
      "confidence": "detected"
    },
    "reference": {
      "value": "116610",
      "confidence": "suggested"
    },
    "case_material": {
      "value": "Stainless steel",
      "confidence": "suggested"
    }
  },
  "message": "Details detected. Please verify before valuation."
}
```

### Valuation Endpoint (Updated)
**POST** `/api/valuate`

**Additional Field:**
```
auto_filled_fields: string (JSON array of field names)
Example: '["brand", "model", "dial_description"]'
```

## Best Practices

1. **Camera Quality:**
   - Encourage good lighting
   - Suggest stable hands/surface
   - Allow retakes unlimited

2. **User Experience:**
   - Show confidence badges clearly
   - Make editing easy and obvious
   - Confirm before proceeding

3. **Conservative Defaults:**
   - When in doubt, leave blank
   - Suggest manual entry for critical fields
   - Never assume authenticity

4. **Mobile Optimization:**
   - Native camera API for mobile devices
   - Optimized image processing
   - Clear touch targets for editing

## Implementation Status

✅ **Backend Complete:**
- Detection endpoint functional
- Confidence penalty logic implemented
- Auto-fill tracking in valuation

⏳ **Frontend Pending:**
- Camera UI integration
- Detection results display
- User confirmation workflow
- Confidence badge components

## Testing Requirements

Before deployment:
1. Test with various watch brands/models
2. Verify confidence penalties apply correctly
3. Test user editing and confirmation flow
4. Ensure low-confidence fields left blank
5. Validate mobile camera integration
6. Check lighting/quality warnings work
