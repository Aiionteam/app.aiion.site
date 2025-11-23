import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Interaction,
  Category,
  SpeechRecognition,
  DiaryView as DiaryViewType,
  AccountView as AccountViewType,
  CultureView as CultureViewType,
  HealthView as HealthViewType,
  PathfinderView as PathfinderViewType,
  Event,
  Task,
} from '../../components/types';
import { getLocalDateStr, extractCategories, parseJSONResponse } from '../../lib';

export const useHomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarMode, setAvatarMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category>('home');

  // 카테고리별 뷰 상태
  const [diaryView, setDiaryView] = useState<DiaryViewType>('home');
  const [accountView, setAccountView] = useState<AccountViewType>('home');
  const [cultureView, setCultureView] = useState<CultureViewType>('home');
  const [healthView, setHealthView] = useState<HealthViewType>('home');
  const [pathfinderView, setPathfinderView] = useState<PathfinderViewType>('home');

  // Calendar 관련 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'diary', label: 'Diary', icon: '📔' },
    { id: 'health', label: 'Health Care', icon: '🏥' },
    { id: 'culture', label: 'Culture', icon: '🎭' },
    { id: 'account', label: 'Account', icon: '💰' },
    { id: 'path', label: 'Path Finder', icon: '🗺️' },
  ];

  // 마이크 권한 확인
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setMicAvailable(true);
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      setMicAvailable(true);
    }
  }, []);

  // 음성 인식 초기화
  useEffect(() => {
    if (avatarMode && micAvailable) {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);

          setTimeout(() => {
            handleSubmit(transcript);
          }, 500);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (inputText.trim()) {
              handleSubmit(inputText);
            }
            setIsListening(false);
          }, 3000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [avatarMode, micAvailable]);

  // 아바타 모드에서 자동으로 음성 인식 시작
  useEffect(() => {
    if (avatarMode && micAvailable && recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            const currentText = inputText;
            if (currentText.trim()) {
              handleSubmit(currentText);
            } else {
              handleSubmit('');
            }
            setIsListening(false);
          }
        }, 3000);
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarMode]);

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = useCallback(() => {
    if (avatarMode) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsListening(false);
      setAvatarMode(false);
    } else {
      setAvatarMode(true);
    }
  }, [avatarMode]);

  const handleSubmit = useCallback(async (text?: string) => {
    const submitText = text || inputText;
    if (!submitText.trim() && !text) {
      return;
    }

    setLoading(true);
    setInputText('');

    const today = new Date();
    const dateStr = getLocalDateStr(today);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayNames[today.getDay()];

    const categories = extractCategories(submitText);

    // 축구 관련 키워드 감지 (더 많은 키워드 추가)
    const soccerKeywords = [
      '축구', '선수', '팀', '경기', '일정', '경기장', '스타디움', '스타디엄',
      '손흥민', '이강인', '황희찬', '김민재', '조규성', '황의조', '김민성', '김규호',
      'K리그', 'K리그1', 'K리그2', '프리미어리그', '프리미어', 'EPL', 'k리그',
      '챔피언스리그', 'UEFA', '월드컵', '아시안컵',
      '토트넘', '맨유', '맨체스터', '리버풀', '첼시', '아스널', '맨시티',
      '레알마드리드', '바르셀로나', '바이에른', '도르트문트',
      '서울', '수원', '전북', '포항', '울산', '인천', '부산', '대구', '광주',
      '축구선수', '축구팀', '축구경기', '축구일정'
    ];
    
    const submitTextLower = submitText.toLowerCase();
    const hasSoccerKeyword = soccerKeywords.some(keyword => 
      submitTextLower.includes(keyword.toLowerCase())
    );
    
    console.log('[useHomePage] 🔍 키워드 감지 체크:', {
      입력텍스트: submitText,
      소문자변환: submitTextLower,
      감지됨: hasSoccerKeyword
    });

    let aiResponse = categories.length > 0
      ? '호현님의 입력을 각 카테고리에 맞게 파싱 및 저장했습니다.'
      : '입력을 저장했습니다.';

    // 축구 관련 검색어가 있으면 soccer-service API 호출
    if (hasSoccerKeyword) {
      try {
        console.log('[useHomePage] ⚽ 축구 관련 검색어 감지:', submitText);
        
        // Gateway를 통한 API 호출
        const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 
                          process.env.NEXT_PUBLIC_API_BASE_URL || 
                          'http://localhost:8080';
        
        // 검색어 추출 (축구 관련 키워드만 추출)
        let searchKeyword = submitText;
        // 검색어에서 축구 관련 키워드 추출
        const foundKeyword = soccerKeywords.find(keyword => 
          submitText.toLowerCase().includes(keyword.toLowerCase())
        );
        if (foundKeyword) {
          // 키워드 주변 텍스트 추출 (예: "손흥민 정보" -> "손흥민")
          const keywordIndex = submitText.toLowerCase().indexOf(foundKeyword.toLowerCase());
          if (keywordIndex >= 0) {
            // 키워드 앞뒤로 최대 10자 추출
            const start = Math.max(0, keywordIndex - 10);
            const end = Math.min(submitText.length, keywordIndex + foundKeyword.length + 10);
            searchKeyword = submitText.substring(start, end).trim();
          }
        }
        
        // Gateway discovery locator를 통한 경로 사용
        // /soccer-service/soccer/findByWord 또는 /soccer/findByWord
        const apiUrl = `${gatewayUrl}/soccer-service/soccer/findByWord?keyword=${encodeURIComponent(searchKeyword)}`;
        console.log('[useHomePage] 🔗 API 호출 URL:', apiUrl);
        console.log('[useHomePage] 🔍 검색 키워드:', searchKeyword);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        console.log('[useHomePage] 📡 API 응답 상태:', response.status, response.statusText);

        if (response.ok) {
          // 최적화된 JSON 파싱 사용
          const { data: result, error: parseError } = await parseJSONResponse(response);
          
          if (parseError) {
            console.error('[useHomePage] ❌ JSON 파싱 오류:', parseError);
            aiResponse = `데이터를 처리하는 중 오류가 발생했습니다: ${parseError}`;
            setLoading(false);
            return;
          }
          
          console.log('[useHomePage] ✅ API 응답 데이터:', result);

          // Code 또는 code 모두 체크 (대소문자 구분 없이)
          const responseCode = result.Code || result.code || 200;
          console.log('[useHomePage] 📊 응답 코드:', responseCode);

          if (responseCode === 200 && result.data) {
            const data = result.data;
            const totalCount = data.totalCount || 0;
            const results = data.results || {};

            // AI 응답 생성
            let detailedResponse = `🔍 축구 검색 결과 (총 ${totalCount}개)\n\n`;

            if (results.players && results.players.length > 0) {
              detailedResponse += `⚽ 선수 정보 (${results.players.length}개):\n`;
              results.players.slice(0, 3).forEach((player: any, index: number) => {
                detailedResponse += `${index + 1}. ${player.player_name || '알 수 없음'}`;
                if (player.team_name) detailedResponse += ` (${player.team_name})`;
                if (player.position) detailedResponse += ` - ${player.position}`;
                detailedResponse += '\n';
              });
              if (results.players.length > 3) {
                detailedResponse += `   ... 외 ${results.players.length - 3}명\n`;
              }
              detailedResponse += '\n';
            }

            if (results.teams && results.teams.length > 0) {
              detailedResponse += `🏆 팀 정보 (${results.teams.length}개):\n`;
              results.teams.slice(0, 3).forEach((team: any, index: number) => {
                detailedResponse += `${index + 1}. ${team.team_name || '알 수 없음'}`;
                if (team.city) detailedResponse += ` (${team.city})`;
                detailedResponse += '\n';
              });
              if (results.teams.length > 3) {
                detailedResponse += `   ... 외 ${results.teams.length - 3}개 팀\n`;
              }
              detailedResponse += '\n';
            }

            if (results.stadiums && results.stadiums.length > 0) {
              detailedResponse += `🏟️ 경기장 정보 (${results.stadiums.length}개):\n`;
              results.stadiums.slice(0, 3).forEach((stadium: any, index: number) => {
                detailedResponse += `${index + 1}. ${stadium.stadium_name || '알 수 없음'}`;
                if (stadium.city) detailedResponse += ` (${stadium.city})`;
                detailedResponse += '\n';
              });
              if (results.stadiums.length > 3) {
                detailedResponse += `   ... 외 ${results.stadiums.length - 3}개 경기장\n`;
              }
              detailedResponse += '\n';
            }

            if (results.schedules && results.schedules.length > 0) {
              detailedResponse += `📅 일정 정보 (${results.schedules.length}개):\n`;
              results.schedules.slice(0, 3).forEach((schedule: any, index: number) => {
                detailedResponse += `${index + 1}. ${schedule.home_team || '알 수 없음'} vs ${schedule.away_team || '알 수 없음'}`;
                if (schedule.match_date) detailedResponse += ` (${schedule.match_date})`;
                detailedResponse += '\n';
              });
              if (results.schedules.length > 3) {
                detailedResponse += `   ... 외 ${results.schedules.length - 3}개 일정\n`;
              }
            }

            if (totalCount === 0) {
              detailedResponse = result.message || '검색 결과가 없습니다.';
            }

            aiResponse = detailedResponse;
          } else {
            console.warn('[useHomePage] ⚠️ API 응답 코드가 200이 아니거나 데이터가 없음:', result);
            const responseCode = result.Code || result.code || '알 수 없음';
            aiResponse = result.message || `축구 정보를 가져오는데 실패했습니다. (코드: ${responseCode})`;
            
            // 데이터가 없어도 메시지는 표시
            if (result.message) {
              aiResponse = result.message;
            }
          }
        } else {
          const errorText = await response.text();
          console.error('[useHomePage] ❌ API 호출 실패:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          aiResponse = `축구 정보를 가져오는데 실패했습니다. (상태: ${response.status})`;
        }
      } catch (error) {
        console.error('[useHomePage] ❌ API 호출 중 오류:', error);
        if (error instanceof Error) {
          console.error('[useHomePage] 오류 상세:', error.message, error.stack);
        }
        aiResponse = `축구 정보를 조회하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      }
    } else {
      console.log('[useHomePage] ℹ️ 축구 관련 키워드가 감지되지 않음:', submitText);
      console.log('[useHomePage] 🔍 입력 텍스트:', submitText);
      console.log('[useHomePage] 🔍 키워드 목록:', soccerKeywords);
    }

    const newInteraction: Interaction = {
      id: Date.now().toString(),
      date: dateStr,
      dayOfWeek: dayOfWeek,
      userInput: submitText,
      categories: categories.length > 0 ? categories : ['일기'],
      aiResponse: aiResponse,
    };

    setInteractions(prev => [...prev, newInteraction]);
    setLoading(false);

    if (avatarMode) {
      speakResponse(newInteraction.aiResponse);
    }
  }, [inputText, avatarMode, interactions]);

  // 카테고리 변경 시 뷰 리셋
  useEffect(() => {
    setDiaryView('home');
    setAccountView('home');
    setCultureView('home');
    setHealthView('home');
    setPathfinderView('home');
  }, [currentCategory]);

  return {
    // State
    sidebarOpen,
    setSidebarOpen,
    darkMode,
    setDarkMode,
    inputText,
    setInputText,
    loading,
    avatarMode,
    isListening,
    micAvailable,
    interactions,
    currentCategory,
    setCurrentCategory,
    menuItems,

    // 카테고리별 뷰 상태
    diaryView,
    setDiaryView,
    accountView,
    setAccountView,
    cultureView,
    setCultureView,
    healthView,
    setHealthView,
    pathfinderView,
    setPathfinderView,

    // Calendar 상태
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    events,
    setEvents,
    todayTasks,
    setTodayTasks,

    // Handlers
    handleMicClick,
    handleSubmit,
  };
};

