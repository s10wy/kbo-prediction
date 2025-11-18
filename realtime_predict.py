# realtime_predict.py
import pickle
import json
import sys
import numpy as np
import pandas as pd
from sqlalchemy import create_engine

# ===== 설정 =====
DB_USER = 'postgres'
DB_PASSWORD = 'KD2124000'
DB_HOST = 'kbodata.c5eikyi8u0t0.ap-southeast-2.rds.amazonaws.com'
DB_PORT = '5432'
DB_NAME = 'postgres'

# ===== 모델 로드 =====
def load_models():
    try:
        with open("models/logistic_model.pkl", "rb") as f:
            logistic_model = pickle.load(f)
        with open("models/xgb_model.pkl", "rb") as f:
            xgb_model = pickle.load(f)
        with open("models/meta_logistic.pkl", "rb") as f:
            meta_model = pickle.load(f)
        with open("models/encoder.pkl", "rb") as f:
            encoder = pickle.load(f)
        return logistic_model, xgb_model, meta_model, encoder
    except Exception as e:
        print(json.dumps({"error": f"모델 로드 실패: {str(e)}"}))
        sys.exit(1)

# ===== DB에서 데이터 조회 =====
def get_games_by_date(date_str):
    try:
        engine = create_engine(f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')
        query = f"""
        SELECT * FROM "seasonalTeamStats_Matches"."kboallmatches"
        WHERE "날짜"::date = '{date_str}'::date
        """
        games = pd.read_sql(query, engine)
        engine.dispose()
        return games
    except Exception as e:
        print(json.dumps({"error": f"경기 데이터 조회 실패: {str(e)}"}))
        sys.exit(1)

def get_team_stats(year):
    try:
        engine = create_engine(f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')
        query = f"""
        SELECT * FROM "seasonalTeamStats_Matches"."kbogamesteamsstats"
        WHERE "시즌" = {year}
        """
        stats = pd.read_sql(query, engine)
        engine.dispose()
        return stats
    except Exception as e:
        print(json.dumps({"error": f"팀 통계 조회 실패: {str(e)}"}))
        sys.exit(1)

def get_pitcher_stats(year):
    try:
        engine = create_engine(f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')
        query = f"""
        SELECT * FROM "playerstats"."seasonal_pitcher_stats"
        WHERE "시즌" = {year}
        """
        stats = pd.read_sql(query, engine)
        engine.dispose()
        return stats
    except Exception as e:
        print(json.dumps({"error": f"투수 통계 조회 실패: {str(e)}"}))
        sys.exit(1)

# ===== 피처 엔지니어링 (newModeling.ipynb 정확히 복사) =====
def prepare_features(match_df, team_df, pitcher_df):
    try:
        # ---- Step 1: 필요한 컬럼만 선택 ----
        team_df = team_df[['팀이름','시즌','랭킹','승률','경기차','연속승패','최근5경기','팀타율','팀득점',
                            '팀홈런','팀OPS','팀평균자책','실책','WHIP','QS','세이브','홀드']]
        pitcher_df = pitcher_df[['이름','시즌','팀','평균자책','K/BB','WHIP','QS']]

        # 날짜 연도 추출
        match_df["날짜"] = pd.to_datetime(match_df["날짜"])
        match_df["연도"] = match_df["날짜"].dt.year

        # 시즌 초반/중반 구분
        def get_team_snapshot(row):
            year = row["연도"]
            if row["날짜"].month < 6:
                return year - 1
            else:
                return year
        match_df["팀스탯기준연도"] = match_df.apply(get_team_snapshot, axis=1)

        # ---- Step 2: 팀 스탯 병합 ----
        match_df = match_df.merge(team_df.add_prefix("home_"),
                                  left_on=["홈팀", "팀스탯기준연도"], 
                                  right_on=["home_팀이름", "home_시즌"],
                                  how="left")
        match_df = match_df.merge(team_df.add_prefix("away_"),
                                  left_on=["원정팀", "팀스탯기준연도"], 
                                  right_on=["away_팀이름", "away_시즌"],
                                  how="left")

        # ---- Step 3: 선발투수 스탯 병합 ----
        match_df = match_df.merge(pitcher_df.add_prefix("homeSP_"), 
                                  left_on=["홈선발","홈팀","팀스탯기준연도"], 
                                  right_on=["homeSP_이름","homeSP_팀", "homeSP_시즌"], 
                                  how="left")
        match_df = match_df.merge(pitcher_df.add_prefix("awaySP_"), 
                                  left_on=["원정선발","원정팀", "팀스탯기준연도"], 
                                  right_on=["awaySP_이름", "awaySP_팀", "awaySP_시즌"], 
                                  how="left")

        # 선발 결측치 처리
        for col_sp, col_team in zip(["평균자책", "WHIP", "QS"], ["팀평균자책", "WHIP", "QS"]):
            match_df[f"homeSP_{col_sp}"] = match_df[f"homeSP_{col_sp}"].fillna(match_df[f"home_{col_team}"])
            match_df[f"awaySP_{col_sp}"] = match_df[f"awaySP_{col_sp}"].fillna(match_df[f"away_{col_team}"])

        # ---- Step 4: 피처 생성 (차이값) ----
        match_df["starter_era_diff"] = match_df["awaySP_평균자책"] - match_df["homeSP_평균자책"]
        match_df["starter_whip_diff"] = match_df["awaySP_WHIP"] - match_df["homeSP_WHIP"]
        match_df["starter_kbb_diff"] = match_df["homeSP_K/BB"] - match_df["awaySP_K/BB"]
        match_df["starter_qs_diff"] = match_df["homeSP_QS"] - match_df["awaySP_QS"]
        match_df["winrate_diff"] = match_df["home_승률"] - match_df["away_승률"]
        match_df["ops_diff"] = match_df["home_팀OPS"] - match_df["away_팀OPS"]
        match_df["era_diff"] = match_df["away_팀평균자책"] - match_df["home_팀평균자책"]
        match_df["whip_diff"] = match_df["away_WHIP"] - match_df["home_WHIP"]
        match_df["rank_diff"] = match_df["away_랭킹"] - match_df["home_랭킹"]

        return match_df

    except Exception as e:
        print(json.dumps({"error": f"피처 엔지니어링 실패: {str(e)}"}))
        sys.exit(1)

# ===== 예측 =====
def predict_games(match_df, encoder, logistic_model, xgb_model, meta_model):
    try:
        # ---- 불필요한 컬럼 제거 (newModeling.ipynb과 정확히 동일) ----
        drop_cols = ["날짜", "승리팀", "홈팀", "원정팀",'홈점수','승리투수','패전투수','막홈투수','막원정투수','원정점수', '종결이닝','취소', '중단', 
                     'gameId',  '시리즈경기 순번', '시리즈홈승', '시리즈무승부', '시리즈원정승',
                     "home_팀이름",'homeSP_팀', 'home_시즌','home_경기차', 'home_연속승패', 'home_최근5경기',
                     "away_팀이름",'awaySP_팀','away_시즌','away_경기차', 'away_연속승패', 'away_최근5경기', '연도','팀스탯기준연도',
                     'homeSP_이름', 'homeSP_시즌','awaySP_이름', 'awaySP_시즌']
        
        X = match_df.drop(columns=drop_cols, errors='ignore')

        # ---- 결측치 처리 ----
        object_cols = X.select_dtypes(include="object").columns
        num_cols = X.select_dtypes(include=[np.number]).columns

        # 문자열 컬럼 결측치 처리
        X[object_cols] = X[object_cols].fillna("Unknown")
        
        # 숫자형 컬럼 결측치 처리
        X[num_cols] = X[num_cols].fillna(X[num_cols].mean())

        # ---- 인코딩 ----
        if len(object_cols) > 0:
            X[object_cols] = encoder.transform(X[object_cols])

        # ---- Base 모델 예측 ----
        base_preds = np.zeros((len(X), 2))
        base_preds[:, 0] = logistic_model.predict_proba(X)[:, 1]
        base_preds[:, 1] = xgb_model.predict_proba(X)[:, 1]

        # ---- Meta 모델 예측 ----
        meta_pred_proba = meta_model.predict_proba(base_preds)[:, 1]
        meta_pred_label = (meta_pred_proba >= 0.5).astype(int)

        return meta_pred_label, meta_pred_proba

    except Exception as e:
        print(json.dumps({"error": f"예측 실패: {str(e)}"}))
        sys.exit(1)

# ===== 메인 =====
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "날짜 인자가 필요합니다. (YYYY-MM-DD)"}))
        sys.exit(1)
    
    target_date = sys.argv[1]
    
    # 1. 모델 로드
    logistic_model, xgb_model, meta_model, encoder = load_models()
    
    # 2. 데이터 조회
    match_df = get_games_by_date(target_date)
    if match_df.empty:
        print(json.dumps({"error": "해당 날짜에 경기가 없습니다.", "predictions": []}))
        sys.exit(0)
    
    year = pd.to_datetime(target_date).year
    team_df = get_team_stats(year)
    pitcher_df = get_pitcher_stats(year)
    
    # 3. 피처 엔지니어링
    match_df = prepare_features(match_df, team_df, pitcher_df)
    
    # 4. 예측
    pred_labels, pred_probas = predict_games(match_df, encoder, logistic_model, xgb_model, meta_model)
    
    # 5. 결과 구성
    results = []
    for idx, row in match_df.iterrows():
        if idx < len(pred_labels):
            if pred_labels[idx] == 1:
                pred_team = row.get("홈팀", "홈팀")
                pred_prob = pred_probas[idx]
            else:
                pred_team = row.get("원정팀", "원정팀")
                pred_prob = 1 - pred_probas[idx]
            
            results.append({
                "gameId": str(row.get("gameId", "")),
                "날짜": str(row.get("날짜", "")),
                "구장": str(row.get("구장", "")),
                "홈팀": str(row.get("홈팀", "")),
                "원정팀": str(row.get("원정팀", "")),
                "예측승리팀": pred_team,
                "예측확률": float(pred_prob),
            })
    
    print(json.dumps({"success": True, "predictions": results}))