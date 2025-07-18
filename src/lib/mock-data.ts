export const userProfile = {
  username: "USER_NAME", //유저명
  avatarUrl: "https://placehold.co/100x100.png", //유저가 설정한 프로필 사진
  lastJoin: "2025-07-17", //마지막 플레이
  lastUpdateData: "2025-07-17:16:45:00" //마지막 데이터 갱신
};

export const chunithmData = { //츄니즘 데이터
  rating: 16.78, //현재 레이팅
  playCount: 1234,  //플레이 카운트
  title: ["음격 MASTER", "신 오시", ""], //현재 장착중인 칭호, 칭호는 최대 3개 최소 1개
  courseResult : "infinity", //현재 코스 결과:휘장(코스 플레이를 한 경우에만 존재, None, I, II, III, IV, V, infinity 중 하나)
  allCourseClear: "V", //해당 난이도 올클리어(백그라운드 휘장)상태(해당 난이도의 코스를 모두 클리어 한 경우에만 존재, None, I, II, III, IV, V, infinity중 하나)
  avatarLevel: {
    chunithm : {name:'characterName', level : 50}, // 츄니즘은 설정 가능한 캐릭터가 1개
  },
  ratingHistory: [ //과거 갱신 기록에 따른 성장 그래프
    { name: "1월", rating: 16.21 },
    { name: "2월", rating: 16.35 },
    { name: "3월", rating: 16.42 },
    { name: "4월", rating: 16.58 },
    { name: "5월", rating: 16.65 },
    { name: "6월", rating: 16.78 }, //현재는 월별 성장 그래프로 되어있지만 일별 혹은 갱신중 성장별로 기록할 가능성이 큼
  ],
  recentPlays: [ //최근 플레이(츄니즘의 경우, 최근 50플레이를 가져올 수 있음)
    { song: "Last Celebration", score: 1009854, rank: "SSS", constant: 15.4, isNew: true }, //곡명/스코어/랭크/상수/최고기록갱신여부
    { song: "FREEDOM DiVE", score: 1008765, rank: "SSS", constant: 15.3, isNew: false },
    { song: "Grievous Lady", score: 1007543, rank: "SS+", constant: 15.4, isNew: true },
    { song: "World's End", score: 1005234, rank: "SS", constant: 15.2, isNew: false },
  ],
};

export const maimaiData = { //마이마이 데이터
  rating: 14892, // 현재 레이팅 정보
  playCount: 2345, //현재 플레이 카운트
  title: "우오오오오오", //현재 칭호 정보(마이마이는 칭호 최대 1개, 최소 1개)
  courseClear : "", //단위인정 관련 데이터(배경 지식 부족)
  avatarLevel : {
    maimai : [
      {name : 'charName1', level:10},
      {name : 'charName2', level:11},
      {name : 'charName3', level:12},
      {name : 'charName4', level:13},
      {name : 'charName5', level:14}, //마이마이는 설정 가능한 캐릭터가 5개(무조건 5개가 지정되어있음)
    ],
  },
  ratingHistory: [ //과거 갱신 기록에 따른 성장 그래프
    { name: "1월", rating: 14200 },
    { name: "2월", rating: 14350 },
    { name: "3월", rating: 14500 },
    { name: "4월", rating: 14670 },
    { name: "5월", rating: 14750 },
    { name: "6월", rating: 14892 },
  ],
  recentPlays: [ //최근 플레이(마이마이는 최근 50플레이를 가져올 수 있음)
    { song: "Oshama Scramble!", score: 100.9854, rank: "SSS+", type: "DX", isNew: true },//곡명/스코어/랭크/타입/최고기록갱신여부
    { song: "QZKago Requiem", score: 100.8765, rank: "SSS+", type: "DX", isNew: false },
    { song: "PANDORA PARADOXXX", score: 100.5543, rank: "SSS", type: "Re:MAS", isNew: true },
    { song: "Knight of Firmament", score: 100.2234, rank: "SS+", type: "MAS", isNew: false },
  ]
};
