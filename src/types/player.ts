export type Hitter = {
    ID: number
    이름: string
    팀: string
    포지션: string
    선수이미지: string
    키?: string | number
    몸무게?: string | number
    시즌: string
    경기: number
    타석: number
    안타: number
    홈런: number
    타점: number
    득점: number
    '2타': number
    '3타': number
    도루: number
    볼넷: number
    사구: number
    삼진: number
    타율: number
    출루: number
    장타: number
    OPS: number
    IsoP: number
    BABIP: number
    wOBA: number
    'wRC+': number
    WAR: number
}

export type Pitcher = {
    ID: number
    이름: string
    팀: string
    선수이미지: string
    키?: string | number
    몸무게?: string | number
    시즌: string
    경기: number
    평균자책: number
    승: number
    패: number
    세이브: number
    홀드: number
    이닝: number
    탈삼진: number
    피안타: number
    피홈런: number
    실점: number
    자책점: number
    볼넷: number
    사구: number
    QS: number
    WHIP: number
    'K/9': number
    'BB/9': number
    'K/BB': number
    'K%': number
    WPA: number
    WAR: number
}
