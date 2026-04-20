import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { type, companyData, breachData } = await req.json()
    
    // gemini-2.0-flash-lite has the highest free RPM quota
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    
    let prompt = ''
    
    if (type === 'privacy_notice') {
      prompt = `
        You are a legal expert specializing in India's DPDP Act 2023.
        
        Generate a Privacy Notice for this Indian company:
        Company Name: ${companyData.name}
        Industry: ${companyData.industry || 'Technology'}
        Website: ${companyData.website || 'Not provided'}
        Grievance Officer: ${companyData.grievanceOfficerName || companyData.grievance_officer_name || 'To be appointed'}
        Grievance Email: ${companyData.grievanceOfficerEmail || companyData.grievance_officer_email || 'To be appointed'}
        
        REQUIREMENTS:
        - Must comply with India's DPDP Act 2023 and DPDP Rules 2025
        - Plain language — maximum 8th grade reading level
        - No legal jargon
        - Maximum 600 words
        - Must include these sections:
          1. What Personal Data We Collect
          2. Why We Collect It (specific purposes)
          3. How Long We Keep It
          4. Who We Share It With
          5. Your Rights Under DPDP Act
             (access, correction, erasure, grievance)
          6. How to Withdraw Consent
          7. How to Reach Our Grievance Officer
          8. How to Complain to the Data Protection Board
        - End with effective date
        - Format with clear headings
        - Friendly but professional tone
      `
    }
    
    if (type === 'breach_notification') {
      prompt = `
        You are a legal expert. Generate a formal Data Breach 
        Notification letter to India's Data Protection Board (DPB)
        as required by DPDP Act 2023.
        
        Company: ${companyData.name}
        Breach detected: ${breachData?.detectedAt}
        Breach type: ${breachData?.breachType}
        Users affected: ${breachData?.affectedCount}
        Data compromised: ${breachData?.dataCategories?.join(', ')}
        
        REQUIREMENTS:
        - Formal legal letter format
        - Reference DPDP Act 2023 Section on breach notification
        - Include: incident summary, data affected, 
          users affected, immediate steps taken,
          remediation plan, contact person
        - Professional tone
        - Include placeholder for Company seal
        - Date: today
      `
    }
    
    if (type === 'vc_readiness') {
      prompt = `
        Generate a DPDP compliance due diligence report for 
        venture capital investors reviewing this company:
        
        Company: ${companyData.name}
        Stage: ${companyData.fundingStage}
        Industry: ${companyData.industry}
        Compliance Score: ${companyData.complianceScore}/100
        Completed Tasks: ${companyData.completedTasks}
        Pending Critical Tasks: ${companyData.pendingCritical}
        
        SECTIONS TO INCLUDE:
        1. Executive Summary (3 sentences)
        2. DPDP Compliance Status (score + interpretation)
        3. Completed Compliance Measures
        4. Identified Gaps and Risks
        5. Estimated Maximum Penalty Exposure (₹ crores)
           Based on DPDP Act penalty schedule
        6. Recommended Actions (prioritized, with timelines)
        7. Estimated Timeline to Full Compliance
        8. Conclusion
        
        TONE: Professional, concise, VC-friendly
        LENGTH: Maximum 600 words
        FORMAT: Proper report with sections
      `
    }
    
    if (type === 'vendor_dpa') {
      prompt = `
        Generate a Data Processing Agreement (DPA) template 
        for Indian companies under DPDP Act 2023.
        
        Data Controller (our company): ${companyData.name}
        
        REQUIREMENTS:
        - Compliant with DPDP Act 2023
        - Covers: purpose limitation, security obligations,
          breach notification to controller, data deletion,
          sub-processor restrictions, audit rights
        - Practical template — not overly complex
        - Blanks [  ] for vendor name and specific details
        - Plain but legally sound language
        - Include signature blocks
      `
    }
    
    if (type === 'consent_policy') {
      prompt = `
        Generate an internal Consent Management Policy for 
        an Indian company under DPDP Act 2023.
        
        Company: ${companyData.name}
        Industry: ${companyData.industry}
        
        COVER:
        - How consent is collected (no pre-ticked boxes)
        - Purpose-specific consent requirements
        - How consent records are maintained (7 years)
        - Consent withdrawal process
        - Minor's data — parental consent requirements
        - Staff responsibilities
        - Policy review schedule
        
        Internal document — clear headings, practical language
      `
    }
    
    const result = await model.generateContent(prompt)
    const content = result.response.text()
    
    return NextResponse.json({ content, success: true })
    
  } catch (error: any) {
    // Extract a clean, user-readable message from the API error
    let message = error.message || 'Unknown error'
    if (message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
      message = 'Gemini API daily quota exceeded. Please wait a few hours and try again, or upgrade your Google AI Studio plan at aistudio.google.com.'
    } else if (message.includes('API_KEY') || message.includes('API key')) {
      message = 'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env.local.'
    } else if (message.includes('404') || message.includes('not found')) {
      message = 'AI model not available. Please try again in a moment.'
    }
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    )
  }
}
