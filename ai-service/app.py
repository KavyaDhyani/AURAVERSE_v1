from flask import Flask, request, jsonify
from flask_cors import CORS
import io
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

app = Flask(__name__)
CORS(app)

# Load CLIP model on startup
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Predefined categories for classification
CATEGORIES = [
    "people", "animals", "nature", "urban", "food", "indoor", 
    "outdoor", "sports", "technology", "vehicles", "architecture",
    "art", "documents", "abstract"
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": "CLIP loaded"})

@app.route('/classify', methods=['POST'])
def classify_image():
    """
    Accepts image file, returns AI-generated tags
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    try:
        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Classify with CLIP
        tags = classify_with_clip(image)
        
        # Generate category path
        category = generate_category_path(tags)
        
        return jsonify({
            "tags": tags,
            "category": category,
            "confidence": "high"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def classify_with_clip(image):
    """
    Use CLIP model to classify image against predefined categories
    """
    inputs = processor(
        text=CATEGORIES, 
        images=image, 
        return_tensors="pt", 
        padding=True
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
    
    # Get top 3 categories
    top_indices = probs[0].topk(3).indices.tolist()
    tags = [CATEGORIES[i] for i in top_indices]
    
    return tags

def generate_category_path(tags):
    """
    Create folder path from tags
    Examples: 
    - ["animals", "outdoor"] -> "Animals/Wildlife"
    - ["people", "indoor"] -> "People/Indoor"
    """
    primary_tag = tags[0].capitalize()
    secondary_tag = tags[1].capitalize() if len(tags) > 1 else "General"
    
    return f"{primary_tag}/{secondary_tag}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
