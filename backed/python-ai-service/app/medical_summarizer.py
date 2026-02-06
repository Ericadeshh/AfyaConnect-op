from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "umeshramya/t5_small_medical_512"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

def summarize_text(text: str, max_len=120, min_len=30) -> str:
    """
    Summarize input text into bullet points using medical-tuned T5-small.
    """
    # Keep the prefix that gave cleaner results for your examples
    input_text = "summarize: " + text
    inputs = tokenizer(input_text, return_tensors="pt", truncation=True)

    # Generate summary (original params)
    summary_ids = model.generate(
        **inputs,
        max_length=max_len,
        min_length=min_len,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True).strip()

    # Convert to bullet points (original logic + strip)
    points = [f"- {line.strip().capitalize()}" for line in summary.split('. ') if line.strip()]
    return "\n".join(points) if points else "- No summary generated."

def main():
    print("=== Medical Summarizer (Preferred Version) ===")
    print("Enter patient notes to summarize. Type 'exit' to quit.\n")

    while True:
        text = input(">>> ")
        if text.lower() in ["exit", "quit"]:
            print("Exiting...")
            break
        if not text.strip():
            continue

        summary = summarize_text(text)
        print("\nGenerated Summary:\n")
        print(summary)
        print("\n---\n")

if __name__ == "__main__":
    main()