import sys 
import torch
import pickle
from googletrans import Translator
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity
import json

translator = Translator()
model = SentenceTransformer('pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb')

#load .pkl
with open('src/ml/model/icd10_data.pkl', 'rb') as f:
    data = pickle.load(f)

embeddings = torch.tensor(data['embeddings']) 
kode_icd = data['kode_icd']
nama_penyakit = data['nama_penyakit']

#translate
def translate_ind_to_en(teks_indonesia):    
    try:
        hasil = translator.translate(teks_indonesia, src='id', dest='en')
        return hasil.text
    except Exception as e:
        print("⚠️ Terjadi kesalahan saat menerjemahkan:", e)
        return teks_indonesia

#predict icd10
def get_icd_prediction(query: str, top_k=5):
    #translate input    
    translated = translate_ind_to_en(query)
    #encode query
    query_embedding = model.encode(translated, convert_to_tensor=True)  
    #cosine similariy
    similarities = util.pytorch_cos_sim(query_embedding, embeddings)[0] 
    #get top similar entries
    top_results = torch.topk(similarities, k=top_k)

    results = []
    for score, idx in zip(top_results[0], top_results[1]):
        index = idx.item()
        results.append({
            'kode_icd': kode_icd[index],
            'nama_penyakit': nama_penyakit[index],
            'similarity_percentage': round(score.item() * 100, 2)
        })

    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)

    query = sys.argv[1]
    results = get_icd_prediction(query)
    print(json.dumps(results, ensure_ascii=False))