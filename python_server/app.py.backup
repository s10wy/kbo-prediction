# python_server/app.py (최적화 버전 - XGBoost 제거 + 상세 로깅)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import numpy as np
import pandas as pd
from sqlalchemy import create_engine
import os
from datetime import datetime
import sys
import logging

# ===== 로깅 설정 =====
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 표준 출력도 바로 보이도록 (flush=True)
def log_info(msg):
    logger.info(msg)
    print(msg, flush=True)

def log_error(msg):
    logger.error(msg)
    print(msg, flush=True)

def log_debug(msg):
    logger.debug(msg)
    print(msg, flush=True)

app = Flask(__name__)
CORS(app)

log_info("=" * 60)
log_info("🚀 KBO Baseball Prediction Server Starting...")
log_info("=" * 60)

# ===== 환경변수 설정 =====
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'KD2124000')
DB_HOST = os.getenv('DB_HOST', 'kbodata.c5eikyi8u0t0.ap-southeast-2.rds.amazonaws.com')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'postgres')

log_info(f"DB Host: {DB_HOST}")
log_info(f"DB Port: {DB_PORT}")
log_info(f"DB Name: {DB_NAME}")

# ===== 모델 로드 (XGBoost 제외) =====
def load_models():
    """
    로드할 모델:
    - Logistic Regression (빠름)
    - Meta Logistic (최종 예측)
    
    제거한 모델:
    - XGBoost (타임아웃 원인)
    """
    try:
        log_info("[MODEL LOADING] Starting model loading...")
        
        start_time = datetime.now()
        
        # Logistic Regression 로드
        log_info("  [1/3] Loading Logistic Regression model...")
        with open("../models/logistic_model.pkl", "rb") as f:
            logistic_model = pickle.load(f)
        log_info("  [1/3] ✅ Logistic Regression loaded successfully")
        
        # Meta Logistic 로드
        log_info("  [2/3] Loading Meta Logistic model...")
        with open("../models/meta_logistic.pkl", "rb") as f:
            meta_model = pickle.load(f)
        log_info("  [2/3] ✅ Meta Logistic loaded successfully")
        
        # Encoder 로드
        log_info("  [3/3] Loading Encoder...")
        with open("../models/encoder.pkl", "rb") as f:
            encoder = pickle.load(f)
        log_info("  [3/3] ✅ Encoder loaded successfully")
        
        elapsed = (datetime.now() - start_time).total_seconds()
        log_info(f"[MODEL LOADING] ✅ All models loaded in {elapsed:.2f}s")
        
        return logistic_model, meta_model, encoder
    except Exception as e:
        log_error(f"[MODEL LOADING] ❌ Model loading failed: {str(e)}")
        return None, None, None

# 모델 전역 로드
log_info("[STARTUP] Loading models on startup...")
start_startup = datetime.now()
logistic_model, meta_model, encoder = load_models()
startup_time = (datetime.now() - start_startup).total_seconds()
log_info(f"[STARTUP] ✅ Server startup completed in {startup_time:.2f}s")
log_info("=" * 60)

# ===== DB 함수 =====
def get_games_by_date(date_str):
    """경기 데이터를 날짜로 조회"""
    try:
        log_debug(f"  [DB] Querying games for date: {date_str}")
        
        engine = create_engine(
            f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}',
            pool_pre_ping=True
        )
        query = f"""
        SELECT * FROM "seasonalTeamStats_Matches"."kboallmatches"
        WHERE "날짜"::date = '{date_str}'::date
        """
        games = pd.read_sql(query, engine)
        engine.dispose()
        
        log_debug(f"  [DB] Found {len(games)} games")
        return games
    except Exception as e:
        log_error(f"  [DB] ❌ Game data query failed: {str(e)}")
        return pd.DataFrame()

def get_team_stats(year):
    """팀 통계를 시즌으로 조회"""
    try:
        log_debug(f"  [DB] Querying team stats for year: {year}")
        
        engine = create_engine(
            f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}',
            pool_pre_ping=True
        )
        query = f"""
        SELECT * FROM "seasonalTeamStats_Matches"."kbogamesteamsstats"
        WHERE "시즌" = {year}
        """
        stats = pd.read_sql(query, engine)
        engine.dispose()
        
        log_debug(f"  [DB] Found stats for {len(stats)} teams")
        return stats
    except Exception as e:
        log_error(f"  [DB] ❌ Team stats query failed: {str(e)}")
        return pd.DataFrame()

def get_pitcher_stats(year):
    """투수 통계를 시즌으로 조회"""
    try:
        log_debug(f"  [DB] Querying pitcher stats for year: {year}")
        
        engine = create_engine(
            f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}',
            pool_pre_ping=True
        )
        query = f"""
        SELECT * FROM "playerstats"."seasonal_pitcher_stats"
        WHERE "시즌" = {year}
        """
        stats = pd.read_sql(query, engine)
        engine.dispose()
        
        log_debug(f"  [DB] Found stats for {len(stats)} pitchers")
        return stats
    except Exception as e:
        log_error(f"  [DB] ❌ Pitcher stats query failed: {str(e)}")
        return pd.DataFrame()

# ===== 피처 엔지니어링 =====
def prepare_features(match_df, team_df, pitcher_df):
    """데이터 전처리 및 피처 생성"""
    try:
        log_debug("  [FEATURE] Starting feature engineering...")
        
        step_start = datetime.now()
        
        # 필요한 컬럼만 선택
        team_df = team_df[['팀이름','시즌','랭킹','승률','경기차','연속승패','최근5경기','팀타율','팀득점',
                            '팀홈런','팀OPS','팀평균자책','실책','WHIP','QS','세이브','홀드']]
        pitcher_df = pitcher_df[['이름','시즌','팀','평균자책','K/BB','WHIP','QS']]
        log_debug(f"    [1/7] Column selection completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 날짜 처리
        step_start = datetime.now()
        match_df["날짜"] = pd.to_datetime(match_df["날짜"])
        match_df["연도"] = match_df["날짜"].dt.year

        def get_team_snapshot(row):
            year = row["연도"]
            if row["날짜"].month < 6:
                return year - 1
            else:
                return year
        match_df["팀스탯기준연도"] = match_df.apply(get_team_snapshot, axis=1)
        log_debug(f"    [2/7] Date processing completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 팀 스탯 병합
        step_start = datetime.now()
        match_df = match_df.merge(team_df.add_prefix("home_"),
                                  left_on=["홈팀", "팀스탯기준연도"], 
                                  right_on=["home_팀이름", "home_시즌"],
                                  how="left")
        match_df = match_df.merge(team_df.add_prefix("away_"),
                                  left_on=["원정팀", "팀스탯기준연도"], 
                                  right_on=["away_팀이름", "away_시즌"],
                                  how="left")
        log_debug(f"    [3/7] Team stats merge completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 투수 스탯 병합
        step_start = datetime.now()
        match_df = match_df.merge(pitcher_df.add_prefix("homeSP_"), 
                                  left_on=["홈선발","홈팀","팀스탯기준연도"], 
                                  right_on=["homeSP_이름","homeSP_팀", "homeSP_시즌"], 
                                  how="left")
        match_df = match_df.merge(pitcher_df.add_prefix("awaySP_"), 
                                  left_on=["원정선발","원정팀", "팀스탯기준연도"], 
                                  right_on=["awaySP_이름", "awaySP_팀", "awaySP_시즌"], 
                                  how="left")
        log_debug(f"    [4/7] Pitcher stats merge completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 선발 결측치 처리
        step_start = datetime.now()
        for col_sp, col_team in zip(["평균자책", "WHIP", "QS"], ["팀평균자책", "WHIP", "QS"]):
            match_df[f"homeSP_{col_sp}"] = match_df[f"homeSP_{col_sp}"].fillna(match_df[f"home_{col_team}"])
            match_df[f"awaySP_{col_sp}"] = match_df[f"awaySP_{col_sp}"].fillna(match_df[f"away_{col_team}"])
        log_debug(f"    [5/7] Pitcher missing values filled ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 피처 생성 (차이값)
        step_start = datetime.now()
        match_df["starter_era_diff"] = match_df["awaySP_평균자책"] - match_df["homeSP_평균자책"]
        match_df["starter_whip_diff"] = match_df["awaySP_WHIP"] - match_df["homeSP_WHIP"]
        match_df["starter_kbb_diff"] = match_df["homeSP_K/BB"] - match_df["awaySP_K/BB"]
        match_df["starter_qs_diff"] = match_df["homeSP_QS"] - match_df["awaySP_QS"]
        match_df["winrate_diff"] = match_df["home_승률"] - match_df["away_승률"]
        match_df["ops_diff"] = match_df["home_팀OPS"] - match_df["away_팀OPS"]
        match_df["era_diff"] = match_df["away_팀평균자책"] - match_df["home_팀평균자책"]
        match_df["whip_diff"] = match_df["away_WHIP"] - match_df["home_WHIP"]
        match_df["rank_diff"] = match_df["away_랭킹"] - match_df["home_랭킹"]
        log_debug(f"    [6/7] Feature creation completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        log_debug(f"  [FEATURE] ✅ Feature engineering completed")
        return match_df

    except Exception as e:
        log_error(f"  [FEATURE] ❌ Feature engineering failed: {str(e)}")
        return None

# ===== 예측 (XGBoost 제거) =====
def predict_games(match_df, encoder, logistic_model, meta_model):
    """
    최적화된 예측 함수:
    - Logistic Regression만 사용 (빠름)
    - Meta Logistic으로 최종 예측
    - XGBoost 제거 (타임아웃 원인)
    """
    try:
        log_debug("  [PREDICTION] Starting prediction...")
        
        step_start = datetime.now()
        
        # 불필요한 컬럼 제거
        drop_cols = ["날짜", "승리팀", "홈팀", "원정팀",'홈점수','승리투수','패전투수','막홈투수','막원정투수','원정점수', '종결이닝','취소', '중단', 
                     'gameId',  '시리즈경기 순번', '시리즈홈승', '시리즈무승부', '시리즈원정승',
                     "home_팀이름",'homeSP_팀', 'home_시즌','home_경기차', 'home_연속승패', 'home_최근5경기',
                     "away_팀이름",'awaySP_팀','away_시즌','away_경기차', 'away_연속승패', 'away_최근5경기', '연도','팀스탯기준연도',
                     'homeSP_이름', 'homeSP_시즌','awaySP_이름', 'awaySP_시즌']
        
        X = match_df.drop(columns=drop_cols, errors='ignore')
        log_debug(f"    [1/5] Column dropping completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 결측치 처리
        step_start = datetime.now()
        object_cols = X.select_dtypes(include="object").columns
        num_cols = X.select_dtypes(include=[np.number]).columns

        X[object_cols] = X[object_cols].fillna("Unknown")
        X[num_cols] = X[num_cols].fillna(X[num_cols].mean())
        log_debug(f"    [2/5] Missing values filled ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # 인코딩
        step_start = datetime.now()
        if len(object_cols) > 0:
            X[object_cols] = encoder.transform(X[object_cols])
        log_debug(f"    [3/5] Encoding completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # Logistic Regression 예측 (빠름)
        step_start = datetime.now()
        logistic_pred_proba = logistic_model.predict_proba(X)[:, 1]
        log_debug(f"    [4/5] Logistic Regression prediction completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        # Meta 모델 예측
        # Logistic만 사용하므로 단일 특징으로 변환
        step_start = datetime.now()
        meta_pred_proba = meta_model.predict_proba(
            np.column_stack([logistic_pred_proba, logistic_pred_proba])
        )[:, 1]
        meta_pred_label = (meta_pred_proba >= 0.5).astype(int)
        log_debug(f"    [5/5] Meta prediction completed ({(datetime.now()-step_start).total_seconds():.2f}s)")

        log_debug(f"  [PREDICTION] ✅ Prediction completed for {len(X)} games")
        return meta_pred_label, meta_pred_proba

    except Exception as e:
        log_error(f"  [PREDICTION] ❌ Prediction failed: {str(e)}")
        return None, None

# ===== API 엔드포인트 =====
@app.route('/health', methods=['GET'])
def health():
    """서버 상태 확인"""
    log_info("[API] GET /health")
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": all([logistic_model, meta_model, encoder])
    })

@app.route('/predict', methods=['POST', 'GET'])
def predict():
    """
    실시간 경기 예측 API
    - GET: /predict?date=2025-03-15
    - POST: {"date": "2025-03-15"}
    """
    request_id = f"[{datetime.now().strftime('%H:%M:%S')}]"
    
    try:
        # 날짜 파라미터 받기
        if request.method == 'GET':
            date = request.args.get('date')
        else:
            data = request.get_json()
            date = data.get('date') if data else None

        log_info(f"{request_id} [API] Prediction request for date: {date}")

        if not date:
            log_error(f"{request_id} [API] Missing date parameter")
            return jsonify({"error": "날짜 파라미터가 필요합니다 (YYYY-MM-DD)"}), 400

        # 날짜 형식 검증
        date_regex = r'^\d{4}-\d{2}-\d{2}$'
        import re
        if not re.match(date_regex, date):
            log_error(f"{request_id} [API] Invalid date format: {date}")
            return jsonify({"error": "올바른 날짜 형식이 필요합니다 (YYYY-MM-DD)"}), 400

        # 전체 처리 시간 측정
        total_start = datetime.now()

        # 1. 데이터 조회
        log_info(f"{request_id} [PROCESSING] Step 1/5: Querying game data...")
        match_df = get_games_by_date(date)
        if match_df.empty:
            log_info(f"{request_id} [PROCESSING] No games found for {date}")
            return jsonify({"error": "해당 날짜에 경기가 없습니다.", "predictions": []}), 404

        year = pd.to_datetime(date).year
        
        # 2. 팀/투수 통계 조회
        log_info(f"{request_id} [PROCESSING] Step 2/5: Querying team and pitcher stats...")
        team_df = get_team_stats(year)
        pitcher_df = get_pitcher_stats(year)
        
        # 3. 피처 엔지니어링
        log_info(f"{request_id} [PROCESSING] Step 3/5: Feature engineering...")
        match_df = prepare_features(match_df, team_df, pitcher_df)
        if match_df is None:
            log_error(f"{request_id} [PROCESSING] Feature engineering failed")
            return jsonify({"error": "피처 엔지니어링 실패"}), 500
        
        # 4. 예측
        log_info(f"{request_id} [PROCESSING] Step 4/5: Running prediction models...")
        pred_labels, pred_probas = predict_games(match_df, encoder, logistic_model, meta_model)
        if pred_labels is None:
            log_error(f"{request_id} [PROCESSING] Prediction failed")
            return jsonify({"error": "예측 실패"}), 500

        # 5. 결과 구성
        log_info(f"{request_id} [PROCESSING] Step 5/5: Formatting results...")
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

        total_time = (datetime.now() - total_start).total_seconds()
        log_info(f"{request_id} [PROCESSING] ✅ Completed {len(results)} predictions in {total_time:.2f}s")

        return jsonify({
            "success": True,
            "predictions": results,
            "processing_time_seconds": total_time,
            "games_count": len(results)
        })

    except Exception as e:
        log_error(f"{request_id} [API] ❌ Unhandled exception: {str(e)}")
        return jsonify({
            "error": f"서버 오류 발생: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    log_info(f"🚀 Flask server starting on port {port}")
    log_info("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=False)