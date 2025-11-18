# python_server/app.py

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
from concurrent.futures import ThreadPoolExecutor
import threading

# ===== 로깅 설정 =====
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

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

# 스레드 풀 설정
executor = ThreadPoolExecutor(max_workers=2)

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

# ===== 모델 로드 (4개 Base Models + Meta Model) =====
def load_models():
    """
    로드할 모델:
    - Logistic Regression (빠름)
    - XGBoost (강력함)
    - LightGBM (빠르고 정확함)
    - CatBoost (정확함)
    - Meta Logistic (최종 예측)
    """
    try:
        log_info("[MODEL LOADING] Starting model loading...")
        
        start_time = datetime.now()
        
        # 1. Logistic Regression
        log_info("  [1/6] Loading Logistic Regression model...")
        with open("../models/logistic_model.pkl", "rb") as f:
            logistic_model = pickle.load(f)
        log_info("  [1/6] ✅ Logistic Regression loaded successfully")
        
        # 2. XGBoost
        log_info("  [2/6] Loading XGBoost model...")
        with open("../models/xgb_model.pkl", "rb") as f:
            xgb_model = pickle.load(f)
        log_info("  [2/6] ✅ XGBoost loaded successfully")
        
        # 3. LightGBM
        log_info("  [3/6] Loading LightGBM model...")
        with open("../models/lgbm_model.pkl", "rb") as f:
            lgbm_model = pickle.load(f)
        log_info("  [3/6] ✅ LightGBM loaded successfully")
        
        # 4. CatBoost
        log_info("  [4/6] Loading CatBoost model...")
        with open("../models/cat_model.pkl", "rb") as f:
            cat_model = pickle.load(f)
        log_info("  [4/6] ✅ CatBoost loaded successfully")
        
        # 5. Meta Logistic
        log_info("  [5/6] Loading Meta Logistic model...")
        with open("../models/meta_logistic.pkl", "rb") as f:
            meta_model = pickle.load(f)
        log_info("  [5/6] ✅ Meta Logistic loaded successfully")
        
        # 6. Encoder
        log_info("  [6/6] Loading Encoder...")
        with open("../models/encoder.pkl", "rb") as f:
            encoder = pickle.load(f)
        log_info("  [6/6] ✅ Encoder loaded successfully")
        
        elapsed = (datetime.now() - start_time).total_seconds()
        log_info(f"[MODEL LOADING] ✅ All models loaded in {elapsed:.2f}s")
        
        return logistic_model, xgb_model, lgbm_model, cat_model, meta_model, encoder
    except Exception as e:
        log_error(f"[MODEL LOADING] ❌ Model loading failed: {str(e)}")
        return None, None, None, None, None, None

# 모델 전역 로드
log_info("[STARTUP] Loading models on startup...")
start_startup = datetime.now()
logistic_model, xgb_model, lgbm_model, cat_model, meta_model, encoder = load_models()
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
            pool_pre_ping=True,
            connect_args={'connect_timeout': 10}
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
            pool_pre_ping=True,
            connect_args={'connect_timeout': 10}
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
            pool_pre_ping=True,
            connect_args={'connect_timeout': 10}
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
        
        # 필요한 컬럼만 선택
        team_df = team_df[['팀이름','시즌','랭킹','승률','경기차','연속승패','최근5경기','팀타율','팀득점',
                            '팀홈런','팀OPS','팀평균자책','실책','WHIP','QS','세이브','홀드']]
        pitcher_df = pitcher_df[['이름','시즌','팀','평균자책','K/BB','WHIP','QS']]

        # 날짜 처리
        match_df["날짜"] = pd.to_datetime(match_df["날짜"])
        match_df["연도"] = match_df["날짜"].dt.year

        def get_team_snapshot(row):
            year = row["연도"]
            if row["날짜"].month < 6:
                return year - 1
            else:
                return year
        match_df["팀스탯기준연도"] = match_df.apply(get_team_snapshot, axis=1)

        # 팀 스탯 병합
        match_df = match_df.merge(team_df.add_prefix("home_"),
                                  left_on=["홈팀", "팀스탯기준연도"], 
                                  right_on=["home_팀이름", "home_시즌"],
                                  how="left")
        match_df = match_df.merge(team_df.add_prefix("away_"),
                                  left_on=["원정팀", "팀스탯기준연도"], 
                                  right_on=["away_팀이름", "away_시즌"],
                                  how="left")

        # 투수 스탯 병합
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

        # 피처 생성 (차이값)
        match_df["starter_era_diff"] = match_df["awaySP_평균자책"] - match_df["homeSP_평균자책"]
        match_df["starter_whip_diff"] = match_df["awaySP_WHIP"] - match_df["homeSP_WHIP"]
        match_df["starter_kbb_diff"] = match_df["homeSP_K/BB"] - match_df["awaySP_K/BB"]
        match_df["starter_qs_diff"] = match_df["homeSP_QS"] - match_df["awaySP_QS"]
        match_df["winrate_diff"] = match_df["home_승률"] - match_df["away_승률"]
        match_df["ops_diff"] = match_df["home_팀OPS"] - match_df["away_팀OPS"]
        match_df["era_diff"] = match_df["away_팀평균자책"] - match_df["home_팀평균자책"]
        match_df["whip_diff"] = match_df["away_WHIP"] - match_df["home_WHIP"]
        match_df["rank_diff"] = match_df["away_랭킹"] - match_df["home_랭킹"]

        log_debug(f"  [FEATURE] ✅ Feature engineering completed")
        return match_df

    except Exception as e:
        log_error(f"  [FEATURE] ❌ Feature engineering failed: {str(e)}")
        return None

# ===== 예측 (4개 모델 병렬 + Meta) =====
def predict_single_model(model, X, model_name):
    """단일 모델 예측 (병렬 처리용)"""
    try:
        log_debug(f"    [PARALLEL] Predicting with {model_name}...")
        return model.predict_proba(X)[:, 1]
    except Exception as e:
        log_error(f"    [PARALLEL] {model_name} prediction failed: {str(e)}")
        return None

def predict_games(match_df, encoder, logistic_model, xgb_model, lgbm_model, cat_model, meta_model):
    """
    4개 Base 모델로 예측 후 Meta 모델로 최종 예측 (병렬화)
    """
    try:
        log_debug("  [PREDICTION] Starting prediction...")
        
        # 불필요한 컬럼 제거
        drop_cols = ["날짜", "승리팀", "홈팀", "원정팀",'홈점수','승리투수','패전투수','막홈투수','막원정투수','원정점수', '종결이닝','취소', '중단', 
                     'gameId',  '시리즈경기 순번', '시리즈홈승', '시리즈무승부', '시리즈원정승',
                     "home_팀이름",'homeSP_팀', 'home_시즌','home_경기차', 'home_연속승패', 'home_최근5경기',
                     "away_팀이름",'awaySP_팀','away_시즌','away_경기차', 'away_연속승패', 'away_최근5경기', '연도','팀스탯기준연도',
                     'homeSP_이름', 'homeSP_시즌','awaySP_이름', 'awaySP_시즌']
        
        X = match_df.drop(columns=drop_cols, errors='ignore')

        # 결측치 처리
        object_cols = X.select_dtypes(include="object").columns
        num_cols = X.select_dtypes(include=[np.number]).columns

        X[object_cols] = X[object_cols].fillna("Unknown")
        X[num_cols] = X[num_cols].fillna(X[num_cols].mean())

        # 인코딩
        if len(object_cols) > 0:
            X[object_cols] = encoder.transform(X[object_cols])

        # 4개 Base 모델 예측 (병렬화)
        log_debug(f"    [PARALLEL] Starting parallel prediction with 4 models...")
        futures = {
            'logistic': executor.submit(predict_single_model, logistic_model, X, 'Logistic'),
            'xgb': executor.submit(predict_single_model, xgb_model, X, 'XGBoost'),
            'lgbm': executor.submit(predict_single_model, lgbm_model, X, 'LightGBM'),
            'cat': executor.submit(predict_single_model, cat_model, X, 'CatBoost'),
        }
        
        base_preds = np.zeros((len(X), 4))
        for idx, (name, future) in enumerate(futures.items()):
            try:
                result = future.result(timeout=60)  # 각 모델 60초 타임아웃
                if result is not None:
                    base_preds[:, idx] = result
                    log_debug(f"    [PARALLEL] ✅ {name} completed")
            except Exception as e:
                log_error(f"    [PARALLEL] ❌ {name} failed: {str(e)}")
                return None, None

        # Meta 모델 예측
        log_debug(f"    [PARALLEL] Running Meta model...")
        meta_pred_proba = meta_model.predict_proba(base_preds)[:, 1]
        meta_pred_label = (meta_pred_proba >= 0.5).astype(int)
        log_debug(f"  [PREDICTION] ✅ Prediction completed for {len(X)} games")
        
        return meta_pred_label, meta_pred_proba

    except Exception as e:
        log_error(f"  [PREDICTION] ❌ Prediction failed: {str(e)}")
        return None, None

# ===== API 엔드포인트 =====
@app.route('/health', methods=['GET'])
def health():
    """서버 상태 확인"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": all([logistic_model, xgb_model, lgbm_model, cat_model, meta_model, encoder])
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
        
        # 2. 팀/투수 통계 조회 (병렬화)
        log_info(f"{request_id} [PROCESSING] Step 2/5: Querying team and pitcher stats...")
        team_future = executor.submit(get_team_stats, year)
        pitcher_future = executor.submit(get_pitcher_stats, year)
        team_df = team_future.result(timeout=30)
        pitcher_df = pitcher_future.result(timeout=30)
        
        # 3. 피처 엔지니어링
        log_info(f"{request_id} [PROCESSING] Step 3/5: Feature engineering...")
        match_df = prepare_features(match_df, team_df, pitcher_df)
        if match_df is None:
            log_error(f"{request_id} [PROCESSING] Feature engineering failed")
            return jsonify({"error": "피처 엔지니어링 실패"}), 500
        
        # 4. 예측 (병렬화)
        log_info(f"{request_id} [PROCESSING] Step 4/5: Running prediction models (병렬 처리)...")
        pred_labels, pred_probas = predict_games(match_df, encoder, logistic_model, xgb_model, lgbm_model, cat_model, meta_model)
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
            "games_count": len(results),
            "models": ["Logistic", "XGBoost", "LightGBM", "CatBoost", "Meta"],
        })

    except Exception as e:
        log_error(f"{request_id} [API] ❌ Unhandled exception: {str(e)}")
        return jsonify({
            "error": f"서버 오류 발생: {str(e)}"
        }), 500

# ===== 팀별 투수 조회 API =====
@app.route('/api/pitchers', methods=['GET'])
def get_pitchers():
    """
    팀별 선발 투수 조회
    
    Parameters:
    - team: 팀 이름 (예: "두산")
    - season: 시즌 (기본값: 2025)
    
    Response:
    {
      "success": true,
      "team": "두산",
      "season": 2025,
      "count": 28,
      "pitchers": [
        {
          "name": "박찬호",
          "era": 3.45,
          "whip": 1.10,
          "kbb": 2.5,
          "qs": 15
        },
        ...
      ]
    }
    """
    try:
        team = request.args.get('team')
        season = request.args.get('season', 2025, type=int)
        
        # 입력 검증
        if not team:
            return jsonify({"error": "team 파라미터가 필요합니다"}), 400
        
        valid_teams = ['두산', 'KIA', 'LG', 'SK', 'NC', '삼성', '한화', 'SSG', '롯데', 'KT']
        if team not in valid_teams:
            return jsonify({"error": f"유효하지 않은 팀: {team}"}), 400
        
        log_info(f"[API] Fetching pitchers for team: {team}, season: {season}")
        
        # 팀별 투수 필터링
        team_pitchers = pitcher_df[
            (pitcher_df['팀'] == team) & 
            (pitcher_df['시즌'] == season)
        ].drop_duplicates(subset=['이름'])  # 같은 이름 중복 제거
        
        # ERA로 정렬 (ERA 낮을수록 좋은 투수)
        team_pitchers = team_pitchers.sort_values('평균자책')
        
        # 데이터 변환
        pitchers_list = []
        for _, pitcher in team_pitchers.iterrows():
            pitchers_list.append({
                "name": str(pitcher['이름']),
                "era": float(pitcher['평균자책']),
                "whip": float(pitcher['WHIP']),
                "kbb": float(pitcher['K/BB']) if pitcher['K/BB'] > 0 else 0,
                "qs": int(pitcher['QS']) if pd.notna(pitcher['QS']) else 0,
            })
        
        log_info(f"[API] Found {len(pitchers_list)} pitchers for {team}")
        
        return jsonify({
            "success": True,
            "team": team,
            "season": season,
            "count": len(pitchers_list),
            "pitchers": pitchers_list
        })
    
    except Exception as e:
        log_error(f"[API] /api/pitchers failed: {str(e)}")
        return jsonify({"error": f"서버 오류: {str(e)}"}), 500


# ===== 커스텀 경기 예측 API =====
@app.route('/api/predict-custom', methods=['POST'])
def predict_custom():
    """
    사용자가 선택한 경기 예측
    
    Request Body:
    {
      "homeTeam": "두산",
      "awayTeam": "KIA",
      "homePitcher": "박찬호",
      "awayPitcher": "류현진"
    }
    
    Response:
    {
      "success": true,
      "homeTeam": "두산",
      "awayTeam": "KIA",
      "homePitcher": "박찬호",
      "awayPitcher": "류현진",
      "predictedWinner": "두산",
      "predictedProbability": 0.57,
      "modelDetails": {
        "logistic": 0.52,
        "xgboost": 0.58,
        "lightgbm": 0.55,
        "catboost": 0.60,
        "meta": 0.57
      }
    }
    """
    request_id = f"[{datetime.now().strftime('%H:%M:%S')}]"
    
    try:
        # 요청 데이터 파싱
        data = request.get_json()
        if not data:
            return jsonify({"error": "요청 본문이 없습니다"}), 400
        
        home_team = data.get('homeTeam', '').strip()
        away_team = data.get('awayTeam', '').strip()
        home_pitcher = data.get('homePitcher', '').strip()
        away_pitcher = data.get('awayPitcher', '').strip()
        
        log_info(f"{request_id} [API] Custom prediction request:")
        log_info(f"{request_id}   Home: {home_team} ({home_pitcher})")
        log_info(f"{request_id}   Away: {away_team} ({away_pitcher})")
        
        # ===== 1단계: 입력 검증 =====
        valid_teams = ['두산', 'KIA', 'LG', 'SK', 'NC', '삼성', '한화', 'SSG', '롯데', 'KT']
        
        if not home_team or home_team not in valid_teams:
            return jsonify({"error": f"유효하지 않은 홈 팀: {home_team}"}), 400
        
        if not away_team or away_team not in valid_teams:
            return jsonify({"error": f"유효하지 않은 상대 팀: {away_team}"}), 400
        
        if home_team == away_team:
            return jsonify({"error": "홈 팀과 상대 팀이 같을 수 없습니다"}), 400
        
        if not home_pitcher:
            return jsonify({"error": "홈 팀 선발 투수가 필요합니다"}), 400
        
        if not away_pitcher:
            return jsonify({"error": "상대 팀 선발 투수가 필요합니다"}), 400
        
        # ===== 2단계: 현재 시즌 데이터 조회 =====
        year = datetime.now().year
        
        log_info(f"{request_id} [PROCESSING] Step 1/5: Loading team stats...")
        team_df = get_team_stats(year)
        
        if team_df.empty:
            return jsonify({"error": f"{year}년 팀 통계를 찾을 수 없습니다"}), 404
        
        log_info(f"{request_id} [PROCESSING] Step 2/5: Loading pitcher stats...")
        pitcher_df_current = get_pitcher_stats(year)
        
        if pitcher_df_current.empty:
            return jsonify({"error": f"{year}년 투수 통계를 찾을 수 없습니다"}), 404
        
        # ===== 3단계: 팀 통계 조회 =====
        home_stats = team_df[team_df['팀이름'] == home_team]
        away_stats = team_df[team_df['팀이름'] == away_team]
        
        if home_stats.empty:
            return jsonify({"error": f"팀 {home_team}의 통계를 찾을 수 없습니다"}), 404
        
        if away_stats.empty:
            return jsonify({"error": f"팀 {away_team}의 통계를 찾을 수 없습니다"}), 404
        
        home_stats = home_stats.iloc[0]
        away_stats = away_stats.iloc[0]
        
        # ===== 4단계: 투수 통계 조회 =====
        home_pitcher_stats = pitcher_df_current[
            (pitcher_df_current['이름'] == home_pitcher) & 
            (pitcher_df_current['팀'] == home_team)
        ]
        
        away_pitcher_stats = pitcher_df_current[
            (pitcher_df_current['이름'] == away_pitcher) & 
            (pitcher_df_current['팀'] == away_team)
        ]
        
        # 투수가 없으면 팀 평균값 사용
        if home_pitcher_stats.empty:
            log_info(f"{request_id}   [INFO] {home_pitcher} not found in {home_team}, using team average")
            home_pitcher_stats = {
                '평균자책': home_stats['팀평균자책'],
                'WHIP': home_stats['WHIP'],
                'K/BB': 1.5,  # 기본값
                'QS': home_stats['QS'],
            }
        else:
            home_pitcher_stats = home_pitcher_stats.iloc[0].to_dict()
        
        if away_pitcher_stats.empty:
            log_info(f"{request_id}   [INFO] {away_pitcher} not found in {away_team}, using team average")
            away_pitcher_stats = {
                '평균자책': away_stats['팀평균자책'],
                'WHIP': away_stats['WHIP'],
                'K/BB': 1.5,  # 기본값
                'QS': away_stats['QS'],
            }
        else:
            away_pitcher_stats = away_pitcher_stats.iloc[0].to_dict()
        
        # ===== 5단계: 피처 생성 =====
        log_info(f"{request_id} [PROCESSING] Step 3/5: Creating features...")
        
        try:
            features_dict = {
                'starter_era_diff': float(away_pitcher_stats['평균자책']) - float(home_pitcher_stats['평균자책']),
                'starter_whip_diff': float(away_pitcher_stats['WHIP']) - float(home_pitcher_stats['WHIP']),
                'starter_kbb_diff': float(home_pitcher_stats['K/BB']) - float(away_pitcher_stats['K/BB']),
                'starter_qs_diff': float(home_pitcher_stats['QS']) - float(away_pitcher_stats['QS']),
                'winrate_diff': float(home_stats['승률']) - float(away_stats['승률']),
                'ops_diff': float(home_stats['팀OPS']) - float(away_stats['팀OPS']),
                'era_diff': float(away_stats['팀평균자책']) - float(home_stats['팀평균자책']),
                'whip_diff': float(away_stats['WHIP']) - float(home_stats['WHIP']),
                'rank_diff': float(away_stats['랭킹']) - float(home_stats['랭킹']),
            }
        except Exception as e:
            log_error(f"{request_id} [ERROR] Feature creation failed: {str(e)}")
            return jsonify({"error": f"피처 생성 실패: {str(e)}"}), 500
        
        # ===== 6단계: 예측 =====
        log_info(f"{request_id} [PROCESSING] Step 4/5: Running predictions (병렬 처리)...")
        
        try:
            # 단일 샘플을 DataFrame으로 변환
            X_custom = pd.DataFrame([features_dict])
            
            # 병렬 예측
            futures = {
                'logistic': executor.submit(predict_single_model, logistic_model, X_custom, 'Logistic'),
                'xgboost': executor.submit(predict_single_model, xgb_model, X_custom, 'XGBoost'),
                'lightgbm': executor.submit(predict_single_model, lgbm_model, X_custom, 'LightGBM'),
                'catboost': executor.submit(predict_single_model, cat_model, X_custom, 'CatBoost'),
            }
            
            base_preds = np.zeros((1, 4))
            for idx, (name, future) in enumerate(futures.items()):
                try:
                    result = future.result(timeout=60)
                    if result is not None:
                        base_preds[0, idx] = result[0]
                        log_debug(f"    [PARALLEL] ✅ {name} completed")
                except Exception as e:
                    log_error(f"    [PARALLEL] ❌ {name} failed: {str(e)}")
                    return jsonify({"error": f"{name} 예측 실패"}), 500
            
            # Meta 모델 예측
            log_debug(f"    [PARALLEL] Running Meta model...")
            meta_pred_proba = meta_model.predict_proba(base_preds)[0, 1]
            
            log_debug(f"  [PREDICTION] ✅ Prediction completed")
        
        except Exception as e:
            log_error(f"{request_id} [ERROR] Prediction failed: {str(e)}")
            return jsonify({"error": f"예측 실패: {str(e)}"}), 500
        
        # ===== 7단계: 결과 구성 =====
        log_info(f"{request_id} [PROCESSING] Step 5/5: Formatting results...")
        
        pred_team = home_team if meta_pred_proba >= 0.5 else away_team
        pred_prob = meta_pred_proba if meta_pred_proba >= 0.5 else 1 - meta_pred_proba
        
        result = {
            "success": True,
            "homeTeam": home_team,
            "awayTeam": away_team,
            "homePitcher": home_pitcher,
            "awayPitcher": away_pitcher,
            "predictedWinner": pred_team,
            "predictedProbability": float(pred_prob),
            "modelDetails": {
                "logistic": float(base_preds[0, 0]),
                "xgboost": float(base_preds[0, 1]),
                "lightgbm": float(base_preds[0, 2]),
                "catboost": float(base_preds[0, 3]),
                "meta": float(meta_pred_proba),
            }
        }
        
        log_info(f"{request_id} [PROCESSING] ✅ Custom prediction completed")
        log_info(f"{request_id}   Predicted Winner: {pred_team} ({pred_prob*100:.1f}%)")
        
        return jsonify(result)
    
    except Exception as e:
        log_error(f"{request_id} [API] ❌ Unhandled exception: {str(e)}")
        return jsonify({"error": f"서버 오류: {str(e)}"}), 500


# ===== 헬스 체크 (기존 코드) =====
@app.route('/health', methods=['GET'])
def health():
    """서버 상태 확인"""
    log_info("[API] GET /health")
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": all([logistic_model, xgb_model, lgbm_model, cat_model, meta_model, encoder]),
        "available_endpoints": [
            "/health",
            "/predict",
            "/api/pitchers",
            "/api/predict-custom"
        ]
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    log_info(f"🚀 Flask server starting on port {port}")
    log_info("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)