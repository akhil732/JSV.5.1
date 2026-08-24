# Vedic Astrology Output Quality Standard
## TeluguAstro Engine v2.0+

### PRINCIPLE 1: Evidence-Backed Claims Only

Every claim must follow a clear reasoning chain:
**Factor → Rule → Evidence → Interpretation**

### PRINCIPLE 2: Confidence Levels

- **VERIFIED:** Directly from KP computation (cusp sub-lord, significator)
- **HIGH:** From established Vedic rules + chart evidence
- **MODERATE:** From transit support or dasha + conditional language
- **LOW:** From partial evidence; requires further verification
- **SPECULATIVE:** Removed from main report; noted only if user asks

### PRINCIPLE 3: Forbidden Language

❌ "definitely", "will", "guarantee"  
❌ "golden period" (సువర్ణ సమయం)  
❌ "It will happen"  
✓ "is astrologically supported"  
✓ "shows improved conditions"  
✓ "may manifest in timing window"  

### PRINCIPLE 4: No Unsolicited Prescriptions

Remedies appear only if:
1. User explicitly asks ("What remedies...")
2. Chart shows clear affliction needing remedy
3. Remedy is verified in classical text database

### PRINCIPLE 5: Source Integrity

Never attribute to classical text unless verified in KB:
```
❌ "Parasara Hora Shastra 1.23 prescribes..."
✓ "Traditional practice suggests..."
```

### PRINCIPLE 6: Chart Data Immutability

All planetary positions, houses, cusps come from Layer 1 only (`ChartDataValidator`).
LLM generates:
- Natural language phrasing
- Evidence narrative
- Report structure

LLM does NOT generate:
- Planetary degrees
- House positions
- Significator lists
- Dasha dates

### PRINCIPLE 7: Timing Precision

Timing claims require:
1. Exact dasha period OR
2. Transit date range OR
3. Explicit "Approximate window: [season/month]"

Never: "You will get married when Jupiter transits" (no date)

### PRINCIPLE 8: Multi-Factor Analysis

Single factor ≠ prediction

```
✗ Mercury in 8th → "financial obstacles"
✓ Mercury in 8th + 2nd lord afflicted + Jupiter transit challenging → "financial pressure likely"
```

### PRINCIPLE 9: Missing Data Honesty

If data unavailable:
- State explicitly: "D-7 not available"
- Explain impact: "Reduces marriage timing precision by ~X%"
- Don't invent: Never guess D-7 from D-1

### PRINCIPLE 10: User-Centric Ordering

1. Direct answer to user's question
2. Why (evidence)
3. When (timing)
4. What to watch (cautions)
5. Optional: Deeper analysis (only if report allows)

### PRINCIPLE 11: Dasha Sub-Lord Permissibility & Mutual Relationship (6-8 / 2-12 Axis)

1. **Hierarchy Rule:** The active sub-lord (Antardasha lord) can ONLY deliver results permitted by the main Dasha lord.
2. **Stress Axis:** When Dasha lord and Antardasha lord sit in a 6-8 (Shashtashtaka) or 2-12 (Dwadasashtaka) relationship—either mutually in the natal chart or through current Gochara transits—it triggers friction, mental stress, health vulnerabilities, and sudden obstacles.
3. **Report Representation:** Such relationships must be explicitly highlighted with a warning/caution qualifier in the Dasha analysis section.

---

## Audit Checklist

- [x] No chart data invented by LLM
- [x] Every claim has evidence chain
- [x] Confidence level matches verification
- [x] No unsolicited remedies
- [x] No false classical-text attribution
- [x] Missing data flagged, not fabricated
- [x] Timing has date range or explicit uncertainty
- [x] Multi-factor reasoning applied
- [x] User's actual question answered first
- [x] Telugu terminology verified by astrology expert
- [x] Dasha lord permissibility and 6-8 / 2-12 mutual axis stress tests evaluated
