import sys 
import torch
import pickle
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity
import json

#load .pkl
with open('src/ml/model/medicine_data.pkl', 'rb') as f:
    medicine_data = pickle.load(f)

medicine_embeddings = torch.tensor(medicine_data['embeddings'])
medicine_names = medicine_data['nama_obat']
sub_kelas_terapi = medicine_data['sub_kelas_terapi']
sediaan = medicine_data['sediaan']
harga_obat = medicine_data['harga_obat']

#predict meds
model = SentenceTransformer('pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb')

def get_medicine_prediction(query):
    #encode query
    query_embedding = model.encode(query, convert_to_tensor=True)
    #cosine similarity
    similarities = util.pytorch_cos_sim(query_embedding, medicine_embeddings)[0] 
    #get top 5
    top_indices = torch.topk(similarities, k=5).indices.tolist()

    results = []
    for i in top_indices:
        results.append({
            "name": medicine_names[i],
            "harga_obat": harga_obat[i],
            "similarity_percentage": round(similarities[i].item() * 100, 2),
            "sub_kelas_terapi": sub_kelas_terapi[i],
            'sediaan': sediaan[i]
        })

    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1) 

    query = sys.argv[1]
    results = get_medicine_prediction(query)
    print(json.dumps(results, ensure_ascii=False))
