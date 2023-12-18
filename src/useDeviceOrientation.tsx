import { useEffect, useState } from "react";

type TOrientation = "vertical" | "horizontal";

const useDeviceOrientation = () => {
  const [screenOrientation, setScreenOrientation] = useState<TOrientation>(
    screen.orientation.angle === 0 || screen.orientation.angle === 180
      ? "vertical"
      : "horizontal"
  );

  const handleOrientation = () => {
    if (
      (screen.orientation.angle === 0 || screen.orientation.angle === 180) &&
      window.innerHeight > window.innerWidth
    ) {
      setScreenOrientation("vertical");
    } else if (
      (screen.orientation.angle === 90 || screen.orientation.angle === 270) &&
      window.innerHeight < window.innerWidth
    ) {
      setScreenOrientation("horizontal");
    }
  };

  useEffect(() => {
    screen.orientation.addEventListener("change", handleOrientation);
    window.addEventListener("resize", handleOrientation);

    return () => {
      screen.orientation.removeEventListener("change", handleOrientation);
      window.removeEventListener("resize", handleOrientation);
    };
  }, []);

  return {
    screenOrientation,
  };
};

export default useDeviceOrientation;
