import * as React from "react"
import { MOBILE_BREAKPOINT } from "@/lib/constants";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // 초기값 설정
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // 이벤트 리스너 추가
    mql.addEventListener("change", onChange)
    
    // 클린업 함수
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
