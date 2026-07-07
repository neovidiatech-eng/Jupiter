import { useState, useEffect } from "react";

export function useServerTime() {
  const [timeOffset, setTimeOffset] = useState<number>(0);

  useEffect(() => {
    const loadTime = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`https://worldtimeapi.org/api/timezone/${tz}`);
        const apiData = await res.json();
        const serverTime = new Date(apiData.datetime).getTime();
        const localTime = new Date().getTime();
        setTimeOffset(serverTime - localTime);
      } catch (error) {
        console.error("Failed to fetch time:", error);
      }
    };
    loadTime();
  }, []);

  return {
    timeOffset,
    getServerTime: () => new Date().getTime() + timeOffset,
    getServerDate: () => new Date(new Date().getTime() + timeOffset)
  };
}
