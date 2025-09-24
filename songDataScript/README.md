아래 명령어로 스크립트를 실행합니다.


node integrated_script.js


스크립트가 각 단계를 순서대로 진행하며 터미널에 진행 상황을 출력합니다.

만약 중간에 상수 수동 입력이 필요한 경우, 터미널에 안내 메시지가 나타나며 입력을 기다립니다.

모든 작업이 완료되면, 폴더 내에 results 라는 하위 폴더가 생성되고, 그 안에 최종 결과물인 chunithmSongData.json과 chunithm-category-data.json 파일이 저장됩니다.

오류 발생 및 재시작:

만약 API 키 오류나 네트워크 문제로 스크립트가 중간에 멈추더라도 걱정하지 마세요.

.env 파일을 수정하거나 문제를 해결한 뒤, 다시 node integrated_script.js를 실행하면 실패했던 단계부터 자동으로 이어서 진행됩니다.

특정 단계부터 시작하기 (옵션):

만약 1단계는 이미 성공했고 2단계부터 다시 시작하고 싶다면, 아래와 같이 옵션을 주어 실행할 수 있습니다.


# 2단계부터 시작

node integrated_script.js --start-from=2

# 3단계부터 시작

node integrated_script.js --start-from=3

.env 파일 설정 가이드
# .env

# CHUNIREC API Access Token
CHUNIREC_ACCESS_TOKEN="여기에_CHUNIREC_ACCESS_TOKEN_입력"
CHUNIREC_USER_NAME="여기에_CHUNIREC_USER_NAME_입력"

# Google Cloud Platform API Key
GOOGLE_API_KEY="여기에_GOOGLE_API_KEY_입력"

# Google Spreadsheet ID
GOOGLE_SHEET_ID="여기에_GOOGLE_SHEET_ID_입력"