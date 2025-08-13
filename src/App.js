import React, { useState, useEffect } from 'react';
import './styles.css';

const POINT_SIZE = 50;
const BOARD_SIZE = 500;

const isColliding = (newPoint, existingPoints, minDistance) => {
  for (let i = 0; i < existingPoints.length; i++) {
    const existingPoint = existingPoints[i];
    const dx = newPoint.left - existingPoint.left;
    const dy = newPoint.top - existingPoint.top;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance) {
      return true;
    }
  }
  return false;
};

const getRandomPosition = (existingPoints) => {
  let newPosition;
  let isPositionValid = false;

  while (!isPositionValid) {
    const x = Math.random() * (BOARD_SIZE - POINT_SIZE);
    const y = Math.random() * (BOARD_SIZE - POINT_SIZE);
    newPosition = { left: x, top: y };
    isPositionValid = !isColliding(newPosition, existingPoints, POINT_SIZE + 10);
  }

  return { left: `${newPosition.left}px`, top: `${newPosition.top}px` };
};

const App = () => {
  const [points, setPoints] = useState(0);
  const [numPointsInput, setNumPointsInput] = useState(5); // State mới để lưu giá trị input
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextPoint, setNextPoint] = useState(1);
  const [allPoints, setAllPoints] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 0.1);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (autoPlay && isPlaying && allPoints.length > 0) {
      const activePoint = allPoints.find(p => p.number === nextPoint);
      if (activePoint) {
        const autoClickTimer = setTimeout(() => {
          handlePointClick(activePoint.number);
        }, 500);
        return () => clearTimeout(autoClickTimer);
      }
    }
  }, [autoPlay, isPlaying, nextPoint, allPoints]);

  useEffect(() => {
    if (allPoints.length === 0 && !isPlaying && !isGameOver && points > 0) {
      setIsGameWon(true);
    }
  }, [allPoints, isPlaying, isGameOver, points]);

  const initializeGame = () => {
    const numPoints = parseInt(numPointsInput);
    if (isNaN(numPoints) || numPoints < 2) {
      alert("Số point phải là số tự nhiên lớn hơn 1.");
      return;
    }

    const newPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const position = getRandomPosition(newPoints);
      newPoints.push({
        number: i + 1,
        ...position,
        isClicked: false,
        countdown: null,
      });
    }
    setAllPoints(newPoints);
    setPoints(0);
    setTime(0);
    setNextPoint(1);
    setIsPlaying(true);
    setIsGameWon(false);
    setIsGameOver(false);
  };

  const resetGame = () => {
    setPoints(0);
    setTime(0);
    setIsPlaying(false);
    setNextPoint(1);
    setAllPoints([]);
    setAutoPlay(false);
    setIsGameWon(false);
    setIsGameOver(false);
    setNumPointsInput(5); // Reset giá trị input về mặc định
  };

  const handlePointClick = (number) => {
    if (!isPlaying) {
      return;
    }

    if (number !== nextPoint) {
      setIsPlaying(false);
      setIsGameOver(true);
      return;
    }

    setPoints(prevPoints => prevPoints + 1);
    setNextPoint(prevNext => prevNext + 1);

    const countdownDuration = 3000;
    setAllPoints(prevPoints => prevPoints.map(p =>
      p.number === number ? { ...p, isClicked: true, countdown: countdownDuration } : p
    ));

    let countdownTimer = setInterval(() => {
      setAllPoints(prevPoints => {
        const updatedPoints = prevPoints.map(p => {
          if (p && p.number === number) {
            if (p.countdown > 10) {
              return { ...p, countdown: p.countdown - 10 };
            } else {
              clearInterval(countdownTimer);
              return null;
            }
          }
          return p;
        }).filter(Boolean);

        if (updatedPoints.length === 0) {
          setIsPlaying(false);
        }

        return updatedPoints;
      });
    }, 10);
  };

  return (
    <div className="game-container">
      <h2 className={isGameWon ? 'all-clear-title' : isGameOver ? 'game-over-title' : ''}>
        {isGameWon ? 'ALL CLEAR' : isGameOver ? 'GAME OVER' : 'LET\'S PLAY'}
      </h2>
      <div className="info">
        <label>
          Points:
          <input 
            type="number"
            value={numPointsInput}
            onChange={(e) => setNumPointsInput(e.target.value)}
            min="2"
            disabled={isPlaying || isGameWon || isGameOver}
          />
        </label>
        <p>Time: {time.toFixed(1)}s</p>
      </div>

      <div className="controls">
        {isPlaying ? (
          <>
            <button onClick={resetGame}>Restart</button>
            <button onClick={() => setAutoPlay(!autoPlay)}>
              Auto Play {autoPlay ? 'ON' : 'OFF'}
            </button>
          </>
        ) : (isGameWon || isGameOver) ? (
          <button onClick={resetGame}>Play Again</button>
        ) : (
          <button onClick={initializeGame}>Play</button>
        )}
      </div>

      <div className="game-board">
        {allPoints.map(p => (
          <div
            key={p.number}
            className={`point ${p.isClicked ? 'clicked' : ''}`}
            style={{ left: p.left, top: p.top }}
            onClick={() => handlePointClick(p.number)}
          >
            {p.number}
            {p.isClicked && <span className="countdown-text">{(p.countdown / 1000).toFixed(2)}</span>}
          </div>
        ))}
      </div>

      <p>Next: {nextPoint <= numPointsInput && !isGameWon && !isGameOver ? nextPoint : 'Finished'}</p>
    </div>
  );
};

export default App;