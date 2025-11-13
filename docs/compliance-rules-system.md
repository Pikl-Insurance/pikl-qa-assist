# Compliance Rules Manager - User Guide

## Overview

The Compliance Rules Manager is a configurable system that allows compliance experts to customize which UK insurance regulations apply to different call types. This ensures that QA analysis reflects your organization's specific compliance requirements and practical interpretations.

## Accessing the Manager

Navigate to: **Dashboard → Compliance Rules Manager** or visit `/admin/compliance-rules`

## Key Features

### 1. Rule Configuration

Each compliance rule includes:

- **Title**: Short description of the requirement
- **Description**: What the rule checks for
- **Regulatory Reference**: The specific regulation (e.g., "GDPR Article 13", "ICOBS 4.2.1R")
- **Requirement**: What the agent must do to comply
- **Example Script**: Compliant language agents can use
- **Severity**: How critical this rule is (Critical, High, Medium, Low)
- **Applicable Call Types**: Which call types this rule applies to
- **Enabled/Disabled**: Toggle rules on/off without deleting them
- **Notes**: Internal notes for compliance team

### 2. Call Types

The system recognizes 6 call types:

1. **New Business Sales** - Customer purchasing new insurance
2. **Renewals** - Customer renewing existing policy
3. **Mid-Term Adjustment** - Changes to existing policy
4. **Claims Inquiry** - Customer calling about a claim
5. **Complaints** - Customer making a formal complaint
6. **General Inquiry** - Information requests, policy servicing

### 3. Compliance Dimensions

Rules are organized into 6 dimensions:

- 📞 **Call Opening** - Introduction, recording disclosure
- 🔒 **Data Protection** - GDPR, DPA 2018 compliance
- 📋 **Mandatory Disclosures** - Cooling-off, policy docs, claims process
- 🤝 **Treating Customers Fairly (TCF)** - Needs-based selling, no pressure
- 💼 **Sales Process** - Exclusions, fair presentation of risk
- 📢 **Complaints Handling** - Recognition, FOS rights, 8-week timeline

## How to Use

### Filtering Rules

1. **Select Call Type**: Click a call type button to view only rules that apply to that type
2. **Select Dimension**: Filter by compliance dimension to focus on specific areas
3. **Combined Filtering**: Both filters work together to narrow down the view

### Enabling/Disabling Rules

- Use the **toggle switch** on each rule card to enable or disable it
- Disabled rules won't be checked during AI analysis
- Useful for:
  - Testing new interpretations
  - Temporarily relaxing requirements during training periods
  - Adjusting for seasonal campaigns

### Customizing Rule Applicability

Click on the **call type badges** at the bottom of each rule card to add/remove applicability:

- **Blue badge** = Rule applies to this call type
- **Grey outline badge** = Rule does not apply to this call type

Example use case: You might decide "Full GDPR Privacy Notice" only applies to new business, not renewals.

### Severity Levels

Rules are color-coded by severity:

- 🔴 **Critical** (Red): Regulatory breach with high risk - must be complied with
- 🟠 **High** (Orange): Significant compliance gap requiring attention
- 🟡 **Medium** (Yellow): Procedural gap worth addressing
- 🔵 **Low** (Blue): Best practice opportunity for improvement

### Saving Changes

1. Make your changes (enable/disable, change applicability)
2. Click **Save Changes** button
3. System confirms save success
4. Changes apply immediately to new analyses

### Resetting to Defaults

If you need to start over:

1. Click **Reset to Defaults** button
2. Confirm the reset
3. All rules return to original factory settings

## Practical Examples

### Example 1: GDPR for Renewals

**Scenario**: Your QA Manager (Max) says renewals don't need full GDPR wording, abbreviated is fine.

**Solution**:
1. Find rule "Full GDPR Privacy Notice (New Business)"
2. Verify it only applies to "New Business Sales"
3. Find rule "Abbreviated Privacy Notice (Renewals)"
4. Verify it applies to "Renewals", "Mid-Term Adjustment", "General Inquiry"
5. System now expects different GDPR standards for different call types

### Example 2: Seasonal Campaign Pressure

**Scenario**: During December renewal push, you want to allow slightly more urgency language without flagging as "pressure selling".

**Solution**:
1. Find rule "No Pressure Selling"
2. Click toggle to temporarily disable it
3. Save changes
4. After campaign ends, re-enable the rule

### Example 3: New Regulation

**Scenario**: FCA introduces new requirement for claims calls.

**Solution**:
1. Note: In MVP, this requires code update (future version will allow adding new rules via UI)
2. Contact development team to add new rule
3. Once added, configure applicability and enable it

## AI Prompt Preview

The **AI Prompt Preview** section shows exactly how your active rules will be presented to Claude during analysis for the selected call type. This helps you:

- Verify rules are correctly configured
- Understand what Claude "sees" when scoring
- Troubleshoot unexpected QA results

## Rule Design Principles

### 1. Practical Compliance

Rules should reflect **practical, real-world compliance**, not overly pedantic interpretations. Example:

❌ Bad: "Agent must recite GDPR Article 13 verbatim"
✅ Good: "Agent must state data rights in plain English"

### 2. Call-Type Specificity

Different call types have different requirements:

- **New Business**: Full disclosures required (first relationship)
- **Renewals**: Abbreviated notices acceptable (existing relationship)
- **Service Calls**: Brief acknowledgments sufficient

### 3. Training vs Production

Consider different rule sets for:

- **Training Period**: More lenient, focus on coaching
- **Production**: Full compliance expected

### 4. Documented Interpretations

Use the **Notes** field to document:

- Why you chose this interpretation
- Any discussion with regulators
- Examples of acceptable/unacceptable compliance

## Integration with QA Analysis

When a call is analyzed:

1. System detects call type (e.g., "new_business_sales")
2. Loads all **enabled** rules for that call type
3. Generates dynamic prompt for Claude with active rules
4. Claude scores against only the relevant rules
5. Compliance issues reference specific rules

## Best Practices

### 1. Regular Review

Schedule quarterly reviews of rules with your compliance expert (Ryan) to ensure:

- Regulations haven't changed
- Interpretations are still valid
- New requirements are added

### 2. Version Control

When making major changes:

1. Document what changed and why
2. Note the date and who approved it
3. Consider keeping a change log

### 3. Test Before Deploy

Before enabling a strict new rule:

1. Test it on historical calls
2. Review flagged issues with QA team
3. Adjust severity/wording as needed

### 4. Communicate Changes

When rules change:

- Notify QA managers
- Update coaching materials
- Brief agents on new expectations

## Troubleshooting

### "Too many compliance flags"

**Possible causes**:
- Rule severity too high
- Rule applies to wrong call types
- Interpretation too strict

**Solution**: Review the rule, adjust severity, or refine applicability

### "Calls scoring too high despite issues"

**Possible causes**:
- Rule is disabled
- Rule doesn't apply to this call type
- Rule missing entirely

**Solution**: Check rule is enabled and applicable to the call type

### "Inconsistent scoring between similar calls"

**Possible causes**:
- Rules changed between analyses
- Call types detected differently
- Edge case in rule logic

**Solution**: Re-analyze both calls with current rules, compare AI explanations

## Future Enhancements (Post-MVP)

Planned features for future versions:

- **Add New Rules via UI**: No code changes needed
- **Rule Templates**: Pre-configured sets for different industries
- **Version History**: Track changes over time
- **A/B Testing**: Test new rules on subset of calls
- **Bulk Import/Export**: Share rules between environments
- **Approval Workflow**: Changes require manager approval
- **Rule Analytics**: Which rules trigger most often

## Support

For questions or issues with the Compliance Rules Manager:

1. Review this documentation
2. Check the AI Prompt Preview for your call type
3. Contact compliance lead (Ryan) for interpretation questions
4. Contact QA Manager (Max) for operational questions

---

**Last Updated**: November 2025
**Version**: 1.0.0 (MVP)
**Owner**: Pikl Insurance QA Team
