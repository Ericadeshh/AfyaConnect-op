from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re
import sys

# ────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────
MODEL_NAME = "google/flan-t5-small"  # Lightweight, fast, suitable for deployment

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Few-shot prompts with completeness cue
TYPE_PROMPTS = {
    "discharge_summary": """
Input: Patient Name: Alice Morgan Age: 54 Admission Reason: Chest pain and shortness of breath Hospital Stay: 5 days History: Type 2 Diabetes, Hypertension, Obesity Hospital Course: Patient stabilized on medical therapy. Blood pressure controlled at 130/80 mmHg. No further chest pain during admission. Echocardiogram showed normal cardiac function. Discharge Medications: Metformin 500mg twice daily Lisinopril 10mg daily Atorvastatin 40mg nightly Discharge Plan: Discharge home in stable condition. Follow-up with cardiologist in 2 weeks. Monitor blood pressure and blood sugar at home. Return immediately if chest pain or shortness of breath recurs.
Output: **Patient:** Alice Morgan, 54y **Admission Reason:** Chest pain and shortness of breath **Hospital Stay:** 5 days **History:** Type 2 Diabetes, Hypertension, Obesity **Hospital Course:** Stabilized on medical therapy; BP controlled at 130/80 mmHg; no further chest pain; normal echocardiogram **Discharge Medications:** Metformin 500mg BD, Lisinopril 10mg daily, Atorvastatin 40mg nightly **Condition at Discharge:** Stable **Follow-up Plan:** Cardiologist review in 2 weeks; home BP and blood sugar monitoring; return if chest pain/SOB recurs

Complete the structured summary without truncation for this input:
""",

    "clinical_progress_note": """
Input: Patient Name: Mary Ochieng Age: 29 Arrival Time: 02:15 AM Chief Complaint: Severe abdominal pain Triage Notes: Patient reports sudden onset lower right abdominal pain rated 8/10. Associated symptoms include nausea and one episode of vomiting. No fever reported. Last menstrual period was 3 weeks ago. No known drug allergies. Vital Signs: BP: 118/76 mmHg HR: 102 bpm Temp: 36.8°C SpO2: 99% on room air Assessment: Possible acute appendicitis. Plan: Urgent abdominal ultrasound. Keep patient nil per os (NPO). Administer IV fluids
Output: **Patient:** Mary Ochieng, 29y F **Chief Complaint:** Severe lower right abdominal pain (8/10) **History:** Sudden onset, associated nausea and vomiting x1, no fever, LMP 3 weeks ago, no known drug allergies **Vitals:** BP 118/76 mmHg, HR 102 bpm, Temp 36.8°C, SpO2 99% on RA **Assessment:** Possible acute appendicitis **Plan:** Urgent abdominal ultrasound, keep NPO, start IV fluids

Complete the structured summary without truncation for this input:
""",

    "post_operative_note": """
Input: Patient Name: Brian Lee Age: 68 Procedure: Left total knee replacement Post-Operative Notes: Surgery completed without complications. Minimal blood loss. Patient reports mild pain at surgical site rated 4/10. Range of motion improving with physiotherapy. No signs of infection. Vital signs stable. Plan: Continue pain management as prescribed. Encourage daily physiotherapy exercises. Monitor surgical wound for redness, swelling, or discharge. Follow-up appointment in 2 weeks.
Output: **Patient:** Brian Lee, 68y **Procedure:** Left total knee replacement **Findings/Complications:** Surgery without complications, minimal blood loss, no infection **Post-Op Status:** Mild pain 4/10 at site, improving ROM with physio, stable vitals **Plan:** Continue prescribed pain management, daily physiotherapy, monitor wound for redness/swelling/discharge, follow-up in 2 weeks

Complete the structured summary without truncation for this input:
""",

    "lab_report": """
Input: Patient Name: John Adams Age: 65 History: Hypertension, Type 2 Diabetes, Hyperlipidemia Medications: Metformin 500mg twice daily, Lisinopril 20mg daily, Atorvastatin 40mg nightly Clinical Notes: Patient reports mild fatigue and occasional headaches. Blood pressure readings at home average 150/90 mmHg. HbA1c is 7.8%, LDL cholesterol is 165 mg/dL. Patient admits to inconsistent exercise and occasional high-sodium meals. Plan: Reinforce diet and exercise. Adjust antihypertensive medication if blood pressure remains elevated. Schedule follow-up labs in 3 months.
Output: **Patient:** John Adams, 65y **Key Labs:** HbA1c 7.8% (elevated), LDL 165 mg/dL (elevated) **Vitals/Other:** Home BP average 150/90 mmHg (uncontrolled) **Interpretation:** Suboptimal diabetes & lipid control, uncontrolled hypertension likely due to lifestyle **Plan:** Reinforce diet/exercise, consider antihypertensive adjustment, repeat labs in 3 months

Complete the structured summary without truncation for this input:
""",

    "referral_note": "referral note analysis: extract patient demographics, referring facility, reason for referral, provisional diagnosis, investigations done, treatment given, urgency level, recommendations for receiving hospital. Complete the structured summary without truncation:\n",

    "unknown": "Summarize the key medical facts, patient info, findings, plan and recommendations from this text in structured format. Complete without truncation:\n"
}

# Type detector
def detect_document_type(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["referral", "referred to", "from facility", "reason for referral", "urgency", "moh 100", "referred by", "to higher level"]):
        return "referral_note"
    if any(kw in text_lower for kw in ["discharge", "discharged on", "admission date", "hospital stay", "discharge plan", "discharge home", "discharge medications"]):
        return "discharge_summary"
    if any(kw in text_lower for kw in ["hb", "wbc", "platelets", "creatinine", "reference range", "lab", "result", "µmol", "g/dl", "hba1c", "ldl", "troponin"]):
        return "lab_report"
    if any(kw in text_lower for kw in ["procedure", "operation", "post-op", "intra-operative", "anaesthesia", "surgery", "total knee", "replacement", "laparotomy", "findings", "complications"]):
        return "post_operative_note"
    if any(kw in text_lower for kw in ["chief complaint", "triage", "arrival time", "assessment", "urgent", "plan", "soap", "progress note", "bp", "pulse", "temp", "hr", "spo2", "npo", "iv fluids"]):
        return "clinical_progress_note"
    return "unknown"

def generate_structured_summary(raw_text: str, max_length: int = 450, min_length: int = 140) -> str:
    doc_type = detect_document_type(raw_text)
    prompt_prefix = TYPE_PROMPTS.get(doc_type, TYPE_PROMPTS["unknown"])

    full_prompt = prompt_prefix + raw_text.strip()

    inputs = tokenizer(
        full_prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )

    summary_ids = model.generate(
        **inputs,
        max_length=max_length,
        min_length=min_length,
        length_penalty=2.0,
        num_beams=8,
        early_stopping=True,
        no_repeat_ngram_size=3,
        do_sample=False
    )

    decoded = tokenizer.decode(summary_ids[0], skip_special_tokens=True).strip()

    # Aggressive cleanup
    decoded = decoded.replace("Complete the structured summary without truncation for this input:", "").strip()
    decoded = re.sub(r'Output\s*:?\s*', '', decoded, flags=re.IGNORECASE)
    decoded = re.sub(r'Complete the structured summary.*', '', decoded, flags=re.IGNORECASE | re.DOTALL)

    # Post-process: prefer bold sections, fallback to bullets
    sections = re.findall(r'\*\*(.*?):\*\*(.*?)(?=\*\*|$)', decoded, re.DOTALL)
    
    if sections:
        formatted_lines = []
        for title, content in sections:
            title = title.strip()
            content = content.strip().replace('\n', ' ').strip()
            formatted_lines.append(f"**{title}:** {content}")
    else:
        sentences = [s.strip() for s in re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', decoded) if s.strip()]
        formatted_lines = [f"• {s}" for s in sentences]

    output = f"**Detected Document Type:** {doc_type.replace('_', ' ').title()}\n\n"
    output += "\n".join(formatted_lines).strip()

    if len(" ".join(formatted_lines).split()) < 60:
        output += "\n\n**AI Note:** Summary is short — input may be incomplete or truncated."

    return output

def main():
    print("=== UzimaCare Medical Document Analyzer (flan-t5-small Optimized) ===")
    print("Paste patient notes (paragraph OK). Press Enter twice to process.")
    print("Type 'exit' or Ctrl+C to quit.\n")

    while True:
        try:
            print(">>> ", end="", flush=True)
            lines = []
            while True:
                line = sys.stdin.readline().rstrip('\n')
                if not line and lines:
                    break
                lines.append(line)
            
            text = "\n".join(lines).strip()
            if not text:
                continue
            if text.lower() in ['exit', 'quit']:
                print("Exiting...")
                break

            print("\nProcessing...\n")
            result = generate_structured_summary(text)
            print(result)
            print("\n" + "-"*80 + "\n")

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}\nTry again.\n")

if __name__ == "__main__":
    main()