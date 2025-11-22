# 모델 피처 확인 스크립트
import pickle

# 모델 로드
with open("models/logistic_model.pkl", "rb") as f:
    model = pickle.load(f)

# 피처 개수 확인
try:
    print(f"모델이 요구하는 피처 개수: {model.n_features_in_}")
    print(f"피처 이름: {model.feature_names_in_}")
except:
    print("피처 정보를 가져올 수 없습니다.")

# XGBoost 모델도 확인
with open("models/xgb_model.pkl", "rb") as f:
    xgb_model = pickle.load(f)
    
try:
    print(f"\nXGBoost 피처 개수: {xgb_model.n_features_in_}")
except:
    print("XGBoost 피처 정보 없음")
