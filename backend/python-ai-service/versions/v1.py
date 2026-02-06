from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import re

MODEL_NAME = "t5-small"

# Load model and tokenizer
print(f"Loading model {MODEL_NAME}... (lightweight, under 250MB)")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Use text2text-generation pipeline
summarizer = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

print("=== Medical Summarizer ===")
print("Enter patient notes to summarize. Type 'exit' to quit.\n")

while True:
    patient_text = input(">>> ")
    if patient_text.strip().lower() == "exit":
        break
    if not patient_text.strip():
        print("Please enter some text to summarize.")
        continue

    # Add instruction for bullet-point summary
    prompt = (
        f"Summarize the following patient notes in concise bullet points. "
        f"Separate each point clearly and keep sections like History, Medications, "
        f"Clinical Notes, and Plan:\n\n{patient_text}"
    )

    try:
        summary = summarizer(prompt, max_new_tokens=150)[0]['generated_text']

        # Split summary into sentences, clean, and add bullets line by line
        sentences = re.split(r'(?<=[.!?]) +', summary.strip())
        bullet_summary = "\n".join(f"- {s.strip()}" for s in sentences if s.strip())

        print("\nGenerated Summary:\n")
        print(bullet_summary)
        print("\n---\n")
    except Exception as e:
        print(f"Error generating summary: {e}")
        print("\n---\n")
