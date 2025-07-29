
# 🌶️ HowHot — Predict Spiciness from Food Images

**HowHot** is a web application that predicts the spiciness level of a meal just by looking at a photo. Built for those who love or need to avoid spicy food, the app uses deep learning to estimate spice levels on a scale from **0 (not spicy) to 5 (very spicy)**. Users can also give feedback to improve future predictions — making it smarter over time.

🔗 **Live Demo**: [https://howhot.netlify.app/](https://howhot.netlify.app/)


<img width="706" height="340" alt="image" src="https://github.com/user-attachments/assets/def810be-410a-454f-8aa1-54a1d1ba5adf" />

---

## 🧠 Why This Matters

Spiciness is hard to measure or communicate clearly — especially from menu names or food photos. While the **Scoville Heat Unit (SHU)** is a technical scale, it's not user-friendly. HowHot solves this by offering a simple, intuitive prediction tool powered by AI.

Use cases include:
- Dietary safety (for those sensitive to spicy food)
- Cultural food exploration
- Smart restaurant discovery
- Fun meal comparisons with friends!

---

## ⚙️ System Architecture


| Component         | Technology          |
|------------------|---------------------|
| **Frontend**      | React + Netlify     |
| **Image Storage** | Amazon S3           |
| **Prediction API**| Railway backend     |
| **ML Model**      | ResNet-18 (PyTorch) |
| **Feedback DB**   | PostgreSQL          |
| **Monitoring**    | (Optional) CloudWatch + SNS |

<img width="6432" height="2816" alt="image (7)" src="https://github.com/user-attachments/assets/c2ea9153-870c-4870-9ecc-006677cbd92e" />


---

## 🧪 Model Overview

**Model:** ResNet-18 with 6-class classification (spice level 0–5)  
**Training Approach:**
- Transfer learning from ImageNet
- Data augmentation: rotation, brightness, zoom
- Semi-supervised learning with pseudo-labeling
- High-confidence unlabeled samples used for training

```python
# Pseudo-code: training loop includes both labeled and pseudo-labeled data
if confidence > 0.9:
    use as pseudo label
````

**Data Source:** Food image dataset built using **Foursquare Places API**, with labels based on dish types and known spice profiles.

---

## 🔁 Continual Learning from Feedback

Users can give feedback using the **"Not Quite?"** button after a prediction. The app logs:

* Image ID
* Predicted spice level
* Corrected spice level (if provided)
* Timestamp

📊 Stored in PostgreSQL for future retraining and error analysis:

```sql
CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    image_id TEXT,
    predicted_level INTEGER,
    corrected_level INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💾 Image Storage in S3

Uploaded images are stored **temporarily** in S3 and removed shortly after prediction or feedback. Security and privacy practices include:

* UUID-based image naming
* No permanent storage
* Future cleanup policy using S3 lifecycle rules

---

## 🔄 Full Prediction + Feedback Flow

1. User uploads a food image via the web UI
2. Image is uploaded to S3 → URL passed to backend
3. Backend loads model → predicts spice level
4. Prediction is returned to frontend and displayed
5. User can give feedback if prediction is off
6. Feedback is stored in PostgreSQL for retraining

---

## 🧱 MLOps Practices

* 🧪 **MLflow** used for experiment tracking and model versioning
* 🔁 **Human-in-the-loop** continual learning with user corrections
* 🛠️ **Backend served via Railway** for fast model inference
* 🧹 **Data cleaning pipeline** with augmentation and label filtering

---

## 📦 Tech Stack

* **Frontend**: React, Netlify
* **Backend**: FastAPI, Railway
* **Model**: PyTorch (ResNet-18)
* **Database**: PostgreSQL
* **Storage**: Amazon S3
* **Monitoring (Optional)**: AWS CloudWatch, SNS

---

## 🚀 How to Use

1. Go to [https://howhot.netlify.app/](https://howhot.netlify.app/)
2. Upload a food image
3. View the predicted spice level
4. Submit feedback if it’s inaccurate
5. That’s it! Your input helps the model improve

---

## 📈 Future Enhancements

* Automatic cleanup of stale images from S3
* Enhanced feedback UI (heat maps, comment box)
* Spice level detection from restaurant menus
* Mobile app version

---

## 🧪 Example Predictions

| Image           | Predicted Spice Level |
| --------------- | --------------------- |
| 🌮 Taco         | 🌶️🌶️ (2)            |
| 🍜 Spicy Ramen  | 🌶️🌶️🌶️🌶️ (4)      |
| 🥗 Caesar Salad | 🌶️ (0)               |

---

## 🧑‍💻 Author

Built with 🔥 by [@shuseiyokoi](https://github.com/shuseiyokoi)

---

## 📄 License

MIT License

---

Give it a try and find out how 🔥 your food really is!
👉 [https://howhot.netlify.app/](https://howhot.netlify.app/)



---

